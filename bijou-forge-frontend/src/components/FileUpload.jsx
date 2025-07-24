import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onModelGenerated }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setOriginalFile(file);

      const processedBlob = await processImageOnBackend(file);
      if (processedBlob) {
        const imageUrl = URL.createObjectURL(processedBlob);
        setUploadedImage(imageUrl);
      }
    }
  });

  const processImageOnBackend = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5050/api/remove-background', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image processing failed');
      }

      return await response.blob();
    } catch (err) {
      console.error('❌ Error processing image:', err);
      return null;
    }
  };

  const handleGenerateFromImage = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    try {
      const newModel = {
        id: Date.now(),
        prompt: 'Generated from uploaded image',
        imageUrl: uploadedImage,
        timestamp: new Date().toISOString(),
        modelUrl: '/sample-model.glb',  // Replace with real model URL after generation
        thumbnail: uploadedImage
      };
      onModelGenerated(newModel);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag & drop a jewelry image here, or click to select</p>
      </div>

      {uploadedImage && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Processed Image:</h3>
          <div className="relative">
            <img src={uploadedImage} alt="Processed preview" className="w-full h-auto rounded-lg border" />
            <button 
              onClick={() => {
                setUploadedImage(null);
                setOriginalFile(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerateFromImage}
        disabled={!uploadedImage || isGenerating}
        className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isGenerating ? 'Generating 3D Model...' : 'Generate from Image'}
      </button>
    </div>
  );
}
