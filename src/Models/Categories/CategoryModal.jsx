import { useState, useEffect } from 'react';
import { Plus, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// MOVED OUTSIDE: InputField Component
const InputField = ({ label, value, onChange, placeholder, showSlug, categorySlug }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm"
      placeholder={placeholder}
    />
    {showSlug && categorySlug && (
      <p className="text-xs text-emerald-600 mt-1 font-medium">Slug: {categorySlug}</p>
    )}
  </div>
);

// MOVED OUTSIDE: ItemList Component
const ItemList = ({ items, onUpdate, onAdd, onRemove, label, placeholder }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>
    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            value={item}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 text-sm"
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              onClick={() => onRemove(index)}
              className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium min-w-[60px]"
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
const CategoryModal = ({ 
  showModal, 
  setShowModal, 
  editingCategory, 
  fetchCategories 
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [byStyleItems, setByStyleItems] = useState(['']);
  const [byMetalItems, setByMetalItems] = useState(['']);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory && showModal) {
      fetchCategoryDetails();
    } else if (showModal) {
      resetForm();
    }
  }, [editingCategory, showModal]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    try {
      setCategoryName(editingCategory.name);
      setCategorySlug(editingCategory.slug);

      // Simulated API calls - replace with your DoAll function
      const styleResponse = { data: { success: true, data: [{ name: 'Style 1' }] } };
      const metalResponse = { data: { success: true, data: [{ name: 'Metal 1' }] } };

      setByStyleItems(
        styleResponse.data.success && styleResponse.data.data?.length > 0 
          ? styleResponse.data.data.map(item => item.name)
          : ['']
      );

      setByMetalItems(
        metalResponse.data.success && metalResponse.data.data?.length > 0
          ? metalResponse.data.data.map(item => item.name)
          : ['']
      );

    } catch (error) {
      console.error('Error fetching category details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleCategoryNameChange = (value) => {
    setCategoryName(value);
    setCategorySlug(generateSlug(value));
  };

  const addStyleItem = () => setByStyleItems([...byStyleItems, '']);
  const addMetalItem = () => setByMetalItems([...byMetalItems, '']);

  const updateStyleItem = (index, value) => {
    const updated = [...byStyleItems];
    updated[index] = value;
    setByStyleItems(updated);
  };

  const updateMetalItem = (index, value) => {
    const updated = [...byMetalItems];
    updated[index] = value;
    setByMetalItems(updated);
  };

  const removeStyleItem = (index) => {
    setByStyleItems(byStyleItems.filter((_, i) => i !== index));
  };

  const removeMetalItem = (index) => {
    setByMetalItems(byMetalItems.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCategoryName('');
    setCategorySlug('');
    setByStyleItems(['']);
    setByMetalItems(['']);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert('Please enter category name');
      return;
    }

    const validStyles = byStyleItems.filter(item => item.trim());
    const validMetals = byMetalItems.filter(item => item.trim());

    if (validStyles.length === 0 || validMetals.length === 0) {
      alert('Please add at least one style and one metal/stone option');
      return;
    }

    setSaving(true);

    try {
      // Simulated save - replace with your actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      
      if (fetchCategories) fetchCategories();
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Error ${editingCategory ? 'updating' : 'creating'} category`);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
            <div className="flex justify-between items-center p-4 border-b border-emerald-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="ml-2 text-gray-600 text-sm">Loading category details...</span>
                </div>
              ) : (
                <>
                  <InputField
                    label="Category Name *"
                    value={categoryName}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="e.g., Rings, Necklaces, Earrings"
                    showSlug={true}
                    categorySlug={categorySlug}
                  />

                  <ItemList
                    items={byStyleItems}
                    onUpdate={updateStyleItem}
                    onAdd={addStyleItem}
                    onRemove={removeStyleItem}
                    label="Style Options *"
                    placeholder="e.g., Couple Ring, Solitaire"
                  />

                  <ItemList
                    items={byMetalItems}
                    onUpdate={updateMetalItem}
                    onAdd={addMetalItem}
                    onRemove={removeMetalItem}
                    label="Metal & Stone Options *"
                    placeholder="e.g., Gold, Diamond, Platinum"
                  />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-emerald-100 bg-white">
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
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50 min-w-[100px]"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <span>
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal