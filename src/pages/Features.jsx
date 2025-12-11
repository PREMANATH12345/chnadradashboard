import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoAll } from '../auth/api'; // Adjust path as needed
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Star, 
  Clock, 
  Zap,
  Plus,
  Edit,
  Trash2,
  Loader,
  Grid,
  Layout,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const Features = () => {
  const navigate = useNavigate();
  const [featureOptions, setFeatureOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: ''
  });

  // Fetch feature options on component mount
  useEffect(() => {
    fetchFeatureOptions();
  }, []);

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
      const response = await DoAll({
        action: 'update',
        table: 'feature_options',
        data: { is_active: option.is_active ? 0 : 1 },
        where: { id: option.id }
      });
      
      if (response?.success) {
        toast.success(`Feature section ${option.is_active ? 'deactivated' : 'activated'}!`);
        fetchFeatureOptions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  // Render feature section - Simplified version
  const renderFeatureSection = (option) => {
    return (
      <div 
        key={option.id}
        className={`bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
          !option.is_active ? 'opacity-60' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-700 mb-1">{option.title}</h3>
              <p className="text-sm text-gray-600">Feature Section</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => toggleActiveStatus(option)}
              className={`p-1.5 rounded-md ${
                option.is_active 
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={option.is_active ? 'Deactivate' : 'Activate'}
            >
              {option.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleEdit(option)}
              className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(option.id)}
              disabled={deletingId === option.id}
              className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50"
              title="Delete"
            >
              {deletingId === option.id ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">ID:</span>
            <span className="font-semibold text-gray-800">#{option.id}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {option.is_active ? 'Active' : 'Inactive'} • ID: {option.id}
          </span>
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center space-x-1"
          >
            <span>View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3 text-emerald-600">
          <Loader className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading feature sections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Feature Sections Management</h1>
                <p className="text-sm text-gray-600">Manage feature sections</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingOption(null);
                setFormData({ title: '' });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Feature Section</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm text-emerald-700 font-medium">Total Sections</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{featureOptions.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium">Active Sections</div>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                {featureOptions.filter(opt => opt.is_active).length}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm text-amber-700 font-medium">Inactive Sections</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">
                {featureOptions.filter(opt => !opt.is_active).length}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {featureOptions.length > 0 ? (
            featureOptions.map(renderFeatureSection)
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto text-center shadow-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Feature Sections Yet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create your first feature section
                </p>
                <button
                  onClick={() => {
                    setEditingOption(null);
                    setFormData({ title: '' });
                    setShowModal(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Create First Feature Section
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Modal - Simplified */}
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
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                  </div>
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