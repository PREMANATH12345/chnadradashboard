import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  Search,
  Filter,
  X,
  Gem,
  Ruler,
  Sparkles,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import AttributeModal from "../Models/Attributes/AttributeModal";

const Attributes = ({ onBack }) => {
  const [attributes, setAttributes] = useState({
    metal: { id: null, options: [], type: "metal", name: "Choice of Metal" },
    diamond: {
      id: null,
      options: [],
      type: "diamond",
      name: "Diamond Quality",
    },
    size: { id: null, options: [], type: "size", name: "Size" },
  });
  const [filteredAttributes, setFilteredAttributes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [attributes, searchTerm, selectedFilter, sortBy]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);

      // First fetch all attributes
      const response = await DoAll({
        action: "get",
        table: "attributes",
      });

      // ✅ FIX: Based on your categories code, response.success is at root level
      if (!response?.success) {
        throw new Error("Invalid API response structure");
      }

      const grouped = {
        metal: {
          id: null,
          options: [],
          type: "metal",
          name: "Choice of Metal",
        },
        diamond: {
          id: null,
          options: [],
          type: "diamond",
          name: "Diamond Quality",
        },
        size: { id: null, options: [], type: "size", name: "Size" },
      };

      // Process attributes and fetch their options
      const attributesData = response.data || [];

      // Process each attribute
      for (const attr of attributesData) {
        if (grouped.hasOwnProperty(attr.type)) {
          // Fetch options for this attribute
          let options = [];
          try {
            const optionsResponse = await DoAll({
              action: "get",
              table: "attribute_options",
              where: { attribute_id: attr.id, is_deleted: 0 },
            });

            // ✅ FIX: Based on your categories code
            if (optionsResponse?.success) {
              options = optionsResponse.data || [];
            }
          } catch (error) {
            console.error(
              `Error fetching options for attribute ${attr.id}:`,
              error
            );
            options = [];
          }

          grouped[attr.type] = {
            ...grouped[attr.type],
            id: attr.id,
            name: attr.name || grouped[attr.type].name,
            options: options,
          };
        }
      }

      setAttributes(grouped);
    } catch (error) {
      console.error("Fetch attributes error:", error);
      toast.error("Error loading attributes");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    // Convert attributes object to array for filtering
    const attributeTypes = ["metal", "diamond", "size"];
    let filtered = attributeTypes.map((type) => {
      const attr = attributes[type];
      return {
        type,
        ...attr,
        name: attr?.name || type.charAt(0).toUpperCase() + type.slice(1),
        options: attr?.options || [],
      };
    });

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((attr) => {
        const attrName = (attr.name || "").toLowerCase();
        const optionsText = (attr.options || [])
          .map((opt) => opt.option_name || "")
          .join(" ")
          .toLowerCase();

        return (
          attrName.includes(searchLower) || optionsText.includes(searchLower)
        );
      });
    }

    // Apply option count filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((attr) => {
        const optionCount = attr.options?.length || 0;
        switch (selectedFilter) {
          case "with-options":
            return optionCount > 0;
          case "no-options":
            return optionCount === 0;
          case "many-options":
            return optionCount >= 5;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aName = a.name || "";
      const bName = b.name || "";
      const aOptionsCount = a.options?.length || 0;
      const bOptionsCount = b.options?.length || 0;

      switch (sortBy) {
        case "name":
          return aName.localeCompare(bName);
        case "name-desc":
          return bName.localeCompare(aName);
        case "options-count":
          return bOptionsCount - aOptionsCount;
        case "options-count-asc":
          return aOptionsCount - bOptionsCount;
        default:
          return 0;
      }
    });

    setFilteredAttributes(filtered);
  };

  const handleAddNew = () => {
    setEditingAttribute(null);
    setShowModal(true);
  };

  const handleEdit = (attribute) => {
    // Prepare attribute with options data
    const attributeWithOptions = {
      ...attribute,
      options: attribute.options || [],
    };
    setEditingAttribute(attributeWithOptions);
    setShowModal(true);
  };

  const handleDeleteOption = async (optionId, attributeType) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      // Use soft_delete like in your categories code
      const response = await DoAll({
        action: "soft_delete",
        table: "attribute_options",
        where: { id: optionId },
      });

      // ✅ FIX: Check response.success (not response.data.success)
      if (response?.success) {
        toast.success("Option deleted successfully!");
        fetchAttributes();
      } else {
        throw new Error("Failed to delete option");
      }
    } catch (error) {
      console.error("Delete option error:", error);
      toast.error("Error deleting option");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    setSortBy("name");
  };

  const getAttributeIcon = (type) => {
    switch (type) {
      case "metal":
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case "diamond":
        return <Gem className="w-5 h-5 text-emerald-500" />;
      case "size":
        return <Ruler className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getAttributeColor = (type) => {
    switch (type) {
      case "metal":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
        };
      case "diamond":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      case "size":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">
                Loading attributes...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    searchTerm || selectedFilter !== "all" || sortBy !== "name";


  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  Attributes Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage product attributes like Metal, Diamond, and Size
                  options
                </p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Attribute</span>
            </button>
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
                placeholder="Search attributes or options..."
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

            {/* Filter Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm appearance-none"
              >
                <option value="all">All Attributes</option>
                <option value="with-options">With Options</option>
                <option value="no-options">No Options</option>
                <option value="many-options">5+ Options</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              >
                <option value="name">Sort by: Name A-Z</option>
                <option value="name-desc">Sort by: Name Z-A</option>
                <option value="options-count">Sort by: Most Options</option>
                <option value="options-count-asc">
                  Sort by: Fewest Options
                </option>
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

            {/* Results Count */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredAttributes.length} of{" "}
                {Object.keys(attributes).length} attribute types
                {hasActiveFilters && " (filtered)"}
              </p>
              {hasActiveFilters && filteredAttributes.length === 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAttributes.map((attribute) => {
            const colors = getAttributeColor(attribute.type);
            const options = attribute.options || [];
            const attributeId = attribute.id;

            return (
              <div
                key={attribute.type}
                className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-emerald-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      {getAttributeIcon(attribute.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
                        {attribute.name || attribute.type}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {attribute.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(attribute)}
                      className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Edit Attribute"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* {attributeId && (
                      <button
                        onClick={() => handleDeleteAttribute(attribute.type)}
                        disabled={deletingId === attribute.type}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                        title="Delete Attribute"
                      >
                        {deletingId === attribute.type ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )} */}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Options Count */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Options
                    </span>
                    <span
                      className={`px-2 py-1 ${colors.bg} ${colors.text} ${colors.border} rounded-full text-xs font-bold`}
                    >
                      {options.length}{" "}
                      {options.length === 1 ? "option" : "options"}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Available Options:
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {options.length > 0 ? (
                        options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 group/option hover:bg-white hover:border-emerald-200 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <div className="text-sm text-gray-800">
                                <span className="font-medium">
                                  {option.option_name || "Unnamed Option"}
                                </span>
                                {option.option_value &&
                                  option.option_value !==
                                    option.option_name && (
                                    <span className="text-gray-500 text-xs ml-2">
                                      • Value: {option.option_value}
                                    </span>
                                  )}
                                {attribute.type === "size" &&
                                  option.size_mm && (
                                    <span className="text-gray-500 text-xs ml-2">
                                      • Size: {option.size_mm}mm
                                    </span>
                                  )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteOption(option.id, attribute.type)
                              }
                              className="opacity-0 group-hover/option:opacity-100 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-all duration-200 ml-2"
                              title="Delete option"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 text-sm">
                            No options added yet
                          </div>
                          <button
                            onClick={() => handleEdit(attribute)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-medium mt-1"
                          >
                            Add first option
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Option Button */}
                  <button
                    onClick={() => handleEdit(attribute)}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {options.length === 0
                        ? "Add First Option"
                        : "Add New Option"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAttributes.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {hasActiveFilters
                  ? "No attributes found"
                  : "No Attributes Available"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Attributes will appear here once they are configured in the system."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={handleAddNew}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                >
                  Create First Attribute
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attribute Modal */}
      <AttributeModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingAttribute={editingAttribute}
        fetchAttributes={fetchAttributes}
      />
    </div>
  );
};

export default Attributes;
