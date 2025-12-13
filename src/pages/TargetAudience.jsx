import React, { useState, useEffect } from 'react';
import { DoAll } from '../auth/api';
import toast from 'react-hot-toast';
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  Loader,
  Search,
  Filter,
  X,
  Users,
} from 'lucide-react';

const TargetAudience = () => {
  const [targetAudiences, setTargetAudiences] = useState([]);
  const [filteredAudiences, setFilteredAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAudience, setEditingAudience] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [formData, setFormData] = useState({
    gender: '',
  });

  // Fetch target audiences on component mount
  useEffect(() => {
    fetchTargetAudiences();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [targetAudiences, searchTerm, selectedFilter, sortBy]);

  const fetchTargetAudiences = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: 'get',
        table: 'target_audience',
        where: { is_deleted: 0 }
      });

      if (response?.success) {
        const audiences = response.data || [];
        setTargetAudiences(audiences);
      } else {
        throw new Error('Failed to fetch target audiences');
      }
    } catch (error) {
      console.error('Error fetching target audiences:', error);
      toast.error('Error loading target audiences');
      setTargetAudiences([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...targetAudiences];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(audience =>
        audience.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.id?.toString().includes(searchTerm)
      );
    }

    // Apply gender filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(audience => 
        audience.gender === selectedFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'gender':
          return (a.gender || '').localeCompare(b.gender || '');
        case 'gender-desc':
          return (b.gender || '').localeCompare(a.gender || '');
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'created_at_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return b.id - a.id;
      }
    });

    setFilteredAudiences(filtered);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate input
      if (!formData.gender.trim()) {
        toast.error('Please enter a gender value');
        return;
      }

      const apiData = {
        gender: formData.gender.trim(),
      };

      let response;
      
      if (editingAudience) {
        // Update existing target audience
        response = await DoAll({
          action: 'update',
          table: 'target_audience',
          data: apiData,
          where: { id: editingAudience.id }
        });
        
        if (response?.success) {
          toast.success('Target audience updated successfully!');
        }
      } else {
        // Create new target audience
        response = await DoAll({
          action: 'insert',
          table: 'target_audience',
          data: apiData
        });
        
        if (response?.success) {
          toast.success('Target audience created successfully!');
        }
      }

      if (response?.success) {
        setShowModal(false);
        setFormData({
          gender: '',
        });
        setEditingAudience(null);
        fetchTargetAudiences();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error saving target audience:', error);
      toast.error('Error saving target audience');
    }
  };

  // Handle edit
  const handleEdit = (audience) => {
    setEditingAudience(audience);
    setFormData({
      gender: audience.gender || '',
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this target audience? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await DoAll({
        action: 'soft_delete',
        table: 'target_audience',
        where: { id }
      });
      
      if (response?.success) {
        toast.success('Target audience deleted successfully!');
        fetchTargetAudiences();
      } else {
        throw new Error('Failed to delete target audience');
      }
    } catch (error) {
      console.error('Error deleting target audience:', error);
      toast.error('Error deleting target audience');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('created_at');
  };

  // Get unique genders for filter
  const uniqueGenders = [...new Set(targetAudiences.map(audience => audience.gender))];

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading target audiences...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || selectedFilter !== 'all' || sortBy !== 'created_at';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Gender name Management</h1>
                <p className="text-sm text-gray-600">Manage name-based targeting settings</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAudience(null);
                setFormData({ gender: '' });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add name Target</span>
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
                placeholder="Search by name or ID..."
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
                <option value="all">All name</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              >
                <option value="created_at">Sort by: Newest First</option>
                <option value="created_at_asc">Sort by: Oldest First</option>
                <option value="gender">Sort by: Gender A-Z</option>
                <option value="gender-desc">Sort by: Gender Z-A</option>
              </select>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-white hover:text-white border border-red-500 rounded-lg bg-red-500 hover:bg-red-600 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredAudiences.length} of {targetAudiences.length} settings
                {hasActiveFilters && ' (filtered)'}
              </p>
              
              {hasActiveFilters && filteredAudiences.length === 0 && (
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

        {/* Target Audiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAudiences.map(audience => (
            <div 
              key={audience.id} 
              className="bg-white rounded-lg shadow-md border border-emerald-100 p-4 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-100 rounded-md">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1">
                    name #{audience.id}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(audience)}
                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-md transition-all duration-200 hover:scale-110"
                    title="Edit Gender"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(audience.id)}
                    disabled={deletingId === audience.id}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
                    title="Delete Gender"
                  >
                    {deletingId === audience.id ? (
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Gender Value */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <h4 className="text-xs font-semibold text-gray-700">name Value</h4>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-800">
                      {audience.gender}
                    </p>
                  </div>
                </div>
                
                {/* Status and Info */}
                <div className="space-y-2">
                  {/* <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      audience.is_deleted === 0 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {audience.is_deleted === 0 ? 'Active' : 'Deleted'}
                    </span>
                  </div> */}
                  
                  {/* <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Created:</span>
                    <span className="text-xs text-gray-600">
                      {audience.created_at ? new Date(audience.created_at * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div> */}
                  
                  {/* {audience.updated_at && audience.updated_at !== audience.created_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">Updated:</span>
                      <span className="text-xs text-gray-600">
                        {new Date(audience.updated_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )} */}
                </div>
                
                {/* Gender Badge */}
                {/* <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                      {audience.gender.toUpperCase()}
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAudiences.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? 'No gender settings found' : 'No Gender Settings Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first gender target setting'
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
                    setEditingAudience(null);
                    setFormData({ gender: '' });
                    setShowModal(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create Your First Setting
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showModal ? 'translate-x-0' : 'translate-x-full'
      } z-50`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAudience ? 'Edit name Target' : 'Create name Target'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAudience(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {editingAudience ? 'Edit the name value' : 'Enter a new name value'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  name Value *
                </label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Based on your database, valid values include: all, make, female, others, tasks
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  {editingAudience ? 'Update name Target' : 'Create name Target'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAudience(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0  bg-opacity-30 z-40"
          onClick={() => {
            setShowModal(false);
            setEditingAudience(null);
          }}
        />
      )}
    </div>
  );
};

export default TargetAudience;