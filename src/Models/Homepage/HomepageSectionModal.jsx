import { useState, useEffect } from 'react';
import { Plus, X, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoAll } from '../../api/auth';
import toast from 'react-hot-toast';

// InputField Component
const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm resize-none"
        placeholder={placeholder}
        rows={3}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm"
        placeholder={placeholder}
      />
    )}
  </div>
);

// ImageUpload Component
const ImageUpload = ({ label, value, onUpdate, required = false }) => {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    onUpdate(previewUrl);

    try {
      const formData = new FormData();
      formData.append('images', file);

      // Replace with your actual upload endpoint
      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data.paths.length > 0) {
        onUpdate(result.data.paths[0]);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
        onUpdate(''); // Clear on failure
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
      onUpdate(''); // Clear on failure
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Image URL or path"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`file-${label.replace(/\s/g, '-')}`}
          />
          <label
            htmlFor={`file-${label.replace(/\s/g, '-')}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload
          </label>
        </div>
      </div>
      {value && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Preview" 
            className="h-20 w-auto rounded border object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

// ItemList Component for dynamic items
const ItemList = ({ items, onUpdate, onAdd, onRemove, label, placeholder, type = 'text' }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          {type === 'image' ? (
            <ImageUpload
              value={item}
              onUpdate={(value) => onUpdate(index, value)}
              label={`Item ${index + 1}`}
            />
          ) : (
            <input
              type={type}
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm"
              placeholder={placeholder}
            />
          )}
          {items.length > 1 && (
            <button
              onClick={() => onRemove(index)}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium mt-7"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

// MAIN COMPONENT
const HomepageSectionModal = ({ 
  showModal, 
  setShowModal, 
  editingSection, 
  fetchSections 
}) => {
  const [sectionName, setSectionName] = useState('');
  const [sectionType, setSectionType] = useState('hero');
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [sectionData, setSectionData] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const sectionTypes = [
    { value: 'hero', label: 'Hero Banner', icon: '🛍️' },
    { value: 'feature-section', label: 'Feature Section', icon: '⭐' },
    { value: 'collection', label: 'Collection', icon: '📦' },
    { value: 'category-highlight', label: 'Category Highlight', icon: '🏷️' }
  ];

  useEffect(() => {
    if (editingSection && showModal) {
      loadSectionData();
    } else if (showModal) {
      resetForm();
    }
  }, [editingSection, showModal]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      setSectionName(editingSection.name);
      setSectionType(editingSection.type);
      setSectionEnabled(editingSection.enabled === 1);
      
      // Parse section data from JSON string
      const parsedData = JSON.parse(editingSection.section_data || '{}');
      setSectionData(parsedData);

    } catch (error) {
      console.error('Error loading section data:', error);
      toast.error('Error loading section data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSectionName('');
    setSectionType('hero');
    setSectionEnabled(true);
    setSectionData({});
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!sectionName.trim()) {
      toast.error('Please enter section name');
      return;
    }

    if (!sectionType) {
      toast.error('Please select section type');
      return;
    }

    setSaving(true);

    try {
      const sectionDataToSave = {
        name: sectionName,
        type: sectionType,
        enabled: sectionEnabled ? 1 : 0,
        section_data: JSON.stringify(sectionData),
        order_position: editingSection?.order_position || 0
      };

      let response;
      if (editingSection) {
        response = await DoAll({
          action: 'update',
          table: 'homepage_sections',
          data: sectionDataToSave,
          where: { id: editingSection.id }
        });
      } else {
        // For new sections, set order position to last
        sectionDataToSave.order_position = await getNextOrderPosition();
        response = await DoAll({
          action: 'insert',
          table: 'homepage_sections',
          data: sectionDataToSave
        });
      }

      if (response.data.success) {
        toast.success(`Section ${editingSection ? 'updated' : 'created'} successfully!`);
        if (fetchSections) fetchSections();
        handleClose();
      } else {
        toast.error(`Failed to ${editingSection ? 'update' : 'create'} section`);
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(`Error ${editingSection ? 'updating' : 'creating'} section`);
    } finally {
      setSaving(false);
    }
  };

  const getNextOrderPosition = async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'homepage_sections',
        order_by: { order_position: 'DESC' },
        limit: 1
      });
      
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0].order_position + 1;
      }
      return 0;
    } catch (error) {
      console.error('Error getting next order position:', error);
      return 0;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const updateSectionData = (key, value) => {
    setSectionData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSectionSpecificFields = () => {
    switch (sectionType) {
      case 'hero':
        return (
          <>
            <InputField
              label="Title"
              value={sectionData.title || ''}
              onChange={(e) => updateSectionData('title', e.target.value)}
              placeholder="Enter hero title"
            />
            <InputField
              label="Subtitle"
              value={sectionData.subtitle || ''}
              onChange={(e) => updateSectionData('subtitle', e.target.value)}
              placeholder="Enter hero subtitle"
            />
            <InputField
              label="Description"
              value={sectionData.description || ''}
              onChange={(e) => updateSectionData('description', e.target.value)}
              placeholder="Enter hero description"
              type="textarea"
            />
            <ImageUpload
              label="Hero Image"
              value={sectionData.image || ''}
              onUpdate={(value) => updateSectionData('image', value)}
              required
            />
            <InputField
              label="CTA Text"
              value={sectionData.ctaText || ''}
              onChange={(e) => updateSectionData('ctaText', e.target.value)}
              placeholder="e.g., Shop Now"
            />
            <InputField
              label="CTA Link"
              value={sectionData.ctaLink || ''}
              onChange={(e) => updateSectionData('ctaLink', e.target.value)}
              placeholder="e.g., /shop"
            />
          </>
        );

      case 'feature-section':
        return (
          <>
            <InputField
              label="Title"
              value={sectionData.title || ''}
              onChange={(e) => updateSectionData('title', e.target.value)}
              placeholder="Enter feature title"
            />
            <InputField
              label="Subtitle"
              value={sectionData.subtitle || ''}
              onChange={(e) => updateSectionData('subtitle', e.target.value)}
              placeholder="Enter feature subtitle"
            />
            <ImageUpload
              label="Left Image"
              value={sectionData.leftImage || ''}
              onUpdate={(value) => updateSectionData('leftImage', value)}
            />
            <ImageUpload
              label="Right Top Image"
              value={sectionData.rightTopImage || ''}
              onUpdate={(value) => updateSectionData('rightTopImage', value)}
            />
            <ImageUpload
              label="Right Bottom Image"
              value={sectionData.rightBottomImage || ''}
              onUpdate={(value) => updateSectionData('rightBottomImage', value)}
            />
          </>
        );

      case 'collection':
        return (
          <>
            <InputField
              label="Collection Title"
              value={sectionData.title || ''}
              onChange={(e) => updateSectionData('title', e.target.value)}
              placeholder="Enter collection title"
            />
            <InputField
              label="Collection Subtitle"
              value={sectionData.subtitle || ''}
              onChange={(e) => updateSectionData('subtitle', e.target.value)}
              placeholder="Enter collection subtitle"
            />
            <ItemList
              items={sectionData.images || ['']}
              onUpdate={(index, value) => {
                const newImages = [...(sectionData.images || [])];
                newImages[index] = value;
                updateSectionData('images', newImages);
              }}
              onAdd={() => {
                const newImages = [...(sectionData.images || []), ''];
                updateSectionData('images', newImages);
              }}
              onRemove={(index) => {
                const newImages = (sectionData.images || []).filter((_, i) => i !== index);
                updateSectionData('images', newImages);
              }}
              label="Collection Images"
              placeholder="Image URL"
              type="image"
            />
            <InputField
              label="CTA Text"
              value={sectionData.ctaText || ''}
              onChange={(e) => updateSectionData('ctaText', e.target.value)}
              placeholder="e.g., View Collection"
            />
            <InputField
              label="CTA Link"
              value={sectionData.ctaLink || ''}
              onChange={(e) => updateSectionData('ctaLink', e.target.value)}
              placeholder="e.g., /collection/spring"
            />
          </>
        );

      case 'category-highlight':
        return (
          <>
            <InputField
              label="Section Title"
              value={sectionData.sectionTitle || ''}
              onChange={(e) => updateSectionData('sectionTitle', e.target.value)}
              placeholder="Enter section title"
            />
            <InputField
              label="Description"
              value={sectionData.description || ''}
              onChange={(e) => updateSectionData('description', e.target.value)}
              placeholder="Enter section description"
              type="textarea"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories to Highlight
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(sectionData.categories || []).map((category, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={category.name || ''}
                      onChange={(e) => {
                        const newCategories = [...(sectionData.categories || [])];
                        newCategories[index] = { ...newCategories[index], name: e.target.value };
                        updateSectionData('categories', newCategories);
                      }}
                      placeholder="Category name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <ImageUpload
                      value={category.image || ''}
                      onUpdate={(value) => {
                        const newCategories = [...(sectionData.categories || [])];
                        newCategories[index] = { ...newCategories[index], image: value };
                        updateSectionData('categories', newCategories);
                      }}
                      label=""
                    />
                    {(sectionData.categories || []).length > 1 && (
                      <button
                        onClick={() => {
                          const newCategories = (sectionData.categories || []).filter((_, i) => i !== index);
                          updateSectionData('categories', newCategories);
                        }}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCategories = [...(sectionData.categories || []), { name: '', image: '' }];
                    updateSectionData('categories', newCategories);
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300
            }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-blue-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {editingSection ? 'Edit Section' : 'Add Section'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="ml-2 text-gray-600 text-sm">Loading section details...</span>
                </div>
              ) : (
                <>
                  <InputField
                    label="Section Name *"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g., Main Hero, Summer Collection"
                    required
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sectionTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSectionType(type.value)}
                          className={`p-3 border rounded-lg text-left transition-all ${
                            sectionType === type.value
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={sectionEnabled}
                        onChange={(e) => setSectionEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enabled</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, this section will be visible on the homepage
                    </p>
                  </div>

                  {/* Section Specific Fields */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Section Content</h3>
                    {renderSectionSpecificFields()}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-blue-100 bg-white">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50 min-w-[100px]"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <span>
                  {saving ? 'Saving...' : editingSection ? 'Update' : 'Create'}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomepageSectionModal;