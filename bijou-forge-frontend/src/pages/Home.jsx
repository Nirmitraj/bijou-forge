import { useState, useEffect } from 'react';
import Header from '../components/Header';
import GenerationPanel from '../components/GenerationPanel';
import HistorySidebar from '../components/HistorySidebar';
import ImprovedModelViewer from '../components/ImprovedModelViewer';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('text');
  const [generatedModels, setGeneratedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isViewerMaximized, setIsViewerMaximized] = useState(false);
  const [backendMessage, setBackendMessage] = useState('');

  // 🔁 Fetch message from Flask backend once on mount
  useEffect(() => {
    fetch("http://localhost:5050/api/hello")
      .then((res) => res.json())
      .then((data) => {
        console.log("Flask backend response:", data);
        setBackendMessage(data.message);
      })
      .catch((err) => console.error("Error fetching from Flask:", err));
  }, []);

  // 🧪 Load sample model on first render
  useEffect(() => {
    const demoModel = {
      id: "demo-1",
      prompt: "Gold ring with emerald centerpiece and diamond accents",
      timestamp: new Date().toISOString(),
      modelUrl: '/models/optimized.glb',
    };

    if (generatedModels.length === 0) {
      setGeneratedModels([demoModel]);
      setSelectedModel(demoModel);
    }
  }, [generatedModels.length]);

  const handleModelGenerated = (newModel) => {
    setGeneratedModels(prev => [newModel, ...prev]);
    setSelectedModel(newModel);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header 
        user={user} 
        onLogin={() => setShowAuthModal(true)} 
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* 🟢 Optional: Display backend message */}
      <div className="text-center p-2 bg-green-100 text-green-900">
        {backendMessage || "Connecting to Flask..."}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
        <div 
          className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 lg:relative fixed inset-y-0 left-0 z-50 w-64 
            transition-transform duration-300 ease-in-out
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            border-r shadow-lg lg:shadow-none
          `}
        >
          <HistorySidebar 
            models={generatedModels} 
            onSelect={setSelectedModel} 
            user={user}
            darkMode={darkMode}
            selectedModel={selectedModel}
          />
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-auto">
            <GenerationPanel 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              onModelGenerated={handleModelGenerated}
              selectedModel={selectedModel}
              darkMode={darkMode}
            />
            <ImprovedModelViewer 
              model={selectedModel} 
              darkMode={darkMode} 
              user={user} 
            />
          </div>
        </main>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={setUser}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
