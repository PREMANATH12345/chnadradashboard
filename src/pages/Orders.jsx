import React, { useState } from 'react';

const Orders = () => {
  const [userType, setUserType] = useState('customer');
  const [orderType, setOrderType] = useState('razorpay');

  // Sample data structure with user type information
  const sampleOrders = {
    customer: {
      razorpay: [
        {
          id: 1,
          orderId: 'ORD-2025-001',
          customerName: 'John Doe',
          date: '2025-11-22',
          total: 7000.0,
          status: 'Completed',
          items: [
            {
              product: 'Gold Chain',
              category: 'Chains',
              variant: 'Choice of Metal',
              size: 'Size 7',
              quantity: 1,
              price: 7000.0,
              files: ['STL File', 'CAM Product'],
            },
          ],
        },
        {
          id: 2,
          orderId: 'ORD-2025-002',
          customerName: 'Jane Smith',
          date: '2025-11-24',
          total: 1500.0,
          status: 'Processing',
          items: [
            {
              product: 'Gold Earrings',
              category: 'Earrings',
              variant: 'Diamond Quality',
              size: 'Standard',
              quantity: 1,
              price: 1000.0,
            },
            {
              product: 'Silver Bangle',
              category: 'Bangles',
              variant: 'Size',
              size: 'Medium',
              quantity: 1,
              price: 500.0,
              files: ['STL File', 'Rubber Mold', 'CAM Product'],
            },
          ],
        },
      ],
      enquiry: [
        {
          id: 1,
          enquiryId: 'ENQ-2025-001',
          customerName: 'Alice Johnson',
          date: '2025-11-23',
          status: 'Pending',
          items: [
            {
              product: 'Gold Chain',
              category: 'Chains',
              variant: 'Choice of Metal',
              size: 'Size 7',
              quantity: 1,
              message: 'Need gold plated with traditional design',
            },
          ],
        },
      ],
    },
    vendor: {
      razorpay: [
        {
          id: 1,
          orderId: 'VEND-ORD-2025-001',
          customerName: 'Wholesale Buyer Co.',
          date: '2025-11-21',
          total: 25000.0,
          status: 'Completed',
          items: [
            {
              product: 'Bulk Gold Chains',
              category: 'Chains',
              variant: '22K Gold',
              size: 'Various',
              quantity: 10,
              price: 25000.0,
              files: ['STL Files', 'CAM Products'],
            },
          ],
        },
      ],
      enquiry: [
        {
          id: 1,
          enquiryId: 'VEND-ENQ-2025-001',
          customerName: 'Retail Store Chain',
          date: '2025-11-25',
          status: 'Pending',
          items: [
            {
              product: 'Custom Jewelry Set',
              category: 'Sets',
              variant: 'Gold Plated',
              size: 'Standard',
              quantity: 50,
              message: 'Looking for bulk order with custom branding',
            },
          ],
        },
      ],
    },
  };

  // Get current data based on user type and order type
  const currentData = sampleOrders[userType]?.[orderType] || [];

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Completed: { color: 'bg-green-100 text-green-800 border-green-200' },
      Processing: { color: 'bg-blue-100 text-blue-800 border-blue-200' },
      Responded: { color: 'bg-purple-100 text-purple-800 border-purple-200' },
      Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600">
            Manage your {userType === 'customer' ? 'customer' : 'vendor'} orders and enquiries
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* User Type Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">User Type</h3>
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
                    Customer
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
                    Vendor
                  </span>
                </button>
              </div>
            </div>

            {/* Order Type Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Order Type</h3>
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
                    Razorpay
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
                    Enquiry
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {userType === 'customer' ? 'Customer' : 'Vendor'} -{' '}
                {orderType === 'razorpay' ? 'Razorpay Orders' : 'Enquiry Forms'}
              </h2>
              <p className="text-gray-600">
                {currentData.length} {currentData.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{currentData.length}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {orderType === 'razorpay' ? 'Order ID' : 'Enquiry ID'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userType === 'customer' ? 'Customer' : 'Business'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {orderType === 'razorpay' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((order) => (
                order.items.map((item, itemIndex) => (
                  <tr key={`${order.id}-${itemIndex}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {orderType === 'razorpay' ? order.orderId : order.enquiryId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category}
                    </td>
                    {orderType === 'razorpay' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        ₹{item.price?.toFixed(2)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {currentData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {`There are no ${orderType === 'razorpay' ? 'Razorpay orders' : 'enquiry forms'} 
                for ${userType === 'customer' ? 'customers' : 'vendors'} at the moment.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;