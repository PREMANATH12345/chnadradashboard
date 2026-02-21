// orders.jsx
import React, { useState, useEffect } from "react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";

const Orders = () => {
  const [userType, setUserType] = useState("customer");
  const [orderType, setOrderType] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [rawManualOrders, setManualOrders] = useState([]);
  const [filteredManualOrders, setFilteredManualOrders] = useState([]);
  const [directProducts, setDirectProducts] = useState([]);
  const [filteredDirectProducts, setFilteredDirectProducts] = useState([]);
  const [directProductSubTab, setDirectProductSubTab] = useState("orders");
  const [users, setUsers] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({});

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch orders from database (purchases table)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "purchases",
        where: {},
      });

      if (response?.success) {
        // Sort in descending order by created_at (newest first)
        const sortedOrders = (response.data || []).sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);
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
        // Sort in descending order by created_at (newest first)
        const sortedEnquiries = (response.data || []).sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setEnquiries(sortedEnquiries);
      } else {
        console.warn("No enquiries data found or API error");
        setEnquiries([]);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Error loading enquiries");
    }
  };

  // Fetch manual orders from orders table
  const fetchManualOrders = async () => {
    try {
      const response = await DoAll({
        action: "get",
        table: "orders",
        where: {},
      });

      if (response?.success) {
        // Sort in descending order by created_at (newest first)
        const sortedManualOrders = (response.data || []).sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setManualOrders(sortedManualOrders);
      } else {
        console.warn("No manual orders data found or API error");
        setManualOrders([]);
      }
    } catch (error) {
      console.error("Error fetching manual orders:", error);
      toast.error("Error loading manual orders");
    }
  };

  const fetchDirectProducts = async () => {
    try {
      const response = await DoAll({
        action: "get",
        table: "direct_product",
        where: {},
      });

      if (response?.success) {
        const sortedDirectProducts = (response.data || []).sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setDirectProducts(sortedDirectProducts);
      } else {
        console.warn("No direct products data found or API error");
        setDirectProducts([]);
      }
    } catch (error) {
      console.error("Error fetching direct products:", error);
      toast.error("Error loading basic purchases");
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
  const handleRefresh = () => {
    fetchOrders();
    fetchEnquiries();
    fetchManualOrders();
    fetchDirectProducts();
    fetchUsers();
    toast.success("Refreshing data...");
  };

  useEffect(() => {
    fetchOrders();
    fetchEnquiries();
    fetchManualOrders();
    fetchDirectProducts();
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
    } else if (orderType === "orders") {
      if (userType === "admin") {
        setFilteredManualOrders(rawManualOrders);
        return;
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        setFilteredManualOrders([]);
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userId = user.id || user.admin_id;

        const userManualOrders = rawManualOrders.filter((order) => {
          if (userType === "customer") {
            return String(order.user_id) === String(userId);
          }
          if (userType === "vendor") {
            return true;
          }
          return false;
        });

        setFilteredManualOrders(userManualOrders);
      } catch (error) {
        console.error("Error filtering manual orders:", error);
        setFilteredManualOrders([]);
      }
    } else if (orderType === "basic") {
      if (userType === "admin") {
        setFilteredDirectProducts(directProducts);
        return;
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        setFilteredDirectProducts([]);
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userId = user.id || user.admin_id;

        const userDirectProducts = directProducts.filter((p) => {
          if (userType === "customer") {
            return String(p.user_id) === String(userId);
          }
          if (userType === "vendor") {
            return true;
          }
          return false;
        });

        setFilteredDirectProducts(userDirectProducts);
      } catch (error) {
        console.error("Error filtering basic purchases:", error);
        setFilteredDirectProducts([]);
      }
    }
  }, [orders, enquiries, rawManualOrders, directProducts, userType, orderType]);

  // Function to handle address view
  const handleViewAddress = (address) => {
    const parsedAddress = parseAddressForModal(address);
    setSelectedAddress(parsedAddress);
    setShowAddressModal(true);
  };

  // Function to parse address for modal display
  const parseAddressForModal = (addressData) => {
    if (!addressData) return { line1: "No address provided" };

    try {
      const address = typeof addressData === 'string' ? JSON.parse(addressData) : addressData;
      if (typeof address === 'object') {
        return {
          line1: address.address_line1 || '',
          line2: address.address_line2 || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
          country: address.country || 'India',
          phone: address.phone || 'Not provided',
          name: address.full_name || 'Not provided'
        };
      }
      return { line1: "Address available" };
    } catch (e) {
      return { line1: "Address available" };
    }
  };

  const StatusBadge = ({ status, type = "payment" }) => {
    const paymentStatusConfig = {
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
    };

    const orderStatusConfig = {
      placed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Order Placed",
      },
      processing: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Processing",
      },
      shipped: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    let config;
    if (type === "order") {
      config = orderStatusConfig[status?.toLowerCase()] || orderStatusConfig.placed;
    } else {
      config = paymentStatusConfig[status?.toLowerCase()] || paymentStatusConfig.pending;
    }

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
        name: user.full_name || user.name || user.username || `User ${userId}`,
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

  // Parse address JSON for display
  const parseAddress = (addressData) => {
    if (!addressData) return "No address provided";

    try {
      const address = typeof addressData === 'string' ? JSON.parse(addressData) : addressData;
      if (typeof address === 'object') {
        const parts = [
          address.address_line1,
          address.city,
          address.state,
          address.pincode
        ].filter(Boolean);
        return parts.join(', ') || "Address available";
      }
      return "Address available";
    } catch (e) {
      return "Address available";
    }
  };

  // Resolve address from user addresses and address_id
  const getUserAddress = (userId, addressId) => {
    const user = users[userId];
    if (!user || !addressId) return "N/A";

    try {
      let addresses = [];
      if (typeof user.addresses === 'string') {
        addresses = JSON.parse(user.addresses);
      } else if (Array.isArray(user.addresses)) {
        addresses = user.addresses;
      }

      const foundAddress = addresses.find(addr => String(addr.id) === String(addressId));
      if (foundAddress) {
        return parseAddress(foundAddress);
      }
    } catch (e) {
      console.error("Error resolving address", e);
    }

    return "Address ID: " + addressId;
  };



  // Address Modal Component
  const AddressModal = () => {
    if (!showAddressModal) return null;

    return (
      <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {selectedAddress.name && (
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedAddress.name}</p>
                </div>
              )}

              {selectedAddress.line1 && (
                <div>
                  <p className="text-sm text-gray-500">Address Line 1</p>
                  <p className="font-medium">{selectedAddress.line1}</p>
                </div>
              )}

              {selectedAddress.line2 && (
                <div>
                  <p className="text-sm text-gray-500">Address Line 2</p>
                  <p className="font-medium">{selectedAddress.line2}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedAddress.city && (
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedAddress.city}</p>
                  </div>
                )}

                {selectedAddress.state && (
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{selectedAddress.state}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedAddress.pincode && (
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="font-medium">{selectedAddress.pincode}</p>
                  </div>
                )}

                {selectedAddress.country && (
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{selectedAddress.country}</p>
                  </div>
                )}
              </div>

              {selectedAddress.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{selectedAddress.phone}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            } catch (e) { }

            try {
              fileDetails =
                typeof order.purchased_file_details === "string"
                  ? JSON.parse(order.purchased_file_details)
                  : order.purchased_file_details || [];
            } catch (e) { }

            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">
                      {order.razorpay_payment_id
                        ? `PID: ${order.razorpay_payment_id.substring(0, 10)}...`
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
                    {productDetails.product_name || order.product_title || "N/A"}
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
            } catch (e) { }

            try {
              fileTypes =
                typeof enquiry.enquiry_file_types === "string"
                  ? JSON.parse(enquiry.enquiry_file_types)
                  : enquiry.enquiry_file_types || [];
            } catch (e) { }

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
                    {enquiry.product_title || productDetails.product_name || "General Enquiry"}
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
    } else if (type === "manualOrders") {
      return (
        <div className="space-y-4">
          {filteredManualOrders.map((order) => {
            const userInfo = getUserInfo(order.user_id);
            let productDetails = {};

            try {
              productDetails =
                typeof order.purchased_product_details === "string"
                  ? JSON.parse(order.purchased_product_details)
                  : order.purchased_product_details || {};
            } catch (e) { }

            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">
                      {order.razorpay_payment_id
                        ? `RPID: ${order.razorpay_payment_id.substring(0, 8)}...`
                        : `ORDER-${order.id}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={order.payment_status} type="payment" />
                    <StatusBadge status={order.order_status} type="order" />
                  </div>
                </div>

                <div className="mb-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {productDetails.product_name || "Product"}
                    </p>
                    <p className="text-xs text-gray-600">{userInfo.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.selected_file_type === 'cam_product'
                    ? 'bg-blue-100 text-blue-700'
                    : order.selected_file_type === 'rubber_mold'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}>
                    {order.selected_file_type?.replace(/_/g, " ").toUpperCase() || "N/A"}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Address:</p>
                    <button
                      onClick={() => handleViewAddress(order.address)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 truncate">
                    {parseAddress(order.address)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    {formatAmount(order.amount)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.currency || "INR"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (type === "direct_product") {
      return (
        <div className="space-y-4">
          {data.map((item) => {
            const userInfo = getUserInfo(item.user_id);
            let productDetails = {};
            try {
              productDetails = typeof item.purchased_product_details === 'string'
                ? JSON.parse(item.purchased_product_details)
                : item.purchased_product_details || {};
            } catch (e) { }

            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">#{item.id}</h3>
                    <p className="text-[10px] text-gray-500">{formatDate(item.created_at)}</p>
                  </div>
                  {directProductSubTab === "orders" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.status === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {item.status?.toUpperCase() || "PENDING"}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-800">{productDetails.category || productDetails.product_name || "N/A"}</p>
                  <p className="text-xs text-gray-600">{userInfo.name}</p>
                </div>
                <div className="flex justify-between items-end">
                  {directProductSubTab === "orders" ? (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Amount</p>
                      <p className="text-sm font-bold text-blue-600">{formatAmount(item.amount || productDetails.price)}</p>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Description</p>
                      <p className="text-xs text-gray-600 truncate">{productDetails.description || "N/A"}</p>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500 text-right ml-2 border-l pl-2">
                    {Array.isArray(productDetails.gender) ? productDetails.gender.join(', ') : (productDetails.gender || 'N/A')}
                  </div>
                </div>
                {directProductSubTab === "orders" && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Address</p>
                    <p className="text-[11px] text-gray-600 italic">
                      {getUserAddress(item.user_id, item.address_id)}
                    </p>
                  </div>
                )}
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
                : orderType === "enquiry"
                  ? "Customer Enquiries"
                  : orderType === "basic"
                    ? (directProductSubTab === "orders" ? "Basic Orders" : "Basic Enquiries")
                    : "Orders & Enquiries"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-2">
            {orderType === "razorpay"
              ? "Manage your online purchase orders"
              : orderType === "orders"
                ? "Manage your manual CAM and Mold orders"
                : orderType === "enquiry"
                  ? "Manage customer enquiries"
                  : "Manage basic product orders and enquiries"}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 lg:p-6 mb-4 md:mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 md:mb-3">
            Data Type
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            <button
              onClick={() => setOrderType("basic")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${orderType === "basic"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600"
                }`}
            >
              {isMobile ? "Basic" : "Basic Purchases"}
            </button>

            <button
              onClick={() => setOrderType("enquiry")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${orderType === "enquiry"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-200 bg-white text-gray-600"
                }`}
            >
              {isMobile ? "Enquiries" : "Customer Enquiries"}
            </button>

            <button
              onClick={() => setOrderType("razorpay")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${orderType === "razorpay"
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-gray-200 bg-white text-gray-600"
                }`}
            >
              {isMobile ? "Purchases" : "Purchase Orders"}
            </button>

            <button
              onClick={() => setOrderType("orders")}
              className={`p-2 md:p-3 rounded-lg border transition-all text-sm md:text-base ${orderType === "orders"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600"
                }`}
            >
              {isMobile ? "Orders" : "Manual Orders"}
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
                    : orderType === "enquiry"
                      ? "Customer Enquiries"
                      : orderType === "basic"
                        ? (directProductSubTab === "orders" ? "Basic Orders" : "Basic Enquiries")
                        : "Basic Purchases"}
              </h2>
              <p className="text-xs text-gray-600">
                {orderType === "razorpay"
                  ? filteredOrders.length
                  : orderType === "enquiry"
                    ? filteredEnquiries.length
                    : orderType === "orders"
                      ? filteredManualOrders.length
                      : filteredDirectProducts.length}{" "}
                records found (Newest first)
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
              {orderType === "basic" && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setDirectProductSubTab("orders")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${directProductSubTab === "orders"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setDirectProductSubTab("enquiry")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${directProductSubTab === "enquiry"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Enquiries
                  </button>
                </div>
              )}
              <div className="flex space-x-2 md:space-x-3 lg:space-x-4">
                <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                  <div className="text-base md:text-lg font-bold text-blue-600">
                    {orderType === "razorpay"
                      ? filteredOrders.length
                      : orderType === "enquiry"
                        ? filteredEnquiries.length
                        : orderType === "orders"
                          ? filteredManualOrders.length
                          : orderType === "basic"
                            ? filteredDirectProducts.filter(p => directProductSubTab === "orders" ? p.order === 1 : p.enquiry === 1).length
                            : 0}
                  </div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                {(orderType === "razorpay" || (orderType === "basic" && directProductSubTab === "orders")) && (
                  <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                    <div className="text-base md:text-lg font-bold text-green-600">
                      {orderType === "razorpay"
                        ? filteredOrders.filter((item) => item.payment_status === "completed").length
                        : filteredDirectProducts.filter(p => p.order === 1 && p.status === "success").length
                      }
                    </div>
                    <div className="text-xs text-green-600">Paid</div>
                  </div>
                )}
                {orderType === "orders" && (
                  <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
                    <div className="text-base md:text-lg font-bold text-green-600">
                      {
                        filteredManualOrders.filter(
                          (item) => item.payment_status === "completed"
                        ).length
                      }
                    </div>
                    <div className="text-xs text-green-600">Paid</div>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isMobile ? (
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
                ) : orderType === "basic" ? (
                  (() => {
                    const typedData = filteredDirectProducts.filter(p =>
                      directProductSubTab === "orders" ? p.order === 1 : p.enquiry === 1
                    );
                    return typedData.length > 0 ? (
                      <MobileCardView data={typedData} type="direct_product" subType={directProductSubTab} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-3">📦</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No {directProductSubTab === "orders" ? "basic orders" : "enquiries"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          There is no data to display.
                        </p>
                      </div>
                    );
                  })()
                ) : orderType === "orders" ? (
                  filteredManualOrders.length > 0 ? (
                    <MobileCardView data={filteredManualOrders} type="manualOrders" />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">📦</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No manual orders
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userType === "customer"
                          ? "You have no manual orders yet."
                          : "There are no manual orders at the moment."}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No data
                    </h3>
                    <p className="text-sm text-gray-500">
                      There is no data to display.
                    </p>
                  </div>
                )}
              </div>
            ) : (
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
                              typeof order.purchased_product_details === "string"
                                ? JSON.parse(order.purchased_product_details)
                                : order.purchased_product_details || {};
                          } catch (e) { }

                          try {
                            fileDetails =
                              typeof order.purchased_file_details === "string"
                                ? JSON.parse(order.purchased_file_details)
                                : order.purchased_file_details || [];
                          } catch (e) { }

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
                                  {productDetails.product_name || order.product_title || "N/A"}
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
                              typeof enquiry.enquiry_product_details === "string"
                                ? JSON.parse(enquiry.enquiry_product_details)
                                : enquiry.enquiry_product_details || {};
                          } catch (e) { }

                          try {
                            fileTypes =
                              typeof enquiry.enquiry_file_types === "string"
                                ? JSON.parse(enquiry.enquiry_file_types)
                                : enquiry.enquiry_file_types || [];
                          } catch (e) { }

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
                                  {enquiry.product_title || productDetails.product_name || "General Enquiry"}
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
                                        {file.file_type.replace("_", " ").toUpperCase()}
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
                ) : orderType === "orders" ? (
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
                          File Type
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredManualOrders.length > 0 ? (
                        filteredManualOrders.map((order) => {
                          const userInfo = getUserInfo(order.user_id);

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ORDER-{order.id}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <div className="font-mono text-xs text-gray-700 truncate max-w-[120px]">
                                  {order.razorpay_payment_id || "N/A"}
                                </div>
                                {order.razorpay_order_id && (
                                  <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                    Order: {order.razorpay_order_id}
                                  </div>
                                )}
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <div className="font-medium text-gray-900">
                                  {userInfo.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {userInfo.email}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Phone: {userInfo.phone}
                                </div>
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.selected_file_type === 'cam_product'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.selected_file_type === 'rubber_mold'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                                  }`}>
                                  {order.selected_file_type?.replace(/_/g, " ").toUpperCase() || "N/A"}
                                </span>
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                <div>{formatAmount(order.amount)}</div>
                                <div className="text-xs text-gray-500">{order.currency || "INR"}</div>
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap">
                                <StatusBadge status={order.payment_status} type="payment" />
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap">
                                <StatusBadge status={order.order_status} type="order" />
                              </td>

                              <td className="px-3 py-4 text-sm">
                                <div className="max-w-[200px]">
                                  <div className="truncate" title={parseAddress(order.address)}>
                                    {parseAddress(order.address)}
                                  </div>
                                  <button
                                    onClick={() => handleViewAddress(order.address)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Full Address
                                  </button>
                                </div>
                              </td>

                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(order.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-3 py-12 text-center">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              No manual orders found
                            </h3>
                            <p className="text-gray-500">
                              {userType === "customer"
                                ? "You have no manual orders yet."
                                : "There are no manual orders at the moment."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : orderType === "basic" ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                          {directProductSubTab === "orders" ? (
                            <>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            </>
                          ) : (
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          )}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          {directProductSubTab === "orders" && (
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const typedData = filteredDirectProducts.filter(p =>
                            directProductSubTab === "orders" ? p.order === 1 : p.enquiry === 1
                          );

                          return typedData.length > 0 ? (
                            typedData.map((item) => {
                              const userInfo = getUserInfo(item.user_id);
                              let productDetails = {};
                              try {
                                productDetails = typeof item.purchased_product_details === 'string'
                                  ? JSON.parse(item.purchased_product_details)
                                  : item.purchased_product_details || {};
                              } catch (e) {
                                console.error("Error parsing product details", e);
                              }

                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{item.id}</td>
                                  <td className="px-3 py-4 text-sm">
                                    <div className="font-bold text-gray-900">{userInfo.name}</div>
                                    <div className="text-[10px] text-gray-500">{userInfo.email}</div>
                                    <div className="text-[10px] text-gray-500">{userInfo.phone}</div>
                                  </td>
                                  <td className="px-3 py-4 text-sm">
                                    <div className="font-bold text-blue-700">{productDetails.category || "General Product"}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">
                                      {Array.isArray(productDetails.gender) ? productDetails.gender.join(', ') : (productDetails.gender || 'N/A')}
                                    </div>
                                  </td>
                                  {directProductSubTab === "orders" ? (
                                    <>
                                      <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatAmount(item.amount || productDetails.price)}</td>
                                      <td className="px-3 py-4 text-xs text-gray-600 max-w-[200px] truncate" title={getUserAddress(item.user_id, item.address_id)}>
                                        {getUserAddress(item.user_id, item.address_id)}
                                      </td>
                                    </>
                                  ) : (
                                    <td className="px-3 py-4 text-xs text-gray-600 max-w-[200px] truncate" title={productDetails.description}>{productDetails.description || "N/A"}</td>
                                  )}
                                  <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-600">{formatDate(item.created_at)}</td>
                                  {directProductSubTab === "orders" && (
                                    <td className="px-3 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.status === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                        {item.status?.toUpperCase() || "PENDING"}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-10 text-center text-gray-400 text-sm italic">
                                No {directProductSubTab === "orders" ? "orders" : "enquiries"} found in Basic Purchases.
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No data found
                    </h3>
                    <p className="text-gray-500">
                      There is no data to display.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <AddressModal />
      </div>
    </div>
  );
};

export default Orders;