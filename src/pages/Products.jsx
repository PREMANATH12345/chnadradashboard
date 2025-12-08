
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FiClipboard,
  FiEye,
  FiPlus,
  FiGrid,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiStar,
  FiRefreshCw,
  FiSearch,
  FiBarChart2,
  FiTrash2,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiArrowLeft,
  FiUpload,
  FiFileText,
  FiSettings,
  FiFilter,
  FiTrendingUp,
  FiUsers,
  FiImage,
  FiDollarSign,
  FiSave,
  FiAlertCircle,
  FiInfo,
  FiLink,
} from "react-icons/fi";
import {
  MdCategory,
  MdStyle,
  MdDiamond,
  MdOutlineScreenshotMonitor,
  MdOutlineFileUpload,
} from "react-icons/md";
import { TbRulerMeasure } from "react-icons/tb";
import { GiStonePile, GiMetalBar } from "react-icons/gi";
import { BsGenderAmbiguous } from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_BASE_URL_DAS
const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL

const Products = () => {
  const [currentStep, setCurrentStep] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showVendorSidebar, setShowVendorSidebar] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchUserRole();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      fetchPendingCount();
    }
  }, [userRole]);

  const fetchUserRole = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserRole(user?.role || null);
  };

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/products/pending-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPendingCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: "get", table: "category" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-emerald-700 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header with Navigation Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
              <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage your products efficiently
              </p>
            </div>
          </div>

          {/* Navigation Steps */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-1 sm:p-2 mt-2 sm:mt-0">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2">
              <StepButton
                step="dashboard"
                currentStep={currentStep}
                onClick={() => setCurrentStep("dashboard")}
                icon={<FiGrid className="w-3 h-3 sm:w-4 sm:h-4" />}
                label="Dashboard"
              />
              <StepButton
                step="view-products"
                currentStep={currentStep}
                onClick={() => setCurrentStep("view-products")}
                icon={<FiEye className="w-3 h-3 sm:w-4 sm:h-4" />}
                label={userRole === "admin" ? "All Products" : "My Products"}
              />

              {/* Only show Add Products for vendors */}
              {userRole === "admin" && (
                <StepButton
                  step="add-products"
                  currentStep={currentStep}
                  onClick={() => {
                    if (categories.length === 0) {
                      alert("Please create a category first!");
                      return;
                    }
                    setCurrentStep("add-products");
                  }}
                  icon={<FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                  label="Add Products"
                  disabled={categories.length === 0}
                />
              )}
            </div>
          </div>

          {/* Admin-specific header */}
          {userRole === "admin" && (
            <button
              onClick={() => setShowVendorSidebar(true)}
              className="relative px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0 text-sm sm:text-base"
            >
              <FiClipboard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold">Vendor Products</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Vendor sidebar for admin */}
      {showVendorSidebar && userRole === "admin" && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity"
            onClick={() => setShowVendorSidebar(false)}
          />
          <VendorProductsSidebar
            onClose={() => setShowVendorSidebar(false)}
            onApproveProduct={() => {
              fetchPendingCount();
            }}
          />
        </>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
        {currentStep === "dashboard" && (
          <ProductsDashboard
            categories={categories}
            onViewProducts={() => setCurrentStep("view-products")}
            onAddProducts={() => {
              if (categories.length === 0) {
                alert("Please create a category first!");
                return;
              }
              setCurrentStep("add-products");
            }}
            userRole={userRole}
            pendingCount={pendingCount}
            onOpenVendorSidebar={() => setShowVendorSidebar(true)}
          />
        )}

        {currentStep === "view-products" && (
          <ViewProducts
            categories={categories}
            onBack={() => setCurrentStep("dashboard")}
            onAddProduct={() => {
              if (categories.length === 0) {
                alert("Please create a category first!");
                return;
              }
              setCurrentStep("add-products");
            }}
            userRole={userRole}
          />
        )}

        {currentStep === "add-products" && (
          <AddProducts
            onBack={() => setCurrentStep("dashboard")}
            categories={categories}
            onRefresh={fetchCategories}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

// Step Navigation Button Component
const StepButton = ({
  step,
  currentStep,
  onClick,
  icon,
  label,
  disabled = false,
}) => {
  const isActive = currentStep === step;
  const isCompleted =
    (step === "dashboard" && currentStep !== "dashboard") ||
    (step === "view-products" && currentStep === "add-products");

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
        isActive
          ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md sm:shadow-lg"
          : isCompleted
          ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-2 border-emerald-300"
          : disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border border-gray-200"
      }`}
    >
      <div className={`p-1 rounded ${isActive ? "bg-white/20" : ""}`}>
        {icon}
      </div>
      <span>{label}</span>
      {isCompleted && (
        <div className="ml-1 p-1 bg-emerald-500 text-white rounded-full">
          <FiCheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />
        </div>
      )}
    </button>
  );
};

// ==================== VENDOR PRODUCTS SIDEBAR ====================
const VendorProductsSidebar = ({ onClose, onApproveProduct }) => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [viewProductDetails, setViewProductDetails] = useState(null);

  useEffect(() => {
    fetchPendingProducts();
    fetchVendors();
  }, [selectedVendor]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { status: "pending" };

      if (selectedVendor !== "all") {
        payload.vendor_id = selectedVendor;
      }

      const response = await axios.post(
        `${API_URL}/products/by-status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPendingProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pending products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/doAll`,
        {
          action: "get",
          table: "admin_users",
          where: { role: "vendor", is_deleted: 0 },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleApprove = async (productId, approve = true) => {
    if (!approve && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/products/vendor/approve`,
        {
          product_id: productId,
          action: approve ? "approve" : "reject",
          reason: rejectionReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Product ${approve ? "approved" : "rejected"} successfully`);
        fetchPendingProducts();
        setSelectedProduct(null);
        setRejectionReason("");
        if (onApproveProduct) onApproveProduct();
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("Error processing approval");
    }
  };

  const handleViewProductDetails = (product) => {
    let productDetails = product.product_details;
    if (typeof productDetails === "string") {
      try {
        productDetails = JSON.parse(productDetails);
      } catch (e) {
        productDetails = {};
      }
    }
    setViewProductDetails({ ...product, product_details: productDetails });
  };

  const parseProductDetails = (product) => {
    let productDetails = product.product_details;
    if (typeof productDetails === "string") {
      try {
        productDetails = JSON.parse(productDetails);
      } catch (e) {
        productDetails = {};
      }
    }
    return productDetails;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-all"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-[800px] lg:w-[900px] bg-white shadow-2xl z-40 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:bg-green-800 p-2 rounded-lg transition-colors"
              title="Close"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-semibold">
                Vendor Product Submissions
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-500 px-3 py-1.5 rounded-lg text-sm font-medium">
              {pendingProducts.length} pending
            </div>
            <button
              onClick={fetchPendingProducts}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Vendor:
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="all">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                Showing {pendingProducts.length} products
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading pending products...</p>
            </div>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full mb-4">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Pending Products
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                All vendor submissions have been reviewed. Check back later for
                new submissions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProducts.map((product) => {
                const productDetails = parseProductDetails(product);
                const mainImage = productDetails.images?.[0] || null;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => handleViewProductDetails(product)}
                  >
                    <div className="p-5">
                      <div className="flex gap-4 mb-4">
                        {mainImage ? (
                          <div className="flex-shrink-0 w-24 h-24">
                            <img
                              src={`${BASE_URL}${mainImage}`}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="12" x="50" y="50" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FiPackage className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2 truncate">
                            {product.slug}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {productDetails.category || "No category"}
                            </span>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded">
                              ₹{productDetails.price?.toLocaleString() || "0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Vendor:{" "}
                            <span className="font-medium">
                              {product.vendor_name || "Unknown"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(product.id, true);
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product.id);
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <FiX className="w-4 h-4" />
                          Reject
                        </button>
                      </div>

                      {selectedProduct === product.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <label className="block text-sm font-medium text-red-800 mb-2">
                            Reason for rejection:
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm mb-3"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(product.id, false);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium transition-colors"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(null);
                                setRejectionReason("");
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                          <FiEye className="w-3 h-3 inline mr-1" />
                          Click anywhere on this card to view full details
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {viewProductDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                  <FiPackage className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewProductDetails.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Submitted by:{" "}
                    <span className="font-medium">
                      {viewProductDetails.vendor_name}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewProductDetails(null)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  {viewProductDetails.product_details?.images?.length > 0 ? (
                    <div className="mb-6">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {viewProductDetails.product_details.images
                          .slice(0, 3)
                          .map((img, idx) => (
                            <img
                              key={idx}
                              src={`${BASE_URL}${img}`}
                              alt={`Product ${idx + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          ))}
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        {viewProductDetails.product_details.images.length}{" "}
                        images
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 p-8 bg-gray-100 rounded-xl text-center">
                      <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No images uploaded</p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiInfo className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Product Name</p>
                        <p className="font-medium text-gray-900">
                          {viewProductDetails.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Slug</p>
                        <p className="font-medium text-gray-900">
                          {viewProductDetails.slug}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium text-gray-900">
                          {viewProductDetails.product_details.category || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted On</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            viewProductDetails.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                      <FiDollarSign className="w-5 h-5 text-emerald-600" />
                      Pricing Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-2xl font-bold text-emerald-700">
                          ₹
                          {viewProductDetails.product_details.price?.toLocaleString() ||
                            "0"}
                        </p>
                      </div>
                      {viewProductDetails.product_details.originalPrice && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Original Price
                          </p>
                          <p className="text-lg font-medium text-gray-700 line-through">
                            ₹
                            {viewProductDetails.product_details.originalPrice.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {viewProductDetails.product_details.discount > 0 && (
                        <div className="col-span-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                            <span className="font-bold text-red-700">
                              {viewProductDetails.product_details.discount}% OFF
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewProductDetails.product_details.description && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-gray-600" />
                        Description
                      </h4>
                      <p className="text-gray-700">
                        {viewProductDetails.product_details.description}
                      </p>
                    </div>
                  )}

                  {viewProductDetails.product_details.featured?.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiStar className="w-5 h-5 text-amber-500" />
                        Featured Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewProductDetails.product_details.featured.map(
                          (feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 rounded-lg text-sm font-medium border border-amber-200"
                            >
                              {feature}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {viewProductDetails.product_details.gender?.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUsers className="w-5 h-5 text-blue-600" />
                        Target Audience
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewProductDetails.product_details.gender.map(
                          (gender, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                            >
                              {gender}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiSettings className="w-5 h-5 text-gray-600" />
                      Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Style</p>
                        <p className="font-medium text-gray-900">
                          {viewProductDetails.product_details.style_id || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Metal/Stone</p>
                        <p className="font-medium text-gray-900">
                          {viewProductDetails.product_details.metal_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== DASHBOARD COMPONENT ====================
const ProductsDashboard = ({
  categories,
  onViewProducts,
  onAddProducts,
  userRole,
  pendingCount,
  onOpenVendorSidebar,
}) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowStock: 0,
    pendingProducts: pendingCount,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: "get", table: "products", where: { is_deleted: 0 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const products = response.data.data || [];
        const featured = products.filter((p) => {
          try {
            const details =
              typeof p.product_details === "string"
                ? JSON.parse(p.product_details)
                : p.product_details || {};
            return (
              details.featured?.includes("Latest Designs") ||
              details.featured?.includes("Bestsellers")
            );
          } catch {
            return false;
          }
        }).length;

        const user = JSON.parse(localStorage.getItem("user"));
        const isVendor = userRole === "vendor";

        const filteredProducts = isVendor
          ? products.filter(
              (p) => p.vendor_id === user?.id && p.status === "approved"
            )
          : products.filter((p) => p.status === "approved");

        const pending = isVendor
          ? products.filter(
              (p) => p.vendor_id === user?.id && p.status === "pending"
            ).length
          : products.filter((p) => p.status === "pending").length;

        setStats({
          totalProducts: filteredProducts.length,
          activeProducts: filteredProducts.length,
          featuredProducts: featured,
          lowStock: 0,
          pendingProducts: pending,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <MinimalStatCard
          icon={<FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />}
          value={stats.totalProducts}
          label="Total Products"
          color="emerald"
        />

        {userRole === "vendor" && (
          <MinimalStatCard
            icon={<FiClock className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={stats.pendingProducts}
            label="Pending"
            color="amber"
          />
        )}

        {userRole === "admin" && (
          <MinimalStatCard
            icon={<FiClipboard className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={pendingCount}
            label="Pending"
            color="green"
            onClick={onOpenVendorSidebar}
            clickable={pendingCount > 0}
          />
        )}

        <MinimalStatCard
          icon={<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          value={stats.activeProducts}
          label="Active"
          color="emerald"
        />

        <MinimalStatCard
          icon={<FiStar className="w-4 h-4 sm:w-5 sm:h-5" />}
          value={stats.featuredProducts}
          label="Featured"
          color="emerald"
        />
      </div>

      <div>
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
          <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <MinimalActionCard
            icon={<FiEye className="w-4 h-4 sm:w-5 sm:h-5" />}
            title={userRole === "admin" ? "All Products" : "My Products"}
            description={
              userRole === "admin"
                ? "Browse all products"
                : "View your products"
            }
            onClick={onViewProducts}
            color="emerald"
          />

          {userRole === "vendor" && (
            <MinimalActionCard
              icon={<FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
              title="Add Products"
              description="Add new products"
              onClick={onAddProducts}
              color="emerald"
            />
          )}

          {userRole === "admin" && (
            <MinimalActionCard
              icon={<FiClipboard className="w-4 h-4 sm:w-5 sm:h-5" />}
              title="Vendor Submissions"
              description="Review products"
              onClick={onOpenVendorSidebar}
              color="green"
            />
          )}

          <MinimalActionCard
            icon={<FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            title="Analytics"
            description="View metrics"
            onClick={() => alert("Analytics coming soon!")}
            color="emerald"
          />

          <MinimalActionCard
            icon={<FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />}
            title="Refresh"
            description="Update data"
            onClick={fetchStats}
            color="gray"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg">
            <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Product Tools
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <MinimalToolCard
            icon={<FiSearch className="w-3 h-3 sm:w-4 sm:h-4" />}
            title="Search Products"
            description="Find products"
            onClick={onViewProducts}
          />
          <MinimalToolCard
            icon={<FiBarChart2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            title="Sales Report"
            description="View sales data"
            onClick={() => alert("Sales report coming soon!")}
          />
          <MinimalToolCard
            icon={<FiPackage className="w-3 h-3 sm:w-4 sm:h-4" />}
            title="Inventory"
            description="Manage stock"
            onClick={() => alert("Inventory management coming soon!")}
          />
        </div>
      </div>
    </div>
  );
};

const MinimalStatCard = ({
  icon,
  value,
  label,
  color,
  onClick,
  clickable = false,
}) => {
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      hover: "hover:border-emerald-300",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      hover: "hover:border-amber-300",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
      hover: "hover:border-green-300",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      hover: "hover:border-gray-300",
    },
  };

  const { bg, text, border, hover } = colorClasses[color];

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`${bg} p-3 sm:p-4 rounded-lg sm:rounded-xl border ${border} ${
        clickable ? `cursor-pointer ${hover} transition-colors` : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {value}
          </div>
          <div className="text-xs text-gray-600 font-medium mt-1">{label}</div>
        </div>
        <div className={`p-1.5 sm:p-2 ${bg} rounded-lg ${text}`}>{icon}</div>
      </div>
    </div>
  );
};

const MinimalActionCard = ({
  icon,
  title,
  description,
  onClick,
  color = "emerald",
}) => {
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 hover:bg-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    green: {
      bg: "bg-green-50 hover:bg-green-100",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    gray: {
      bg: "bg-gray-50 hover:bg-gray-100",
      text: "text-gray-700",
      iconBg: "bg-gray-100",
    },
  };

  const { bg, text, iconBg } = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`${bg} p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 text-left w-full transition-colors`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`p-1.5 sm:p-2 ${iconBg} rounded-lg ${text}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-xs sm:text-sm mb-1 truncate ${text}`}
          >
            {title}
          </h3>
          <p className="text-gray-600 text-xs line-clamp-2">{description}</p>
        </div>
      </div>
    </button>
  );
};

const MinimalToolCard = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left w-full"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg text-emerald-600">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
            {title}
          </div>
          <div className="text-xs text-gray-600 truncate">{description}</div>
        </div>
      </div>
    </button>
  );
};

// ==================== VIEW PRODUCTS COMPONENT ====================
const ViewProducts = ({ categories, onBack, onAddProduct, userRole }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePopup, setImagePopup] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] = useState(
    userRole === "vendor" ? ["pending", "approved"] : ["approved"]
  );

  const toggleCategory = (catId) => {
    setSelectedCategoryIds((prev) => {
      const newSelection = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];
      return newSelection;
    });
  };

  const fetchProducts = useCallback(async () => {
    if (selectedCategoryIds.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = {
        category_ids: selectedCategoryIds,
        status:
          statusFilter && statusFilter.length > 0 ? statusFilter : ["approved"],
      };

      if (userRole === "vendor") {
        payload.vendor_id = user.id;
      }

      const response = await axios.post(
        `${API_URL}/products/by-category`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error loading products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryIds, statusFilter, userRole]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryIds, statusFilter, fetchProducts]);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_URL}/products/delete`,
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const canEditDelete = (product) => {
    if (userRole === "admin") return true;
    if (userRole === "vendor") {
      const user = JSON.parse(localStorage.getItem("user"));
      return product.vendor_id === user.id && product.status === "pending";
    }
    return false;
  };

  const filteredProducts = products
    .filter((product) => {
      const productName = product.name || "";
      const productSlug = product.slug || "";
      const searchLower = searchTerm.toLowerCase();
      return (
        productName.toLowerCase().includes(searchLower) ||
        productSlug.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aDetails = a.product_details;
      let bDetails = b.product_details;

      if (typeof aDetails === "string") {
        try {
          aDetails = JSON.parse(aDetails);
        } catch {
          aDetails = {};
        }
      }
      if (typeof bDetails === "string") {
        try {
          bDetails = JSON.parse(bDetails);
        } catch {
          bDetails = {};
        }
      }

      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-high":
          return (bDetails.price || 0) - (aDetails.price || 0);
        case "price-low":
          return (aDetails.price || 0) - (bDetails.price || 0);
        case "discount":
          return (bDetails.discount || 0) - (aDetails.discount || 0);
        case "date-new":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date-old":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

  const renderStatusFilter = () => {
    if (userRole !== "vendor") return null;

    return (
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <label className="block text-xs sm:text-sm font-semibold text-emerald-800">
            Filter by Status:
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            {
              status: "pending",
              label: "Pending",
              icon: <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
              color: "from-amber-500 to-yellow-500",
              bg: "from-amber-50 to-yellow-50",
            },
            {
              status: "approved",
              label: "Approved",
              icon: <FiCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
              color: "from-emerald-500 to-green-500",
              bg: "from-emerald-50 to-green-50",
            },
            {
              status: "rejected",
              label: "Rejected",
              icon: <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
              color: "from-red-500 to-pink-500",
              bg: "from-red-50 to-pink-50",
            },
          ].map(({ status, label, icon, color, bg }) => (
            <button
              key={status}
              onClick={() => {
                if (statusFilter.includes(status)) {
                  setStatusFilter(statusFilter.filter((s) => s !== status));
                } else {
                  setStatusFilter([...statusFilter, status]);
                }
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-all ${
                statusFilter.includes(status)
                  ? `bg-gradient-to-r ${color} text-white`
                  : `bg-gradient-to-r ${bg} text-gray-700 border border-gray-200`
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="p-2 sm:p-3 hover:bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl transition-colors border border-gray-200"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {userRole === "admin" ? "View All Products" : "My Products"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Browse and manage your product catalog
            </p>
          </div>
        </div>
        {userRole === "vendor" && (
          <button
            onClick={onAddProduct}
            className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {renderStatusFilter()}

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white w-full sm:w-auto"
              >
                <option value="name">Sort by Name</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="discount">Discount</option>
                <option value="date-new">Date: Newest First</option>
                <option value="date-old">Date: Oldest First</option>
              </select>

              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl border border-emerald-200 w-full sm:w-auto">
                <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                  {filteredProducts.length} products found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-64 flex-shrink-0 border-r border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                Categories
              </h3>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-green-50 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 border border-gray-200 hover:border-emerald-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <span className="font-medium text-xs sm:text-sm text-gray-700 flex-1">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>

            {selectedCategoryIds.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl border border-emerald-300">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                    {selectedCategoryIds.length}{" "}
                    {selectedCategoryIds.length === 1
                      ? "category"
                      : "categories"}{" "}
                    selected
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            {selectedCategoryIds.length === 0 ? (
              <div className="text-center py-10 sm:py-16 md:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full mb-4 sm:mb-6">
                  <FiPackage className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Select a Category
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm">
                  Choose one or more categories from the sidebar to view
                  products
                </p>
                {userRole === "vendor" && (
                  <button
                    onClick={onAddProduct}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-emerald-600 mb-4 sm:mb-6"></div>
                <p className="text-emerald-700 font-semibold text-sm sm:text-base">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4 sm:mb-6">
                  <FiSearch className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm">
                  No products match your current filters. Try selecting
                  different categories or search terms.
                </p>
                {userRole === "vendor" && (
                  <button
                    onClick={onAddProduct}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                    Add New Product
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={setEditProduct}
                      onDelete={handleDelete}
                      onViewImages={setImagePopup}
                      canEditDelete={canEditDelete(product)}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {imagePopup && (
        <ImagePopup images={imagePopup} onClose={() => setImagePopup(null)} />
      )}

      {editProduct && (
        <EditProductPanel
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={() => {
            setEditProduct(null);
            fetchProducts();
          }}
          categories={categories}
          userRole={userRole}
        />
      )}
    </div>
  );
};
// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onViewImages,
  canEditDelete,
  userRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let productDetails = product.product_details;
  if (typeof productDetails === "string") {
    try {
      productDetails = JSON.parse(productDetails);
    } catch (e) {
      productDetails = {};
    }
  }

  const mainImage = productDetails.images?.[0] || "";
  const isVendor = userRole === "vendor";

  const statusConfig = {
    pending: {
      color: "from-amber-500 to-yellow-500",
      bg: "from-amber-50 to-yellow-50",
      text: "text-amber-800",
      icon: <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
    },
    approved: {
      color: "from-emerald-500 to-green-500",
      bg: "from-emerald-50 to-green-50",
      text: "text-emerald-800",
      icon: <FiCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
    },
    rejected: {
      color: "from-red-500 to-pink-500",
      bg: "from-red-50 to-pink-50",
      text: "text-red-800",
      icon: <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
    },
    default: {
      color: "from-gray-500 to-gray-600",
      bg: "from-gray-50 to-gray-100",
      text: "text-gray-800",
      icon: <FiFileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
    },
  };

  const status = product.status || "default";
  const config = statusConfig[status] || statusConfig.default;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-lg sm:hover:shadow-xl">
      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
        <img
          src={
            mainImage
              ? `${BASE_URL}${mainImage}`
              : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div
            className={`px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r ${config.color} text-white rounded-full text-xs font-bold shadow-md sm:shadow-lg flex items-center gap-1 sm:gap-1.5`}
          >
            {config.icon}
            <span className="text-xs">
              {status === "pending" && "PENDING"}
              {status === "approved" && "APPROVED"}
              {status === "rejected" && "REJECTED"}
              {!status && "DRAFT"}
            </span>
          </div>
        </div>

        {productDetails.discount > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-md sm:shadow-lg">
              🎯 {productDetails.discount}% OFF
            </div>
          </div>
        )}

        {productDetails.images?.length > 0 && (
          <button
            onClick={() => onViewImages(productDetails.images)}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-r from-gray-900/80 to-black/80 text-white rounded-lg sm:rounded-xl text-xs font-medium backdrop-blur-sm hover:from-gray-900 hover:to-black transition-all flex items-center gap-1 sm:gap-2"
            title="View Images"
          >
            <FiEye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {productDetails.images.length} images
          </button>
        )}

        {canEditDelete && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3 sm:pb-6">
            <div className="flex gap-1.5 sm:gap-3">
              <button
                onClick={() => onEdit(product)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md sm:shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                title="Edit Product"
              >
                <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-md sm:shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                title="Delete Product"
              >
                <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 text-sm sm:text-base leading-tight">
            {product.name}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1.5 hover:bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            ) : (
              <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 sm:mb-3">
          <FiFileText className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="truncate">{product.slug}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span className="text-lg sm:text-xl font-bold text-emerald-700">
            ₹{productDetails.price?.toLocaleString() || "0"}
          </span>
          {productDetails.originalPrice > productDetails.price && (
            <span className="text-sm sm:text-base text-gray-400 line-through">
              ₹{productDetails.originalPrice?.toLocaleString() || "0"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
          <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
            {productDetails.category || "Uncategorized"}
          </span>
          {productDetails.gender?.map((gender) => (
            <span
              key={gender}
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-200"
            >
              {gender}
            </span>
          ))}
        </div>

        {userRole === "admin" && product.vendor_name && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-gray-200">
            <div className="flex items-center gap-1.5">
              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <span>
                Vendor:{" "}
                <strong className="text-gray-900">{product.vendor_name}</strong>
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 space-y-2 sm:space-y-3 animate-fadeIn">
            {productDetails.featured?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                    Featured:
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {productDetails.featured.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Style</p>
                <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                  {productDetails.style_id || "N/A"}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Metal</p>
                <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                  {productDetails.metal_id || "N/A"}
                </p>
              </div>
            </div>

            {productDetails.description && (
              <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg sm:rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                    Description:
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                  {productDetails.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== IMAGE POPUP COMPONENT ====================
const ImagePopup = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-8 sm:-top-10 right-0 text-white text-xl sm:text-2xl z-10 hover:text-gray-300 transition-colors p-2"
        >
          ✕
        </button>

        <div className="relative">
          <img
            src={`${BASE_URL}${images[currentIndex]}`}
            alt={`Product ${currentIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 rounded-lg transition-all ${
                  idx === currentIndex
                    ? "border-blue-500 scale-105"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                <img
                  src={`${BASE_URL}${img}`}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-white text-center mt-2 sm:mt-3 font-medium text-sm sm:text-base">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PRODUCT PANEL ====================
const EditProductPanel = ({
  product,
  onClose,
  onSave,
  categories,
  userRole,
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.product_details?.description || "",
    price: product.product_details?.price || 0,
    originalPrice:
      product.product_details?.originalPrice ||
      product.product_details?.price ||
      0,
    discount: product.product_details?.discount || 0,
    featured: product.product_details?.featured || [],
    gender: product.product_details?.gender || [],
    style_id: product.product_details?.style_id || "",
    metal_id: product.product_details?.metal_id || "",
    category_id: product.category_id || "",
    hasMetalChoice: product.product_details?.hasMetalChoice || false,
    hasDiamondChoice: product.product_details?.hasDiamondChoice || false,
    selectedMetalOptions: product.product_details?.selectedMetalOptions || [],
    selectedDiamondOptions:
      product.product_details?.selectedDiamondOptions || [],
    selectedSizes: product.product_details?.selectedSizes || {},
    variantPricing: product.product_details?.variantPricing || {},
  });

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState(
    product.product_details?.images || []
  );
  const [activeVariantTab, setActiveVariantTab] = useState("basic");

  const FILE_TYPE_OPTIONS = [
    "STL File",
    "CAM Product",
    "Rubber Mold",
    "Casting Model",
  ];

  useEffect(() => {
    if (formData.category_id) {
      fetchCategoryDetails(formData.category_id);
    }
  }, [formData.category_id]);

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        axios.post(
          `${API_URL}/doAll`,
          {
            action: "get",
            table: "by_style",
            where: { category_id: catId },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(
          `${API_URL}/doAll`,
          {
            action: "get",
            table: "by_metal_and_stone",
            where: { category_id: catId },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] },
      };

      if (attributesRes.data.success) {
        attributesRes.data.data.forEach((attr) => {
          attributes[attr.type] = { id: attr.id, options: attr.options };
        });
      }

      setCategoryData({
        styles: stylesRes.data.data,
        metals: metalsRes.data.data,
        attributes: attributes,
      });
    } catch (error) {
      console.error("Error fetching category details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (files) => {
    const fileArray = Array.from(files);
    const newImageUrls = fileArray.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...fileArray]);
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFeatured = (feature) => {
    setFormData((prev) => ({
      ...prev,
      featured: prev.featured.includes(feature)
        ? prev.featured.filter((f) => f !== feature)
        : [...prev.featured, feature],
    }));
  };

  const toggleGender = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
    }));
  };

  const toggleMetalChoice = () => {
    setFormData((prev) => ({
      ...prev,
      hasMetalChoice: !prev.hasMetalChoice,
      selectedMetalOptions: !prev.hasMetalChoice
        ? []
        : prev.selectedMetalOptions,
    }));
  };

  const toggleDiamondChoice = () => {
    setFormData((prev) => ({
      ...prev,
      hasDiamondChoice: !prev.hasDiamondChoice,
      selectedDiamondOptions: !prev.hasDiamondChoice
        ? []
        : prev.selectedDiamondOptions,
    }));
  };

  const toggleMetalOption = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedMetalOptions: prev.selectedMetalOptions.includes(optionId)
        ? prev.selectedMetalOptions.filter((id) => id !== optionId)
        : [...prev.selectedMetalOptions, optionId],
    }));
  };

  const toggleDiamondOption = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedDiamondOptions: prev.selectedDiamondOptions.includes(optionId)
        ? prev.selectedDiamondOptions.filter((id) => id !== optionId)
        : [...prev.selectedDiamondOptions, optionId],
    }));
  };

  const toggleSize = (metalId, diamondId, sizeId) => {
    const key = `${metalId || "none"}-${diamondId || "none"}-${sizeId}`;
    setFormData((prev) => ({
      ...prev,
      selectedSizes: {
        ...prev.selectedSizes,
        [key]: !prev.selectedSizes[key],
      },
    }));
  };

  const updateVariantPricing = (metalId, diamondId, sizeId, field, value) => {
    const key = `${metalId || "none"}-${diamondId || "none"}-${sizeId}`;
    setFormData((prev) => ({
      ...prev,
      variantPricing: {
        ...prev.variantPricing,
        [key]: {
          ...prev.variantPricing[key],
          [field]: value,
        },
      },
    }));
  };

  const toggleVariantFileType = (metalId, diamondId, sizeId, fileType) => {
    const key = `${metalId || "none"}-${diamondId || "none"}-${sizeId}`;
    const current = formData.variantPricing[key] || {};
    const currentFiles = current.file_types || [];
    const newFiles = currentFiles.includes(fileType)
      ? currentFiles.filter((f) => f !== fileType)
      : [...currentFiles, fileType];

    setFormData((prev) => ({
      ...prev,
      variantPricing: {
        ...prev.variantPricing,
        [key]: {
          ...current,
          file_types: newFiles,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      let uploadedImageUrls = [
        ...imageUrls.filter((url) => !url.startsWith("blob:")),
      ];

      if (imageFiles.length > 0) {
        const formDataObj = new FormData();
        imageFiles.forEach((file) => {
          formDataObj.append("images", file);
        });

        const uploadRes = await axios.post(
          `${API_URL}/upload-images`,
          formDataObj,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadRes.data.success) {
          uploadedImageUrls = [
            ...uploadedImageUrls,
            ...uploadRes.data.data.images.map((img) => img.url),
          ];
        }
      }

      const productDetails = {
        ...product.product_details,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice:
          parseFloat(formData.originalPrice) || parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        featured: formData.featured,
        gender: formData.gender,
        style_id: formData.style_id,
        metal_id: formData.metal_id,
        images: uploadedImageUrls,
        category:
          categories.find((c) => c.id == formData.category_id)?.name || "",
        hasMetalChoice: formData.hasMetalChoice,
        hasDiamondChoice: formData.hasDiamondChoice,
        selectedMetalOptions: formData.selectedMetalOptions,
        selectedDiamondOptions: formData.selectedDiamondOptions,
        selectedSizes: formData.selectedSizes,
        variantPricing: formData.variantPricing,
      };

      const response = await axios.post(
        `${API_URL}/products/update`,
        {
          product_id: product.id,
          category_id: formData.category_id,
          name: formData.name,
          slug: formData.slug,
          product_details: productDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const variants = [];
        for (const [key, isSelected] of Object.entries(
          formData.selectedSizes
        )) {
          if (!isSelected) continue;

          const pricing = formData.variantPricing[key];
          if (!pricing || !pricing.original_price) continue;

          const [metalPart, diamondPart, sizePart] = key.split("-");

          variants.push({
            metal_option_id: metalPart === "none" ? null : parseInt(metalPart),
            diamond_option_id:
              diamondPart === "none" ? null : parseInt(diamondPart),
            size_option_id: sizePart === "none" ? null : parseInt(sizePart),
            original_price: parseFloat(pricing.original_price),
            discount_price:
              parseFloat(pricing.discount_price) ||
              parseFloat(pricing.original_price),
            discount_percentage: parseInt(pricing.discount_percentage) || 0,
            file_types: pricing.file_types || [],
          });
        }

        if (variants.length > 0) {
          await axios.post(
            `${API_URL}/product-variants/pricing`,
            { product_id: product.id, variants },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        alert("✅ Product updated successfully");
        onSave();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("❌ Error updating product");
    } finally {
      setSaving(false);
    }
  };

  const renderVariantConfiguration = () => (
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-emerald-300">
      <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-blue-800 flex items-center gap-1.5 sm:gap-2">
        ⚙️ Variant Configuration (Optional)
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Choice of Metal */}
        <div className="border-2 border-gray-200 rounded p-2 sm:p-3">
          <label className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasMetalChoice}
              onChange={toggleMetalChoice}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="font-bold text-sm sm:text-base">
              🔩 Choice of Metal
            </span>
          </label>

          {formData.hasMetalChoice && (
            <div className="space-y-1.5 sm:space-y-2">
              {categoryData?.attributes?.metal?.options?.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50 text-xs sm:text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedMetalOptions.includes(opt.id)}
                    onChange={() => toggleMetalOption(opt.id)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>{opt.option_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Diamond Quality */}
        <div className="border-2 border-gray-200 rounded p-2 sm:p-3">
          <label className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasDiamondChoice}
              onChange={toggleDiamondChoice}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="font-bold text-sm sm:text-base">
              💎 Diamond Quality
            </span>
          </label>

          {formData.hasDiamondChoice && (
            <div className="space-y-1.5 sm:space-y-2">
              {categoryData?.attributes?.diamond?.options?.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50 text-xs sm:text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedDiamondOptions.includes(opt.id)}
                    onChange={() => toggleDiamondOption(opt.id)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span>{opt.option_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Info */}
        <div className="border-2 border-blue-300 rounded p-2 sm:p-3 bg-blue-50">
          <h6 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">
            📏 Sizes
          </h6>
          <p className="text-xs text-gray-600">
            Configure sizes below with pricing details
          </p>
        </div>
      </div>

      {/* Size & Pricing Configuration */}
      <div className="mt-3 sm:mt-4">
        <h6 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">
          📐 Configure Sizes & Pricing:
        </h6>

        {/* Size Only (No Metal/Diamond) */}
        {!formData.hasMetalChoice && !formData.hasDiamondChoice && (
          <div className="space-y-2 sm:space-y-3">
            {categoryData?.attributes?.size?.options?.map((sizeOpt) => {
              const key = `none-none-${sizeOpt.id}`;
              const isSelected = formData.selectedSizes[key];
              const pricing = formData.variantPricing[key] || {};

              return (
                <div
                  key={sizeOpt.id}
                  className="border-2 border-gray-200 rounded p-2 sm:p-3"
                >
                  <label className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => toggleSize(null, null, sizeOpt.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <span className="font-bold text-sm sm:text-base">
                      {sizeOpt.option_name}{" "}
                      {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                    </span>
                  </label>

                  {isSelected && (
                    <div className="ml-6 sm:ml-8 space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            💰 Original Price *
                          </label>
                          <input
                            type="number"
                            placeholder="15000"
                            value={pricing.original_price || ""}
                            onChange={(e) =>
                              updateVariantPricing(
                                null,
                                null,
                                sizeOpt.id,
                                "original_price",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            📊 Discount Price
                          </label>
                          <input
                            type="number"
                            placeholder="13000"
                            value={pricing.discount_price || ""}
                            onChange={(e) =>
                              updateVariantPricing(
                                null,
                                null,
                                sizeOpt.id,
                                "discount_price",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            🎯 Discount %
                          </label>
                          <input
                            type="number"
                            placeholder="13"
                            value={pricing.discount_percentage || ""}
                            onChange={(e) =>
                              updateVariantPricing(
                                null,
                                null,
                                sizeOpt.id,
                                "discount_percentage",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5 sm:mb-2">
                          📁 File Types:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
                          {FILE_TYPE_OPTIONS.map((fileType) => (
                            <label
                              key={fileType}
                              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  pricing.file_types?.includes(fileType) ||
                                  false
                                }
                                onChange={() =>
                                  toggleVariantFileType(
                                    null,
                                    null,
                                    sizeOpt.id,
                                    fileType
                                  )
                                }
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                              />
                              <span>{fileType}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Metal Only (No Diamond) */}
        {formData.hasMetalChoice &&
          !formData.hasDiamondChoice &&
          formData.selectedMetalOptions.map((metalId) => {
            const metalOpt = categoryData?.attributes?.metal?.options?.find(
              (o) => o.id === metalId
            );
            return (
              <div
                key={metalId}
                className="mb-3 sm:mb-4 border-2 border-blue-200 rounded p-3 sm:p-4 bg-blue-50"
              >
                <h6 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                  {metalOpt?.option_name}
                </h6>
                <div className="space-y-2 sm:space-y-3">
                  {categoryData?.attributes?.size?.options?.map((sizeOpt) => {
                    const key = `${metalId}-none-${sizeOpt.id}`;
                    const isSelected = formData.selectedSizes[key];
                    const pricing = formData.variantPricing[key] || {};

                    return (
                      <div
                        key={sizeOpt.id}
                        className="border-2 border-gray-200 rounded p-2 sm:p-3 bg-white"
                      >
                        <label className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() =>
                              toggleSize(metalId, null, sizeOpt.id)
                            }
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span className="font-bold text-sm sm:text-base">
                            {sizeOpt.option_name}{" "}
                            {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="ml-6 sm:ml-8 space-y-2 sm:space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  💰 Original Price *
                                </label>
                                <input
                                  type="number"
                                  placeholder="15000"
                                  value={pricing.original_price || ""}
                                  onChange={(e) =>
                                    updateVariantPricing(
                                      metalId,
                                      null,
                                      sizeOpt.id,
                                      "original_price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  📊 Discount Price
                                </label>
                                <input
                                  type="number"
                                  placeholder="13000"
                                  value={pricing.discount_price || ""}
                                  onChange={(e) =>
                                    updateVariantPricing(
                                      metalId,
                                      null,
                                      sizeOpt.id,
                                      "discount_price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  🎯 Discount %
                                </label>
                                <input
                                  type="number"
                                  placeholder="13"
                                  value={pricing.discount_percentage || ""}
                                  onChange={(e) =>
                                    updateVariantPricing(
                                      metalId,
                                      null,
                                      sizeOpt.id,
                                      "discount_percentage",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 sm:mb-2">
                                📁 File Types:
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                {FILE_TYPE_OPTIONS.map((fileType) => (
                                  <label
                                    key={fileType}
                                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        pricing.file_types?.includes(
                                          fileType
                                        ) || false
                                      }
                                      onChange={() =>
                                        toggleVariantFileType(
                                          metalId,
                                          null,
                                          sizeOpt.id,
                                          fileType
                                        )
                                      }
                                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    />
                                    <span>{fileType}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {/* Metal + Diamond */}
        {formData.hasMetalChoice &&
          formData.hasDiamondChoice &&
          formData.selectedMetalOptions.map((metalId) => {
            const metalOpt = categoryData?.attributes?.metal?.options?.find(
              (o) => o.id === metalId
            );
            return formData.selectedDiamondOptions.map((diamondId) => {
              const diamondOpt =
                categoryData?.attributes?.diamond?.options?.find(
                  (o) => o.id === diamondId
                );
              return (
                <div
                  key={`${metalId}-${diamondId}`}
                  className="mb-3 sm:mb-4 border-2 border-purple-200 rounded p-3 sm:p-4 bg-purple-50"
                >
                  <h6 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                    {metalOpt?.option_name} + {diamondOpt?.option_name}
                  </h6>
                  <div className="space-y-2 sm:space-y-3">
                    {categoryData?.attributes?.size?.options?.map((sizeOpt) => {
                      const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
                      const isSelected = formData.selectedSizes[key];
                      const pricing = formData.variantPricing[key] || {};

                      return (
                        <div
                          key={sizeOpt.id}
                          className="border-2 border-gray-200 rounded p-2 sm:p-3 bg-white"
                        >
                          <label className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              onChange={() =>
                                toggleSize(metalId, diamondId, sizeOpt.id)
                              }
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="font-bold text-sm sm:text-base">
                              {sizeOpt.option_name}{" "}
                              {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                            </span>
                          </label>

                          {isSelected && (
                            <div className="ml-6 sm:ml-8 space-y-2 sm:space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    💰 Original Price *
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="15000"
                                    value={pricing.original_price || ""}
                                    onChange={(e) =>
                                      updateVariantPricing(
                                        metalId,
                                        diamondId,
                                        sizeOpt.id,
                                        "original_price",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    📊 Discount Price
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="13000"
                                    value={pricing.discount_price || ""}
                                    onChange={(e) =>
                                      updateVariantPricing(
                                        metalId,
                                        diamondId,
                                        sizeOpt.id,
                                        "discount_price",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    🎯 Discount %
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="13"
                                    value={pricing.discount_percentage || ""}
                                    onChange={(e) =>
                                      updateVariantPricing(
                                        metalId,
                                        diamondId,
                                        sizeOpt.id,
                                        "discount_percentage",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium mb-1.5 sm:mb-2">
                                  📁 File Types:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                  {FILE_TYPE_OPTIONS.map((fileType) => (
                                    <label
                                      key={fileType}
                                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          pricing.file_types?.includes(
                                            fileType
                                          ) || false
                                        }
                                        onChange={() =>
                                          toggleVariantFileType(
                                            metalId,
                                            diamondId,
                                            sizeOpt.id,
                                            fileType
                                          )
                                        }
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                      />
                                      <span>{fileType}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })}
      </div>
    </div>
  );

  const isVendor = userRole === "vendor";
  const canEdit = !isVendor || (isVendor && product.status === "pending");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg sm:rounded-xl text-white">
              <FiEdit className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                Edit Product - {product.name}
              </h3>
              {!canEdit && (
                <p className="text-xs sm:text-sm font-medium text-amber-600">
                  Cannot edit approved/rejected products
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg sm:rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-1 px-3 sm:px-4 md:px-6 overflow-x-auto">
            {["basic", "variants"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveVariantTab(tab)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeVariantTab === tab
                    ? "border-emerald-500 text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50"
                    : "border-transparent text-gray-500 hover:text-emerald-700 hover:border-gray-300"
                }`}
              >
                {tab === "basic" ? (
                  <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <FiSettings className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span>
                  {tab === "basic"
                    ? "Basic Information"
                    : "Variant Configuration"}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 ${
            !canEdit ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {activeVariantTab === "basic" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                      <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-700" />
                    </div>
                    <span>Category *</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm transition-colors"
                    disabled={!canEdit}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      <span>📝</span>
                      <span>Name *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      placeholder="Product name"
                      disabled={!canEdit}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      <span>🔗</span>
                      <span>Slug</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      readOnly
                      disabled={!canEdit}
                    />
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      <span>🎨</span>
                      <span>Style *</span>
                    </label>
                    <select
                      value={formData.style_id}
                      onChange={(e) =>
                        setFormData({ ...formData, style_id: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      disabled={!categoryData || !canEdit}
                    >
                      <option value="">Select Style</option>
                      {categoryData?.styles.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Metal */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      <span>💎</span>
                      <span>Metal/Stone *</span>
                    </label>
                    <select
                      value={formData.metal_id}
                      onChange={(e) =>
                        setFormData({ ...formData, metal_id: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      disabled={!categoryData || !canEdit}
                    >
                      <option value="">Select Metal</option>
                      {categoryData?.metals.map((metal) => (
                        <option key={metal.id} value={metal.id}>
                          {metal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                      <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-700" />
                    </div>
                    <span>Description</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                    placeholder="Product description..."
                    disabled={!canEdit}
                  />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Featured Options */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-emerald-200">
                  <label className="block text-xs sm:text-sm font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg text-white">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span>Featured Tags</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      "Latest Designs",
                      "Bestsellers",
                      "Fast Delivery",
                      "Special Deals",
                    ].map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-emerald-300 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.featured.includes(feature)}
                          onChange={() => toggleFeatured(feature)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                          disabled={!canEdit}
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-emerald-200">
                  <label className="block text-xs sm:text-sm font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg text-white">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span>Target Gender/Age</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {["Kids", "Men", "Women"].map((gender) => (
                      <label
                        key={gender}
                        className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-emerald-300 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={formData.gender.includes(gender)}
                          onChange={() => toggleGender(gender)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 focus:ring-emerald-500 mb-1.5"
                          disabled={!canEdit}
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {gender}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Management */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-emerald-200">
                  <label className="block text-xs sm:text-sm font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg text-white">
                      <FiUpload className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span>Product Images</span>
                  </label>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-emerald-400 transition-colors bg-white mb-4 sm:mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageSelect(e.target.files)}
                      className="hidden"
                      id="image-upload-edit"
                      disabled={!canEdit}
                    />
                    <label
                      htmlFor="image-upload-edit"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="text-emerald-400 mb-3 sm:mb-4">
                        <FiUpload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-1.5 sm:mb-2 font-semibold">
                        Click to upload product images
                      </p>
                      <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 text-xs sm:text-sm font-semibold transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("image-upload-edit").click();
                        }}
                        disabled={!canEdit}
                      >
                        Choose Files
                      </button>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imageUrls.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                          <FiEye className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                          Image Previews ({imageUrls.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            imageUrls.forEach((url, idx) => {
                              if (url.startsWith("blob:")) {
                                URL.revokeObjectURL(url);
                              }
                            });
                            setImageFiles([]);
                            setImageUrls([]);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1.5 font-semibold"
                          disabled={!canEdit}
                        >
                          <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2 shadow-sm"
                          >
                            <div className="relative h-24 sm:h-28">
                              <img
                                src={
                                  url.startsWith("blob:")
                                    ? url
                                    : `${BASE_URL}${url}`
                                }
                                alt={`Preview ${idx + 1}`}
                                className="h-full w-full object-cover rounded-lg"
                              />
                            </div>

                            {canEdit && (
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-all"
                              >
                                <FiTrash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : canEdit ? (
            renderVariantConfiguration()
          ) : (
            <div className="text-center py-10 sm:py-12 md:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4 sm:mb-6">
                <FiX className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 mb-2 sm:mb-3">
                Edit Restricted
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-xs sm:text-sm">
                You cannot edit variant configuration for approved/rejected
                products
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          {canEdit ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:w-6" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 text-center py-3 sm:py-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg sm:rounded-xl border border-amber-200">
              <p className="text-amber-700 font-semibold text-sm sm:text-base">
                This product cannot be edited as it's already {product.status}
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-lg sm:rounded-xl hover:from-gray-400 hover:to-gray-500 font-semibold text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:w-6" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AddProducts = ({ onBack, categories, onRefresh, userRole }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [uploadedPdfFiles, setUploadedPdfFiles] = useState({});
  const [slugErrors, setSlugErrors] = useState({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const FILE_TYPE_OPTIONS = [
    {
      value: "stl_file",
      label: "STL File",
      emoji: "📄",
      requiresPrice: true,
      requiresUpload: true,
    },
    {
      value: "cam_product",
      label: "CAM Product",
      emoji: "⚙️",
      requiresPrice: true,
      requiresUpload: true,
    },
    {
      value: "rubber_mold",
      label: "Rubber Mold",
      emoji: "🔧",
      requiresPrice: false,
      requiresUpload: false,
    },
    {
      value: "casting_model",
      label: "Casting Model",
      emoji: "🏭",
      requiresPrice: false,
      requiresUpload: false,
    },
    {
      value: "finished_product",
      label: "Finished Product",
      emoji: "✨",
      requiresPrice: false,
      requiresUpload: false,
    },
  ];

  const checkSlugUniqueness = async (slug, productId = null) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/products/check-slug`,
        { slug, product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.exists;
    } catch (error) {
      console.error("Slug check error:", error);
      return false;
    }
  };

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        axios.post(
          `${API_URL}/doAll`,
          {
            action: "get",
            table: "by_style",
            where: { category_id: catId },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(
          `${API_URL}/doAll`,
          {
            action: "get",
            table: "by_metal_and_stone",
            where: { category_id: catId },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] },
      };

      if (attributesRes.data.success) {
        attributesRes.data.data.forEach((attr) => {
          attributes[attr.type] = { id: attr.id, options: attr.options };
        });
      }

      setCategoryData({
        styles: stylesRes.data.data,
        metals: metalsRes.data.data,
        attributes: attributes,
      });
    } catch (error) {
      console.error("Error fetching category details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setSelectedStyles([]);
    setSelectedMetals([]);
    setProducts([]);
    setActiveProductTab(0);
    if (catId) fetchCategoryDetails(catId);
  };

  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const toggleMetal = (metalId) => {
    setSelectedMetals((prev) =>
      prev.includes(metalId)
        ? prev.filter((id) => id !== metalId)
        : [...prev, metalId]
    );
  };

  const addProductRow = () => {
    const defaultStyle = selectedStyles.length > 0 ? selectedStyles[0] : "";
    const defaultMetal = selectedMetals.length > 0 ? selectedMetals[0] : "";

    const newProduct = {
      id: Date.now(),
      name: "",
      description: "",
      slug: "",
      style_id: defaultStyle,
      metal_id: defaultMetal,
      price: "",
      originalPrice: "",
      discount: 0,
      featured: [],
      gender: [],
      imageFiles: [],
      imageUrls: [],
      pdfFiles: {},
      hasMetalChoice: false,
      hasDiamondChoice: false,
      selectedMetalOptions: [],
      selectedDiamondOptions: [],
      metalSizeConfig: {},
      diamondSizeConfig: {},
      metalOnlyFiles: {},
      diamondOnlyFiles: {},
      selectedSizes: {},
      variantPricing: {},
      configureSizes: false,
    };

    setProducts([...products, newProduct]);
    setActiveProductTab(products.length);
  };

  const toggleMetalSizeConfig = (productId, metalId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            metalSizeConfig: {
              ...p.metalSizeConfig,
              [metalId]: !p.metalSizeConfig[metalId],
            },
          };
        }
        return p;
      })
    );
  };

  const toggleDiamondSizeConfig = (productId, metalId, diamondId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const key = `${metalId}-${diamondId}`;
          return {
            ...p,
            diamondSizeConfig: {
              ...p.diamondSizeConfig,
              [key]: !p.diamondSizeConfig[key],
            },
          };
        }
        return p;
      })
    );
  };

  const removeProduct = (productId) => {
    setProducts(products.filter((p) => p.id !== productId));
    if (activeProductTab >= products.length - 1) {
      setActiveProductTab(Math.max(0, products.length - 2));
    }
  };

  const toggleConfigureSizes = (productId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            configureSizes: !p.configureSizes,
          };
        }
        return p;
      })
    );
  };

  const updateProduct = async (id, field, value) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };

          if (field === "name") {
            const newSlug = value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
            updated.slug = newSlug;

            checkSlugUniqueness(newSlug).then((exists) => {
              setSlugErrors((prev) => ({
                ...prev,
                [id]: exists
                  ? "This slug already exists. Please create a unique one."
                  : "",
              }));
            });
          }

          if (field === "slug") {
            checkSlugUniqueness(value).then((exists) => {
              setSlugErrors((prev) => ({
                ...prev,
                [id]: exists
                  ? "This slug already exists. Please create a unique one."
                  : "",
              }));
            });
          }

          return updated;
        }
        return p;
      })
    );
  };

  const toggleProductFeatured = (productId, feature) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const featured = p.featured.includes(feature)
            ? p.featured.filter((f) => f !== feature)
            : [...p.featured, feature];
          return { ...p, featured };
        }
        return p;
      })
    );
  };

  const toggleProductGender = (productId, gender) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const genders = p.gender.includes(gender)
            ? p.gender.filter((g) => g !== gender)
            : [...p.gender, gender];
          return { ...p, gender: genders };
        }
        return p;
      })
    );
  };

const handlePdfFileSelect = async (productId, metalId, diamondId, sizeId, fileType, file) => {
  if (!file) return;
  
  // Create FormData for upload
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('token');
  
  try {
    // Upload immediately
    const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      const fileKey = `${productId}-${metalId || 'none'}-${diamondId || 'none'}-${sizeId || 'none'}-${fileType}`;
      
      // Store the uploaded file info
      setUploadedPdfFiles(prev => ({
        ...prev,
        [fileKey]: {
          file_path: response.data.data.file_path,
          file_name: response.data.data.file_name,
          file_size: response.data.data.file_size
        }
      }));
      
      // Update product variant pricing with file info
      setProducts(products.map(p => {
        if (p.id === productId) {
          const variantKey = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId || 'none'}`;
          const current = p.variantPricing[variantKey] || {};
          const currentFiles = current.files || [];
          
          const updatedFiles = currentFiles.map(f => 
            f.file_type === fileType 
              ? { 
                  ...f, 
                  file_path: response.data.data.file_path,
                  file_name: response.data.data.file_name,
                  file_size: response.data.data.file_size
                }
              : f
          );
          
          return {
            ...p,
            variantPricing: {
              ...p.variantPricing,
              [variantKey]: {
                ...current,
                files: updatedFiles
              }
            }
          };
        }
        return p;
      }));
      
      alert('✅ File uploaded successfully!');
    }
  } catch (error) {
    console.error('PDF upload error:', error);
    alert('❌ Error uploading file: ' + (error.response?.data?.message || error.message));
  }
};



  const handleImageSelect = (productId, files) => {
    const fileArray = Array.from(files);

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(
          `File "${file.name}" is not an image. Please select image files only.`
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File "${file.name}" is too large (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB). Maximum size is 10MB.`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const previewUrls = validFiles.map((file) => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error("Error creating blob URL:", error);
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="75" font-family="Arial" font-size="12" text-anchor="middle" fill="%236b7280">${file.name}</text></svg>`;
      }
    });

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            imageFiles: [...p.imageFiles, ...validFiles],
            imageUrls: [...p.imageUrls, ...previewUrls],
          };
        }
        return p;
      })
    );
  };

  const removeImage = (productId, index) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const urlToRevoke = p.imageUrls[index];
          if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(urlToRevoke);
            } catch (error) {
              console.error("Error revoking blob URL:", error);
            }
          }

          return {
            ...p,
            imageFiles: p.imageFiles.filter((_, i) => i !== index),
            imageUrls: p.imageUrls.filter((_, i) => i !== index),
          };
        }
        return p;
      })
    );
  };

  // const handlePdfUpload = async (productId, metalId, diamondId, sizeId, fileType, file) => {
  //   const formData = new FormData();
  //   formData.append('file', file);
    
  //   const token = localStorage.getItem('token');
    
  //   try {
  //     const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
      
  //     if (response.data.success) {
  //       const fileKey = `${productId}-${metalId || 'none'}-${diamondId || 'none'}-${sizeId}-${fileType}`;
  //       setUploadedPdfFiles(prev => ({
  //         ...prev,
  //         [fileKey]: {
  //           file_path: response.data.data.file_path,
  //           file_name: response.data.data.file_name
  //         }
  //       }));
        
  //       setProducts(products.map(p => {
  //         if (p.id === productId) {
  //           const variantKey = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
  //           const current = p.variantPricing[variantKey] || {};
  //           const currentFiles = current.files || [];
            
  //           const updatedFiles = currentFiles.map(f => 
  //             f.file_type === fileType 
  //               ? { ...f, file_path: response.data.data.file_path }
  //               : f
  //           );
            
  //           return {
  //             ...p,
  //             variantPricing: {
  //               ...p.variantPricing,
  //               [variantKey]: {
  //                 ...current,
  //                 files: updatedFiles
  //               }
  //             }
  //           };
  //         }
  //         return p;
  //       }));
        
  //       alert('✅ File uploaded successfully!');
  //     }
  //   } catch (error) {
  //     console.error('PDF upload error:', error);
  //     alert('❌ Error uploading file: ' + (error.response?.data?.message || error.message));
  //   }
  // };

  const toggleProductMetalChoice = (productId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            hasMetalChoice: !p.hasMetalChoice,
            selectedMetalOptions: !p.hasMetalChoice
              ? []
              : p.selectedMetalOptions,
          };
        }
        return p;
      })
    );
  };

  const toggleProductDiamondChoice = (productId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            hasDiamondChoice: !p.hasDiamondChoice,
            selectedDiamondOptions: !p.hasDiamondChoice
              ? []
              : p.selectedDiamondOptions,
          };
        }
        return p;
      })
    );
  };

  const toggleProductMetalOption = (productId, optionId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const selectedMetalOptions = p.selectedMetalOptions.includes(optionId)
            ? p.selectedMetalOptions.filter((id) => id !== optionId)
            : [...p.selectedMetalOptions, optionId];

          const updatedProduct = { ...p, selectedMetalOptions };

          if (!p.selectedMetalOptions.includes(optionId)) {
            const directKey = `${optionId}-none-none`;
            const current = p.variantPricing[directKey] || {};
            const currentFiles = current.files || [];

            if (!currentFiles.some((f) => f.file_type === "stl_file")) {
              updatedProduct.variantPricing = {
                ...p.variantPricing,
                [directKey]: {
                  ...current,
                  files: [
                    ...currentFiles,
                    { file_type: "stl_file", price: null },
                  ],
                },
              };
            }
          }

          return updatedProduct;
        }
        return p;
      })
    );
  };

  const toggleProductDiamondOption = (productId, optionId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const selectedDiamondOptions = p.selectedDiamondOptions.includes(
            optionId
          )
            ? p.selectedDiamondOptions.filter((id) => id !== optionId)
            : [...p.selectedDiamondOptions, optionId];
          return { ...p, selectedDiamondOptions };
        }
        return p;
      })
    );
  };

  const toggleProductSize = (productId, metalId, diamondId, sizeId) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const key = `${metalId || "none"}-${diamondId || "none"}-${sizeId}`;
          const isSelecting = !p.selectedSizes[key];

          const updated = {
            ...p,
            selectedSizes: {
              ...p.selectedSizes,
              [key]: isSelecting,
            },
          };

          if (isSelecting) {
            const current = p.variantPricing[key] || {};
            updated.variantPricing = {
              ...p.variantPricing,
              [key]: {
                ...current,
                files: [{ file_type: "stl_file", price: null }],
              },
            };
          }

          return updated;
        }
        return p;
      })
    );
  };

  const updateVariantPricing = (
    productId,
    metalId,
    diamondId,
    sizeId,
    field,
    value
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const key = `${metalId || "none"}-${diamondId || "none"}-${sizeId}`;
          return {
            ...p,
            variantPricing: {
              ...p.variantPricing,
              [key]: {
                ...p.variantPricing[key],
                [field]: value,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const updateFilePrice = (
    productId,
    metalId,
    diamondId,
    sizeId,
    fileType,
    price
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const key = sizeId
            ? `${metalId || "none"}-${diamondId || "none"}-${sizeId}`
            : `${metalId || "none"}-${diamondId || "none"}-none`;

          const current = p.variantPricing[key] || {};
          const currentFiles = current.files || [];

          const updatedFiles = currentFiles.map((f) =>
            f.file_type === fileType
              ? { ...f, price: parseFloat(price) || null }
              : f
          );

          return {
            ...p,
            variantPricing: {
              ...p.variantPricing,
              [key]: {
                ...current,
                files: updatedFiles,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const toggleVariantFileType = (
    productId,
    metalId,
    diamondId,
    sizeId,
    fileType
  ) => {
    if (fileType === "stl_file") {
      alert("STL File is mandatory and cannot be removed");
      return;
    }

    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const key = sizeId
            ? `${metalId || "none"}-${diamondId || "none"}-${sizeId}`
            : `${metalId || "none"}-${diamondId || "none"}-none`;

          const current = p.variantPricing[key] || {};
          const currentFiles = current.files || [];

          const fileExists = currentFiles.some((f) => f.file_type === fileType);

          const newFiles = fileExists
            ? currentFiles.filter((f) => f.file_type !== fileType)
            : [...currentFiles, { file_type: fileType, price: null }];

          return {
            ...p,
            variantPricing: {
              ...p.variantPricing,
              [key]: {
                ...current,
                files: newFiles,
              },
            },
          };
        }
        return p;
      })
    );
  };

const saveProducts = async () => {
  if (products.length === 0) {
    alert('Please add at least one product');
    return;
  }

  for (const product of products) {
    if (!product.name || !product.style_id || !product.metal_id) {
      alert('Please fill all required fields for all products');
      return;
    }
  }

  setLoading(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isVendor = userRole === 'vendor';

  try {
    for (const product of products) {
      let uploadedImageUrls = [];
      if (product.imageFiles.length > 0) {
        const formData = new FormData();
        product.imageFiles.forEach(file => {
          formData.append('images', file);
        });

        const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (uploadRes.data.success && uploadRes.data.data && Array.isArray(uploadRes.data.data.images)) {
          uploadedImageUrls = uploadRes.data.data.images.map(img => img.url);
        }
      }

      const productDetails = {
        slug: product.slug,
        description: product.description || '',
        price: parseFloat(product.price),
        originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price),
        discount: parseInt(product.discount) || 0,
        style_id: product.style_id,
        metal_id: product.metal_id,
        featured: product.featured,
        gender: product.gender,
        images: uploadedImageUrls,
        category: categories.find(c => c.id == selectedCategoryId)?.name || '',
        hasMetalChoice: product.hasMetalChoice,
        hasDiamondChoice: product.hasDiamondChoice,
        selectedMetalOptions: product.selectedMetalOptions,
        selectedDiamondOptions: product.selectedDiamondOptions,
        selectedSizes: product.selectedSizes,
        variantPricing: product.variantPricing
      };

      const status = isVendor ? 'pending' : 'approved';
      const vendorId = isVendor ? user.id : null;

      const productRes = await axios.post(`${API_URL}/doAll`, {
        action: 'insert',
        table: 'products',
        data: {
          category_id: selectedCategoryId,
          name: product.name,
          slug: product.slug,
          product_details: JSON.stringify(productDetails),
          vendor_id: vendorId,
          status: status,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (productRes.data.success && productRes.data.insertId) {
        const productDbId = productRes.data.insertId;
        const variants = [];

        // ========== 1. PROCESS VARIANTS WITH SIZES ==========
        if (product.selectedSizes && typeof product.selectedSizes === 'object') {
          for (const [key, isSelected] of Object.entries(product.selectedSizes)) {
            if (!isSelected) continue;

            const pricing = product.variantPricing?.[key];
            if (!pricing) continue;

            const [metalPart, diamondPart, sizePart] = key.split('-');
            
            if (sizePart === 'none') continue;
            
            const files = Array.isArray(pricing.files) ? pricing.files : [];
            if (files.length === 0) continue;
            
            // ✅ FIX: Use the CURRENT uploadedPdfFiles state
            const mappedFiles = files.map(f => {
              const fileKey = `${product.id}-${metalPart}-${diamondPart}-${sizePart}-${f.file_type}`;
              
              // ✅ CRITICAL: Access uploadedPdfFiles from the closure
              const uploadedFile = uploadedPdfFiles[fileKey];
              
              console.log('🔍 WITH-SIZE - Looking for:', fileKey);
              console.log('📁 WITH-SIZE - Found:', uploadedFile);
              
              return {
                file_type: f.file_type,
                price: f.price,
                file_path: uploadedFile?.file_path || null,
                file_name: uploadedFile?.file_name || null,
                file_size: uploadedFile?.file_size || null
              };
            });
            
            variants.push({
              metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
              diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
              size_option_id: parseInt(sizePart),
              end_product_price: parseFloat(pricing.end_product_price) || null,
              end_product_discount: parseFloat(pricing.end_product_discount) || null,
              end_product_discount_percentage: parseInt(pricing.end_product_discount_percentage) || null,
              files: mappedFiles
            });
          }
        }

        // ========== 2. PROCESS VARIANTS WITHOUT SIZES ==========
        if (product.variantPricing && typeof product.variantPricing === 'object') {
          for (const [key, pricing] of Object.entries(product.variantPricing)) {
            if (key.endsWith('-none')) {
              const [metalPart, diamondPart, sizePart] = key.split('-');
              
              if (sizePart !== 'none') continue;
              
              const files = Array.isArray(pricing.files) ? pricing.files : [];
              if (files.length === 0) continue;
              
              // ✅ FIX: Use the CURRENT uploadedPdfFiles state
              const mappedFiles = files.map(f => {
                const fileKey = `${product.id}-${metalPart}-${diamondPart}-none-${f.file_type}`;
                
                // ✅ CRITICAL: Access uploadedPdfFiles from the closure
                const uploadedFile = uploadedPdfFiles[fileKey];
                
                console.log('🔍 NO-SIZE - Looking for:', fileKey);
                console.log('📁 NO-SIZE - Found:', uploadedFile);
                console.log('📦 ALL uploadedPdfFiles:', Object.keys(uploadedPdfFiles));
                
                return {
                  file_type: f.file_type,
                  price: f.price,
                  file_path: uploadedFile?.file_path || null,
                  file_name: uploadedFile?.file_name || null,
                  file_size: uploadedFile?.file_size || null
                };
              });
              
              variants.push({
                metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
                diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
                size_option_id: null,
                end_product_price: parseFloat(pricing.end_product_price) || null,
                end_product_discount: parseFloat(pricing.end_product_discount) || null,
                end_product_discount_percentage: parseInt(pricing.end_product_discount_percentage) || null,
                files: mappedFiles
              });
            }
          }
        }

        // Only call API if variants exist
        if (variants.length > 0) {
          console.log('🚀 Sending variants to API:', JSON.stringify(variants, null, 2));
          
          await axios.post(
            `${API_URL}/product-variants/pricing`,
            { product_id: productDbId, variants },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    }

    alert(isVendor 
      ? '✅ Products submitted for admin approval!' 
      : '✅ Products saved successfully!'
    );
    setProducts([]);
    setActiveProductTab(0);
    onRefresh();
  } catch (error) {
    console.error('Error saving products:', error);
    alert('❌ Error saving products: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};
  const selectedCategory = categories.find(c => c.id == selectedCategoryId);

return (
  <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
    {/* Header Section */}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-green-100 p-2 rounded-lg">
          <span className="text-xl">📦</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            Add Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {userRole === "vendor"
              ? "Add new products for admin approval"
              : "Add new products directly to catalog"}
          </p>
        </div>
      </div>
      <button
        onClick={onBack}
        className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-colors"
      >
        <span>←</span>
        <span>Back to Products</span>
      </button>
    </div>

    {/* Category Selection */}
    <div className="bg-green-50 rounded-lg p-4 mb-4 sm:mb-6">
      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span className="bg-green-600 text-white p-1 rounded">📂</span>
        Select Category
      </label>
      <select
        value={selectedCategoryId}
        onChange={(e) => handleCategorySelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white"
      >
        <option value="">-- Select a Category --</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>

    {/* Category Details */}
    {categoryData && selectedCategory && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Styles Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span className="bg-gray-100 p-1 rounded">🎨</span>
            Available Styles
          </h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {categoryData.styles.map((style) => (
              <label
                key={style.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border border-gray-200 min-w-[120px]"
              >
                <input
                  type="checkbox"
                  checked={selectedStyles.includes(style.id)}
                  onChange={() => toggleStyle(style.id)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  {style.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Metals Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span className="bg-gray-100 p-1 rounded">💎</span>
            Available Metals & Stones
          </h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {categoryData.metals.map((metal) => (
              <label
                key={metal.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border border-gray-200 min-w-[120px]"
              >
                <input
                  type="checkbox"
                  checked={selectedMetals.includes(metal.id)}
                  onChange={() => toggleMetal(metal.id)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  {metal.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Add Product Button */}
    {categoryData && (
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={addProductRow}
          className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base flex items-center gap-2 transition-colors shadow-md"
        >
          <span>+</span>
          <span>Add Product</span>
        </button>

        {products.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            {products.length} product{products.length !== 1 ? "s" : ""} added
          </div>
        )}
      </div>
    )}

    {/* Products Tabs */}
    {products.length > 0 && (
      <div className="mb-4 sm:mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 overflow-x-auto">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => setActiveProductTab(index)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                  activeProductTab === index
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📦</span>
                <span>Product {index + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProduct(product.id);
                  }}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </button>
            ))}
          </nav>
        </div>
      </div>
    )}

    {/* Product Forms */}
    {products.map((product, index) => (
      <div
        key={product.id}
        className={`bg-white border-2 rounded-xl shadow-sm mb-6 transition-all duration-300 ${
          activeProductTab === index
            ? "border-green-300 block"
            : "border-gray-200 hidden"
        }`}
      >
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-t-xl border-b">
          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-3">
            <span className="bg-green-600 text-white p-2 rounded-lg">📦</span>
            <span>
              Product #{index + 1} - {product.name || "New Product"}
            </span>
          </h4>
        </div>

        <div className="p-4 sm:p-6">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>📝</span>
                Product Name *
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  updateProduct(product.id, "name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="e.g., Diamond Heart Ring"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>📄</span>
                Description
              </label>
              <input
                type="text"
                value={product.description || ""}
                onChange={(e) =>
                  updateProduct(product.id, "description", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Beautiful description..."
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>🔗</span>
                URL Slug
              </label>
              <input
                type="text"
                value={product.slug}
                onChange={(e) =>
                  updateProduct(product.id, "slug", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  slugErrors[product.id]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="auto-generated-slug"
              />
              {slugErrors[product.id] && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {slugErrors[product.id]}
                </p>
              )}
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>🎨</span>
                Style *
              </label>
              <select
                value={product.style_id}
                onChange={(e) =>
                  updateProduct(product.id, "style_id", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">Select Style</option>
                {categoryData?.styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Metal Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>💎</span>
                Metal/Stone *
              </label>
              <select
                value={product.metal_id}
                onChange={(e) =>
                  updateProduct(product.id, "metal_id", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">Select Metal</option>
                {categoryData?.metals.map((metal) => (
                  <option key={metal.id} value={metal.id}>
                    {metal.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured & Gender Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            {/* Featured Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>⭐</span>
                Featured Options
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Latest Designs",
                  "Bestsellers",
                  "Fast Delivery",
                  "Special Deals",
                ].map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={product.featured.includes(feature)}
                      onChange={() =>
                        toggleProductFeatured(product.id, feature)
                      }
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>👥</span>
                Target Audience
              </label>
              <div className="flex flex-wrap gap-3">
                {["Kids", "Men", "Women"].map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors flex-1 min-w-[100px]"
                  >
                    <input
                      type="checkbox"
                      checked={product.gender.includes(gender)}
                      onChange={() => toggleProductGender(product.id, gender)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🖼️</span>
              Product Images
            </label>

            {/* File Upload Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-green-400 transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageSelect(product.id, e.target.files);
                    e.target.value = "";
                  }
                }}
                className="hidden"
                id={`image-upload-${product.id}`}
              />
              <label
                htmlFor={`image-upload-${product.id}`}
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Click to upload product images
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`image-upload-${product.id}`)
                      .click();
                  }}
                >
                  Choose Files
                </button>
              </label>
            </div>

            {/* Image Previews */}
            {product.imageUrls.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>📷</span>
                    Image Previews ({product.imageUrls.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      product.imageUrls.forEach((url, idx) => {
                        if (url.startsWith("blob:")) {
                          URL.revokeObjectURL(url);
                        }
                      });
                      setProducts(
                        products.map((p) =>
                          p.id === product.id
                            ? { ...p, imageFiles: [], imageUrls: [] }
                            : p
                        )
                      );
                    }}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {product.imageUrls.map((url, idx) => {
                    const imgUrl = url.startsWith("blob:")
                      ? url
                      : url.startsWith("/")
                      ? `${BASE_URL}${url}`
                      : url;

                    return (
                      <div
                        key={idx}
                        className="relative group bg-white rounded-lg border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-32 w-full">
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover rounded-lg"
                            onLoad={(e) => {
                              console.log(`Image ${idx + 1} loaded successfully`);
                            }}
                            onError={(e) => {
                              console.error(`Failed to load image ${idx + 1}:`, url);
                              e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="%236b7280">Image ${
                                idx + 1
                              }</text><text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="%239ca3af">Failed to load</text></svg>`;
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(product.id, idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors z-10"
                          title="Remove image"
                        >
                          ×
                        </button>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">
                            {product.imageFiles[idx]?.name || `Image ${idx + 1}`}
                          </span>
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Variant Configuration */}
          <div className="mt-6 p-4 bg-white border-2 border-green-300 rounded-lg">
            <h5 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
              ⚙️ Variant Configuration (Optional)
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Choice of Metal */}
              <div className="border-2 border-gray-200 rounded p-3">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.hasMetalChoice}
                    onChange={() => toggleProductMetalChoice(product.id)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className="font-bold text-gray-800">🔩 Choice of Metal</span>
                </label>

                {product.hasMetalChoice && (
                  <div className="space-y-2">
                    {categoryData?.attributes?.metal?.options?.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-green-50 border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={product.selectedMetalOptions.includes(
                            opt.id
                          )}
                          onChange={() =>
                            toggleProductMetalOption(product.id, opt.id)
                          }
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-gray-700">{opt.option_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Diamond Quality */}
              <div className="border-2 border-gray-200 rounded p-3">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.hasDiamondChoice}
                    onChange={() => toggleProductDiamondChoice(product.id)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className="font-bold text-gray-800">💎 Diamond Quality</span>
                </label>

                {product.hasDiamondChoice && (
                  <div className="space-y-2">
                    {categoryData?.attributes?.diamond?.options?.map(
                      (opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-green-50 border border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={product.selectedDiamondOptions.includes(
                              opt.id
                            )}
                            onChange={() =>
                              toggleProductDiamondOption(product.id, opt.id)
                            }
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-gray-700">{opt.option_name}</span>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Size Info */}
              <div className="border-2 border-gray-200 rounded p-3">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.configureSizes || false}
                    onChange={() => toggleConfigureSizes(product.id)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className="font-bold text-gray-800">
                    📏 Configure Sizes with Pricing
                  </span>
                </label>
                <p className="text-xs text-gray-600 ml-7">
                  {product.hasMetalChoice || product.hasDiamondChoice
                    ? "✅ Size configuration is active (required for variants)"
                    : "Check this to configure pricing for individual sizes"}
                </p>
              </div>
            </div>

            {/* Size & Pricing Configuration */}
            {(product.hasMetalChoice ||
              product.hasDiamondChoice ||
              product.configureSizes) && (
              <div className="mt-4">
                <h6 className="font-bold mb-3 text-gray-800">📐 Configure Variants:</h6>

                {/* Size Only (No Metal/Diamond) */}
                {!product.hasMetalChoice && !product.hasDiamondChoice && (
                  <div className="space-y-3">
                    {categoryData?.attributes?.size?.options?.map(
                      (sizeOpt) => {
                        const key = `none-none-${sizeOpt.id}`;
                        const isSelected = product.selectedSizes[key];
                        const pricing = product.variantPricing[key] || {};

                        return (
                          <div
                            key={sizeOpt.id}
                            className="border-2 border-gray-200 rounded p-3"
                          >
                            <label className="flex items-center gap-3 mb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={() =>
                                  toggleProductSize(
                                    product.id,
                                    null,
                                    null,
                                    sizeOpt.id
                                  )
                                }
                                className="w-5 h-5 text-green-600"
                              />
                              <span className="font-bold text-gray-800">
                                {sizeOpt.option_name}{" "}
                                {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                              </span>
                            </label>

                            {isSelected && (
                              <div className="ml-8 space-y-3">
                                <div>
                                  <label className="block text-sm font-semibold mb-2 text-gray-800">
                                    📁 File Types & Pricing:
                                  </label>
                                  <div className="space-y-3">
                                    {FILE_TYPE_OPTIONS.map((fileOption) => {
                                      const isFileSelected =
                                        pricing.files?.some(
                                          (f) =>
                                            f.file_type === fileOption.value
                                        ) || false;
                                      const filePrice =
                                        pricing.files?.find(
                                          (f) => f.file_type === fileOption.value
                                        )?.price || "";
                                      const fileKey = `${product.id}-none-none-${sizeOpt.id}-${fileOption.value}`;
                                      const uploadedFile =
                                        uploadedPdfFiles[fileKey];
                                      const isSTL =
                                        fileOption.value === "stl_file";

                                      return (
                                        <div
                                          key={fileOption.value}
                                          className="border rounded p-3 bg-white"
                                        >
                                          <label
                                            className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${
                                              isSTL
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isFileSelected}
                                              onChange={() =>
                                                !isSTL &&
                                                toggleVariantFileType(
                                                  product.id,
                                                  null,
                                                  null,
                                                  sizeOpt.id,
                                                  fileOption.value
                                                )
                                              }
                                              disabled={isSTL}
                                              className="w-4 h-4 text-green-600"
                                            />
                                            <span className="text-lg">
                                              {fileOption.emoji}
                                            </span>
                                            <span className="font-medium text-gray-800">
                                              {fileOption.label}
                                            </span>
                                            {isSTL && (
                                              <span className="text-xs text-green-600 ml-auto">
                                                (Mandatory)
                                              </span>
                                            )}
                                          </label>

                                          {isFileSelected && (
                                            <div className="ml-6 space-y-3">
                                              {fileOption.requiresPrice && (
                                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                                  <p className="text-xs text-gray-700 mb-2 font-semibold">
                                                    🟩 {fileOption.label} Price{" "}
                                                    {isSTL && "*"}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mb-2">
                                                    {isSTL
                                                      ? "This price will be displayed to customers (Required)"
                                                      : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
                                                  </p>
                                                  <input
                                                    type="number"
                                                    placeholder={
                                                      isSTL
                                                        ? "Enter price (required)"
                                                        : "Enter price"
                                                    }
                                                    value={filePrice}
                                                    onChange={(e) =>
                                                      updateFilePrice(
                                                        product.id,
                                                        null,
                                                        null,
                                                        sizeOpt.id,
                                                        fileOption.value,
                                                        e.target.value
                                                      )
                                                    }
                                                    className={`w-full px-3 py-2 border rounded text-sm ${
                                                      isSTL && !filePrice
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                    }`}
                                                    required={isSTL}
                                                  />
                                                  {isSTL && !filePrice && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                      STL price is required
                                                    </p>
                                                  )}
                                                </div>
                                              )}

                                              {fileOption.requiresUpload !== false && (
                                                <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                                                    📎 Upload {fileOption.label}{" "}
                                                    {isSTL && "(Optional)"}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept=".pdf,.stl,.zip,.cam"
                                                    onChange={(e) => {
                                                      if (e.target.files[0]) {
                                                        handlePdfFileSelect(
                                                          product.id,
                                                          null,
                                                          null,
                                                          sizeOpt.id,
                                                          fileOption.value,
                                                          e.target.files[0]
                                                        );
                                                      }
                                                    }}
                                                    className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                                                  />
                                                  {uploadedFile && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                      <span>✓</span>
                                                      <span className="font-medium">
                                                        {uploadedFile.file_name}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {!fileOption.requiresPrice && (
                                                <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                                  💡 Enquiry only - no price needed
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Metal Only (No Diamond) */}
                {product.hasMetalChoice && !product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
                  const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
                  const useSizeConfig = product.metalSizeConfig[metalId];
                  
                  return (
                    <div key={metalId} className="mb-4 border-2 border-blue-200 rounded p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-bold flex items-center gap-2">
                          <span>🔩</span>
                          <span>{metalOpt?.option_name}</span>
                        </h6>
                        
                        <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={useSizeConfig || false}
                            onChange={() => toggleMetalSizeConfig(product.id, metalId)}
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-semibold">+ Config with Sizes</span>
                        </label>
                      </div>

                      {useSizeConfig ? (
                        <div className="space-y-3">
                          {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                            const key = `${metalId}-none-${sizeOpt.id}`;
                            const isSelected = product.selectedSizes[key];
                            const pricing = product.variantPricing[key] || {};
                            
                            return (
                              <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                                <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected || false}
                                    onChange={() => toggleProductSize(product.id, metalId, null, sizeOpt.id)}
                                    className="w-5 h-5"
                                  />
                                  <span className="font-bold">
                                    {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                                  </span>
                                </label>

                                {isSelected && (
                                  <div className="ml-8 space-y-3">
                                    <div>
                                      <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
                                      <div className="space-y-3">
                                        {FILE_TYPE_OPTIONS.map((fileOption) => {
                                          const isFileSelected = pricing.files?.some((f) => f.file_type === fileOption.value) || false;
                                          const filePrice = pricing.files?.find((f) => f.file_type === fileOption.value)?.price || "";
                                          const fileKey = `${product.id}-${metalId}-none-${sizeOpt.id}-${fileOption.value}`;
                                          const uploadedFile = uploadedPdfFiles[fileKey];
                                          const isSTL = fileOption.value === "stl_file";

                                          return (
                                            <div key={fileOption.value} className="border rounded p-3 bg-white">
                                              <label
                                                className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${
                                                  isSTL ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isFileSelected}
                                                  onChange={() => !isSTL && toggleVariantFileType(product.id, metalId, null, sizeOpt.id, fileOption.value)}
                                                  disabled={isSTL}
                                                  className="w-4 h-4"
                                                />
                                                <span className="text-lg">{fileOption.emoji}</span>
                                                <span className="font-medium">{fileOption.label}</span>
                                                {isSTL && <span className="text-xs text-blue-600 ml-auto">(Mandatory)</span>}
                                              </label>

                                              {isFileSelected && (
                                                <div className="ml-6 space-y-3">
                                                  {fileOption.requiresPrice && (
                                                    <div className="p-3 bg-green-50 rounded border border-green-200">
                                                      <p className="text-xs text-gray-700 mb-2 font-semibold">
                                                        🟩 {fileOption.label} Price {isSTL && "*"}
                                                      </p>
                                                      <p className="text-xs text-gray-500 mb-2">
                                                      {isSTL
                                                        ? "This price will be displayed to customers (Required)"
                                                        : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
                                                      </p>
                                                      <input
                                                        type="number"
                                                        placeholder={isSTL ? "Enter price (required)" : "Enter price"}
                                                        value={filePrice}
                                                        onChange={(e) => updateFilePrice(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.value)}
                                                       className={`w-full px-3 py-2 border rounded text-sm ${
                                                        isSTL && !filePrice ? "border-red-500" : "border-gray-300"
                                                      }`}
                                                        required={isSTL}
                                                      />
                                                      {isSTL && !filePrice && (
                                                        <p className="text-xs text-red-600 mt-1">STL price is required</p>
                                                      )}
                                                    </div>
                                                  )}

                                                  {fileOption.requiresUpload !== false && (
                                                    <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                                      <label className="block text-xs font-semibold text-gray-800 mb-2">
                                                        📎 Upload {fileOption.label} {isSTL && "(Optional)"}
                                                      </label>
                                                      <input
                                                        type="file"
                                                        accept=".pdf,.stl,.zip,.cam"
                                                        onChange={(e) => {
                                                          if (e.target.files[0]) {
                                                            handlePdfFileSelect(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.files[0]);
                                                          }
                                                        }}
                                                        className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                                                      />
                                                      {uploadedFile && (
                                                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                          <span>✓</span>
                                                          <span className="font-medium">{uploadedFile.file_name}</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}

                                                  {!fileOption.requiresPrice && (
                                                  <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                                    💡 Enquiry only - no price needed
                                                  </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3 border-2 border-gray-200 rounded p-3 bg-white">
                          <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
                          <div className="space-y-3">
                            {FILE_TYPE_OPTIONS.map(fileOption => {
                              const directKey = `${metalId}-none-none`;
                              const pricing = product.variantPricing[directKey] || {};
                              const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
                              const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
                              const fileKey = `${product.id}-${metalId}-direct-${fileOption.value}`;
                              const uploadedFile = uploadedPdfFiles[fileKey];
                              const isSTL = fileOption.value === 'stl_file';
                              
                              const shouldShowSTL = isSTL && product.selectedMetalOptions.includes(metalId);
                              
                              return (
                                <div key={fileOption.value} className="border rounded p-3 bg-gray-50">
                                  {isSTL ? (
                                    <div className="flex items-center gap-2 text-sm mb-2">
                                      <span className="text-lg">{fileOption.emoji}</span>
                                      <span className="font-medium">{fileOption.label} (Mandatory)</span>
                                    </div>
                                  ) : (
                                    <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                                      <input
                                        type="checkbox"
                                        checked={isFileSelected}
                                        onChange={() => {
                                          toggleVariantFileType(product.id, metalId, null, null, fileOption.value);
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-lg">{fileOption.emoji}</span>
                                      <span className="font-medium">{fileOption.label}</span>
                                    </label>
                                  )}
                                  
                                  {(isSTL || isFileSelected) && (
                                    <div className="ml-6 space-y-3">
                                      {fileOption.requiresPrice && (
                                        <div className="p-3 bg-green-50 rounded border border-green-200">
                                          <p className="text-xs text-gray-700 mb-2 font-semibold">
                                            🟩 {fileOption.label} Price {isSTL && '*'}
                                          </p>
                                          <input
                                            type="number"
                                            placeholder={isSTL ? "Enter price (required)" : "Enter price"}
                                            value={filePrice}
                                            onChange={(e) => {
                                              updateFilePrice(product.id, metalId, null, null, fileOption.value, e.target.value);
                                            }}
                                            className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
                                          />
                                        </div>
                                      )}
                                      
                                      {fileOption.requiresUpload !== false && (
                                        <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                          <label className="block text-xs font-semibold text-gray-800 mb-2">
                                            📎 Upload {fileOption.label}
                                          </label>
                                          <input
                                            type="file"
                                            accept=".pdf,.stl,.zip,.cam"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                  handlePdfFileSelect(product.id, metalId, null, null, fileOption.value, e.target.files[0]);
                                                }
                                              }}
                                            className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                                          />
                                          {uploadedFile && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                              <span>✓</span>
                                              <span className="font-medium">{uploadedFile.file_name}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {!fileOption.requiresPrice && (
                                        <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                          💡 Enquiry only - no price needed
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Metal Only (No Diamond) - FIXED VERSION */}
                {product.hasMetalChoice &&
                  !product.hasDiamondChoice &&
                  product.selectedMetalOptions.map((metalId) => {
                    const metalOpt =
                      categoryData?.attributes?.metal?.options?.find(
                        (o) => o.id === metalId
                      );
                    const useSizeConfig = product.metalSizeConfig[metalId];

                    return (
                      <div
                        key={metalId}
                        className="mb-4 border-2 border-green-200 rounded p-4 bg-green-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-bold flex items-center gap-2 text-gray-800">
                            <span>🔩</span>
                            <span>{metalOpt?.option_name}</span>
                          </h6>

                          <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={useSizeConfig || false}
                              onChange={() =>
                                toggleMetalSizeConfig(product.id, metalId)
                              }
                              className="w-5 h-5 text-green-600"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              + Config with Sizes
                            </span>
                          </label>
                        </div>

                        {useSizeConfig ? (
                          <div className="space-y-3">
                            {categoryData?.attributes?.size?.options?.map(
                              (sizeOpt) => {
                                const key = `${metalId}-none-${sizeOpt.id}`;
                                const isSelected = product.selectedSizes[key];
                                const pricing =
                                  product.variantPricing[key] || {};

                                return (
                                  <div
                                    key={sizeOpt.id}
                                    className="border-2 border-gray-200 rounded p-3 bg-white"
                                  >
                                    <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isSelected || false}
                                        onChange={() =>
                                          toggleProductSize(
                                            product.id,
                                            metalId,
                                            null,
                                            sizeOpt.id
                                          )
                                        }
                                        className="w-5 h-5 text-green-600"
                                      />
                                      <span className="font-bold text-gray-800">
                                        {sizeOpt.option_name}{" "}
                                        {sizeOpt.size_mm &&
                                          `(${sizeOpt.size_mm}mm)`}
                                      </span>
                                    </label>

                                    {isSelected && (
                                      <div className="ml-8 space-y-3">
                                        <div>
                                          <label className="block text-sm font-semibold mb-2 text-gray-800">
                                            📁 File Types & Pricing:
                                          </label>
                                          <div className="space-y-3">
                                            {FILE_TYPE_OPTIONS.map(
                                              (fileOption) => {
                                                const isFileSelected =
                                                  pricing.files?.some(
                                                    (f) =>
                                                      f.file_type ===
                                                      fileOption.value
                                                  ) || false;
                                                const filePrice =
                                                  pricing.files?.find(
                                                    (f) =>
                                                      f.file_type ===
                                                      fileOption.value
                                                  )?.price || "";
                                                const fileKey = `${product.id}-${metalId}-none-${sizeOpt.id}-${fileOption.value}`;
                                                const uploadedFile =
                                                  uploadedPdfFiles[fileKey];
                                                const isSTL =
                                                  fileOption.value ===
                                                  "stl_file";

                                                return (
                                                  <div
                                                    key={fileOption.value}
                                                    className="border rounded p-3 bg-white"
                                                  >
                                                    <label
                                                      className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${
                                                        isSTL
                                                          ? "opacity-50 cursor-not-allowed"
                                                          : ""
                                                      }`}
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={
                                                          isFileSelected
                                                        }
                                                        onChange={() =>
                                                          !isSTL &&
                                                          toggleVariantFileType(
                                                            product.id,
                                                            metalId,
                                                            null,
                                                            sizeOpt.id,
                                                            fileOption.value
                                                          )
                                                        }
                                                        disabled={isSTL}
                                                        className="w-4 h-4 text-green-600"
                                                      />
                                                      <span className="text-lg">
                                                        {fileOption.emoji}
                                                      </span>
                                                      <span className="font-medium text-gray-800">
                                                        {fileOption.label}
                                                      </span>
                                                      {isSTL && (
                                                        <span className="text-xs text-green-600 ml-auto">
                                                          (Mandatory)
                                                        </span>
                                                      )}
                                                    </label>

                                                    {isFileSelected && (
                                                      <div className="ml-6 space-y-3">
                                                        {fileOption.requiresPrice && (
                                                          <div className="p-3 bg-green-50 rounded border border-green-200">
                                                            <p className="text-xs text-gray-700 mb-2 font-semibold">
                                                              🟩{" "}
                                                              {
                                                                fileOption.label
                                                              }{" "}
                                                              Price{" "}
                                                              {isSTL && "*"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-2">
                                                              {isSTL
                                                                ? "This price will be displayed to customers (Required)"
                                                                : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
                                                            </p>
                                                            <input
                                                              type="number"
                                                              placeholder={
                                                                isSTL
                                                                  ? "Enter price (required)"
                                                                  : "Enter price"
                                                              }
                                                              value={
                                                                filePrice
                                                              }
                                                              onChange={(e) =>
                                                                updateFilePrice(
                                                                  product.id,
                                                                  metalId,
                                                                  null,
                                                                  sizeOpt.id,
                                                                  fileOption.value,
                                                                  e.target
                                                                    .value
                                                                )
                                                              }
                                                              className={`w-full px-3 py-2 border rounded text-sm ${
                                                                isSTL &&
                                                                !filePrice
                                                                  ? "border-red-500"
                                                                  : "border-gray-300"
                                                              }`}
                                                              required={isSTL}
                                                            />
                                                            {isSTL &&
                                                              !filePrice && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                  STL price is
                                                                  required
                                                                </p>
                                                              )}
                                                          </div>
                                                        )}

                                                        {fileOption.requiresUpload !==
                                                          false && (
                                                          <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                                            <label className="block text-xs font-semibold text-gray-800 mb-2">
                                                              📎 Upload{" "}
                                                              {
                                                                fileOption.label
                                                              }{" "}
                                                              {isSTL &&
                                                                "(Optional)"}
                                                            </label>
                                                            <input
                                                              type="file"
                                                              accept=".pdf,.stl,.zip,.cam"
                                                              onChange={(e) => {
                                                                if (
                                                                  e.target
                                                                    .files[0]
                                                                ) {
                                                                  handlePdfFileSelect(
                                                                    product.id,
                                                                    metalId,
                                                                    null,
                                                                    sizeOpt.id,
                                                                    fileOption.value,
                                                                    e.target
                                                                      .files[0]
                                                                  );
                                                                }
                                                              }}
                                                              className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                                                            />
                                                            {uploadedFile && (
                                                              <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                                <span>✓</span>
                                                                <span className="font-medium">
                                                                  {
                                                                    uploadedFile.file_name
                                                                  }
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        )}

                                                        {!fileOption.requiresPrice && (
                                                          <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                                            💡 Enquiry only -
                                                            no price needed
                                                          </p>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          /* ✅ FIXED: Show files directly WITHOUT sizes */
                          <div className="space-y-3 border-2 border-gray-200 rounded p-3 bg-white">
                            <label className="block text-sm font-semibold mb-2 text-gray-800">
                              📁 File Types & Pricing:
                            </label>
                            <div className="space-y-3">
                              {FILE_TYPE_OPTIONS.map((fileOption) => {
                                const directKey = `${metalId}-none-none`;
                                const pricing =
                                  product.variantPricing[directKey] || {};
                                const isFileSelected =
                                  pricing.files?.some(
                                    (f) => f.file_type === fileOption.value
                                  ) || false;
                                const filePrice =
                                  pricing.files?.find(
                                    (f) => f.file_type === fileOption.value
                                  )?.price || "";
                                const fileKey = `${product.id}-${metalId}-direct-${fileOption.value}`;
                                const uploadedFile = uploadedPdfFiles[fileKey];
                                const isSTL = fileOption.value === "stl_file";

                                return (
                                  <div
                                    key={fileOption.value}
                                    className="border rounded p-3 bg-gray-50"
                                  >
                                    {isSTL ? (
                                      <div className="flex items-center gap-2 text-sm mb-2">
                                        <span className="text-lg">
                                          {fileOption.emoji}
                                        </span>
                                        <span className="font-medium text-gray-800">
                                          {fileOption.label} (Mandatory)
                                        </span>
                                      </div>
                                    ) : (
                                      <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                                        <input
                                          type="checkbox"
                                          checked={isFileSelected}
                                          onChange={() => {
                                            toggleVariantFileType(
                                              product.id,
                                              metalId,
                                              null,
                                              null,
                                              fileOption.value
                                            );
                                          }}
                                          className="w-4 h-4 text-green-600"
                                        />
                                        <span className="text-lg">
                                          {fileOption.emoji}
                                        </span>
                                        <span className="font-medium text-gray-800">
                                          {fileOption.label}
                                        </span>
                                      </label>
                                    )}

                                    {(isSTL || isFileSelected) && (
                                      <div className="ml-6 space-y-3">
                                        {fileOption.requiresPrice && (
                                          <div className="p-3 bg-green-50 rounded border border-green-200">
                                            <p className="text-xs text-gray-700 mb-2 font-semibold">
                                              🟩 {fileOption.label} Price{" "}
                                              {isSTL && "*"}
                                            </p>
                                            <input
                                              type="number"
                                              placeholder={
                                                isSTL
                                                  ? "Enter price (required)"
                                                  : "Enter price"
                                              }
                                              value={filePrice}
                                              onChange={(e) =>
                                                updateFilePrice(
                                                  product.id,
                                                  metalId,
                                                  null,
                                                  null,
                                                  fileOption.value,
                                                  e.target.value
                                                )
                                              }
                                              className={`w-full px-3 py-2 border rounded text-sm ${
                                                isSTL && !filePrice
                                                  ? "border-red-500"
                                                  : "border-gray-300"
                                              }`}
                                            />
                                          </div>
                                        )}

                                        {fileOption.requiresUpload !== false && (
                                          <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                            <label className="block text-xs font-semibold text-gray-800 mb-2">
                                              📎 Upload {fileOption.label}
                                            </label>
                                            <input
                                              type="file"
                                              accept=".pdf,.stl,.zip,.cam"
                                              onChange={(e) => {
                                                if (e.target.files[0]) {
                                                  handlePdfFileSelect(
                                                    product.id,
                                                    metalId,
                                                    null,
                                                    null,
                                                    fileOption.value,
                                                    e.target.files[0]
                                                  );
                                                }
                                              }}
                                              className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                                            />
                                            {uploadedFile && (
                                              <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                <span>✓</span>
                                                <span className="font-medium">
                                                  {uploadedFile.file_name}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {!fileOption.requiresPrice && (
                                          <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                            💡 Enquiry only - no price needed
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Metal + Diamond */}
                {product.hasMetalChoice &&
                  product.hasDiamondChoice &&
                  product.selectedMetalOptions.map((metalId) => {
                    const metalOpt =
                      categoryData?.attributes?.metal?.options?.find(
                        (o) => o.id === metalId
                      );
                    return product.selectedDiamondOptions.map((diamondId) => {
                      const diamondOpt =
                        categoryData?.attributes?.diamond?.options?.find(
                          (o) => o.id === diamondId
                        );
                      const comboKey = `${metalId}-${diamondId}`;
                      const useSizeConfig =
                        product.diamondSizeConfig[comboKey];

                      return (
                        <div
                          key={comboKey}
                          className="mb-4 border-2 border-green-200 rounded p-4 bg-green-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-bold flex items-center gap-2 text-gray-800">
                              <span>🔩</span>
                              <span>{metalOpt?.option_name}</span>
                              <span>+</span>
                              <span>💎</span>
                              <span>{diamondOpt?.option_name}</span>
                            </h6>

                            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={useSizeConfig || false}
                                onChange={() =>
                                  toggleDiamondSizeConfig(
                                    product.id,
                                    metalId,
                                    diamondId
                                  )
                                }
                                className="w-5 h-5 text-green-600"
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                + Config with Sizes
                              </span>
                            </label>
                          </div>

                          {useSizeConfig ? (
                            <div className="space-y-3">
                              {categoryData?.attributes?.size?.options?.map(
                                (sizeOpt) => {
                                  const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
                                  const isSelected =
                                    product.selectedSizes[key];
                                  const pricing =
                                    product.variantPricing[key] || {};

                                  return (
                                    <div
                                      key={sizeOpt.id}
                                      className="border-2 border-gray-200 rounded p-3 bg-white"
                                    >
                                      <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isSelected || false}
                                          onChange={() =>
                                            toggleProductSize(
                                              product.id,
                                              metalId,
                                              diamondId,
                                              sizeOpt.id
                                            )
                                          }
                                          className="w-5 h-5 text-green-600"
                                        />
                                        <span className="font-bold text-gray-800">
                                          {sizeOpt.option_name}{" "}
                                          {sizeOpt.size_mm &&
                                            `(${sizeOpt.size_mm}mm)`}
                                        </span>
                                      </label>

                                      {isSelected && (
                                        <div className="ml-8 space-y-3">
                                          <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-800">
                                              📁 File Types & Pricing:
                                            </label>
                                            <div className="space-y-3">
                                              {FILE_TYPE_OPTIONS.map(
                                                (fileOption) => {
                                                  const isFileSelected =
                                                    pricing.files?.some(
                                                      (f) =>
                                                        f.file_type ===
                                                        fileOption.value
                                                    ) || false;
                                                  const filePrice =
                                                    pricing.files?.find(
                                                      (f) =>
                                                        f.file_type ===
                                                        fileOption.value
                                                    )?.price || "";
                                                  const fileKey = `${product.id}-${metalId}-${diamondId}-${sizeOpt.id}-${fileOption.value}`;
                                                  const uploadedFile =
                                                    uploadedPdfFiles[fileKey];
                                                  const isSTL =
                                                    fileOption.value ===
                                                    "stl_file";

                                                  return (
                                                    <div
                                                      key={fileOption.value}
                                                      className="border rounded p-3 bg-white"
                                                    >
                                                      <label
                                                        className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${
                                                          isSTL
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                        }`}
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          checked={
                                                            isFileSelected
                                                          }
                                                          onChange={() =>
                                                            !isSTL &&
                                                            toggleVariantFileType(
                                                              product.id,
                                                              metalId,
                                                              diamondId,
                                                              sizeOpt.id,
                                                              fileOption.value
                                                            )
                                                          }
                                                          disabled={isSTL}
                                                          className="w-4 h-4 text-green-600"
                                                        />
                                                        <span className="text-lg">
                                                          {fileOption.emoji}
                                                        </span>
                                                        <span className="font-medium text-gray-800">
                                                          {fileOption.label}
                                                        </span>
                                                        {isSTL && (
                                                          <span className="text-xs text-green-600 ml-auto">
                                                            (Mandatory)
                                                          </span>
                                                        )}
                                                      </label>

                                                      {isFileSelected && (
                                                        <div className="ml-6 space-y-3">
                                                          {fileOption.requiresPrice && (
                                                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                                              <p className="text-xs text-gray-700 mb-2 font-semibold">
                                                                🟩{" "}
                                                                {
                                                                  fileOption.label
                                                                }{" "}
                                                                Price{" "}
                                                                {isSTL && "*"}
                                                              </p>
                                                              <p className="text-xs text-gray-500 mb-2">
                                                                {isSTL
                                                                  ? "This price will be displayed to customers (Required)"
                                                                  : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
                                                              </p>
                                                              <input
                                                                type="number"
                                                                placeholder={
                                                                  isSTL
                                                                    ? "Enter price (required)"
                                                                    : "Enter price"
                                                                }
                                                                value={
                                                                  filePrice
                                                                }
                                                                onChange={(
                                                                  e
                                                                ) =>
                                                                  updateFilePrice(
                                                                    product.id,
                                                                    metalId,
                                                                    diamondId,
                                                                    sizeOpt.id,
                                                                    fileOption.value,
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                className={`w-full px-3 py-2 border rounded text-sm ${
                                                                  isSTL &&
                                                                  !filePrice
                                                                    ? "border-red-500"
                                                                    : "border-gray-300"
                                                                }`}
                                                                required={
                                                                  isSTL
                                                                }
                                                              />
                                                              {isSTL &&
                                                                !filePrice && (
                                                                  <p className="text-xs text-red-600 mt-1">
                                                                    STL price
                                                                    is
                                                                    required
                                                                  </p>
                                                                )}
                                                            </div>
                                                          )}

                                                          {fileOption.requiresUpload !==
                                                            false && (
                                                            <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                                              <label className="block text-xs font-semibold text-gray-800 mb-2">
                                                                📎 Upload{" "}
                                                                {
                                                                  fileOption.label
                                                                }{" "}
                                                                {isSTL &&
                                                                  "(Optional)"}
                                                              </label>
                                                              <input
                                                                type="file"
                                                                accept=".pdf,.stl,.zip,.cam"
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  if (
                                                                    e.target
                                                                      .files[0]
                                                                  ) {
                                                                    handlePdfFileSelect(
                                                                      product.id,
                                                                      metalId,
                                                                      diamondId,
                                                                      sizeOpt.id,
                                                                      fileOption.value,
                                                                      e.target
                                                                        .files[0]
                                                                    );
                                                                  }
                                                                }}
                                                                className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                                                              />
                                                              {uploadedFile && (
                                                                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                                  <span>
                                                                    ✓
                                                                  </span>
                                                                  <span className="font-medium">
                                                                    {
                                                                      uploadedFile.file_name
                                                                    }
                                                                  </span>
                                                                </div>
                                                              )}
                                                            </div>
                                                          )}

                                                          {!fileOption.requiresPrice && (
                                                            <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                                              💡 Enquiry only -
                                                              no price needed
                                                            </p>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            /* ✅ FIXED: Show files directly WITHOUT sizes */
                            <div className="space-y-3 border-2 border-gray-200 rounded p-3 bg-white">
                              <label className="block text-sm font-semibold mb-2 text-gray-800">
                                📁 File Types & Pricing:
                              </label>
                              <div className="space-y-3">
                                {FILE_TYPE_OPTIONS.map((fileOption) => {
                                  const directKey = `${metalId}-${diamondId}-none`;
                                  const pricing =
                                    product.variantPricing[directKey] || {};

                                  // ✅ CRITICAL FIX: Initialize files array if STL is mandatory
                                  const isSTL =
                                    fileOption.value === "stl_file";

                                  // Auto-initialize STL file for metal+diamond combos
                                  if (
                                    isSTL &&
                                    (!pricing.files ||
                                      !pricing.files.some(
                                        (f) => f.file_type === "stl_file"
                                      ))
                                  ) {
                                    // Initialize the variant pricing with STL file
                                    const updatedProduct = products.find(
                                      (p) => p.id === product.id
                                    );
                                    if (
                                      updatedProduct &&
                                      !updatedProduct.variantPricing[
                                        directKey
                                      ]?.files?.some(
                                        (f) => f.file_type === "stl_file"
                                      )
                                    ) {
                                      setTimeout(() => {
                                        setProducts(
                                          products.map((p) => {
                                            if (p.id === product.id) {
                                              return {
                                                ...p,
                                                variantPricing: {
                                                  ...p.variantPricing,
                                                  [directKey]: {
                                                    ...p.variantPricing[
                                                      directKey
                                                    ],
                                                    files: [
                                                      {
                                                        file_type: "stl_file",
                                                        price: null,
                                                      },
                                                    ],
                                                  },
                                                },
                                              };
                                            }
                                            return p;
                                          })
                                        );
                                      }, 0);
                                    }
                                  }

                                  const isFileSelected =
                                    pricing.files?.some(
                                      (f) => f.file_type === fileOption.value
                                    ) ||
                                    (isSTL &&
                                      product.selectedMetalOptions.includes(
                                        metalId
                                      ) &&
                                      product.selectedDiamondOptions.includes(
                                        diamondId
                                      ));
                                  const filePrice =
                                    pricing.files?.find(
                                      (f) => f.file_type === fileOption.value
                                    )?.price || "";
                                  const fileKey = `${product.id}-${metalId}-${diamondId}-direct-${fileOption.value}`;
                                  const uploadedFile =
                                    uploadedPdfFiles[fileKey];

                                  return (
                                    <div
                                      key={fileOption.value}
                                      className="border rounded p-3 bg-gray-50"
                                    >
                                      {isSTL ? (
                                        <div className="flex items-center gap-2 text-sm mb-2">
                                          <span className="text-lg">
                                            {fileOption.emoji}
                                          </span>
                                          <span className="font-medium text-gray-800">
                                            {fileOption.label} (Mandatory)
                                          </span>
                                        </div>
                                      ) : (
                                        <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                                          <input
                                            type="checkbox"
                                            checked={isFileSelected}
                                            onChange={() => {
                                              toggleVariantFileType(
                                                product.id,
                                                metalId,
                                                diamondId,
                                                null,
                                                fileOption.value
                                              );
                                            }}
                                            className="w-4 h-4 text-green-600"
                                          />
                                          <span className="text-lg">
                                            {fileOption.emoji}
                                          </span>
                                          <span className="font-medium text-gray-800">
                                            {fileOption.label}
                                          </span>
                                        </label>
                                      )}

                                      {(isSTL || isFileSelected) && (
                                        <div className="ml-6 space-y-3">
                                          {fileOption.requiresPrice && (
                                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                              <p className="text-xs text-gray-700 mb-2 font-semibold">
                                                🟩 {fileOption.label} Price{" "}
                                                {isSTL && "*"}
                                              </p>
                                              <input
                                                type="number"
                                                placeholder={
                                                  isSTL
                                                    ? "Enter price (required)"
                                                    : "Enter price"
                                                }
                                                value={filePrice}
                                                onChange={(e) =>
                                                  updateFilePrice(
                                                    product.id,
                                                    metalId,
                                                    diamondId,
                                                    null,
                                                    fileOption.value,
                                                    e.target.value
                                                  )
                                                }
                                                className={`w-full px-3 py-2 border rounded text-sm ${
                                                  isSTL && !filePrice
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                                }`}
                                              />
                                            </div>
                                          )}

                                          {fileOption.requiresUpload !==
                                            false && (
                                            <div className="p-3 bg-gray-100 rounded border border-gray-300">
                                              <label className="block text-xs font-semibold text-gray-800 mb-2">
                                                📎 Upload {fileOption.label}
                                              </label>
                                              <input
                                                type="file"
                                                accept=".pdf,.stl,.zip,.cam"
                                                onChange={(e) => {
                                                  if (e.target.files[0]) {
                                                    handlePdfFileSelect(
                                                      product.id,
                                                      metalId,
                                                      diamondId,
                                                      null,
                                                      fileOption.value,
                                                      e.target.files[0]
                                                    );
                                                  }
                                                }}
                                                className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                                              />
                                              {uploadedFile && (
                                                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                                  <span>✓</span>
                                                  <span className="font-medium">
                                                    {uploadedFile.file_name}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {!fileOption.requiresPrice && (
                                            <p className="text-xs text-green-600 p-2 bg-green-50 rounded border border-green-200">
                                              💡 Enquiry only - no price
                                              needed
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}

    {/* Save Button */}
    {products.length > 0 && (
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={saveProducts}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Saving All Products...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>
                Save {products.length} Product
                {products.length !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </button>
      </div>
    )}

    {/* Vendor Note */}
    {userRole === "vendor" && products.length > 0 && (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <span>⏳</span>
          <p className="text-sm">
            <strong>Note:</strong> All products added by vendors require admin
            approval before appearing on the website.
          </p>
        </div>
      </div>
    )}
  </div>
);
};       

export default Products;