import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Modal styles for 80% size, blur, and centered positioning
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(6px)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  position: "relative",
  width: "80vw",
  height: "80vh",
  background: "#1a1a1a",
  color: "#fafafa",
  borderRadius: "16px",
  boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  padding: "32px 24px 24px 24px",
  overflow: "auto",
};

const closeButtonStyle = {
  position: "absolute",
  top: "16px",
  right: "20px",
  background: "transparent",
  border: "none",
  fontSize: "2rem",
  color: "#fafafa",
  cursor: "pointer",
  zIndex: 10,
};

const stripCodeFences = (markdown) => {
  return markdown.replace(/^```[a-zA-Z]*\n|```$/gm, '');
};

const codeBlockStyle = {
  flex: 1,
  width: "100%",
  background: "#222",
  color: "#00e676",
  borderRadius: "8px",
  padding: "24px",
  overflow: "auto",
  fontFamily: "Fira Mono, Menlo, Monaco, Consolas, monospace",
  fontSize: "1rem",
  marginTop: "24px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

export default function GeneratedCodeModal({ open, code, onClose }) {
  if (!open) return null;

  const cleanCode = stripCodeFences(code || "");
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={e => e.stopPropagation()}
      >
        <button style={closeButtonStyle} onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Generated Code</h2>
        <div style={{ flex: 1, overflow: "auto", marginTop: "24px" }}>
          <SyntaxHighlighter
            language="solidity"
            style={vscDarkPlus}
            customStyle={{
              background: "#222",
              borderRadius: "8px",
              padding: "24px",
              fontSize: "1rem",
              minHeight: "100%",
            }}
            showLineNumbers
          >
            {cleanCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}