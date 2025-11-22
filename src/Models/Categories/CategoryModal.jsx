// components/CategoryModal.js
import { useState, useEffect } from 'react';
import { DoAll } from '../../api/auth';
import { Plus, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
      // Fetch category details
      setCategoryName(editingCategory.name);
      setCategorySlug(editingCategory.slug);

      // Fetch style items - using 'where' instead of 'where' for consistency
      const styleResponse = await DoAll({
        action: 'get',
        table: 'by_style',
        where: { category_id: editingCategory.id }
      });

      // Fetch metal items - using 'where' instead of 'where' for consistency
      const metalResponse = await DoAll({
        action: 'get',
        table: 'by_metal_and_stone',
        where: { category_id: editingCategory.id }
      });

      console.log('Style Response:', styleResponse);
      console.log('Metal Response:', metalResponse);

      setByStyleItems(
        styleResponse.data.success && styleResponse.data.data && styleResponse.data.data.length > 0 
          ? styleResponse.data.data.map(item => item.name)
          : ['']
      );

      setByMetalItems(
        metalResponse.data.success && metalResponse.data.data && metalResponse.data.data.length > 0
          ? metalResponse.data.data.map(item => item.name)
          : ['']
      );

    } catch (error) {
      console.error('Error fetching category details:', error);
      toast.error('Error loading category details');
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
      toast.error('Please enter category name');
      return;
    }

    const validStyles = byStyleItems.filter(item => item.trim());
    const validMetals = byMetalItems.filter(item => item.trim());

    if (validStyles.length === 0 || validMetals.length === 0) {
      toast.error('Please add at least one style and one metal/stone option');
      return;
    }

    setSaving(true);

    try {
      if (editingCategory) {
        // Update existing category
        await DoAll({
          action: 'update',
          table: 'category',
          id: editingCategory.id,
          data: { name: categoryName, slug: categorySlug }
        });

        // Delete existing style and metal items
        await DoAll({
          action: 'delete',
          table: 'by_style',
          where: { category_id: editingCategory.id }
        });

        await DoAll({
          action: 'delete',
          table: 'by_metal_and_stone',
          where: { category_id: editingCategory.id }
        });

        // Insert updated style items
        for (const style of validStyles) {
          await DoAll({
            action: 'insert',
            table: 'by_style',
            data: { category_id: editingCategory.id, name: style }
          });
        }

        // Insert updated metal items
        for (const metal of validMetals) {
          await DoAll({
            action: 'insert',
            table: 'by_metal_and_stone',
            data: { category_id: editingCategory.id, name: metal }
          });
        }

        toast.success('Category updated successfully!');
      } else {
        // Insert new category
        const catResponse = await DoAll({
          action: 'insert',
          table: 'category',
          data: { name: categoryName, slug: categorySlug }
        });

        const categoryId = catResponse.data.insertId;

        // Insert style items
        for (const style of validStyles) {
          await DoAll({
            action: 'insert',
            table: 'by_style',
            data: { category_id: categoryId, name: style }
          });
        }

        // Insert metal items
        for (const metal of validMetals) {
          await DoAll({
            action: 'insert',
            table: 'by_metal_and_stone',
            data: { category_id: categoryId, name: metal }
          });
        }

        toast.success('Category created successfully!');
      }

      fetchCategories();
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Error ${editingCategory ? 'updating' : 'creating'} category`);
    } finally {
      setSaving(false);
    }
  };

  // Close modal when clicking on backdrop
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
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-end z-50"
          onClick={handleBackdropClick}
        >
          {/* Slide-in panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.4
            }}
            className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-2xl"
          >
            {/* Modal Header - Sticky for mobile */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-emerald-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 animate-spin" />
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">Loading category details...</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => handleCategoryNameChange(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm sm:text-base"
                      placeholder="e.g., Rings, Necklaces, Earrings"
                    />
                    {categorySlug && (
                      <p className="text-xs sm:text-sm text-emerald-600 mt-2 font-medium">Slug: {categorySlug}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style Options *
                    </label>
                    <div className="space-y-2 sm:space-y-3">
                      {byStyleItems.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex gap-2 sm:gap-3 items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateStyleItem(index, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm sm:text-base"
                            placeholder="e.g., Couple Ring, Solitaire, Band"
                          />
                          {byStyleItems.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeStyleItem(index)}
                              className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-semibold whitespace-nowrap text-xs sm:text-sm"
                            >
                              Remove
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addStyleItem}
                      className="mt-3 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-semibold w-full sm:w-auto text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Style Option</span>
                    </motion.button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metal & Stone Options *
                    </label>
                    <div className="space-y-2 sm:space-y-3">
                      {byMetalItems.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex gap-2 sm:gap-3 items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateMetalItem(index, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm sm:text-base"
                            placeholder="e.g., Gold, Diamond, Platinum"
                          />
                          {byMetalItems.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeMetalItem(index)}
                              className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-semibold whitespace-nowrap text-xs sm:text-sm"
                            >
                              Remove
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addMetalItem}
                      className="mt-3 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 font-semibold w-full sm:w-auto text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Metal/Stone Option</span>
                    </motion.button>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer - Sticky for mobile */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border-t border-emerald-100 sticky bottom-0 bg-white">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={saving}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <span>
                  {saving 
                    ? 'Saving...' 
                    : editingCategory 
                      ? 'Update Category' 
                      : 'Create Category'
                  }
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;