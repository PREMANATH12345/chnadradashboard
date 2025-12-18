// orders.jsx
import React, { useState, useEffect } from 'react';
import { DoAll } from '../api/auth';
import toast from 'react-hot-toast';

const Orders = () => {
  const [userType, setUserType] = useState('customer');
  const [orderType, setOrderType] = useState('razorpay');
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [users, setUsers] = useState({});

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: 'get',
        table: 'purchases',
        where: {}
      });

      // FIXED: Check response.data.success for nested structure
      if (response?.success) {
        setOrders(response.data || []);
      } else {
        console.warn('No orders data found or API error');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch enquiries from database
  const fetchEnquiries = async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'enquiries',
        where: {}
      });

      // FIXED: Check response.data.success for nested structure
      if (response?.success) {
        setEnquiries(response.data || []);
      } else {
        console.warn('No enquiries data found or API error');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Error loading enquiries');
    }
  };

const fetchUsers = async () => {
  try {
    const response = await DoAll({
      action: 'get',
      table: 'users',
      where: {}
    });

    console.log('👥 Users response:', response);

    if (response?.success) {
      // Convert array to object map
      const usersMap = {};
      if (Array.isArray(response.data)) {
        response.data.forEach(user => {
          usersMap[user.id] = user;
        });
        console.log('👥 Users map created:', Object.keys(usersMap).length, 'users');
        setUsers(usersMap);
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

  useEffect(() => {
    fetchOrders();
    fetchEnquiries();
    fetchUsers();
  }, []);

  // Get current user data from localStorage to determine user type
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserType(user.user_type || 'customer');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserType('customer');
      }
    }
  }, []);

// Filter data based on user type and order type
useEffect(() => {
  console.log('🔄 Filtering - orderType:', orderType);
  console.log('🔄 Raw orders:', orders.length);
  console.log('🔄 Raw enquiries:', enquiries.length);
  console.log('🔄 Current userType:', userType);
  
  if (orderType === 'razorpay') {
    // ✅ FOR ADMIN: Show ALL orders
    if (userType === 'admin') {
      console.log('✅ Admin view - showing all', orders.length, 'orders');
      setFilteredOrders(orders);
      return;
    }
    
    // For non-admin users, filter by user_id
    const userData = localStorage.getItem('user');
    if (!userData) {
      setFilteredOrders([]);
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      const userId = user.id || user.admin_id;
      
      const userOrders = orders.filter(order => {
        if (userType === 'customer') {
          return String(order.user_id) === String(userId);
        }
        if (userType === 'vendor') {
          return true; // Show all for vendors
        }
        return false;
      });
      
      console.log('🔄 Filtered orders:', userOrders.length);
      setFilteredOrders(userOrders);
    } catch (error) {
      console.error('Error filtering orders:', error);
      setFilteredOrders([]);
    }
    
  } else if (orderType === 'enquiry') {
    // ✅ FOR ADMIN: Show ALL enquiries
    if (userType === 'admin') {
      console.log('✅ Admin view - showing all', enquiries.length, 'enquiries');
      setFilteredEnquiries(enquiries);
      return;
    }
    
    // For non-admin users, filter by user_id
    const userData = localStorage.getItem('user');
    if (!userData) {
      setFilteredEnquiries([]);
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      const userId = user.id || user.admin_id;
      
      const userEnquiries = enquiries.filter(enquiry => {
        if (userType === 'customer') {
          return String(enquiry.user_id) === String(userId);
        }
        if (userType === 'vendor') {
          return true; // Show all for vendors
        }
        return false;
      });
      
      console.log('🔄 Filtered enquiries:', userEnquiries.length);
      setFilteredEnquiries(userEnquiries);
    } catch (error) {
      console.error('Error filtering enquiries:', error);
      setFilteredEnquiries([]);
    }
  }
}, [orders, enquiries, userType, orderType]);


// Get current user data from localStorage to determine user type
useEffect(() => {
  const userData = localStorage.getItem('user');
  console.log('👤 Raw userData from localStorage:', userData);
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Parsed user:', user);
      
      // ✅ FIX: Check 'role' field for admin, 'user_type' for others
      const detectedType = user.role || user.user_type || 'customer';
      console.log('👤 Detected user_type:', detectedType);
      setUserType(detectedType);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUserType('customer');
    }
  }
}, []);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
      responded: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Responded' },
      new: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'New' }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium border ${config.color} whitespace-nowrap`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Use abbreviated format for mobile
      if (window.innerWidth < 768) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } else {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '₹0.00';
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get current data based on user type and order type
  const currentData = orderType === 'razorpay' ? filteredOrders : orderType === 'enquiry' ? filteredEnquiries : [];

  // Get user info from users map
  const getUserInfo = (userId) => {
    const user = users[userId];
    if (user) {
      return {
        name: user.name || `User ${userId}`,
        email: user.email || `user${userId}@example.com`,
        phone: user.phone || 'N/A'
      };
    }
    return {
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      phone: 'N/A'
    };
  };

  // Handle refresh data
  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
    fetchEnquiries();
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {orderType === 'razorpay' ? 'Purchase Orders' : 
            orderType === 'orders' ? 'Manual Orders' : 'Enquiries'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {orderType === 'razorpay' ? 'Manage your purchase orders' : 
            orderType === 'orders' ? 'Manage your manual orders' : 'Manage customer enquiries'}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Order Type Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Data Type</h3>
              <div className="grid grid-cols-3 gap-2"> {/* Changed from grid-cols-2 */}
                <button
                  onClick={() => setOrderType('razorpay')}
                  className={`p-3 rounded-lg border transition-all ${
                    orderType === 'razorpay'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className={`font-medium ${orderType === 'razorpay' ? 'text-purple-700' : 'text-gray-600'}`}>
                    Purchases
                  </span>
                </button>
                
            <button
              onClick={() => setOrderType('orders')}
              className={`p-3 rounded-lg border transition-all ${
                orderType === 'orders'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className={`font-medium ${orderType === 'orders' ? 'text-green-700' : 'text-gray-600'}`}>
                Orders
              </span>
            </button>
                
                <button
                  onClick={() => setOrderType('enquiry')}
                  className={`p-3 rounded-lg border transition-all ${
                    orderType === 'enquiry'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className={`font-medium ${orderType === 'enquiry' ? 'text-orange-700' : 'text-gray-600'}`}>
                    Enquiries
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Refresh */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {userType === 'customer' ? 'Your' : userType === 'vendor' ? 'Vendor' : 'All'} -{' '}
                {orderType === 'razorpay' ? 'Purchase Orders' : 
                orderType === 'orders' ? 'Orders' : 'Enquiries'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentData.length} {currentData.length === 1 ? 'record' : 'records'} found
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex space-x-2 sm:space-x-4">
                <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg min-w-[70px] sm:min-w-[80px]">
                  <div className="text-base sm:text-lg font-bold text-blue-600">{currentData.length}</div>
                  <div className="text-xs sm:text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg min-w-[70px] sm:min-w-[80px]">
                  <div className="text-base sm:text-lg font-bold text-green-600">
                    {currentData.filter(item => 
                      (orderType === 'razorpay' ? item.payment_status === 'completed' : 
                      orderType === 'enquiry' ? item.status === 'completed' : 
                      false)
                    ).length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600">Completed</div>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading data...</p>
          </div>
        ) : (
          /* Orders/Enquiries Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              {orderType === 'razorpay' ? (
  /* PURCHASES TABLE - your existing purchases table code */
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Order ID
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Customer
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Product Details
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Amount
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Date
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => {
          const userInfo = getUserInfo(order.user_id);
          
          return (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.razorpay_payment_id ? (
                  <div>
                    <div className="font-medium">{order.razorpay_payment_id}</div>
                    <div className="text-xs text-gray-500">Ref: ORD-{order.id}</div>
                  </div>
                ) : (
                  `ORD-${order.id}`
                )}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                <div className="font-medium">{userInfo.name}</div>
                <div className="text-xs text-gray-500">{userInfo.email}</div>
                {userInfo.phone !== 'N/A' && (
                  <div className="text-xs text-gray-500">{userInfo.phone}</div>
                )}
              </td>
              
              <td className="px-4 py-4">
                {(() => {
                  // Parse purchased_product_details
                  let productDetails = {};
                  let fileDetails = [];
                  
                  try {
                    productDetails = typeof order.purchased_product_details === 'string' 
                      ? JSON.parse(order.purchased_product_details) 
                      : order.purchased_product_details || {};
                  } catch (e) {
                    console.error('Error parsing purchased_product_details:', e);
                  }
                  
                  try {
                    fileDetails = typeof order.purchased_file_details === 'string'
                      ? JSON.parse(order.purchased_file_details)
                      : order.purchased_file_details || [];
                  } catch (e) {
                    console.error('Error parsing purchased_file_details:', e);
                  }
                  
                  return (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {productDetails.product_name || order.product_title || 'N/A'}
                      </div>
                      {productDetails.metal_name && (
                        <div className="text-xs text-gray-500">Metal: {productDetails.metal_name}</div>
                      )}
                      {productDetails.diamond_name && (
                        <div className="text-xs text-gray-500">Diamond: {productDetails.diamond_name}</div>
                      )}
                      {productDetails.size_name && (
                        <div className="text-xs text-gray-500">
                          Size: {productDetails.size_name} 
                          {productDetails.size_mm ? ` (${productDetails.size_mm}mm)` : ''}
                        </div>
                      )}
                      {fileDetails.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {fileDetails.map((file, idx) => (
                            <div key={idx} className="text-xs text-blue-600">
                              📎 {file.file_name} ({file.file_type})
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                {formatAmount(order.amount)}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(order.created_at)}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={order.payment_status} />
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan={6} className="px-4 py-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No purchase orders found
            </h3>
            <p className="text-gray-500">
              {userType === 'customer' 
                ? 'You have no purchase orders yet.' 
                : 'There are no purchase orders at the moment.'
              }
            </p>
          </td>
        </tr>
      )}
    </tbody>
  </table>
              ) : orderType === 'enquiry' ? (
                /* ENQUIRIES TABLE - your existing enquiries table code */
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Details
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Amount
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const userInfo = getUserInfo(order.user_id);
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm font-medium text-gray-900">
                              {order.razorpay_payment_id ? (
                                <div>
                                  <div className="font-medium truncate max-w-[120px] sm:max-w-none">{order.razorpay_payment_id}</div>
                                  <div className="text-xs text-gray-500">Ref: ORD-{order.id}</div>
                                </div>
                              ) : (
                                `ORD-${order.id}`
                              )}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm text-gray-600">
                              <div className="font-medium truncate max-w-[80px] sm:max-w-none">{userInfo.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[80px] sm:max-w-none">{userInfo.email}</div>
                              {userInfo.phone !== 'N/A' && (
                                <div className="text-xs text-gray-500 hidden sm:block">{userInfo.phone}</div>
                              )}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{order.product_title}</div>
                              {order.metal && order.metal !== "" && (
                                <div className="text-xs text-gray-500 hidden sm:block">Metal: {order.metal}</div>
                              )}
                              {order.diamond && order.diamond !== "" && (
                                <div className="text-xs text-gray-500 hidden sm:block">Diamond: {order.diamond}</div>
                              )}
                              {order.size && order.size !== "" && (
                                <div className="text-xs text-gray-500 hidden sm:block">Size: {order.size}</div>
                              )}
                              {order.files && order.files !== "[]" && order.files !== "" && (
                                <div className="text-xs text-blue-500 mt-1">
                                  <span className="sm:hidden">📎</span>
                                  <span className="hidden sm:inline">Files: {typeof order.files === 'string' ? order.files : 'Selected'}</span>
                                </div>
                              )}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm font-medium hidden sm:table-cell">
                              {formatAmount(order.amount)}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm text-gray-600">
                              {formatDate(order.created_at)}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4">
                              <StatusBadge status={order.payment_status} />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                            No purchase orders found
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {userType === 'customer' 
                              ? 'You have no purchase orders yet.' 
                              : 'There are no purchase orders at the moment.'
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : orderType === 'enquiry' ? (
                /* ENQUIRIES TABLE - Responsive version */
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enquiry ID
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Product Details
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Files
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnquiries.length > 0 ? (
                      filteredEnquiries.map((enquiry) => {
                        const userInfo = getUserInfo(enquiry.user_id);
                        
                        // Parse JSON columns
                        let productDetails = {};
                        let fileTypes = [];
                        
                        try {
                          productDetails = typeof enquiry.enquiry_product_details === 'string' 
                            ? JSON.parse(enquiry.enquiry_product_details) 
                            : enquiry.enquiry_product_details || {};
                        } catch (e) {
                          console.error('Error parsing enquiry_product_details:', e);
                        }
                        
                        try {
                          fileTypes = typeof enquiry.enquiry_file_types === 'string'
                            ? JSON.parse(enquiry.enquiry_file_types)
                            : enquiry.enquiry_file_types || [];
                        } catch (e) {
                          console.error('Error parsing enquiry_file_types:', e);
                        }
                        
                        return (
                          <tr key={enquiry.id} className="hover:bg-gray-50">
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm font-medium text-gray-900">
                              ENQ-{enquiry.id}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm text-gray-600">
                              <div className="font-medium truncate max-w-[80px] sm:max-w-none">{userInfo.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[80px] sm:max-w-none">{userInfo.email}</div>
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 hidden sm:table-cell">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {enquiry.product_title || productDetails.product_name}
                              </div>
                              {productDetails.metal_name && (
                                <div className="text-xs text-gray-500">Metal: {productDetails.metal_name}</div>
                              )}
                              {productDetails.diamond_name && (
                                <div className="text-xs text-gray-500 hidden md:block">Diamond: {productDetails.diamond_name}</div>
                              )}
                              {productDetails.size_name && (
                                <div className="text-xs text-gray-500 hidden md:block">Size: {productDetails.size_name}</div>
                              )}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm text-gray-600">
                              {enquiry.enquiry_type || 'General'}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4">
                              {fileTypes.length > 0 ? (
                                <div className="space-y-1">
                                  {fileTypes.map((file, idx) => (
                                    <div key={idx} className="text-xs">
                                      <span className="inline-block px-1 sm:px-2 py-1 bg-green-100 text-green-700 rounded text-xs truncate max-w-[80px] sm:max-w-none">
                                        {window.innerWidth < 640 
                                          ? file.file_type.charAt(0).toUpperCase()
                                          : file.file_type.replace('_', ' ').toUpperCase()
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No files</span>
                              )}
                            </td>
                            
                            <td className="px-2 py-3 sm:px-4 sm:py-4 text-sm text-gray-600">
                              {formatDate(enquiry.created_at)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                            No enquiries found
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {userType === 'customer' 
                              ? 'You have no enquiries yet.' 
                              : 'There are no enquiries at the moment.'
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                /* ORDERS TABLE - New empty table for "Orders" tab */
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Product
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Amount
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                          No orders found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          There are no orders at the moment.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-100 rounded-lg">
            <details>
              <summary className="cursor-pointer text-xs sm:text-sm font-medium text-gray-700">
                Debug Info (Development Only)
              </summary>
              <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>Total Orders: {orders.length}</div>
                <div>Total Enquiries: {enquiries.length}</div>
                <div>Filtered Orders: {filteredOrders.length}</div>
                <div>Filtered Enquiries: {filteredEnquiries.length}</div>
                <div>User Type: {userType}</div>
                <div>Order Type: {orderType}</div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;