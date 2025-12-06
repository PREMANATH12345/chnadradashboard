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
        where: {
          is_deleted: 0
        }
      });

      console.log('Orders API Response:', response); // Debug log

      // FIXED: Check response.data.success for nested structure
      if (response?.data?.success) {
        setOrders(response.data.data || []);
        console.log('Orders data:', response.data.data);
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
        where: {
          is_deleted: 0
        }
      });

      console.log('Enquiries API Response:', response); // Debug log

      // FIXED: Check response.data.success for nested structure
      if (response?.data?.success) {
        setEnquiries(response.data.data || []);
        console.log('Enquiries data:', response.data.data);
      } else {
        console.warn('No enquiries data found or API error');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Error loading enquiries');
    }
  };

  // Fetch users to get customer details
  const fetchUsers = async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'users',
        where: {
          is_deleted: 0
        }
      });

      if (response?.data?.success) {
        const usersMap = {};
        response.data.data.forEach(user => {
          usersMap[user.id] = user;
        });
        setUsers(usersMap);
        console.log('Users data loaded:', Object.keys(usersMap).length, 'users');
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
    if (orderType === 'razorpay') {
      const userOrders = orders.filter(order => {
        // If admin, show all orders
        if (userType === 'admin') return true;
        
        // Get current logged-in user
        const userData = localStorage.getItem('user');
        if (!userData) return false;
        
        try {
          const user = JSON.parse(userData);
          
          // For customers, show their own orders
          if (userType === 'customer') {
            return order.user_id === user.id;
          }
          
          // For vendors, show orders where product belongs to them
          // You might need to join with products table to check vendor ownership
          return true;
        } catch (error) {
          console.error('Error parsing user data for filtering:', error);
          return false;
        }
      });
      setFilteredOrders(userOrders);
    } else {
      const userEnquiries = enquiries.filter(enquiry => {
        // If admin, show all enquiries
        if (userType === 'admin') return true;
        
        // Get current logged-in user
        const userData = localStorage.getItem('user');
        if (!userData) return false;
        
        try {
          const user = JSON.parse(userData);
          
          // For customers, show their own enquiries
          if (userType === 'customer') {
            return enquiry.user_id === user.id;
          }
          
          // For vendors, show enquiries where product belongs to them
          return true;
        } catch (error) {
          console.error('Error parsing user data for filtering:', error);
          return false;
        }
      });
      setFilteredEnquiries(userEnquiries);
    }
  }, [orders, enquiries, userType, orderType]);

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
  const currentData = orderType === 'razorpay' ? filteredOrders : filteredEnquiries;

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {orderType === 'razorpay' ? 'Purchase Orders' : 'Enquiries'}
          </h1>
          <p className="text-gray-600">
            Manage your {orderType === 'razorpay' ? 'purchase orders' : 'customer enquiries'}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* User Type Selection - Only show for admin */}
            {userType === 'admin' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">View As</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUserType('customer')}
                    className={`p-3 rounded-lg border transition-all ${
                      userType === 'customer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className={`font-medium ${userType === 'customer' ? 'text-blue-700' : 'text-gray-600'}`}>
                      Customer View
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setUserType('vendor')}
                    className={`p-3 rounded-lg border transition-all ${
                      userType === 'vendor'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className={`font-medium ${userType === 'vendor' ? 'text-green-700' : 'text-gray-600'}`}>
                      Vendor View
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Order Type Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Data Type</h3>
              <div className="grid grid-cols-2 gap-2">
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
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {userType === 'customer' ? 'Your' : userType === 'vendor' ? 'Vendor' : 'All'} -{' '}
                {orderType === 'razorpay' ? 'Purchase Orders' : 'Enquiries'}
              </h2>
              <p className="text-gray-600">
                {currentData.length} {currentData.length === 1 ? 'record' : 'records'} found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex space-x-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{currentData.length}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {currentData.filter(item => 
                      (orderType === 'razorpay' ? item.payment_status === 'completed' : item.status === 'completed')
                    ).length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : (
          /* Orders/Enquiries Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              {orderType === 'razorpay' ? (
                /* PURCHASES TABLE */
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
                              <div className="text-sm font-medium text-gray-900">{order.product_title}</div>
                              {order.metal && order.metal !== "" && (
                                <div className="text-xs text-gray-500">Metal: {order.metal}</div>
                              )}
                              {order.diamond && order.diamond !== "" && (
                                <div className="text-xs text-gray-500">Diamond: {order.diamond}</div>
                              )}
                              {order.size && order.size !== "" && (
                                <div className="text-xs text-gray-500">Size: {order.size}</div>
                              )}
                              {order.files && order.files !== "[]" && order.files !== "" && (
                                <div className="text-xs text-blue-500 mt-1">
                                  Files: {typeof order.files === 'string' ? order.files : 'Selected'}
                                </div>
                              )}
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
              ) : (
                /* ENQUIRIES TABLE */
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enquiry ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
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
                    {filteredEnquiries.length > 0 ? (
                      filteredEnquiries.map((enquiry) => {
                        const userInfo = getUserInfo(enquiry.user_id);
                        
                        return (
                          <tr key={enquiry.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ENQ-{enquiry.id}
                            </td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="font-medium">{userInfo.name}</div>
                              <div className="text-xs text-gray-500">{userInfo.email}</div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{enquiry.product_title}</div>
                              {enquiry.metal && enquiry.metal !== "" && (
                                <div className="text-xs text-gray-500">Metal: {enquiry.metal}</div>
                              )}
                              {enquiry.diamond && enquiry.diamond !== "" && (
                                <div className="text-xs text-gray-500">Diamond: {enquiry.diamond}</div>
                              )}
                              {enquiry.size && enquiry.size !== "" && (
                                <div className="text-xs text-gray-500">Size: {enquiry.size}</div>
                              )}
                              {enquiry.unavailable_size && (
                                <div className="text-xs text-yellow-600 mt-1">Made to Order Size</div>
                              )}
                            </td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {enquiry.enquiry_type || 'General'}
                            </td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(enquiry.created_at)}
                            </td>
                            
                            <td className="px-4 py-4 whitespace-nowrap">
                              <StatusBadge status={enquiry.status} />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <div className="text-4xl mb-4">📋</div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No enquiries found
                          </h3>
                          <p className="text-gray-500">
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
              )}
            </div>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Debug Info (Development Only)
              </summary>
              <div className="mt-2 text-xs text-gray-600">
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