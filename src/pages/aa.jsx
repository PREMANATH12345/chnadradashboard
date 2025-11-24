import { useState, useEffect, useRef, useCallback } from 'react';
import { DoAll } from '../api/auth';
import { Eye, Edit2, Trash2, Plus, Search, Filter, X, Loader, Tag, Gem, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [view, setView] = useState('main');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await DoAll({ 
        action: 'get', 
        table: 'category' 
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-8">
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Products Management</h1>
                <p className="text-sm text-gray-600">Manage your products, variants, and inventory</p>
              </div>
            </div>
          </div>
        </div>

        {view === 'main' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Add Products */}
            <div 
              onClick={() => {
                if (categories.length === 0) {
                  toast.error('Please create a category first!');
                  return;
                }
                setView('add-products');
              }}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                categories.length > 0 
                  ? 'border-emerald-200 hover:border-emerald-400 hover:scale-105' 
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Add Products</h3>
                <p className="text-gray-600 mb-4">Add products to your categories with variants</p>
                {categories.length === 0 && (
                  <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">Create a category first</p>
                )}
              </div>
            </div>

            {/* View Products */}
            <div 
              onClick={() => {
                if (categories.length === 0) {
                  toast.error('No categories available!');
                  return;
                }
                setView('view-products');
              }}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                categories.length > 0 
                  ? 'border-blue-200 hover:border-blue-400 hover:scale-105' 
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">👁️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">View Products</h3>
                <p className="text-gray-600">Browse all created products</p>
              </div>
            </div>
          </div>
        )}

        {view === 'add-products' && (
          <AddProducts 
            onBack={() => setView('main')}
            categories={categories}
            onRefresh={fetchCategories}
          />
        )}

        {view === 'view-products' && (
          <ViewProducts 
            onBack={() => setView('main')}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
};

const AddProducts = ({ onBack, categories, onRefresh }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryData, setCategoryData] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const FILE_TYPE_OPTIONS = ['STL File', 'CAM Product', 'Rubber Mold', 'Casting Model'];

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    
    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        DoAll({
          action: 'get',
          table: 'by_style',
          where: { category_id: catId }
        }),
        DoAll({
          action: 'get',
          table: 'by_metal_and_stone',
          where: { category_id: catId }
        }),
        DoAll({
          action: 'get',
          table: 'attributes'
        })
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] }
      };
      
      if (attributesRes.data.success) {
        attributesRes.data.data.forEach(attr => {
          if (attributes[attr.type]) {
            attributes[attr.type] = { id: attr.id, options: attr.options || [] };
          }
        });
      }

      setCategoryData({
        styles: stylesRes.data.data || [],
        metals: metalsRes.data.data || [],
        attributes: attributes
      });
    } catch (error) {
      console.error('Error fetching category details:', error);
      toast.error('Error loading category details');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedStyles([]);
    setSelectedMetals([]);
    setProducts([]);
    if (catId) fetchCategoryDetails(catId);
  };

  const toggleStyle = (styleId) => {
    setSelectedStyles(prev =>
      prev.includes(styleId) ? prev.filter(id => id !== styleId) : [...prev, styleId]
    );
  };

  const toggleMetal = (metalId) => {
    setSelectedMetals(prev =>
      prev.includes(metalId) ? prev.filter(id => id !== metalId) : [...prev, metalId]
    );
  };

  const addProductRow = () => {
    const defaultStyle = selectedStyles.length > 0 ? selectedStyles[0] : '';
    const defaultMetal = selectedMetals.length > 0 ? selectedMetals[0] : '';
    
    setProducts([...products, {
      id: Date.now(),
      name: '',
      description: '',
      slug: '',
      style_id: defaultStyle,
      metal_id: defaultMetal,
      price: '',
      originalPrice: '',
      discount: 0,
      featured: [],
      gender: [],
      imageFiles: [],
      imageUrls: [],
      hasMetalChoice: false,
      hasDiamondChoice: false,
      selectedMetalOptions: [],
      selectedDiamondOptions: [],
      selectedSizes: {},
      variantPricing: {}
    }]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'name') {
          updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        return updated;
      }
      return p;
    }));
  };

  const toggleProductFeatured = (productId, feature) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const featured = p.featured.includes(feature)
          ? p.featured.filter(f => f !== feature)
          : [...p.featured, feature];
        return { ...p, featured };
      }
      return p;
    }));
  };

  const toggleProductGender = (productId, gender) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const genders = p.gender.includes(gender)
          ? p.gender.filter(g => g !== gender)
          : [...p.gender, gender];
        return { ...p, gender: genders };
      }
      return p;
    }));
  };

  const handleImageSelect = (productId, files) => {
    const fileArray = Array.from(files);
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
        return {
          ...p,
          imageFiles: [...p.imageFiles, ...fileArray],
          imageUrls: [...p.imageUrls, ...newImageUrls]
        };
      }
      return p;
    }));
  };

  const removeImage = (productId, index) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          imageFiles: p.imageFiles.filter((_, i) => i !== index),
          imageUrls: p.imageUrls.filter((_, i) => i !== index)
        };
      }
      return p;
    }));
  };

  const toggleProductMetalChoice = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          hasMetalChoice: !p.hasMetalChoice,
          selectedMetalOptions: !p.hasMetalChoice ? [] : p.selectedMetalOptions
        };
      }
      return p;
    }));
  };

  const toggleProductDiamondChoice = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          hasDiamondChoice: !p.hasDiamondChoice,
          selectedDiamondOptions: !p.hasDiamondChoice ? [] : p.selectedDiamondOptions
        };
      }
      return p;
    }));
  };

  const toggleProductMetalOption = (productId, optionId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const selectedMetalOptions = p.selectedMetalOptions.includes(optionId)
          ? p.selectedMetalOptions.filter(id => id !== optionId)
          : [...p.selectedMetalOptions, optionId];
        return { ...p, selectedMetalOptions };
      }
      return p;
    }));
  };

  const toggleProductDiamondOption = (productId, optionId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const selectedDiamondOptions = p.selectedDiamondOptions.includes(optionId)
          ? p.selectedDiamondOptions.filter(id => id !== optionId)
          : [...p.selectedDiamondOptions, optionId];
        return { ...p, selectedDiamondOptions };
      }
      return p;
    }));
  };

  const toggleProductSize = (productId, metalId, diamondId, sizeId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        return {
          ...p,
          selectedSizes: {
            ...p.selectedSizes,
            [key]: !p.selectedSizes[key]
          }
        };
      }
      return p;
    }));
  };

  const updateVariantPricing = (productId, metalId, diamondId, sizeId, field, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        return {
          ...p,
          variantPricing: {
            ...p.variantPricing,
            [key]: {
              ...p.variantPricing[key],
              [field]: value
            }
          }
        };
      }
      return p;
    }));
  };

  const toggleVariantFileType = (productId, metalId, diamondId, sizeId, fileType) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        const current = p.variantPricing[key] || {};
        const currentFiles = current.file_types || [];
        const newFiles = currentFiles.includes(fileType)
          ? currentFiles.filter(f => f !== fileType)
          : [...currentFiles, fileType];
        
        return {
          ...p,
          variantPricing: {
            ...p.variantPricing,
            [key]: {
              ...current,
              file_types: newFiles
            }
          }
        };
      }
      return p;
    }));
  };

  const saveProducts = async () => {
    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    for (const product of products) {
      if (!product.name || !product.style_id || !product.metal_id || !product.price) {
        toast.error('Please fill all required fields for all products');
        return;
      }
    }

    setLoading(true);

    try {
      for (const product of products) {
        // Upload images first
        let uploadedImageUrls = [];
        if (product.imageFiles.length > 0) {
          // Note: You'll need to implement image upload with DoAll
          // This is a placeholder for image upload logic
          toast('Image upload would happen here with your upload endpoint');
        }

        const productDetails = {
          slug: product.slug,
          description: product.description || '',
          price: parseFloat(product.price),
          originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price),
          discount: parseInt(product.discount) || 0,
          style_id: product.style_id,
          metal_id: product.metal_id,
          featured: product.featured,
          gender: product.gender,
          images: uploadedImageUrls,
          category: categories.find(c => c.id == selectedCategoryId)?.name || '',
          has_variants: product.hasMetalChoice || product.hasDiamondChoice
        };

        const productRes = await DoAll({
          action: 'insert',
          table: 'products',
          data: {
            category_id: selectedCategoryId,
            name: product.name,
            slug: product.slug,
            product_details: JSON.stringify(productDetails)
          }
        });

        if (productRes.data.success && productRes.data.insertId) {
          const productDbId = productRes.data.insertId;
          const variants = [];

          for (const [key, isSelected] of Object.entries(product.selectedSizes)) {
            if (!isSelected) continue;

            const pricing = product.variantPricing[key];
            if (!pricing || !pricing.original_price) continue;

            const [metalPart, diamondPart, sizePart] = key.split('-');
            
            variants.push({
              product_id: productDbId,
              metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
              diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
              size_option_id: parseInt(sizePart),
              original_price: parseFloat(pricing.original_price),
              discount_price: parseFloat(pricing.discount_price) || parseFloat(pricing.original_price),
              discount_percentage: parseInt(pricing.discount_percentage) || 0,
              file_types: JSON.stringify(pricing.file_types || [])
            });
          }

          if (variants.length > 0) {
            for (const variant of variants) {
              await DoAll({
                action: 'insert',
                table: 'product_variants',
                data: variant
              });
            }
          }
        }
      }

      toast.success('Products and variants saved successfully!');
      setProducts([]);
      onRefresh();
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error('Error saving products');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id == selectedCategoryId);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Products</h2>
            <p className="text-sm text-gray-600">Add products with variants and pricing</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
        >
          ← Back
        </button>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Category *</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category Details */}
      {categoryData && selectedCategory && (
        <div className="mb-6 p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
          <h3 className="font-bold text-lg text-emerald-800 mb-4">{selectedCategory.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700 mb-2">Style Options:</p>
              <div className="flex flex-wrap gap-2">
                {categoryData.styles.map(style => (
                  <label key={style.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style.id)}
                      onChange={() => toggleStyle(style.id)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm">{style.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Metal & Stone Options:</p>
              <div className="flex flex-wrap gap-2">
                {categoryData.metals.map(metal => (
                  <label key={metal.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMetals.includes(metal.id)}
                      onChange={() => toggleMetal(metal.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{metal.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Button */}
      {categoryData && (
        <button
          onClick={addProductRow}
          className="mb-6 w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product Row</span>
        </button>
      )}

      {/* Products List */}
      {products.map((product, index) => (
        <div key={product.id} className="mb-6 p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
          <h4 className="font-bold text-xl mb-4 bg-blue-100 p-4 rounded-lg">Product #{index + 1}</h4>
          
          {/* Basic Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Swirl Heart Ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={product.description || ''}
                onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Beautiful heart-shaped ring with diamonds"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style *</label>
              <select
                value={product.style_id}
                onChange={(e) => updateProduct(product.id, 'style_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Style</option>
                {categoryData?.styles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metal/Stone *</label>
              <select
                value={product.metal_id}
                onChange={(e) => updateProduct(product.id, 'metal_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Metal</option>
                {categoryData?.metals.map(metal => (
                  <option key={metal.id} value={metal.id}>{metal.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
              <input
                type="number"
                value={product.originalPrice}
                onChange={(e) => updateProduct(product.id, 'originalPrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="12000"
              />
            </div>
          </div>

          {/* Featured & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Featured Tags</label>
              <div className="flex flex-wrap gap-3">
                {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                  <label key={feature} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.featured.includes(feature)}
                      onChange={() => toggleProductFeatured(product.id, feature)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <span className="text-sm font-medium">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Target Gender</label>
              <div className="flex gap-4">
                {['Kids', 'Men', 'Women'].map(gender => (
                  <label key={gender} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.gender.includes(gender)}
                      onChange={() => toggleProductGender(product.id, gender)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-sm font-medium">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageSelect(product.id, e.target.files)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {product.imageUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {product.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`Preview ${idx + 1}`} className="h-24 w-24 object-cover rounded-lg shadow-md" />
                    <button
                      onClick={() => removeImage(product.id, idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variant Configuration */}
          <div className="mt-6 p-6 bg-white border-2 border-blue-300 rounded-lg">
            <h5 className="font-bold text-xl mb-6 text-blue-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Variant Configuration (Optional)
            </h5>
            
            {/* Variant options would go here - same as your existing variant code */}
            <div className="text-center py-8 text-gray-500">
              <p>Variant configuration interface would appear here</p>
              <p className="text-sm">(Metal choices, Diamond options, Size pricing, etc.)</p>
            </div>
          </div>
        </div>
      ))}

      {/* Save Button */}
      {products.length > 0 && (
        <button
          onClick={saveProducts}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Saving Products...</span>
            </div>
          ) : (
            `💾 Save ${products.length} Product(s)`
          )}
        </button>
      )}
    </div>
  );
};

const ViewProducts = ({ onBack, categories }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePopup, setImagePopup] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DoAll({
        action: 'get',
        table: 'products'
      });

      if (response.data.success) {
        const productsData = response.data.data;
        
        // Fetch additional details for each product
        const productsWithDetails = await Promise.all(
          productsData.map(async (product) => {
            try {
              // Fetch variants if any
              const variantsRes = await DoAll({
                action: 'get',
                table: 'product_variants',
                where: { product_id: product.id }
              });

              return {
                ...product,
                product_details: typeof product.product_details === 'string' 
                  ? JSON.parse(product.product_details) 
                  : product.product_details,
                variants: variantsRes.data.success ? variantsRes.data.data : []
              };
            } catch (error) {
              console.error(`Error fetching details for product ${product.id}:`, error);
              return {
                ...product,
                product_details: typeof product.product_details === 'string' 
                  ? JSON.parse(product.product_details) 
                  : product.product_details,
                variants: []
              };
            }
          })
        );

        setProducts(productsWithDetails);
        setFilteredProducts(productsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search and category selection
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategoryIds.includes(product.category_id)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.product_details.category && product.product_details.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategoryIds, searchTerm]);

  const toggleCategory = (catId) => {
    setSelectedCategoryIds(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      // First delete variants
      await DoAll({
        action: 'delete',
        table: 'product_variants',
        where: { product_id: productId }
      });

      // Then delete the product
      await DoAll({
        action: 'delete',
        table: 'products',
        id: productId
      });

      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategoryIds.length > 0 || searchTerm;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">View Products</h2>
            <p className="text-sm text-gray-600">Browse and manage all products</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
        >
          ← Back
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
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

        {/* Results Count */}
        <div className="flex items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.map(cat => (
              <label
                key={cat.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="font-medium text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Loader className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Loading products...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {hasActiveFilters ? 'No products found' : 'No Products Yet'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by adding your first product.'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md border border-emerald-100 p-4 hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
                  {/* Product Image */}
                  <div className="mb-3">
                    {product.product_details.images && product.product_details.images.length > 0 ? (
                      <img
                        src={`https://apichandra.rxsquare.in${product.product_details.images[0]}`}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.product_details.category}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">₹{product.product_details.price?.toLocaleString()}</span>
                      {product.product_details.originalPrice > product.product_details.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.product_details.originalPrice?.toLocaleString()}
                        </span>
                      )}
                      {product.product_details.discount > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {product.product_details.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Gender & Featured */}
                    <div className="flex flex-wrap gap-1">
                      {product.product_details.gender?.map((gender, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {gender}
                        </span>
                      ))}
                      {product.product_details.featured?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Variants Info */}
                    {product.variants.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {product.variants.length} variant(s)
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setImagePopup(product.product_details.images || [])}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => setEditProduct(product)}
                        className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Popup */}
      {imagePopup && (
        <ImagePopup images={imagePopup} onClose={() => setImagePopup(null)} />
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={fetchProducts}
          categories={categories}
        />
      )}
    </div>
  );
};

// Image Popup Component
const ImagePopup = ({ images, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Product Images ({images.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <img
                src={`https://apichandra.rxsquare.in${img}`}
                alt={`Product ${idx + 1}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Edit Product Modal Component
const EditProductModal = ({ product, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    price: product.product_details.price,
    originalPrice: product.product_details.originalPrice,
    discount: product.product_details.discount,
    featured: product.product_details.featured || [],
    gender: product.product_details.gender || []
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedDetails = {
        ...product.product_details,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        discount: parseInt(formData.discount),
        featured: formData.featured,
        gender: formData.gender
      };

      await DoAll({
        action: 'update',
        table: 'products',
        id: product.id,
        data: {
          name: formData.name,
          slug: formData.slug,
          product_details: JSON.stringify(updatedDetails)
        }
      });

      toast.success('Product updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = (feature) => {
    setFormData(prev => ({
      ...prev,
      featured: prev.featured.includes(feature)
        ? prev.featured.filter(f => f !== feature)
        : [...prev.featured, feature]
    }));
  };

  const toggleGender = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter(g => g !== gender)
        : [...prev.gender, gender]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Original Price</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount %</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured Tags</label>
            <div className="flex flex-wrap gap-3">
              {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                <label key={feature} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured.includes(feature)}
                    onChange={() => toggleFeatured(feature)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Gender</label>
            <div className="flex gap-4">
              {['Kids', 'Men', 'Women'].map(gender => (
                <label key={gender} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.gender.includes(gender)}
                    onChange={() => toggleGender(gender)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;