
import React, { useState, useEffect } from 'react';
import { GripVertical, Plus, Edit, Trash2, Save, X, ChevronDown, Eye, EyeOff, Settings, Upload } from 'lucide-react';

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
  const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Add categories state
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    loadSections();
    // Load categories when component mounts
    fetchCategories().then(setCategories);
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
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

      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const loadedSections = result.data.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          enabled: row.enabled === 1,
          order: row.order_position,
          data: JSON.parse(row.section_data || '{}')
        }));
        setSections(loadedSections);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      alert('Failed to load sections from database');
    } finally {
      setLoading(false);
    }
  };

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
      
      if (result.success && result.data.paths.length > 0) {
        // Update with server path
        updateFunction(result.data.paths[0]);
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
      
      if (result.success && result.data.paths.length > 0) {
        onSuccess(result.data.paths);
        alert(`${result.data.paths.length} images uploaded successfully!`);
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

  const saveSection = async (sectionId, newData) => {
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
              ctaLink: '/shop'
            }
          ]
        };
      case 'feature-section':
        return {
          items: [
            {
              id: 1,
              leftImage: '',
              rightImage: '',
              rightBottomImage: '',
              title: 'Feature Title',
              subtitle: 'Feature description goes here'
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
              images: ['', '', '', ''], // 4 empty image slots
              cta: 'View Collection',
              ctaLink: '/collection/spring'
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
              categoryLink: '/category',
              selectedCategories: [], // New field for selected categories
              categoryImages: {} // New field for category-specific images
            }
          ]
        };
      default:
        return { items: [] };
    }
  };

  const deleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const token = getAuthToken();
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

  // Category Selector Component
 const CategorySelector = ({ item, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(item.selectedCategories || []);
  const [categoryImages, setCategoryImages] = useState(item.categoryImages || {});

  useEffect(() => {
    setSelectedCategories(item.selectedCategories || []);
    setCategoryImages(item.categoryImages || {});
  }, [item]);

  const toggleCategory = (categoryId) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelectedCategories);
    onUpdate(newSelectedCategories, categoryImages);
  };

  const handleCategoryImageUpload = async (e, categoryId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    const newCategoryImages = { ...categoryImages, [categoryId]: previewUrl };
    setCategoryImages(newCategoryImages);
    onUpdate(selectedCategories, newCategoryImages);

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
      
      if (result.success && result.data.paths.length > 0) {
        const updatedCategoryImages = { ...categoryImages, [categoryId]: result.data.paths[0] };
        setCategoryImages(updatedCategoryImages);
        onUpdate(selectedCategories, updatedCategoryImages);
      } else {
        alert('Failed to upload category image: ' + result.message);
        const failedCategoryImages = { ...categoryImages };
        delete failedCategoryImages[categoryId];
        setCategoryImages(failedCategoryImages);
        onUpdate(selectedCategories, failedCategoryImages);
      }
    } catch (error) {
      console.error('Error uploading category image:', error);
      alert('Error uploading category image');
      const failedCategoryImages = { ...categoryImages };
      delete failedCategoryImages[categoryId];
      setCategoryImages(failedCategoryImages);
      onUpdate(selectedCategories, failedCategoryImages);
    }
  };

  const removeCategoryImage = (categoryId) => {
    const newCategoryImages = { ...categoryImages };
    delete newCategoryImages[categoryId];
    setCategoryImages(newCategoryImages);
    onUpdate(selectedCategories, newCategoryImages);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Select Categories</label>
      
      {categories.length === 0 ? (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          No categories found. Please create categories in the Products section first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-gray-900">{category.name}</span>
              </label>
              
              {selectedCategories.includes(category.id) && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs font-medium text-gray-500">
                    {category.name} Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryImageUpload(e, category.id)}
                      className="hidden"
                      id={`category-image-${category.id}`}
                    />
                    <label
                      htmlFor={`category-image-${category.id}`}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Upload {category.name} Image
                    </label>
                  </div>
                  
                  {categoryImages[category.id] && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={categoryImages[category.id]} 
                        alt={category.name}
                        className="h-16 w-16 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => removeCategoryImage(category.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {selectedCategories.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
          </p>
        </div>
      )}
    </div>
  );
};

  const SectionEditor = ({ section }) => {
    const [formData, setFormData] = useState(() => {
      // Ensure items array always exists
      if (!section.data.items) {
        return { ...section.data, items: [] };
      }
      return section.data;
    });
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const updateItem = (index, field, value) => {
      const newItems = [...(formData.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
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
        // Create new collection items from uploaded images (4 images per collection)
        const newItems = [];
        for (let i = 0; i < paths.length; i += 4) {
          const itemImages = paths.slice(i, i + 4);
          // Fill remaining slots with empty strings if less than 4 images
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
      } else {
        // Existing logic for other section types
        const newItems = paths.map((path, idx) => {
          const itemId = (formData.items?.length || 0) + idx + 1;
          const template = getNewItemTemplate(section.type, itemId);
          return { ...template, image: path };
        });

        setFormData({
          ...formData,
          items: [...(formData.items || []), ...newItems]
        });
      }
      setShowBulkUpload(false);
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
            ctaLink: '/'
          };
        case 'feature-section':
          return {
            id,
            leftImage: '',
            rightImage: '',
            rightBottomImage: '',
            title: '',
            subtitle: ''
          };
        case 'collection':
          return {
            id,
            title: '',
            subtitle: '',
            images: ['', '', '', ''], // 4 empty image slots
            cta: 'View Collection',
            ctaLink: '/collection'
          };
        case 'category-highlight':
          return {
            id,
            title: '',
            image: '',
            categoryLink: '/category',
            selectedCategories: [],
            categoryImages: {}
          };
        default:
          return { id };
      }
    };

    const renderImageUpload = (currentValue, onUpdate, label = "Image") => (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="Image URL or path"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, onUpdate)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id={`file-${label.replace(/\s/g, '-')}`}
            />
            <label
              htmlFor={`file-${label.replace(/\s/g, '-')}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload
            </label>
          </div>
        </div>
        {currentValue && (
          <div className="mt-2">
            <img 
              src={currentValue} 
              alt="Preview" 
              className="h-20 w-auto rounded border"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );

    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Hero Banner {idx + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="2"
                    />
                  </div>
                  {renderImageUpload(item.image, (value) => updateItem(idx, 'image', value), "Hero Image")}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={item.cta}
                        onChange={(e) => updateItem(idx, 'cta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Hero Banner
            </button>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          </div>
        );

      case 'feature-section':
        return (
          <div className="space-y-6">
            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Feature Item {idx + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., rings collection description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Discover our exclusive collection"
                    />
                  </div>
                  {renderImageUpload(item.leftImage, (value) => updateItem(idx, 'leftImage', value), "Left Image")}
                  {renderImageUpload(item.rightImage, (value) => updateItem(idx, 'rightImage', value), "Right Image")}
                  {renderImageUpload(item.rightBottomImage, (value) => updateItem(idx, 'rightBottomImage', value), "Right Bottom Image")}
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Feature Item
            </button>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-900">Bulk Upload (Max 10 images)</h3>
                <button
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
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
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Multiple Images (Max 10)
                  </label>
                </div>
              )}
            </div>

            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Collection {idx + 1}</h3>
                  {(formData.items?.length || 0) > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* Multiple Images Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Collection Images (Up to 4)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((imageIndex) => (
                        <div key={imageIndex} className="space-y-2">
                          <label className="block text-xs font-medium text-gray-500">
                            Image {imageIndex + 1}
                          </label>
                          {renderImageUpload(
                            item.images?.[imageIndex] || '', 
                            (value) => {
                              const newImages = [...(item.images || ['', '', '', ''])];
                              newImages[imageIndex] = value;
                              updateItem(idx, 'images', newImages);
                            },
                            `Image ${imageIndex + 1}`
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={item.cta || ''}
                        onChange={(e) => updateItem(idx, 'cta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink || ''}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Collection
            </button>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-900">Bulk Upload (Max 10 images)</h3>
                <button
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
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
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Multiple Images (Max 10)
                  </label>
                </div>
              )}
            </div>

            {formData.items?.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Category Highlight {idx + 1}</h3>
                  {(formData.items?.length || 0) > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* Main Category Image */}
                  {renderImageUpload(item.image || '', (value) => updateItem(idx, 'image', value), "Main Category Image")}
                  
                  {/* Category Selection */}
                  <CategorySelector 
                    item={item}
                    onUpdate={(selectedCategories, categoryImages) => {
                      updateItem(idx, 'selectedCategories', selectedCategories);
                      updateItem(idx, 'categoryImages', categoryImages);
                    }}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Link</label>
                    <input
                      type="text"
                      value={item.categoryLink || ''}
                      onChange={(e) => updateItem(idx, 'categoryLink', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category Highlight
            </button>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => saveSection(section.id, formData)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
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

  // Hero Slider Component - IMAGES ONLY
  const HeroSlider = ({ items }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    useEffect(() => {
      if (items.length <= 1) return;
      
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % items.length);
      }, 5000);
      
      return () => clearInterval(timer);
    }, [items.length]);
    
    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    };
    
    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    };
    
    const goToSlide = (index) => {
      setCurrentSlide(index);
    };

   const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  return `http://apichandra.rxsquare.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
    
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-500 ease-in-out w-full h-full ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            {item.image && (
              <img 
                src={getImageUrl(item.image)} 
                alt={item.title || 'Hero'} 
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        ))}
        
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-3 transition-all text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-3 transition-all text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Collection Slider Component - MULTIPLE IMAGES PER COLLECTION
  const CollectionSlider = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 3;
    
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
      return `http://apichandra.rxsquare.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    // Function to ensure we always have exactly 4 image slots
    const renderImageGrid = (images) => {
      const imageArray = images || [];
      
      return (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Always render exactly 4 slots */}
          {Array.from({ length: 4 }).map((_, imageIdx) => {
            const image = imageArray[imageIdx];
            
            return (
              <div key={imageIdx} className="relative overflow-hidden aspect-square bg-gray-100 rounded-lg">
                {image ? (
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Collection image ${imageIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { 
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
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
      <div className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg overflow-hidden group p-4 border border-gray-100 hover:shadow-lg transition-shadow">
                  {/* 2x2 Image Grid - Always shows 4 slots */}
                  {renderImageGrid(item.images)}
                  
                  {/* Collection Title and Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-gray-600 text-sm mb-3">{item.subtitle}</p>
                    )}
                    {item.cta && (
                      <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm">
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
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots Indicator for Collection */}
          {items.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(items.length / itemsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * itemsPerView)}
                  className={`w-3 h-3 rounded-full transition-all ${
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

  const PreviewSection = ({ section }) => {
    const getImageUrl = (imagePath) => {
      if (!imagePath) return '';
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      return `https://apichandra.rxsquare.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    if (!section.enabled || !section.data?.items?.length) return null;

    switch (section.type) {
      case 'hero':
        return <HeroSlider items={section.data.items} />;

      case 'feature-section':
        return (
          <div className="py-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {section.data.items?.map((item, idx) => (
                <div key={idx} className="mb-16 last:mb-0">
                  {/* Item Title and Subtitle */}
                  {(item.title || item.subtitle) && (
                    <div className="text-center mb-8">
                      {item.title && (
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h2>
                      )}
                      {item.subtitle && (
                        <p className="text-xl text-gray-600">{item.subtitle}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Image Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Image - Full Height */}
                    <div className="lg:row-span-2">
                      {item.leftImage && (
                        <img 
                          src={getImageUrl(item.leftImage)} 
                          alt={item.title || 'Feature'} 
                          className="w-full h-full min-h-[400px] object-cover rounded-xl shadow-md"
                          onError={(e) => { 
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23f3f4f6" width="600" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ELeft Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Right Side - Two Images */}
                    <div className="space-y-6">
                      {/* Right Top Image */}
                      {item.rightImage && (
                        <img 
                          src={getImageUrl(item.rightImage)} 
                          alt={`${item.title || 'Feature'} right top`} 
                          className="w-full h-64 object-cover rounded-xl shadow-md"
                          onError={(e) => { 
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="256"%3E%3Crect fill="%23f3f4f6" width="600" height="256"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ERight Top Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                      
                      {/* Right Bottom Image */}
                      {item.rightBottomImage && (
                        <img 
                          src={getImageUrl(item.rightBottomImage)} 
                          alt={`${item.title || 'Feature'} right bottom`} 
                          className="w-full h-64 object-cover rounded-xl shadow-md"
                          onError={(e) => { 
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="256"%3E%3Crect fill="%23f3f4f6" width="600" height="256"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ERight Bottom Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'collection':
        return <CollectionSlider items={section.data.items} />;

      case 'category-highlight':
  return (
    <div className="py-16 px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{section.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {section.data.items.map((item, idx) => (
            <React.Fragment key={idx}>
              {/* Main category item */}
              {item.image && (
                <div className="text-center cursor-pointer group">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.title || 'Category'} 
                    className="w-full aspect-square object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                    onError={(e) => { 
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {item.title && (
                    <h3 className="font-semibold mt-3 text-gray-900">{item.title}</h3>
                  )}
                </div>
              )}
              
              {/* Selected categories with their images */}
              {item.selectedCategories && item.selectedCategories.length > 0 && (
                <>
                  {item.selectedCategories.map((categoryId, catIdx) => {
                    const category = categories.find(cat => cat.id === categoryId);
                    const categoryImage = item.categoryImages?.[categoryId];
                    
                    return (
                      <div key={catIdx} className="text-center cursor-pointer group">
                        {categoryImage ? (
                          <img 
                            src={getImageUrl(categoryImage)} 
                            alt={category?.name || 'Sub Category'} 
                            className="w-full aspect-square object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                            onError={(e) => { 
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                            {category?.name || 'No Image'}
                          </div>
                        )}
                        {category && (
                          <h3 className="font-semibold mt-3 text-gray-900">{category.name}</h3>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </React.Fragment>
          ))}
        </div>
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
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Homepage Preview</h1>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
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
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reorder Sections</h1>
          <div className="flex gap-3 relative">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Homepage
            </button>
            <button
              onClick={() => setShowAddSectionDropdown(!showAddSectionDropdown)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Section
              <ChevronDown className="w-4 h-4" />
            </button>
            {showAddSectionDropdown && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => addNewSection('hero')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Hero Section
                </button>
                <button
                  onClick={() => addNewSection('feature-section')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Feature Section
                </button>
                <button
                  onClick={() => addNewSection('collection')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Collection
                </button>
                <button
                  onClick={() => addNewSection('category-highlight')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Category Highlight
                </button>
              </div>
            )}
            <button
              onClick={() => setView('dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">Drag and drop sections to reorder them on your homepage</p>
          
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-gray-50 border-2 rounded-lg cursor-move hover:bg-gray-100 transition-colors ${
                  draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{section.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Order: {section.order + 1}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      section.enabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {section.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setView('section-edit');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-5 h-5" />
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
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit {selectedSection.name}</h1>
          <button
            onClick={() => {
              setView('reorder');
              setSelectedSection(null);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Back to Reorder
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <SectionEditor section={selectedSection} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {showTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Section</h2>
            <p className="text-gray-600 mb-4">
              Enter a title for your {pendingSectionType?.replace('-', ' ')} section
            </p>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Enter section title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              onKeyPress={(e) => e.key === 'Enter' && confirmAddSection()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTitleModal(false);
                  setPendingSectionType(null);
                  setSectionTitle('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Home</h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Homepage
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Homepage Settings
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setView('reorder');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100"
                >
                  <GripVertical className="w-4 h-4" />
                  Reorder Sections
                </button>
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500">Add Section Type:</div>
                  <button
                    onClick={() => addNewSection('hero')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Hero Section
                  </button>
                  <button
                    onClick={() => addNewSection('feature-section')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Feature Section
                  </button>
                  <button
                    onClick={() => addNewSection('collection')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Collection
                  </button>
                  <button
                    onClick={() => addNewSection('category-highlight')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Category Highlight
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome Admin!</h3>
          <p className="text-gray-600">You have successfully logged into the admin dashboard.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sections</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {sections.filter(s => s.enabled).length}
          </p>
          <p className="text-gray-600 text-sm">of {sections.length} sections enabled</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => addNewSection('hero')}
              className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
            >
              + Add Hero Section
            </button>
            <button
              onClick={() => addNewSection('feature-section')}
              className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
            >
              + Add Feature Section
            </button>
            <button
              onClick={() => addNewSection('collection')}
              className="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm"
            >
              + Add Collection Section
            </button>
            <button
              onClick={() => addNewSection('category-highlight')}
              className="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 text-sm"
            >
              + Add Category Highlight
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Homepage Sections</h3>
          <button
            onClick={() => setView('reorder')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Manage All Sections
          </button>
        </div>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{section.name}</span>
                <span className={`ml-3 text-xs px-2 py-1 rounded ${
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
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                Edit <Edit className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No sections configured yet.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => addNewSection('hero')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Hero Section
              </button>
              <button
                onClick={() => addNewSection('feature-section')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create Feature Section
              </button>
              <button
                onClick={() => addNewSection('collection')}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Create Collection
              </button>
              <button
                onClick={() => addNewSection('category-highlight')}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Create Category Highlight
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;