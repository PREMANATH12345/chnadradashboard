import React, { useState, useEffect } from "react";
import { invoiceDetailsAPI } from "../api/auth";
import toast from "react-hot-toast";

const Invoice = () => {
  // State for form data
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    phone_number: "",
    gst_number: ""
  });

  // State for invoice details list
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetch invoice details on component mount
  useEffect(() => {
    fetchInvoiceDetails();
  }, []);

  // Fetch all invoice details
  const fetchInvoiceDetails = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceDetailsAPI.getInvoiceDetails();
      
      if (response?.success) {
        setInvoiceDetails(response.data || []);
      } else {
        setInvoiceDetails([]);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Error loading invoice details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        // Update existing invoice detail
        const response = await invoiceDetailsAPI.updateInvoiceDetail(editingId, formData);
        if (response.success) {
          toast.success(response.message || "Invoice details updated successfully!");
          setEditingId(null);
        }
      } else {
        // Create new invoice detail
        const response = await invoiceDetailsAPI.createInvoiceDetail(formData);
        if (response.success) {
          toast.success(response.message || "Invoice details created successfully!");
        }
      }

      // Reset form
      setFormData({
        company_name: "",
        address: "",
        phone_number: "",
        gst_number: ""
      });

      // Refresh list
      fetchInvoiceDetails();

    } catch (error) {
      console.error("Error saving invoice details:", error);
      toast.error(error.message || "Error saving invoice details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (detail) => {
    setFormData({
      company_name: detail.company_name || "",
      address: detail.address || "",
      phone_number: detail.phone_number || "",
      gst_number: detail.gst_number || ""
    });
    setEditingId(detail.id);
    setSelectedDetail(detail);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete these invoice details?")) {
      try {
        const response = await invoiceDetailsAPI.deleteInvoiceDetail(id);
        if (response.success) {
          toast.success(response.message || "Invoice details deleted successfully!");
          if (selectedDetail?.id === id) {
            setSelectedDetail(null);
          }
          fetchInvoiceDetails();
        }
      } catch (error) {
        console.error("Error deleting invoice details:", error);
        toast.error("Error deleting invoice details");
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Invoice Details Management
          </h1>
          <p className="text-gray-600">
            Manage your company details for invoices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Create/Edit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingId ? "Edit Company Details" : "Add New Company Details"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : editingId ? (
                      "Update Details"
                    ) : (
                      "Create Details"
                    )}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          company_name: "",
                          address: "",
                          phone_number: "",
                          gst_number: ""
                        });
                      }}
                      className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Preview and List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Section */}
            {selectedDetail && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Preview
                  </h2>
                  <span className="text-sm text-gray-500">
                    Selected: {selectedDetail.company_name}
                  </span>
                </div>
                
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedDetail.company_name}
                    </h3>
                    {selectedDetail.gst_number && (
                      <p className="text-sm text-gray-600 mt-1">
                        GST: {selectedDetail.gst_number}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedDetail.address}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-700">
                      📞 {selectedDetail.phone_number}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  All Company Details
                </h2>
                <p className="text-sm text-gray-500">
                  {invoiceDetails.length} records found
                </p>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : invoiceDetails.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {invoiceDetails.map((detail) => (
                    <div 
                      key={detail.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition duration-200 ${selectedDetail?.id === detail.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedDetail(detail)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">
                              {detail.company_name}
                            </h3>
                            {detail.gst_number && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                GST: {detail.gst_number}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {detail.address}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">
                              📞 {detail.phone_number}
                            </span>
                            <span className="text-xs text-gray-400">
                              Created: {formatDate(detail.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(detail);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(detail.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No company details found
                  </h3>
                  <p className="text-gray-500">
                    Add your first company details using the form
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;