import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { DoAll } from '../api/auth';

const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

const Products = () => {
  const [view, setView] = useState('main');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

const fetchCategories = async () => {
  setLoading(true);
  try {
    const response = await DoAll({
      action: 'get',
      table: 'category'
    });

    if (response.data.success) {
      setCategories(response.data.data);
    } else {
      toast.error("Failed to load categories");
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Something went wrong while fetching categories");
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return <div className="p-4 sm:p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Products Management</h1>
        
        {/* Add Button - Always Visible */}
        <button
          onClick={() => {
            if (categories.length === 0) {
              alert('Please create a category first!');
              return;
            }
            setView('add-products');
          }}
          className={`w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 ${
            categories.length > 0 
              ? 'hover:bg-blue-700 transition-colors' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span>+</span>
          <span>Add Product</span>
        </button>
      </div>

      {view === 'main' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Products</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Featured Products</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
          </div>

          {/* Products Display Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50">
                    🔍
                  </button>
                </div>
              </div>
            </div>
            
            <ViewProducts 
              categories={categories}
              onAddProduct={() => {
                if (categories.length === 0) {
                  alert('Please create a category first!');
                  return;
                }
                setView('add-products');
              }}
            />
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
    </div>
  );
};

// ==================== VIEW PRODUCTS COMPONENT ====================
const ViewProducts = ({ categories, onAddProduct }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePopup, setImagePopup] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const toggleCategory = (catId) => {
    setSelectedCategoryIds(prev => {
      const newSelection = prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId];
      return newSelection;
    });
  };

  const fetchProducts = useCallback(async () => {
    if (selectedCategoryIds.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${API_URL}/products/by-category`,
        { category_ids: selectedCategoryIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response)

      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryIds]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryIds, fetchProducts]);

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/products/delete`,
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-high':
          return b.product_details.price - a.product_details.price;
        case 'price-low':
          return a.product_details.price - b.product_details.price;
        case 'discount':
          return b.product_details.discount - a.product_details.discount;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white rounded-lg">
      {/* Mobile Filter Bar */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="name">📝 Name</option>
            <option value="price-high">💰 High to Low</option>
            <option value="price-low">💰 Low to High</option>
            <option value="discount">🎯 Discount</option>
          </select>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedCategoryIds.includes(cat.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar - Categories */}
        <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-4">📂 Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label
                key={cat.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-5 h-5"
                />
                <span className="font-medium text-sm">{cat.name}</span>
              </label>
            ))}
          </div>

          {selectedCategoryIds.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                ✅ {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
              </p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Desktop Toolbar */}
          <div className="hidden lg:flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="name">📝 Name</option>
                <option value="price-high">💰 High to Low</option>
                <option value="price-low">💰 Low to High</option>
                <option value="discount">🎯 Discount</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              📊 {filteredProducts.length} products found
            </div>
          </div>

          {/* Products Grid */}
          {selectedCategoryIds.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg mb-4">Select a category to view products</p>
              <button
                onClick={onAddProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                ➕ Add Your First Product
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm mb-4">Try selecting different categories or search terms</p>
              <button
                onClick={onAddProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                ➕ Add New Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={setEditProduct}
                  onDelete={handleDelete}
                  onViewImages={setImagePopup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Popup */}
      {imagePopup && (
        <ImagePopup images={imagePopup} onClose={() => setImagePopup(null)} />
      )}

      {/* Edit Product Panel */}
      {editProduct && (
        <EditProductPanel
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={() => {
            setEditProduct(null);
            fetchProducts();
          }}
          categories={categories}
        />
      )}
    </div>
  );
};

// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = ({ product, onEdit, onDelete, onViewImages }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainImage = product.product_details.images?.[0] || '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative">
        <img
          src={mainImage ? `https://apichandra.rxsquare.in${mainImage}` : '/api/placeholder/300/200'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* Discount Badge */}
        {product.product_details.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🎯 {product.product_details.discount}% OFF
          </div>
        )}

        {/* Image Count Badge */}
        {product.product_details.images?.length > 0 && (
          <button
            onClick={() => onViewImages(product.product_details.images)}
            className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs"
          >
            📷 {product.product_details.images.length}
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm">{product.name}</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-gray-500 hover:text-gray-700 text-xs"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-3 line-clamp-1">🔗 {product.slug}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            💰 ₹{product.product_details.price?.toLocaleString()}
          </span>
          {product.product_details.originalPrice > product.product_details.price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.product_details.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Category & Gender */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            📂 {product.product_details.category}
          </span>
          {product.product_details.gender?.map(gender => (
            <span key={gender} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
              👤 {gender}
            </span>
          ))}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {/* Featured Tags */}
            {product.product_details.featured?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">⭐ Featured:</p>
                <div className="flex flex-wrap gap-1">
                  {product.product_details.featured.map((tag, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Style & Metal */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">🎨 Style:</span>
                <p className="font-medium">{product.product_details.style_id || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">💎 Metal:</span>
                <p className="font-medium">{product.product_details.metal_id || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            {product.product_details.description && (
              <div>
                <span className="text-xs text-gray-600">📝 Description:</span>
                <p className="text-xs font-medium mt-1 line-clamp-2">{product.product_details.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-1"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== IMAGE POPUP COMPONENT ====================
const ImagePopup = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl z-10 hover:text-gray-300"
        >
          ✕
        </button>
        
        <div className="relative">
          <img
            src={`https://apichandra.rxsquare.in${images[currentIndex]}`}
            alt={`Product ${currentIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`flex-shrink-0 w-16 h-16 border-2 rounded ${
                  idx === currentIndex ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img
                  src={`https://apichandra.rxsquare.in${img}`}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-white text-center mt-2">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PRODUCT PANEL ====================
const EditProductPanel = ({ product, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.product_details.description || '',
    price: product.product_details.price,
    originalPrice: product.product_details.originalPrice,
    discount: product.product_details.discount,
    featured: product.product_details.featured || [],
    gender: product.product_details.gender || [],
    style_id: product.product_details.style_id || '',
    metal_id: product.product_details.metal_id || '',
    category_id: product.category_id || ''
  });

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState(product.product_details.images || []);

  // Fetch category details when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetchCategoryDetails(formData.category_id);
    }
  }, [formData.category_id]);

const fetchCategoryDetails = useCallback(async (catId) => {
  if (!catId) return;

  setLoading(true);

  try {
    // Fetch both API calls in parallel
    const [stylesRes, metalsRes] = await Promise.all([
      DoAll({
        action: 'get',
        table: 'by_style',
        where: { category_id: catId }
      }),
      DoAll({
        action: 'get',
        table: 'by_metal_and_stone',
        where: { category_id: catId }
      })
    ]);

    setCategoryData({
      styles: stylesRes?.data || [],
      metals: metalsRes?.data || []
    });

  } catch (error) {
    console.error("Error fetching category details:", error);
    alert("Failed to load category details.");
  } finally {
    setLoading(false);
  }
}, []);


  const handleImageSelect = (files) => {
    const fileArray = Array.from(files);
    const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...fileArray]);
    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
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

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      let uploadedImageUrls = [...imageUrls.filter(url => !url.startsWith('blob:'))];

      // Upload new images
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (uploadRes.data.success) {
          uploadedImageUrls = [...uploadedImageUrls, ...uploadRes.data.data.images.map(img => img.url)];
        }
      }

      const productDetails = {
        ...product.product_details,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        discount: parseInt(formData.discount),
        featured: formData.featured,
        gender: formData.gender,
        style_id: formData.style_id,
        metal_id: formData.metal_id,
        images: uploadedImageUrls,
        category: categories.find(c => c.id == formData.category_id)?.name || ''
      };

      const response = await axios.post(
        `${API_URL}/products/update`,
        {
          product_id: product.id,
          category_id: formData.category_id,
          name: formData.name,
          slug: formData.slug,
          product_details: productDetails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Product updated successfully');
        onSave();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            ✏️ Edit Product
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📂 Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: e.target.value, 
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔗 Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎨 Style *
                  </label>
                  <select
                    value={formData.style_id}
                    onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!categoryData}
                  >
                    <option value="">Select Style</option>
                    {categoryData?.styles.map(style => (
                      <option key={style.id} value={style.id}>{style.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💎 Metal/Stone *
                  </label>
                  <select
                    value={formData.metal_id}
                    onChange={(e) => setFormData({ ...formData, metal_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!categoryData}
                  >
                    <option value="">Select Metal</option>
                    {categoryData?.metals.map(metal => (
                      <option key={metal.id} value={metal.id}>{metal.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Product description..."
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💰 Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📊 Original Price
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎯 Discount %
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Features & Images */}
            <div className="space-y-4 sm:space-y-6">
              {/* Featured Options */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ⭐ Featured Tags
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                    <label key={feature} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured.includes(feature)}
                        onChange={() => toggleFeatured(feature)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  👥 Target Gender/Age
                </label>
                <div className="flex flex-wrap gap-4">
                  {['Kids', 'Men', 'Women'].map(gender => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.gender.includes(gender)}
                        onChange={() => toggleGender(gender)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Management */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🖼️ Product Images
                </label>
                
                {/* Image Upload */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(e.target.files)}
                  className="w-full text-sm mb-3"
                />

                {/* Image Previews */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={url.startsWith('blob:') ? url : `https://apichandra.rxsquare.in${url}`}
                          alt={`Preview ${idx + 1}`}
                          className="h-20 w-full object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                💾 Save Changes
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold text-sm sm:text-base"
          >
            ❌ Cancel
          </button>
        </div>
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
  const [activeProductTab, setActiveProductTab] = useState(0);

  const FILE_TYPE_OPTIONS = ['STL File', 'CAM Product', 'Rubber Mold', 'Casting Model'];

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_style',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_metal_and_stone',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] }
      };
      
      if (attributesRes.data.success) {
        attributesRes.data.data.forEach(attr => {
          attributes[attr.type] = { id: attr.id, options: attr.options };
        });
      }

      setCategoryData({
        styles: stylesRes.data.data,
        metals: metalsRes.data.data,
        attributes: attributes
      });
    } catch (error) {
      console.error('Error fetching category details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedStyles([]);
    setSelectedMetals([]);
    setProducts([]);
    setActiveProductTab(0);
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
    
    const newProduct = {
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
    };
    
    setProducts([...products, newProduct]);
    setActiveProductTab(products.length);
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    if (activeProductTab >= products.length - 1) {
      setActiveProductTab(Math.max(0, products.length - 2));
    }
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
      alert('Please add at least one product');
      return;
    }

    for (const product of products) {
      if (!product.name || !product.style_id || !product.metal_id || !product.price) {
        alert('Please fill all required fields for all products');
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      for (const product of products) {
        let uploadedImageUrls = [];
        if (product.imageFiles.length > 0) {
          const formData = new FormData();
          product.imageFiles.forEach(file => {
            formData.append('images', file);
          });

          const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          if (uploadRes.data.success) {
            uploadedImageUrls = uploadRes.data.data.images.map(img => img.url);
          }
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
          category: categories.find(c => c.id == selectedCategoryId)?.name || ''
        };

        const productRes = await axios.post(`${API_URL}/doAll`, {
          action: 'insert',
          table: 'products',
          data: {
            category_id: selectedCategoryId,
            name: product.name,
            slug: product.slug,
            product_details: JSON.stringify(productDetails)
          }
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (productRes.data.success && productRes.data.insertId) {
          const productDbId = productRes.data.insertId;
          const variants = [];

          for (const [key, isSelected] of Object.entries(product.selectedSizes)) {
            if (!isSelected) continue;

            const pricing = product.variantPricing[key];
            if (!pricing || !pricing.original_price) continue;

            const [metalPart, diamondPart, sizePart] = key.split('-');
            
            variants.push({
              metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
              diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
              size_option_id: parseInt(sizePart),
              original_price: parseFloat(pricing.original_price),
              discount_price: parseFloat(pricing.discount_price) || parseFloat(pricing.original_price),
              discount_percentage: parseInt(pricing.discount_percentage) || 0,
              file_types: pricing.file_types || []
            });
          }

          if (variants.length > 0) {
            await axios.post(
              `${API_URL}/product-variants/pricing`,
              { product_id: productDbId, variants },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
      }

      alert('✅ Products and variants saved successfully!');
      setProducts([]);
      setActiveProductTab(0);
      onRefresh();
    } catch (error) {
      console.error('Error saving products:', error);
      alert('❌ Error saving products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id == selectedCategoryId);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <span className="text-xl">📦</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Add Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Add new products with variant configurations
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-colors"
        >
          <span>←</span>
          <span>Back to Products</span>
        </button>
      </div>

      {/* Category Selection */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4 sm:mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="bg-blue-500 text-white p-1 rounded">📂</span>
          Select Category
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
        >
          <option value="">-- Select a Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category Details */}
      {categoryData && selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Styles Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <span className="bg-purple-100 p-1 rounded">🎨</span>
              Available Styles
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {categoryData.styles.map(style => (
                <label key={style.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors border border-gray-200 min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={selectedStyles.includes(style.id)}
                    onChange={() => toggleStyle(style.id)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{style.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metals Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <span className="bg-yellow-100 p-1 rounded">💎</span>
              Available Metals & Stones
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {categoryData.metals.map(metal => (
                <label key={metal.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors border border-gray-200 min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={selectedMetals.includes(metal.id)}
                    onChange={() => toggleMetal(metal.id)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{metal.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Button */}
      {categoryData && (
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={addProductRow}
            className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base flex items-center gap-2 transition-colors shadow-md"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
          
          {products.length > 0 && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              {products.length} product{products.length !== 1 ? 's' : ''} added
            </div>
          )}
        </div>
      )}

      {/* Products Tabs */}
      {products.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 overflow-x-auto">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => setActiveProductTab(index)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                    activeProductTab === index
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>📦</span>
                  <span>Product {index + 1}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(product.id);
                    }}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Product Forms */}
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className={`bg-white border-2 rounded-xl shadow-sm mb-6 transition-all duration-300 ${
            activeProductTab === index ? 'border-blue-300 block' : 'border-gray-200 hidden'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-xl border-b">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-3">
              <span className="bg-blue-500 text-white p-2 rounded-lg">📦</span>
              <span>Product #{index + 1} - {product.name || 'New Product'}</span>
            </h4>
          </div>

          <div className="p-4 sm:p-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>📝</span>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Diamond Heart Ring"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>📄</span>
                  Description
                </label>
                <input
                  type="text"
                  value={product.description || ''}
                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Beautiful description..."
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>🔗</span>
                  URL Slug
                </label>
                <input
                  type="text"
                  value={product.slug}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  placeholder="auto-generated-slug"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>🎨</span>
                  Style *
                </label>
                <select
                  value={product.style_id}
                  onChange={(e) => updateProduct(product.id, 'style_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Style</option>
                  {categoryData?.styles.map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
              </div>

              {/* Metal Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>💎</span>
                  Metal/Stone *
                </label>
                <select
                  value={product.metal_id}
                  onChange={(e) => updateProduct(product.id, 'metal_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Metal</option>
                  {categoryData?.metals.map(metal => (
                    <option key={metal.id} value={metal.id}>{metal.name}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    💰 Price *
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    📊 Original
                  </label>
                  <input
                    type="number"
                    value={product.originalPrice}
                    onChange={(e) => updateProduct(product.id, 'originalPrice', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="12000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    🎯 Discount %
                  </label>
                  <input
                    type="number"
                    value={product.discount}
                    onChange={(e) => updateProduct(product.id, 'discount', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            {/* Featured & Gender Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
              {/* Featured Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>⭐</span>
                  Featured Options
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                    <label key={feature} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={product.featured.includes(feature)}
                        onChange={() => toggleProductFeatured(product.id, feature)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>👥</span>
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Kids', 'Men', 'Women'].map(gender => (
                    <label key={gender} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors flex-1 min-w-[100px]">
                      <input
                        type="checkbox"
                        checked={product.gender.includes(gender)}
                        onChange={() => toggleProductGender(product.id, gender)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>🖼️</span>
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(product.id, e.target.files)}
                  className="hidden"
                  id={`image-upload-${product.id}`}
                />
                <label
                  htmlFor={`image-upload-${product.id}`}
                  className="cursor-pointer block"
                >
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload product images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {product.imageUrls.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {product.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={url} 
                          alt={`Preview ${idx + 1}`} 
                          className="h-24 w-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(product.id, idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          ×
                        </button>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Variant Configuration - This section remains largely the same but with responsive classes */}
             <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
            <h5 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
              ⚙️ Variant Configuration (Optional)
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Choice of Metal */}
              <div className="border-2 border-gray-200 rounded p-3">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.hasMetalChoice}
                    onChange={() => toggleProductMetalChoice(product.id)}
                    className="w-5 h-5"
                  />
                  <span className="font-bold">🔩 Choice of Metal</span>
                </label>
                
                {product.hasMetalChoice && (
                  <div className="space-y-2">
                    {categoryData?.attributes?.metal?.options?.map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
                        <input
                          type="checkbox"
                          checked={product.selectedMetalOptions.includes(opt.id)}
                          onChange={() => toggleProductMetalOption(product.id, opt.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{opt.option_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Diamond Quality */}
              <div className="border-2 border-gray-200 rounded p-3">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.hasDiamondChoice}
                    onChange={() => toggleProductDiamondChoice(product.id)}
                    className="w-5 h-5"
                  />
                  <span className="font-bold">💎 Diamond Quality</span>
                </label>
                
                {product.hasDiamondChoice && (
                  <div className="space-y-2">
                    {categoryData?.attributes?.diamond?.options?.map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
                        <input
                          type="checkbox"
                          checked={product.selectedDiamondOptions.includes(opt.id)}
                          onChange={() => toggleProductDiamondOption(product.id, opt.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{opt.option_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Info */}
              <div className="border-2 border-blue-300 rounded p-3 bg-blue-50">
                <h6 className="font-bold mb-2">📏 Sizes</h6>
                <p className="text-xs text-gray-600">Configure sizes below with pricing details</p>
              </div>
            </div>

            {/* Size & Pricing Configuration */}
            <div className="mt-4">
              <h6 className="font-bold mb-3">📐 Configure Sizes & Pricing:</h6>
              
              {/* Size Only (No Metal/Diamond) */}
              {!product.hasMetalChoice && !product.hasDiamondChoice && (
                <div className="space-y-3">
                  {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                    const key = `none-none-${sizeOpt.id}`;
                    const isSelected = product.selectedSizes[key];
                    const pricing = product.variantPricing[key] || {};
                    
                    return (
                      <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3">
                        <label className="flex items-center gap-3 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() => toggleProductSize(product.id, null, null, sizeOpt.id)}
                            className="w-5 h-5"
                          />
                          <span className="font-bold">
                            {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="ml-8 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                                <input
                                  type="number"
                                  placeholder="15000"
                                  value={pricing.original_price || ''}
                                  onChange={(e) => updateVariantPricing(product.id, null, null, sizeOpt.id, 'original_price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                                <input
                                  type="number"
                                  placeholder="13000"
                                  value={pricing.discount_price || ''}
                                  onChange={(e) => updateVariantPricing(product.id, null, null, sizeOpt.id, 'discount_price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                                <input
                                  type="number"
                                  placeholder="13"
                                  value={pricing.discount_percentage || ''}
                                  onChange={(e) => updateVariantPricing(product.id, null, null, sizeOpt.id, 'discount_percentage', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                              <div className="grid grid-cols-2 gap-2">
                                {FILE_TYPE_OPTIONS.map(fileType => (
                                  <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={pricing.file_types?.includes(fileType) || false}
                                      onChange={() => toggleVariantFileType(product.id, null, null, sizeOpt.id, fileType)}
                                      className="w-4 h-4"
                                    />
                                    <span>{fileType}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Metal Only (No Diamond) */}
              {product.hasMetalChoice && !product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
                const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
                return (
                  <div key={metalId} className="mb-4 border-2 border-blue-200 rounded p-4 bg-blue-50">
                    <h6 className="font-bold mb-3">{metalOpt?.option_name}</h6>
                    <div className="space-y-3">
                      {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                        const key = `${metalId}-none-${sizeOpt.id}`;
                        const isSelected = product.selectedSizes[key];
                        const pricing = product.variantPricing[key] || {};
                        
                        return (
                          <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                            <label className="flex items-center gap-3 mb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={() => toggleProductSize(product.id, metalId, null, sizeOpt.id)}
                                className="w-5 h-5"
                              />
                              <span className="font-bold">
                                {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                              </span>
                            </label>

                            {isSelected && (
                              <div className="ml-8 space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                                    <input
                                      type="number"
                                      placeholder="15000"
                                      value={pricing.original_price || ''}
                                      onChange={(e) => updateVariantPricing(product.id, metalId, null, sizeOpt.id, 'original_price', e.target.value)}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                                    <input
                                      type="number"
                                      placeholder="13000"
                                      value={pricing.discount_price || ''}
                                      onChange={(e) => updateVariantPricing(product.id, metalId, null, sizeOpt.id, 'discount_price', e.target.value)}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                                    <input
                                      type="number"
                                      placeholder="13"
                                      value={pricing.discount_percentage || ''}
                                      onChange={(e) => updateVariantPricing(product.id, metalId, null, sizeOpt.id, 'discount_percentage', e.target.value)}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {FILE_TYPE_OPTIONS.map(fileType => (
                                      <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={pricing.file_types?.includes(fileType) || false}
                                          onChange={() => toggleVariantFileType(product.id, metalId, null, sizeOpt.id, fileType)}
                                          className="w-4 h-4"
                                        />
                                        <span>{fileType}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Metal + Diamond */}
              {product.hasMetalChoice && product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
                const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
                return product.selectedDiamondOptions.map(diamondId => {
                  const diamondOpt = categoryData?.attributes?.diamond?.options?.find(o => o.id === diamondId);
                  return (
                    <div key={`${metalId}-${diamondId}`} className="mb-4 border-2 border-purple-200 rounded p-4 bg-purple-50">
                      <h6 className="font-bold mb-3">{metalOpt?.option_name} + {diamondOpt?.option_name}</h6>
                      <div className="space-y-3">
                        {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                          const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
                          const isSelected = product.selectedSizes[key];
                          const pricing = product.variantPricing[key] || {};
                          
                          return (
                            <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected || false}
                                  onChange={() => toggleProductSize(product.id, metalId, diamondId, sizeOpt.id)}
                                  className="w-5 h-5"
                                />
                                <span className="font-bold">
                                  {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                                </span>
                              </label>

                              {isSelected && (
                                <div className="ml-8 space-y-3">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                                      <input
                                        type="number"
                                        placeholder="15000"
                                        value={pricing.original_price || ''}
                                        onChange={(e) => updateVariantPricing(product.id, metalId, diamondId, sizeOpt.id, 'original_price', e.target.value)}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                      />
                                    </div>
                                   <div>
                                      <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                                      <input
                                        type="number"
                                        placeholder="13000"
                                        value={pricing.discount_price || ''}
                                        onChange={(e) => updateVariantPricing(product.id, metalId, diamondId, sizeOpt.id, 'discount_price', e.target.value)}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                                      <input
                                        type="number"
                                        placeholder="13"
                                        value={pricing.discount_percentage || ''}
                                        onChange={(e) => updateVariantPricing(product.id, metalId, diamondId, sizeOpt.id, 'discount_percentage', e.target.value)}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {FILE_TYPE_OPTIONS.map(fileType => (
                                        <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={pricing.file_types?.includes(fileType) || false}
                                            onChange={() => toggleVariantFileType(product.id, metalId, diamondId, sizeOpt.id, fileType)}
                                            className="w-4 h-4"
                                          />
                                          <span>{fileType}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
          </div>
        </div>
      ))}

      {/* Save Button */}
      {products.length > 0 && (
        <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <button
            onClick={saveProducts}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Saving All Products...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save {products.length} Product{products.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;