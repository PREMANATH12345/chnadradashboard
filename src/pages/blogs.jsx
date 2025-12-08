import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  Search,
  Filter,
  X,
  Eye,
  Calendar,
  User,
  Tag,
  TrendingUp,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import BlogModal from "../Models/Blogs/BlogModal";
import { format } from "date-fns";

const Blogs = ({ onBack }) => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [blogs, searchTerm, selectedFilter, sortBy, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "blogs",
        where: { is_deleted: 0 },
      });

      if (response.data.success) {
        setBlogs(response.data.data || []);
      } else {
        toast.error("Error loading blogs");
      }
    } catch (error) {
      console.error("Fetch blogs error:", error);
      toast.error("Error loading blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await DoAll({
        action: "get",
        table: "blog_categories",
      });

      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...blogs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((blog) => {
        const searchText = `
          ${blog.title || ""}
          ${blog.subtitle || ""}
          ${blog.content || ""}
          ${blog.author_name || ""}
          ${blog.category_name || ""}
        `.toLowerCase();

        return searchText.includes(searchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((blog) => {
        switch (selectedFilter) {
          case "published":
            return blog.status === "published";
          case "draft":
            return blog.status === "draft";
          case "scheduled":
            return blog.status === "scheduled";
          case "popular":
            return (blog.view_count || 0) > 1000;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (blog) =>
          blog.category_id == selectedCategory ||
          blog.category_name === selectedCategory
      );
    }

    // Apply sorting
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
        case "views-desc":
          return (b.view_count || 0) - (a.view_count || 0);
        case "views-asc":
          return (a.view_count || 0) - (b.view_count || 0);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  };

  const handleAddNew = () => {
    setEditingBlog(null);
    setShowModal(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowModal(true);
  };

  const handleDeleteBlog = async (blogId) => {
    if (
      !confirm(
        "Are you sure you want to delete this blog? This action cannot be undone."
      )
    )
      return;

    setDeletingId(blogId);
    try {
      const response = await DoAll({
        action: "update",
        table: "blogs",
        where: { id: blogId },
        data: { is_deleted: 1 },
      });

      if (response.data.success) {
        toast.success("Blog moved to trash successfully!");
        fetchBlogs();
      }
    } catch (error) {
      console.error("Delete blog error:", error);
      toast.error("Error deleting blog");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewBlog = (blogId) => {
    // Navigate to blog view page or open preview
    window.open(`/blog/${blogId}`, "_blank");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    setSelectedCategory("all");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          border: "border-emerald-200",
        };
      case "draft":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
        };
      case "scheduled":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  const getCategoryColor = (category) => {
    const colors = [
      {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
      { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
      { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
    ];

    const index = category ? category.charCodeAt(0) % colors.length : 0;
    return colors[index];
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

  const hasActiveFilters =
    searchTerm ||
    selectedFilter !== "all" ||
    selectedCategory !== "all" ||
    sortBy !== "latest";

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
                onClick={onBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New Blog Post</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-700">
                {blogs.length}
              </div>
              <div className="text-sm text-emerald-600">Total Posts</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">
                {blogs.filter((b) => b.status === "published").length}
              </div>
              <div className="text-sm text-blue-600">Published</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-700">
                {blogs.filter((b) => b.status === "draft").length}
              </div>
              <div className="text-sm text-amber-600">Drafts</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">
                {blogs.reduce((sum, blog) => sum + (blog.view_count || 0), 0)}
              </div>
              <div className="text-sm text-purple-600">Total Views</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm appearance-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="scheduled">Scheduled</option>
                <option value="popular">Popular (1000+ views)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort and Clear */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              >
                <option value="latest">Sort by: Latest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="title-asc">Sort by: Title A-Z</option>
                <option value="title-desc">Sort by: Title Z-A</option>
                <option value="views-desc">Sort by: Most Views</option>
                <option value="views-asc">Sort by: Fewest Views</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredBlogs.length} of {blogs.length} blog posts
              {hasActiveFilters && " (filtered)"}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>
                Total Views:{" "}
                {blogs
                  .reduce((sum, blog) => sum + (blog.view_count || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const statusColors = getStatusColor(blog.status);
            const categoryColors = getCategoryColor(blog.category_name);

            return (
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
                    <span
                      className={`px-3 py-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border} rounded-full text-xs font-bold`}
                    >
                      {blog.status?.toUpperCase() || "DRAFT"}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    {blog.category_name && (
                      <span
                        className={`px-3 py-1 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} rounded-full text-xs font-bold`}
                      >
                        {blog.category_name}
                      </span>
                    )}
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

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>
                          {blog.view_count?.toLocaleString() || 0} views
                        </span>
                      </div>
                      {blog.is_featured && (
                        <div className="flex items-center space-x-1 text-amber-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">Featured</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewBlog(blog.id)}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleEdit(blog)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 hover:scale-110"
                      title="Edit Blog"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      disabled={deletingId === blog.id}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 hover:scale-110 disabled:opacity-50"
                      title="Delete Blog"
                    >
                      {deletingId === blog.id ? (
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
                    onClick={handleAddNew}
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

      {/* Blog Modal */}
      <BlogModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingBlog={editingBlog}
        fetchBlogs={fetchBlogs}
        categories={categories}
      />
    </div>
  );
};

export default Blogs;
