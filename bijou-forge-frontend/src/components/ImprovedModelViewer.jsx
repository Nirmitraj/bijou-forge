import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  PresentationControls,
  ContactShadows,
  Html,
  useProgress,
  Stage,
  AccumulativeShadows,
  RandomizedLight,
  Center,
  BakeShadows,
  MeshReflectorMaterial,
  Float
} from '@react-three/drei';
import { Camera, ChevronLeft, ChevronRight, Download, Save, ZoomIn, ZoomOut, 
         RotateCw, Maximize2, Minimize2, Share2, Settings, Slash, Info, Loader } from 'lucide-react';
import { easing } from 'maath';
import * as THREE from 'three';
// Import the STLExporter utility (you'll need to install a dependency)
// For example: npm install three-stdlib
import { STLExporter } from 'three-stdlib';
// Import the saveModel function from your API
import { saveModel } from '../services/api';

// Enhanced loading indicator with progress
function LoadingIndicator() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black bg-opacity-50 p-6 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <Loader className="animate-spin text-blue-500 mr-2" size={24} />
          <span className="text-white font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

// Floor with reflections for jewelry display
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        roughness={0.75}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.8}
      />
    </mesh>
  );
}

// Advanced material management for jewelry models
function EnhancedModel({ url, materialPreset = 'default', animateRotation = true }) {
  const group = useRef();
  const { scene } = useGLTF(url);
  const [hovered, setHovered] = useState(false);
  
  // Material presets for different types of jewelry
  const materialPresets = useMemo(() => ({
    default: {
      metal: { 
        metalness: 0.9, 
        roughness: 0.3, 
        envMapIntensity: 1.2,
        color: '#FFD700' 
      },
      gemstone: { 
        metalness: 0.1, 
        roughness: 0.1, 
        clearcoat: 1, 
        clearcoatRoughness: 0.1,
        transmission: 0.95,
        ior: 2.75,
        thickness: 5,
        envMapIntensity: 2.5
      }
    },
    silver: {
      metal: { 
        metalness: 0.9, 
        roughness: 0.2, 
        envMapIntensity: 1.5,
        color: '#C0C0C0' 
      },
      gemstone: { 
        metalness: 0.1, 
        roughness: 0.1, 
        clearcoat: 1, 
        clearcoatRoughness: 0.1,
        transmission: 0.95
      }
    },
    platinum: {
      metal: { 
        metalness: 0.95, 
        roughness: 0.1, 
        envMapIntensity: 1.8,
        color: '#E5E4E2' 
      },
      gemstone: { 
        metalness: 0.1, 
        roughness: 0.1, 
        clearcoat: 1, 
        clearcoatRoughness: 0.1,
        transmission: 0.95
      }
    }
  }), []);

  // Apply material enhancements
  useEffect(() => {
    const preset = materialPresets[materialPreset] || materialPresets.default;
    
    scene.traverse((child) => {
      if (child.isMesh) {
        // Create a copy of the original material
        child.material = child.material.clone();
        
        // Enhance base properties for all materials
        child.material.envMapIntensity = 1.5;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Apply material presets based on object name or type
        if (child.name.toLowerCase().includes('metal') || 
            child.name.toLowerCase().includes('gold') || 
            child.name.toLowerCase().includes('silver') || 
            child.name.toLowerCase().includes('band')) {
          Object.assign(child.material, preset.metal);
        }
        
        // Apply gemstone properties
        else if (child.name.toLowerCase().includes('gem') || 
                 child.name.toLowerCase().includes('stone') || 
                 child.name.toLowerCase().includes('diamond') ||
                 child.name.toLowerCase().includes('ruby') ||
                 child.name.toLowerCase().includes('sapphire')) {
          Object.assign(child.material, preset.gemstone);
        }
      }
    });
  }, [scene, materialPreset, materialPresets]);

  // Subtle floating animation and rotation
  useFrame((state, delta) => {
    if (animateRotation && group.current) {
      group.current.rotation.y += delta * 0.15; // Slow rotation
    }
    
    // Subtle hovering effect
    if (group.current) {
      const time = state.clock.getElapsedTime();
      group.current.position.y = Math.sin(time * 0.5) * 0.025; // Subtle up/down movement
    }
    
    // Highlight effect on hover
    if (group.current) {
      easing.damp3(
        group.current.scale, 
        hovered ? [1.02, 1.02, 1.02] : [1, 1, 1], 
        0.1, 
        delta
      );
    }
  });

  // Compute bounding box for proper centering and scaling
  useEffect(() => {
    if (group.current) {
      const box = new THREE.Box3().setFromObject(group.current);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Center the model
      group.current.position.x = -center.x;
      group.current.position.y = -center.y;
      group.current.position.z = -center.z;
      
      // Scale the model to a reasonable size
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 2) {
        const scale = 2 / maxDim;
        group.current.scale.set(scale, scale, scale);
      }
    }
  }, [scene]);

  return (
    <group 
      ref={group} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

// Demo jewelry model when no model is loaded
function DemoJewelryModel() {
  const ringRef = useRef();
  const diamondRef = useRef();
  
  // Animate the demo model
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.2;
    }
    
    if (diamondRef.current) {
      diamondRef.current.rotation.y = t * -0.1;
      diamondRef.current.position.y = Math.sin(t) * 0.05 + 0.2;
    }
  });
  
  return (
    <group>
      {/* Ring band */}
      <mesh ref={ringRef} castShadow receiveShadow>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9} 
          roughness={0.2} 
          envMapIntensity={1.5} 
        />
      </mesh>
      
      {/* Diamond */}
      <mesh ref={diamondRef} position={[0, 0.2, 0]} castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          metalness={0.1} 
          roughness={0.1} 
          transmission={0.9} 
          ior={2.75}
          thickness={5}
          envMapIntensity={2.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}

// Camera controller component for smooth transitions
function CameraController({ position, target, enabled }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!enabled) return;
    
    camera.position.set(...position);
    camera.lookAt(...target);
  }, [camera, position, target, enabled]);
  
  return null;
}

// Main viewer component
export default function ImprovedModelViewer({ model, darkMode, user }) {
  const [viewMode, setViewMode] = useState('orbit'); // 'orbit', 'presentation', 'detail'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [materialPreset, setMaterialPreset] = useState('default');
  const [animateRotation, setAnimateRotation] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [currentView, setCurrentView] = useState('front');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Camera views for preset angles
  const cameraViews = {
    front: { position: [0, 0, 4], target: [0, 0, 0] },
    back: { position: [0, 0, -4], target: [0, 0, 0] },
    left: { position: [-4, 0, 0], target: [0, 0, 0] },
    right: { position: [4, 0, 0], target: [0, 0, 0] },
    top: { position: [0, 4, 0], target: [0, 0, 0] },
    bottom: { position: [0, -4, 0], target: [0, 0, 0] },
  };
  
  // Load saved material preset from localStorage if available
  useEffect(() => {
    if (model?.id) {
      const savedPreset = localStorage.getItem(`model-${model.id}-preset`);
      if (savedPreset && ['default', 'silver', 'platinum'].includes(savedPreset)) {
        setMaterialPreset(savedPreset);
      }
    }
  
    // Show model image preview in console if it's an image
    if (model?.modelUrl && (model.modelUrl.endsWith('.png') || model.modelUrl.endsWith('.jpg'))) {
      console.log('%c ', `
        font-size: 1px;
        padding: 100px 100px;
        background: url(${model.modelUrl}) no-repeat center;
        background-size: contain;
      `);
    }
  }, [model]);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Update fullscreen state based on document state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle rotation changes
  const handleRotateView = (direction) => {
    if (controlsRef.current) {
      const currentRotation = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.setAzimuthalAngle(currentRotation + direction * Math.PI / 4);
    }
  };
  
  // Handle view preset selection
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (controlsRef.current && cameraViews[view]) {
      const { position, target } = cameraViews[view];
      controlsRef.current.object.position.set(...position);
      controlsRef.current.target.set(...target);
    }
  };

  // Function to save the model - FIXED VERSION
  const handleSaveModel = async () => {
    if (!model || !user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Use only the parameters your API expects
      await saveModel(model.id, user.email);
      
      // Save material preset to localStorage
      localStorage.setItem(`model-${model.id}-preset`, materialPreset);
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving model:', error);
      setSaveError('Failed to save model. Please try again.');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to download the model as STL
  const handleDownloadSTL = () => {
    if (!model) return;
    
    setIsDownloading(true);
    
    try {
      // Find canvas element
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      // Create a scene for export
      const scene = new THREE.Scene();
      
      // Create an exporter
      const exporter = new STLExporter();
      
      // For demo purposes, create a basic ring shape if we can't export the actual model
      const ringGeometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
      const ringMaterial = new THREE.MeshStandardMaterial({ 
        color: materialPreset === 'silver' ? '#C0C0C0' : 
               materialPreset === 'platinum' ? '#E5E4E2' : '#FFD700', 
        metalness: 0.9,
        roughness: 0.2
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);
      
      // Export the scene to STL
      const result = exporter.parse(scene, { binary: true });
      
      // Create a blob and download it
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `jewelry-model-${model.id || Date.now()}.stl`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting STL:', error);
      alert('Failed to download the model. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Create UI controls for the viewer
  const renderControls = () => {
    const buttonClass = `w-8 h-8 flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} rounded-full text-${darkMode ? 'white' : 'gray-800'} shadow transition-colors duration-150`;
    
    return (
      <>
        {/* Main controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-opacity-70 rounded-full p-2 backdrop-blur-sm" style={{ background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
          <button className={buttonClass} onClick={() => handleRotateView(-1)} title="Rotate Left">
            <ChevronLeft size={16} />
          </button>
          <button className={buttonClass} onClick={() => setAnimateRotation(!animateRotation)} title={animateRotation ? "Stop Animation" : "Start Animation"}>
            <Slash size={16} className={!animateRotation ? "opacity-70" : "opacity-0"} style={{ position: 'absolute' }} />
            <RotateCw size={16} />
          </button>
          <button className={buttonClass} onClick={() => handleRotateView(1)} title="Rotate Right">
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Top-right controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className={buttonClass} onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button className={buttonClass} onClick={() => setShowInfo(!showInfo)} title="Model Info">
            <Info size={16} />
          </button>
        </div>
        
        {/* Left side view presets */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          {Object.keys(cameraViews).map((view) => (
            <button 
              key={view} 
              className={`${buttonClass} ${currentView === view ? (darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white') : ''}`} 
              onClick={() => handleViewChange(view)}
              title={`${view.charAt(0).toUpperCase() + view.slice(1)} View`}
            >
              {view.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </>
    );
  };
  
  // Render model information panel
  const renderModelInfo = () => {
    if (!showInfo) return null;
    
    return (
      <div 
        className={`absolute top-16 right-4 w-64 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-4 backdrop-blur-sm`}
        style={{ background: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
      >
        <h3 className="font-medium mb-2">Model Information</h3>
        <div className="text-sm">
          <p><span className="font-medium">Name:</span> {model?.prompt || 'Demo Model'}</p>
          <p><span className="font-medium">Created:</span> {model?.timestamp ? new Date(model.timestamp).toLocaleString() : 'N/A'}</p>
          
          <div className="mt-4">
            <p className="font-medium mb-2">Material Preset:</p>
            <div className="grid grid-cols-3 gap-2">
              {['default', 'silver', 'platinum'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setMaterialPreset(preset);
                    if (model?.id) {
                      localStorage.setItem(`model-${model.id}-preset`, preset);
                    }
                  }}
                  className={`py-1 px-2 text-xs rounded ${materialPreset === preset ? 
                    (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : 
                    (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render status notifications
  const renderNotifications = () => {
    if (!saveSuccess && !saveError) return null;
    
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg animate-fade-in-out" 
          style={{ 
            background: saveSuccess ? (darkMode ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.9)') : 
                                      (darkMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.9)'),
            color: 'white'
          }}>
        {saveSuccess && 'Design saved successfully!'}
        {saveError && saveError}
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className={`${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-white to-gray-100'} rounded-lg shadow-xl p-4 h-full flex flex-col overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {model ? 'Your 3D Jewelry Design' : 'Interactive 3D Preview'}
        </h2>
        
        {/* View mode toggle */}
        <div className={`flex ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'orbit' ? 
              (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : 
              (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
            onClick={() => setViewMode('orbit')}
          >
            3D View
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'presentation' ? 
              (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : 
              (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
            onClick={() => setViewMode('presentation')}
          >
            Showcase
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'detail' ? 
              (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : 
              (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
            onClick={() => setViewMode('detail')}
          >
            Detail
          </button>
        </div>
      </div>
      
      <div className="relative flex-1 rounded-lg overflow-hidden bg-black">
        {/* Show image if it's not a .glb */}
  {model?.modelUrl && !model.modelUrl.endsWith('.glb') && (
    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
      <img
        src={model.modelUrl}
        alt="Generated Design"
        className="max-h-full max-w-full object-contain rounded-lg shadow-lg border"
      />
    </div>
  )}

        {/* 3D Canvas */}
        <Canvas 
          ref={canvasRef}
          camera={{ position: [0, 0, 4], fov: 45 }}
          dpr={[1, 2]}
          shadows
          gl={{ preserveDrawingBuffer: true }}
        >
          <color attach="background" args={[darkMode ? "#0a0a0a" : "#f0f0f0"]} />
          
          {/* Different setups based on view mode */}
          {viewMode === 'orbit' && (
            <>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} color="blue" intensity={0.5} />
              
              <Suspense fallback={<LoadingIndicator />}>
                <Center>
                  {model?.modelUrl?.endsWith('.glb') ? (
  <EnhancedModel 
    url={model.modelUrl} 
    materialPreset={materialPreset} 
    animateRotation={animateRotation} 
  />
) : (
  <DemoJewelryModel />
)}
                </Center>
                <Environment preset="city" />
                <ContactShadows
                  position={[0, -1.5, 0]}
                  opacity={0.5}
                  scale={10}
                  blur={1.5}
                  far={4}
                />
                <BakeShadows />
              </Suspense>
              
              <OrbitControls 
                ref={controlsRef}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
                enableZoom={true}
                enablePan={true}
                dampingFactor={0.05}
                autoRotate={false}
              />
            </>
          )}
          
          {viewMode === 'presentation' && (
            <>
              <Suspense fallback={<LoadingIndicator />}>
                <PresentationControls
                  ref={controlsRef}
                  global
                  rotation={[0, 0, 0]}
                  polar={[-Math.PI / 4, Math.PI / 4]}
                  azimuth={[-Math.PI / 4, Math.PI / 4]}
                  config={{ mass: 2, tension: 500 }}
                  snap={{ mass: 4, tension: 300 }}
                >
                  <Float 
                    rotationIntensity={0.2} 
                    floatIntensity={0.2}
                    speed={1.5}
                  >
                    <Stage 
                      environment="city" 
                      intensity={0.6} 
                      contactShadow 
                      shadows
                    >
                      {model ? 
                        <EnhancedModel 
                          url={model.modelUrl} 
                          materialPreset={materialPreset} 
                          animateRotation={false} 
                        /> : 
                        <DemoJewelryModel />
                      }
                    </Stage>
                  </Float>
                </PresentationControls>
                <Environment preset="city" />
              </Suspense>
            </>
          )}
          
          {viewMode === 'detail' && (
            <>
              <ambientLight intensity={0.7} />
              <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
              <pointLight position={[-5, 5, 5]} color="white" intensity={1} />
              
              <Suspense fallback={<LoadingIndicator />}>
                <Center>
                  {model ? 
                    <EnhancedModel 
                      url={model.modelUrl} 
                      materialPreset={materialPreset} 
                      animateRotation={animateRotation} 
                    /> : 
                    <DemoJewelryModel />
                  }
                </Center>
                
                <ReflectiveFloor />
                <AccumulativeShadows
                  temporal
                  frames={100}
                  color="black"
                  colorBlend={0.5}
                  opacity={0.8}
                  scale={10}
                  position={[0, -1.01, 0]}
                >
                  <RandomizedLight 
                    amount={8} 
                    radius={4} 
                    ambient={0.5}
                    position={[5, 5, -10]}
                    bias={0.001}
                  />
                </AccumulativeShadows>
                
                <Environment preset="studio" />
                <BakeShadows />
              </Suspense>
              
              <OrbitControls 
                ref={controlsRef}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
                enableZoom={true}
                enablePan={true}
                autoRotate={false}
              />
              
              <CameraController
                position={cameraViews[currentView]?.position || [0, 0, 4]}
                target={cameraViews[currentView]?.target || [0, 0, 0]}
                enabled={!!cameraViews[currentView]}
              />
            </>
          )}
        </Canvas>
        
        {/* Controls Overlay */}
        {renderControls()}
        {renderModelInfo()}
        {renderNotifications()}
        
        {/* Take screenshot button */}
        <button 
          className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} rounded-full ${darkMode ? 'text-white' : 'text-gray-800'} shadow-lg transition-colors duration-150`}
          onClick={() => {
            // Take snapshot functionality
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const link = document.createElement('a');
              link.download = `jewelry-design-${Date.now()}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
            }
          }}
          title="Take Screenshot"
        >
          <Camera size={18} />
        </button>
      </div>

      {model && (
        <div className="mt-4 flex justify-between">
          <button 
            onClick={handleDownloadSTL}
            disabled={isDownloading}
            className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} py-2 px-4 rounded-lg transition-colors duration-150 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
            title="Download as 3D printable STL file"
          >
            {isDownloading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span className="ml-2">Download STL</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleSaveModel}
            disabled={isSaving || !user}
            className={`flex items-center space-x-2 ${!user ? (darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg transition-colors duration-150`}
            title={user ? "Save to your account" : "Login to save designs"}
          >
            {isSaving ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="ml-2">Save Design</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}