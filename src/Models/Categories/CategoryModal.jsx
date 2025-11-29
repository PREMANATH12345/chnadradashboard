import { useState, useEffect } from 'react';
import { Plus, X, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoAll } from '../../auth/api'; // Make sure this import path is correct
import toast from 'react-hot-toast';
import axios from 'axios';
const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';
// InputField Component
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

// ImageUpload Component
const ImageUpload = ({ image, onImageChange, onImageRemove }) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (image) {
      if (typeof image === 'string') {
        // If it's a URL string (existing image)
        setPreviewUrl(image);
      } else if (image instanceof File) {
        // If it's a File object (new upload)
        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setPreviewUrl('');
    }
  }, [image]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      onImageChange(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category Image
      </label>
      
      {previewUrl ? (
        <div className="relative group">
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-emerald-200">
            <img
              src={previewUrl}
              alt="Category preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={onImageRemove}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload').click()}
        >
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag & drop an image or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Recommended: Square aspect ratio, max 5MB
          </p>
        </div>
      )}
    </div>
  );
};

// ItemList Component
const ItemList = ({ items, onUpdate, onAdd, onRemove, label, placeholder }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        type="button"
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
              type="button"
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
  const [categoryImage, setCategoryImage] = useState(null);
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
      
      // Set existing image if available
      if (editingCategory.image_url) {
        setCategoryImage(editingCategory.image_url);
      }

      // Fetch existing style options
      const styleResponse = await DoAll({
        action: 'get',
        table: 'by_style',
        where: { category_id: editingCategory.id }
      });

      // Fetch existing metal options
      const metalResponse = await DoAll({
        action: 'get',
        table: 'by_metal_and_stone',
        where: { category_id: editingCategory.id }
      });

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

  const handleImageChange = (file) => {
    setCategoryImage(file);
  };

  const handleImageRemove = () => {
    setCategoryImage(null);
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
    setCategoryImage(null);
    setByStyleItems(['']);
    setByMetalItems(['']);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  // const uploadImage = async (file) => {
  //   // Create form data for file upload
  //   const formData = new FormData();
  //   formData.append('image', file);
  //   formData.append('folder', 'categories');

  //   try {
  //     // Adjust this API call based on your backend implementation
  //     const uploadResponse = await DoAll({
  //       action: 'upload_image',
  //       data: formData,
  //       // You might need to set headers for file upload
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       }
  //     });

  //     if (uploadResponse.data.success) {
  //       return uploadResponse.data.imageUrl; // Adjust based on your API response
  //     } else {
  //       throw new Error('Image upload failed');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     throw error;
  //   }
  // };
const uploadImage = async (file) => {
  const token = localStorage.getItem('token');
  
  try {
    const formData = new FormData();
    formData.append('images', file);
    formData.append('folder', 'categories');

    console.log('Uploading image...', file);

    const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Upload response:', uploadRes.data);

    if (uploadRes.data.success) {
      // Based on your console log, the response is:
      // {success: true, message: '1 file(s) uploaded successfully', data: {paths: Array(1), count: 1}}
      // So we need to get the URL from data.paths[0]
      
      let imageUrl;
      
      if (uploadRes.data.data?.paths?.[0]) {
        // Correct structure: data: { paths: ['image_url_here'] }
        imageUrl = uploadRes.data.data.paths[0];
      } else if (uploadRes.data.data?.images?.[0]?.url) {
        imageUrl = uploadRes.data.data.images[0].url;
      } else if (uploadRes.data.data?.imageUrl) {
        imageUrl = uploadRes.data.data.imageUrl;
      } else if (uploadRes.data.data?.url) {
        imageUrl = uploadRes.data.data.url;
      } else if (uploadRes.data.imageUrl) {
        imageUrl = uploadRes.data.imageUrl;
      } else if (uploadRes.data.url) {
        imageUrl = uploadRes.data.url;
      } else if (uploadRes.data.data) {
        imageUrl = uploadRes.data.data;
      } else {
        console.warn('Unexpected response structure:', uploadRes.data);
        throw new Error('Unexpected response format from image upload');
      }

      console.log('Extracted image URL:', imageUrl);
      return imageUrl;
    } else {
      throw new Error(uploadRes.data.message || 'Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error response:', error.response?.data);
    toast.error('Failed to upload image');
    throw error;
  }
};
  const saveStyles = async (categoryId, styles) => {
    const validStyles = styles.filter(style => style.trim());
    
    const stylePromises = validStyles.map(styleName => 
      DoAll({
        action: 'insert',
        table: 'by_style',
        data: {
          category_id: categoryId,
          name: styleName.trim(),
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      })
    );

    await Promise.all(stylePromises);
  };

  const saveMetals = async (categoryId, metals) => {
    const validMetals = metals.filter(metal => metal.trim());
    
    const metalPromises = validMetals.map(metalName => 
      DoAll({
        action: 'insert',
        table: 'by_metal_and_stone',
        data: {
          category_id: categoryId,
          name: metalName.trim(),
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      })
    );

    await Promise.all(metalPromises);
  };

  // const handleSave = async () => {
  //   if (!categoryName.trim()) {
  //     toast.error('Please enter category name');
  //     return;
  //   }

  //   const validStyles = byStyleItems.filter(item => item.trim());
  //   const validMetals = byMetalItems.filter(item => item.trim());

  //   if (validStyles.length === 0 || validMetals.length === 0) {
  //     toast.error('Please add at least one style and one metal/stone option');
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     let imageUrl = editingCategory?.image_url || null;

  //     // Upload new image if provided
  //     if (categoryImage && typeof categoryImage !== 'string') {
  //       imageUrl = await uploadImage(categoryImage);
  //     }

  //     let categoryId;

  //     if (editingCategory) {
  //       // Update existing category
  //       const updateResponse = await DoAll({
  //         action: 'update',
  //         table: 'category',
  //         where: { id: editingCategory.id },
  //         data: {
  //           name: categoryName.trim(),
  //           slug: categorySlug,
  //           image_url: imageUrl,
  //           updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  //         }
  //       });

  //       if (!updateResponse.data.success) {
  //         throw new Error('Failed to update category');
  //       }

  //       categoryId = editingCategory.id;
        
  //       // Update styles and metals
  //       await saveStyles(categoryId, validStyles);
  //       await saveMetals(categoryId, validMetals);

  //       toast.success('Category updated successfully!');
  //     } else {
  //       // Create new category
  //       const createResponse = await DoAll({
  //         action: 'insert',
  //         table: 'category',
  //         data: {
  //           name: categoryName.trim(),
  //           slug: categorySlug,
  //           image_url: imageUrl,
  //           created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  //           updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  //           is_deleted: 0
  //         }
  //       });

  //       if (!createResponse.data.success || !createResponse.data.insertId) {
  //         throw new Error('Failed to create category');
  //       }

  //       categoryId = createResponse.data.insertId;
        
  //       // Save styles and metals
  //       await saveStyles(categoryId, validStyles);
  //       await saveMetals(categoryId, validMetals);

  //       toast.success('Category created successfully!');
  //     }

  //     if (fetchCategories) {
  //       await fetchCategories();
  //     }
  //     handleClose();
  //   } catch (error) {
  //     console.error('Error saving category:', error);
  //     toast.error(`Error ${editingCategory ? 'updating' : 'creating'} category`);
  //   } finally {
  //     setSaving(false);
  //   }
  // };
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
    let imageUrl = editingCategory?.image_url || null;

    // Upload new image if provided (and it's a File object, not a URL string)
    if (categoryImage && typeof categoryImage !== 'string') {
      imageUrl = await uploadImage(categoryImage);
    }

    let categoryId;

    if (editingCategory) {
      // Update existing category
      const updateResponse = await DoAll({
        action: 'update',
        table: 'category',
        where: { id: editingCategory.id },
        data: {
          name: categoryName.trim(),
          slug: categorySlug,
          image_url: imageUrl,
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      });

      if (!updateResponse.data.success) {
        throw new Error('Failed to update category');
      }

      categoryId = editingCategory.id;
      
      // First, delete existing styles and metals
      await DoAll({
    action: 'soft_delete',
    table: 'by_style',
    where: { category_id: categoryId }
  });

  await DoAll({
    action: 'soft_delete',
    table: 'by_metal_and_stone',
    where: { category_id: categoryId }
  });

      // Then insert new ones
      await saveStyles(categoryId, validStyles);
      await saveMetals(categoryId, validMetals);

      toast.success('Category updated successfully!');
    } else {
      // Create new category
      const createResponse = await DoAll({
        action: 'insert',
        table: 'category',
        data: {
          name: categoryName.trim(),
          slug: categorySlug,
          image_url: imageUrl,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          is_deleted: 0
        }
      });

      if (!createResponse.data.success || !createResponse.data.insertId) {
        throw new Error('Failed to create category');
      }

      categoryId = createResponse.data.insertId;
      
      // Save styles and metals
      await saveStyles(categoryId, validStyles);
      await saveMetals(categoryId, validMetals);

      toast.success('Category created successfully!');
    }

    if (fetchCategories) {
      await fetchCategories();
    }
    handleClose();
  } catch (error) {
    console.error('Error saving category:', error);
    toast.error(`Error ${editingCategory ? 'updating' : 'creating'} category`);
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
                type="button"
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

                  <ImageUpload
                    image={categoryImage}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
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
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
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

export default CategoryModal;