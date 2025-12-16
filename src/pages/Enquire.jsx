import { useState, useEffect } from "react";
import { DoAll } from "../auth/api";
import toast from "react-hot-toast";

const EnquiryPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch enquiries from database
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "enquiries",
        where: {
          is_deleted: 0,
        },
      });

      if (response?.success) {
        setEnquiries(response.data || []);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Error loading enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Filter enquiries based on status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (filter === "all") return true;
    if (filter === "pending") return enquiry.status === "pending";
    if (filter === "responded") return enquiry.status === "responded";
    if (filter === "completed") return enquiry.status === "completed";
    return true;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle response submission
  const handleRespond = async (enquiryId) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      const response = await DoAll({
        action: "update",
        table: "enquiries",
        data: {
          status: "responded",
          response: responseText,
          responded_by: user?.id || null,
          responded_at: new Date().toISOString(),
        },
        where: {
          id: enquiryId,
        },
      });

      if (response?.success) {
        toast.success("Response sent successfully");
        setResponseText("");
        setSelectedEnquiry(null);
        setIsModalOpen(false);
        fetchEnquiries();
      } else {
        toast.error("Failed to send response");
      }
    } catch (error) {
      console.error("Error responding to enquiry:", error);
      toast.error("Error sending response");
    }
  };

  // Update enquiry status
  const updateStatus = async (enquiryId, newStatus) => {
    try {
      const response = await DoAll({
        action: "update",
        table: "enquiries",
        data: {
          status: newStatus,
        },
        where: {
          id: enquiryId,
        },
      });

      if (response?.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchEnquiries();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  // Open enquiry detail modal
  const openEnquiryModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  // Close enquiry detail modal
  const closeEnquiryModal = () => {
    setSelectedEnquiry(null);
    setIsModalOpen(false);
    setResponseText("");
  };

  // Get status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      responded: { color: "bg-blue-100 text-blue-800", label: "Responded" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      new: { color: "bg-gray-100 text-gray-800", label: "New" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Enquiries Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View and manage all customer enquiries
          </p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {enquiries.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Total Enquiries
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {enquiries.filter((e) => e.status === "pending").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {enquiries.filter((e) => e.status === "responded").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Responded</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {enquiries.filter((e) => e.status === "completed").length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filter Buttons - Responsive */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                filter === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All ({enquiries.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                filter === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Pending ({enquiries.filter((e) => e.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("responded")}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                filter === "responded"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Responded (
              {enquiries.filter((e) => e.status === "responded").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                filter === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Completed (
              {enquiries.filter((e) => e.status === "completed").length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">
              Loading enquiries...
            </p>
          </div>
        ) : (
          /* Enquiries List - Responsive Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile View - Cards */}
            <div className="md:hidden">
              {filteredEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        ENQ-{enquiry.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {enquiry.user_id}
                      </div>
                    </div>
                    <StatusBadge status={enquiry.status} />
                  </div>

                  <div className="mb-2">
                    <div className="font-medium text-gray-900 text-sm">
                      {enquiry.product_title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {enquiry.metal && enquiry.metal !== "" && (
                        <span className="mr-3">Metal: {enquiry.metal}</span>
                      )}
                      {enquiry.size && enquiry.size !== "" && (
                        <span>Size: {enquiry.size}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      <div>{enquiry.enquiry_type || "General"}</div>
                      <div>{formatDate(enquiry.created_at)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEnquiryModal(enquiry)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </button>
                      {enquiry.status === "pending" && (
                        <button
                          onClick={() => updateStatus(enquiry.id, "completed")}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State for Mobile */}
              {filteredEnquiries.length === 0 && !loading && (
                <div className="text-center py-12 px-4">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No enquiries found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    There are no {filter !== "all" ? filter : ""} enquiries at
                    the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
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
                      Product
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ENQ-{enquiry.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>ID: {enquiry.user_id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.product_title}
                        </div>
                        {enquiry.metal && enquiry.metal !== "" && (
                          <div className="text-xs text-gray-500">
                            Metal: {enquiry.metal}
                          </div>
                        )}
                        {enquiry.size && enquiry.size !== "" && (
                          <div className="text-xs text-gray-500">
                            Size: {enquiry.size}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {enquiry.enquiry_type || "General"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(enquiry.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={enquiry.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEnquiryModal(enquiry)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {enquiry.status === "pending" && (
                          <button
                            onClick={() =>
                              updateStatus(enquiry.id, "completed")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State for Desktop */}
              {filteredEnquiries.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No enquiries found
                  </h3>
                  <p className="text-gray-500">
                    There are no {filter !== "all" ? filter : ""} enquiries at
                    the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enquiry Detail Modal - Responsive */}
        {isModalOpen && selectedEnquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      Enquiry Details
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ENQ-{selectedEnquiry.id}
                    </p>
                  </div>
                  <button
                    onClick={closeEnquiryModal}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Enquiry Info */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                      Product
                    </h3>
                    <p className="text-base sm:text-lg font-medium">
                      {selectedEnquiry.product_title}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedEnquiry.metal && selectedEnquiry.metal !== "" && (
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                          Metal
                        </h3>
                        <p className="text-sm sm:text-base">
                          {selectedEnquiry.metal}
                        </p>
                      </div>
                    )}
                    {selectedEnquiry.diamond &&
                      selectedEnquiry.diamond !== "" && (
                        <div>
                          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                            Diamond
                          </h3>
                          <p className="text-sm sm:text-base">
                            {selectedEnquiry.diamond}
                          </p>
                        </div>
                      )}
                    {selectedEnquiry.size && selectedEnquiry.size !== "" && (
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                          Size
                        </h3>
                        <p className="text-sm sm:text-base">
                          {selectedEnquiry.size}
                        </p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        Enquiry Type
                      </h3>
                      <p className="text-sm sm:text-base">
                        {selectedEnquiry.enquiry_type || "General"}
                      </p>
                    </div>
                  </div>

                  {selectedEnquiry.files && selectedEnquiry.files !== "[]" && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        Requested Files
                      </h3>
                      <p className="text-sm sm:text-base">
                        {typeof selectedEnquiry.files === "string"
                          ? selectedEnquiry.files === "[]"
                            ? "No files requested"
                            : selectedEnquiry.files
                          : selectedEnquiry.files.map((f) => f.name).join(", ")}
                      </p>
                    </div>
                  )}

                  {selectedEnquiry.unavailable_size && (
                    <div className="bg-yellow-50 p-3 rounded">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        Special Note
                      </h3>
                      <p className="text-sm sm:text-base">
                        This enquiry is for a size that needs to be made to
                        order
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                      Submitted On
                    </h3>
                    <p className="text-sm sm:text-base">
                      {formatDate(selectedEnquiry.created_at)}
                    </p>
                  </div>

                  {selectedEnquiry.response && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">
                        Response
                      </h3>
                      <p className="bg-blue-50 p-3 rounded text-sm sm:text-base">
                        {selectedEnquiry.response}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Responded on: {formatDate(selectedEnquiry.responded_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Response Form (only for pending enquiries) */}
                {selectedEnquiry.status === "pending" && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                      Send Response
                    </h3>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full h-24 sm:h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <button
                        onClick={closeEnquiryModal}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRespond(selectedEnquiry.id)}
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                )}

                {/* Close button for non-pending enquiries */}
                {selectedEnquiry.status !== "pending" && (
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      onClick={closeEnquiryModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryPage;
