import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  PresentationControls,
  ContactShadows,
  Html,
  useProgress,
  Stage
} from '@react-three/drei';
import { Camera, ChevronLeft, ChevronRight, Download, Save, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// Loading indicator component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-white font-semibold">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// Model component with enhanced materials and interaction
// Model component with enhanced materials and interaction
function Model({ url }) {
  const modelRef = useRef();

  // Prevent trying to load non-GLTF files like images
  if (!url || url.endsWith('.png') || url.endsWith('.jpg') || url.includes('cdn.hive.ai')) {
    console.warn('Skipped loading model — URL appears to be an image:', url);
    return null;
  }

  const { scene } = useGLTF(url);

    
    // Add material enhancements for jewelry
    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Enhance materials for jewelry rendering
          child.material = child.material.clone();
          child.material.envMapIntensity = 1.2;
          child.material.needsUpdate = true;
          
          // Add metallic appearance for jewelry
          if (child.name.includes('metal') || child.name.includes('gold')) {
            child.material.metalness = 0.9;
            child.material.roughness = 0.3;
          }
          
          // Enhance gemstone appearance
          if (child.name.includes('gem') || child.name.includes('stone')) {
            child.material.metalness = 0.1;
            child.material.roughness = 0.1;
            child.material.clearcoat = 1;
            child.material.clearcoatRoughness = 0.1;
          }
        }
      });
    }, [scene]);
  
    // Slow rotation animation
    useFrame((state) => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
    });
  
    return <primitive ref={modelRef} object={scene} scale={1.5} />;
  }

// Main viewer component
export default function EnhancedModelViewer({ model }) {
  const [cameraPosition, setCameraPosition] = useState([0, 0, 4]);
  const [viewMode, setViewMode] = useState('orbit'); // 'orbit' or 'presentation'
  const controlsRef = useRef();
  
  // Function to handle rotation changes
  const handleRotateView = (direction) => {
    if (controlsRef.current) {
      const currentRotation = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.setAzimuthalAngle(currentRotation + direction * Math.PI / 4);
    }
  };
  
  // Function to handle zoom changes
  const handleZoom = (zoomIn) => {
    const zoomStep = 0.5;
    setCameraPosition(current => [
      current[0],
      current[1],
      zoomIn ? Math.max(2, current[2] - zoomStep) : current[2] + zoomStep
    ]);
  };
  
  // Generate a simple placeholder if no model is available
  const DemoJewelryModel = () => (
    <mesh>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <meshStandardMaterial color="goldenrod" metalness={0.8} roughness={0.2} />
    </mesh>
  );
  
  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {model ? 'Your 3D Jewelry Design' : 'Interactive 3D Preview'}
        </h2>
        
        {/* View mode toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button 
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'orbit' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
            onClick={() => setViewMode('orbit')}
          >
            3D View
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'presentation' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
            onClick={() => setViewMode('presentation')}
          >
            Showcase
          </button>
        </div>
      </div>
      
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
        {/* 3D Canvas */}
        <Canvas 
          camera={{ position: cameraPosition, fov: 45 }}
          dpr={[1, 2]}
          shadows
        >
          <color attach="background" args={["#0a0a0a"]} />
          
          {/* Different lighting and controls based on view mode */}
          {viewMode === 'orbit' ? (
            <>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} color="blue" intensity={0.5} />
              
              <Suspense fallback={<Loader />}>
                {model ? <Model url={model.modelUrl} /> : <DemoJewelryModel />}
                <Environment preset="city" />
                <ContactShadows
                  position={[0, -1.5, 0]}
                  opacity={0.4}
                  scale={10}
                  blur={2}
                  far={4}
                />
              </Suspense>
              
              <OrbitControls 
                ref={controlsRef}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
                enableZoom={true}
                enablePan={true}
              />
            </>
          ) : (
            <>
              <Suspense fallback={<Loader />}>
                <PresentationControls
                  global
                  rotation={[0, 0, 0]}
                  polar={[-Math.PI / 4, Math.PI / 4]}
                  azimuth={[-Math.PI / 4, Math.PI / 4]}
                  config={{ mass: 2, tension: 500 }}
                  snap={{ mass: 4, tension: 300 }}
                >
                  <Stage environment="city" contactShadow shadows adjustCamera intensity={1}>
                    {model ? <Model url={model.modelUrl} /> : <DemoJewelryModel />}
                  </Stage>
                </PresentationControls>
              </Suspense>
            </>
          )}
        </Canvas>
        
        {/* 3D Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-800 bg-opacity-70 rounded-full p-2">
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white"
            onClick={() => handleRotateView(-1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white"
            onClick={() => handleZoom(true)}
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white"
            onClick={() => handleZoom(false)}
          >
            <ZoomOut size={16} />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white"
            onClick={() => handleRotateView(1)}
          >
            <ChevronRight size={16} />
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white"
            onClick={() => controlsRef.current?.reset()}
          >
            <RotateCw size={16} />
          </button>
        </div>
        
        {/* Camera control - top right */}
        <button 
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-white shadow-lg"
          onClick={() => {
            // Take snapshot functionality would go here
            console.log('Snapshot taken');
          }}
        >
          <Camera size={18} />
        </button>
      </div>

      {model && (
        <div className="mt-4 flex justify-between">
          <button className="flex items-center space-x-2 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition">
            <Download size={16} />
            <span>Download STL</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            <Save size={16} />
            <span>Save Design</span>
          </button>
        </div>
      )}
    </div>
  );
}