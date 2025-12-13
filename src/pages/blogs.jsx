import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  Search,
  X,
  Eye,
  Calendar,
  User,
  Save,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Blogs = ({ onBack }) => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    thumbnail_url: "",
    author_name: "",
  });

  const getCurrentTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  };

  // ========== FETCH BLOGS ==========
  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [blogs, searchTerm, sortBy]);

  useEffect(() => {
    const hasFilters = searchTerm || sortBy !== "latest";
    setHasActiveFilters(hasFilters);
  }, [searchTerm, sortBy]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "blogs",
        where: { is_deleted: 0 },
      });


      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setBlogs(response.data);
        } else if (response.data.blogs && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs);
        } else if (Array.isArray(response)) {
          setBlogs(response);
        } else {
          console.error("Unexpected response structure:", response);
          toast.error("Error loading blogs - unexpected format");
          setBlogs([]);
        }
      } else {
        toast.error("No data received from server");
        setBlogs([]);
      }
    } catch (error) {
      console.error("Fetch blogs error:", error);
      toast.error(`Error loading blogs: ${error.message}`);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...blogs];

    if (searchTerm) {
      filtered = filtered.filter((blog) => {
        const searchText = `
          ${blog.title || ""}
          ${blog.subtitle || ""}
          ${blog.content || ""}
          ${blog.author_name || ""}
        `.toLowerCase();

        return searchText.includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  };

  // ========== ADD BLOG ==========
  const handleAddBlog = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      thumbnail_url: "",
      author_name: "",
    });
    setSelectedBlog(null);
    setShowAddModal(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter blog title");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Please enter blog content");
      return;
    }

    setSaving(true);
    try {
      const currentTime = getCurrentTimestamp();

      const response = await DoAll({
        action: "insert",
        table: "blogs",
        data: {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          content: formData.content.trim(),
          thumbnail_url: formData.thumbnail_url.trim(),
          author_name: formData.author_name.trim(),
          created_at: currentTime,
          updated_at: currentTime,
          is_deleted: 0,
        },
      });


      if (response && response.success) {
        toast.success("Blog created successfully!");
        setShowAddModal(false);
        fetchBlogs();
      } else if (response && response.data && response.data.success) {
        toast.success("Blog created successfully!");
        setShowAddModal(false);
        fetchBlogs();
      } else {
        toast.error(response?.data?.message || "Error creating blog");
      }
    } catch (error) {
      console.error("Add blog error:", error);
      toast.error("Error creating blog");
    } finally {
      setSaving(false);
    }
  };

  // ========== EDIT BLOG ==========
  const handleEditBlog = (blog) => {
   

    setSelectedBlog(blog);
    setFormData({
      title: blog.title || "",
      subtitle: blog.subtitle || "",
      content: blog.content || "",
      thumbnail_url: blog.thumbnail_url || "",
      author_name: blog.author_name || "",
    });
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const handleSubmitEdit = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter blog title");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Please enter blog content");
      return;
    }

    setSaving(true);
    try {
      const currentTime = getCurrentTimestamp();

      const response = await DoAll({
        action: "update",
        table: "blogs",
        where: { id: selectedBlog.id },
        data: {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          content: formData.content.trim(),
          thumbnail_url: formData.thumbnail_url.trim(),
          author_name: formData.author_name.trim(),
          updated_at: currentTime,
        },
      });


      if (response && response.success) {
        toast.success("Blog updated successfully!");
        setShowEditModal(false);
        fetchBlogs();
      } else if (response && response.data && response.data.success) {
        toast.success("Blog updated successfully!");
        setShowEditModal(false);
        fetchBlogs();
      } else {
        toast.error(response?.data?.message || "Error updating blog");
      }
    } catch (error) {
      console.error("Edit blog error:", error);
      toast.error("Error updating blog");
    } finally {
      setSaving(false);
    }
  };

  // ========== DELETE BLOG ==========
  const handleDeleteBlog = async (blogId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this blog? This action can be undone."
      )
    ) {
      return;
    }

    setProcessingId(blogId);
    try {
      const currentTime = getCurrentTimestamp();


      const response = await DoAll({
        action: "update",
        table: "blogs",
        where: { id: blogId },
        data: {
          is_deleted: 1,
          deleted_at: currentTime,
          updated_at: currentTime,
        },
      });


      if (response?.success) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else if (response?.data?.success) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else if (response?.status === 200) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else {
        console.error("Delete response structure unexpected:", response);
        toast.error(
          response?.message || response?.data?.message || "Error deleting blog"
        );
      }
    } catch (error) {
      console.error("Delete blog error:", error);
      toast.error(error.message || "Error deleting blog");
    } finally {
      setProcessingId(null);
    }
  };

  // ========== PREVIEW BLOG ==========
  const handlePreviewBlog = (blog) => {
    setSelectedBlog(blog);
    setShowPreviewModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Loading blogs...</span>
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
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Edit2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  Blog Management
                </h1>
                <p className="text-sm text-gray-600">
                  Create, edit, and manage your blog articles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddBlog}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New Blog Post</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-700">
                {blogs.length}
              </div>
              <div className="text-sm text-emerald-600">Total Blogs</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">
                {blogs.filter((b) => b.thumbnail_url).length}
              </div>
              <div className="text-sm text-blue-600">With Thumbnail</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700">
                {blogs.filter((b) => b.author_name).length}
              </div>
              <div className="text-sm text-amber-600">With Author</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blogs by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
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

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
            >
              <option value="latest">Sort by: Latest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="title-asc">Sort by: Title A-Z</option>
              <option value="title-desc">Sort by: Title Z-A</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredBlogs.length} of {blogs.length} blog posts
              {hasActiveFilters && " (filtered)"}
            </p>
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {blogs.length > 0 ? formatDate(blogs[0]?.updated_at) : "N/A"}
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-emerald-300 group"
            >
              {/* Blog Image */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <img
                  src={
                    blog.thumbnail_url ||
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                    BLOG
                  </span>
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
                  {blog.title || "Untitled Blog"}
                </h3>

                {/* Subtitle/Excerpt */}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {blog.subtitle ||
                    blog.content?.substring(0, 150) ||
                    "No content available..."}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="truncate">
                      {blog.author_name || "Unknown Author"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Created: {formatDate(blog.created_at)}</div>
                  <div>Updated: {formatDate(blog.updated_at)}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handlePreviewBlog(blog)}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 hover:scale-110"
                    title="Edit Blog"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    disabled={processingId === blog.id}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 hover:scale-110 disabled:opacity-50"
                    title="Delete Blog"
                  >
                    {processingId === blog.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters ? "No blogs found" : "No Blogs Available"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start by creating your first blog post to engage your audience."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    onClick={handleAddBlog}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Blog</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== ADD BLOG MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black opacity-50 transition-opacity"
              onClick={() => setShowAddModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Create New Blog
                      </h3>
                      <p className="text-sm text-gray-600">
                        Fill in the details to create a new blog post
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter blog title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter blog subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.thumbnail_url && (
                      <div className="mt-2">
                        <img
                          src={formData.thumbnail_url}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="12"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Write your blog content here..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAdd}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Blog</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT BLOG MODAL ========== */}
      {showEditModal && selectedBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black opacity-50 transition-opacity"
              onClick={() => setShowEditModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Edit2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Edit Blog
                      </h3>
                      <p className="text-sm text-gray-600">
                        Edit the details of "{selectedBlog.title}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter blog title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter blog subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.thumbnail_url && (
                      <div className="mt-2">
                        <img
                          src={formData.thumbnail_url}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="12"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your blog content here..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEdit}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Blog</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== PREVIEW BLOG MODAL ========== */}
      {showPreviewModal && selectedBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black opacity-50 transition-opacity"
              onClick={() => setShowPreviewModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
              <div className="bg-white">
                {/* Blog Header Image */}
                <div className="relative h-64">
                  <img
                    src={
                      selectedBlog.thumbnail_url ||
                      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* Blog Content */}
                <div className="p-8">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {selectedBlog.title || "Untitled Blog"}
                    </h1>

                    {selectedBlog.subtitle && (
                      <p className="text-lg text-gray-600 mb-8">
                        {selectedBlog.subtitle}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-gray-500 mb-8 pb-8 border-b">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>
                          {selectedBlog.author_name || "Unknown Author"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedBlog.created_at)}</span>
                      </div>
                      {selectedBlog.updated_at !== selectedBlog.created_at && (
                        <div className="text-sm text-gray-400">
                          Updated: {formatDate(selectedBlog.updated_at)}
                        </div>
                      )}
                    </div>

                    <div className="prose prose-lg max-w-none">
                      {selectedBlog.content ? (
                        selectedBlog.content
                          .split("\n")
                          .map((paragraph, index) => (
                            <p key={index} className="mb-4 text-gray-700">
                              {paragraph}
                            </p>
                          ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No content available...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleEditBlog(selectedBlog);
                  }}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit This Blog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
