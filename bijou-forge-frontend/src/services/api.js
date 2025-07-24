const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const generateFromText = async (prompt) => {
  const response = await fetch(`${API_BASE_URL}/generate/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
};

export const generateFromImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/generate/image`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const editModel = async (modelId, prompt) => {
  const response = await fetch(`${API_BASE_URL}/edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelId, prompt }),
  });
  return response.json();
};

export const saveModel = async (modelId, userId, options = {}) => {
  // Add options to the request body
  const response = await fetch(`${API_BASE_URL}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      modelId, 
      userId,
      materialPreset: options.materialPreset,
      thumbnail: options.thumbnail
    }),
  });
  return response.json();
};

// New function to download model as STL
export const downloadModelAsSTL = async (modelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/download/stl/${modelId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to download model');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `model-${modelId}.stl`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading STL:', error);
    return false;
  }
};