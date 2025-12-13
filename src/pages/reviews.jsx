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
  Package,
  MessageSquare,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Reviews = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_IMG_URL || "";

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


      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else if (
          response.data.reviews &&
          Array.isArray(response.data.reviews)
        ) {
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
      filtered = filtered.filter((review) => review.stars === ratingValue);
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      const isHidden = visibilityFilter === "hidden";
      filtered = filtered.filter(
        (review) => review.is_hidden === (isHidden ? 1 : 0)
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((review) => {
        const searchText = `
          ${review.name || ""}
          ${review.review || ""}
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
          return (b.stars || 0) - (a.stars || 0);
        case "rating-low":
          return (a.stars || 0) - (b.stars || 0);
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
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

      if (
        response?.success ||
        response?.data?.success ||
        response?.status === 200
      ) {
        toast.success(
          `Review ${newVisibility ? "hidden" : "shown"} successfully!`
        );
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
    if (
      !window.confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
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

      if (
        response?.success ||
        response?.data?.success ||
        response?.status === 200
      ) {
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

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
    setRatingFilter("all");
    setVisibilityFilter("all");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
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
              i < (rating || 0)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating || 0}/5
        </span>
      </div>
    );
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (
      imagePath.startsWith("http") ||
      imagePath.startsWith("data:") ||
      imagePath.startsWith("blob:")
    ) {
      return imagePath;
    }

    if (imagePath.startsWith("/")) {
      return `${BASE_URL}${imagePath}`;
    } else {
      return `${BASE_URL}/${imagePath}`;
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  Customer Reviews
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
                  ? (
                      reviews.reduce((acc, r) => acc + (r.stars || 0), 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0.0"}
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
                placeholder="Search by name or review content..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => {
            const imageUrl = review.image_url
              ? getImageUrl(review.image_url)
              : "";

            return (
              <div
                key={review.id}
                className={`bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 ${
                  review.is_hidden
                    ? "border-red-200 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                {/* Review Card Content */}
                <div className="p-5">
                  {/* Header with user info and image */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            review.is_hidden ? "bg-red-100" : "bg-blue-100"
                          }`}
                        >
                          {review.is_hidden ? (
                            <EyeOff className="w-4 h-4 text-red-600" />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {review.name || "Anonymous"}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1">
                            {renderStars(review.stars)}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>

                    {/* Image in right corner */}
                    {imageUrl && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imageUrl}
                            alt="Review"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium">Review:</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {review.review || "No review content..."}
                    </p>
                  </div>

                  {/* Product ID if exists */}
                  {review.product_id && (
                    <div className="mb-4">
                      <div className="flex items-center text-gray-700">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          Product ID:{" "}
                          <span className="font-medium">
                            {review.product_id}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        review.is_hidden
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {review.is_hidden ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </>
                      )}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() =>
                        toggleReviewVisibility(review, !review.is_hidden)
                      }
                      disabled={processingId === review.id}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
                        review.is_hidden
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          : "bg-amber-50 hover:bg-amber-100 text-amber-700"
                      }`}
                      title={review.is_hidden ? "Show Review" : "Hide Review"}
                    >
                      {processingId === review.id ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : review.is_hidden ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Show
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hide
                        </>
                      )}
                    </button>

                    {/* Full Preview Button */}
                    <button
                      onClick={() => handlePreviewReview(review)}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-3 h-3" />
                      Full Preview
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={processingId === review.id}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
              </div>
            );
          })}
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
                        Review Details
                      </h1>
                      <div className="flex items-center space-x-3">
                        {renderStars(selectedReview.stars)}
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
                            {selectedReview.name || "Anonymous"}
                          </h3>
                          {selectedReview.user_id && (
                            <p className="text-sm text-gray-600">
                              User ID: {selectedReview.user_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    {selectedReview.product_id && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              Product Review
                            </h3>
                            <p className="text-sm text-gray-600">
                              Product ID: {selectedReview.product_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Review Content:
                      </h3>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {selectedReview.review || "No review content..."}
                        </p>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {selectedReview.image_url && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Attached Image:
                        </h3>
                        <div className="max-w-md mx-auto">
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={getImageUrl(selectedReview.image_url)}
                              alt="Review attachment"
                              className="w-full h-auto"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                                    <div class="text-center">
                                      <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <p class="text-sm text-gray-500">Image not available</p>
                                    </div>
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        </div>
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
                          <span
                            className={`font-medium ${
                              selectedReview.is_hidden
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
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
                        is_hidden: !e.target.checked,
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
                      <span className="text-emerald-600">
                        Visible to public
                      </span>
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
