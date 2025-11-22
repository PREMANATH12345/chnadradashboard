import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3019/api/v1/dashboard';

const Products = () => {
  const [view, setView] = useState('main');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: 'get', table: 'category' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Products Management</h1>

      {view === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Add Category */}
          <div 
            onClick={() => setView('add-category')}
            className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📁</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Add Category</h3>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Create and manage product categories</p>
            </div>
          </div>

          {/* Attributes */}
          <div 
            onClick={() => setView('attributes')}
            className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚙️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Attributes</h3>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Size, Metal, Diamond</p>
            </div>
          </div>

          {/* Add Products */}
          <div 
            onClick={() => {
              if (categories.length === 0) {
                alert('Please create a category first!');
                return;
              }
              setView('add-products');
            }}
            className={`bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border-2 border-gray-200 cursor-pointer transition-all ${
              categories.length > 0 ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🛍️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Add Products</h3>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Add products to your categories</p>
              {categories.length === 0 && (
                <p className="text-red-500 text-xs sm:text-sm mt-1 sm:mt-2">Create a category first</p>
              )}
            </div>
          </div>

          {/* View Products */}
          <div 
            onClick={() => {
              if (categories.length === 0) {
                alert('No categories available!');
                return;
              }
              setView('view-products');
            }}
            className={`bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border-2 border-gray-200 cursor-pointer transition-all ${
              categories.length > 0 ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">👁️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">View Products</h3>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Browse all created products</p>
            </div>
          </div>
        </div>
      )}

      {view === 'add-category' && (
        <AddCategory 
          onBack={() => setView('main')} 
          onRefresh={fetchCategories}
          categories={categories}
        />
      )}

      {view === 'attributes' && (
        <AttributesTab onBack={() => setView('main')} />
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
  );
};

// ==================== ATTRIBUTES TAB ====================
const AttributesTab = ({ onBack }) => {
  const [activeAttribute, setActiveAttribute] = useState(null);
  const [attributes, setAttributes] = useState({
    metal: { id: null, options: [] },
    diamond: { id: null, options: [] },
    size: { id: null, options: [] }
  });
  const [newOption, setNewOption] = useState({ name: '', value: '', size_mm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/attributes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const grouped = { metal: { id: null, options: [] }, diamond: { id: null, options: [] }, size: { id: null, options: [] } };
        response.data.data.forEach(attr => {
          grouped[attr.type] = { id: attr.id, options: attr.options };
        });
        setAttributes(grouped);
      }
    } catch (error) {
      console.error('Fetch attributes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.name) {
      alert('Please enter option name');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      // If attribute doesn't exist, create it first
      if (!attributes[activeAttribute].id) {
        const createRes = await axios.post(
          `${API_URL}/attributes`,
          {
            name: activeAttribute === 'metal' ? 'Choice of Metal' : 
                  activeAttribute === 'diamond' ? 'Diamond Quality' : 'Size',
            type: activeAttribute,
            options: [
              activeAttribute === 'size' 
                ? { option_name: newOption.name, option_value: newOption.value, size_mm: newOption.size_mm }
                : { option_name: newOption.name, option_value: newOption.value || newOption.name }
            ]
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (createRes.data.success) {
          await fetchAttributes();
          setNewOption({ name: '', value: '', size_mm: '' });
          alert('Attribute created successfully!');
        }
      } else {
        // Add option to existing attribute
        const addRes = await axios.post(
          `${API_URL}/attributes/add-option`,
          {
            attribute_id: attributes[activeAttribute].id,
            option_name: newOption.name,
            option_value: newOption.value || newOption.name,
            size_mm: activeAttribute === 'size' ? newOption.size_mm : null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (addRes.data.success) {
          await fetchAttributes();
          setNewOption({ name: '', value: '', size_mm: '' });
          alert('Option added successfully!');
        }
      }
    } catch (error) {
      console.error('Add option error:', error);
      alert('Error adding option');
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (!confirm('Are you sure you want to delete this option?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/attributes/delete-option`,
        { option_id: optionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        await fetchAttributes();
        alert('Option deleted successfully');
      }
    } catch (error) {
      console.error('Delete option error:', error);
      alert('Error deleting option');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Attributes</h2>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">← Back</button>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Attributes</h3>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">Size, Metal, Diamond</p>
      </div>

      {/* Attribute Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveAttribute('metal')}
          className={`p-4 sm:p-6 rounded-lg border-2 text-left ${activeAttribute === 'metal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <h4 className="font-semibold text-base sm:text-lg">Choice of Metal</h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{attributes.metal.options.length} options</p>
        </button>
        
        <button
          onClick={() => setActiveAttribute('diamond')}
          className={`p-4 sm:p-6 rounded-lg border-2 text-left ${activeAttribute === 'diamond' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <h4 className="font-semibold text-base sm:text-lg">Diamond Quality</h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{attributes.diamond.options.length} options</p>
        </button>
        
        <button
          onClick={() => setActiveAttribute('size')}
          className={`p-4 sm:p-6 rounded-lg border-2 text-left ${activeAttribute === 'size' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
          <h4 className="font-semibold text-base sm:text-lg">Size</h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{attributes.size.options.length} options</p>
        </button>
      </div>

      {/* Active Attribute Options */}
      {activeAttribute && (
        <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6">
          <h4 className="font-semibold text-lg sm:text-xl mb-3 sm:mb-4">
            {activeAttribute === 'metal' ? 'Choice of Metal' : 
             activeAttribute === 'diamond' ? 'Diamond Quality' : 'Size'} Options
          </h4>

          {/* Existing Options */}
          {attributes[activeAttribute].options.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Existing Options:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {attributes[activeAttribute].options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 rounded-md text-xs sm:text-sm">
                    <span>{opt.option_name}</span>
                    {activeAttribute === 'size' && opt.size_mm && (
                      <span className="text-xs text-gray-500">({opt.size_mm}mm)</span>
                    )}
                    <button
                      onClick={() => handleDeleteOption(opt.id)}
                      className="text-red-500 hover:text-red-700 font-bold ml-1 sm:ml-2 text-sm sm:text-base"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Option Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                {activeAttribute === 'metal' ? 'Metal Type (e.g., 14KT Yellow Gold, 18KT Rose Gold)' :
                 activeAttribute === 'diamond' ? 'Diamond Quality (e.g., GH-SI, FG-SI)' :
                 'Size Number'}
              </label>
              <input
                type="text"
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder={activeAttribute === 'size' ? '5' : '14KT Yellow Gold'}
              />
            </div>

            {activeAttribute === 'size' && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Size Value (optional)</label>
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Size in MM</label>
                  <input
                    type="text"
                    value={newOption.size_mm}
                    onChange={(e) => setNewOption({ ...newOption, size_mm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    placeholder="15.7"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleAddOption}
              className="w-full py-2 sm:py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-sm sm:text-base"
            >
              {attributes[activeAttribute].options.length > 0 ? 'Add Another Option' : 'Add Option'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ADD CATEGORY COMPONENT ====================
const AddCategory = ({ onBack, onRefresh, categories }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [byStyleItems, setByStyleItems] = useState(['']);
  const [byMetalItems, setByMetalItems] = useState(['']);
  const [saving, setSaving] = useState(false);

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
    const token = localStorage.getItem('token');

    try {
      const catResponse = await axios.post(
        `${API_URL}/doAll`,
        {
          action: 'insert',
          table: 'category',
          data: { name: categoryName, slug: categorySlug }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const categoryId = catResponse.data.insertId;

      for (const style of validStyles) {
        await axios.post(
          `${API_URL}/doAll`,
          {
            action: 'insert',
            table: 'by_style',
            data: { category_id: categoryId, name: style }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      for (const metal of validMetals) {
        await axios.post(
          `${API_URL}/doAll`,
          {
            action: 'insert',
            table: 'by_metal_and_stone',
            data: { category_id: categoryId, name: metal }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert('Category created successfully!');
      onRefresh();
      
      setCategoryName('');
      setCategorySlug('');
      setByStyleItems(['']);
      setByMetalItems(['']);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error creating category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Category</h2>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">← Back</button>
      </div>

      {categories.length > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Existing Categories:</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {categories.map(cat => (
              <span key={cat.id} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category Name</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => handleCategoryNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          placeholder="e.g., Rings, Necklaces, Earrings"
        />
        {categorySlug && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Slug: {categorySlug}</p>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category by Style</label>
        {byStyleItems.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateStyleItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="e.g., Couple Ring, Solitaire, Band"
            />
            {byStyleItems.length > 1 && (
              <button
                onClick={() => removeStyleItem(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm sm:text-base"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addStyleItem}
          className="mt-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm sm:text-base"
        >
          + Add Style
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category by Metal & Stone</label>
        {byMetalItems.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateMetalItem(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="e.g., Gold Ring, Diamond Ring, Platinum"
            />
            {byMetalItems.length > 1 && (
              <button
                onClick={() => removeMetalItem(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm sm:text-base"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addMetalItem}
          className="mt-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm sm:text-base"
        >
          + Add Metal/Stone
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base"
      >
        {saving ? 'Saving...' : 'Save Category'}
      </button>
    </div>
  );
};

// ==================== ADD PRODUCTS COMPONENT ====================
const AddProducts = ({ onBack, categories, onRefresh }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryData, setCategoryData] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({
    metal: [],
    diamond: [],
    size: []
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

   // Add this function to handle attribute selection
  const toggleAttribute = (type, optionId) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [type]: prev[type].includes(optionId) 
        ? prev[type].filter(id => id !== optionId)
        : [...prev[type], optionId]
    }));
  };

  // const fetchCategoryDetails = async (catId) => {
  //   setLoading(true);
  //   const token = localStorage.getItem('token');
    
  //   try {
  //     const [stylesRes, metalsRes] = await Promise.all([
  //       axios.post(`${API_URL}/doAll`, {
  //         action: 'get',
  //         table: 'by_style',
  //         where: { category_id: catId }
  //       }, { headers: { Authorization: `Bearer ${token}` } }),
  //       axios.post(`${API_URL}/doAll`, {
  //         action: 'get',
  //         table: 'by_metal_and_stone',
  //         where: { category_id: catId }
  //       }, { headers: { Authorization: `Bearer ${token}` } })
  //     ]);

  //     setCategoryData({
  //       styles: stylesRes.data.data,
  //       metals: metalsRes.data.data
  //     });
  //   } catch (error) {
  //     console.error('Error fetching category details:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchCategoryDetails = async (catId) => {
  setLoading(true);
  const token = localStorage.getItem('token');
  
  try {
    // Fetch category styles and metals (for product categorization)
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
      // ✅ NEW - Fetch global attributes (metal, diamond, size)
      axios.get(`${API_URL}/attributes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    // Parse attributes by type
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
      attributes: attributes  // ✅ Add attributes to state
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
    const defaultMetalOption = selectedAttributes.metal.length > 0 ? selectedAttributes.metal[0] : '';
    const defaultDiamondOption = selectedAttributes.diamond.length > 0 ? selectedAttributes.diamond[0] : '';
    const defaultSizeOption = selectedAttributes.size.length > 0 ? selectedAttributes.size[0] : '';
    
    setProducts([...products, {
      id: Date.now(),
      name: '',
      slug: '',
      style_id: defaultStyle,
      metal_id: defaultMetal,
      metal_option_id: defaultMetalOption,      
      diamond_option_id: defaultDiamondOption,    
      size_option_id: defaultSizeOption,         
      price: '',
      originalPrice: '',
      discount: 0,
      featured: [],
      gender: [],
      imageFiles: [], // Array of File objects
      imageUrls: []    // Array of URLs (for preview)
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
        // Upload images first
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

        await axios.post(`${API_URL}/doAll`, {
          action: 'insert',
          table: 'products',
          data: {
            category_id: selectedCategoryId,
            name: product.name,
            slug: product.slug,
            product_details: JSON.stringify(productDetails)
          }
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      alert('Products saved successfully!');
      setProducts([]);
      onRefresh();
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Error saving products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id == selectedCategoryId);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Products</h2>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">← Back</button>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Select Category</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {categoryData && selectedCategory && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-gray-200 rounded-lg">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{selectedCategory.name}</h3>
          
          <div className="mb-3 sm:mb-4">
            <p className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Category by Style:</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {categoryData.styles.map(style => (
                <label key={style.id} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={selectedStyles.includes(style.id)}
                    onChange={() => toggleStyle(style.id)}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span>{style.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Category by Metal & Stone:</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {categoryData.metals.map(metal => (
                <label key={metal.id} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={selectedMetals.includes(metal.id)}
                    onChange={() => toggleMetal(metal.id)}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span>{metal.name}</span>
                </label>
              ))}
              
            </div>
          </div>    
          {/* ✅ ADD THESE LINES - Attribute dropdowns for category section */}
{categoryData?.attributes && (
  <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
    {/* Choice of Metal */}
    <div>
      <p className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Choice of Metal:</p>
      <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base">
        <option value="">Select Metal Type</option>
        {categoryData.attributes.metal?.options?.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.option_name}</option>
        ))}
      </select>
    </div>

    {/* Diamond Quality */}
    <div>
      <p className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Diamond Quality:</p>
      <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base">
        <option value="">Select Diamond</option>
        {categoryData.attributes.diamond?.options?.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.option_name}</option>
        ))}
      </select>
    </div>

    {/* Size */}
    <div>
      <p className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Size:</p>
      <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base">
        <option value="">Select Size</option>
        {categoryData.attributes.size?.options?.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.option_name} {opt.size_mm && `(${opt.size_mm}mm)`}
          </option>
        ))}
      </select>
    </div>
  </div>
)}
        </div>
        
      )}

      {categoryData && (
        <button
          onClick={addProductRow}
          className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-sm sm:text-base"
        >
          + Add Product Row
        </button>
      )}

      {products.map((product, index) => (
        <div key={product.id} className="mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-gray-300 rounded-lg">
          <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product #{index + 1}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="e.g., Swirl Heart Ring"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Style *</label>
              <select
                value={product.style_id}
                onChange={(e) => updateProduct(product.id, 'style_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
              >
                <option value="">Select Style</option>
                {categoryData?.styles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Metal/Stone *</label>
              <select
                value={product.metal_id}
                onChange={(e) => updateProduct(product.id, 'metal_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
              >
                <option value="">Select Metal</option>
                {categoryData?.metals.map(metal => (
                  <option key={metal.id} value={metal.id}>{metal.name}</option>
                ))}
              </select>
            </div>

            {/* ✅ NEW - Choice of Metal Attribute */}
<div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Choice of Metal</label>
  <select
    value={product.metal_option_id || ''}
    onChange={(e) => updateProduct(product.id, 'metal_option_id', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
  >
    <option value="">Select Metal Type</option>
    {categoryData?.attributes?.metal?.options?.map(opt => (
      <option key={opt.id} value={opt.id}>{opt.option_name}</option>
    ))}
  </select>
</div>

{/* ✅ NEW - Diamond Quality */}
<div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Diamond Quality</label>
  <select
    value={product.diamond_option_id || ''}
    onChange={(e) => updateProduct(product.id, 'diamond_option_id', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
  >
    <option value="">Select Diamond</option>
    {categoryData?.attributes?.diamond?.options?.map(opt => (
      <option key={opt.id} value={opt.id}>{opt.option_name}</option>
    ))}
  </select>
</div>

{/* ✅ NEW - Size */}
<div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Size</label>
  <select
    value={product.size_option_id || ''}
    onChange={(e) => updateProduct(product.id, 'size_option_id', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
  >
    <option value="">Select Size</option>
    {categoryData?.attributes?.size?.options?.map(opt => (
      <option key={opt.id} value={opt.id}>
        {opt.option_name} {opt.size_mm && `(${opt.size_mm}mm)`}
      </option>
    ))}
  </select>
</div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                value={product.originalPrice}
                onChange={(e) => updateProduct(product.id, 'originalPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="12000"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                value={product.discount}
                onChange={(e) => updateProduct(product.id, 'discount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Slug (auto)</label>
              <input
                type="text"
                value={product.slug}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Featured</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                <label key={feature} className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={product.featured.includes(feature)}
                    onChange={() => toggleProductFeatured(product.id, feature)}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">For Gender/Age</label>
            <div className="flex gap-2 sm:gap-4">
              {['Kids', 'Men', 'Women'].map(gender => (
                <label key={gender} className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={product.gender.includes(gender)}
                    onChange={() => toggleProductGender(product.id, gender)}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Product Images (Multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageSelect(product.id, e.target.files)}
              className="w-full text-xs sm:text-sm"
            />
            {product.imageUrls.length > 0 && (
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                {product.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`Preview ${idx + 1}`} className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded" />
                    <button
                      onClick={() => removeImage(product.id, idx)}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {products.length > 0 && (
        <button
          onClick={saveProducts}
          disabled={loading}
          className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base"
        >
          {loading ? 'Saving...' : `Save ${products.length} Product(s)`}
        </button>
      )}
    </div>
  );
};

// ==================== VIEW PRODUCTS COMPONENT (TABLE FORMAT) ====================
const ViewProducts = ({ onBack, categories }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePopup, setImagePopup] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">View Products</h2>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">← Back</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left Sidebar - Categories */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label
                key={cat.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="font-medium text-sm sm:text-base">{cat.name}</span>
              </label>
            ))}
          </div>

          {selectedCategoryIds.length > 0 && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-md">
              <p className="text-xs sm:text-sm text-blue-800">
                {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
              </p>
            </div>
          )}
        </div>

        {/* Right Content - Products Table */}
        <div className="flex-1 overflow-x-auto">
          {selectedCategoryIds.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg">Select a category to view products</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg">No products found in selected categories</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">ID</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Name</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Slug</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Category</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Price</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Discount</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Gender</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Featured</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Images</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">{product.id}</td>
                      <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{product.name}</td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600">{product.slug}</td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">{product.product_details.category}</td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div>
                          <span className="font-bold text-green-600">₹{product.product_details.price?.toLocaleString()}</span>
                          {product.product_details.originalPrice > product.product_details.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.product_details.originalPrice?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        {product.product_details.discount > 0 && (
                          <span className="bg-red-100 text-red-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-semibold">
                            {product.product_details.discount}%
                          </span>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div>
                          {product.product_details.gender?.join(', ') || '-'}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div className="flex flex-wrap gap-1">
                          {product.product_details.featured?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <button
                          onClick={() => setImagePopup(product.product_details.images || [])}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          👁️ <span className="text-xs sm:text-sm">({product.product_details.images?.length || 0})</span>
                        </button>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => setEditProduct(product)}
                            className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

// ==================== IMAGE POPUP COMPONENT ====================
const ImagePopup = ({ images, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Product Images ({images.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl sm:text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              <img
                src={`http://localhost:3019${img}`}
                alt={`Product ${idx + 1}`}
                className="w-full h-40 sm:h-48 object-cover"
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

// ==================== EDIT PRODUCT MODAL ====================
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
    const token = localStorage.getItem('token');

    try {
      const updatedDetails = {
        ...product.product_details,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        discount: parseInt(formData.discount),
        featured: formData.featured,
        gender: formData.gender
      };

      const response = await axios.post(
        `${API_URL}/products/update`,
        {
          product_id: product.id,
          name: formData.name,
          slug: formData.slug,
          product_details: updatedDetails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Product updated successfully');
        onSave();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
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
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl sm:text-2xl">×</button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Original Price</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount %</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 sm:mb-2">Featured</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                <label key={feature} className="flex items-center gap-1 sm:gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.featured.includes(feature)}
                    onChange={() => toggleFeatured(feature)}
                    className="w-4 h-4"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 sm:mb-2">Gender</label>
            <div className="flex gap-2 sm:gap-4">
              {['Kids', 'Men', 'Women'].map(gender => (
                <label key={gender} className="flex items-center gap-1 sm:gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.gender.includes(gender)}
                    onChange={() => toggleGender(gender)}
                    className="w-4 h-4"
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm sm:text-base"
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