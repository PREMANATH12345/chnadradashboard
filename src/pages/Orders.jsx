// orders.jsx
import React, { useState, useEffect } from "react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("purchases");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState({});
  
  // Data states
  const [purchases, setPurchases] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [directProducts, setDirectProducts] = useState([]);

  // Category & Product Lookup lists
  const [categories, setCategories] = useState({});
  const [productList, setProductList] = useState({});

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const usersRes = await DoAll({ action: "get", table: "users" });
      if (usersRes?.success) {
        const usersMap = {};
        (usersRes.data || []).forEach(u => { usersMap[u.id] = u; });
        setUsers(usersMap);
      }

      // Fetch categories & products lookup
      const catsRes = await DoAll({ action: "get", table: "category" });
      if (catsRes?.success) {
        const catMap = {};
        (catsRes.data || []).forEach(c => { catMap[c.id] = c.name; });
        setCategories(catMap);
      }

      const prodsRes = await DoAll({ action: "get", table: "products" });
      if (prodsRes?.success) {
        const prodMap = {};
        (prodsRes.data || []).forEach(p => { prodMap[p.id] = p; });
        setProductList(prodMap);
      }

      const purchasesRes = await DoAll({ action: "get", table: "purchases" });
      if (purchasesRes?.success) setPurchases(purchasesRes.data || []);

      const ordersRes = await DoAll({ action: "get", table: "orders" });
      if (ordersRes?.success) setOrders(ordersRes.data || []);

      const enquiriesRes = await DoAll({ action: "get", table: "enquiries" });
      if (enquiriesRes?.success) setEnquiries(enquiriesRes.data || []);

      const directRes = await DoAll({ action: "get", table: "direct_product" });
      if (directRes?.success) setDirectProducts(directRes.data || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load some datasets");
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = (userId) => {
    const user = users[userId];
    if (!user) return { name: "Guest", email: "N/A", phone: "N/A", address: "N/A" };
    
    const addressParts = [user.address_line1, user.address_line2, user.city, user.state, user.postal_code, user.country].filter(Boolean);

    return {
      name: user.full_name || user.name || "N/A",
      email: user.email || "N/A",
      phone: user.phone || user.contact_number || "N/A",
      address: addressParts.join(", ") || "N/A"
    };
  };

  const parseJSON = (str, fallback = {}) => {
    if (!str) return fallback;
    try {
      return typeof str === "string" ? JSON.parse(str) : str;
    } catch (e) {
      return fallback;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (["completed", "success", "approved", "delivered"].includes(s)) return "bg-green-100 text-green-800";
    if (["pending", "placed"].includes(s)) return "bg-yellow-100 text-yellow-800";
    if (["failed", "cancelled"].includes(s)) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  // Filter & Pagination Helper
  const getFilteredData = () => {
    let source = [];
    if (activeTab === "purchases") source = purchases;
    else if (activeTab === "orders") source = orders;
    else if (activeTab === "enquiries") source = enquiries;
    else source = directProducts.filter(p => activeTab === "direct_orders" ? p.order === 1 : p.enquiry === 1);

    return source.filter(row => {
      const user = getUserDetails(row.user_id);
      const matchString = `${user.name} ${user.email} ${user.phone}`.toLowerCase();
      return matchString.includes(searchTerm.toLowerCase());
    });
  };

  const filteredItems = getFilteredData();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = String(text).split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 font-bold">{part}</span> 
            : part
        )}
      </span>
    );
  };

  const getProductTitleHeader = (row) => {
    const prodDetail = parseJSON(row.purchased_product_details || row.enquiry_product_details);
    const pId = prodDetail.product_id || row.product_id; 
    const p = productList[pId];
    
    const catName = p ? categories[p.category_id] : (prodDetail.category_name || prodDetail.category);
    const prName = p ? p.name : (prodDetail.product_name || row.product_title || "N/A");
    
    return (
      <div className="space-y-0.5 mt-1 border-l-2 border-blue-200 pl-2">
        <div className="text-xs text-gray-500">Category: <span className="font-semibold text-gray-800">{(catName || "N/A").toUpperCase()}</span></div>
        <div className="text-sm font-bold text-blue-700">Product: <span>{prName}</span></div>
      </div>
    );
  };

  const tabs = [
    { id: "purchases", label: "STL Purchases", count: purchases.length, color: "bg-purple-600" },
    { id: "orders", label: "CAM/Mold Orders", count: orders.length, color: "bg-blue-600" },
    { id: "enquiries", label: "Enquiries", count: enquiries.length, color: "bg-orange-600" },
    { id: "direct_orders", label: "Basic Orders", count: directProducts.filter(p => p.order === 1).length, color: "bg-green-600" },
    { id: "direct_enq", label: "Basic Enquiries", count: directProducts.filter(p => p.enquiry === 1).length, color: "bg-teal-600" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders & Enquiries Panel</h1>
          <p className="text-sm text-gray-500">Track all purchases and communications here.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={fetchAllData}
            className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-xl border flex flex-col items-center transition-all ${activeTab === tab.id 
              ? `${tab.color} text-white shadow-lg scale-105` 
              : "bg-white text-gray-600 hover:shadow-md"}`}
          >
            <span className="text-xl font-bold">{tab.count}</span>
            <span className="text-xs font-semibold mt-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <div className="overflow-x-auto">
            {activeTab === "purchases" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product & Specs</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Payment Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(row => {
                    const user = getUserDetails(row.user_id);
                    const prod = parseJSON(row.purchased_product_details);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-gray-800">{highlightText(user.name, searchTerm)}</div>
                          <div className="text-xs text-gray-500">{highlightText(user.email, searchTerm)}</div>
                          <div className="text-xs text-gray-500">Phone: {highlightText(user.phone, searchTerm)}</div>
                          <div className="text-xs text-gray-400 max-w-[180px] truncate mt-1" title={user.address}>Address: {user.address}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-blue-700">{getProductTitleHeader(row)}</div>
                          <div className="text-xs text-gray-600 space-y-0.5 mt-1 border-l-2 border-gray-200 pl-2">
                            <p>Metal: <span className="font-semibold">{prod.metal_name || "N/A"}</span></p>
                            <p>Diamond: <span className="font-semibold">{prod.diamond_name || "N/A"}</span></p>
                            <p>Weight: <span className="font-semibold">{prod.weight_name || prod.Weight_name || "N/A"}</span></p>
                            <p>Size: <span className="font-semibold">{prod.size_name || "N/A"}</span></p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{parseFloat(row.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-mono">{row.razorpay_payment_id || "N/A"}</div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(row.payment_status)}`}>
                            {row.payment_status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "orders" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product & Specs</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Shipping Address</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Payment Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(row => {
                    const user = getUserDetails(row.user_id);
                    const address = parseJSON(row.address);
                    const prod = parseJSON(row.purchased_product_details);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-gray-800">{highlightText(user.name, searchTerm)}</div>
                          <div className="text-xs text-gray-500">{highlightText(user.email, searchTerm)}</div>
                          <div className="text-xs text-gray-500">Phone: {highlightText(user.phone || "N/A", searchTerm)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg">
                            {(row.selected_file_type || "").replace("_", " ").toUpperCase() || "CAM/MOLD"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-blue-700">{getProductTitleHeader(row)}</div>
                          <div className="text-xs text-gray-600 space-y-0.5 mt-1 border-l-2 border-gray-200 pl-2">
                            <p>Metal: <span className="font-semibold">{prod.metal_name || "N/A"}</span></p>
                            <p>Diamond: <span className="font-semibold">{prod.diamond_name || "N/A"}</span></p>
                            <p>Weight: <span className="font-semibold">{prod.weight_name || prod.Weight_name || "N/A"}</span></p>
                            <p>Size: <span className="font-semibold">{prod.size_name || "N/A"}</span></p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={`${address.address_line1 || ""}, ${address.city || ""}, ${address.state || ""}`}>
                          {address.address_line1 || "N/A"}, {address.city || ""}, {address.state || ""}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">₹{parseFloat(row.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.created_at)}</td>
                        <td className="px-4 py-3 space-y-1">
                          {row.razorpay_payment_id && <div className="text-xs font-mono">{row.razorpay_payment_id}</div>}
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(row.payment_status)}`}>
                              Pay: {row.payment_status || "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(row.order_status)}`}>
                              Order: {row.order_status || "Placed"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "enquiries" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject & Specs</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(row => {
                    const user = getUserDetails(row.user_id);
                    const prod = parseJSON(row.enquiry_product_details);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-gray-800">{highlightText(user.name, searchTerm)}</div>
                          <div className="text-xs text-gray-500">{highlightText(user.email || "N/A", searchTerm)}</div>
                          <div className="text-xs text-gray-500">Phone: {highlightText(user.phone || "N/A", searchTerm)}</div>
                          <div className="text-xs text-gray-400 mt-1">Address: {user.address}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-800">
                            {(row.enquiry_type || "product_enquiry").replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-blue-700">{getProductTitleHeader(row)}</div>
                          <div className="text-xs text-gray-600 space-y-0.5 mt-1 border-l-2 border-gray-200 pl-2">
                            <p>Metal: <span className="font-semibold">{prod.metal_name || "N/A"}</span></p>
                            <p>Diamond: <span className="font-semibold">{prod.diamond_name || "N/A"}</span></p>
                            <p>Weight: <span className="font-semibold">{prod.weight_name || prod.Weight_name || "N/A"}</span></p>
                            <p>Size: <span className="font-semibold">{prod.size_name || "N/A"}</span></p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {["direct_orders", "direct_enq"].includes(activeTab) && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                    {activeTab === "direct_orders" && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Shipping Address</th>}
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product Details</th>
                    {activeTab === "direct_enq" && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>}
                    {activeTab === "direct_orders" && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>}
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    {activeTab === "direct_orders" && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Payment Details</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(row => {
                      const user = getUserDetails(row.user_id);
                      const prod = parseJSON(row.purchased_product_details);
                      return (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-gray-800">{highlightText(user.name, searchTerm)}</div>
                            <div className="text-xs text-gray-500">{highlightText(user.email, searchTerm)}</div>
                            <div className="text-xs text-gray-500">Phone: {highlightText(user.phone || "N/A", searchTerm)}</div>
                          </td>
                          {activeTab === "direct_orders" && (
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={user.address}>
                              {user.address}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-blue-700">{getProductTitleHeader(row)}</div>
                            <div className="text-xs text-gray-500 mt-1">Gender: {Array.isArray(prod.gender) ? prod.gender.join(", ") : (prod.gender || "Any")}</div>
                          </td>
                          {activeTab === "direct_enq" && (
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                              {prod.description || "N/A"}
                            </td>
                          )}
                          {activeTab === "direct_orders" && (
                             <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{parseFloat(row.amount || prod.price).toLocaleString()}</td>
                          )}
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(row.created_at)}</td>
                          {activeTab === "direct_orders" && (
                            <td className="px-4 py-3">
                              {row.payment_id && <div className="text-xs font-mono mb-1">{row.payment_id}</div>}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status || "success")}`}>
                                {row.status?.toUpperCase() || "SUCCESS"}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-semibold">{filteredItems.length}</span> records
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-2 py-1 text-xs font-semibold bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-xs font-semibold rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 text-xs font-semibold bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty States inside views */}
            {((activeTab === "purchases" && purchases.length === 0) ||
              (activeTab === "orders" && orders.length === 0) ||
              (activeTab === "enquiries" && enquiries.length === 0) ||
              (["direct_orders", "direct_enq"].includes(activeTab) && 
               directProducts.filter(p => activeTab === "direct_orders" ? p.order === 1 : p.enquiry === 1).length === 0)) && (
              <div className="text-center py-20 text-gray-500">
                📦 No records found for this section.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;