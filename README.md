# 🌊 Polkaflow - Visual Blockchain Workflow Builder

[![PolkaVM](https://img.shields.io/badge/PolkaVM-Enabled-green)](https://polkadot.network)
[![AssetHub](https://img.shields.io/badge/AssetHub-Integrated-blue)](https://polkadot.network)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.25-blue)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple)](https://openai.com)

![image](https://github.com/user-attachments/assets/915e74ed-969d-4d3c-86fa-c2fe732583d6)

**Polkaflow** is a visual blockchain workflow builder that empowers users to design, generate, and deploy smart contracts for the Polkadot ecosystem with ease. By leveraging PolkaVM, AssetHub, and both AI-driven and manual logic code generation, Polkaflow makes blockchain development accessible for everyone—from no-code users to advanced developers.

## 🚀 What Does Polkaflow Do?

**Visual Workflow Design**: Build complex blockchain workflows for DeFi, DAOs, cross-chain bridges, and more using an intuitive drag-and-drop interface.

**Flexible Flowchart Creation**: Choose from three ways to create your workflow:

- **AI Prompt**: Describe your process in natural language and let AI generate the flowchart for you.
- **Manual Builder**: Construct your workflow step-by-step by adding and connecting nodes.
- **Templates**: Start quickly with ready-made templates and customize as needed.

**Smart Contract Generation**: Convert your visual workflow into optimized Solidity contracts, ready for deployment on PolkaVM and AssetHub.

**AssetHub Integration**: Directly manage assets, proposals, and governance within your workflows.

## ✨ Key Features

### Three Ways to Build Workflows:

- **AI Flowchart Generation**: Enter a prompt and instantly create a visual workflow using AI.
- **Manual Node Editing**: Drag, drop, and connect nodes to build your logic visually.
- **Workflow Templates**: Use and customize pre-built templates for common blockchain scenarios.

### Two Code Generation Options:

- **AI-Powered Code Generation**: Let AI produce Solidity code from your workflow or prompt.
- **Custom Logic Engine**: Use our hand-crafted logic engine to generate contracts from your designed flowchart—giving you more control and transparency.

### Additional Features:

- **PolkaVM Optimized**: Supports larger contracts (up to 100KB), faster compilation, and native Solidity execution.
- **AssetHub Native**: Create, manage, freeze/unfreeze, and track assets directly from your workflow.
- **One-Click Deployment**: Instantly deploy generated contracts to AssetHub via PolkaVM.

## 🧑‍💻 Prerequisites

To compile and deploy contracts using Polkaflow, you must have the following compilers installed locally:

### solc (Solidity compiler)
Required for compiling standard Solidity contracts.

### resolc (PolkaVM Solidity compiler)
Required for compiling contracts specifically for PolkaVM.

Download and install `resolc`, `solc` from the official PolkaVM resources or releases.

**Important**: Make sure both `solc` and `resolc` are available in your system's PATH so Polkaflow can invoke them for contract compilation.

## 🛠️ Technical Architecture

### Frontend:
- React 18
- React Flow for visual editing
- Tailwind CSS for styling

### Backend:
- Express.js
- PolkaVM compiler (resolc.exe) integration
- AssetHub RPC for blockchain interaction
- OpenAI for AI-powered features

### Blockchain Layer:
- Deploys contracts to PolkaVM
- Manages assets on AssetHub
- Cross-chain capabilities via Polkadot

## 🏗️ Project Structure

```
polkaflow/
├── frontend/           # Visual workflow builder and UI
├── backend/           # API, AI integration, PolkaVM interface
│   └── xcm-compiler/  # XCM compilation tools
└── docs/              # Documentation
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-username/polkaflow
cd polkaflow

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install XCM compiler dependencies
cd xcm-compiler
npm install
cd ..
```

### 2. Set up Environment Variables
Add your OpenAI API key and other configuration as needed.

### 3. Ensure Local Compilers
`solc` and `resolc` must be available in your PATH for contract compilation.

### 4. Run the Servers

**Start the backend server:**
```bash
cd backend
node server.js
```

**Start the frontend development server:**
```bash
cd frontend
npm run dev
```

The frontend will typically be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

### 5. Get Started
Use the dashboard to create, build, and deploy your first workflow.

## 💡 Innovation Highlights

- **First visual builder** for PolkaVM and AssetHub workflows
- **AI-driven and manual logic options** for both flowchart creation and code generation
- **Zero external dependencies** for generated contracts
- **Designed for both developers and non-developers** to rapidly prototype and deploy blockchain applications

##App Screens -

![image](https://github.com/user-attachments/assets/f26ecdaf-ed50-4985-bcd4-4905a3e47649)

![image](https://github.com/user-attachments/assets/3db0f086-6d3a-48e9-9c56-cce65ae4b99c)

![image](https://github.com/user-attachments/assets/4bb533c3-be6c-4986-adfe-9c8970de906e)

![image](https://github.com/user-attachments/assets/33b52905-70da-4e3f-ae79-a2a65f41aa45)

![image](https://github.com/user-attachments/assets/54b65473-c0bd-4977-b12d-cade37f50d05)

![image](https://github.com/user-attachments/assets/54b6289d-c894-4ccf-bd95-3babb44d7b62)

![image](https://github.com/user-attachments/assets/c341d44b-244b-4cc3-bbe6-6b2039bbc2ca)

![image](https://github.com/user-attachments/assets/ddf53513-b1e8-4172-9db9-47977095994a)

![image](https://github.com/user-attachments/assets/82a203ed-eee9-4fed-86cc-fb5d70b65615)



