import { useState, useEffect } from 'react';
import { DoAll } from '../auth/api';
import { User, Building2, UserCircle, Mail, Phone, MapPin, Calendar, Search, Filter, X, Eye, ChevronDown, ChevronUp, Home, Briefcase, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [expandedCards, setExpandedCards] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    vendors: 0,
    customers: 0
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
    };
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [users, searchTerm, selectedType, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await DoAll({ 
        action: 'get', 
        table: 'users',
        where: { is_deleted: 0 }
      });
      
      if (!response?.success) {
        throw new Error('Invalid API response structure');
      }
      
      const usersData = response.data || [];
      
      // Parse JSON addresses for each user
      const usersWithParsedAddresses = usersData.map(user => {
        let parsedAddresses = [];
        
        try {
          if (user.addresses && typeof user.addresses === 'string') {
            parsedAddresses = JSON.parse(user.addresses);
          } else if (Array.isArray(user.addresses)) {
            parsedAddresses = user.addresses;
          }
        } catch (error) {
          console.error('Error parsing addresses for user:', user.id, error);
          parsedAddresses = [];
        }
        
        // Get default address for display
        const defaultAddress = parsedAddresses.find(addr => addr.is_default) || 
                              parsedAddresses[0] || 
                              null;
        
        // Create formatted address string for search
        const addressString = defaultAddress 
          ? `${defaultAddress.address_line1 || ''} ${defaultAddress.address_line2 || ''} ${defaultAddress.city || ''} ${defaultAddress.state || ''} ${defaultAddress.country || ''} ${defaultAddress.postal_code || ''}`
          : '';
        
        return {
          ...user,
          addresses: parsedAddresses,
          address: addressString.trim(),
          address_count: parsedAddresses.length,
          default_address: defaultAddress
        };
      });
      
      setUsers(usersWithParsedAddresses);
      
      // Calculate stats
      const vendorCount = usersWithParsedAddresses.filter(user => user.user_type === 'vendor').length;
      const customerCount = usersWithParsedAddresses.filter(user => user.user_type === 'customer').length;
      
      setStats({
        total: usersWithParsedAddresses.length,
        vendors: vendorCount,
        customers: customerCount
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Search in all addresses
        user.addresses?.some(addr => 
          addr.address_line1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addr.address_line2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addr.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addr.state?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(user => user.user_type === selectedType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'name-desc':
          return (b.full_name || '').localeCompare(a.full_name || '');
        case 'recent':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const toggleCardExpansion = (userId) => {
    setExpandedCards(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSortBy('name');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || selectedType !== 'all' || sortBy !== 'name';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Users Management</h1>
                <p className="text-sm text-gray-600">View and manage vendors and customers</p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 min-w-[120px]">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-blue-700 font-medium">Total Users</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 min-w-[120px]">
                <div className="text-2xl font-bold text-purple-600">{stats.vendors}</div>
                <div className="text-xs text-purple-700 font-medium">Vendors</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2 min-w-[120px]">
                <div className="text-2xl font-bold text-green-600">{stats.customers}</div>
                <div className="text-xs text-green-700 font-medium">Customers</div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
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

            {/* Type Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none"
              >
                <option value="all">All Users</option>
                <option value="vendor">Vendors Only</option>
                <option value="customer">Customers Only</option>
              </select>
            </div>

            {/* Sort and Clear */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="name">Sort by: Name A-Z</option>
                <option value="name-desc">Sort by: Name Z-A</option>
                <option value="recent">Sort by: Most Recent</option>
                <option value="oldest">Sort by: Oldest</option>
              </select>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-white hover:text-white border border-red-300 rounded-lg bg-red-500 hover:bg-red-600 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
              {hasActiveFilters && ' (filtered)'}
            </p>
            
            {hasActiveFilters && filteredUsers.length === 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden">
          <div className="space-y-4">
            {filteredUsers.map(user => {
              const isExpanded = expandedCards.includes(user.id);
              const isVendor = user.user_type === 'vendor';
              
              return (
                <div 
                  key={user.id} 
                  className="bg-white rounded-lg shadow-md border border-blue-100 overflow-hidden"
                >
                  {/* Card Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleCardExpansion(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isVendor ? 'bg-purple-100' : 'bg-green-100'}`}>
                          {isVendor ? (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          ) : (
                            <UserCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{user.full_name || 'Unnamed User'}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isVendor ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                              {isVendor ? 'Vendor' : 'Customer'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined: {formatDate(user.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{user.email || 'No email'}</span>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{user.phone}</span>
                          </div>
                        )}
                        
                        {user.default_address && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-600">
                                {user.default_address.address_line1}
                                {user.default_address.address_line2 && `, ${user.default_address.address_line2}`}
                                {user.default_address.city && `, ${user.default_address.city}`}
                                {user.default_address.state && `, ${user.default_address.state}`}
                                {user.default_address.postal_code && ` - ${user.default_address.postal_code}`}
                              </span>
                              {user.address_count > 1 && (
                                <span className="text-xs text-blue-500 mt-1 block">
                                  +{user.address_count - 1} more address{user.address_count - 1 !== 1 ? 'es' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Full Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => {
            const isVendor = user.user_type === 'vendor';
            
            return (
              <div 
                key={user.id} 
                className="bg-white rounded-xl shadow-lg border border-blue-100 p-5 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              >
                {/* User Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isVendor ? 'bg-purple-100' : 'bg-green-100'}`}>
                      {isVendor ? (
                        <Building2 className="w-6 h-6 text-purple-600" />
                      ) : (
                        <UserCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{user.full_name || 'Unnamed User'}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isVendor ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {isVendor ? 'Vendor' : 'Customer'}
                      </span>
                    </div>
                  </div>
                  {user.address_count > 0 && (
                    <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      {user.address_count} address{user.address_count !== 1 ? 'es' : ''}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{user.email || 'No email'}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.default_address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 line-clamp-2">
                          {user.default_address.address_line1}
                          {user.default_address.address_line2 && `, ${user.default_address.address_line2}`}
                          {user.default_address.city && `, ${user.default_address.city}`}
                        </span>
                        {user.address_count > 1 && (
                          <span className="text-xs text-blue-500 mt-1 block">
                            +{user.address_count - 1} more address{user.address_count - 1 !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Joined: {formatDate(user.created_at)}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(user)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-600 text-white px-2 py-1.5 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-blue-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? 'No users found' : 'No Users Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'No users have been registered yet.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${selectedUser.user_type === 'vendor' ? 'bg-purple-100' : 'bg-green-100'}`}>
                    {selectedUser.user_type === 'vendor' ? (
                      <Building2 className="w-6 h-6 text-purple-600" />
                    ) : (
                      <UserCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name || 'Unnamed User'}</h2>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${selectedUser.user_type === 'vendor' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedUser.user_type === 'vendor' ? 'Vendor' : 'Customer'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Full Name</label>
                      <p className="text-gray-800">{selectedUser.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email Address</label>
                      <p className="text-gray-800">{selectedUser.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone Number</label>
                      <p className="text-gray-800">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Account Type</label>
                      <p className="text-gray-800 capitalize">{selectedUser.user_type || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Member Since</label>
                      <p className="text-gray-800">{formatDateTime(selectedUser.created_at)}</p>
                    </div>
                    {selectedUser.updated_at && (
                      <div>
                        <label className="text-xs text-gray-500">Last Updated</label>
                        <p className="text-gray-800">{formatDateTime(selectedUser.updated_at)}</p>
                      </div>
                    )}
                    {selectedUser.status && (
                      <div>
                        <label className="text-xs text-gray-500">Account Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedUser.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : selectedUser.status === 'inactive'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Addresses Section */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Addresses ({selectedUser.addresses.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {selectedUser.addresses.map((address, index) => (
                      <div 
                        key={address.id || index} 
                        className={`bg-gray-50 rounded-lg p-4 border ${address.is_default ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${address.is_default ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {getAddressIcon(address.address_type)}
                            </div>
                            <span className="font-medium text-gray-800 capitalize">
                              {address.address_type || 'Address'} {address.is_default && <span className="text-blue-500">(Default)</span>}
                            </span>
                          </div>
                          {address.is_default && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Contact:</span>
                            <span className="ml-2 text-gray-800">{address.full_name || selectedUser.full_name}</span>
                            {address.contact_number && (
                              <span className="ml-4 text-gray-800">{address.contact_number}</span>
                            )}
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Address:</span>
                            <span className="ml-2 text-gray-800">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 text-gray-800">
                              {address.city && `${address.city}, `}
                              {address.state && `${address.state}, `}
                              {address.country}
                              {address.postal_code && ` - ${address.postal_code}`}
                            </span>
                          </div>
                          
                          {address.created_at && (
                            <div className="pt-2 border-t border-gray-200 mt-2">
                              <span className="text-xs text-gray-500">
                                Added: {formatDate(address.created_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;