import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoAll } from '../auth/api'; // Adjust path as needed
import toast from 'react-hot-toast';
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  Loader,
  Eye,
  EyeOff,
  Users,
  User,
} from 'lucide-react';

const TargetAudience = () => {
  const navigate = useNavigate();
  const [targetAudiences, setTargetAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAudience, setEditingAudience] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    // Map to your database columns:
    // 'gender' is the only column you have for gender data
    gender: 'all', // 'all', 'male', 'female'
  });

  // Gender options - simplified to match your database
  const genderOptions = [
    { value: 'all', label: 'All Genders', icon: Users, color: 'blue' },
    { value: 'male', label: 'Male', icon: User, color: 'blue' },
    { value: 'female', label: 'Female', icon: User, color: 'pink' },
        { value: 'others', label: 'Others', icon: User, color: 'pink' },
        { value: 'kids', label: 'Kids', icon: User, color: 'blue' }
  ];

  // Fetch target audiences on component mount
  useEffect(() => {
    fetchTargetAudiences();
  }, []);

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
      // Prepare data for API - ONLY gender data that matches your database
      const apiData = {
        gender: formData.gender,
        // Don't send page_name, is_active, etc. since they don't exist in your database
        // created_at and updated_at should be handled by your database or backend
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
        // For creation, you might need to send only gender
        response = await DoAll({
          action: 'insert',
          table: 'target_audience',
          data: {
            gender: formData.gender,
            // Add other required fields if needed by your database
           
          }
        });
        
        if (response?.success) {
          toast.success('Target audience created successfully!');
        }
      }

      if (response?.success) {
        setShowModal(false);
        setFormData({
          gender: 'all',
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
      gender: audience.gender || 'all',
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

  // Get gender info
  const getGenderInfo = (gender) => {
    const genderInfo = genderOptions.find(opt => opt.value === gender);
    return genderInfo || genderOptions[0];
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colors = {
      'blue': {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        gradient: 'from-blue-500 to-cyan-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      'pink': {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        gradient: 'from-pink-500 to-rose-500',
        button: 'bg-pink-500 hover:bg-pink-600'
      },
    };
    return colors[color] || colors.blue;
  };

  // Render target audience card - simplified
  const renderTargetAudience = (audience) => {
    const genderInfo = getGenderInfo(audience.gender);
    const GenderIcon = genderInfo.icon;
    const genderColors = getColorClasses(genderInfo.color);

    return (
      <div 
        key={audience.id}
        className={`${genderColors.bg} rounded-xl border ${genderColors.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 bg-gradient-to-br ${genderColors.gradient} rounded-lg`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${genderColors.text} mb-1`}>
                Gender Setting #{audience.id}
              </h3>
              <p className="text-sm text-gray-600">ID: {audience.id}</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => handleEdit(audience)}
              className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(audience.id)}
              disabled={deletingId === audience.id}
              className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50"
              title="Delete"
            >
              {deletingId === audience.id ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Gender:</span>
            <div className="flex items-center space-x-1">
              <GenderIcon className={`w-4 h-4 ${genderColors.text}`} />
              <span className={`font-semibold ${genderColors.text}`}>{genderInfo.label}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Status:</span>
            <span className={`font-semibold ${audience.is_deleted === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {audience.is_deleted === 0 ? 'Active' : 'Deleted'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Created on {audience.created_at ? new Date(audience.created_at * 1000).toLocaleDateString() : 'N/A'}
          </span>
          <div className={`px-3 py-1 ${genderColors.text} ${genderColors.bg.split('bg-gradient')[0]} rounded-full text-xs font-medium`}>
            {audience.gender.toUpperCase()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3 text-emerald-600">
          <Loader className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading target audiences...</span>
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
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Gender Target Management</h1>
                <p className="text-sm text-gray-600">Manage gender-based targeting settings</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAudience(null);
                setFormData({
                  gender: 'all',
                });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gender Target</span>
            </button>
          </div>

          {/* Stats - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm text-emerald-700 font-medium">Total Settings</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{targetAudiences.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium">Male Targeted</div>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                {targetAudiences.filter(audience => audience.gender === 'male').length}
              </div>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="text-sm text-pink-700 font-medium">Female Targeted</div>
              <div className="text-2xl font-bold text-pink-800 mt-1">
                {targetAudiences.filter(audience => audience.gender === 'female').length}
              </div>
            </div>
          </div>
        </div>

        {/* Target Audiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {targetAudiences.length > 0 ? (
            targetAudiences.map(renderTargetAudience)
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto text-center shadow-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Gender Settings Yet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create your first gender target setting
                </p>
                <button
                  onClick={() => {
                    setEditingAudience(null);
                    setShowModal(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Create First Gender Setting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        showModal ? 'translate-x-0' : 'translate-x-full'
      } z-50`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAudience ? 'Edit Gender Target' : 'Create Gender Target'}
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
              Configure gender-based targeting
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  {editingAudience ? 'Update Gender Target' : 'Create Gender Target'}
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