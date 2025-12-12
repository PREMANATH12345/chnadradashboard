import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Loader,
  Search,
  X,
  Star,
  User,
  Calendar,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Reviews = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Expand/Collapse state
  const [expandedReviews, setExpandedReviews] = useState([]);

  // ========== FETCH REVIEWS ==========
  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [reviews, searchTerm, sortBy, ratingFilter, visibilityFilter]);

  useEffect(() => {
    const hasFilters =
      searchTerm || 
      sortBy !== "latest" || 
      ratingFilter !== "all" || 
      visibilityFilter !== "all";
    setHasActiveFilters(hasFilters);
  }, [reviews, searchTerm, sortBy, ratingFilter, visibilityFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "reviews",
        where: { is_deleted: 0 },
      });

      console.log("Raw Reviews API Response:", response);

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else if (response.data.reviews && Array.isArray(response.data.reviews)) {
          setReviews(response.data.reviews);
        } else if (Array.isArray(response)) {
          setReviews(response);
        } else {
          console.error("Unexpected response structure:", response);
          toast.error("Error loading reviews - unexpected format");
          setReviews([]);
        }
      } else {
        toast.error("No data received from server");
        setReviews([]);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      toast.error(`Error loading reviews: ${error.message}`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...reviews];

    // Apply rating filter
    if (ratingFilter !== "all") {
      const ratingValue = parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating === ratingValue);
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      const isHidden = visibilityFilter === "hidden";
      filtered = filtered.filter((review) => review.is_hidden === (isHidden ? 1 : 0));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((review) => {
        const searchText = `
          ${review.user_name || ""}
          ${review.user_email || ""}
          ${review.comment || ""}
          ${review.response || ""}
        `.toLowerCase();

        return searchText.includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0);
        case "name-asc":
          return (a.user_name || "").localeCompare(b.user_name || "");
        case "name-desc":
          return (b.user_name || "").localeCompare(a.user_name || "");
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  // ========== TOGGLE VISIBILITY ==========
  const toggleReviewVisibility = async (review, newVisibility) => {
    setProcessingId(review.id);
    try {
      const response = await DoAll({
        action: "update",
        table: "reviews",
        where: { id: review.id },
        data: {
          is_hidden: newVisibility ? 1 : 0,
          updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
      });

      if (response?.success || response?.data?.success || response?.status === 200) {
        toast.success(`Review ${newVisibility ? "hidden" : "shown"} successfully!`);
        fetchReviews();
      } else {
        toast.error("Error updating review visibility");
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      toast.error("Error updating review visibility");
    } finally {
      setProcessingId(null);
    }
  };

  // ========== DELETE REVIEW ==========
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setProcessingId(reviewId);
    try {
      const response = await DoAll({
        action: "update",
        table: "reviews",
        where: { id: reviewId },
        data: {
          is_deleted: 1,
          deleted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
      });

      if (response?.success || response?.data?.success || response?.status === 200) {
        toast.success("Review deleted successfully!");
        fetchReviews();
      } else {
        toast.error("Error deleting review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error("Error deleting review");
    } finally {
      setProcessingId(null);
    }
  };

  // ========== PREVIEW REVIEW ==========
  const handlePreviewReview = (review) => {
    setSelectedReview(review);
    setShowPreviewModal(true);
  };

  // ========== TOGGLE EXPAND ==========
  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
    setRatingFilter("all");
    setVisibilityFilter("all");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < (rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating || 0}/5
        </span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading reviews...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  Reviews Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and moderate customer reviews
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReviews}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <Loader className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">
                {reviews.length}
              </div>
              <div className="text-sm text-blue-600">Total Reviews</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-700">
                {reviews.filter((r) => !r.is_hidden).length}
              </div>
              <div className="text-sm text-emerald-600">Visible</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700">
                {reviews.filter((r) => r.is_hidden).length}
              </div>
              <div className="text-sm text-amber-600">Hidden</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
                  : "0.0"
                }
              </div>
              <div className="text-sm text-purple-600">Avg. Rating</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">★★★★★ 5 Stars</option>
              <option value="4">★★★★☆ 4 Stars</option>
              <option value="3">★★★☆☆ 3 Stars</option>
              <option value="2">★★☆☆☆ 2 Stars</option>
              <option value="1">★☆☆☆☆ 1 Star</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="all">All Reviews</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="latest">Sort by: Latest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="rating-high">Sort by: Highest Rating</option>
              <option value="rating-low">Sort by: Lowest Rating</option>
              <option value="name-asc">Sort by: Name A-Z</option>
              <option value="name-desc">Sort by: Name Z-A</option>
            </select>
          </div>

          {/* Clear Filters Button and Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </button>
              )}
              <p className="text-sm text-gray-600">
                Showing {filteredReviews.length} of {reviews.length} reviews
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {reviews.length > 0 ? formatDate(reviews[0]?.updated_at) : "N/A"}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 group ${
                review.is_hidden ? "border-red-100 bg-red-50/50" : "border-blue-100"
              }`}
            >
              <div className="space-y-4">
                {/* Review Header and Expand Button */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleReviewExpand(review.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-1 ${
                      review.is_hidden ? "bg-red-100" : "bg-blue-100"
                    }`}>
                      {review.is_hidden ? (
                        <EyeOff className="w-4 h-4 text-red-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {review.user_name || "Anonymous"}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            {review.is_hidden && (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                      {review.user_email && (
                        <p className="text-sm text-gray-600 mt-1">
                          {review.user_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-blue-500 ml-2">
                    {expandedReviews.includes(review.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Review Content (Expandable) */}
                {expandedReviews.includes(review.id) && (
                  <div className="ml-11 pl-4 border-l-2 border-blue-100">
                    {/* Comment */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Comment:
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                          {review.comment || "No comment provided..."}
                        </p>
                      </div>
                    </div>

                    {/* Admin Response (if exists) */}
                    {review.response && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                          Admin Response:
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-line bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            {review.response}
                          </p>
                        </div>
                        {review.responded_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Responded on: {formatDate(review.responded_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
                      {/* Visibility Toggle */}
                      <label className="inline-flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={!review.is_hidden}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleReviewVisibility(review, !e.target.checked);
                          }}
                          disabled={processingId === review.id}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {processingId === review.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : review.is_hidden ? (
                            <span className="text-red-600">Hidden</span>
                          ) : (
                            <span className="text-emerald-600">Visible</span>
                          )}
                        </span>
                      </label>

                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewReview(review);
                        }}
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Full Preview</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review.id);
                        }}
                        disabled={processingId === review.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 hover:scale-110 disabled:opacity-50"
                        title="Delete Review"
                      >
                        {processingId === review.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsed View - Quick Actions */}
                {!expandedReviews.includes(review.id) && (
                  <div className="ml-11 flex items-center justify-between">
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {review.comment?.substring(0, 120) || "No comment provided..."}
                      {review.comment?.length > 120 && "..."}
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Quick Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReviewVisibility(review, !review.is_hidden);
                        }}
                        disabled={processingId === review.id}
                        className={`p-2 rounded-lg ${
                          review.is_hidden
                            ? "bg-red-50 hover:bg-red-100 text-red-600"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                        } transition-colors duration-200`}
                        title={review.is_hidden ? "Show Review" : "Hide Review"}
                      >
                        {processingId === review.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : review.is_hidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-xs text-gray-400">
                        Click to expand
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-blue-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? "No reviews found" : "No Reviews Available"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Reviews will appear here once customers submit them."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== PREVIEW REVIEW MODAL ========== */}
      {showPreviewModal && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black opacity-50 transition-opacity"
              onClick={() => setShowPreviewModal(false)}
            ></div>

            <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
              <div className="bg-white p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Review Preview
                      </h1>
                      <div className="flex items-center space-x-3">
                        {renderStars(selectedReview.rating)}
                        {selectedReview.is_hidden && (
                          <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            Hidden from public view
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Reviewer Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {selectedReview.user_name || "Anonymous"}
                          </h3>
                          {selectedReview.user_email && (
                            <p className="text-sm text-gray-600">
                              {selectedReview.user_email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Comment:
                      </h3>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {selectedReview.comment || "No comment provided..."}
                        </p>
                      </div>
                    </div>

                    {/* Admin Response */}
                    {selectedReview.response && (
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-700 mb-2">
                          Admin Response:
                        </h3>
                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-700 whitespace-pre-line bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                            {selectedReview.response}
                          </p>
                        </div>
                        {selectedReview.responded_at && (
                          <p className="text-sm text-gray-500 mt-2">
                            Responded on: {formatDate(selectedReview.responded_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-6 mt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-500 space-y-2">
                        <div className="flex justify-between">
                          <span>Submitted:</span>
                          <span className="font-medium">
                            {formatDate(selectedReview.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="font-medium">
                            {formatDate(selectedReview.updated_at)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium ${
                            selectedReview.is_hidden ? "text-red-600" : "text-emerald-600"
                          }`}>
                            {selectedReview.is_hidden ? "Hidden" : "Visible"}
                          </span>
                        </div>
                        {selectedReview.deleted_at && (
                          <div className="flex justify-between text-red-500">
                            <span>Deleted:</span>
                            <span className="font-medium">
                              {formatDate(selectedReview.deleted_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                {/* Visibility Toggle */}
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!selectedReview.is_hidden}
                    onChange={(e) => {
                      toggleReviewVisibility(selectedReview, !e.target.checked);
                      setSelectedReview({
                        ...selectedReview,
                        is_hidden: !e.target.checked
                      });
                    }}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {saving ? (
                      <Loader className="w-4 h-4 animate-spin inline" />
                    ) : selectedReview.is_hidden ? (
                      <span className="text-red-600">Hidden from public</span>
                    ) : (
                      <span className="text-emerald-600">Visible to public</span>
                    )}
                  </span>
                </label>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;