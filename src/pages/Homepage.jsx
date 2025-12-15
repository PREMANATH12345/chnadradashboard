

import React, { useState, useEffect } from 'react';
import { GripVertical, Plus, Edit, Trash2, Save, X, ChevronDown, Eye, EyeOff, Settings, Upload } from 'lucide-react';

// ImageUpload Component - Moved outside of Homepage
const ImageUpload = ({ currentValue, onUpdate, label = "Image", recommendedSize = "1900×600" }) => {
  const [uploading, setUploading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL      

  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 10MB');
      return;
    }

    setUploading(true);
    
    // Show immediate preview
    const previewUrl = URL.createObjectURL(file);
    onUpdate(previewUrl);

    try {
      const formData = new FormData();
      formData.append('images', file);

      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL_DAS
      const response = await fetch(`${API_URL}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data.images && result.data.images.length > 0) {
        const serverPath = result.data.images[0].url;
        onUpdate(serverPath);
        URL.revokeObjectURL(previewUrl);
      } else {
        alert('Failed to upload image: ' + (result.message || 'Unknown error'));
        onUpdate('');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      onUpdate('');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    return `${BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const renderImagePreview = () => {
    const imageUrl = getImageUrl(currentValue);

    return (
      <div className="relative group">
        <img 
          src={imageUrl} 
          alt={`${label} preview`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
        <div 
          className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs hidden"
          style={{ display: 'none' }}
        >
          Failed to load
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUpdate('');
            }}
            className="bg-red-500 text-white p-1 sm:p-2 rounded-full hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {recommendedSize && (
        <span className="text-xs text-gray-500 mt-1">Recommended size: {recommendedSize}</span>
      )}
      
      <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
        {/* Preview Section */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <div className={`relative overflow-hidden border rounded-lg ${
            currentValue ? 'border-gray-300' : 'border-gray-200'
          }`} style={{ width: '120px', height: '120px' }}>
            {currentValue ? (
              renderImagePreview()
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={currentValue || ''}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder="Image URL or path"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={uploading}
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id={`file-${label.replace(/\s/g, '-')}`}
                disabled={uploading}
              />
              <label
                htmlFor={`file-${label.replace(/\s/g, '-')}`}
                className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
                  uploading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload'}
              </label>
            </div>
          </div>
          
          {currentValue && (
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>✓ Image uploaded</span>
                {currentValue.startsWith('blob:') && (
                  <span className="text-orange-500">(Preview - uploading...)</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add this VideoUpload component near the ImageUpload component
const VideoUpload = ({ currentValue, onUpdate, label = "Video", recommendedSize = "Max 50MB" }) => {
  const [uploading, setUploading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL;

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // --- Video validation ---
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid video file (MP4, WebM, OGG, or MOV)');
    return;
  }

  // Max file size: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('File size too large. Maximum size is 50MB');
    return;
  }

  setUploading(true);

  // Show client-side preview
  const previewUrl = URL.createObjectURL(file);
  onUpdate(previewUrl);

  try {
    const formData = new FormData();
    formData.append("images", file);  // <-- Backend field is "images"

    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;

    const response = await fetch(`${API_URL}/upload-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    console.log("Upload Response:", result);

    if (result.success && result.data?.images?.length > 0) {
      const serverPath = result.data.images[0].url;
      onUpdate(serverPath);
      URL.revokeObjectURL(previewUrl);
    } 
    else {
      alert("Failed to upload video: " + (result.message || "Unknown error"));
      onUpdate("");
    }

  } catch (error) {
    console.error("Error uploading video:", error);
    alert("Error uploading video. Please try again.");
    onUpdate("");
  } finally {
    setUploading(false);
  }
};
  

  const getVideoUrl = (videoPath) => {
    if (!videoPath) return '';
    if (videoPath.startsWith('http') || videoPath.startsWith('data:') || videoPath.startsWith('blob:')) {
      return videoPath;
    }
    return `${BASE_URL}${videoPath.startsWith('/') ? videoPath : `/${videoPath}`}`;
  };

  const renderVideoPreview = () => {
    const videoUrl = getVideoUrl(currentValue);

    return (
      <div className="relative group">
        <video 
          src={videoUrl} 
          className="w-full h-full object-cover"
          controls
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
        <div 
          className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs hidden"
          style={{ display: 'none' }}
        >
          Failed to load video
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUpdate('');
            }}
            className="bg-red-500 text-white p-1 sm:p-2 rounded-full hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {recommendedSize && (
        <span className="text-xs text-gray-500 mt-1">Recommended: {recommendedSize}</span>
      )}
      
      <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
        {/* Preview Section */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <div className={`relative overflow-hidden border rounded-lg ${
            currentValue ? 'border-gray-300' : 'border-gray-200'
          }`} style={{ width: '120px', height: '120px' }}>
            {currentValue ? (
              renderVideoPreview()
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={currentValue || ''}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder="Video URL or path"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={uploading}
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id={`video-${label.replace(/\s/g, '-')}`}
                disabled={uploading}
              />
              <label
                htmlFor={`video-${label.replace(/\s/g, '-')}`}
                className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
                  uploading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Video'}
              </label>
            </div>
          </div>
          
          {currentValue && (
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>✓ Video uploaded</span>
                {currentValue.startsWith('blob:') && (
                  <span className="text-orange-500">(Preview - uploading...)</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Hero Category Selector Component
const HeroCategorySelector = ({ item, onUpdate, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(item.selectedCategory || null);
  const [redirectToCategory, setRedirectToCategory] = useState(item.redirectToCategory || false);

  useEffect(() => {
    setSelectedCategory(item.selectedCategory || null);
    setRedirectToCategory(item.redirectToCategory || false);
  }, [item.selectedCategory, item.redirectToCategory]);

  const handleCategorySelect = (categoryId) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelectedCategory);
    
    const updatedItem = {
      ...item,
      selectedCategory: newSelectedCategory
    };
    
    // Auto-fill CTA text with category name if empty
    if (!updatedItem.cta && newSelectedCategory) {
      const category = categories.find(cat => cat.id === newSelectedCategory);
      if (category) {
        updatedItem.cta = `Shop ${category.name}`;
      }
    }
    
    onUpdate(updatedItem);
  };

  const toggleRedirect = () => {
    const newValue = !redirectToCategory;
    setRedirectToCategory(newValue);
    
    const updatedItem = {
      ...item,
      redirectToCategory: newValue,
      // If enabling redirect, ensure ctaLink points to category
      ctaLink: newValue && selectedCategory ? `/category/${selectedCategory}` : (item.ctaLink || '/shop')
    };
    
    onUpdate(updatedItem);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Category Link</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Redirect to category</span>
          <button
            type="button"
            onClick={toggleRedirect}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              redirectToCategory ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                redirectToCategory ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {redirectToCategory ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Redirect Enabled:</strong> Clicking this banner will redirect to selected category
            </p>
          </div>
          
          <label className="block text-sm font-medium">
            Select Category for Redirect
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          {selectedCategory && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-800">
                <strong>Selected Category:</strong> {
                  categories.find(cat => cat.id === selectedCategory)?.name || 'Unknown Category'
                }
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedCategory === category.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedCategory === category.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedCategory === category.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 block">{category.name}</span>
                    <span className="text-xs text-gray-500">ID: {category.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Category redirect is disabled. The CTA button will use the custom link below.
          </p>
        </div>
      )}
    </div>
  );
};
// Add this component near your other components (after HeroCategorySelector)
const FeatureImageWithCategory = ({ 
  imageType, 
  currentValue, 
  currentCategory, 
  onImageUpdate, 
  onCategoryUpdate, 
  categories,
  label 
}) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL || '';
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleCategorySelect = (categoryId) => {
    onCategoryUpdate(categoryId);
    setShowCategoryPicker(false);
  };

  const selectedCategory = categories.find(cat => cat.id === currentCategory);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Image Upload Section */}
        <div className="flex-1">
          <ImageUpload
            currentValue={currentValue}
            onUpdate={onImageUpdate}
            label=""
            recommendedSize=""
          />
        </div>
        
        {/* Category Selection Section - Only show if image exists */}
        {currentValue && (
          <div className="w-full sm:w-48">
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  Link image to category:
                </label>
                {selectedCategory && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ {selectedCategory.name}
                  </span>
                )}
              </div>
              
              <div 
                className={`border rounded-lg p-2 cursor-pointer ${selectedCategory ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
                onClick={() => setShowCategoryPicker(true)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              
              {selectedCategory && (
                <div className="mt-2 text-xs text-gray-600">
                  This image will link to: <span className="font-medium">{selectedCategory.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Select Category for {label}</h3>
            
            {currentValue && (
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto mb-3 rounded overflow-hidden border">
                  <img 
                    src={getImageUrl(currentValue)} 
                    alt={`${label} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-center text-gray-600">
                  Choose which category this image should link to
                </p>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      currentCategory === category.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        currentCategory === category.id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {currentCategory === category.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {currentCategory ? 'Confirm' : 'Skip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// NEW: Component for selecting category for individual image
const ImageCategorySelector = ({ 
  imageIndex, 
  imageUrl, 
  selectedCategoryId, 
  onCategorySelect, 
  categories,
  label = "Select Category"
}) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleCategorySelect = (categoryId) => {
    onCategorySelect(imageIndex, categoryId);
    setShowCategoryPicker(false);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL || '';
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        {selectedCategory && (
          <span className="text-xs text-green-600 font-medium">
            ✓ {selectedCategory.name}
          </span>
        )}
      </div>

      {imageUrl ? (
        <div className="relative">
          <div 
            className="border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setShowCategoryPicker(true)}
          >
            <div className="aspect-square bg-gray-100 relative">
              <img 
                src={getImageUrl(imageUrl)} 
                alt={`Image ${imageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedCategory && (
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {selectedCategory.name}
                </div>
              )}
            </div>
            <div className="p-2 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Click to select category</span>
                {!selectedCategory && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>
            </div>
          </div>

          {/* Category Picker Modal */}
          {showCategoryPicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-xl">
                <h3 className="text-lg font-bold mb-4">Select Category for Image {imageIndex + 1}</h3>
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto mb-3 rounded overflow-hidden border">
                    <img 
                      src={getImageUrl(imageUrl)} 
                      alt={`Image ${imageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    Choose which category this image should link to
                  </p>
                </div>
                
                <div className="max-h-60 overflow-y-auto p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedCategoryId === category.id 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedCategoryId === category.id 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedCategoryId === category.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCategoryPicker(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  {selectedCategoryId && (
                    <button
                      onClick={() => setShowCategoryPicker(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            Upload an image first to select a category
          </p>
        </div>
      )}

      {selectedCategory && (
        <div className="text-xs text-gray-600 mt-1">
          This image will link to: <span className="font-medium">{selectedCategory.name}</span>
        </div>
      )}
    </div>
  );
};

// Updated Collection Category Selector for bulk operations
const CollectionCategorySelector = ({ 
  item, 
  onUpdate, 
  categories,
  onBulkCategoryAssignment 
}) => {
  const [redirectToCategory, setRedirectToCategory] = useState(item.redirectToCategory || false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(
    item.imageCategories || Array(4).fill(null)
  );

  useEffect(() => {
    setRedirectToCategory(item.redirectToCategory || false);
    setSelectedCategories(item.imageCategories || Array(4).fill(null));
  }, [item.redirectToCategory, item.imageCategories]);

  const toggleRedirect = () => {
    const newValue = !redirectToCategory;
    setRedirectToCategory(newValue);
    
    const updatedItem = {
      ...item,
      redirectToCategory: newValue,
      ctaLink: newValue ? (item.ctaLink || '/collection') : item.ctaLink
    };
    
    onUpdate(updatedItem);
  };

  const handleImageCategorySelect = (imageIndex, categoryId) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[imageIndex] = categoryId;
    setSelectedCategories(newSelectedCategories);
    
    const updatedItem = {
      ...item,
      imageCategories: newSelectedCategories
    };
    
    onUpdate(updatedItem);
  };

  const handleBulkAssign = () => {
    if (onBulkCategoryAssignment) {
      onBulkCategoryAssignment(selectedCategories);
      setShowBulkAssignModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Image Category Links</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Enable category links</span>
          <button
            type="button"
            onClick={toggleRedirect}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              redirectToCategory ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                redirectToCategory ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {redirectToCategory ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Category Links Enabled:</strong> Each image can be linked to a different category
            </p>
            <button
              onClick={() => setShowBulkAssignModal(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Bulk assign categories to all images
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((imageIndex) => (
              <ImageCategorySelector
                key={imageIndex}
                imageIndex={imageIndex}
                imageUrl={item.images?.[imageIndex] || ''}
                selectedCategoryId={selectedCategories[imageIndex]}
                onCategorySelect={handleImageCategorySelect}
                categories={categories}
                label={`Image ${imageIndex + 1} Category`}
              />
            ))}
          </div>

          {/* Bulk Category Assignment Modal */}
          {showBulkAssignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Bulk Assign Categories</h3>
                <p className="text-gray-600 mb-6">
                  Assign categories to all 4 images at once. Each image can have a different category.
                </p>
                
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((imageIndex) => {
                    const imageUrl = item.images?.[imageIndex];
                    return (
                      <div key={imageIndex} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded overflow-hidden border bg-gray-100">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl.startsWith('http') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:') 
                                    ? imageUrl 
                                    : `${import.meta.env.VITE_API_BASE_IMG_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
                                  }
                                  alt={`Image ${imageIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">Image {imageIndex + 1}</h4>
                            <select
                              value={selectedCategories[imageIndex] || ''}
                              onChange={(e) => {
                                const newCategories = [...selectedCategories];
                                newCategories[imageIndex] = e.target.value || null;
                                setSelectedCategories(newCategories);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            {selectedCategories[imageIndex] && (
                              <div className="mt-2 text-xs text-green-600">
                                Selected: {categories.find(cat => cat.id === selectedCategories[imageIndex])?.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowBulkAssignModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAssign}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply to All Images
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Category links are disabled. Images will not link to categories.
          </p>
        </div>
      )}
    </div>
  );
};

// Product Selection Component for Category Highlight
const ProductSelector = ({ item, onUpdate, categories, products }) => {
  const [selectedProducts, setSelectedProducts] = useState(item.selectedProducts || []);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setSelectedProducts(item.selectedProducts || []);
  }, [item.selectedProducts]);

  // Load products when category is selected
  useEffect(() => {
    if (item.selectedCategories?.[0]) {
      loadProductsForCategory(item.selectedCategories[0]);
    }
  }, [item.selectedCategories]);

  const loadProductsForCategory = async (categoryId) => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;
      
      // Fetch products for the selected category
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get',
          table: 'products',
          where: { 
            category_id: categoryId,
            is_deleted: 0 
          },
          limit: 50 // Limit to 50 products for performance
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        setAvailableProducts(result.data);
      } else {
        setAvailableProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setAvailableProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductToggle = (productId) => {
    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(newSelectedProducts);
    
    const updatedItem = {
      ...item,
      selectedProducts: newSelectedProducts
    };
    
    onUpdate(updatedItem);
  };

  const getProductImage = (product) => {
    if (!product.images) return '';
    try {
      const images = JSON.parse(product.images);
      return images[0] || '';
    } catch {
      return '';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL || '';
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const selectedCategory = categories.find(cat => cat.id === item.selectedCategories?.[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Featured Products</label>
        <button
          type="button"
          onClick={() => setShowProductSelector(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={!item.selectedCategories?.[0] || loadingProducts}
        >
          {selectedProducts.length > 0 ? `Edit (${selectedProducts.length} selected)` : 'Select Products'}
        </button>
      </div>

      {!item.selectedCategories?.[0] ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Please select a category first to choose products
          </p>
        </div>
      ) : (
        <>
          {selectedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedProducts.map(productId => {
                const product = availableProducts.find(p => p.id === productId);
                if (!product) return null;
                
                return (
                  <div key={productId} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      <img 
                        src={getImageUrl(getProductImage(product))} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-gray-50 border-t">
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                No products selected. Click "Select Products" to choose products from {selectedCategory?.name}
              </p>
            </div>
          )}
        </>
      )}

      {/* Product Selection Modal */}
      {showProductSelector && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Select Products from {selectedCategory.name}
              </h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found in this category.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {availableProducts.length} products available
                    </p>
                    {selectedProducts.length > 0 && (
                      <p className="text-sm font-medium text-blue-600">
                        {selectedProducts.length} products selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableProducts.map(product => {
                    const isSelected = selectedProducts.includes(product.id);
                    const productImage = getProductImage(product);
                    
                    return (
                      <div
                        key={product.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleProductToggle(product.id)}
                      >
                        <div className="relative aspect-square bg-gray-100">
                          {productImage ? (
                            <img 
                              src={getImageUrl(productImage)} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-blue-600 text-white rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-2 bg-white">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">₹{product.price}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">ID: {product.id}</span>
                            {isSelected && (
                              <span className="text-xs text-green-600 font-medium">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowProductSelector(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowProductSelector(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Selector Component for Category Highlight
const CategorySelector = ({ item, onUpdate, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(item.selectedCategories?.[0] || null);

  useEffect(() => {
    setSelectedCategory(item.selectedCategories?.[0] || null);
  }, [item.selectedCategories]);

  const handleCategorySelect = (categoryId) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelectedCategory);
    
    const updatedItem = {
      ...item,
      selectedCategories: newSelectedCategory ? [newSelectedCategory] : [],
      selectedProducts: [] // Clear products when category changes
    };
    
    if (!updatedItem.title && newSelectedCategory) {
      const category = categories.find(cat => cat.id === newSelectedCategory);
      if (category) {
        updatedItem.title = category.name;
      }
    }
    
    onUpdate(updatedItem);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        Select Category 
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <strong>Currently Selected:</strong> {
              categories.find(cat => cat.id === selectedCategory)?.name || 'Unknown Category'
            }
          </p>
        </div>
      )}
      
      {categories.length === 0 ? (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          No categories found. Please create categories in the Products section first.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedCategory === category.id 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedCategory === category.id 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedCategory === category.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 block">{category.name}</span>
                  <span className="text-xs text-gray-500">ID: {category.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Homepage = () => {
  const [view, setView] = useState('dashboard');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddSectionDropdown, setShowAddSectionDropdown] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingSectionType, setPendingSectionType] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // API Base URL
  const API_URL = import.meta.env.VITE_API_BASE_URL_DAS
  const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Add categories and products state
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get',
          table: 'category'
        })
      });

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  // Fetch all products (for product selector)
  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get',
          table: 'products',
          where: { is_deleted: 0 },
          limit: 200 // Limit for performance
        })
      });

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  // Enhanced loadSections function - Load category data from collection_category with products
  const loadSections = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Load sections
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get',
          table: 'homepage_sections',
          order_by: { order_position: 'ASC' }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API returned unsuccessful response');
      }
      
      if (result.data && result.data.length > 0) {
        const loadedSections = await Promise.all(
          result.data.map(async (row) => {
            try {
              // Parse section data with fallback
              const sectionData = JSON.parse(row.section_data || '{}');
              
              // For category-highlight sections, load ALL data from collection_category
              if (row.type === 'category-highlight') {
                const categoryResponse = await fetch(`${API_URL}/doAll`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    action: 'get',
                    table: 'collection_category',
                    where: { 
                      section_id: row.id,
                      is_deleted: 0 
                    },
                    order_by: { display_order: 'ASC' }
                  })
                });

                if (!categoryResponse.ok) {
                  console.warn(`Failed to load category data for section ${row.id}`);
                  sectionData.items = [];
                } else {
                  const categoryResult = await categoryResponse.json();
                  
                  if (categoryResult.success && categoryResult.data && categoryResult.data.length > 0) {
                    // Create items from collection_category data
                    sectionData.items = categoryResult.data.map(catItem => {
                      const images = JSON.parse(catItem.images || '[]');
                      const selectedProducts = JSON.parse(catItem.selected_products || '[]');
                      return {
                        id: catItem.id,
                        title: catItem.title || '',
                        image: images[0] || '',
                        selectedCategories: [catItem.category_id], // Store category ID
                        selectedProducts: selectedProducts // Store selected products
                      };
                    });
                  } else {
                    sectionData.items = [];
                  }
                }
              }
              
              return {
                id: row.id,
                name: row.name,
                type: row.type,
                enabled: row.enabled === 1,
                order: row.order_position,
                data: sectionData
              };
            } catch (sectionError) {
              console.error(`Error processing section ${row.id}:`, sectionError);
              // Return a basic section even if category data fails
              return {
                id: row.id,
                name: row.name,
                type: row.type,
                enabled: row.enabled === 1,
                order: row.order_position,
                data: { items: [] }
              };
            }
          })
        );
        
        // Filter out any null sections and set state
        const validSections = loadedSections.filter(section => section !== null);
        setSections(validSections);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      alert('Failed to load sections from database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
    // Load categories and products when component mounts
    fetchCategories().then(setCategories);
    fetchProducts().then(setProducts);
  }, []);

  // Updated handleImageUpload function
  const handleImageUpload = async (e, updateFunction) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    updateFunction(previewUrl);

    try {
      const formData = new FormData();
      formData.append('images', file);

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data.images && result.data.images.length > 0) {
        const serverPath = result.data.images[0].url;
        updateFunction(serverPath);
        URL.revokeObjectURL(previewUrl);
      } else {
        alert('Failed to upload image: ' + result.message);
        updateFunction(''); // Clear on failure
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      updateFunction(''); // Clear on failure
    }
  };

  const handleBulkImageUpload = async (e, onSuccess) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data.images && result.data.images.length > 0) {
        const imageUrls = result.data.images.map(img => img.url);
        onSuccess(imageUrls);
        alert(`${result.data.images.length} images uploaded successfully!`);
      } else {
        alert('Failed to upload images: ' + result.message);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    
    newSections.forEach((section, idx) => {
      section.order = idx;
    });

    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    
    try {
      const token = getAuthToken();
      for (const section of sections) {
        await fetch(`${API_URL}/doAll`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'update',
            table: 'homepage_sections',
            data: { order_position: section.order },
            where: { id: section.id }
          })
        });
      }
    } catch (error) {
      console.error('Error updating section order:', error);
    }
  };

  const toggleSection = async (id) => {
    const section = sections.find(s => s.id === id);
    const newEnabled = !section.enabled;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update',
          table: 'homepage_sections',
          data: { enabled: newEnabled ? 1 : 0 },
          where: { id: id }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSections(sections.map(s => 
          s.id === id ? { ...s, enabled: newEnabled } : s
        ));
      }
    } catch (error) {
      console.error('Error toggling section:', error);
    }
  };

  // Enhanced saveCategoryData function - Store all data in collection_category including products
  const saveCategoryData = async (sectionId, categoryData) => {
    try {
      const token = getAuthToken();
      
      // First, soft delete existing entries for this section
      await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'soft_delete',
          table: 'collection_category',
          where: { section_id: sectionId }
        })
      });

      // Then insert new entries for each item
      if (categoryData.items && categoryData.items.length > 0) {
        for (const [index, item] of categoryData.items.entries()) {
          if (item.selectedCategories && item.selectedCategories.length > 0) {
            const categoryId = item.selectedCategories[0];
            const category = categories.find(cat => cat.id === categoryId);
            
            if (category) {
              await fetch(`${API_URL}/doAll`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  action: 'insert',
                  table: 'collection_category',
                  data: {
                    section_id: sectionId,
                    category_id: categoryId,
                    title: item.title || category.name,
                    images: JSON.stringify(item.image ? [item.image] : []),
                    selected_products: JSON.stringify(item.selectedProducts || []),
                    display_order: index,
                    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    is_deleted: 0
                  }
                })
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving category data:', error);
      throw error;
    }
  };

  // Modified saveSection function - Store minimal data in homepage_sections for category-highlight
  const saveSection = async (sectionId, newData) => {
    try {
      const token = getAuthToken();
      const section = sections.find(s => s.id === sectionId);
      
      if (section.type === 'category-highlight') {
        // For category-highlight, ensure items have IDs
        const itemsWithIds = newData.items?.map((item, index) => ({
          ...item,
          id: item.id || Date.now() + index
        })) || [];
        
        // Store minimal data in homepage_sections
        const dataForHomepageSections = {
          ...newData,
          items: itemsWithIds.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image,
            selectedCategories: item.selectedCategories,
            selectedProducts: item.selectedProducts
          }))
        };
        
        // Save to homepage_sections
        const response = await fetch(`${API_URL}/doAll`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'update',
            table: 'homepage_sections',
            data: {
              section_data: JSON.stringify(dataForHomepageSections)
            },
            where: { id: sectionId }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Save all category details to collection_category
          await saveCategoryData(sectionId, { ...newData, items: itemsWithIds });
          
          // Update local state
          setSections(sections.map(s => 
            s.id === sectionId ? { 
              ...s, 
              data: { ...newData, items: itemsWithIds } 
            } : s
          ));
          alert('Section saved successfully!');
        } else {
          alert('Failed to save section: ' + result.message);
        }
      } else {
        // For other section types, save normally
        const response = await fetch(`${API_URL}/doAll`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'update',
            table: 'homepage_sections',
            data: {
              section_data: JSON.stringify(newData)
            },
            where: { id: sectionId }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setSections(sections.map(s => 
            s.id === sectionId ? { ...s, data: newData } : s
          ));
          alert('Section saved successfully!');
        } else {
          alert('Failed to save section: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section. Please try again.');
    }
  };

  const addNewSection = (type) => {
    setPendingSectionType(type);
    setSectionTitle('');
    setShowTitleModal(true);
    setShowAddSectionDropdown(false);
    setShowDropdown(false);
  };

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'hero':
        return {
          items: [
            {
              id: 1,
              type: 'image',
              title: 'New Collection',
              subtitle: 'Discover Our Latest Arrivals',
              description: 'Shop the newest trends with exclusive discounts',
              image: '',
              cta: 'Shop Now',
              ctaLink: '/shop',
              selectedCategory: null,
              redirectToCategory: false
            }
          ]
        };
      // case 'feature-section':
      //   return {
      //     items: [
      //       {
      //         id: 1,
      //         leftImage: '',
      //         rightImage: '',
      //         rightBottomImage: '',
      //         title: 'Feature Title',
      //         subtitle: 'Feature description goes here'
      //       }
      //     ]
      //   };
      // In the getDefaultDataForType function, update the feature-section case:
case 'feature-section':
  return {
    items: [
      {
        id: 1,
        leftImage: '',
        rightImage: '',
        rightBottomImage: '',
        title: 'Feature Title',
        subtitle: 'Feature description goes here',
        // Add category selection for each image
        leftImageCategory: null,
        rightImageCategory: null,
        rightBottomImageCategory: null
      }
    ]
  };
      case 'collection':
        return {
          items: [
            {
              id: 1,
              title: 'Spring Collection',
              subtitle: 'Fresh styles for the new season',
              images: ['', '', '', ''],
              cta: 'View Collection',
              ctaLink: '/collection/spring',
              redirectToCategory: false,
              imageCategories: [null, null, null, null] // NEW: Each image can have its own category
            }
          ]
        };
      case 'category-highlight':
        return {
          items: [
            {
              id: 1,
              title: '',
              image: '',
              selectedCategories: [],
              selectedProducts: []
            }
          ]
        };
      case 'story-upload':
        return {
          items: [
            {
              id: 1,
              videos: ['', '', '', ''],
              title: 'Stories',
              subtitle: 'Watch our latest stories'
            }
          ]
        };
      default:
        return { items: [] };
    }
  };

  const confirmAddSection = async () => {
    if (!sectionTitle.trim()) {
      alert('Please enter a section title');
      return;
    }

    const newSection = {
      name: sectionTitle,
      type: pendingSectionType,
      enabled: true,
      order: sections.length,
      data: getDefaultDataForType(pendingSectionType)
    };

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'insert',
          table: 'homepage_sections',
          data: {
            name: newSection.name,
            type: newSection.type,
            enabled: newSection.enabled ? 1 : 0,
            order_position: newSection.order,
            section_data: JSON.stringify(newSection.data)
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        newSection.id = result.insertId;
        setSections([...sections, newSection]);
        setSelectedSection(newSection);
        setView('section-edit');
        setShowTitleModal(false);
        setPendingSectionType(null);
      } else {
        alert('Failed to create section: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Error creating section. Please try again.');
    }
  };

  const deleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const token = getAuthToken();
      
      // First delete from collection_category table
      await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'soft_delete',
          table: 'collection_category',
          where: { section_id: id }
        })
      });

      // Then soft delete from homepage_sections
      const response = await fetch(`${API_URL}/doAll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'soft_delete',
          table: 'homepage_sections',
          where: { id: id }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSections(sections.filter(s => s.id !== id));
        if (selectedSection?.id === id) {
          setSelectedSection(null);
          setView('reorder');
        }
        alert('Section deleted successfully!');
      } else {
        alert('Failed to delete section: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section. Please try again.');
    }
  };

  const SectionEditor = ({ section }) => {
    const [formData, setFormData] = useState(() => {
      const sectionData = section.data || {};
      let items = sectionData.items || [];
      
      if (section.type === 'category-highlight' && items.length > 0) {
        items = items.map(item => ({
          ...item,
          id: item.id || Date.now() + Math.random(),
          title: item.title || '',
          image: item.image || '',
          selectedCategories: item.selectedCategories || [],
          selectedProducts: item.selectedProducts || []
        }));
      }
      
      if (section.type === 'hero' && items.length > 0) {
        items = items.map(item => ({
          ...item,
          selectedCategory: item.selectedCategory || null,
          redirectToCategory: item.redirectToCategory || false
        }));
      }
      
      if (section.type === 'collection' && items.length > 0) {
        items = items.map(item => ({
          ...item,
          redirectToCategory: item.redirectToCategory || false,
          images: item.images || ['', '', '', ''],
          imageCategories: item.imageCategories || [null, null, null, null]
        }));
      }
      
      return { ...sectionData, items };
    });
    
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const updateItem = (index, field, value) => {
      const newItems = [...(formData.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData({ ...formData, items: newItems });
    };

    const updateEntireItem = (index, updatedItem) => {
      const newItems = [...(formData.items || [])];
      newItems[index] = updatedItem;
      setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
      const newItem = getNewItemTemplate(section.type, (formData.items?.length || 0) + 1);
      setFormData({ 
        ...formData, 
        items: [...(formData.items || []), newItem] 
      });
    };

    const removeItem = (index) => {
      const newItems = (formData.items || []).filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    };

    const handleBulkUploadComplete = (paths) => {
      if (section.type === 'collection') {
        const newItems = [];
        for (let i = 0; i < paths.length; i += 4) {
          const itemImages = paths.slice(i, i + 4);
          while (itemImages.length < 4) {
            itemImages.push('');
          }
          
          const itemId = (formData.items?.length || 0) + newItems.length + 1;
          const template = getNewItemTemplate(section.type, itemId);
          newItems.push({ 
            ...template, 
            images: itemImages,
            title: `Collection ${itemId}`,
            subtitle: 'New collection'
          });
        }
        
        setFormData({
          ...formData,
          items: [...(formData.items || []), ...newItems]
        });
        setShowBulkUpload(false);
        
        alert(`${paths.length} images uploaded successfully! Please assign categories to each image.`);
      } else if (section.type === 'category-highlight') {
        const newItems = paths.map((url, idx) => {
          const itemId = (formData.items?.length || 0) + idx + 1;
          const template = getNewItemTemplate(section.type, itemId);
          return { ...template, image: url };
        });

        setFormData({
          ...formData,
          items: [...(formData.items || []), ...newItems]
        });
        setShowBulkUpload(false);
      }
    };

    const handleBulkCategoryAssignment = (itemIndex, categoriesArray) => {
      const newItems = [...(formData.items || [])];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        imageCategories: categoriesArray
      };
      setFormData({ ...formData, items: newItems });
    };

    const getNewItemTemplate = (type, id) => {
      switch (type) {
        case 'hero':
          return {
            id,
            type: 'image',
            title: '',
            subtitle: '',
            description: '',
            image: '',
            cta: 'Shop Now',
            ctaLink: '/',
            selectedCategory: null,
            redirectToCategory: false
          };
        // case 'feature-section':
        //   return {
        //     id,
        //     leftImage: '',
        //     rightImage: '',
        //     rightBottomImage: '',
        //     title: '',
        //     subtitle: ''
        //   };
        // In the getNewItemTemplate function, update the feature-section case:
case 'feature-section':
  return {
    id,
    leftImage: '',
    rightImage: '',
    rightBottomImage: '',
    title: '',
    subtitle: '',
    // Add category selection for each image
    leftImageCategory: null,
    rightImageCategory: null,
    rightBottomImageCategory: null
  };
        case 'collection':
          return {
            id,
            title: '',
            subtitle: '',
            images: ['', '', '', ''],
            cta: 'View Collection',
            ctaLink: '/collection',
            redirectToCategory: false,
            imageCategories: [null, null, null, null]
          };
        case 'category-highlight':
          return {
            id,
            title: '',
            image: '',
            selectedCategories: [],
            selectedProducts: []
          };
        case 'story-upload':
          return {
            id,
            title: '',
            subtitle: '',
            videos: ['', '', '', '']
          };
        default:
          return { id };
      }
    };

    const getImageUrl = (imagePath) => {
      if (!imagePath) return '';
      if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
        return imagePath;
      }
      return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-semibold text-lg">Hero Banner {idx + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      rows="2"
                    />
                  </div>
                  <ImageUpload 
                    currentValue={item.image}
                    onUpdate={(value) => updateItem(idx, 'image', value)}
                    label="Hero Image"
                    recommendedSize="1900×600"
                  />
                  
                  {/* Category Selection for Hero */}
                  <HeroCategorySelector 
                    item={item}
                    onUpdate={(updatedItem) => {
                      updateEntireItem(idx, updatedItem);
                    }}
                    categories={categories}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={item.cta}
                        onChange={(e) => updateItem(idx, 'cta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        disabled={item.redirectToCategory}
                        placeholder={item.redirectToCategory ? "Auto-generated from category" : "/shop"}
                      />
                      {item.redirectToCategory && (
                        <p className="text-xs text-gray-500 mt-1">
                          Link is automatically set to: /category/{item.selectedCategory}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Hero Banner
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          </div>
        );

      // case 'feature-section':
      //   return (
      //     <div className="space-y-6">
      //       {formData.items?.map((item, idx) => (
      //         <div key={idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
      //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      //             <h3 className="font-semibold text-lg">Feature Item {idx + 1}</h3>
      //             {formData.items.length > 1 && (
      //               <button
      //                 onClick={() => removeItem(idx)}
      //                 className="text-red-600 hover:text-red-700 self-end sm:self-auto"
      //               >
      //                 <Trash2 className="w-5 h-5" />
      //               </button>
      //             )}
      //           </div>
                
      //           <div className="space-y-4">
      //             <div>
      //               <label className="block text-sm font-medium mb-1">Title</label>
      //               <input
      //                 type="text"
      //                 value={item.title || ''}
      //                 onChange={(e) => updateItem(idx, 'title', e.target.value)}
      //                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
      //                 placeholder="e.g., rings collection description"
      //               />
      //             </div>
      //             <div>
      //               <label className="block text-sm font-medium mb-1">Subtitle</label>
      //               <input
      //                 type="text"
      //                 value={item.subtitle || ''}
      //                 onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
      //                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
      //                 placeholder="e.g., Discover our exclusive collection"
      //               />
      //             </div>
      //             <ImageUpload 
      //               currentValue={item.leftImage}
      //               onUpdate={(value) => updateItem(idx, 'leftImage', value)}
      //               label="Left Image"
      //             />
      //             <ImageUpload 
      //               currentValue={item.rightImage}
      //               onUpdate={(value) => updateItem(idx, 'rightImage', value)}
      //               label="Right Image"
      //             />
      //             <ImageUpload 
      //               currentValue={item.rightBottomImage}
      //               onUpdate={(value) => updateItem(idx, 'rightBottomImage', value)}
      //               label="Right Bottom Image"
      //             />
      //           </div>
      //         </div>
      //       ))}
            
      //       <button
      //         onClick={addItem}
      //         className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
      //       >
      //         <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
      //         Add Feature Item
      //       </button>
            
      //       <div className="flex flex-col sm:flex-row gap-3 pt-4">
      //         <button
      //           onClick={() => saveSection(section.id, formData)}
      //           className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
      //         >
      //           <Save className="w-4 h-4" />
      //           Save Changes
      //         </button>
      //         <button
      //           onClick={() => deleteSection(section.id)}
      //           className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
      //         >
      //           <Trash2 className="w-4 h-4" />
      //           Delete Section
      //         </button>
      //       </div>
      //     </div>
      //   );
      case 'feature-section':
  return (
    <div className="space-y-6">
      {formData.items?.map((item, idx) => (
        <div key={idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="font-semibold text-lg">Feature Item {idx + 1}</h3>
            {formData.items.length > 1 && (
              <button
                onClick={() => removeItem(idx)}
                className="text-red-600 hover:text-red-700 self-end sm:self-auto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateItem(idx, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="e.g., rings collection description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={item.subtitle || ''}
                onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="e.g., Discover our exclusive collection"
              />
            </div>
            
            {/* Left Image with Category */}
            <FeatureImageWithCategory
              imageType="leftImage"
              currentValue={item.leftImage}
              currentCategory={item.leftImageCategory}
              onImageUpdate={(value) => updateItem(idx, 'leftImage', value)}
              onCategoryUpdate={(value) => updateItem(idx, 'leftImageCategory', value)}
              categories={categories}
              label="Left Image"
            />
            
            {/* Right Image with Category */}
            <FeatureImageWithCategory
              imageType="rightImage"
              currentValue={item.rightImage}
              currentCategory={item.rightImageCategory}
              onImageUpdate={(value) => updateItem(idx, 'rightImage', value)}
              onCategoryUpdate={(value) => updateItem(idx, 'rightImageCategory', value)}
              categories={categories}
              label="Right Image"
            />
            
            {/* Right Bottom Image with Category */}
            <FeatureImageWithCategory
              imageType="rightBottomImage"
              currentValue={item.rightBottomImage}
              currentCategory={item.rightBottomImageCategory}
              onImageUpdate={(value) => updateItem(idx, 'rightBottomImage', value)}
              onCategoryUpdate={(value) => updateItem(idx, 'rightBottomImageCategory', value)}
              categories={categories}
              label="Right Bottom Image"
            />
            
            {/* Display selected categories summary */}
            {(item.leftImageCategory || item.rightImageCategory || item.rightBottomImageCategory) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Image Category Links:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {item.leftImageCategory && (
                    <div className="text-xs">
                      <span className="font-medium">Left Image:</span>{' '}
                      <span className="text-blue-600">
                        {categories.find(cat => cat.id === item.leftImageCategory)?.name}
                      </span>
                    </div>
                  )}
                  {item.rightImageCategory && (
                    <div className="text-xs">
                      <span className="font-medium">Right Image:</span>{' '}
                      <span className="text-blue-600">
                        {categories.find(cat => cat.id === item.rightImageCategory)?.name}
                      </span>
                    </div>
                  )}
                  {item.rightBottomImageCategory && (
                    <div className="text-xs">
                      <span className="font-medium">Right Bottom Image:</span>{' '}
                      <span className="text-blue-600">
                        {categories.find(cat => cat.id === item.rightBottomImageCategory)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <button
        onClick={addItem}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        Add Feature Item
      </button>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={() => saveSection(section.id, formData)}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={() => deleteSection(section.id)}
          className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Trash2 className="w-4 h-4" />
          Delete Section
        </button>
      </div>
    </div>
  );
      case 'collection':
        return (
          <div className="space-y-6">
            {/* Bulk Upload Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Bulk Upload (Max 10 images)</h3>
                <button
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="text-blue-600 hover:text-blue-700 text-sm self-end sm:self-auto"
                >
                  {showBulkUpload ? 'Hide' : 'Show'} Bulk Upload
                </button>
              </div>
              {showBulkUpload && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleBulkImageUpload(e, handleBulkUploadComplete)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="bulk-upload"
                  />
                  <label
                    htmlFor="bulk-upload"
                    className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Upload Multiple Images (Max 10)
                  </label>
                </div>
              )}
            </div>

            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-semibold text-lg">Collection {idx + 1}</h3>
                  {(formData.items?.length || 0) > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* Multiple Images Upload with Category Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Collection Images (Up to 4)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((imageIndex) => {
                        const imageCategory = item.imageCategories?.[imageIndex];
                        const category = categories.find(cat => cat.id === imageCategory);
                        
                        return (
                          <div key={imageIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-medium text-gray-500">
                                Image {imageIndex + 1}
                              </label>
                              {category && (
                                <span className="text-xs text-green-600 font-medium">
                                  {category.name}
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <ImageUpload
                                currentValue={item.images?.[imageIndex] || ''}
                                onUpdate={(value) => {
                                  const newImages = [...(item.images || ['', '', '', ''])];
                                  newImages[imageIndex] = value;
                                  updateItem(idx, 'images', newImages);
                                }}
                                label={`Image ${imageIndex + 1}`}
                              />
                              
                              {/* Category Selection for this specific image */}
                              {item.images?.[imageIndex] && (
                                <div className="border rounded-lg p-3 bg-gray-50">
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Link this image to category:
                                  </label>
                                  <select
                                    value={imageCategory || ''}
                                    onChange={(e) => {
                                      const newImageCategories = [...(item.imageCategories || [null, null, null, null])];
                                      newImageCategories[imageIndex] = e.target.value || null;
                                      updateItem(idx, 'imageCategories', newImageCategories);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                      </option>
                                    ))}
                                  </select>
                                  {category && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      This image will link to: <span className="font-medium">{category.name}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Category Selection for Collection - NEW: Each image can have its own category */}
                  <CollectionCategorySelector 
                    item={item}
                    onUpdate={(updatedItem) => {
                      updateEntireItem(idx, updatedItem);
                    }}
                    categories={categories}
                    onBulkCategoryAssignment={(categoriesArray) => {
                      handleBulkCategoryAssignment(idx, categoriesArray);
                    }}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={item.cta || ''}
                        onChange={(e) => updateItem(idx, 'cta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink || ''}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                        placeholder="/collection"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Collection
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          </div>
        );

      case 'category-highlight':
        return (
          <div className="space-y-6">
            {/* Bulk Upload Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Bulk Upload (Max 10 images)</h3>
                <button
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="text-blue-600 hover:text-blue-700 text-sm self-end sm:self-auto"
                >
                  {showBulkUpload ? 'Hide' : 'Show'} Bulk Upload
                </button>
              </div>
              {showBulkUpload && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleBulkImageUpload(e, handleBulkUploadComplete)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="bulk-upload"
                  />
                  <label
                    htmlFor="bulk-upload"
                    className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Upload Multiple Images (Max 10)
                  </label>
                </div>
              )}
            </div>

            {formData.items?.map((item, idx) => (
              <div key={item.id || idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-semibold text-lg">Category Highlight {idx + 1}</h3>
                  {(formData.items?.length || 0) > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      placeholder="Enter display title (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use category name
                    </p>
                  </div>
                  
                  {/* Main Category Image */}
                  <ImageUpload 
                    currentValue={item.image}
                    onUpdate={(value) => updateItem(idx, 'image', value)}
                    label="Category Image"
                  />
                  
                  {/* Category Selection */}
                  <CategorySelector 
                    item={item}
                    onUpdate={(updatedItem) => {
                      updateEntireItem(idx, updatedItem);
                    }}
                    categories={categories}
                  />
                  
                  {/* Product Selection */}
                  <ProductSelector
                    item={item}
                    onUpdate={(updatedItem) => {
                      updateEntireItem(idx, updatedItem);
                    }}
                    categories={categories}
                    products={products}
                  />
                  
                  {/* Display selected category info */}
                  {item.selectedCategories && item.selectedCategories.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Category:</strong> {
                          categories.find(cat => cat.id === item.selectedCategories[0])?.name
                        }
                      </p>
                      {item.selectedProducts && item.selectedProducts.length > 0 && (
                        <p className="text-sm text-green-800 mt-1">
                          <strong>Selected Products:</strong> {item.selectedProducts.length} products
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">
                        This will be stored in collection_category table with category_id: {item.selectedCategories[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Category Highlight
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          </div>
        );
        
      case 'story-upload':
        return (
          <div className="space-y-6">
            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-semibold text-lg">Story Upload {idx + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      placeholder="e.g., Our Stories"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      placeholder="e.g., Watch our latest video stories"
                    />
                  </div>
                  
                  {/* Multiple Video Uploads */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Story Videos (Up to 4)</label>
                    <p className="text-xs text-gray-500 mb-3">Maximum 50MB per video. Supported formats: MP4, WebM, OGG, MOV</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((videoIndex) => (
                        <div key={videoIndex} className="space-y-2">
                          <label className="block text-xs font-medium text-gray-500">
                            Video {videoIndex + 1}
                          </label>
                          <VideoUpload
                            currentValue={item.videos?.[videoIndex] || ''}
                            onUpdate={(value) => {
                              const newVideos = [...(item.videos || ['', '', '', ''])];
                              newVideos[videoIndex] = value;
                              updateItem(idx, 'videos', newVideos);
                            }}
                            label={`Video ${videoIndex + 1}`}
                            recommendedSize="Max 50MB"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Story Section
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Editor not available for this section type
          </div>
        );
    }
  };

  // Collection Slider Component - Updated to support individual image categories
  const CollectionSlider = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3) : 3;
    
    const nextSlide = () => {
      setCurrentIndex((prev) => 
        prev + itemsPerView >= items.length ? 0 : prev + 1
      );
    };
    
    const prevSlide = () => {
      setCurrentIndex((prev) => 
        prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
      );
    };
    
    const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);
    
    useEffect(() => {
      if (items.length <= itemsPerView) return;
      
      const timer = setInterval(() => {
        nextSlide();
      }, 4000);
      
      return () => clearInterval(timer);
    }, [items.length, currentIndex]);

    const getImageUrl = (imagePath) => {
      if (!imagePath) return '';
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const handleImageClick = (item, imageIndex) => {
      const categoryId = item.imageCategories?.[imageIndex];
      if (categoryId && item.redirectToCategory) {
        const category = categories.find(cat => cat.id === categoryId);
        alert(`Redirecting to category: ${category?.name || 'Unknown Category'}\nURL: /category/${categoryId}`);
      }
    };

    const renderImageGrid = (item) => {
      const images = item.images || [];
      const imageCategories = item.imageCategories || [null, null, null, null];
      
      return (
        <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {Array.from({ length: 4 }).map((_, imageIdx) => {
            const image = images[imageIdx];
            const categoryId = imageCategories[imageIdx];
            const category = categories.find(cat => cat.id === categoryId);
            
            return (
              <div 
                key={imageIdx} 
                className="relative overflow-hidden aspect-square bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => handleImageClick(item, imageIdx)}
              >
                {image ? (
                  <>
                    <img 
                      src={getImageUrl(image)} 
                      alt={`Collection image ${imageIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { 
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {category && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {category.name}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs rounded-lg">
                    No Image {imageIdx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };
    
    return (
      <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {visibleItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-lg overflow-hidden group p-3 sm:p-4 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  {/* Image Grid with individual category links */}
                  {renderImageGrid(item)}
                  
                  {/* Collection Title and Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{item.subtitle}</p>
                    )}
                    
                    {/* Category Links Summary */}
                    {item.redirectToCategory && item.imageCategories && item.imageCategories.some(cat => cat) && (
                      <div className="mb-2 sm:mb-3">
                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full mb-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Images linked to categories
                        </div>
                        <div className="text-xs text-gray-500">
                          Click on images to visit their linked categories
                        </div>
                      </div>
                    )}
                    
                    {item.cta && (
                      <button 
                        className="px-4 sm:px-6 py-1 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                      >
                        {item.cta}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows for Collection */}
            {items.length > itemsPerView && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors z-10"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors z-10"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots Indicator for Collection */}
          {items.length > itemsPerView && (
            <div className="flex justify-center mt-4 sm:mt-6 md:mt-8 space-x-1 sm:space-x-2">
              {Array.from({ length: Math.ceil(items.length / itemsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * itemsPerView)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    Math.floor(currentIndex / itemsPerView) === idx 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Preview Section Component - Updated to handle individual image categories and products
  const PreviewSection = ({ section }) => {
    const getImageUrl = (imagePath) => {
      if (!imagePath) return '';
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    if (!section.enabled || !section.data?.items?.length) return null;

    switch (section.type) {
      case 'hero':
        return (
          <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] overflow-hidden">
            {section.data.items.map((item, idx) => (
              <div key={idx} className="w-full h-full">
                {item.image && (
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.title || 'Hero'} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        );

      // case 'feature-section':
      //   return (
      //     <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      //       <div className="max-w-6xl mx-auto">
      //         {section.data.items?.map((item, idx) => (
      //           <div key={idx} className="mb-8 sm:mb-12 md:mb-16 last:mb-0">
      //             {(item.title || item.subtitle) && (
      //               <div className="text-center mb-6 sm:mb-8">
      //                 {item.title && (
      //                   <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">{item.title}</h2>
      //                 )}
      //                 {item.subtitle && (
      //                   <p className="text-base sm:text-lg md:text-xl text-gray-600">{item.subtitle}</p>
      //                 )}
      //               </div>
      //             )}
                  
      //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      //               <div className="lg:row-span-2">
      //                 {item.leftImage && (
      //                   <img 
      //                     src={getImageUrl(item.leftImage)} 
      //                     alt={item.title || 'Feature'} 
      //                     className="w-full h-full min-h-[300px] sm:min-h-[400px] object-cover rounded-lg sm:rounded-xl shadow-md"
      //                   />
      //                 )}
      //               </div>
                    
      //               <div className="space-y-4 sm:space-y-6">
      //                 {item.rightImage && (
      //                   <img 
      //                     src={getImageUrl(item.rightImage)} 
      //                     alt={`${item.title || 'Feature'} right top`} 
      //                     className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md"
      //                   />
      //                 )}
                      
      //                 {item.rightBottomImage && (
      //                   <img 
      //                     src={getImageUrl(item.rightBottomImage)} 
      //                     alt={`${item.title || 'Feature'} right bottom`} 
      //                     className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md"
      //                   />
      //                 )}
      //               </div>
      //             </div>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   );
      case 'feature-section':
  return (
    <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {section.data.items?.map((item, idx) => {
          
          // Helper function to handle image click with category
          const handleImageClick = (imageType) => {
            const categoryId = item[`${imageType}Category`];
            if (categoryId) {
              const category = categories.find(cat => cat.id === categoryId);
              alert(`Redirecting to category: ${category?.name || 'Unknown Category'}\nURL: /category/${categoryId}`);
            }
          };

          return (
            <div key={idx} className="mb-8 sm:mb-12 md:mb-16 last:mb-0">
              {(item.title || item.subtitle) && (
                <div className="text-center mb-6 sm:mb-8">
                  {item.title && (
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">{item.title}</h2>
                  )}
                  {item.subtitle && (
                    <p className="text-base sm:text-lg md:text-xl text-gray-600">{item.subtitle}</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Image */}
                <div 
                  className="lg:row-span-2 relative group cursor-pointer"
                  onClick={() => handleImageClick('leftImage')}
                >
                  {item.leftImage && (
                    <>
                      <img 
                        src={getImageUrl(item.leftImage)} 
                        alt={item.title || 'Feature'} 
                        className="w-full h-full min-h-[300px] sm:min-h-[400px] object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
                      />
                      {item.leftImageCategory && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Click to visit category
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Right Top Image */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick('rightImage')}
                  >
                    {item.rightImage && (
                      <>
                        <img 
                          src={getImageUrl(item.rightImage)} 
                          alt={`${item.title || 'Feature'} right top`} 
                          className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
                        />
                        {item.rightImageCategory && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Click to visit category
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Right Bottom Image */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick('rightBottomImage')}
                  >
                    {item.rightBottomImage && (
                      <>
                        <img 
                          src={getImageUrl(item.rightBottomImage)} 
                          alt={`${item.title || 'Feature'} right bottom`} 
                          className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
                        />
                        {item.rightBottomImageCategory && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Click to visit category
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Display category info summary */}
              {(item.leftImageCategory || item.rightImageCategory || item.rightBottomImageCategory) && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Click on images to visit linked categories
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

      case 'collection':
        return <CollectionSlider items={section.data.items} />;

      case 'category-highlight':
        return (
          <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12">{section.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {section.data.items?.map((item, idx) => {
                  const categoryId = item.selectedCategories?.[0];
                  const category = categories.find(cat => cat.id === categoryId);
                  
                  if (!category) return null;
                  
                  return (
                    <div key={item.id || idx} className="text-center cursor-pointer group">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-2 sm:mb-3">
                        {item.image && (
                          <img 
                            src={getImageUrl(item.image)} 
                            alt={category.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title || category.name}</h3>
                      {item.selectedProducts && item.selectedProducts.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.selectedProducts.length} featured products
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
        
      case 'story-upload':
        return (
          <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              {section.data.items?.map((item, idx) => (
                <div key={idx} className="mb-8 sm:mb-12 last:mb-0">
                  {(item.title || item.subtitle) && (
                    <div className="text-center mb-6 sm:mb-8">
                      {item.title && (
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                          {item.title}
                        </h2>
                      )}
                      {item.subtitle && (
                        <p className="text-base sm:text-lg md:text-xl text-gray-600">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(item.videos || []).map((video, videoIdx) => (
                      video ? (
                        <div key={videoIdx} className="relative bg-black rounded-lg overflow-hidden aspect-video">
                          <video
                            src={getImageUrl(video)}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div key={videoIdx} className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-gray-500">Video {videoIdx + 1}</p>
                            <p className="text-xs text-gray-400 mt-1">Not uploaded</p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading sections...</div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Homepage Preview</h1>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <EyeOff className="w-4 h-4" />
              Exit Preview
            </button>
          </div>
        </div>
        <div>
          {sections
            .filter(s => s.enabled)
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <PreviewSection key={section.id} section={section} />
            ))}
        </div>
      </div>
    );
  }

  if (view === 'reorder') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reorder Sections</h1>
          <div className="flex flex-col sm:flex-row gap-3 relative w-full sm:w-auto">
            <button
              onClick={() => setView('dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Drag and drop sections to reorder them on your homepage</p>
          
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 border-2 rounded-lg cursor-move hover:bg-gray-100 transition-colors ${
                  draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{section.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Order: {section.order + 1}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setView('section-edit');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'section-edit' && selectedSection) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit {selectedSection.name}</h1>
          <button
            onClick={() => {
              setView('dashboard');
              setSelectedSection(null);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <X className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <SectionEditor section={selectedSection} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {showTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Create New Section</h2>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Enter a title for your {pendingSectionType?.replace('-', ' ')} section
            </p>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Enter section title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 sm:mb-4 text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && confirmAddSection()}
              autoFocus
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTitleModal(false);
                  setPendingSectionType(null);
                  setSectionTitle('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base order-1 sm:order-2"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Home</h1>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Homepage Sections</h3>
        </div>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium text-sm sm:text-base truncate">{section.name}</span>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded ${
                  section.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {section.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSection(section);
                  setView('section-edit');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
              >
                Edit <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {sections.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">No sections configured yet.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center flex-wrap">
              <button
                onClick={() => addNewSection('hero')}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Create Hero Section
              </button>
              <button
                onClick={() => addNewSection('feature-section')}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base"
              >
                Create Feature Section
              </button>
              <button
                onClick={() => addNewSection('collection')}
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-purple-700 text-sm sm:text-base"
              >
                Create Collection
              </button>
              <button
                onClick={() => addNewSection('category-highlight')}
                className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-700 text-sm sm:text-base"
              >
                Create Category Highlight
              </button>
              <button
                onClick={() => addNewSection('story-upload')}
                className="bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-teal-700 text-sm sm:text-base"
              >
                Create Story Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;

// import React, { useState, useEffect } from "react";

// import {
//   FiMove,
//   FiPlus,
//   FiEdit,
//   FiTrash2,
//   FiSave,
//   FiX,
//   FiChevronDown,
//   FiEye,
//   FiEyeOff,
//   FiUpload,
//   FiLayout, // Changed from FiGrid to FiLayout (since FiGrid doesn't exist)
//   FiVideo,
//   FiImage,
//   FiTag,
//   FiLayers,
//   FiStar,
//   FiArrowLeft,
//   FiArrowRight,
//   FiCheck,
//   FiFolder,
//   FiShoppingBag,
// } from "react-icons/fi";

// import {
//   HiOutlinePhotograph,
//   HiOutlineCollection,
//   HiOutlineSparkles,
//   HiOutlineVideoCamera,
//   HiOutlineShoppingBag,
// } from "react-icons/hi";

// // ==================== CONSTANTS & UTILS ====================
// const SECTION_TYPES = {
//   HERO: "hero",
//   FEATURE: "feature-section",
//   COLLECTION: "collection",
//   CATEGORY_HIGHLIGHT: "category-highlight",
//   STORY: "story-upload",
// };

// const SECTION_CONFIG = {
//   [SECTION_TYPES.HERO]: {
//     name: "Hero Banner",
//     icon: <HiOutlineSparkles className="w-5 h-5" />,
//     color: "bg-emerald-500",
//     description: "Full-width banner with call-to-action",
//   },
//   [SECTION_TYPES.FEATURE]: {
//     name: "Feature Section",
//     icon: <FiLayout className="w-5 h-5" />,
//     color: "bg-green-500",
//     description: "Grid layout with multiple images",
//   },
//   [SECTION_TYPES.COLLECTION]: {
//     name: "Collection",
//     icon: <HiOutlineCollection className="w-5 h-5" />,
//     color: "bg-emerald-600",
//     description: "Product collections grid",
//   },
//   [SECTION_TYPES.CATEGORY_HIGHLIGHT]: {
//     name: "Category Highlight",
//     icon: <FiTag className="w-5 h-5" />,
//     color: "bg-green-600",
//     description: "Featured categories with products",
//   },
//   [SECTION_TYPES.STORY]: {
//     name: "Story Upload",
//     icon: <HiOutlineVideoCamera className="w-5 h-5" />,
//     color: "bg-emerald-700",
//     description: "Video stories gallery",
//   },
// };

// // ==================== UI COMPONENTS ====================

// // Button Components
// const PrimaryButton = ({
//   children,
//   onClick,
//   icon,
//   className = "",
//   disabled = false,
// }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className={`bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium 
//                 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2
//                 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
//   >
//     {icon && <span className="text-lg">{icon}</span>}
//     {children}
//   </button>
// );

// const SecondaryButton = ({
//   children,
//   onClick,
//   icon,
//   className = "",
//   variant = "gray",
// }) => {
//   const variantClasses = {
//     gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
//     red: "bg-red-50 text-red-700 hover:bg-red-100",
//     green: "bg-green-50 text-green-700 hover:bg-green-100",
//     emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`px-4 py-2.5 rounded-lg font-medium transition-colors 
//                   flex items-center justify-center gap-2 ${variantClasses[variant]} ${className}`}
//     >
//       {icon && <span className="text-lg">{icon}</span>}
//       {children}
//     </button>
//   );
// };

// // Card Components
// const SectionCard = ({ children, title, className = "" }) => (
//   <div
//     className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
//   >
//     {title && (
//       <div className="border-b border-gray-100 px-6 py-4">
//         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//       </div>
//     )}
//     <div className="p-6">{children}</div>
//   </div>
// );

// const DashboardCard = ({ title, description, icon, color, onClick }) => (
//   <div
//     onClick={onClick}
//     className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer 
//                hover:border-emerald-300 hover:shadow-md transition-all group"
//   >
//     <div className="flex items-start gap-4">
//       <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
//       <div className="flex-1">
//         <h4 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
//           {title}
//         </h4>
//         <p className="text-sm text-gray-500 mt-1">{description}</p>
//       </div>
//     </div>
//   </div>
// );

// // Form Components
// const FormInput = ({
//   label,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   className = "",
//   disabled = false,
// }) => (
//   <div className="space-y-2">
//     {label && (
//       <label className="block text-sm font-medium text-gray-700">{label}</label>
//     )}
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       disabled={disabled}
//       className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
//                  focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all
//                  disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
//     />
//   </div>
// );

// const FormTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
//   <div className="space-y-2">
//     {label && (
//       <label className="block text-sm font-medium text-gray-700">{label}</label>
//     )}
//     <textarea
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       rows={rows}
//       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
//                 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
//     />
//   </div>
// );

// // Status Components
// const StatusBadge = ({ active = true }) => (
//   <span
//     className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
//                    ${
//                      active
//                        ? "bg-green-100 text-green-800"
//                        : "bg-gray-100 text-gray-800"
//                    }`}
//   >
//     <span
//       className={`w-2 h-2 rounded-full mr-1.5 ${
//         active ? "bg-green-500" : "bg-gray-400"
//       }`}
//     ></span>
//     {active ? "Active" : "Inactive"}
//   </span>
// );

// // Modal Component
// const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
//   if (!isOpen) return null;

//   const sizeClasses = {
//     sm: "max-w-md",
//     md: "max-w-lg",
//     lg: "max-w-2xl",
//     xl: "max-w-4xl",
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div
//         className={`bg-white rounded-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
//       >
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <h3 className="text-lg font-bold text-gray-900">{title}</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <FiX className="w-5 h-5" />
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ==================== UPLOAD COMPONENTS ====================

// // Helper function for image URLs
// const getImageUrl = (imagePath) => {
//   if (!imagePath) return "";
//   const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL || "";
//   if (
//     imagePath.startsWith("http") ||
//     imagePath.startsWith("data:") ||
//     imagePath.startsWith("blob:")
//   ) {
//     return imagePath;
//   }
//   return `${BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
// };

// // ImageUpload Component
// const ImageUpload = ({
//   currentValue,
//   onUpdate,
//   label = "Image",
//   recommendedSize = "1900×600",
// }) => {
//   const [uploading, setUploading] = useState(false);
//   const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL;

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//     if (!validTypes.includes(file.type)) {
//       alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
//       return;
//     }

//     const maxSize = 10 * 1024 * 1024;
//     if (file.size > maxSize) {
//       alert("File size too large. Maximum size is 10MB");
//       return;
//     }

//     setUploading(true);
//     const previewUrl = URL.createObjectURL(file);
//     onUpdate(previewUrl);

//     try {
//       const formData = new FormData();
//       formData.append("images", file);

//       const token = localStorage.getItem("token");
//       const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;
//       const response = await fetch(`${API_URL}/upload-images`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const result = await response.json();

//       if (result.success && result.data.images?.length > 0) {
//         const serverPath = result.data.images[0].url;
//         onUpdate(serverPath);
//         URL.revokeObjectURL(previewUrl);
//       } else {
//         alert("Failed to upload image: " + (result.message || "Unknown error"));
//         onUpdate("");
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       alert("Error uploading image. Please try again.");
//       onUpdate("");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const renderImagePreview = () => {
//     const imageUrl = getImageUrl(currentValue);

//     return (
//       <div className="relative group rounded-lg overflow-hidden">
//         <img
//           src={imageUrl}
//           alt={`${label} preview`}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             e.target.style.display = "none";
//             e.target.nextElementSibling?.classList.remove("hidden");
//           }}
//         />
//         <div className="hidden w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
//           Failed to load image
//         </div>
//         <div
//           className="absolute inset-0 bg-emerald-900 bg-opacity-0 group-hover:bg-opacity-50 
//                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
//         >
//           <SecondaryButton
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               onUpdate("");
//             }}
//             variant="red"
//             icon={<FiTrash2 />}
//             className="px-3 py-1.5"
//           >
//             Remove
//           </SecondaryButton>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {label}
//         </label>
//         {recommendedSize && (
//           <span className="text-xs text-emerald-600 font-medium">
//             Recommended: {recommendedSize}
//           </span>
//         )}
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="flex-shrink-0">
//           <div
//             className={`relative overflow-hidden border-2 border-dashed rounded-xl
//                          ${
//                            currentValue
//                              ? "border-emerald-200"
//                              : "border-gray-200"
//                          } 
//                          w-32 h-32 flex items-center justify-center bg-gray-50`}
//           >
//             {currentValue ? (
//               renderImagePreview()
//             ) : (
//               <div className="text-center p-4">
//                 <HiOutlinePhotograph className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-xs text-gray-500">No image</p>
//               </div>
//             )}

//             {uploading && (
//               <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 space-y-4">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex-1">
//               <FormInput
//                 value={currentValue || ""}
//                 onChange={(e) => onUpdate(e.target.value)}
//                 placeholder="Enter image URL or upload below"
//                 disabled={uploading}
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 id={`file-upload-${label.replace(/\s+/g, "-")}`}
//                 disabled={uploading}
//               />
//               <label
//                 htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
//                 className={`block px-4 py-2.5 rounded-lg font-medium cursor-pointer text-center
//                           ${
//                             uploading
//                               ? "bg-gray-400 text-gray-200"
//                               : "bg-emerald-600 text-white hover:bg-emerald-700"
//                           } 
//                           transition-colors flex items-center justify-center gap-2 whitespace-nowrap`}
//               >
//                 {uploading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <FiUpload className="w-4 h-4" />
//                     Upload Image
//                   </>
//                 )}
//               </label>
//             </div>
//           </div>

//           {currentValue && (
//             <div className="flex items-center gap-2 text-sm">
//               <div className="flex items-center gap-1.5 text-emerald-600">
//                 <FiCheck className="w-4 h-4" />
//                 <span>Image uploaded successfully</span>
//               </div>
//               {currentValue.startsWith("blob:") && (
//                 <span className="text-amber-600">(Preview - uploading...)</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // VideoUpload Component
// const VideoUpload = ({
//   currentValue,
//   onUpdate,
//   label = "Video",
//   recommendedSize = "Max 50MB",
// }) => {
//   const [uploading, setUploading] = useState(false);

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const validTypes = [
//       "video/mp4",
//       "video/webm",
//       "video/ogg",
//       "video/quicktime",
//     ];
//     if (!validTypes.includes(file.type)) {
//       alert("Please upload a valid video file (MP4, WebM, OGG, or MOV)");
//       return;
//     }

//     const maxSize = 50 * 1024 * 1024;
//     if (file.size > maxSize) {
//       alert("File size too large. Maximum size is 50MB");
//       return;
//     }

//     setUploading(true);
//     const previewUrl = URL.createObjectURL(file);
//     onUpdate(previewUrl);

//     try {
//       const formData = new FormData();
//       formData.append("images", file);

//       const token = localStorage.getItem("token");
//       const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;

//       const response = await fetch(`${API_URL}/upload-images`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const result = await response.json();

//       if (result.success && result.data?.images?.length > 0) {
//         const serverPath = result.data.images[0].url;
//         onUpdate(serverPath);
//         URL.revokeObjectURL(previewUrl);
//       } else {
//         alert("Failed to upload video: " + (result.message || "Unknown error"));
//         onUpdate("");
//       }
//     } catch (error) {
//       console.error("Error uploading video:", error);
//       alert("Error uploading video. Please try again.");
//       onUpdate("");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const renderVideoPreview = () => {
//     const videoUrl = getImageUrl(currentValue);

//     return (
//       <div className="relative group rounded-lg overflow-hidden">
//         <video src={videoUrl} className="w-full h-full object-cover" controls />
//         <div
//           className="absolute inset-0 bg-emerald-900 bg-opacity-0 group-hover:bg-opacity-50 
//                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
//         >
//           <SecondaryButton
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               onUpdate("");
//             }}
//             variant="red"
//             icon={<FiTrash2 />}
//             className="px-3 py-1.5"
//           >
//             Remove
//           </SecondaryButton>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {label}
//         </label>
//         {recommendedSize && (
//           <span className="text-xs text-emerald-600 font-medium">
//             Recommended: {recommendedSize}
//           </span>
//         )}
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="flex-shrink-0">
//           <div
//             className={`relative overflow-hidden border-2 border-dashed rounded-xl
//                          ${
//                            currentValue
//                              ? "border-emerald-200"
//                              : "border-gray-200"
//                          } 
//                          w-32 h-32 flex items-center justify-center bg-gray-50`}
//           >
//             {currentValue ? (
//               renderVideoPreview()
//             ) : (
//               <div className="text-center p-4">
//                 <HiOutlineVideoCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-xs text-gray-500">No video</p>
//               </div>
//             )}

//             {uploading && (
//               <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 space-y-4">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex-1">
//               <FormInput
//                 value={currentValue || ""}
//                 onChange={(e) => onUpdate(e.target.value)}
//                 placeholder="Enter video URL or upload below"
//                 disabled={uploading}
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={handleFileUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 id={`video-upload-${label.replace(/\s+/g, "-")}`}
//                 disabled={uploading}
//               />
//               <label
//                 htmlFor={`video-upload-${label.replace(/\s+/g, "-")}`}
//                 className={`block px-4 py-2.5 rounded-lg font-medium cursor-pointer text-center
//                           ${
//                             uploading
//                               ? "bg-gray-400 text-gray-200"
//                               : "bg-emerald-600 text-white hover:bg-emerald-700"
//                           } 
//                           transition-colors flex items-center justify-center gap-2 whitespace-nowrap`}
//               >
//                 {uploading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <FiUpload className="w-4 h-4" />
//                     Upload Video
//                   </>
//                 )}
//               </label>
//             </div>
//           </div>

//           {currentValue && (
//             <div className="flex items-center gap-2 text-sm">
//               <div className="flex items-center gap-1.5 text-emerald-600">
//                 <FiCheck className="w-4 h-4" />
//                 <span>Video uploaded successfully</span>
//               </div>
//               {currentValue.startsWith("blob:") && (
//                 <span className="text-amber-600">(Preview - uploading...)</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==================== CATEGORY & PRODUCT COMPONENTS ====================

// // ProductSelector Component
// const ProductSelector = ({ item, onUpdate, categories, products }) => {
//   const [selectedProducts, setSelectedProducts] = useState(
//     item.selectedProducts || []
//   );
//   const [showProductSelector, setShowProductSelector] = useState(false);
//   const [availableProducts, setAvailableProducts] = useState([]);
//   const [loadingProducts, setLoadingProducts] = useState(false);

//   useEffect(() => {
//     setSelectedProducts(item.selectedProducts || []);
//   }, [item.selectedProducts]);

//   useEffect(() => {
//     if (item.selectedCategories?.[0]) {
//       loadProductsForCategory(item.selectedCategories[0]);
//     } else {
//       setAvailableProducts([]);
//     }
//   }, [item.selectedCategories]);

//   const loadProductsForCategory = async (categoryId) => {
//     setLoadingProducts(true);
//     try {
//       const token = localStorage.getItem("token");
//       const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;

//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "get",
//           table: "products",
//           where: {
//             category_id: categoryId,
//             is_deleted: 0,
//           },
//           limit: 50,
//         }),
//       });

//       const result = await response.json();
//       if (result.success && result.data) {
//         setAvailableProducts(result.data);
//       } else {
//         setAvailableProducts([]);
//       }
//     } catch (error) {
//       console.error("Error loading products:", error);
//       setAvailableProducts([]);
//     } finally {
//       setLoadingProducts(false);
//     }
//   };

//   const handleProductToggle = (productId) => {
//     const newSelectedProducts = selectedProducts.includes(productId)
//       ? selectedProducts.filter((id) => id !== productId)
//       : [...selectedProducts, productId];

//     setSelectedProducts(newSelectedProducts);

//     const updatedItem = {
//       ...item,
//       selectedProducts: newSelectedProducts,
//     };

//     onUpdate(updatedItem);
//   };

//   const getProductImage = (product) => {
//     if (!product.images) return "";
//     try {
//       const images = JSON.parse(product.images);
//       return images[0] || "";
//     } catch {
//       return "";
//     }
//   };

//   const selectedCategory = categories.find(
//     (cat) => cat.id === item.selectedCategories?.[0]
//   );

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <label className="block text-sm font-medium text-gray-700">
//           Featured Products
//         </label>
//         <button
//           type="button"
//           onClick={() => setShowProductSelector(true)}
//           className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={!item.selectedCategories?.[0] || loadingProducts}
//         >
//           {selectedProducts.length > 0
//             ? `Edit (${selectedProducts.length} selected)`
//             : "Select Products"}
//         </button>
//       </div>

//       {!item.selectedCategories?.[0] ? (
//         <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
//           <p className="text-sm text-amber-800">
//             Please select a category first to choose products
//           </p>
//         </div>
//       ) : (
//         <>
//           {selectedProducts.length > 0 ? (
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {selectedProducts.slice(0, 6).map((productId) => {
//                 const product = availableProducts.find(
//                   (p) => p.id === productId
//                 );
//                 if (!product) return null;

//                 return (
//                   <div
//                     key={productId}
//                     className="border border-gray-200 rounded-lg overflow-hidden"
//                   >
//                     <div className="aspect-square bg-gray-100">
//                       <img
//                         src={getImageUrl(getProductImage(product))}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.src =
//                             'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10">No Image</text></svg>';
//                         }}
//                       />
//                     </div>
//                     <div className="p-2 bg-gray-50 border-t">
//                       <p className="text-xs font-medium truncate">
//                         {product.name}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         ₹{product.price || "0"}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//               {selectedProducts.length > 6 && (
//                 <div className="col-span-2 md:col-span-1 flex items-center justify-center">
//                   <div className="text-center p-4">
//                     <p className="text-sm text-gray-600">
//                       +{selectedProducts.length - 6} more products
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
//               <p className="text-sm text-gray-600">
//                 No products selected. Click "Select Products" to choose products
//                 from {selectedCategory?.name}
//               </p>
//             </div>
//           )}
//         </>
//       )}

//       <Modal
//         isOpen={showProductSelector}
//         onClose={() => setShowProductSelector(false)}
//         title={`Select Products from ${selectedCategory?.name || "Category"}`}
//         size="xl"
//       >
//         {loadingProducts ? (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading products...</p>
//           </div>
//         ) : availableProducts.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             No products found in this category.
//           </div>
//         ) : (
//           <>
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-sm text-gray-600">
//                   {availableProducts.length} products available
//                 </p>
//                 {selectedProducts.length > 0 && (
//                   <p className="text-sm font-medium text-emerald-600">
//                     {selectedProducts.length} products selected
//                   </p>
//                 )}
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {availableProducts.map((product) => {
//                   const isSelected = selectedProducts.includes(product.id);
//                   const productImage = getProductImage(product);

//                   return (
//                     <div
//                       key={product.id}
//                       className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
//                         isSelected
//                           ? "border-emerald-500 ring-2 ring-emerald-200"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                       onClick={() => handleProductToggle(product.id)}
//                     >
//                       <div className="relative aspect-square bg-gray-100">
//                         {productImage ? (
//                           <img
//                             src={getImageUrl(productImage)}
//                             alt={product.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-gray-400">
//                             <HiOutlineShoppingBag className="w-8 h-8" />
//                           </div>
//                         )}

//                         {isSelected && (
//                           <div className="absolute top-2 right-2">
//                             <div className="bg-emerald-600 text-white rounded-full p-1">
//                               <FiCheck className="w-3 h-3" />
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       <div className="p-3">
//                         <p className="text-sm font-medium truncate">
//                           {product.name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           ₹{product.price || "0"}
//                         </p>
//                         <div className="flex items-center justify-between mt-2">
//                           <span className="text-xs text-gray-400">
//                             ID: {product.id}
//                           </span>
//                           {isSelected && (
//                             <span className="text-xs text-emerald-600 font-medium">
//                               Selected
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 pt-6 border-t">
//               <SecondaryButton
//                 onClick={() => setShowProductSelector(false)}
//                 icon={<FiX />}
//               >
//                 Cancel
//               </SecondaryButton>
//               <PrimaryButton
//                 onClick={() => setShowProductSelector(false)}
//                 icon={<FiCheck />}
//               >
//                 Save Selection
//               </PrimaryButton>
//             </div>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// };

// // HeroCategorySelector Component
// const HeroCategorySelector = ({ item, onUpdate, categories }) => {
//   const [selectedCategory, setSelectedCategory] = useState(
//     item.selectedCategory || null
//   );
//   const [redirectToCategory, setRedirectToCategory] = useState(
//     item.redirectToCategory || false
//   );

//   useEffect(() => {
//     setSelectedCategory(item.selectedCategory || null);
//     setRedirectToCategory(item.redirectToCategory || false);
//   }, [item.selectedCategory, item.redirectToCategory]);

//   const handleCategorySelect = (categoryId) => {
//     const newSelectedCategory =
//       selectedCategory === categoryId ? null : categoryId;
//     setSelectedCategory(newSelectedCategory);

//     const updatedItem = {
//       ...item,
//       selectedCategory: newSelectedCategory,
//     };

//     if (!updatedItem.cta && newSelectedCategory) {
//       const category = categories.find((cat) => cat.id === newSelectedCategory);
//       if (category) {
//         updatedItem.cta = `Shop ${category.name}`;
//       }
//     }

//     onUpdate(updatedItem);
//   };

//   const toggleRedirect = () => {
//     const newValue = !redirectToCategory;
//     setRedirectToCategory(newValue);

//     const updatedItem = {
//       ...item,
//       redirectToCategory: newValue,
//       ctaLink:
//         newValue && selectedCategory
//           ? `/category/${selectedCategory}`
//           : item.ctaLink || "/shop",
//     };

//     onUpdate(updatedItem);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <label className="block text-sm font-medium text-gray-700">
//           Category Link
//         </label>
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-600">Redirect to category</span>
//           <button
//             type="button"
//             onClick={toggleRedirect}
//             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
//               redirectToCategory ? "bg-emerald-600" : "bg-gray-300"
//             }`}
//           >
//             <span
//               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
//                 redirectToCategory ? "translate-x-6" : "translate-x-1"
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       {redirectToCategory ? (
//         <div className="space-y-4">
//           <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//             <div className="flex items-start gap-3">
//               <div className="text-emerald-600">
//                 <FiCheck className="w-5 h-5" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-emerald-900">
//                   Redirect Enabled
//                 </p>
//                 <p className="text-sm text-emerald-700 mt-1">
//                   Clicking this banner will redirect to the selected category
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               Select Category for Redirect
//             </label>

//             {selectedCategory && (
//               <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
//                 <p className="text-sm text-green-800">
//                   <span className="font-medium">Selected Category:</span>{" "}
//                   {categories.find((cat) => cat.id === selectedCategory)
//                     ?.name || "Unknown Category"}
//                 </p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
//               {categories.map((category) => (
//                 <div
//                   key={category.id}
//                   className={`border rounded-xl p-4 cursor-pointer transition-all ${
//                     selectedCategory === category.id
//                       ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
//                       : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
//                   }`}
//                   onClick={() => handleCategorySelect(category.id)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                         selectedCategory === category.id
//                           ? "border-emerald-500 bg-emerald-500"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       {selectedCategory === category.id && (
//                         <FiCheck className="w-3 h-3 text-white" />
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <span className="font-medium text-gray-900 block">
//                         {category.name}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         ID: {category.id}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
//           <p className="text-sm text-gray-600">
//             Category redirect is disabled. The CTA button will use the custom
//             link below.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// // FeatureImageWithCategory Component
// const FeatureImageWithCategory = ({
//   imageType,
//   currentValue,
//   currentCategory,
//   onImageUpdate,
//   onCategoryUpdate,
//   categories,
//   label,
// }) => {
//   const [showCategoryPicker, setShowCategoryPicker] = useState(false);

//   const handleCategorySelect = (categoryId) => {
//     onCategoryUpdate(categoryId);
//     setShowCategoryPicker(false);
//   };

//   const selectedCategory = categories.find((cat) => cat.id === currentCategory);

//   return (
//     <div className="space-y-3">
//       <label className="block text-sm font-medium text-gray-700">{label}</label>

//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="flex-1">
//           <ImageUpload
//             currentValue={currentValue}
//             onUpdate={onImageUpdate}
//             label=""
//             recommendedSize=""
//           />
//         </div>

//         {currentValue && (
//           <div className="lg:w-64">
//             <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Link image to category
//                 </label>
//                 {selectedCategory && (
//                   <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
//                     <FiCheck className="w-3 h-3" />
//                     {selectedCategory.name}
//                   </span>
//                 )}
//               </div>

//               <div
//                 className={`border rounded-lg p-3 cursor-pointer transition-colors ${
//                   selectedCategory
//                     ? "border-emerald-300 bg-emerald-50"
//                     : "border-gray-300 hover:border-gray-400"
//                 }`}
//                 onClick={() => setShowCategoryPicker(true)}
//               >
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-700">
//                     {selectedCategory
//                       ? selectedCategory.name
//                       : "Select Category"}
//                   </span>
//                   <FiChevronDown className="w-4 h-4 text-gray-500" />
//                 </div>
//               </div>

//               {selectedCategory && (
//                 <div className="mt-2 text-xs text-gray-600">
//                   This image will link to:{" "}
//                   <span className="font-medium text-emerald-700">
//                     {selectedCategory.name}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <Modal
//         isOpen={showCategoryPicker}
//         onClose={() => setShowCategoryPicker(false)}
//         title={`Select Category for ${label}`}
//       >
//         {currentValue && (
//           <div className="mb-6">
//             <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden border">
//               <img
//                 src={getImageUrl(currentValue)}
//                 alt={`${label} preview`}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <p className="text-sm text-center text-gray-600">
//               Choose which category this image should link to
//             </p>
//           </div>
//         )}

//         <div className="max-h-72 overflow-y-auto p-2">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {categories.map((category) => (
//               <div
//                 key={category.id}
//                 className={`border rounded-xl p-4 cursor-pointer transition-all ${
//                   currentCategory === category.id
//                     ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
//                     : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
//                 }`}
//                 onClick={() => handleCategorySelect(category.id)}
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                       currentCategory === category.id
//                         ? "border-emerald-500 bg-emerald-500"
//                         : "border-gray-300"
//                     }`}
//                   >
//                     {currentCategory === category.id && (
//                       <FiCheck className="w-3 h-3 text-white" />
//                     )}
//                   </div>
//                   <span className="text-sm font-medium text-gray-900">
//                     {category.name}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
//           <SecondaryButton
//             onClick={() => setShowCategoryPicker(false)}
//             icon={<FiX />}
//           >
//             Cancel
//           </SecondaryButton>
//           <PrimaryButton
//             onClick={() => setShowCategoryPicker(false)}
//             icon={<FiCheck />}
//           >
//             {currentCategory ? "Confirm" : "Skip"}
//           </PrimaryButton>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// // CollectionCategorySelector Component
// const CollectionCategorySelector = ({
//   item,
//   onUpdate,
//   categories,
//   onBulkCategoryAssignment,
// }) => {
//   const [redirectToCategory, setRedirectToCategory] = useState(
//     item.redirectToCategory || false
//   );
//   const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState(
//     item.imageCategories || Array(4).fill(null)
//   );

//   useEffect(() => {
//     setRedirectToCategory(item.redirectToCategory || false);
//     setSelectedCategories(item.imageCategories || Array(4).fill(null));
//   }, [item.redirectToCategory, item.imageCategories]);

//   const toggleRedirect = () => {
//     const newValue = !redirectToCategory;
//     setRedirectToCategory(newValue);

//     const updatedItem = {
//       ...item,
//       redirectToCategory: newValue,
//       ctaLink: newValue ? item.ctaLink || "/collection" : item.ctaLink,
//     };

//     onUpdate(updatedItem);
//   };

//   const handleImageCategorySelect = (imageIndex, categoryId) => {
//     const newSelectedCategories = [...selectedCategories];
//     newSelectedCategories[imageIndex] = categoryId;
//     setSelectedCategories(newSelectedCategories);

//     const updatedItem = {
//       ...item,
//       imageCategories: newSelectedCategories,
//     };

//     onUpdate(updatedItem);
//   };

//   const handleBulkAssign = () => {
//     if (onBulkCategoryAssignment) {
//       onBulkCategoryAssignment(selectedCategories);
//       setShowBulkAssignModal(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <label className="block text-sm font-medium text-gray-700">
//           Image Category Links
//         </label>
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-600">Enable category links</span>
//           <button
//             type="button"
//             onClick={toggleRedirect}
//             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
//               redirectToCategory ? "bg-emerald-600" : "bg-gray-300"
//             }`}
//           >
//             <span
//               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
//                 redirectToCategory ? "translate-x-6" : "translate-x-1"
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       {redirectToCategory ? (
//         <div className="space-y-4">
//           <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//             <div className="flex items-start gap-3">
//               <div className="text-emerald-600">
//                 <FiCheck className="w-5 h-5" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-emerald-900">
//                   Category Links Enabled
//                 </p>
//                 <p className="text-sm text-emerald-700 mt-1">
//                   Each image can be linked to a different category
//                 </p>
//                 <button
//                   onClick={() => setShowBulkAssignModal(true)}
//                   className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
//                 >
//                   Bulk assign categories to all images →
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[0, 1, 2, 3].map((imageIndex) => (
//               <div key={imageIndex} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Image {imageIndex + 1} Category
//                   </label>
//                   {selectedCategories[imageIndex] && (
//                     <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
//                       <FiCheck className="w-3 h-3" />
//                       Linked
//                     </span>
//                   )}
//                 </div>

//                 {item.images?.[imageIndex] ? (
//                   <div className="relative">
//                     <div
//                       className="border rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors"
//                       onClick={() => {
//                         const categoryId = selectedCategories[imageIndex];
//                         if (categoryId) {
//                           const category = categories.find(
//                             (cat) => cat.id === categoryId
//                           );
//                           alert(
//                             `Image ${imageIndex + 1} linked to: ${
//                               category?.name
//                             }`
//                           );
//                         }
//                       }}
//                     >
//                       <div className="aspect-square bg-gray-100 relative">
//                         <img
//                           src={getImageUrl(item.images[imageIndex])}
//                           alt={`Image ${imageIndex + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                         {selectedCategories[imageIndex] && (
//                           <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
//                             <FiCheck className="w-2 h-2" />
//                             Linked
//                           </div>
//                         )}
//                       </div>
//                       <div className="p-3 bg-gray-50 border-t">
//                         <select
//                           value={selectedCategories[imageIndex] || ""}
//                           onChange={(e) => {
//                             const newCategories = [...selectedCategories];
//                             newCategories[imageIndex] = e.target.value || null;
//                             setSelectedCategories(newCategories);
//                           }}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         >
//                           <option value="">Select Category</option>
//                           {categories.map((category) => (
//                             <option key={category.id} value={category.id}>
//                               {category.name}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
//                     <p className="text-sm text-gray-500">
//                       Upload an image first to select a category
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <Modal
//             isOpen={showBulkAssignModal}
//             onClose={() => setShowBulkAssignModal(false)}
//             title="Bulk Assign Categories"
//             size="lg"
//           >
//             <p className="text-gray-600 mb-6">
//               Assign categories to all 4 images at once. Each image can have a
//               different category.
//             </p>

//             <div className="space-y-4">
//               {[0, 1, 2, 3].map((imageIndex) => {
//                 const imageUrl = item.images?.[imageIndex];
//                 return (
//                   <div
//                     key={imageIndex}
//                     className="border border-gray-200 rounded-xl p-4"
//                   >
//                     <div className="flex flex-col md:flex-row gap-4">
//                       <div className="flex-shrink-0">
//                         <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-100">
//                           {imageUrl ? (
//                             <img
//                               src={getImageUrl(imageUrl)}
//                               alt={`Image ${imageIndex + 1}`}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-400">
//                               <HiOutlinePhotograph className="w-8 h-8" />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-medium text-gray-900 mb-3">
//                           Image {imageIndex + 1}
//                         </h4>
//                         <select
//                           value={selectedCategories[imageIndex] || ""}
//                           onChange={(e) => {
//                             const newCategories = [...selectedCategories];
//                             newCategories[imageIndex] = e.target.value || null;
//                             setSelectedCategories(newCategories);
//                           }}
//                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 
//                                    focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
//                         >
//                           <option value="">Select Category</option>
//                           {categories.map((category) => (
//                             <option key={category.id} value={category.id}>
//                               {category.name}
//                             </option>
//                           ))}
//                         </select>
//                         {selectedCategories[imageIndex] && (
//                           <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
//                             <FiCheck className="w-4 h-4" />
//                             Selected:{" "}
//                             {
//                               categories.find(
//                                 (cat) =>
//                                   cat.id === selectedCategories[imageIndex]
//                               )?.name
//                             }
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
//               <SecondaryButton
//                 onClick={() => setShowBulkAssignModal(false)}
//                 icon={<FiX />}
//               >
//                 Cancel
//               </SecondaryButton>
//               <PrimaryButton onClick={handleBulkAssign} icon={<FiCheck />}>
//                 Apply to All Images
//               </PrimaryButton>
//             </div>
//           </Modal>
//         </div>
//       ) : (
//         <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
//           <p className="text-sm text-gray-600">
//             Category links are disabled. Images will not link to categories.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// // CategorySelector Component
// const CategorySelector = ({ item, onUpdate, categories }) => {
//   const [selectedCategory, setSelectedCategory] = useState(
//     item.selectedCategories?.[0] || null
//   );

//   useEffect(() => {
//     setSelectedCategory(item.selectedCategories?.[0] || null);
//   }, [item.selectedCategories]);

//   const handleCategorySelect = (categoryId) => {
//     const newSelectedCategory =
//       selectedCategory === categoryId ? null : categoryId;
//     setSelectedCategory(newSelectedCategory);

//     const updatedItem = {
//       ...item,
//       selectedCategories: newSelectedCategory ? [newSelectedCategory] : [],
//       selectedProducts: [], // Clear products when category changes
//     };

//     if (!updatedItem.title && newSelectedCategory) {
//       const category = categories.find((cat) => cat.id === newSelectedCategory);
//       if (category) {
//         updatedItem.title = category.name;
//       }
//     }

//     onUpdate(updatedItem);
//   };

//   return (
//     <div className="space-y-4">
//       <label className="block text-sm font-medium text-gray-700">
//         Select Category <span className="text-red-500">*</span>
//       </label>

//       {selectedCategory && (
//         <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//           <div className="flex items-center gap-3">
//             <div className="text-emerald-600">
//               <FiCheck className="w-5 h-5" />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-emerald-900">
//                 Category Selected
//               </p>
//               <p className="text-sm text-emerald-700">
//                 {categories.find((cat) => cat.id === selectedCategory)?.name ||
//                   "Unknown Category"}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {categories.length === 0 ? (
//         <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
//           <p className="text-sm text-gray-600">
//             No categories found. Please create categories in the Products
//             section first.
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-2">
//           {categories.map((category) => (
//             <div
//               key={category.id}
//               className={`border rounded-xl p-4 cursor-pointer transition-all ${
//                 selectedCategory === category.id
//                   ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
//                   : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
//               }`}
//               onClick={() => handleCategorySelect(category.id)}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                     selectedCategory === category.id
//                       ? "border-emerald-500 bg-emerald-500"
//                       : "border-gray-300"
//                   }`}
//                 >
//                   {selectedCategory === category.id && (
//                     <FiCheck className="w-3 h-3 text-white" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <span className="font-medium text-gray-900 block">
//                     {category.name}
//                   </span>
//                   <span className="text-xs text-gray-500">
//                     ID: {category.id}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ==================== PREVIEW COMPONENTS ====================

// // CollectionSlider Component
// const CollectionSlider = ({ items, categories = [] }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const itemsPerView =
//     typeof window !== "undefined"
//       ? window.innerWidth < 640
//         ? 1
//         : window.innerWidth < 1024
//         ? 2
//         : 3
//       : 3;

//   const nextSlide = () => {
//     setCurrentIndex((prev) =>
//       prev + itemsPerView >= items.length ? 0 : prev + 1
//     );
//   };

//   const prevSlide = () => {
//     setCurrentIndex((prev) =>
//       prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
//     );
//   };

//   const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

//   useEffect(() => {
//     if (items.length <= itemsPerView) return;

//     const timer = setInterval(() => {
//       nextSlide();
//     }, 4000);

//     return () => clearInterval(timer);
//   }, [items.length, currentIndex]);

//   const renderImageGrid = (item) => {
//     const images = item.images || [];
//     const imageCategories = item.imageCategories || [null, null, null, null];

//     return (
//       <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
//         {Array.from({ length: 4 }).map((_, imageIdx) => {
//           const image = images[imageIdx];
//           const categoryId = imageCategories[imageIdx];
//           const category = categories.find((cat) => cat.id === categoryId);

//           return (
//             <div
//               key={imageIdx}
//               className="relative overflow-hidden aspect-square bg-gray-100 rounded-lg cursor-pointer"
//               onClick={() => {
//                 if (categoryId && item.redirectToCategory) {
//                   alert(
//                     `Redirecting to category: ${
//                       category?.name || "Unknown Category"
//                     }`
//                   );
//                 }
//               }}
//             >
//               {image ? (
//                 <>
//                   <img
//                     src={getImageUrl(image)}
//                     alt={`Collection image ${imageIdx + 1}`}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                   />
//                   {category && (
//                     <div className="absolute top-1 left-1 bg-emerald-600 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
//                       <FiChevronDown className="w-2 h-2" />
//                       {category.name}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs rounded-lg">
//                   No Image {imageIdx + 1}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
//       <div className="max-w-6xl mx-auto">
//         <div className="relative">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//             {visibleItems.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="bg-white rounded-lg overflow-hidden group p-3 sm:p-4 border border-gray-100 hover:shadow-lg transition-shadow"
//               >
//                 {renderImageGrid(item)}

//                 <div className="text-center">
//                   <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
//                     {item.title}
//                   </h3>
//                   {item.subtitle && (
//                     <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
//                       {item.subtitle}
//                     </p>
//                   )}

//                   {item.redirectToCategory &&
//                     item.imageCategories &&
//                     item.imageCategories.some((cat) => cat) && (
//                       <div className="mb-2 sm:mb-3">
//                         <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full mb-2">
//                           <FiChevronDown className="w-3 h-3" />
//                           Images linked to categories
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           Click on images to visit their linked categories
//                         </div>
//                       </div>
//                     )}

//                   {item.cta && (
//                     <button className="px-4 sm:px-6 py-1 sm:py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs sm:text-sm">
//                       {item.cta}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {items.length > itemsPerView && (
//             <>
//               <button
//                 onClick={prevSlide}
//                 className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors z-10"
//               >
//                 <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
//               </button>
//               <button
//                 onClick={nextSlide}
//                 className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-50 transition-colors z-10"
//               >
//                 <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//               </button>
//             </>
//           )}
//         </div>

//         {items.length > itemsPerView && (
//           <div className="flex justify-center mt-4 sm:mt-6 md:mt-8 space-x-1 sm:space-x-2">
//             {Array.from({ length: Math.ceil(items.length / itemsPerView) }).map(
//               (_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentIndex(idx * itemsPerView)}
//                   className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
//                     Math.floor(currentIndex / itemsPerView) === idx
//                       ? "bg-emerald-600"
//                       : "bg-gray-300"
//                   }`}
//                 />
//               )
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // PreviewSection Component
// const PreviewSection = ({ section, categories = [] }) => {
//   if (!section.enabled || !section.data?.items?.length) return null;

//   switch (section.type) {
//     case SECTION_TYPES.HERO:
//       return (
//         <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
//           {section.data.items.map((item, idx) => (
//             <div key={idx} className="w-full h-full">
//               {item.image && (
//                 <img
//                   src={getImageUrl(item.image)}
//                   alt={item.title || "Hero"}
//                   className="w-full h-full object-cover"
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       );

//     case SECTION_TYPES.FEATURE:
//       return (
//         <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             {section.data.items?.map((item, idx) => (
//               <div key={idx} className="mb-8 sm:mb-12 md:mb-16 last:mb-0">
//                 {(item.title || item.subtitle) && (
//                   <div className="text-center mb-6 sm:mb-8">
//                     {item.title && (
//                       <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
//                         {item.title}
//                       </h2>
//                     )}
//                     {item.subtitle && (
//                       <p className="text-base sm:text-lg md:text-xl text-gray-600">
//                         {item.subtitle}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//                   <div
//                     className="lg:row-span-2 relative group cursor-pointer"
//                     onClick={() => {
//                       if (item.leftImageCategory) {
//                         const category = categories.find(
//                           (cat) => cat.id === item.leftImageCategory
//                         );
//                         alert(
//                           `Redirecting to category: ${
//                             category?.name || "Unknown Category"
//                           }`
//                         );
//                       }
//                     }}
//                   >
//                     {item.leftImage && (
//                       <>
//                         <img
//                           src={getImageUrl(item.leftImage)}
//                           alt={item.title || "Feature"}
//                           className="w-full h-full min-h-[300px] sm:min-h-[400px] object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
//                         />
//                         {item.leftImageCategory && (
//                           <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <FiChevronDown className="w-2 h-2" />
//                             Click to visit category
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>

//                   <div className="space-y-4 sm:space-y-6">
//                     <div
//                       className="relative group cursor-pointer"
//                       onClick={() => {
//                         if (item.rightImageCategory) {
//                           const category = categories.find(
//                             (cat) => cat.id === item.rightImageCategory
//                           );
//                           alert(
//                             `Redirecting to category: ${
//                               category?.name || "Unknown Category"
//                             }`
//                           );
//                         }
//                       }}
//                     >
//                       {item.rightImage && (
//                         <>
//                           <img
//                             src={getImageUrl(item.rightImage)}
//                             alt={`${item.title || "Feature"} right top`}
//                             className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
//                           />
//                           {item.rightImageCategory && (
//                             <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <FiChevronDown className="w-2 h-2" />
//                               Click to visit category
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>

//                     <div
//                       className="relative group cursor-pointer"
//                       onClick={() => {
//                         if (item.rightBottomImageCategory) {
//                           const category = categories.find(
//                             (cat) => cat.id === item.rightBottomImageCategory
//                           );
//                           alert(
//                             `Redirecting to category: ${
//                               category?.name || "Unknown Category"
//                             }`
//                           );
//                         }
//                       }}
//                     >
//                       {item.rightBottomImage && (
//                         <>
//                           <img
//                             src={getImageUrl(item.rightBottomImage)}
//                             alt={`${item.title || "Feature"} right bottom`}
//                             className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:opacity-90 transition-opacity"
//                           />
//                           {item.rightBottomImageCategory && (
//                             <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <FiChevronDown className="w-2 h-2" />
//                               Click to visit category
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {(item.leftImageCategory ||
//                   item.rightImageCategory ||
//                   item.rightBottomImageCategory) && (
//                   <div className="mt-4 text-center">
//                     <p className="text-xs text-gray-500">
//                       Click on images to visit linked categories
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       );

//     case SECTION_TYPES.COLLECTION:
//       return (
//         <CollectionSlider items={section.data.items} categories={categories} />
//       );

//     case SECTION_TYPES.CATEGORY_HIGHLIGHT:
//       return (
//         <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12">
//               {section.name}
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
//               {section.data.items?.map((item, idx) => {
//                 const categoryId = item.selectedCategories?.[0];
//                 const category = categories.find(
//                   (cat) => cat.id === categoryId
//                 );

//                 if (!category) return null;

//                 return (
//                   <div
//                     key={item.id || idx}
//                     className="text-center cursor-pointer group"
//                     onClick={() => {
//                       alert(`Redirecting to category: ${category.name}`);
//                     }}
//                   >
//                     <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-2 sm:mb-3">
//                       {item.image && (
//                         <img
//                           src={getImageUrl(item.image)}
//                           alt={category.name}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                       )}
//                     </div>
//                     <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
//                       {item.title || category.name}
//                     </h3>
//                     {item.selectedProducts &&
//                       item.selectedProducts.length > 0 && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           {item.selectedProducts.length} featured products
//                         </p>
//                       )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       );

//     case SECTION_TYPES.STORY:
//       return (
//         <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
//           <div className="max-w-6xl mx-auto">
//             {section.data.items?.map((item, idx) => (
//               <div key={idx} className="mb-8 sm:mb-12 last:mb-0">
//                 {(item.title || item.subtitle) && (
//                   <div className="text-center mb-6 sm:mb-8">
//                     {item.title && (
//                       <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
//                         {item.title}
//                       </h2>
//                     )}
//                     {item.subtitle && (
//                       <p className="text-base sm:text-lg md:text-xl text-gray-600">
//                         {item.subtitle}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//                   {(item.videos || []).map((video, videoIdx) =>
//                     video ? (
//                       <div
//                         key={videoIdx}
//                         className="relative bg-black rounded-lg overflow-hidden aspect-video"
//                       >
//                         <video
//                           src={getImageUrl(video)}
//                           className="w-full h-full object-cover"
//                           controls
//                           playsInline
//                           preload="metadata"
//                         />
//                       </div>
//                     ) : (
//                       <div
//                         key={videoIdx}
//                         className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
//                       >
//                         <div className="text-center p-4">
//                           <HiOutlineVideoCamera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
//                           <p className="text-xs sm:text-sm text-gray-500">
//                             Video {videoIdx + 1}
//                           </p>
//                           <p className="text-xs text-gray-400 mt-1">
//                             Not uploaded
//                           </p>
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     default:
//       return null;
//   }
// };

// // ==================== MAIN COMPONENT ====================

// const Homepage = () => {
//   const [view, setView] = useState("dashboard");
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showAddSectionDropdown, setShowAddSectionDropdown] = useState(false);
//   const [showTitleModal, setShowTitleModal] = useState(false);
//   const [pendingSectionType, setPendingSectionType] = useState(null);
//   const [sectionTitle, setSectionTitle] = useState("");
//   const [sections, setSections] = useState([]);
//   const [draggedIndex, setDraggedIndex] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showPreview, setShowPreview] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);

//   const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;

//   const getAuthToken = () => localStorage.getItem("token");

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "get",
//           table: "category",
//         }),
//       });
//       const result = await response.json();
//       return result.success ? result.data : [];
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       return [];
//     }
//   };

//   // Fetch products
//   const fetchProducts = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "get",
//           table: "products",
//           where: { is_deleted: 0 },
//           limit: 200,
//         }),
//       });
//       const result = await response.json();
//       return result.success ? result.data : [];
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       return [];
//     }
//   };

//   // Load sections
//   const loadSections = async () => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();

//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "get",
//           table: "homepage_sections",
//           order_by: { order_position: "ASC" },
//         }),
//       });

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);
//       const result = await response.json();

//       if (!result.success)
//         throw new Error(result.message || "API returned unsuccessful response");

//       if (result.data?.length > 0) {
//         const loadedSections = await Promise.all(
//           result.data.map(async (row) => {
//             try {
//               const sectionData = JSON.parse(row.section_data || "{}");

//               if (row.type === SECTION_TYPES.CATEGORY_HIGHLIGHT) {
//                 sectionData.items = [];

//                 if (sectionData.items && sectionData.items.length > 0) {
//                   const categoryResponse = await fetch(`${API_URL}/doAll`, {
//                     method: "POST",
//                     headers: {
//                       "Content-Type": "application/json",
//                       Authorization: `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({
//                       action: "get",
//                       table: "collection_category",
//                       where: {
//                         section_id: row.id,
//                         is_deleted: 0,
//                       },
//                       order_by: { display_order: "ASC" },
//                     }),
//                   });

//                   if (categoryResponse.ok) {
//                     const categoryResult = await categoryResponse.json();
//                     if (
//                       categoryResult.success &&
//                       categoryResult.data?.length > 0
//                     ) {
//                       sectionData.items = categoryResult.data.map(
//                         (catItem) => ({
//                           id: catItem.id,
//                           title: catItem.title || "",
//                           image: JSON.parse(catItem.images || "[]")[0] || "",
//                           selectedCategories: [catItem.category_id],
//                           selectedProducts: JSON.parse(
//                             catItem.selected_products || "[]"
//                           ),
//                         })
//                       );
//                     }
//                   }
//                 }
//               }

//               return {
//                 id: row.id,
//                 name: row.name,
//                 type: row.type,
//                 enabled: row.enabled === 1,
//                 order: row.order_position,
//                 data: sectionData,
//               };
//             } catch (error) {
//               console.error(`Error processing section ${row.id}:`, error);
//               return {
//                 id: row.id,
//                 name: row.name,
//                 type: row.type,
//                 enabled: row.enabled === 1,
//                 order: row.order_position,
//                 data: { items: [] },
//               };
//             }
//           })
//         );

//         setSections(loadedSections.filter((section) => section !== null));
//       } else {
//         setSections([]);
//       }
//     } catch (error) {
//       console.error("Error loading sections:", error);
//       alert("Failed to load sections from database: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSections();
//     fetchCategories().then(setCategories);
//     fetchProducts().then(setProducts);
//   }, []);

//   const handleBulkImageUpload = async (e, onSuccess) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;
//     if (files.length > 10) {
//       alert("Maximum 10 images allowed");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       files.forEach((file) => formData.append("images", file));

//       const token = getAuthToken();
//       const response = await fetch(`${API_URL}/upload-images`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const result = await response.json();

//       if (result.success && result.data.images?.length > 0) {
//         const imageUrls = result.data.images.map((img) => img.url);
//         onSuccess(imageUrls);
//         alert(`${result.data.images.length} images uploaded successfully!`);
//       } else {
//         alert("Failed to upload images: " + result.message);
//       }
//     } catch (error) {
//       console.error("Error uploading images:", error);
//       alert("Error uploading images. Please try again.");
//     }
//   };

//   const handleDragStart = (index) => {
//     setDraggedIndex(index);
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     if (draggedIndex === null || draggedIndex === index) return;

//     const newSections = [...sections];
//     const draggedSection = newSections[draggedIndex];
//     newSections.splice(draggedIndex, 1);
//     newSections.splice(index, 0, draggedSection);

//     newSections.forEach((section, idx) => {
//       section.order = idx;
//     });

//     setSections(newSections);
//     setDraggedIndex(index);
//   };

//   const handleDragEnd = async () => {
//     setDraggedIndex(null);

//     try {
//       const token = getAuthToken();
//       for (const section of sections) {
//         await fetch(`${API_URL}/doAll`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             action: "update",
//             table: "homepage_sections",
//             data: { order_position: section.order },
//             where: { id: section.id },
//           }),
//         });
//       }
//     } catch (error) {
//       console.error("Error updating section order:", error);
//     }
//   };

//   const toggleSection = async (id) => {
//     const section = sections.find((s) => s.id === id);
//     const newEnabled = !section.enabled;

//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "update",
//           table: "homepage_sections",
//           data: { enabled: newEnabled ? 1 : 0 },
//           where: { id: id },
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSections(
//           sections.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s))
//         );
//       }
//     } catch (error) {
//       console.error("Error toggling section:", error);
//     }
//   };

//   const saveCategoryData = async (sectionId, categoryData) => {
//     try {
//       const token = getAuthToken();

//       await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "soft_delete",
//           table: "collection_category",
//           where: { section_id: sectionId },
//         }),
//       });

//       if (categoryData.items?.length > 0) {
//         for (const [index, item] of categoryData.items.entries()) {
//           if (item.selectedCategories?.length > 0) {
//             const categoryId = item.selectedCategories[0];
//             const category = categories.find((cat) => cat.id === categoryId);

//             if (category) {
//               await fetch(`${API_URL}/doAll`, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({
//                   action: "insert",
//                   table: "collection_category",
//                   data: {
//                     section_id: sectionId,
//                     category_id: categoryId,
//                     title: item.title || category.name,
//                     images: JSON.stringify(item.image ? [item.image] : []),
//                     selected_products: JSON.stringify(
//                       item.selectedProducts || []
//                     ),
//                     display_order: index,
//                     updated_at: new Date()
//                       .toISOString()
//                       .slice(0, 19)
//                       .replace("T", " "),
//                     is_deleted: 0,
//                   },
//                 }),
//               });
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error saving category data:", error);
//       throw error;
//     }
//   };

//   const saveSection = async (sectionId, newData) => {
//     try {
//       const token = getAuthToken();
//       const section = sections.find((s) => s.id === sectionId);

//       if (section.type === SECTION_TYPES.CATEGORY_HIGHLIGHT) {
//         const itemsWithIds =
//           newData.items?.map((item, index) => ({
//             ...item,
//             id: item.id || Date.now() + index,
//           })) || [];

//         const dataForHomepageSections = {
//           ...newData,
//           items: itemsWithIds.map((item) => ({
//             id: item.id,
//             title: item.title,
//             image: item.image,
//             selectedCategories: item.selectedCategories,
//             selectedProducts: item.selectedProducts,
//           })),
//         };

//         const response = await fetch(`${API_URL}/doAll`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             action: "update",
//             table: "homepage_sections",
//             data: { section_data: JSON.stringify(dataForHomepageSections) },
//             where: { id: sectionId },
//           }),
//         });

//         const result = await response.json();

//         if (result.success) {
//           await saveCategoryData(sectionId, {
//             ...newData,
//             items: itemsWithIds,
//           });
//           setSections(
//             sections.map((s) =>
//               s.id === sectionId
//                 ? { ...s, data: { ...newData, items: itemsWithIds } }
//                 : s
//             )
//           );
//           alert("Section saved successfully!");
//         } else {
//           alert("Failed to save section: " + result.message);
//         }
//       } else {
//         const response = await fetch(`${API_URL}/doAll`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             action: "update",
//             table: "homepage_sections",
//             data: { section_data: JSON.stringify(newData) },
//             where: { id: sectionId },
//           }),
//         });

//         const result = await response.json();

//         if (result.success) {
//           setSections(
//             sections.map((s) =>
//               s.id === sectionId ? { ...s, data: newData } : s
//             )
//           );
//           alert("Section saved successfully!");
//         } else {
//           alert("Failed to save section: " + result.message);
//         }
//       }
//     } catch (error) {
//       console.error("Error saving section:", error);
//       alert("Error saving section. Please try again.");
//     }
//   };

//   const getDefaultDataForType = (type) => {
//     switch (type) {
//       case SECTION_TYPES.HERO:
//         return {
//           items: [
//             {
//               id: 1,
//               type: "image",
//               title: "New Collection",
//               subtitle: "Discover Our Latest Arrivals",
//               description: "Shop the newest trends with exclusive discounts",
//               image: "",
//               cta: "Shop Now",
//               ctaLink: "/shop",
//               selectedCategory: null,
//               redirectToCategory: false,
//             },
//           ],
//         };
//       case SECTION_TYPES.FEATURE:
//         return {
//           items: [
//             {
//               id: 1,
//               leftImage: "",
//               rightImage: "",
//               rightBottomImage: "",
//               title: "Feature Title",
//               subtitle: "Feature description goes here",
//               leftImageCategory: null,
//               rightImageCategory: null,
//               rightBottomImageCategory: null,
//             },
//           ],
//         };
//       case SECTION_TYPES.COLLECTION:
//         return {
//           items: [
//             {
//               id: 1,
//               title: "Spring Collection",
//               subtitle: "Fresh styles for the new season",
//               images: ["", "", "", ""],
//               cta: "View Collection",
//               ctaLink: "/collection/spring",
//               redirectToCategory: false,
//               imageCategories: [null, null, null, null],
//             },
//           ],
//         };
//       case SECTION_TYPES.CATEGORY_HIGHLIGHT:
//         return {
//           items: [
//             {
//               id: 1,
//               title: "",
//               image: "",
//               selectedCategories: [],
//               selectedProducts: [],
//             },
//           ],
//         };
//       case SECTION_TYPES.STORY:
//         return {
//           items: [
//             {
//               id: 1,
//               videos: ["", "", "", ""],
//               title: "Stories",
//               subtitle: "Watch our latest stories",
//             },
//           ],
//         };
//       default:
//         return { items: [] };
//     }
//   };

//   const addNewSection = (type) => {
//     setPendingSectionType(type);
//     setSectionTitle("");
//     setShowTitleModal(true);
//     setShowAddSectionDropdown(false);
//   };

//   const confirmAddSection = async () => {
//     if (!sectionTitle.trim()) {
//       alert("Please enter a section title");
//       return;
//     }

//     const newSection = {
//       name: sectionTitle,
//       type: pendingSectionType,
//       enabled: true,
//       order: sections.length,
//       data: getDefaultDataForType(pendingSectionType),
//     };

//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "insert",
//           table: "homepage_sections",
//           data: {
//             name: newSection.name,
//             type: newSection.type,
//             enabled: newSection.enabled ? 1 : 0,
//             order_position: newSection.order,
//             section_data: JSON.stringify(newSection.data),
//           },
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         newSection.id = result.insertId;
//         setSections([...sections, newSection]);
//         setSelectedSection(newSection);
//         setView("section-edit");
//         setShowTitleModal(false);
//         setPendingSectionType(null);
//       } else {
//         alert("Failed to create section: " + result.message);
//       }
//     } catch (error) {
//       console.error("Error creating section:", error);
//       alert("Error creating section. Please try again.");
//     }
//   };

//   const deleteSection = async (id) => {
//     if (!confirm("Are you sure you want to delete this section?")) {
//       return;
//     }

//     try {
//       const token = getAuthToken();

//       await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "soft_delete",
//           table: "collection_category",
//           where: { section_id: id },
//         }),
//       });

//       const response = await fetch(`${API_URL}/doAll`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: "soft_delete",
//           table: "homepage_sections",
//           where: { id: id },
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSections(sections.filter((s) => s.id !== id));
//         if (selectedSection?.id === id) {
//           setSelectedSection(null);
//           setView("reorder");
//         }
//         alert("Section deleted successfully!");
//       } else {
//         alert("Failed to delete section: " + result.message);
//       }
//     } catch (error) {
//       console.error("Error deleting section:", error);
//       alert("Error deleting section. Please try again.");
//     }
//   };

//   const SectionEditor = ({ section }) => {
//     const [formData, setFormData] = useState(() => {
//       const sectionData = section.data || {};
//       let items = sectionData.items || [];

//       if (
//         section.type === SECTION_TYPES.CATEGORY_HIGHLIGHT &&
//         items.length > 0
//       ) {
//         items = items.map((item) => ({
//           ...item,
//           id: item.id || Date.now() + Math.random(),
//           title: item.title || "",
//           image: item.image || "",
//           selectedCategories: item.selectedCategories || [],
//           selectedProducts: item.selectedProducts || [],
//         }));
//       }

//       if (section.type === SECTION_TYPES.HERO && items.length > 0) {
//         items = items.map((item) => ({
//           ...item,
//           selectedCategory: item.selectedCategory || null,
//           redirectToCategory: item.redirectToCategory || false,
//         }));
//       }

//       if (section.type === SECTION_TYPES.COLLECTION && items.length > 0) {
//         items = items.map((item) => ({
//           ...item,
//           redirectToCategory: item.redirectToCategory || false,
//           images: item.images || ["", "", "", ""],
//           imageCategories: item.imageCategories || [null, null, null, null],
//         }));
//       }

//       if (section.type === SECTION_TYPES.FEATURE && items.length > 0) {
//         items = items.map((item) => ({
//           ...item,
//           leftImageCategory: item.leftImageCategory || null,
//           rightImageCategory: item.rightImageCategory || null,
//           rightBottomImageCategory: item.rightBottomImageCategory || null,
//         }));
//       }

//       return { ...sectionData, items };
//     });

//     const [showBulkUpload, setShowBulkUpload] = useState(false);

//     const updateItem = (index, field, value) => {
//       const newItems = [...(formData.items || [])];
//       newItems[index] = { ...newItems[index], [field]: value };
//       setFormData({ ...formData, items: newItems });
//     };

//     const updateEntireItem = (index, updatedItem) => {
//       const newItems = [...(formData.items || [])];
//       newItems[index] = updatedItem;
//       setFormData({ ...formData, items: newItems });
//     };

//     const addItem = () => {
//       const newItem = getNewItemTemplate(
//         section.type,
//         (formData.items?.length || 0) + 1
//       );
//       setFormData({
//         ...formData,
//         items: [...(formData.items || []), newItem],
//       });
//     };

//     const removeItem = (index) => {
//       const newItems = (formData.items || []).filter((_, i) => i !== index);
//       setFormData({ ...formData, items: newItems });
//     };

//     const handleBulkUploadComplete = (paths) => {
//       if (section.type === SECTION_TYPES.COLLECTION) {
//         const newItems = [];
//         for (let i = 0; i < paths.length; i += 4) {
//           const itemImages = paths.slice(i, i + 4);
//           while (itemImages.length < 4) {
//             itemImages.push("");
//           }

//           const itemId = (formData.items?.length || 0) + newItems.length + 1;
//           const template = getNewItemTemplate(section.type, itemId);
//           newItems.push({
//             ...template,
//             images: itemImages,
//             title: `Collection ${itemId}`,
//             subtitle: "New collection",
//           });
//         }

//         setFormData({
//           ...formData,
//           items: [...(formData.items || []), ...newItems],
//         });
//         setShowBulkUpload(false);

//         alert(
//           `${paths.length} images uploaded successfully! Please assign categories to each image.`
//         );
//       } else if (section.type === SECTION_TYPES.CATEGORY_HIGHLIGHT) {
//         const newItems = paths.map((url, idx) => {
//           const itemId = (formData.items?.length || 0) + idx + 1;
//           const template = getNewItemTemplate(section.type, itemId);
//           return { ...template, image: url };
//         });

//         setFormData({
//           ...formData,
//           items: [...(formData.items || []), ...newItems],
//         });
//         setShowBulkUpload(false);
//       }
//     };

//     const handleBulkCategoryAssignment = (itemIndex, categoriesArray) => {
//       const newItems = [...(formData.items || [])];
//       newItems[itemIndex] = {
//         ...newItems[itemIndex],
//         imageCategories: categoriesArray,
//       };
//       setFormData({ ...formData, items: newItems });
//     };

//     const getNewItemTemplate = (type, id) => {
//       switch (type) {
//         case SECTION_TYPES.HERO:
//           return {
//             id,
//             type: "image",
//             title: "",
//             subtitle: "",
//             description: "",
//             image: "",
//             cta: "Shop Now",
//             ctaLink: "/",
//             selectedCategory: null,
//             redirectToCategory: false,
//           };
//         case SECTION_TYPES.FEATURE:
//           return {
//             id,
//             leftImage: "",
//             rightImage: "",
//             rightBottomImage: "",
//             title: "",
//             subtitle: "",
//             leftImageCategory: null,
//             rightImageCategory: null,
//             rightBottomImageCategory: null,
//           };
//         case SECTION_TYPES.COLLECTION:
//           return {
//             id,
//             title: "",
//             subtitle: "",
//             images: ["", "", "", ""],
//             cta: "View Collection",
//             ctaLink: "/collection",
//             redirectToCategory: false,
//             imageCategories: [null, null, null, null],
//           };
//         case SECTION_TYPES.CATEGORY_HIGHLIGHT:
//           return {
//             id,
//             title: "",
//             image: "",
//             selectedCategories: [],
//             selectedProducts: [],
//           };
//         case SECTION_TYPES.STORY:
//           return {
//             id,
//             title: "",
//             subtitle: "",
//             videos: ["", "", "", ""],
//           };
//         default:
//           return { id };
//       }
//     };

//     switch (section.type) {
//       case SECTION_TYPES.HERO:
//         return (
//           <div className="space-y-6">
//             {formData.items?.map((item, idx) => (
//               <SectionCard key={idx} title={`Hero Banner ${idx + 1}`}>
//                 <div className="space-y-6">
//                   <FormInput
//                     label="Title"
//                     value={item.title}
//                     onChange={(e) => updateItem(idx, "title", e.target.value)}
//                     placeholder="Enter banner title"
//                   />
//                   <FormInput
//                     label="Subtitle"
//                     value={item.subtitle}
//                     onChange={(e) =>
//                       updateItem(idx, "subtitle", e.target.value)
//                     }
//                     placeholder="Enter banner subtitle"
//                   />
//                   <FormTextarea
//                     label="Description"
//                     value={item.description}
//                     onChange={(e) =>
//                       updateItem(idx, "description", e.target.value)
//                     }
//                     placeholder="Enter banner description"
//                   />

//                   <ImageUpload
//                     currentValue={item.image}
//                     onUpdate={(value) => updateItem(idx, "image", value)}
//                     label="Hero Image"
//                     recommendedSize="1900×600"
//                   />

//                   <HeroCategorySelector
//                     item={item}
//                     onUpdate={(updatedItem) =>
//                       updateEntireItem(idx, updatedItem)
//                     }
//                     categories={categories}
//                   />

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormInput
//                       label="CTA Text"
//                       value={item.cta}
//                       onChange={(e) => updateItem(idx, "cta", e.target.value)}
//                       placeholder="e.g., Shop Now"
//                     />
//                     <FormInput
//                       label="CTA Link"
//                       value={item.ctaLink}
//                       onChange={(e) =>
//                         updateItem(idx, "ctaLink", e.target.value)
//                       }
//                       disabled={item.redirectToCategory}
//                       placeholder={
//                         item.redirectToCategory
//                           ? "Auto-generated from category"
//                           : "/shop"
//                       }
//                     />
//                   </div>

//                   {formData.items.length > 1 && (
//                     <div className="pt-4 border-t">
//                       <SecondaryButton
//                         onClick={() => removeItem(idx)}
//                         variant="red"
//                         icon={<FiTrash2 />}
//                         className="w-full"
//                       >
//                         Remove This Banner
//                       </SecondaryButton>
//                     </div>
//                   )}
//                 </div>
//               </SectionCard>
//             ))}

//             <button
//               onClick={addItem}
//               className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 
//                        text-gray-600 hover:border-emerald-500 hover:text-emerald-600 
//                        transition-colors flex items-center justify-center gap-3"
//             >
//               <FiPlus className="w-5 h-5" />
//               <span className="font-medium">Add Hero Banner</span>
//             </button>

//             <div className="flex flex-col md:flex-row gap-3 pt-6">
//               <PrimaryButton
//                 onClick={() => saveSection(section.id, formData)}
//                 icon={<FiSave />}
//                 className="flex-1"
//               >
//                 Save Changes
//               </PrimaryButton>
//               <SecondaryButton
//                 onClick={() => deleteSection(section.id)}
//                 variant="red"
//                 icon={<FiTrash2 />}
//                 className="flex-1"
//               >
//                 Delete Section
//               </SecondaryButton>
//             </div>
//           </div>
//         );

//       case SECTION_TYPES.FEATURE:
//         return (
//           <div className="space-y-6">
//             {formData.items?.map((item, idx) => (
//               <SectionCard key={idx} title={`Feature Item ${idx + 1}`}>
//                 <div className="space-y-6">
//                   <FormInput
//                     label="Title"
//                     value={item.title || ""}
//                     onChange={(e) => updateItem(idx, "title", e.target.value)}
//                     placeholder="e.g., rings collection description"
//                   />

//                   <FormInput
//                     label="Subtitle"
//                     value={item.subtitle || ""}
//                     onChange={(e) =>
//                       updateItem(idx, "subtitle", e.target.value)
//                     }
//                     placeholder="e.g., Discover our exclusive collection"
//                   />

//                   <FeatureImageWithCategory
//                     imageType="leftImage"
//                     currentValue={item.leftImage}
//                     currentCategory={item.leftImageCategory}
//                     onImageUpdate={(value) =>
//                       updateItem(idx, "leftImage", value)
//                     }
//                     onCategoryUpdate={(value) =>
//                       updateItem(idx, "leftImageCategory", value)
//                     }
//                     categories={categories}
//                     label="Left Image"
//                   />

//                   <FeatureImageWithCategory
//                     imageType="rightImage"
//                     currentValue={item.rightImage}
//                     currentCategory={item.rightImageCategory}
//                     onImageUpdate={(value) =>
//                       updateItem(idx, "rightImage", value)
//                     }
//                     onCategoryUpdate={(value) =>
//                       updateItem(idx, "rightImageCategory", value)
//                     }
//                     categories={categories}
//                     label="Right Image"
//                   />

//                   <FeatureImageWithCategory
//                     imageType="rightBottomImage"
//                     currentValue={item.rightBottomImage}
//                     currentCategory={item.rightBottomImageCategory}
//                     onImageUpdate={(value) =>
//                       updateItem(idx, "rightBottomImage", value)
//                     }
//                     onCategoryUpdate={(value) =>
//                       updateItem(idx, "rightBottomImageCategory", value)
//                     }
//                     categories={categories}
//                     label="Right Bottom Image"
//                   />

//                   {(item.leftImageCategory ||
//                     item.rightImageCategory ||
//                     item.rightBottomImageCategory) && (
//                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//                       <h4 className="text-sm font-medium text-emerald-900 mb-2">
//                         Image Category Links:
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                         {item.leftImageCategory && (
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium">
//                               Left Image:
//                             </span>
//                             <span className="text-xs text-emerald-700">
//                               {
//                                 categories.find(
//                                   (cat) => cat.id === item.leftImageCategory
//                                 )?.name
//                               }
//                             </span>
//                           </div>
//                         )}
//                         {item.rightImageCategory && (
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium">
//                               Right Image:
//                             </span>
//                             <span className="text-xs text-emerald-700">
//                               {
//                                 categories.find(
//                                   (cat) => cat.id === item.rightImageCategory
//                                 )?.name
//                               }
//                             </span>
//                           </div>
//                         )}
//                         {item.rightBottomImageCategory && (
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium">
//                               Right Bottom Image:
//                             </span>
//                             <span className="text-xs text-emerald-700">
//                               {
//                                 categories.find(
//                                   (cat) =>
//                                     cat.id === item.rightBottomImageCategory
//                                 )?.name
//                               }
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {formData.items.length > 1 && (
//                     <div className="pt-4 border-t">
//                       <SecondaryButton
//                         onClick={() => removeItem(idx)}
//                         variant="red"
//                         icon={<FiTrash2 />}
//                         className="w-full"
//                       >
//                         Remove This Feature
//                       </SecondaryButton>
//                     </div>
//                   )}
//                 </div>
//               </SectionCard>
//             ))}

//             <button
//               onClick={addItem}
//               className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 
//                        text-gray-600 hover:border-emerald-500 hover:text-emerald-600 
//                        transition-colors flex items-center justify-center gap-3"
//             >
//               <FiPlus className="w-5 h-5" />
//               <span className="font-medium">Add Feature Item</span>
//             </button>

//             <div className="flex flex-col md:flex-row gap-3 pt-6">
//               <PrimaryButton
//                 onClick={() => saveSection(section.id, formData)}
//                 icon={<FiSave />}
//                 className="flex-1"
//               >
//                 Save Changes
//               </PrimaryButton>
//               <SecondaryButton
//                 onClick={() => deleteSection(section.id)}
//                 variant="red"
//                 icon={<FiTrash2 />}
//                 className="flex-1"
//               >
//                 Delete Section
//               </SecondaryButton>
//             </div>
//           </div>
//         );

//       case SECTION_TYPES.COLLECTION:
//         return (
//           <div className="space-y-6">
//             <SectionCard title="Bulk Upload">
//               <div className="space-y-4">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                   <div>
//                     <h4 className="font-medium text-gray-900">
//                       Upload Multiple Images
//                     </h4>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Max 10 images • Each collection needs 4 images
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setShowBulkUpload(!showBulkUpload)}
//                     className="text-emerald-600 hover:text-emerald-700 font-medium"
//                   >
//                     {showBulkUpload ? "Hide Upload" : "Show Upload"}
//                   </button>
//                 </div>
//                 {showBulkUpload && (
//                   <div className="relative">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) =>
//                         handleBulkImageUpload(e, handleBulkUploadComplete)
//                       }
//                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       id="bulk-upload"
//                     />
//                     <PrimaryButton icon={<FiUpload />} className="w-full">
//                       Upload Multiple Images (Max 10)
//                     </PrimaryButton>
//                   </div>
//                 )}
//               </div>
//             </SectionCard>

//             {formData.items?.map((item, idx) => (
//               <SectionCard key={idx} title={`Collection ${idx + 1}`}>
//                 <div className="space-y-6">
//                   <FormInput
//                     label="Title"
//                     value={item.title || ""}
//                     onChange={(e) => updateItem(idx, "title", e.target.value)}
//                     placeholder="Enter collection title"
//                   />

//                   <FormInput
//                     label="Subtitle"
//                     value={item.subtitle || ""}
//                     onChange={(e) =>
//                       updateItem(idx, "subtitle", e.target.value)
//                     }
//                     placeholder="Enter collection subtitle"
//                   />

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Collection Images (4 images required)
//                     </label>
//                     <div className="grid grid-cols-2 gap-4">
//                       {[0, 1, 2, 3].map((imageIndex) => {
//                         const imageCategory =
//                           item.imageCategories?.[imageIndex];
//                         const category = categories.find(
//                           (cat) => cat.id === imageCategory
//                         );

//                         return (
//                           <div key={imageIndex} className="space-y-3">
//                             <div className="flex items-center justify-between">
//                               <label className="block text-sm font-medium text-gray-700">
//                                 Image {imageIndex + 1}
//                               </label>
//                               {category && (
//                                 <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
//                                   <FiCheck className="w-3 h-3" />
//                                   {category.name}
//                                 </span>
//                               )}
//                             </div>

//                             <div className="space-y-3">
//                               <ImageUpload
//                                 currentValue={item.images?.[imageIndex] || ""}
//                                 onUpdate={(value) => {
//                                   const newImages = [
//                                     ...(item.images || ["", "", "", ""]),
//                                   ];
//                                   newImages[imageIndex] = value;
//                                   updateItem(idx, "images", newImages);
//                                 }}
//                                 label=""
//                               />

//                               {item.images?.[imageIndex] && (
//                                 <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
//                                   <label className="block text-xs font-medium text-gray-700 mb-2">
//                                     Link this image to category:
//                                   </label>
//                                   <select
//                                     value={imageCategory || ""}
//                                     onChange={(e) => {
//                                       const newImageCategories = [
//                                         ...(item.imageCategories || [
//                                           null,
//                                           null,
//                                           null,
//                                           null,
//                                         ]),
//                                       ];
//                                       newImageCategories[imageIndex] =
//                                         e.target.value || null;
//                                       updateItem(
//                                         idx,
//                                         "imageCategories",
//                                         newImageCategories
//                                       );
//                                     }}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                                   >
//                                     <option value="">Select Category</option>
//                                     {categories.map((cat) => (
//                                       <option key={cat.id} value={cat.id}>
//                                         {cat.name}
//                                       </option>
//                                     ))}
//                                   </select>
//                                   {category && (
//                                     <div className="mt-2 text-xs text-gray-600">
//                                       This image will link to:{" "}
//                                       <span className="font-medium text-emerald-700">
//                                         {category.name}
//                                       </span>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <CollectionCategorySelector
//                     item={item}
//                     onUpdate={(updatedItem) =>
//                       updateEntireItem(idx, updatedItem)
//                     }
//                     categories={categories}
//                     onBulkCategoryAssignment={(categoriesArray) => {
//                       handleBulkCategoryAssignment(idx, categoriesArray);
//                     }}
//                   />

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormInput
//                       label="CTA Text"
//                       value={item.cta || ""}
//                       onChange={(e) => updateItem(idx, "cta", e.target.value)}
//                       placeholder="e.g., View Collection"
//                     />
//                     <FormInput
//                       label="CTA Link"
//                       value={item.ctaLink || ""}
//                       onChange={(e) =>
//                         updateItem(idx, "ctaLink", e.target.value)
//                       }
//                       placeholder="/collection"
//                     />
//                   </div>

//                   {(formData.items?.length || 0) > 1 && (
//                     <div className="pt-4 border-t">
//                       <SecondaryButton
//                         onClick={() => removeItem(idx)}
//                         variant="red"
//                         icon={<FiTrash2 />}
//                         className="w-full"
//                       >
//                         Remove This Collection
//                       </SecondaryButton>
//                     </div>
//                   )}
//                 </div>
//               </SectionCard>
//             ))}

//             <button
//               onClick={addItem}
//               className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 
//                        text-gray-600 hover:border-emerald-500 hover:text-emerald-600 
//                        transition-colors flex items-center justify-center gap-3"
//             >
//               <FiPlus className="w-5 h-5" />
//               <span className="font-medium">Add Collection</span>
//             </button>

//             <div className="flex flex-col md:flex-row gap-3 pt-6">
//               <PrimaryButton
//                 onClick={() => saveSection(section.id, formData)}
//                 icon={<FiSave />}
//                 className="flex-1"
//               >
//                 Save Changes
//               </PrimaryButton>
//               <SecondaryButton
//                 onClick={() => deleteSection(section.id)}
//                 variant="red"
//                 icon={<FiTrash2 />}
//                 className="flex-1"
//               >
//                 Delete Section
//               </SecondaryButton>
//             </div>
//           </div>
//         );

//       case SECTION_TYPES.CATEGORY_HIGHLIGHT:
//         return (
//           <div className="space-y-6">
//             <SectionCard title="Bulk Upload">
//               <div className="space-y-4">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                   <div>
//                     <h4 className="font-medium text-gray-900">
//                       Upload Category Images
//                     </h4>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Max 10 images • Each image becomes a category highlight
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setShowBulkUpload(!showBulkUpload)}
//                     className="text-emerald-600 hover:text-emerald-700 font-medium"
//                   >
//                     {showBulkUpload ? "Hide Upload" : "Show Upload"}
//                   </button>
//                 </div>
//                 {showBulkUpload && (
//                   <div className="relative">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) =>
//                         handleBulkImageUpload(e, handleBulkUploadComplete)
//                       }
//                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       id="bulk-upload-category"
//                     />
//                     <PrimaryButton icon={<FiUpload />} className="w-full">
//                       Upload Multiple Category Images
//                     </PrimaryButton>
//                   </div>
//                 )}
//               </div>
//             </SectionCard>

//             {!formData.items || formData.items.length === 0 ? (
//               <SectionCard>
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <FiPlus className="w-8 h-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     No Category Highlights Added
//                   </h3>
//                   <p className="text-sm text-gray-500 mb-6">
//                     Start by adding your first category highlight below
//                   </p>
//                   <PrimaryButton
//                     onClick={addItem}
//                     icon={<FiPlus />}
//                     className="mx-auto"
//                   >
//                     Add First Category Highlight
//                   </PrimaryButton>
//                 </div>
//               </SectionCard>
//             ) : (
//               formData.items.map((item, idx) => (
//                 <SectionCard
//                   key={item.id || idx}
//                   title={`Category Highlight ${idx + 1}`}
//                 >
//                   <div className="space-y-6">
//                     <FormInput
//                       label="Display Title"
//                       value={item.title || ""}
//                       onChange={(e) => updateItem(idx, "title", e.target.value)}
//                       placeholder="Enter display title (optional)"
//                     />
//                     <p className="text-xs text-gray-500 -mt-3">
//                       Leave empty to use category name
//                     </p>

//                     <ImageUpload
//                       currentValue={item.image}
//                       onUpdate={(value) => updateItem(idx, "image", value)}
//                       label="Category Image"
//                     />

//                     <CategorySelector
//                       item={item}
//                       onUpdate={(updatedItem) =>
//                         updateEntireItem(idx, updatedItem)
//                       }
//                       categories={categories}
//                     />

//                     <ProductSelector
//                       item={item}
//                       onUpdate={(updatedItem) =>
//                         updateEntireItem(idx, updatedItem)
//                       }
//                       categories={categories}
//                       products={products}
//                     />

//                     {item.selectedCategories &&
//                       item.selectedCategories.length > 0 && (
//                         <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
//                           <div className="flex items-start gap-3">
//                             <div className="text-emerald-600">
//                               <FiCheck className="w-5 h-5" />
//                             </div>
//                             <div className="flex-1">
//                               <p className="text-sm font-medium text-emerald-900">
//                                 Category Selected
//                               </p>
//                               <p className="text-sm text-emerald-700 mt-1">
//                                 {
//                                   categories.find(
//                                     (cat) =>
//                                       cat.id === item.selectedCategories[0]
//                                   )?.name
//                                 }
//                               </p>
//                               {item.selectedProducts?.length > 0 && (
//                                 <p className="text-sm text-green-800 mt-2">
//                                   <span className="font-medium">
//                                     Featured Products:
//                                   </span>{" "}
//                                   {item.selectedProducts.length} selected
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                     {formData.items.length > 1 && (
//                       <div className="pt-4 border-t">
//                         <SecondaryButton
//                           onClick={() => removeItem(idx)}
//                           variant="red"
//                           icon={<FiTrash2 />}
//                           className="w-full"
//                         >
//                           Remove This Highlight
//                         </SecondaryButton>
//                       </div>
//                     )}
//                   </div>
//                 </SectionCard>
//               ))
//             )}

//             {formData.items && formData.items.length > 0 && (
//               <button
//                 onClick={addItem}
//                 className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 
//                          text-gray-600 hover:border-emerald-500 hover:text-emerald-600 
//                          transition-colors flex items-center justify-center gap-3"
//               >
//                 <FiPlus className="w-5 h-5" />
//                 <span className="font-medium">Add Category Highlight</span>
//               </button>
//             )}

//             <div className="flex flex-col md:flex-row gap-3 pt-6">
//               <PrimaryButton
//                 onClick={() => saveSection(section.id, formData)}
//                 icon={<FiSave />}
//                 className="flex-1"
//               >
//                 Save Changes
//               </PrimaryButton>
//               <SecondaryButton
//                 onClick={() => deleteSection(section.id)}
//                 variant="red"
//                 icon={<FiTrash2 />}
//                 className="flex-1"
//               >
//                 Delete Section
//               </SecondaryButton>
//             </div>
//           </div>
//         );

//       case SECTION_TYPES.STORY:
//         return (
//           <div className="space-y-6">
//             {formData.items?.map((item, idx) => (
//               <SectionCard key={idx} title={`Story Upload ${idx + 1}`}>
//                 <div className="space-y-6">
//                   <FormInput
//                     label="Title"
//                     value={item.title || ""}
//                     onChange={(e) => updateItem(idx, "title", e.target.value)}
//                     placeholder="e.g., Our Stories"
//                   />

//                   <FormInput
//                     label="Subtitle"
//                     value={item.subtitle || ""}
//                     onChange={(e) =>
//                       updateItem(idx, "subtitle", e.target.value)
//                     }
//                     placeholder="e.g., Watch our latest video stories"
//                   />

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Story Videos (Up to 4)
//                     </label>
//                     <p className="text-xs text-emerald-600 font-medium mb-3">
//                       Maximum 50MB per video • Supported: MP4, WebM, OGG, MOV
//                     </p>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {[0, 1, 2, 3].map((videoIndex) => (
//                         <div key={videoIndex} className="space-y-2">
//                           <label className="block text-sm font-medium text-gray-700">
//                             Video {videoIndex + 1}
//                           </label>
//                           <VideoUpload
//                             currentValue={item.videos?.[videoIndex] || ""}
//                             onUpdate={(value) => {
//                               const newVideos = [
//                                 ...(item.videos || ["", "", "", ""]),
//                               ];
//                               newVideos[videoIndex] = value;
//                               updateItem(idx, "videos", newVideos);
//                             }}
//                             label=""
//                             recommendedSize="Max 50MB"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {formData.items.length > 1 && (
//                     <div className="pt-4 border-t">
//                       <SecondaryButton
//                         onClick={() => removeItem(idx)}
//                         variant="red"
//                         icon={<FiTrash2 />}
//                         className="w-full"
//                       >
//                         Remove This Story Section
//                       </SecondaryButton>
//                     </div>
//                   )}
//                 </div>
//               </SectionCard>
//             ))}

//             <button
//               onClick={addItem}
//               className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 
//                        text-gray-600 hover:border-emerald-500 hover:text-emerald-600 
//                        transition-colors flex items-center justify-center gap-3"
//             >
//               <FiPlus className="w-5 h-5" />
//               <span className="font-medium">Add Story Section</span>
//             </button>

//             <div className="flex flex-col md:flex-row gap-3 pt-6">
//               <PrimaryButton
//                 onClick={() => saveSection(section.id, formData)}
//                 icon={<FiSave />}
//                 className="flex-1"
//               >
//                 Save Changes
//               </PrimaryButton>
//               <SecondaryButton
//                 onClick={() => deleteSection(section.id)}
//                 variant="red"
//                 icon={<FiTrash2 />}
//                 className="flex-1"
//               >
//                 Delete Section
//               </SecondaryButton>
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <SectionCard>
//             <div className="text-center py-8 text-gray-500">
//               <p>Editor not available for this section type</p>
//             </div>
//           </SectionCard>
//         );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading sections...</p>
//         </div>
//       </div>
//     );
//   }

//   if (showPreview) {
//     return (
//       <div className="min-h-screen bg-white">
//         <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Homepage Preview
//               </h1>
//               <SecondaryButton
//                 onClick={() => setShowPreview(false)}
//                 icon={<FiEyeOff />}
//                 className="w-full sm:w-auto"
//               >
//                 Exit Preview
//               </SecondaryButton>
//             </div>
//           </div>
//         </div>
//         <div>
//           {sections
//             .filter((s) => s.enabled)
//             .sort((a, b) => a.order - b.order)
//             .map((section) => (
//               <PreviewSection
//                 key={section.id}
//                 section={section}
//                 categories={categories}
//               />
//             ))}
//         </div>
//       </div>
//     );
//   }

//   // if (view === "reorder") {
//   //   return (
//   //     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//   //       <div className="max-w-7xl mx-auto">
//   //         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//   //           <div>
//   //             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//   //               Reorder Sections
//   //             </h1>
//   //             <p className="text-gray-600 mt-1">
//   //               Drag and drop to rearrange sections on your homepage
//   //             </p>
//   //           </div>
//   //           <SecondaryButton
//   //             onClick={() => setView("dashboard")}
//   //             icon={<FiX />}
//   //             className="w-full sm:w-auto"
//   //           >
//   //             Back to Dashboard
//   //           </SecondaryButton>
//   //         </div>

//   //         <SectionCard title="Sections Order">
//   //           <div className="space-y-3">
//   //             {sections.map((section, index) => (
//   //               <div
//   //                 key={section.id}
//   //                 draggable
//   //                 onDragStart={() => handleDragStart(index)}
//   //                 onDragOver={(e) => handleDragOver(e, index)}
//   //                 onDragEnd={handleDragEnd}
//   //                 className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 
//   //                           bg-white border-2 rounded-xl cursor-move transition-all ${
//   //                             draggedIndex === index
//   //                               ? "opacity-50 border-emerald-500 bg-emerald-50"
//   //                               : "border-gray-200 hover:border-emerald-300 hover:shadow-sm"
//   //                           }`}
//   //               >
//   //                 <div className="flex items-center gap-3 mb-3 sm:mb-0">
//   //                   <div className="text-gray-400">
//   //                     <FiMove className="w-5 h-5" />
//   //                   </div>
//   //                   <div>
//   //                     <span className="font-medium text-gray-900 block">
//   //                       {section.name}
//   //                     </span>
//   //                     <div className="flex items-center gap-2 mt-1">
//   //                       <StatusBadge active={section.enabled} />
//   //                       <span className="text-xs text-gray-500">
//   //                         {SECTION_CONFIG[section.type]?.name || section.type}
//   //                       </span>
//   //                     </div>
//   //                   </div>
//   //                 </div>

//   //                 <div className="flex items-center gap-3 self-end sm:self-auto">
//   //                   <span className="text-sm text-gray-500">
//   //                     Order: {section.order + 1}
//   //                   </span>
//   //                   <button
//   //                     onClick={() => {
//   //                       setSelectedSection(section);
//   //                       setView("section-edit");
//   //                     }}
//   //                     className="text-emerald-600 hover:text-emerald-700"
//   //                   >
//   //                     <FiEdit className="w-4 h-4" />
//   //                   </button>
//   //                 </div>
//   //               </div>
//   //             ))}
//   //           </div>
//   //         </SectionCard>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   if (view === "section-edit" && selectedSection) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//                 Edit {selectedSection.name}
//               </h1>
//               <p className="text-gray-600 mt-1">
//                 {SECTION_CONFIG[selectedSection.type]?.description}
//               </p>
//             </div>
//             <SecondaryButton
//               onClick={() => {
//                 setView("dashboard");
//                 setSelectedSection(null);
//               }}
//               icon={<FiX />}
//               className="w-full sm:w-auto"
//             >
//               Back to Dashboard
//             </SecondaryButton>
//           </div>

//           <SectionEditor section={selectedSection} />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <Modal
//           isOpen={showTitleModal}
//           onClose={() => {
//             setShowTitleModal(false);
//             setPendingSectionType(null);
//             setSectionTitle("");
//           }}
//           title="Create New Section"
//         >
//           <p className="text-gray-600 mb-4">
//             Enter a title for your{" "}
//             {SECTION_CONFIG[pendingSectionType]?.name || pendingSectionType}{" "}
//             section
//           </p>
//           <FormInput
//             value={sectionTitle}
//             onChange={(e) => setSectionTitle(e.target.value)}
//             placeholder="Enter section title..."
//             onKeyPress={(e) => e.key === "Enter" && confirmAddSection()}
//             autoFocus
//           />
//           <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
//             <SecondaryButton
//               onClick={() => {
//                 setShowTitleModal(false);
//                 setPendingSectionType(null);
//                 setSectionTitle("");
//               }}
//               icon={<FiX />}
//             >
//               Cancel
//             </SecondaryButton>
//             <PrimaryButton onClick={confirmAddSection} icon={<FiCheck />}>
//               Create Section
//             </PrimaryButton>
//           </div>
//         </Modal>

//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Homepage Dashboard
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Manage your homepage sections and layout
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative">
//             {/* <SecondaryButton
//               onClick={() => setView("reorder")}
//               icon={<FiMove />}
//               className="w-full sm:w-auto"
//             >
//               Reorder Sections
//             </SecondaryButton> */}
//             <PrimaryButton
//               onClick={() => setShowPreview(true)}
//               icon={<FiEye />}
//               className="w-full sm:w-auto"
//             >
//               Preview
//             </PrimaryButton>
//             <PrimaryButton
//               onClick={() => setShowAddSectionDropdown(!showAddSectionDropdown)}
//               icon={<FiPlus />}
//               className="w-full sm:w-auto"
//             >
//               Add New Section
//             </PrimaryButton>

//             {showAddSectionDropdown && (
//               <div className="absolute right-0 mt-16 sm:mt-12 w-full sm:w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
//                 <div className="p-2">
//                   {Object.entries(SECTION_CONFIG).map(([type, config]) => (
//                     <button
//                       key={type}
//                       onClick={() => addNewSection(type)}
//                       className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
//                     >
//                       <div
//                         className={`p-2 rounded-lg ${config.color} text-white`}
//                       >
//                         {config.icon}
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {config.name}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {config.description}
//                         </p>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {Object.entries(SECTION_CONFIG).map(([type, config]) => (
//             <DashboardCard
//               key={type}
//               title={config.name}
//               description={config.description}
//               icon={config.icon}
//               color={config.color}
//               onClick={() => addNewSection(type)}
//             />
//           ))}
//         </div>

//         <SectionCard title="Homepage Sections">
//           {sections.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FiLayers className="w-8 h-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 No Sections Yet
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 Get started by adding your first homepage section
//               </p>
//               <PrimaryButton
//                 onClick={() => setShowAddSectionDropdown(true)}
//                 icon={<FiPlus />}
//               >
//                 Create First Section
//               </PrimaryButton>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {sections.map((section) => (
//                 <div
//                   key={section.id}
//                   className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div
//                       className={`p-3 rounded-lg ${
//                         SECTION_CONFIG[section.type]?.color || "bg-gray-500"
//                       } text-white`}
//                     >
//                       {SECTION_CONFIG[section.type]?.icon || (
//                         <FiLayers className="w-5 h-5" />
//                       )}
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-900">
//                         {section.name}
//                       </h4>
//                       <div className="flex items-center gap-3 mt-1">
//                         <StatusBadge active={section.enabled} />
//                         <span className="text-xs text-gray-500">
//                           {SECTION_CONFIG[section.type]?.name || section.type}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={() => toggleSection(section.id)}
//                       className={`text-sm font-medium px-3 py-1 rounded-lg ${
//                         section.enabled
//                           ? "bg-green-100 text-green-800 hover:bg-green-200"
//                           : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                       }`}
//                     >
//                       {section.enabled ? "Active" : "Inactive"}
//                     </button>
//                     <button
//                       onClick={() => {
//                         setSelectedSection(section);
//                         setView("section-edit");
//                       }}
//                       className="text-emerald-600 hover:text-emerald-700"
//                     >
//                       <FiEdit className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </SectionCard>
//       </div>
//     </div>
//   );
// };

// export default Homepage;