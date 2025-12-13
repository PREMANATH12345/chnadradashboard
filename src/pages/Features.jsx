import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoAll } from '../auth/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Loader, 
  Eye, 
  EyeOff, 
  X,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  SortAsc,
  Grid
} from 'lucide-react';

const Features = () => {
  const navigate = useNavigate();
  const [featureOptions, setFeatureOptions] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: ''
  });

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Fetch feature options on component mount
  useEffect(() => {
    fetchFeatureOptions();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [featureOptions, searchTerm, selectedFilter, sortBy]);

  const fetchFeatureOptions = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: 'get',
        table: 'feature_options',
        where: { is_deleted: 0 }
      });

      if (response?.success) {
        const options = response.data || [];
        setFeatureOptions(options);
      } else {
        throw new Error('Failed to fetch feature options');
      }
    } catch (error) {
      console.error('Error fetching feature options:', error);
      toast.error('Error loading feature sections');
      setFeatureOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...featureOptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(option =>
        option.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'active':
          filtered = filtered.filter(option => option.is_active === 1);
          break;
        case 'inactive':
          filtered = filtered.filter(option => option.is_active === 0);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'name-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'active':
          return (b.is_active || 0) - (a.is_active || 0);
        default:
          return 0;
      }
    });

    setFilteredFeatures(filtered);
  };

  // Handle form input changes - Only title field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission - Only saves title
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    try {
      // Prepare data for API - Only include title
      const apiData = {
        title: formData.title.trim()
      };

      let response;
      
      if (editingOption) {
        // Update existing feature option with only title
        response = await DoAll({
          action: 'update',
          table: 'feature_options',
          data: apiData,
          where: { id: editingOption.id }
        });
        
        if (response?.success) {
          toast.success('Feature section updated successfully!');
        }
      } else {
        // For new items, set default is_active only
        const newItemData = {
          ...apiData,
        
        };
        
        response = await DoAll({
          action: 'insert',
          table: 'feature_options',
          data: newItemData
        });
        
        if (response?.success) {
          toast.success('Feature section created successfully!');
        }
      }

      if (response?.success) {
        setShowModal(false);
        setFormData({ title: '' });
        setEditingOption(null);
        fetchFeatureOptions();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error saving feature option:', error);
      toast.error('Error saving feature section');
    }
  };

  // Handle edit
  const handleEdit = (option) => {
    setEditingOption(option);
    setFormData({
      title: option.title || ''
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feature section? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await DoAll({
        action: 'soft_delete',
        table: 'feature_options',
        where: { id }
      });
      
      if (response?.success) {
        toast.success('Feature section deleted successfully!');
        fetchFeatureOptions();
      } else {
        throw new Error('Failed to delete feature option');
      }
    } catch (error) {
      console.error('Error deleting feature option:', error);
      toast.error('Error deleting feature section');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (option) => {
    try {
      const newStatus = option.is_active ? 0 : 1;
      const response = await DoAll({
        action: 'update',
        table: 'feature_options',
        data: { is_active: newStatus },
        where: { id: option.id }
      });
      
      if (response?.success) {
        toast.success(`Feature section ${newStatus ? 'activated' : 'deactivated'}!`);
        fetchFeatureOptions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedFilter !== 'all' || sortBy !== 'name';

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading feature sections...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Feature Sections Management</h1>
                <p className="text-sm text-gray-600">Manage your feature sections and their content</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingOption(null);
                setFormData({ title: '' });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Feature Section</span>
            </button>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm text-emerald-700 font-medium">Total Sections</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{featureOptions.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium">Active Sections</div>
              <div className="text-2xl font-bold text-green-800 mt-1">
                {featureOptions.filter(opt => opt.is_active).length}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm text-amber-700 font-medium">Inactive Sections</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">
                {featureOptions.filter(opt => !opt.is_active).length}
              </div>
            </div>
          </div> */}

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sections by title..."
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
                <option value="name">Sort by: Title A-Z</option>
                <option value="name-desc">Sort by: Title Z-A</option>
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="active">Sort by: Active First</option>
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
                Showing {filteredFeatures.length} of {featureOptions.length} sections
                {hasActiveFilters && ' (filtered)'}
              </p>
              
              {hasActiveFilters && filteredFeatures.length === 0 && (
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

        {/* Feature Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map(option => (
            <div 
              key={option.id}
              className={`bg-white rounded-lg shadow-md border ${
                option.is_active ? 'border-emerald-200 hover:border-emerald-300' : 'border-gray-200 hover:border-gray-300'
              } p-4 hover:shadow-lg transition-all duration-300 group`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {/* <div className={`p-2 rounded-lg ${
                    option.is_active 
                      ? 'bg-gradient-to-br from-emerald-500 to-green-500' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    
                  </div> */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">Feature Section</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {/* <button
                    onClick={() => toggleActiveStatus(option)}
                    className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 ${
                      option.is_active 
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={option.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {option.is_active ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button> */}
                  <button
                    onClick={() => handleEdit(option)}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-all duration-200 hover:scale-110"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(option.id)}
                    disabled={deletingId === option.id}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === option.id ? (
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Status Badge */}
                {/* <div className="flex items-center space-x-2">
                  {option.is_active ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    </>
                  )}
                </div> */}

                {/* ID Section */}
                {/* <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-1">Section ID</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                    #{option.id}
                  </p>
                </div> */}

                {/* Created Date */}
                {/* {option.created_at && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      Created: {new Date(option.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )} */}
              </div>

              {/* Footer Actions */}
              {/* <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 group/btn"
                >
                  <span>Manage Content</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div> */}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? 'No sections found' : 'No Feature Sections Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Create your first feature section to highlight products or content'
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
                  onClick={() => {
                    setEditingOption(null);
                    setFormData({ title: '' });
                    setShowModal(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create Your First Section
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Side Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0  bg-opacity-50 transition-opacity z-40"
            onClick={() => {
              setShowModal(false);
              setEditingOption(null);
            }}
          ></div>
          
          {/* Right Side Modal */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingOption ? 'Edit Feature Section' : 'Create Feature Section'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingOption ? 'Update the section title' : 'Enter a title for the new section'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingOption(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                      placeholder="Enter feature section title"
                      autoFocus
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      This will be displayed as the section heading
                    </p>
                  </div>

                  {/* Preview */}
                  {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {formData.title || 'Your title will appear here'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Feature Section</p>
                      </div>
                    </div>
                  </div> */}
                </form>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {editingOption ? 'Update Section' : 'Create Section'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingOption(null);
                    }}
                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Features;