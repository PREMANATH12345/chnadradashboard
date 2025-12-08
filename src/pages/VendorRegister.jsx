import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../api/auth';
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Banknote,
  FileText,
  Calendar,
  AlertCircle,
  Info,
  Clock,
  Shield,
  Check,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

const VendorRegister = () => {
  const [unverifiedVendors, setUnverifiedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch unverified vendors
  const fetchUnverifiedVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getUnverifiedVendors();
      
      
      // Handle different response structures
      if (response) {
        let vendors = [];
        
        // Check various response formats
        if (Array.isArray(response)) {
          vendors = response;
        } else if (response.data && Array.isArray(response.data)) {
          vendors = response.data;
        } else if (response.result && Array.isArray(response.result)) {
          vendors = response.result;
        } else if (response.users && Array.isArray(response.users)) {
          vendors = response.users;
        } else if (typeof response === 'object' && response !== null) {
          // If it's a single object, wrap it in an array
          if (response.id || response.user_id) {
            vendors = [response];
          }
        }
        
        setUnverifiedVendors(vendors);
        
        if (vendors.length === 0) {
          setMessage({ 
            text: 'No pending vendor verifications found', 
            type: 'info' 
          });
        }
      } else {
        setMessage({ 
          text: 'Received empty response from server', 
          type: 'error' 
        });
        setUnverifiedVendors([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      
      let errorMessage = 'Failed to fetch vendors';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
      setUnverifiedVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Verify a vendor
  const verifyVendor = async (vendorId) => {
    try {
      const response = await vendorAPI.verifyVendor(vendorId);
      
      
      if (response) {
        setMessage({ 
          text: response.message || 'Vendor verified successfully! They can now login.', 
          type: 'success' 
        });
        
        // Remove verified vendor from list
        setUnverifiedVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
        
        // Close details if open
        if (selectedVendor?.id === vendorId) {
          setSelectedVendor(null);
          setShowDetails(false);
        }
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ 
          text: 'Failed to verify vendor - No response received', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Verify error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to verify vendor', 
        type: 'error' 
      });
    }
  };

  // Reject a vendor
  const rejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await vendorAPI.rejectVendor(vendorId);
      
      
      if (response) {
        setMessage({ 
          text: response.message || 'Vendor rejected successfully', 
          type: 'success' 
        });
        
        // Remove rejected vendor from list
        setUnverifiedVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
        
        // Close details if open
        if (selectedVendor?.id === vendorId) {
          setSelectedVendor(null);
          setShowDetails(false);
        }
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } else {
        setMessage({ 
          text: 'Failed to reject vendor - No response received', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Reject error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to reject vendor', 
        type: 'error' 
      });
    }
  };

  // View vendor details
  const viewVendorDetails = async (vendorId) => {
    try {
      const response = await vendorAPI.getVendorDetails(vendorId);
      
      
      if (response) {
        let vendorData = null;
        
        // Extract vendor data from response
        if (Array.isArray(response) && response.length > 0) {
          vendorData = response[0];
        } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          vendorData = response.data[0];
        } else if (response.result && Array.isArray(response.result) && response.result.length > 0) {
          vendorData = response.result[0];
        } else if (response.users && Array.isArray(response.users) && response.users.length > 0) {
          vendorData = response.users[0];
        } else if (typeof response === 'object' && response.id) {
          vendorData = response;
        }
        
        if (vendorData) {
          setSelectedVendor(vendorData);
          setShowDetails(true);
        } else {
          setMessage({ 
            text: 'Vendor details not found in response', 
            type: 'error' 
          });
        }
      } else {
        setMessage({ 
          text: 'Failed to load vendor details - No response received', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Details error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to load vendor details', 
        type: 'error' 
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Filter vendors based on search and filter
  const filteredVendors = unverifiedVendors.filter(vendor => {
    const matchesSearch = 
      (vendor.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'recent') {
      const vendorDate = new Date(vendor.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && vendorDate > weekAgo;
    }
    return matchesSearch;
  });

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  useEffect(() => {
    fetchUnverifiedVendors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-green-600 p-2 bg-green-100 rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Verification Portal</h1>
              <p className="text-gray-600 mt-1">Review and approve vendor registration requests</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Verifications
                </h2>
                <p className="text-sm text-gray-600 mt-1 ml-7">
                  {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} awaiting approval
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                
                {/* Filter Dropdown */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Vendors</option>
                  <option value="recent">Last 7 Days</option>
                </select>
                
                {/* Clear Filters Button */}
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
                
                {/* Refresh Button */}
                <button 
                  onClick={fetchUnverifiedVendors}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`px-6 py-4 ${message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : message.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500 mr-3" />
                  )}
                  <span className={message.type === 'success' ? 'text-green-700' : message.type === 'error' ? 'text-red-700' : 'text-blue-700'}>
                    {message.text}
                  </span>
                </div>
                <button 
                  onClick={() => setMessage({ text: '', type: '' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              // Loading State
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
                <p className="text-gray-500 font-medium flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-pulse" />
                  Loading vendor data...
                </p>
              </div>
            ) : filteredVendors.length === 0 ? (
              // Empty State
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No matching vendors found' : 'All caught up!'}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'There are no pending vendor verifications. All vendors have been approved.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {searchTerm || filterStatus !== 'all' ? 'Clear filters' : 'Check for new requests'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendors List */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVendors.map((vendor) => (
                      <div 
                        key={vendor.id || vendor.user_id} 
                        className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer group ${
                          selectedVendor?.id === vendor.id 
                            ? 'border-green-300 ring-2 ring-green-100 bg-green-50' 
                            : 'border-gray-200 hover:border-green-200'
                        }`}
                        onClick={() => viewVendorDetails(vendor.id || vendor.user_id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Building2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 line-clamp-1">
                                {vendor.company_name || vendor.full_name || vendor.name || 'Unnamed Vendor'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {vendor.email || 'No email provided'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                ID: {vendor.id || vendor.user_id || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{vendor.full_name || vendor.name || 'No name provided'}</span>
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                              <span>{vendor.phone}</span>
                            </div>
                          )}
                          {(vendor.city || vendor.state) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {[vendor.city, vendor.state].filter(Boolean).join(', ') || 'Location not specified'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            {formatDate(vendor.created_at || vendor.created_date)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectVendor(vendor.id || vendor.user_id);
                              }}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                              title="Reject Vendor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewVendorDetails(vendor.id || vendor.user_id);
                              }}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyVendor(vendor.id || vendor.user_id);
                              }}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-500" />
                          Vendor Details
                        </h3>
                        {selectedVendor && (
                          <button
                            onClick={() => {
                              setSelectedVendor(null);
                              setShowDetails(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {selectedVendor ? (
                        <div className="space-y-6">
                          {/* Vendor Info Card */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Building2 className="w-7 h-7 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">
                                  {selectedVendor.company_name || selectedVendor.full_name || selectedVendor.name}
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {selectedVendor.full_name || selectedVendor.name || 'No name'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Vendor ID: {selectedVendor.id || selectedVendor.user_id}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  Email
                                </div>
                                <div className="font-medium text-gray-900 truncate">{selectedVendor.email || 'N/A'}</div>
                              </div>
                              <div className="bg-white/80 rounded-lg p-3">
                                <div className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  Phone
                                </div>
                                <div className="font-medium text-gray-900">{selectedVendor.phone || 'N/A'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Details Sections */}
                          <div className="space-y-4">
                            {/* GST & PAN */}
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Business Documents
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs text-gray-500 mb-1">GST Number</div>
                                  <div className={`font-medium ${selectedVendor.gst_number || selectedVendor.gst ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {selectedVendor.gst_number || selectedVendor.gst || 'Not provided'}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs text-gray-500 mb-1">PAN Number</div>
                                  <div className={`font-medium ${selectedVendor.pan_number || selectedVendor.pan ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {selectedVendor.pan_number || selectedVendor.pan || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Address */}
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                Address
                              </h5>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-700 space-y-1">
                                  {selectedVendor.address_line1 && (
                                    <div>{selectedVendor.address_line1}</div>
                                  )}
                                  {selectedVendor.address_line2 && (
                                    <div>{selectedVendor.address_line2}</div>
                                  )}
                                  {selectedVendor.address && (
                                    <div>{selectedVendor.address}</div>
                                  )}
                                  {(selectedVendor.city || selectedVendor.state) && (
                                    <div>
                                      {[selectedVendor.city, selectedVendor.state].filter(Boolean).join(', ')}
                                    </div>
                                  )}
                                  {(selectedVendor.postal_code || selectedVendor.pincode || selectedVendor.country) && (
                                    <div>
                                      {[selectedVendor.postal_code || selectedVendor.pincode, selectedVendor.country].filter(Boolean).join(', ')}
                                    </div>
                                  )}
                                  {!selectedVendor.address_line1 && !selectedVendor.address && !selectedVendor.city && (
                                    <div className="text-gray-400">Address not provided</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bank Details */}
                            {(selectedVendor.bank_name || selectedVendor.account_number) && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  <Banknote className="w-4 h-4 mr-2" />
                                  Bank Details
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                  {selectedVendor.bank_name && (
                                    <div>
                                      <div className="text-xs text-gray-500">Bank Name</div>
                                      <div className="font-medium">{selectedVendor.bank_name}</div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <div className="text-xs text-gray-500">Account No.</div>
                                      <div className="font-medium">{selectedVendor.account_number || 'N/A'}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">IFSC Code</div>
                                      <div className="font-medium">{selectedVendor.ifsc_code || selectedVendor.ifsc || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => rejectVendor(selectedVendor.id || selectedVendor.user_id)}
                                className="py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200 font-semibold flex items-center justify-center group"
                              >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Reject
                              </button>
                              <button
                                onClick={() => verifyVendor(selectedVendor.id || selectedVendor.user_id)}
                                className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center group"
                              >
                                <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Empty Details State
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-medium mb-2">Select a Vendor</h4>
                          <p className="text-sm text-gray-500">
                            Click on a vendor card to view detailed information
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {!loading && filteredVendors.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-gray-600 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-gray-400" />
                  Showing <span className="font-semibold mx-1">{filteredVendors.length}</span> 
                  of <span className="font-semibold mx-1">{unverifiedVendors.length}</span> 
                  pending vendor{filteredVendors.length !== 1 ? 's' : ''}
                </div>
                <div className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  Last updated: <span className="font-medium ml-1">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        
      </div>
    </div>
  );
};

export default VendorRegister;