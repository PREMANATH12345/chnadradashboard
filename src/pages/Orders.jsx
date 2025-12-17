// orders.jsx
import React, { useState, useEffect } from "react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";

const Orders = () => {
  const [userType, setUserType] = useState("customer");
  const [orderType, setOrderType] = useState("razorpay");
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [users, setUsers] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "purchases",
        where: {},
      });

      if (response?.success) {
        setOrders(response.data || []);
      } else {
        console.warn("No orders data found or API error");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enquiries from database
  const fetchEnquiries = async () => {
    try {
      const response = await DoAll({
        action: "get",
        table: "enquiries",
        where: {},
      });

      if (response?.success) {
        setEnquiries(response.data || []);
      } else {
        console.warn("No enquiries data found or API error");
        setEnquiries([]);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Error loading enquiries");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await DoAll({
        action: "get",
        table: "users",
        where: {},
      });

      if (response?.success) {
        const usersMap = {};
        if (Array.isArray(response.data)) {
          response.data.forEach((user) => {
            usersMap[user.id] = user;
          });
          setUsers(usersMap);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEnquiries();
    fetchUsers();
  }, []);

  // Get current user data from localStorage to determine user type
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const detectedType = user.role || user.user_type || "customer";
        setUserType(detectedType);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserType("customer");
      }
    }
  }, []);

  // Filter data based on user type and order type
  useEffect(() => {
    if (orderType === "razorpay") {
      if (userType === "admin") {
        setFilteredOrders(orders);
        return;
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        setFilteredOrders([]);
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userId = user.id || user.admin_id;

        const userOrders = orders.filter((order) => {
          if (userType === "customer") {
            return String(order.user_id) === String(userId);
          }
          if (userType === "vendor") {
            return true;
          }
          return false;
        });

        setFilteredOrders(userOrders);
      } catch (error) {
        console.error("Error filtering orders:", error);
        setFilteredOrders([]);
      }
    } else if (orderType === "enquiry") {
      if (userType === "admin") {
        setFilteredEnquiries(enquiries);
        return;
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        setFilteredEnquiries([]);
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userId = user.id || user.admin_id;

        const userEnquiries = enquiries.filter((enquiry) => {
          if (userType === "customer") {
            return String(enquiry.user_id) === String(userId);
          }
          if (userType === "vendor") {
            return true;
          }
          return false;
        });

        setFilteredEnquiries(userEnquiries);
      } catch (error) {
        console.error("Error filtering enquiries:", error);
        setFilteredEnquiries([]);
      }
    }
  }, [orders, enquiries, userType, orderType]);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Completed",
      },
      processing: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Processing",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      failed: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Failed",
      },
      responded: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Responded",
      },
      new: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "New" },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color} whitespace-nowrap`}
      >
        {isMobile && config.label.length > 8
          ? config.label.substring(0, 6) + "..."
          : config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isMobile) {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
      } else if (window.innerWidth < 1024) {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        });
      } else {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      return "N/A";
    }
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "₹0";

    if (isMobile && numAmount >= 1000) {
      return `₹${(numAmount / 1000).toFixed(1)}k`;
    }

    return `₹${numAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Get user info from users map
  const getUserInfo = (userId) => {
    const user = users[userId];
    if (user) {
      return {
        name: user.name || `User ${userId}`,
        email: user.email || `user${userId}@example.com`,
        phone: user.phone || "N/A",
      };
    }
    return {
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      phone: "N/A",
    };
  };

  // Handle refresh data
  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
    fetchEnquiries();
    fetchUsers();
  };

  // Mobile Card View Component
  const MobileCardView = ({ data, type }) => {
    if (type === "purchases") {
      return (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const userInfo = getUserInfo(order.user_id);
            let productDetails = {};
            let fileDetails = [];

            try {
              productDetails =
                typeof order.purchased_product_details === "string"
                  ? JSON.parse(order.purchased_product_details)
                  : order.purchased_product_details || {};
            } catch (e) {}

            try {
              fileDetails =
                typeof order.purchased_file_details === "string"
                  ? JSON.parse(order.purchased_file_details)
                  : order.purchased_file_details || [];
            } catch (e) {}

            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">
                      {order.razorpay_payment_id
                        ? `PID: ${order.razorpay_payment_id.substring(
                            0,
                            10
                          )}...`
                        : `ORD-${order.id}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={order.payment_status} />
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {productDetails.product_name ||
                      order.product_title ||
                      "N/A"}
                  </p>
                  <p className="text-xs text-gray-600">{userInfo.name}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    {formatAmount(order.amount)}
                  </span>
                  {fileDetails.length > 0 && (
                    <span className="text-xs text-blue-600">
                      📎 {fileDetails.length} file
                      {fileDetails.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (type === "enquiries") {
      return (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => {
            const userInfo = getUserInfo(enquiry.user_id);
            let productDetails = {};
            let fileTypes = [];

            try {
              productDetails =
                typeof enquiry.enquiry_product_details === "string"
                  ? JSON.parse(enquiry.enquiry_product_details)
                  : enquiry.enquiry_product_details || {};
            } catch (e) {}

            try {
              fileTypes =
                typeof enquiry.enquiry_file_types === "string"
                  ? JSON.parse(enquiry.enquiry_file_types)
                  : enquiry.enquiry_file_types || [];
            } catch (e) {}

            return (
              <div key={enquiry.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      ENQ-{enquiry.id}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(enquiry.created_at)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {enquiry.enquiry_type || "General"}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {enquiry.product_title ||
                      productDetails.product_name ||
                      "General Enquiry"}
                  </p>
                  <p className="text-xs text-gray-600">{userInfo.name}</p>
                </div>

                <div className="flex justify-between items-center">
                  {fileTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {fileTypes.slice(0, 2).map((file, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                        >
                          {file.file_type.charAt(0).toUpperCase()}
                        </span>
                      ))}
                      {fileTypes.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{fileTypes.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No files</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No data found
          </h3>
          <p className="text-sm text-gray-500">There is no data to display</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            {orderType === "razorpay"
              ? "Purchase Orders"
              : orderType === "orders"
              ? "Manual Orders"
              : "Enquiries"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-2">
            {orderType === "razorpay"
              ? "Manage your purchase orders"
              : orderType === "orders"
              ? "Manage your manual orders"
              : "Manage customer enquiries"}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:p-6 mb-4 md:mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 md:mb-3">
            Data Type
          </h3>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={() => setOrderType("razorpay")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${
                orderType === "razorpay"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {isMobile ? "Purchases" : "Purchase Orders"}
            </button>

            <button
              onClick={() => setOrderType("orders")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${
                orderType === "orders"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {isMobile ? "Orders" : "Manual Orders"}
            </button>

            <button
              onClick={() => setOrderType("enquiry")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${
                orderType === "enquiry"
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {isMobile ? "Enquiries" : "Customer Enquiries"}
            </button>
          </div>
        </div>

        {/* Stats and Refresh */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:p-6 mb-3 md:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-1">
                {userType === "customer"
                  ? "Your"
                  : userType === "vendor"
                  ? "Vendor"
                  : "All"}{" "}
                {orderType === "razorpay"
                  ? "Purchase Orders"
                  : orderType === "orders"
                  ? "Manual Orders"
                  : "Enquiries"}
              </h2>
              <p className="text-xs text-gray-600">
                {orderType === "razorpay"
                  ? filteredOrders.length
                  : orderType === "enquiry"
                  ? filteredEnquiries.length
                  : 0}{" "}
                records found
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
              <div className="flex space-x-2 md:space-x-3 lg:space-x-4">
                <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                  <div className="text-base md:text-lg font-bold text-blue-600">
                    {orderType === "razorpay"
                      ? filteredOrders.length
                      : orderType === "enquiry"
                      ? filteredEnquiries.length
                      : 0}
                  </div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                {orderType === "razorpay" && (
                  <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                    <div className="text-base md:text-lg font-bold text-green-600">
                      {
                        filteredOrders.filter(
                          (item) => item.payment_status === "completed"
                        ).length
                      }
                    </div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">
              Loading data...
            </p>
          </div>
        ) : (
          /* Data Display - Mobile Card View or Desktop Table View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isMobile ? (
              /* MOBILE CARD VIEW */
              <div className="p-3 md:p-4">
                {orderType === "razorpay" ? (
                  filteredOrders.length > 0 ? (
                    <MobileCardView data={filteredOrders} type="purchases" />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">📦</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No purchase orders
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userType === "customer"
                          ? "You have no purchase orders yet."
                          : "There are no purchase orders at the moment."}
                      </p>
                    </div>
                  )
                ) : orderType === "enquiry" ? (
                  filteredEnquiries.length > 0 ? (
                    <MobileCardView data={filteredEnquiries} type="enquiries" />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">📋</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No enquiries
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userType === "customer"
                          ? "You have no enquiries yet."
                          : "There are no enquiries at the moment."}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No orders
                    </h3>
                    <p className="text-sm text-gray-500">
                      There are no orders at the moment.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* DESKTOP/TABLET TABLE VIEW */
              <div className="overflow-x-auto">
                {orderType === "razorpay" ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const userInfo = getUserInfo(order.user_id);
                          let productDetails = {};
                          let fileDetails = [];

                          try {
                            productDetails =
                              typeof order.purchased_product_details ===
                              "string"
                                ? JSON.parse(order.purchased_product_details)
                                : order.purchased_product_details || {};
                          } catch (e) {}

                          try {
                            fileDetails =
                              typeof order.purchased_file_details === "string"
                                ? JSON.parse(order.purchased_file_details)
                                : order.purchased_file_details || [];
                          } catch (e) {}

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <div className="font-medium text-gray-900">
                                  {order.razorpay_payment_id
                                    ? order.razorpay_payment_id
                                    : `ORD-${order.id}`}
                                </div>
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <div className="font-medium text-gray-900">
                                  {userInfo.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {userInfo.email}
                                </div>
                              </td>

                              <td className="px-3 py-4 text-sm">
                                <div className="font-medium text-gray-900">
                                  {productDetails.product_name ||
                                    order.product_title ||
                                    "N/A"}
                                </div>
                                {productDetails.metal_name && (
                                  <div className="text-xs text-gray-500">
                                    Metal: {productDetails.metal_name}
                                  </div>
                                )}
                                {fileDetails.length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    📎 {fileDetails.length} file
                                    {fileDetails.length !== 1 ? "s" : ""}
                                  </div>
                                )}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                {formatAmount(order.amount)}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(order.created_at)}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap">
                                <StatusBadge status={order.payment_status} />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-12 text-center">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              No purchase orders found
                            </h3>
                            <p className="text-gray-500">
                              {userType === "customer"
                                ? "You have no purchase orders yet."
                                : "There are no purchase orders at the moment."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : orderType === "enquiry" ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enquiry ID
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Files
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEnquiries.length > 0 ? (
                        filteredEnquiries.map((enquiry) => {
                          const userInfo = getUserInfo(enquiry.user_id);
                          let productDetails = {};
                          let fileTypes = [];

                          try {
                            productDetails =
                              typeof enquiry.enquiry_product_details ===
                              "string"
                                ? JSON.parse(enquiry.enquiry_product_details)
                                : enquiry.enquiry_product_details || {};
                          } catch (e) {}

                          try {
                            fileTypes =
                              typeof enquiry.enquiry_file_types === "string"
                                ? JSON.parse(enquiry.enquiry_file_types)
                                : enquiry.enquiry_file_types || [];
                          } catch (e) {}

                          return (
                            <tr key={enquiry.id} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ENQ-{enquiry.id}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <div className="font-medium text-gray-900">
                                  {userInfo.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {userInfo.email}
                                </div>
                              </td>

                              <td className="px-3 py-4 text-sm">
                                <div className="font-medium text-gray-900">
                                  {enquiry.product_title ||
                                    productDetails.product_name ||
                                    "General Enquiry"}
                                </div>
                                {productDetails.metal_name && (
                                  <div className="text-xs text-gray-500">
                                    Metal: {productDetails.metal_name}
                                  </div>
                                )}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                                {enquiry.enquiry_type || "General"}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap">
                                {fileTypes.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {fileTypes.map((file, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                                      >
                                        {file.file_type
                                          .replace("_", " ")
                                          .toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No files
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(enquiry.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-12 text-center">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              No enquiries found
                            </h3>
                            <p className="text-gray-500">
                              {userType === "customer"
                                ? "You have no enquiries yet."
                                : "There are no enquiries at the moment."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No orders found
                    </h3>
                    <p className="text-gray-500">
                      There are no orders at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
