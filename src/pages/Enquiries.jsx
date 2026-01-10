import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL_DAS;
  const IMG_BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL;

  // Helper function to get full image URL
  const getFullImageUrl = (path) => {
    if (!path) return '';
    
    // If path already starts with http, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If path starts with /, remove it before joining with base URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Join base URL with path
    return `${IMG_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEnquiries(enquiries);
    } else {
      const filtered = enquiries.filter(
        (enq) =>
          enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enq.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enq.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enq.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enq.design_source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEnquiries(filtered);
    }
  }, [searchTerm, enquiries]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/doAll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "get",
            table: "enquiriesform",
            order_by: { created_at: "DESC" }
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setEnquiries(result.data);
        setFilteredEnquiries(result.data);
      } else {
        toast.error(result.message || "Failed to fetch enquiries");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Error loading enquiries");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseJSON = (jsonString) => {
    if (!jsonString) return null;
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (e) {
      return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon },
      "in-progress": { bg: "bg-blue-100", text: "text-blue-700", icon: ClockIcon },
      responded: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon },
      completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full`}>
        <Icon className="w-3 h-3" />
        {status || "pending"}
      </span>
    );
  };

  const isImageFile = (fileType, fileName) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (fileType && imageTypes.includes(fileType.toLowerCase())) {
      return true;
    }
    
    if (fileName) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      return imageExtensions.includes(ext);
    }
    
    return false;
  };

  const ImageModal = ({ file, onClose }) => {
    if (!file) return null;

    const fullImageUrl = getFullImageUrl(file.url);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {file.original_name || file.filename || 'Image Preview'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="p-4 flex items-center justify-center h-[70vh]">
            <img
              src={fullImageUrl}
              alt={file.original_name || 'Preview'}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
              }}
            />
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {file.file_type || 'Unknown type'}
            </span>
            <a
              href={fullImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              Open Full Size
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      {expandedImage && (
        <ImageModal file={expandedImage} onClose={() => setExpandedImage(null)} />
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Customer Enquiries
          </h1>
          <p className="text-gray-600">
            View and manage all customer enquiries from your website
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing: <span className="font-semibold">{filteredEnquiries.length}</span> of <span className="font-semibold">{enquiries.length}</span>
          </div>
        </div>

        {/* Enquiries List */}
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? "No enquiries found matching your search" : "No enquiries yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEnquiries.map((enquiry) => {
              const interests = parseJSON(enquiry.interests);
              const files = parseJSON(enquiry.files);

              return (
                <div
                  key={enquiry.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                >
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          {enquiry.name || "N/A"}
                          {enquiry.is_guest === 1 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              Guest
                            </span>
                          )}
                        </h3>
                        {enquiry.company && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            {enquiry.company}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(enquiry.status)}
                      <span className="text-xs text-gray-500">ID: {enquiry.id}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="hover:text-green-600 hover:underline truncate"
                      >
                        {enquiry.email || "N/A"}
                      </a>
                    </div>

                    {enquiry.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="hover:text-green-600 hover:underline"
                        >
                          {enquiry.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    {enquiry.material && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Material</p>
                        <p className="text-sm font-medium text-gray-800">{enquiry.material}</p>
                      </div>
                    )}
                    {enquiry.design_source && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Design Source</p>
                        <p className="text-sm font-medium text-gray-800">{enquiry.design_source}</p>
                      </div>
                    )}
                    {enquiry.quantity && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                        <p className="text-sm font-medium text-gray-800">{enquiry.quantity}</p>
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  {interests && Array.isArray(interests) && interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            <SparklesIcon className="w-3 h-3" />
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {enquiry.additional_details && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Additional Details</p>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {enquiry.additional_details}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {enquiry.timeline && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Timeline</p>
                      <p className="text-sm font-medium text-gray-800">{enquiry.timeline}</p>
                    </div>
                  )}

                  {/* Files Section */}
                  {files && Array.isArray(files) && files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Attached Files ({files.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {files.map((file, idx) => {
                          const isImage = isImageFile(file.file_type, file.original_name || file.filename);
                          const fullUrl = getFullImageUrl(file.url);
                          
                          if (isImage) {
                            return (
                              <div key={idx} className="group relative">
                                <div 
                                  className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-green-500 transition-all shadow-sm hover:shadow-md"
                                  onClick={() => setExpandedImage(file)}
                                >
                                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={fullUrl}
                                      alt={file.original_name || `Attachment ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Available';
                                      }}
                                    />
                                  </div>
                                  <div className="p-2 bg-white border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-700 truncate">
                                      {file.original_name || file.filename || `Image ${idx + 1}`}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1 flex items-center justify-between">
                                      <span>Click to view</span>
                                      <EyeIcon className="w-3 h-3" />
                                    </p>
                                  </div>
                                </div>
                                
                                <a
                                  href={fullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Open in new tab"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            );
                          } else {
                            // Non-image files show as document cards
                            return (
                              <a
                                key={idx}
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center"
                              >
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="w-full">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {file.original_name || file.filename || `Document ${idx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.file_type || 'Document'}
                                  </p>
                                </div>
                              </a>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer - Timestamps */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Submitted: {formatDate(enquiry.submitted_at || enquiry.created_at)}
                    </div>
                    {enquiry.updated_at && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Updated: {formatDate(enquiry.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Enquiries;