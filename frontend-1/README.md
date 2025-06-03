# Project Title

## Overview
This project is a visual workflow builder that allows users to create and manage nodes and connections in a flow-based interface. It utilizes React and the React Flow library to provide an interactive experience for users to design their workflows.

## Features
- **Node Management**: Users can add, edit, and remove nodes from the board.
- **Dynamic Connections**: Nodes can be connected to each other, allowing for complex workflows.
- **Custom Node Types**: Different types of nodes can be created with specific properties and behaviors.
- **Search and Filter**: Users can search for nodes and filter them by categories and subcategories.
- **Properties Menu**: A dedicated area to view and edit properties of selected nodes.

## Project Structure
```
frontend
├── src
│   ├── pages
│   │   └── Playground
│   │       ├── components
│   │       │   ├── Board
│   │       │   │   ├── FlowBoard.jsx
│   │       │   ├── LayoutComponents
│   │       │   │   ├── NodesSheet.jsx
│   │       │   │   ├── PropertiesMenu.jsx
│   │       │   ├── Node
│   │       │   │   ├── CustomNode.jsx
│   │       │   │   ├── NodeTypes.js
│   │       ├── store
│   │       │   ├── boardStore.js
│   │       │   └── index.js
├── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd frontend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Components
- **FlowBoard**: The main component that sets up the React Flow environment and manages nodes and edges.
- **EnhancedNodesSheet**: Displays a list of nodes with filtering and searching capabilities.
- **NodePalette**: Shows properties related to the selected node on the board.
- **CustomNode**: Defines the appearance and behavior of individual nodes.

## State Management
The application uses a centralized state management system to handle the current data, manage connections, and enable editing of node properties. The state is managed in `boardStore.js`, which provides functions to interact with the nodes and edges.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.