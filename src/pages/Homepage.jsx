import React, { useState, useEffect } from 'react';
import { 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Settings, 
  Upload,
  Loader,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoAll } from '../api/auth';
import toast from 'react-hot-toast';

const Homepage = () => {
  const [view, setView] = useState('dashboard');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddSectionDropdown, setShowAddSectionDropdown] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingSectionType, setPendingSectionType] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');


  // Add categories state
  const [categories, setCategories] = useState([]);

  // Fetch categories function
 const fetchCategories = async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'category'
      });
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

const loadSections = async () => {
    try {
      setLoading(true);

      const response = await DoAll({
        action: 'get',
        table: 'homepage_sections',
        order_by: { order_position: 'ASC' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load sections');
      }

      const rows = response.data.data || [];

      const loadedSections = await Promise.all(
        rows.map(async (row) => {
          let sectionData = {};
          try {
            sectionData = JSON.parse(row.section_data || '{}');
          } catch (e) {
            sectionData = {};
          }

          if (row.type === 'category-highlight') {
            try {
              const catResponse = await DoAll({
                action: 'get',
                table: 'collection_category',
                where: { section_id: row.id, is_deleted: 0 },
                order_by: { display_order: 'ASC' }
              });

              if (catResponse.data.success && catResponse.data.data) {
                const uniqueItems = new Map();
                catResponse.data.data.forEach(catItem => {
                  const images = JSON.parse(catItem.images || '[]');
                  const item = {
                    id: catItem.id,
                    title: catItem.title,
                    image: images[0] || '',
                    selectedCategories: [catItem.category_id]
                  };
                  if (!uniqueItems.has(catItem.id)) {
                    uniqueItems.set(catItem.id, item);
                  }
                });
                sectionData.items = Array.from(uniqueItems.values());
              } else {
                sectionData.items = [];
              }
            } catch (err) {
              console.warn('Failed to load category items for section', row.id);
              sectionData.items = [];
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
        })
      );

      const validSections = loadedSections.filter(s => s !== null);
      setSections(validSections);
      setFilteredSections(validSections);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load sections: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [sections, searchTerm, selectedFilter, sortBy]);

  const applyFiltersAndSearch = () => {
    let filtered = [...sections];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(section => {
        switch (selectedFilter) {
          case 'active':
            return section.enabled;
          case 'inactive':
            return !section.enabled;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'order':
          return a.order - b.order;
        case 'order-desc':
          return b.order - a.order;
        default:
          return 0;
      }
    });
    
    setFilteredSections(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('name');
  };

const handleImageUpload = async (e, updateFunction) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    updateFunction(previewUrl);

    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await DoAll({
        action: 'upload',
        formData
      });

      if (response.data.success && response.data.data.paths.length > 0) {
        updateFunction(response.data.data.paths[0]);
      } else {
        toast.error('Upload failed: ' + response.data.message);
        updateFunction('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
      updateFunction('');
    }
  };

const handleBulkImageUpload = async (e, onSuccess) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await DoAll({
        action: 'upload',
        formData
      });

      if (response.data.success && response.data.data.paths.length > 0) {
        onSuccess(response.data.data.paths);
        toast.success(`${response.data.data.paths.length} images uploaded!`);
      } else {
        toast.error('Bulk upload failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Bulk image upload failed');
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
      for (const section of sections) {
        await DoAll({
          action: 'update',
          table: 'homepage_sections',
          data: { order_position: section.order },
          where: { id: section.id }
        });
      }
      loadSections();
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

const toggleSection = async (id) => {
    const section = sections.find(s => s.id === id);
    const newEnabled = !section.enabled;

    try {
      await DoAll({
        action: 'update',
        table: 'homepage_sections',
        data: { enabled: newEnabled ? 1 : 0 },
        where: { id: id }
      });

      setSections(sections.map(s =>
        s.id === id ? { ...s, enabled: newEnabled } : s
      ));
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

const saveCategoryData = async (sectionId, categoryData) => {
    try {
      // Soft delete old entries
      await DoAll({
        action: 'soft_delete',
        table: 'collection_category',
        where: { section_id: sectionId }
      });

      if (categoryData.items && categoryData.items.length > 0) {
        for (const [index, item] of categoryData.items.entries()) {
          if (item.selectedCategories && item.selectedCategories.length > 0) {
            const categoryId = item.selectedCategories[0];
            await DoAll({
              action: 'insert',
              table: 'collection_category',
              data: {
                section_id: sectionId,
                category_id: categoryId,
                title: item.title || categories.find(c => c.id === categoryId)?.name || '',
                images: JSON.stringify(item.image ? [item.image] : []),
                display_order: index,
                is_deleted: 0
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving category data:', error);
      throw error;
    }
  };

const saveSection = async (sectionId, newData) => {
    try {
      const section = sections.find(s => s.id === sectionId);

      if (section.type === 'category-highlight') {
        const minimalData = {
          ...newData,
          items: newData.items?.map(i => ({ id: i.id, title: i.title, image: i.image })) || []
        };

        await DoAll({
          action: 'update',
          table: 'homepage_sections',
          data: { section_data: JSON.stringify(minimalData) },
          where: { id: sectionId }
        });

        await saveCategoryData(sectionId, newData);
      } else {
        await DoAll({
          action: 'update',
          table: 'homepage_sections',
          data: { section_data: JSON.stringify(newData) },
          where: { id: sectionId }
        });
      }

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, data: newData } : s
      ));
      toast.success('Section saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save section');
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
      toast.error('Please enter a section title');
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
      const response = await DoAll({
        action: 'insert',
        table: 'homepage_sections',
        data: {
          name: newSection.name,
          type: newSection.type,
          enabled: 1,
          order_position: newSection.order,
          section_data: JSON.stringify(newSection.data)
        }
      });

      if (response.data.success) {
        newSection.id = response.data.insertId;
        setSections([...sections, newSection]);
        setSelectedSection(newSection);
        setView('section-edit');
        setShowTitleModal(false);
        setPendingSectionType(null);
        loadSections();
      }
    } catch (error) {
      console.error('Create section failed:', error);
      toast.error('Failed to create section');
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
          items: [] // Start with empty items for category-highlight
        };
      default:
        return { items: [] };
    }
  };

const deleteSection = async (id) => {
    if (!confirm('Delete this section permanently?')) return;

    try {
      await DoAll({ action: 'soft_delete', table: 'collection_category', where: { section_id: id } });
      await DoAll({ action: 'soft_delete', table: 'homepage_sections', where: { id } });

      setSections(sections.filter(s => s.id !== id));
      if (selectedSection?.id === id) {
        setSelectedSection(null);
        setView('reorder');
      }
      loadSections();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  // Enhanced CategorySelector Component
  const CategorySelector = ({ item, onUpdate }) => {
    const [selectedCategory, setSelectedCategory] = useState(item.selectedCategories?.[0] || null);

    const handleCategorySelect = (categoryId) => {
      const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
      setSelectedCategory(newSelectedCategory);
     
      // Update with selected category
      const updatedItem = {
        ...item,
        selectedCategories: newSelectedCategory ? [newSelectedCategory] : []
      };
     
      // Auto-fill title with category name if empty
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
       
        {categories.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            No categories found. Please create categories in the Products section first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
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
       
        {selectedCategory && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">
              ✓ Selected: {categories.find(cat => cat.id === selectedCategory)?.name}
            </p>
            <p className="text-xs text-green-600 mt-1">
              This will be stored in collection_category table with category_id: {selectedCategory}
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
    const [saving, setSaving] = useState(false);

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
        // For category-highlight, create individual items
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
            selectedCategories: [],
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
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 cursor-pointer text-sm"
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

    const handleSave = async () => {
      setSaving(true);
      try {
        await saveSection(section.id, formData);
      } finally {
        setSaving(false);
      }
    };

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
           
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              Add Hero Banner
            </button>
           
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., rings collection description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              Add Feature Item
            </button>
           
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
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
                <h3 className="font-semibold text-blue-900 text-sm">Bulk Upload (Max 10 images)</h3>
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
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={item.ctaLink || ''}
                        onChange={(e) => updateItem(idx, 'ctaLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
           
            <button
              onClick={addItem}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              Add Collection
            </button>
           
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
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
                <h3 className="font-semibold text-blue-900 text-sm">Bulk Upload (Max 10 images)</h3>
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
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Multiple Images (Max 10)
                  </label>
                </div>
              )}
            </div>
            
            {formData.items?.map((item, idx) => (
              <div key={item.id || idx} className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
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
                    <label className="block text-sm font-medium mb-1">Display Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter display title (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use category name
                    </p>
                  </div>
                 
                  {/* Main Category Image */}
                  {renderImageUpload(item.image, (value) => updateItem(idx, 'image', value), "Category Image")}
                 
                  {/* Category Selection */}
                  <CategorySelector
                    item={item}
                    onUpdate={(updatedItem) => {
                      updateEntireItem(idx, updatedItem);
                    }}
                  />
                 
                  {/* Display selected category info */}
                  {item.selectedCategories && item.selectedCategories.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Category:</strong> {
                          categories.find(cat => cat.id === item.selectedCategories[0])?.name
                        }
                      </p>
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
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              Add Category Highlight
            </button>
           
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
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

  // Preview Components
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
      return `http://apichandra.rxsquare.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
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
                {section.data.items?.map((item, idx) => {
                  const categoryId = item.selectedCategories?.[0];
                  const category = categories.find(cat => cat.id === categoryId);
                 
                  if (!category) return null;
                 
                  return (
                    <div key={item.id || idx} className="text-center cursor-pointer group">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3">
                        {item.image && (
                          <img
                            src={getImageUrl(item.image)}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.title || category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const hasActiveFilters = searchTerm || selectedFilter !== 'all' || sortBy !== 'name';

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading homepage sections...</span>
            </div>
          </div>
        </div>
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
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm"
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
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">Reorder Sections</h1>
                  <p className="text-sm text-gray-600">Drag and drop sections to reorder them on your homepage</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sections List for Reordering */}
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-white border-2 rounded-lg cursor-move hover:shadow-lg transition-all ${
                  draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{section.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Order: {section.order + 1}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    section.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {section.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
               
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      section.enabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {section.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                 
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setView('section-edit');
                    }}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-all duration-200 hover:scale-110"
                    title="Edit Section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sections.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Sections Yet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Get started by creating your first section to build your homepage
                </p>
                <button
                  onClick={() => setView('dashboard')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create Your First Section
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'section-edit' && selectedSection) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">Edit {selectedSection.name}</h1>
                  <p className="text-sm text-gray-600">Modify your section content and settings</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setView('reorder');
                  setSelectedSection(null);
                }}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <X className="w-4 h-4" />
                <span>Back to Reorder</span>
              </button>
            </div>
          </div>

          {/* Section Editor */}
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <SectionEditor section={selectedSection} />
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Homepage Management</h1>
                <p className="text-sm text-gray-600">Manage your homepage sections and layout</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Homepage</span>
              </button>
              <button
                onClick={() => setView('reorder')}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <GripVertical className="w-4 h-4" />
                <span>Manage Sections</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sections by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm appearance-none"
              >
                <option value="all">All Sections</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              >
                <option value="name">Sort by: Name A-Z</option>
                <option value="name-desc">Sort by: Name Z-A</option>
                <option value="order">Sort by: Order (Low to High)</option>
                <option value="order-desc">Sort by: Order (High to Low)</option>
              </select>
             
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-100 hover:text-gray-800 border border-gray-300 rounded-lg bg-red-500 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Add Section Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddSectionDropdown(!showAddSectionDropdown)}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showAddSectionDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => addNewSection('hero')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 text-sm"
                  >
                    Hero Section
                  </button>
                  <button
                    onClick={() => addNewSection('feature-section')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 text-sm"
                  >
                    Feature Section
                  </button>
                  <button
                    onClick={() => addNewSection('collection')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 text-sm"
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
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredSections.length} of {sections.length} sections
              {hasActiveFilters && ' (filtered)'}
            </p>
           
            {hasActiveFilters && filteredSections.length === 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Sections</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">{sections.length}</p>
            <p className="text-sm text-gray-600">Homepage sections configured</p>
          </div>
         
          <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Sections</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {sections.filter(s => s.enabled).length}
            </p>
            <p className="text-sm text-gray-600">Currently visible on homepage</p>
          </div>
         
          <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Section Types</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {new Set(sections.map(s => s.type)).size}
            </p>
            <p className="text-sm text-gray-600">Different section types used</p>
          </div>
         
          <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => addNewSection('hero')}
                className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                + Add Hero Section
              </button>
              <button
                onClick={() => addNewSection('category-highlight')}
                className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors"
              >
                + Add Category Highlight
              </button>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSections.map(section => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-emerald-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1">
                  {section.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setView('section-edit');
                    }}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-all duration-200 hover:scale-110"
                    title="Edit Section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-200 hover:scale-110"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
             
              <div className="space-y-3">
                {/* Section Type */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Settings className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-semibold text-gray-700">Type</h4>
                  </div>
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 capitalize">
                    {section.type.replace('-', ' ')}
                  </p>
                </div>
               
                {/* Status */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <div className={`w-2 h-2 rounded-full ${section.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h4 className="text-xs font-semibold text-gray-700">Status</h4>
                  </div>
                  <p className={`text-xs px-3 py-2 rounded-lg border ${
                    section.enabled 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {section.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
               
                {/* Order Position */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <GripVertical className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-semibold text-gray-700">Order Position</h4>
                  </div>
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {section.order + 1}
                  </p>
                </div>
               
                {/* Items Count */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-semibold text-gray-700">Items</h4>
                  </div>
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {section.data?.items?.length || 0} items configured
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? 'No sections found' : 'No Sections Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first section to build your homepage'
                }
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={() => addNewSection('hero')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create Your First Section
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Section Title Modal */}
      <AnimatePresence>
        {showTitleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">Create New Section</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter a title for your {pendingSectionType?.replace('-', ' ')} section
              </p>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Enter section title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm mb-4"
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddSection}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                >
                  Create Section
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Homepage;