import { useState, useEffect } from 'react';
import { DoAll } from '../auth/api';
import { Plus, Edit2, Trash2, Loader, Tag, Gem, Sparkles, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CategoryModal from "../Models/Categories/CategoryModal";
import { data } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState();
  const [categoryDetails, setCategoryDetails] = useState({});
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
    };
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [categories, searchTerm, selectedFilter, sortBy]);

const fetchCategories = async () => {
  try {
    setLoading(true);
    const response = await DoAll({ 
      action: 'get', 
      table: 'category',
      where: { is_deleted: 0 }
    });
    
    // ✅ FIX: The response structure is { success, data, count }
    // NOT response.data.success
    
    if (!response?.success) {
      throw new Error('Invalid API response structure');
    }
    
    const categoriesData = response.data || [];
    setCategories(categoriesData);
    
    if (categoriesData.length > 0) {
      await fetchAllCategoryDetails(categoriesData);
    } else {
      setCategoryDetails({});
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Error loading categories');
    setCategories([]);
    setCategoryDetails({});
  } finally {
    setLoading(false);
  }
};

const fetchAllCategoryDetails = async (categoriesData) => {
  const details = {};
  
  const promises = categoriesData.map(async (category) => {
    try {
      const [styleResponse, metalResponse] = await Promise.allSettled([
        DoAll({
          action: 'get',
          table: 'by_style',
          where: { category_id: category.id, is_deleted: 0 }
        }),
        DoAll({
          action: 'get',
          table: 'by_metal_and_stone',
          where: { category_id: category.id, is_deleted: 0 }
        })
      ]);

      // ✅ FIX: Check response.success not response.value.data.success
      const styles = styleResponse.status === 'fulfilled' && 
                    styleResponse.value?.success ? 
                    (styleResponse.value.data || []) : [];
      
      const metals = metalResponse.status === 'fulfilled' && 
                    metalResponse.value?.success ? 
                    (metalResponse.value.data || []) : [];

      details[category.id] = {
        styles: Array.isArray(styles) ? styles : [],
        metals: Array.isArray(metals) ? metals : []
      };
    } catch (error) {
      console.error(`Error fetching details for category ${category.id}:`, error);
      details[category.id] = { styles: [], metals: [] };
    }
  });

  await Promise.allSettled(promises);
  setCategoryDetails(details);
};


  const applyFiltersAndSearch = () => {
    let filtered = [...categories];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(category => {
        const details = categoryDetails[category.id] || { styles: [], metals: [] };
        const styles = Array.isArray(details.styles) ? details.styles : [];
        const metals = Array.isArray(details.metals) ? details.metals : [];

        switch (selectedFilter) {
          case 'with-styles':
            return styles.length > 0;
          case 'with-metals':
            return metals.length > 0;
          case 'with-both':
            return styles.length > 0 && metals.length > 0;
          case 'empty':
            return styles.length === 0 && metals.length === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'styles-count':
          const aStyles = Array.isArray(categoryDetails[a.id]?.styles) ? categoryDetails[a.id].styles.length : 0;
          const bStyles = Array.isArray(categoryDetails[b.id]?.styles) ? categoryDetails[b.id].styles.length : 0;
          return bStyles - aStyles;
        case 'metals-count':
          const aMetals = Array.isArray(categoryDetails[a.id]?.metals) ? categoryDetails[a.id].metals.length : 0;
          const bMetals = Array.isArray(categoryDetails[b.id]?.metals) ? categoryDetails[b.id].metals.length : 0;
          return bMetals - aMetals;
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // const handleEdit = (category) => {
  //   setEditingCategory(category);
  //   setShowModal(true);
  // };

const handleEdit = async (category) => {
  try {
    // Get the details from categoryDetails state (which was already fetched)
    const details = categoryDetails[category.id] || { styles: [], metals: [] };
    
    // Create a category object with all the details
    const categoryWithDetails = {
      ...category,
      styles: Array.isArray(details.styles) ? details.styles : [],
      metals: Array.isArray(details.metals) ? details.metals : []
    };

    setEditingCategory(categoryWithDetails);
    setShowModal(true);
  } catch (error) {
    console.error('Error preparing category for edit:', error);
    toast.error('Error loading category details');
    // Fallback with just basic category data
    setEditingCategory(category);
    setShowModal(true);
  }
};

const handleDelete = async (categoryId) => {
  if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
    return;
  }

  setDeletingId(categoryId);
  try {
    await DoAll({
      action: 'soft_delete',
      table: 'category',
      where: { id: categoryId }
    });
    
    // Since the delete is working, just assume success and refresh
    toast.success('Category deleted successfully!');
    await fetchCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error('Error deleting category');
  } finally {
    setDeletingId(null);
  }
};

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading categories...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || selectedFilter !== 'all' || sortBy !== 'name';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Categories Management</h1>
                <p className="text-sm text-gray-600">Manage your product categories and their attributes</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
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
                placeholder="Search categories by name or slug..."
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
                <option value="all">All Categories</option>
                <option value="with-styles">With Style Options</option>
                <option value="with-metals">With Metal Options</option>
                <option value="with-both">With Both Options</option>
                <option value="empty">No Options</option>
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
                <option value="styles-count">Sort by: Most Styles</option>
                <option value="metals-count">Sort by: Most Metals</option>
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

            {/* Results Count */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredCategories.length} of {categories.length} categories
                {hasActiveFilters && ' (filtered)'}
              </p>
              
              {hasActiveFilters && filteredCategories.length === 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map(category => {
            const details = categoryDetails[category.id] || { styles: [], metals: [] };
            const styles = Array.isArray(details.styles) ? details.styles : [];
            const metals = Array.isArray(details.metals) ? details.metals : [];
            
            return (
              <div 
                key={category.id} 
                className="bg-white rounded-lg shadow-md border border-emerald-100 p-4 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1">
                    {category.name}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-md transition-all duration-200 hover:scale-110"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
                      title="Delete Category"
                    >
                      {deletingId === category.id ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Slug Section */}
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-500" />
                      <h4 className="text-xs font-semibold text-gray-700">Slug</h4>
                    </div>
                    <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-200 truncate">
                      {category.slug}
                    </p>
                  </div>
                  
                  {/* Style Options */}
                  <div>
                    <div className="flex items-center space-x-1 mb-2">  
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <h4 className="text-xs font-semibold text-gray-700">
                        Style Options ({styles.length})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {styles.length > 0 ? (
                        styles.map(style => (
                          <span 
                            key={style.id || style.name}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                          >
                            {style.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">No style options</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Metal & Stone Options */}
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      <Gem className="w-3.5 h-3.5 text-emerald-500" />
                      <h4 className="text-xs font-semibold text-gray-700">
                        Metal & Stone Options ({metals.length})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {metals.length > 0 ? (
                        metals.map(metal => (
                          <span 
                            key={metal.id || metal.name}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                          >
                            {metal.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">No metal/stone options</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? 'No categories found' : 'No Categories Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first category to organize your products'
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
                  onClick={handleAddNew}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create Your First Category
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingCategory={editingCategory}
        fetchCategories={fetchCategories}
      />
    </div>
  );
};

export default Categories;