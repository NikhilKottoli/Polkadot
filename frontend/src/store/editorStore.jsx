// store/editorStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useEditorStore = create(
  devtools(
    (set, get) => ({
      files: [],
      activeFileId: null,
      dynamicFiles: [], // Files from contract generation
      contractData: null, // Store contract generation data
      gasComparison: null, // Store gas comparison data
      deployedContracts: {}, // Store deployed contract addresses
      fileTree: {
        // Your existing initialItems structure
      },

      openFile: (file) => {
        const existingFile = get().files.find((f) => f.id === file.id);
        if (existingFile) {
          set({ activeFileId: file.id });
          return;
        }

        set((state) => ({
          files: [
            ...state.files.map((f) => ({ ...f, isActive: false })),
            { ...file, isDirty: false, isActive: true },
          ],
          activeFileId: file.id,
        }));
      },

      closeFile: (fileId) => {
        set((state) => {
          const newFiles = state.files.filter((f) => f.id !== fileId);
          const newActiveFileId =
            state.activeFileId === fileId
              ? newFiles.length > 0
                ? newFiles[newFiles.length - 1].id
                : null
              : state.activeFileId;

          return {
            files: newFiles.map((f) => ({
              ...f,
              isActive: f.id === newActiveFileId,
            })),
            activeFileId: newActiveFileId,
          };
        });
      },

      setActiveFile: (fileId) => {
        set((state) => ({
          files: state.files.map((f) => ({
            ...f,
            isActive: f.id === fileId,
          })),
          activeFileId: fileId,
        }));
      },

      updateFileContent: (fileId, content) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, content, isDirty: true } : f
          ),
        }));
      },

      saveFile: (fileId) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, isDirty: false } : f
          ),
        }));
      },

      saveAllFiles: () => {
        set((state) => ({
          files: state.files.map((f) => ({ ...f, isDirty: false })),
        }));
      },

      getActiveFile: () => {
        const state = get();
        return state.files.find((f) => f.id === state.activeFileId) || null;
      },

      // New file/folder operations
      createFile: (parentPath, fileName, fileExtension = "txt") => {
        set((state) => {
          const newFileId = `${parentPath}/${fileName}`;
          const newFile = {
            name: fileName,
            fileExtension,
          };

          const updatedTree = { ...state.fileTree };
          updatedTree[newFileId] = newFile;

          // Add to parent's children
          if (updatedTree[parentPath]) {
            updatedTree[parentPath] = {
              ...updatedTree[parentPath],
              children: [
                ...(updatedTree[parentPath].children || []),
                newFileId,
              ],
            };
          }

          return { fileTree: updatedTree };
        });
      },

      createFolder: (parentPath, folderName) => {
        set((state) => {
          const newFolderId = `${parentPath}/${folderName}`;
          const newFolder = {
            name: folderName,
            children: [],
          };

          const updatedTree = { ...state.fileTree };
          updatedTree[newFolderId] = newFolder;

          // Add to parent's children
          if (updatedTree[parentPath]) {
            updatedTree[parentPath] = {
              ...updatedTree[parentPath],
              children: [
                ...(updatedTree[parentPath].children || []),
                newFolderId,
              ],
            };
          }

          return { fileTree: updatedTree };
        });
      },

      deleteItem: (itemPath) => {
        set((state) => {
          const updatedTree = { ...state.fileTree };
          const item = updatedTree[itemPath];

          // Remove from tree
          delete updatedTree[itemPath];

          // Remove from parent's children
          Object.keys(updatedTree).forEach((key) => {
            if (updatedTree[key].children) {
              updatedTree[key].children = updatedTree[key].children.filter(
                (child) => child !== itemPath
              );
            }
          });

          // Close file if it's open
          const updatedFiles = state.files.filter((f) => f.id !== itemPath);
          const newActiveFileId =
            state.activeFileId === itemPath
              ? updatedFiles.length > 0
                ? updatedFiles[updatedFiles.length - 1].id
                : null
              : state.activeFileId;

          return {
            fileTree: updatedTree,
            files: updatedFiles.map((f) => ({
              ...f,
              isActive: f.id === newActiveFileId,
            })),
            activeFileId: newActiveFileId,
          };
        });
      },

      copyItem: (sourcePath, targetPath, newName) => {
        set((state) => {
          const updatedTree = { ...state.fileTree };
          const sourceItem = updatedTree[sourcePath];
          const newItemPath = `${targetPath}/${newName}`;

          // Copy the item
          updatedTree[newItemPath] = {
            ...sourceItem,
            name: newName,
          };

          // Add to target parent's children
          if (updatedTree[targetPath]) {
            updatedTree[targetPath] = {
              ...updatedTree[targetPath],
              children: [
                ...(updatedTree[targetPath].children || []),
                newItemPath,
              ],
            };
          }

          return { fileTree: updatedTree };
        });
      },

      renameItem: (itemPath, newName) => {
        set((state) => {
          const updatedTree = { ...state.fileTree };
          const item = updatedTree[itemPath];

          if (item) {
            updatedTree[itemPath] = {
              ...item,
              name: newName,
            };
          }

          return { fileTree: updatedTree };
        });
      },

      // Dynamic contract file management
      loadContractFiles: (contractData) => {
        set((state) => ({
          contractData,
          dynamicFiles: contractData.files || [],
          files: contractData.files || [],
          activeFileId: contractData.files?.[0]?.id || null,
        }));
      },

      setDeployedContract: (fileId, contractAddress, txHash) => {
        set((state) => ({
          deployedContracts: {
            ...state.deployedContracts,
            [fileId]: { address: contractAddress, txHash }
          }
        }));
      },

      updateContractWithAddress: (solidityFileId, rustFileId, rustContractAddress) => {
        set((state) => {
          const updatedFiles = state.files.map(file => {
            if (file.id === solidityFileId) {
              // Update Solidity contract to use the deployed Rust contract address
              const updatedContent = file.content.replace(
                /address\s+constant\s+RUST_CONTRACT\s*=\s*address\(0x[a-fA-F0-9]*\);/,
                `address constant RUST_CONTRACT = ${rustContractAddress};`
              );
              return { ...file, content: updatedContent, isDirty: true };
            }
            return file;
          });

          return { files: updatedFiles };
        });
      },

      setGasComparison: (gasData) => {
        set({ gasComparison: gasData });
      },

      clearDynamicFiles: () => {
        set({
          dynamicFiles: [],
          contractData: null,
          gasComparison: null,
          deployedContracts: {},
          files: [],
          activeFileId: null
        });
      },
    }),
    { name: "editor-store" }
  )
);
