// components/MonacoEditor.jsx
import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import { useEditorStore } from "@/store/editorStore";

// Web3 language configurations
const configureWeb3Languages = () => {
  // Solidity language configuration
  monaco.languages.register({ id: "solidity" });
  monaco.languages.setMonarchTokensProvider("solidity", {
    tokenizer: {
      root: [
        [/pragma\s+solidity/, "keyword"],
        [/contract|interface|library|abstract/, "keyword"],
        [/function|modifier|constructor|fallback|receive/, "keyword"],
        [/public|private|internal|external|pure|view|payable/, "keyword"],
        [/uint256|uint|int|bool|address|string|bytes/, "type"],
        [/mapping|struct|enum|event/, "keyword"],
        [/require|assert|revert/, "keyword"],
        [/msg\.sender|msg\.value|block\.timestamp/, "variable.predefined"],
        [/0x[a-fA-F0-9]+/, "number.hex"],
        [/\d+/, "number"],
        [/".*?"/, "string"],
        [/\/\/.*$/, "comment"],
        [/\/\*[\s\S]*?\*\//, "comment"],
      ],
    },
  });
};

// Web3 code completion provider
const createWeb3CompletionProvider = () => {
  const solidityCompletions = [
    {
      label: "pragma solidity",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "pragma solidity ^0.8.0;",
    },
    {
      label: "contract",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "contract ${1:ContractName} {\n\t$0\n}",
    },
    {
      label: "function",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText:
        "function ${1:functionName}(${2:params}) ${3:public} ${4:returns (${5:returnType})} {\n\t$0\n}",
    },
    {
      label: "modifier",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText:
        'modifier ${1:modifierName}(${2:params}) {\n\t${3:require(condition, "message");}\n\t_;\n}',
    },
    {
      label: "event",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "event ${1:EventName}(${2:params});",
    },
    {
      label: "mapping",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText:
        "mapping(${1:keyType} => ${2:valueType}) ${3:public} ${4:mappingName};",
    },
    {
      label: "require",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'require(${1:condition}, "${2:error message}");',
    },
    {
      label: "msg.sender",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "msg.sender",
    },
    {
      label: "msg.value",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "msg.value",
    },
    {
      label: "block.timestamp",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "block.timestamp",
    },
  ];

  monaco.languages.registerCompletionItemProvider("solidity", {
    provideCompletionItems: () => ({ suggestions: solidityCompletions }),
  });

  monaco.languages.registerCompletionItemProvider("javascript", {
    provideCompletionItems: () => ({
      suggestions: [
        {
          label: "ethers.Contract",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText:
            "new ethers.Contract(${1:address}, ${2:abi}, ${3:provider})",
        },
        {
          label: "web3.eth.Contract",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "new web3.eth.Contract(${1:abi}, ${2:address})",
        },
        {
          label: "useContract",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "const contract = useContract(${1:address}, ${2:abi});",
        },
        {
          label: "useAccount",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "const { address, isConnected } = useAccount();",
        },
        {
          label: "useBalance",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText:
            "const { data: balance } = useBalance({ address: ${1:address} });",
        },
      ],
    }),
  });
};

function getLanguageFromExtension(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "sol":
      return "solidity";
    case "vy":
      return "python"; // Use Python syntax highlighting for Vyper files
    case "ts":
      return "typescript";
    case "js":
      return "javascript";
    case "tsx":
      return "typescript";
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "rs":
      return "rust";
    case "toml":
      return "toml";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
}

export const MonacoEditor = ({ className = "" }) => {
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const { getActiveFile, updateFileContent } = useEditorStore();

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      try {
        // Configure Web3 languages (only Solidity)
        configureWeb3Languages();
        createWeb3CompletionProvider();

        // Define custom theme with background color
        monaco.editor.defineTheme("my-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#0f0f0f", // Custom background color
          },
        });

        // Create editor with explicit height
        monacoEditorRef.current = monaco.editor.create(editorRef.current, {
          value:
            "// Welcome to the Web3 Code Editor\n// Click on files in the sidebar to start coding",
          language: "javascript",
          theme: "my-dark",
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          folding: true,
          bracketMatching: "always",
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          hover: { enabled: true },
          scrollBeyondLastLine: false,
          renderWhitespace: "selection",
          renderControlCharacters: true,
        });

        // Handle content changes
        monacoEditorRef.current.onDidChangeModelContent(() => {
          const activeFile = getActiveFile();
          if (activeFile && monacoEditorRef.current) {
            const content = monacoEditorRef.current.getValue();
            updateFileContent(activeFile.id, content);
          }
        });

        console.log("Monaco Editor initialized successfully");
      } catch (error) {
        console.error("Error initializing Monaco Editor:", error);
      }

      return () => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.dispose();
          monacoEditorRef.current = null;
        }
      };
    }
  }, []);

  // Update editor when active file changes
  useEffect(() => {
    const activeFile = getActiveFile();
    if (monacoEditorRef.current && activeFile) {
      try {
        // Dispose of the old model
        const oldModel = monacoEditorRef.current.getModel();
        if (oldModel) {
          oldModel.dispose();
        }

        // Create new model
        const model = monaco.editor.createModel(
          activeFile.content,
          getLanguageFromExtension(activeFile.name),
          monaco.Uri.file(activeFile.path)
        );

        monacoEditorRef.current.setModel(model);
        monacoEditorRef.current.focus();
      } catch (error) {
        console.error("Error setting editor model:", error);
      }
    }
  }, [getActiveFile()?.id]);

  return (
    <div
      ref={editorRef}
      className={`h-full w-full pt-8  ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
};
