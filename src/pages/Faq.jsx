// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   Loader,
//   Search,
//   X,
//   Eye,
//   Calendar,
//   Tag,
//   Save,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import { DoAll } from "../api/auth";
// import toast from "react-hot-toast";
// import { format } from "date-fns";

// const Faqs= ({ onBack }) => {
//   const [faqs, setFaqs] = useState([]);
//   const [filteredFaqs, setFilteredFaqs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [processingId, setProcessingId] = useState(null);

//   // Search and Filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortBy, setSortBy] = useState("latest");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [hasActiveFilters, setHasActiveFilters] = useState(false);

//   // Categories for filtering
//   const [categories, setCategories] = useState([]);

//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [selectedFaq, setSelectedFaq] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Expand/Collapse state
//   const [expandedFaqs, setExpandedFaqs] = useState([]);

//   // Form state
//   const [formData, setFormData] = useState({
//     question: "",
//     answer: "",
//     category: "",
//   });

//   // ========== FETCH FAQS ==========
//   useEffect(() => {
//     fetchFaqs();
//   }, []);

//   useEffect(() => {
//     applyFiltersAndSearch();
//   }, [faqs, searchTerm, sortBy, categoryFilter]);

//   useEffect(() => {
//     const hasFilters =
//       searchTerm || sortBy !== "latest" || categoryFilter !== "all";
//     setHasActiveFilters(hasFilters);

//     // Extract unique categories
//     const uniqueCategories = [
//       ...new Set(
//         faqs
//           .filter((faq) => faq.category)
//           .map((faq) => faq.category)
//           .sort()
//       ),
//     ];
//     setCategories(uniqueCategories);
//   }, [faqs, searchTerm, sortBy, categoryFilter]);

//   const fetchFaqs = async () => {
//     try {
//       setLoading(true);
//       const response = await DoAll({
//         action: "get",
//         table: "faq",
//         where: { is_deleted: 0 },
//       });


//       if (response && response.data) {
//         if (Array.isArray(response.data)) {
//           setFaqs(response.data);
//         } else if (response.data.faq && Array.isArray(response.data.faq)) {
//           setFaqs(response.data.faq);
//         } else if (Array.isArray(response)) {
//           setFaqs(response);
//         } else {
//           console.error("Unexpected response structure:", response);
//           toast.error("Error loading FAQs - unexpected format");
//           setFaqs([]);
//         }
//       } else {
//         toast.error("No data received from server");
//         setFaqs([]);
//       }
//     } catch (error) {
//       console.error("Fetch FAQ error:", error);
//       toast.error(`Error loading FAQs: ${error.message}`);
//       setFaqs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFiltersAndSearch = () => {
//     let filtered = [...faqs];

//     // Apply category filter
//     if (categoryFilter !== "all") {
//       filtered = filtered.filter((faq) => faq.category === categoryFilter);
//     }

//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter((faq) => {
//         const searchText = `
//           ${faq.question || ""}
//           ${faq.answer || ""}
//           ${faq.category || ""}
//         `.toLowerCase();

//         return searchText.includes(searchTerm.toLowerCase());
//       });
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "latest":
//           return new Date(b.created_at) - new Date(a.created_at);
//         case "oldest":
//           return new Date(a.created_at) - new Date(b.created_at);
//         case "category-asc":
//           return (a.category || "").localeCompare(b.category || "");
//         case "category-desc":
//           return (b.category || "").localeCompare(a.category || "");
//         case "question-asc":
//           return (a.question || "").localeCompare(b.question || "");
//         case "question-desc":
//           return (b.question || "").localeCompare(a.question || "");
//         default:
//           return 0;
//       }
//     });

//     setFilteredFaqs(filtered);
//   };

//   // ========== TOGGLE FAQ EXPAND ==========
//   const toggleFaqExpand = (faqId) => {
//     setExpandedFaqs((prev) =>
//       prev.includes(faqId)
//         ? prev.filter((id) => id !== faqId)
//         : [...prev, faqId]
//     );
//   };

//   // ========== ADD FAQ ==========
//   const handleAddFaq = () => {
//     setFormData({
//       question: "",
//       answer: "",
//       category: "",
//     });
//     setSelectedFaq(null);
//     setShowAddModal(true);
//   };

//   const handleSubmitAdd = async () => {
//     if (!formData.question.trim()) {
//       toast.error("Please enter FAQ question");
//       return;
//     }
//     if (!formData.answer.trim()) {
//       toast.error("Please enter FAQ answer");
//       return;
//     }

//     setSaving(true);
//     try {
//       const response = await DoAll({
//         action: "insert",
//         table: "faq",
//         data: {
//           question: formData.question.trim(),
//           answer: formData.answer.trim(),
//           category: formData.category.trim(),
//           is_deleted: 0,
//         },
//       });


//       if (response && response.success) {
//         toast.success("FAQ created successfully!");
//         setShowAddModal(false);
//         fetchFaqs();
//       } else if (response && response.data && response.data.success) {
//         toast.success("FAQ created successfully!");
//         setShowAddModal(false);
//         fetchFaqs();
//       } else {
//         toast.error(response?.data?.message || "Error creating FAQ");
//       }
//     } catch (error) {
//       console.error("Add FAQ error:", error);
//       toast.error("Error creating FAQ");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ========== EDIT FAQ ==========
//   const handleEditFaq = (faq) => {

//     setSelectedFaq(faq);
//     setFormData({
//       question: faq.question || "",
//       answer: faq.answer || "",
//       category: faq.category || "",
//     });
//     setShowEditModal(true);
//     setShowAddModal(false);
//   };

//   const handleSubmitEdit = async () => {
//     if (!formData.question.trim()) {
//       toast.error("Please enter FAQ question");
//       return;
//     }
//     if (!formData.answer.trim()) {
//       toast.error("Please enter FAQ answer");
//       return;
//     }

//     setSaving(true);
//     try {
//       const response = await DoAll({
//         action: "update",
//         table: "faq",
//         where: { id: selectedFaq.id },
//         data: {
//           question: formData.question.trim(),
//           answer: formData.answer.trim(),
//           category: formData.category.trim(),
//         },
//       });


//       if (response && response.success) {
//         toast.success("FAQ updated successfully!");
//         setShowEditModal(false);
//         fetchFaqs();
//       } else if (response && response.data && response.data.success) {
//         toast.success("FAQ updated successfully!");
//         setShowEditModal(false);
//         fetchFaqs();
//       } else {
//         toast.error(response?.data?.message || "Error updating FAQ");
//       }
//     } catch (error) {
//       console.error("Edit FAQ error:", error);
//       toast.error("Error updating FAQ");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ========== DELETE FAQ ==========
//   const handleDeleteFaq = async (faqId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this FAQ? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     setProcessingId(faqId);
//     try {

//       const response = await DoAll({
//         action: "update",
//         table: "faq",
//         where: { id: faqId },
//         data: {
//           is_deleted: 1,
//           deleted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
//         },
//       });


//       if (response?.success) {
//         toast.success("FAQ deleted successfully!");
//         fetchFaqs();
//       } else if (response?.data?.success) {
//         toast.success("FAQ deleted successfully!");
//         fetchFaqs();
//       } else if (response?.status === 200) {
//         toast.success("FAQ deleted successfully!");
//         fetchFaqs();
//       } else {
//         console.error("Delete response structure unexpected:", response);
//         toast.error(
//           response?.message || response?.data?.message || "Error deleting FAQ"
//         );
//       }
//     } catch (error) {
//       console.error("Delete FAQ error:", error);
//       toast.error(error.message || "Error deleting FAQ");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ========== PREVIEW FAQ ==========
//   const handlePreviewFaq = (faq) => {
//     setSelectedFaq(faq);
//     setShowPreviewModal(true);
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setSortBy("latest");
//     setCategoryFilter("all");
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch {
//       return "Invalid date";
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   if (loading && faqs.length === 0) {
//     return (
//       <div className="min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
//             <div className="flex items-center justify-center space-x-2 text-emerald-600">
//               <Loader className="w-5 h-5 animate-spin" />
//               <span className="text-base font-medium">Loading FAQs...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-5 mb-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-emerald-500 rounded-lg">
//                 <Eye className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800 mb-1">
//                   FAQ Management
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Create, edit, and manage frequently asked questions
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={handleAddFaq}
//                 className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>New FAQ</span>
//               </button>
//             </div>
//           </div>

//           {/* Stats Overview */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
//               <div className="text-2xl font-bold text-emerald-700">
//                 {faqs.length}
//               </div>
//               <div className="text-sm text-emerald-600">Total FAQs</div>
//             </div>
//             <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
//               <div className="text-2xl font-bold text-purple-700">
//                 {categories.length}
//               </div>
//               <div className="text-sm text-purple-600">Categories</div>
//             </div>
//             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
//               <div className="text-2xl font-bold text-emerald-700">
//                 {faqs.filter((f) => f.category).length}
//               </div>
//               <div className="text-sm text-emerald-600">Categorized</div>
//             </div>
//             <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
//               <div className="text-2xl font-bold text-amber-700">
//                 {faqs.filter((f) => !f.category).length}
//               </div>
//               <div className="text-sm text-amber-600">Uncategorized</div>
//             </div>
//           </div>

//           {/* Search and Filter Section */}
//           <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Search Input */}
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-4 w-4 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search FAQs by question, answer, or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
//                 </button>
//               )}
//             </div>

//             {/* Category Filter */}
//             <select
//               value={categoryFilter}
//               onChange={(e) => setCategoryFilter(e.target.value)}
//               className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
//             >
//               <option value="all">All Categories</option>
//               {categories.map((category, index) => (
//                 <option key={index} value={category}>
//                   {category}
//                 </option>
//               ))}
//               <option value="uncategorized">Uncategorized</option>
//             </select>

//             {/* Sort Options */}
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
//             >
//               <option value="latest">Sort by: Latest First</option>
//               <option value="oldest">Sort by: Oldest First</option>
//               <option value="category-asc">Sort by: Category A-Z</option>
//               <option value="category-desc">Sort by: Category Z-A</option>
//               <option value="question-asc">Sort by: Question A-Z</option>
//               <option value="question-desc">Sort by: Question Z-A</option>
//             </select>

//             {/* Clear Filters */}
//             {hasActiveFilters && (
//               <button
//                 onClick={clearFilters}
//                 className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
//               >
//                 <X className="w-4 h-4 mr-2" />
//                 Clear All Filters
//               </button>
//             )}
//           </div>

//           {/* Results Count */}
//           <div className="mt-4 flex justify-between items-center">
//             <p className="text-sm text-gray-600">
//               Showing {filteredFaqs.length} of {faqs.length} FAQs
//               {hasActiveFilters && " (filtered)"}
//             </p>
//             <div className="text-sm text-gray-500">
//               Last updated:{" "}
//               {faqs.length > 0 ? formatDate(faqs[0]?.updated_at) : "N/A"}
//             </div>
//           </div>
//         </div>

//         {/* FAQs List */}
//         <div className="space-y-4">
//           {filteredFaqs.map((faq) => (
//             <div
//               key={faq.id}
//               className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 group"
//             >
//               <div className="space-y-4">
//                 {/* Question and Expand Button */}
//                 <div
//                   className="flex items-center justify-between cursor-pointer"
//                   onClick={() => toggleFaqExpand(faq.id)}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <div className="p-2 bg-emerald-100 rounded-lg mt-1">
//                       <Eye className="w-4 h-4 text-emerald-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
//                         {faq.question || "Untitled FAQ"}
//                       </h3>
//                       {faq.category && (
//                         <div className="flex items-center space-x-1 mt-1">
//                           <Tag className="w-3 h-3 text-gray-400" />
//                           <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
//                             {faq.category}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <button className="text-gray-400 hover:text-emerald-500">
//                     {expandedFaqs.includes(faq.id) ? (
//                       <ChevronUp className="w-5 h-5" />
//                     ) : (
//                       <ChevronDown className="w-5 h-5" />
//                     )}
//                   </button>
//                 </div>

//                 {/* Answer (Expandable) */}
//                 {expandedFaqs.includes(faq.id) && (
//                   <div className="ml-11 pl-4 border-l-2 border-emerald-100">
//                     <div className="prose prose-sm max-w-none">
//                       <p className="text-gray-700 whitespace-pre-line">
//                         {faq.answer || "No answer available..."}
//                       </p>
//                     </div>

//                     {/* Dates */}
//                     <div className="text-xs text-gray-400 space-y-1 mt-4">
//                       <div>Created: {formatDate(faq.created_at)}</div>
//                       <div>Updated: {formatDate(faq.updated_at)}</div>
//                       {faq.deleted_at && (
//                         <div className="text-red-400">
//                           Deleted: {formatDate(faq.deleted_at)}
//                         </div>
//                       )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex space-x-2 pt-4 mt-4 border-t border-gray-100">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handlePreviewFaq(faq);
//                         }}
//                         className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
//                       >
//                         <Eye className="w-4 h-4" />
//                         <span>Full Preview</span>
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleEditFaq(faq);
//                         }}
//                         className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors duration-200 hover:scale-110"
//                         title="Edit FAQ"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteFaq(faq.id);
//                         }}
//                         disabled={processingId === faq.id}
//                         className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 hover:scale-110 disabled:opacity-50"
//                         title="Delete FAQ"
//                       >
//                         {processingId === faq.id ? (
//                           <Loader className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Trash2 className="w-4 h-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Collapsed View - Quick Actions */}
//                 {!expandedFaqs.includes(faq.id) && (
//                   <div className="ml-11 flex items-center justify-between">
//                     <div className="text-sm text-gray-500 truncate max-w-md">
//                       {faq.answer?.substring(0, 100) ||
//                         "No answer available..."}
//                       {faq.answer?.length > 100 && "..."}
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <span className="text-xs text-gray-400">
//                         Click to expand
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredFaqs.length === 0 && (
//           <div className="text-center py-12">
//             <div className="bg-white rounded-xl border border-emerald-100 p-8 max-w-md mx-auto shadow-lg">
//               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Eye className="w-8 h-8 text-emerald-500" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-800 mb-2">
//                 {hasActiveFilters ? "No FAQs found" : "No FAQs Available"}
//               </h3>
//               <p className="text-sm text-gray-600 mb-6">
//                 {hasActiveFilters
//                   ? "Try adjusting your search or filters to find what you're looking for."
//                   : "Start by creating your first FAQ to help your users."}
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                 {hasActiveFilters ? (
//                   <button
//                     onClick={clearFilters}
//                     className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
//                   >
//                     Clear All Filters
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleAddFaq}
//                     className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
//                   >
//                     <Plus className="w-4 h-4" />
//                     <span>Create Your First FAQ</span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ========== ADD FAQ MODAL ========== */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <div
//               className="fixed inset-0 bg-black opacity-50 transition-opacity"
//               onClick={() => setShowAddModal(false)}
//             ></div>

//             <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
//               <div className="px-6 py-4">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="p-2 bg-emerald-500 rounded-lg">
//                       <Plus className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-800">
//                         Create New FAQ
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         Fill in the details to create a new FAQ
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowAddModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Category (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="category"
//                       value={formData.category}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="e.g., General, Billing, Technical Support"
//                       list="category-suggestions"
//                     />
//                     <datalist id="category-suggestions">
//                       {categories.map((category, index) => (
//                         <option key={index} value={category} />
//                       ))}
//                     </datalist>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Leave blank for uncategorized, or type a new category
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Question *
//                     </label>
//                     <textarea
//                       name="question"
//                       value={formData.question}
//                       onChange={handleInputChange}
//                       rows="3"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="Enter the frequently asked question"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Answer *
//                     </label>
//                     <textarea
//                       name="answer"
//                       value={formData.answer}
//                       onChange={handleInputChange}
//                       rows="6"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="Enter the detailed answer to the question"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       You can use line breaks to format the answer
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowAddModal(false)}
//                   className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitAdd}
//                   disabled={saving}
//                   className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                 >
//                   {saving ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       <span>Creating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4" />
//                       <span>Create FAQ</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========== EDIT FAQ MODAL ========== */}
//       {showEditModal && selectedFaq && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <div
//               className="fixed inset-0 bg-black opacity-50 transition-opacity"
//               onClick={() => setShowEditModal(false)}
//             ></div>

//             <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
//               <div className="px-6 py-4">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center space-x-3">
//                     <div className="p-2 bg-emerald-500 rounded-lg">
//                       <Edit2 className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-gray-800">
//                         Edit FAQ
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         Edit the details of this FAQ
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowEditModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Category (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="category"
//                       value={formData.category}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="e.g., General, Billing, Technical Support"
//                       list="edit-category-suggestions"
//                     />
//                     <datalist id="edit-category-suggestions">
//                       {categories.map((category, index) => (
//                         <option key={index} value={category} />
//                       ))}
//                     </datalist>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Leave blank for uncategorized, or type a new category
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Question *
//                     </label>
//                     <textarea
//                       name="question"
//                       value={formData.question}
//                       onChange={handleInputChange}
//                       rows="3"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="Enter the frequently asked question"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Answer *
//                     </label>
//                     <textarea
//                       name="answer"
//                       value={formData.answer}
//                       onChange={handleInputChange}
//                       rows="6"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                       placeholder="Enter the detailed answer to the question"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       You can use line breaks to format the answer
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitEdit}
//                   disabled={saving}
//                   className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                 >
//                   {saving ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       <span>Saving...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4" />
//                       <span>Update FAQ</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========== PREVIEW FAQ MODAL ========== */}
//       {showPreviewModal && selectedFaq && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <div
//               className="fixed inset-0 bg-black opacity-50 transition-opacity"
//               onClick={() => setShowPreviewModal(false)}
//             ></div>

//             <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-hidden">
//               <div className="bg-white p-8">
//                 <div className="max-w-3xl mx-auto">
//                   <div className="flex items-center justify-between mb-6">
//                     <div>
//                       <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                         FAQ Preview
//                       </h1>
//                       {selectedFaq.category && (
//                         <div className="inline-flex items-center space-x-1">
//                           <Tag className="w-4 h-4 text-emerald-500" />
//                           <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
//                             {selectedFaq.category}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => setShowPreviewModal(false)}
//                       className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                     >
//                       <X className="w-5 h-5 text-gray-700" />
//                     </button>
//                   </div>

//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                         Question:
//                       </h3>
//                       <p className="text-gray-800 text-lg font-medium">
//                         {selectedFaq.question || "Untitled FAQ"}
//                       </p>
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                         Answer:
//                       </h3>
//                       <div className="prose prose-lg max-w-none">
//                         <p className="text-gray-700 whitespace-pre-line">
//                           {selectedFaq.answer || "No answer available..."}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="pt-6 mt-6 border-t border-gray-200">
//                       <div className="text-sm text-gray-500 space-y-1">
//                         <div className="flex justify-between">
//                           <span>Created:</span>
//                           <span className="font-medium">
//                             {formatDate(selectedFaq.created_at)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Last Updated:</span>
//                           <span className="font-medium">
//                             {formatDate(selectedFaq.updated_at)}
//                           </span>
//                         </div>
//                         {selectedFaq.deleted_at && (
//                           <div className="flex justify-between text-red-500">
//                             <span>Deleted:</span>
//                             <span className="font-medium">
//                               {formatDate(selectedFaq.deleted_at)}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowPreviewModal(false)}
//                   className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Close Preview
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowPreviewModal(false);
//                     handleEditFaq(selectedFaq);
//                   }}
//                   className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
//                 >
//                   <Edit2 className="w-4 h-4" />
//                   <span>Edit This FAQ</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Faqs;


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
  Tag,
  Save,
  ChevronDown,
  ChevronUp,
  Filter,
  Menu,
} from "lucide-react";
import { DoAll } from "../api/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

const Faqs = ({ onBack }) => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [saving, setSaving] = useState(false);

  // Expand state
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
  });

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch FAQs
  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [faqs, searchTerm, sortBy, categoryFilter]);

  useEffect(() => {
    const hasFilters =
      searchTerm || sortBy !== "latest" || categoryFilter !== "all";
    setHasActiveFilters(hasFilters);

    const uniqueCategories = [
      ...new Set(
        faqs
          .filter((faq) => faq.category)
          .map((faq) => faq.category)
          .sort()
      ),
    ];
    setCategories(uniqueCategories);
  }, [faqs, searchTerm, sortBy, categoryFilter]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await DoAll({
        action: "get",
        table: "faq",
        where: { is_deleted: 0 },
      });

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setFaqs(response.data);
        } else if (response.data.faq && Array.isArray(response.data.faq)) {
          setFaqs(response.data.faq);
        } else if (Array.isArray(response)) {
          setFaqs(response);
        } else {
          setFaqs([]);
        }
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error("Fetch FAQ error:", error);
      toast.error(`Error loading FAQs: ${error.message}`);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...faqs];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((faq) => faq.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((faq) => {
        const searchText = `
          ${faq.question || ""}
          ${faq.answer || ""}
          ${faq.category || ""}
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
        case "category-asc":
          return (a.category || "").localeCompare(b.category || "");
        case "category-desc":
          return (b.category || "").localeCompare(a.category || "");
        case "question-asc":
          return (a.question || "").localeCompare(b.question || "");
        case "question-desc":
          return (b.question || "").localeCompare(a.question || "");
        default:
          return 0;
      }
    });

    setFilteredFaqs(filtered);
  };

  const toggleFaqExpand = (faqId) => {
    setExpandedFaqs((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId]
    );
  };

  const handleAddFaq = () => {
    setFormData({
      question: "",
      answer: "",
      category: "",
    });
    setSelectedFaq(null);
    setShowAddModal(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.question.trim()) {
      toast.error("Please enter FAQ question");
      return;
    }
    if (!formData.answer.trim()) {
      toast.error("Please enter FAQ answer");
      return;
    }

    setSaving(true);
    try {
      const response = await DoAll({
        action: "insert",
        table: "faq",
        data: {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category.trim(),
          is_deleted: 0,
        },
      });

      if (response?.success || response?.data?.success) {
        toast.success("FAQ created successfully!");
        setShowAddModal(false);
        fetchFaqs();
      } else {
        toast.error(response?.data?.message || "Error creating FAQ");
      }
    } catch (error) {
      console.error("Add FAQ error:", error);
      toast.error("Error creating FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFaq = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "",
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!formData.question.trim()) {
      toast.error("Please enter FAQ question");
      return;
    }
    if (!formData.answer.trim()) {
      toast.error("Please enter FAQ answer");
      return;
    }

    setSaving(true);
    try {
      const response = await DoAll({
        action: "update",
        table: "faq",
        where: { id: selectedFaq.id },
        data: {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category.trim(),
        },
      });

      if (response?.success || response?.data?.success) {
        toast.success("FAQ updated successfully!");
        setShowEditModal(false);
        fetchFaqs();
      } else {
        toast.error(response?.data?.message || "Error updating FAQ");
      }
    } catch (error) {
      console.error("Edit FAQ error:", error);
      toast.error("Error updating FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    setProcessingId(faqId);
    try {
      const response = await DoAll({
        action: "update",
        table: "faq",
        where: { id: faqId },
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
        toast.success("FAQ deleted successfully!");
        fetchFaqs();
      } else {
        toast.error("Error deleting FAQ");
      }
    } catch (error) {
      console.error("Delete FAQ error:", error);
      toast.error("Error deleting FAQ");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreviewFaq = (faq) => {
    setSelectedFaq(faq);
    setShowPreviewModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
    setCategoryFilter("all");
    setShowMobileFilters(false);
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

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm sm:text-base">
              Loading FAQs...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  FAQ Management
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Create, edit, and manage frequently asked questions
                </p>
              </div>
            </div>

            <button
              onClick={handleAddFaq}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New FAQ</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {faqs.length}
              </div>
              <div className="text-sm text-emerald-600">Total FAQs</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-purple-700">
                {categories.length}
              </div>
              <div className="text-sm text-purple-600">Categories</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {faqs.filter((f) => f.category).length}
              </div>
              <div className="text-sm text-emerald-600">Categorized</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="text-2xl sm:text-3xl font-bold text-amber-700">
                {faqs.filter((f) => !f.category).length}
              </div>
              <div className="text-sm text-amber-600">Uncategorized</div>
            </div>
          </div>

          {/* Search and Filters - Mobile View */}
          <div className="lg:hidden mb-4">
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {showMobileFilters && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="uncategorized">Uncategorized</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="category-asc">Category A-Z</option>
                  <option value="category-desc">Category Z-A</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search and Filters - Desktop View */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs by question, answer, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
              <option value="uncategorized">Uncategorized</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
            >
              <option value="latest">Sort by: Latest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="category-asc">Sort by: Category A-Z</option>
              <option value="category-desc">Sort by: Category Z-A</option>
              <option value="question-asc">Sort by: Question A-Z</option>
              <option value="question-desc">Sort by: Question Z-A</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
            <p>
              Showing {filteredFaqs.length} of {faqs.length} FAQs
              {hasActiveFilters && " (filtered)"}
            </p>
            <p>
              Last updated:{" "}
              {faqs.length > 0 ? formatDate(faqs[0]?.updated_at) : "N/A"}
            </p>
          </div>
        </div>

        {/* FAQs List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  {/* Question Header */}
                  <div
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => toggleFaqExpand(faq.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-emerald-100 rounded-lg mt-1 flex-shrink-0">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {faq.question || "Untitled FAQ"}
                        </h3>
                        {faq.category && (
                          <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <Tag className="w-3 h-3" />
                            {faq.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      {expandedFaqs.includes(faq.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Collapsed Preview */}
                  {!expandedFaqs.includes(faq.id) && (
                    <div className="mt-3 ml-11">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {faq.answer?.substring(0, 100) ||
                          "No answer available..."}
                        {faq.answer?.length > 100 && "..."}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Click to expand
                      </p>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {expandedFaqs.includes(faq.id) && (
                    <div className="mt-4 ml-11 border-t pt-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
                          {faq.answer || "No answer available..."}
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{formatDate(faq.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span>{formatDate(faq.updated_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewFaq(faq);
                          }}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFaq(faq);
                          }}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFaq(faq.id);
                          }}
                          disabled={processingId === faq.id}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                          {processingId === faq.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? "No FAQs Found" : "No FAQs Available"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first FAQ to help your users."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={handleAddFaq}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First FAQ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Create New FAQ
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Fill in the details to create a new FAQ
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., General, Billing, Technical Support"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter the frequently asked question"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer *
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter the detailed answer to the question"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t p-4 sm:p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAdd}
                disabled={saving}
                className="px-4 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create FAQ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Edit FAQ
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Edit the details of this FAQ
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., General, Billing, Technical Support"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter the frequently asked question"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer *
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter the detailed answer to the question"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t p-4 sm:p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={saving}
                className="px-4 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update FAQ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    FAQ Preview
                  </h2>
                  {selectedFaq.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      {selectedFaq.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Question
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedFaq.question}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Answer
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedFaq.answer}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {formatDate(selectedFaq.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-medium">
                        {formatDate(selectedFaq.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 sm:p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleEditFaq(selectedFaq);
                }}
                className="px-4 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faqs;