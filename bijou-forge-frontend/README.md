# bijou-forge-frontend

Install dependencies:

- npm install
Note: This project uses Tailwind CSS which is included in the dependencies in package.json. You don't need to install it separately as it will be installed when running npm install.

Run the development server:
- npm start
This will start the application on http://localhost:3000.

Key Components

Home.jsx - Main page layout that combines all other components
ImprovedModelViewer.jsx - Advanced 3D model viewer with interactive controls
GenerationPanel.jsx - Interface for generating models via text or image
HistorySidebar.jsx - Displays history of generated models with filtering
AuthModal.jsx - User authentication modal
Header.jsx - Application header with navigation and theme controls
FileUpload.jsx - Component for handling image uploads

Dependencies
The project uses several key libraries:
Core Dependencies

React and React DOM
Three.js - The 3D rendering engine
@react-three/fiber - React renderer for Three.js
@react-three/drei - Useful helpers for react-three-fiber
tailwindcss - Utility-first CSS framework
lucide-react - Icon library

3D-Related Dependencies

three-stdlib - Standard library for Three.js (includes STLExporter)
maath - Math utilities for 3D calculations
