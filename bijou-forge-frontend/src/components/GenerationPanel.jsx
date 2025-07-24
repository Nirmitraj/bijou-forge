import { useState } from 'react';
import FileUpload from './FileUpload';

export default function GenerationPanel({ activeTab, setActiveTab, onModelGenerated, selectedModel }) {
  const [textPrompt, setTextPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // const handleGenerate = async () => {
  //   setIsGenerating(true);
  //   try {
  //     const newModel = {
  //       id: Date.now(),
  //       prompt: textPrompt,
  //       timestamp: new Date().toISOString(),
  //       modelUrl: '/ring.glb',
  //       thumbnail: ''
  //     };
  //     onModelGenerated(newModel);
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5050/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: textPrompt }),
        headers: { 'Content-Type': 'application/json' }
      });
  
      const result = await response.json();
console.log('Image URL:', result.modelUrl); // This is actually a .png

const newModel = {
  id: Date.now(),
  prompt: textPrompt,
  timestamp: new Date().toISOString(),
  modelUrl: null,         // no .glb to show
  thumbnail: result.thumbnail,  // this is your PNG
};
onModelGenerated(newModel);

    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleEdit = async () => {
    setIsGenerating(true);
    try {
      const editedModel = {
        ...selectedModel,
        id: Date.now(),
        editPrompt: editPrompt,
        timestamp: new Date().toISOString()
      };
      onModelGenerated(editedModel);
      setIsEditing(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-auto">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('text')}
        >
          Describe
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'image' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('image')}
        >
          Upload Image
        </button>
      </div>

      {activeTab === 'text' ? (
        <div>
          <textarea
            className="w-full p-3 border rounded-lg mb-4 h-32"
            placeholder="Describe your jewelry design..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={!textPrompt || isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isGenerating ? 'Generating...' : 'Generate 3D Model'}
          </button>
        </div>
      ) : (
        <FileUpload onModelGenerated={onModelGenerated} />
      )}

      {selectedModel && !isEditing && (
        <div className="mt-6">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700"
          >
            Edit This Design
          </button>
        </div>
      )}

      {isEditing && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">Edit Design</h3>
          <textarea
            className="w-full p-3 border rounded-lg mb-4 h-24"
            placeholder="Describe what you want to change..."
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={!editPrompt || isGenerating}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300"
            >
              {isGenerating ? 'Applying Changes...' : 'Apply Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}