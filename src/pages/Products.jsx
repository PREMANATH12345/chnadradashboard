// import { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';

// const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

// const Products = () => {
//   const [currentStep, setCurrentStep] = useState('dashboard');
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${API_URL}/doAll`,
//         { action: 'get', table: 'category' },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (response.data.success) {
//         setCategories(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="p-4 sm:p-8 text-center">Loading...</div>;
//   }

//   return (
//     <div className="p-4 sm:p-6 md:p-8">
//       {/* Navigation Steps */}
//       <div className="mb-6 sm:mb-8">
//         <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
//           <StepButton
//             step="dashboard"
//             currentStep={currentStep}
//             onClick={() => setCurrentStep('dashboard')}
//             icon="📊"
//             label="Dashboard"
//           />
//           <div className="text-gray-400">›</div>
//           <StepButton
//             step="view-products"
//             currentStep={currentStep}
//             onClick={() => setCurrentStep('view-products')}
//             icon="👁️"
//             label="View Products"
//           />
//           <div className="text-gray-400">›</div>
//           <StepButton
//             step="add-products"
//             currentStep={currentStep}
//             onClick={() => {
//               if (categories.length === 0) {
//                 alert('Please create a category first!');
//                 return;
//               }
//               setCurrentStep('add-products');
//             }}
//             icon="➕"
//             label="Add Products"
//             disabled={categories.length === 0}
//           />
//         </nav>
//       </div>

//       {/* Step Content */}
//       {currentStep === 'dashboard' && (
//         <ProductsDashboard 
//           categories={categories}
//           onViewProducts={() => setCurrentStep('view-products')}
//           onAddProducts={() => {
//             if (categories.length === 0) {
//               alert('Please create a category first!');
//               return;
//             }
//             setCurrentStep('add-products');
//           }}
//         />
//       )}

//       {currentStep === 'view-products' && (
//         <ViewProducts 
//           categories={categories}
//           onBack={() => setCurrentStep('dashboard')}
//           onAddProduct={() => {
//             if (categories.length === 0) {
//               alert('Please create a category first!');
//               return;
//             }
//             setCurrentStep('add-products');
//           }}
//         />
//       )}

//       {currentStep === 'add-products' && (
//         <AddProducts 
//           onBack={() => setCurrentStep('dashboard')}
//           categories={categories}
//           onRefresh={fetchCategories}
//         />
//       )}
//     </div>
//   );
// };

// // Step Navigation Button Component
// const StepButton = ({ step, currentStep, onClick, icon, label, disabled = false }) => {
//   const isActive = currentStep === step;
//   const isCompleted = 
//     (step === 'dashboard' && currentStep !== 'dashboard') ||
//     (step === 'view-products' && currentStep === 'add-products');

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
//         isActive
//           ? 'bg-blue-600 text-white shadow-md'
//           : isCompleted
//           ? 'bg-green-100 text-green-700 border border-green-300'
//           : disabled
//           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//       }`}
//     >
//       <span className="text-base">{icon}</span>
//       <span className="font-medium">{label}</span>
//       {isCompleted && <span className="text-green-500">✓</span>}
//     </button>
//   );
// };

// // ==================== DASHBOARD COMPONENT ====================
// const ProductsDashboard = ({ categories, onViewProducts, onAddProducts }) => {
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     activeProducts: 0,
//     featuredProducts: 0,
//     lowStock: 0
//   });

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${API_URL}/doAll`,
//         { action: 'get', table: 'products' },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       if (response.data.success) {
//         const products = response.data.data || [];
//         const featured = products.filter(p => 
//           p.product_details?.featured?.includes('Latest Designs') || 
//           p.product_details?.featured?.includes('Bestsellers')
//         ).length;
        
//         setStats({
//           totalProducts: products.length,
//           activeProducts: products.length,
//           featuredProducts: featured,
//           lowStock: 0
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard 
//           icon="📦" 
//           value={stats.totalProducts} 
//           label="Total Products" 
//           color="blue" 
//         />
//         <StatCard 
//           icon="✅" 
//           value={stats.activeProducts} 
//           label="Active Products" 
//           color="green" 
//         />
//         <StatCard 
//           icon="⭐" 
//           value={stats.featuredProducts} 
//           label="Featured Products" 
//           color="purple" 
//         />
//         <StatCard 
//           icon="⚠️" 
//           value={stats.lowStock} 
//           label="Low Stock" 
//           color="orange" 
//         />
//       </div>

//       {/* Action Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <ActionCard
//           icon="👁️"
//           title="View Products"
//           description="Browse, search and manage all your products"
//           buttonText="View Products"
//           onClick={onViewProducts}
//           color="blue"
//         />
//         <ActionCard
//           icon="➕"
//           title="Add Products"
//           description="Add new products to your catalog"
//           buttonText="Add Products"
//           onClick={onAddProducts}
//           color="green"
//         />
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//           <span>📋</span>
//           Quick Actions
//         </h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <QuickAction
//             icon="🔍"
//             title="Search Products"
//             description="Find specific products quickly"
//             onClick={onViewProducts}
//           />
//           <QuickAction
//             icon="📊"
//             title="View Analytics"
//             description="Check product performance"
//             onClick={() => alert('Analytics coming soon!')}
//           />
//           <QuickAction
//             icon="🔄"
//             title="Refresh Data"
//             description="Update product information"
//             onClick={fetchStats}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, value, label, color }) => {
//   const colorClasses = {
//     blue: 'bg-blue-50 border-blue-200 text-blue-700',
//     green: 'bg-green-50 border-green-200 text-green-700',
//     purple: 'bg-purple-50 border-purple-200 text-purple-700',
//     orange: 'bg-orange-50 border-orange-200 text-orange-700'
//   };

//   return (
//     <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-2xl font-bold">{value}</div>
//           <div className="text-sm opacity-80">{label}</div>
//         </div>
//         <div className="text-2xl">{icon}</div>
//       </div>
//     </div>
//   );
// };

// const ActionCard = ({ icon, title, description, buttonText, onClick, color }) => {
//   const colorClasses = {
//     blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
//     green: 'bg-green-50 border-green-200 hover:bg-green-100'
//   };

//   const buttonClasses = {
//     blue: 'bg-blue-600 hover:bg-blue-700',
//     green: 'bg-green-600 hover:bg-green-700'
//   };

//   return (
//     <div className={`p-6 rounded-lg border-2 transition-colors ${colorClasses[color]}`}>
//       <div className="flex items-start gap-4">
//         <div className="text-3xl">{icon}</div>
//         <div className="flex-1">
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
//           <p className="text-gray-600 mb-4">{description}</p>
//           <button
//             onClick={onClick}
//             className={`px-6 py-2 text-white rounded-lg font-semibold transition-colors ${buttonClasses[color]}`}
//           >
//             {buttonText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const QuickAction = ({ icon, title, description, onClick }) => {
//   return (
//     <button
//       onClick={onClick}
//       className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
//     >
//       <div className="text-2xl">{icon}</div>
//       <div>
//         <div className="font-semibold text-gray-900">{title}</div>
//         <div className="text-sm text-gray-600">{description}</div>
//       </div>
//     </button>
//   );
// };

// // ==================== VIEW PRODUCTS COMPONENT ====================
// const ViewProducts = ({ categories, onBack, onAddProduct }) => {
//   const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [imagePopup, setImagePopup] = useState(null);
//   const [editProduct, setEditProduct] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('name');

//   const toggleCategory = (catId) => {
//     setSelectedCategoryIds(prev => {
//       const newSelection = prev.includes(catId)
//         ? prev.filter(id => id !== catId)
//         : [...prev, catId];
//       return newSelection;
//     });
//   };

//   const fetchProducts = useCallback(async () => {
//     if (selectedCategoryIds.length === 0) {
//       setProducts([]);
//       return;
//     }

//     setLoading(true);
//     const token = localStorage.getItem('token');

//     try {
//       const response = await axios.post(
//         `${API_URL}/products/by-category`,
//         { category_ids: selectedCategoryIds },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         setProducts(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       alert('Error loading products');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedCategoryIds]);

//   useEffect(() => {
//     fetchProducts();
//   }, [selectedCategoryIds, fetchProducts]);

//   const handleDelete = async (productId) => {
//     if (!confirm('Are you sure you want to delete this product?')) return;

//     const token = localStorage.getItem('token');
//     try {
//       const response = await axios.post(
//         `${API_URL}/products/delete`,
//         { product_id: productId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert('Product deleted successfully');
//         fetchProducts();
//       }
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       alert('Error deleting product');
//     }
//   };

//   const filteredProducts = products
//     .filter(product => 
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.slug.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       switch (sortBy) {
//         case 'name':
//           return a.name.localeCompare(b.name);
//         case 'price-high':
//           return b.product_details.price - a.product_details.price;
//         case 'price-low':
//           return a.product_details.price - b.product_details.price;
//         case 'discount':
//           return b.product_details.discount - a.product_details.discount;
//         default:
//           return 0;
//       }
//     });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onBack}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             title="Back to Dashboard"
//           >
//             ←
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">View Products</h1>
//         </div>
//         <button
//           onClick={onAddProduct}
//           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
//         >
//           <span>➕</span>
//           <span>Add Product</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         {/* Mobile Filter Bar */}
//         <div className="lg:hidden p-4 border-b border-gray-200">
//           <div className="flex gap-2 mb-3">
//             <input
//               type="text"
//               placeholder="🔍 Search products..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
//             />
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-md text-sm"
//             >
//               <option value="name">📝 Name</option>
//               <option value="price-high">💰 High to Low</option>
//               <option value="price-low">💰 Low to High</option>
//               <option value="discount">🎯 Discount</option>
//             </select>
//           </div>
          
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             {categories.map(cat => (
//               <button
//                 key={cat.id}
//                 onClick={() => toggleCategory(cat.id)}
//                 className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
//                   selectedCategoryIds.includes(cat.id)
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 {cat.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-col lg:flex-row">
//           {/* Desktop Sidebar - Categories */}
//           <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 p-4">
//             <h3 className="font-semibold text-lg mb-4">📂 Categories</h3>
//             <div className="space-y-2">
//               {categories.map(cat => (
//                 <label
//                   key={cat.id}
//                   className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedCategoryIds.includes(cat.id)}
//                     onChange={() => toggleCategory(cat.id)}
//                     className="w-5 h-5"
//                   />
//                   <span className="font-medium text-sm">{cat.name}</span>
//                 </label>
//               ))}
//             </div>

//             {selectedCategoryIds.length > 0 && (
//               <div className="mt-4 p-3 bg-blue-50 rounded-md">
//                 <p className="text-sm text-blue-800">
//                   ✅ {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Products Grid */}
//           <div className="flex-1">
//             {/* Desktop Toolbar */}
//             <div className="hidden lg:flex justify-between items-center p-4 border-b border-gray-200">
//               <div className="flex items-center gap-4">
//                 <input
//                   type="text"
//                   placeholder="🔍 Search products..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
//                 />
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded-md text-sm"
//                 >
//                   <option value="name">📝 Name</option>
//                   <option value="price-high">💰 High to Low</option>
//                   <option value="price-low">💰 Low to High</option>
//                   <option value="discount">🎯 Discount</option>
//                 </select>
//               </div>
//               <div className="text-sm text-gray-600">
//                 📊 {filteredProducts.length} products found
//               </div>
//             </div>

//             {/* Products Grid */}
//             {selectedCategoryIds.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 <div className="text-6xl mb-4">📁</div>
//                 <p className="text-lg mb-4">Select a category to view products</p>
//                 <button
//                   onClick={onAddProduct}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//                 >
//                   ➕ Add Your First Product
//                 </button>
//               </div>
//             ) : loading ? (
//               <div className="flex justify-center items-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               </div>
//             ) : filteredProducts.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 <div className="text-6xl mb-4">😔</div>
//                 <p className="text-lg mb-2">No products found</p>
//                 <p className="text-sm mb-4">Try selecting different categories or search terms</p>
//                 <button
//                   onClick={onAddProduct}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//                 >
//                   ➕ Add New Product
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
//                 {filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product.id}
//                     product={product}
//                     onEdit={setEditProduct}
//                     onDelete={handleDelete}
//                     onViewImages={setImagePopup}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Image Popup */}
//       {imagePopup && (
//         <ImagePopup images={imagePopup} onClose={() => setImagePopup(null)} />
//       )}

//       {/* Edit Product Panel */}
//       {editProduct && (
//         <EditProductPanel
//           product={editProduct}
//           onClose={() => setEditProduct(null)}
//           onSave={() => {
//             setEditProduct(null);
//             fetchProducts();
//           }}
//           categories={categories}
//         />
//       )}
//     </div>
//   );
// };

// // ==================== PRODUCT CARD COMPONENT ====================
// const ProductCard = ({ product, onEdit, onDelete, onViewImages }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const mainImage = product.product_details.images?.[0] || '';

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
//       {/* Product Image */}
//       <div className="relative overflow-hidden">
//         <img
//           src={mainImage ? `https://apichandra.rxsquare.in${mainImage}` : '/api/placeholder/300/200'}
//           alt={product.name}
//           className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
//           onError={(e) => {
//             e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
//           }}
//         />
        
//         {/* Discount Badge */}
//         {product.product_details.discount > 0 && (
//           <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
//             🎯 {product.product_details.discount}% OFF
//           </div>
//         )}

//         {/* Image Count Badge */}
//         {product.product_details.images?.length > 0 && (
//           <button
//             onClick={() => onViewImages(product.product_details.images)}
//             className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm hover:bg-opacity-90 transition-colors"
//             title="View Images"
//           >
//             📷 {product.product_details.images.length}
//           </button>
//         )}

//         {/* Action Overlay */}
//         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
//           <div className="flex gap-2">
//             <button
//               onClick={() => onEdit(product)}
//               className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110 shadow-lg"
//               title="Edit Product"
//             >
//               <span className="text-lg">✏️</span>
//             </button>
//             <button
//               onClick={() => onDelete(product.id)}
//               className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110 shadow-lg"
//               title="Delete Product"
//             >
//               <span className="text-lg">🗑️</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Product Info */}
//       <div className="p-4">
//         {/* Header with Expand Toggle */}
//         <div className="flex justify-between items-start mb-3">
//           <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm leading-tight">
//             {product.name}
//           </h3>
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="ml-2 text-gray-500 hover:text-gray-700 text-xs p-1 hover:bg-gray-100 rounded transition-colors"
//             title={isExpanded ? "Collapse" : "Expand"}
//           >
//             {isExpanded ? '▲' : '▼'}
//           </button>
//         </div>

//         {/* Slug */}
//         <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
//           <span>🔗</span>
//           {product.slug}
//         </p>

//         {/* Price */}
//         <div className="flex items-center gap-2 mb-3">
//           <span className="text-lg font-bold text-green-600 flex items-center gap-1">
//             <span>💰</span>
//             ₹{product.product_details.price?.toLocaleString()}
//           </span>
//           {product.product_details.originalPrice > product.product_details.price && (
//             <span className="text-sm text-gray-500 line-through">
//               ₹{product.product_details.originalPrice?.toLocaleString()}
//             </span>
//           )}
//         </div>

//         {/* Category & Gender */}
//         <div className="flex flex-wrap gap-1 mb-3">
//           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
//             <span>📂</span>
//             {product.product_details.category}
//           </span>
//           {product.product_details.gender?.map(gender => (
//             <span key={gender} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
//               <span>👤</span>
//               {gender}
//             </span>
//           ))}
//         </div>

//         {/* Expanded Details */}
//         {isExpanded && (
//           <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 animate-slideDown">
//             {/* Featured Tags */}
//             {product.product_details.featured?.length > 0 && (
//               <div>
//                 <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
//                   <span>⭐</span>
//                   Featured:
//                 </p>
//                 <div className="flex flex-wrap gap-1">
//                   {product.product_details.featured.map((tag, idx) => (
//                     <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Style & Metal */}
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div className="flex items-center gap-1">
//                 <span className="text-gray-600">🎨</span>
//                 <span className="font-medium truncate" title={product.product_details.style_id}>
//                   {product.product_details.style_id || 'N/A'}
//                 </span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <span className="text-gray-600">💎</span>
//                 <span className="font-medium truncate" title={product.product_details.metal_id}>
//                   {product.product_details.metal_id || 'N/A'}
//                 </span>
//               </div>
//             </div>

//             {/* Description */}
//             {product.product_details.description && (
//               <div>
//                 <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
//                   <span>📝</span>
//                   Description:
//                 </p>
//                 <p className="text-xs font-medium line-clamp-2 text-gray-700">
//                   {product.product_details.description}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Quick Actions - Mobile */}
//         <div className="flex lg:hidden gap-2 mt-3 pt-3 border-t border-gray-200">
//           <button
//             onClick={() => onEdit(product)}
//             className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
//           >
//             <span>✏️</span>
//             <span>Edit</span>
//           </button>
//           <button
//             onClick={() => onDelete(product.id)}
//             className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
//           >
//             <span>🗑️</span>
//             <span>Delete</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==================== IMAGE POPUP COMPONENT ====================
// const ImagePopup = ({ images, onClose }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const nextImage = () => {
//     setCurrentIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
//       <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
//         <button
//           onClick={onClose}
//           className="absolute -top-12 right-0 text-white text-2xl z-10 hover:text-gray-300 transition-colors"
//         >
//           ✕
//         </button>
        
//         <div className="relative">
//           <img
//             src={`https://apichandra.rxsquare.in${images[currentIndex]}`}
//             alt={`Product ${currentIndex + 1}`}
//             className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
//           />
          
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={(e) => { e.stopPropagation(); prevImage(); }}
//                 className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
//               >
//                 ‹
//               </button>
//               <button
//                 onClick={(e) => { e.stopPropagation(); nextImage(); }}
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
//               >
//                 ›
//               </button>
//             </>
//           )}
//         </div>

//         {/* Thumbnails */}
//         {images.length > 1 && (
//           <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
//             {images.map((img, idx) => (
//               <button
//                 key={idx}
//                 onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
//                 className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg transition-all ${
//                   idx === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-400'
//                 }`}
//               >
//                 <img
//                   src={`https://apichandra.rxsquare.in${img}`}
//                   alt={`Thumb ${idx + 1}`}
//                   className="w-full h-full object-cover rounded"
//                 />
//               </button>
//             ))}
//           </div>
//         )}

//         <div className="text-white text-center mt-3 font-medium">
//           {currentIndex + 1} / {images.length}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==================== EDIT PRODUCT PANEL ====================
// const EditProductPanel = ({ product, onClose, onSave, categories }) => {
//   const [formData, setFormData] = useState({
//     name: product.name,
//     slug: product.slug,
//     description: product.product_details.description || '',
//     price: product.product_details.price,
//     originalPrice: product.product_details.originalPrice,
//     discount: product.product_details.discount,
//     featured: product.product_details.featured || [],
//     gender: product.product_details.gender || [],
//     style_id: product.product_details.style_id || '',
//     metal_id: product.product_details.metal_id || '',
//     category_id: product.category_id || '',
//     // Variant configuration
//     hasMetalChoice: product.product_details.hasMetalChoice || false,
//     hasDiamondChoice: product.product_details.hasDiamondChoice || false,
//     selectedMetalOptions: product.product_details.selectedMetalOptions || [],
//     selectedDiamondOptions: product.product_details.selectedDiamondOptions || [],
//     selectedSizes: product.product_details.selectedSizes || {},
//     variantPricing: product.product_details.variantPricing || {}
//   });

//   const [categoryData, setCategoryData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [imageUrls, setImageUrls] = useState(product.product_details.images || []);
//   const [activeVariantTab, setActiveVariantTab] = useState('basic');

//   const FILE_TYPE_OPTIONS = ['STL File', 'CAM Product', 'Rubber Mold', 'Casting Model'];

//   // Fetch category details when category changes
//   useEffect(() => {
//     if (formData.category_id) {
//       fetchCategoryDetails(formData.category_id);
//     }
//   }, [formData.category_id]);

//   const fetchCategoryDetails = async (catId) => {
//     setLoading(true);
//     const token = localStorage.getItem('token');
    
//     try {
//       const [stylesRes, metalsRes, attributesRes] = await Promise.all([
//         axios.post(`${API_URL}/doAll`, {
//           action: 'get',
//           table: 'by_style',
//           where: { category_id: catId }
//         }, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.post(`${API_URL}/doAll`, {
//           action: 'get',
//           table: 'by_metal_and_stone',
//           where: { category_id: catId }
//         }, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${API_URL}/attributes`, {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//       ]);

//       const attributes = {
//         metal: { id: null, options: [] },
//         diamond: { id: null, options: [] },
//         size: { id: null, options: [] }
//       };
      
//       if (attributesRes.data.success) {
//         attributesRes.data.data.forEach(attr => {
//           attributes[attr.type] = { id: attr.id, options: attr.options };
//         });
//       }

//       setCategoryData({
//         styles: stylesRes.data.data,
//         metals: metalsRes.data.data,
//         attributes: attributes
//       });
//     } catch (error) {
//       console.error('Error fetching category details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageSelect = (files) => {
//     const fileArray = Array.from(files);
//     const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
//     setImageFiles(prev => [...prev, ...fileArray]);
//     setImageUrls(prev => [...prev, ...newImageUrls]);
//   };

//   const removeImage = (index) => {
//     setImageFiles(prev => prev.filter((_, i) => i !== index));
//     setImageUrls(prev => prev.filter((_, i) => i !== index));
//   };

//   const toggleFeatured = (feature) => {
//     setFormData(prev => ({
//       ...prev,
//       featured: prev.featured.includes(feature)
//         ? prev.featured.filter(f => f !== feature)
//         : [...prev.featured, feature]
//     }));
//   };

//   const toggleGender = (gender) => {
//     setFormData(prev => ({
//       ...prev,
//       gender: prev.gender.includes(gender)
//         ? prev.gender.filter(g => g !== gender)
//         : [...prev.gender, gender]
//     }));
//   };

//   const toggleMetalChoice = () => {
//     setFormData(prev => ({
//       ...prev,
//       hasMetalChoice: !prev.hasMetalChoice,
//       selectedMetalOptions: !prev.hasMetalChoice ? [] : prev.selectedMetalOptions
//     }));
//   };

//   const toggleDiamondChoice = () => {
//     setFormData(prev => ({
//       ...prev,
//       hasDiamondChoice: !prev.hasDiamondChoice,
//       selectedDiamondOptions: !prev.hasDiamondChoice ? [] : prev.selectedDiamondOptions
//     }));
//   };

//   const toggleMetalOption = (optionId) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedMetalOptions: prev.selectedMetalOptions.includes(optionId)
//         ? prev.selectedMetalOptions.filter(id => id !== optionId)
//         : [...prev.selectedMetalOptions, optionId]
//     }));
//   };

//   const toggleDiamondOption = (optionId) => {
//     setFormData(prev => ({
//       ...prev,
//       selectedDiamondOptions: prev.selectedDiamondOptions.includes(optionId)
//         ? prev.selectedDiamondOptions.filter(id => id !== optionId)
//         : [...prev.selectedDiamondOptions, optionId]
//     }));
//   };

//   const toggleSize = (metalId, diamondId, sizeId) => {
//     const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//     setFormData(prev => ({
//       ...prev,
//       selectedSizes: {
//         ...prev.selectedSizes,
//         [key]: !prev.selectedSizes[key]
//       }
//     }));
//   };

//   const updateVariantPricing = (metalId, diamondId, sizeId, field, value) => {
//     const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//     setFormData(prev => ({
//       ...prev,
//       variantPricing: {
//         ...prev.variantPricing,
//         [key]: {
//           ...prev.variantPricing[key],
//           [field]: value
//         }
//       }
//     }));
//   };

//   const toggleVariantFileType = (metalId, diamondId, sizeId, fileType) => {
//     const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//     const current = formData.variantPricing[key] || {};
//     const currentFiles = current.file_types || [];
//     const newFiles = currentFiles.includes(fileType)
//       ? currentFiles.filter(f => f !== fileType)
//       : [...currentFiles, fileType];
    
//     setFormData(prev => ({
//       ...prev,
//       variantPricing: {
//         ...prev.variantPricing,
//         [key]: {
//           ...current,
//           file_types: newFiles
//         }
//       }
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const token = localStorage.getItem('token');

//     try {
//       let uploadedImageUrls = [...imageUrls.filter(url => !url.startsWith('blob:'))];

//       // Upload new images
//       if (imageFiles.length > 0) {
//         const formData = new FormData();
//         imageFiles.forEach(file => {
//           formData.append('images', file);
//         });

//         const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data'
//           }
//         });


//         if (uploadRes.data.success) {
//           uploadedImageUrls = [...uploadedImageUrls, ...uploadRes.data.data.images.map(img => img.url)];
//         }
//       }

//       const productDetails = {
//         ...product.product_details,
//         description: formData.description,
//         price: parseFloat(formData.price),
//         originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
//         discount: parseInt(formData.discount) || 0,
//         featured: formData.featured,
//         gender: formData.gender,
//         style_id: formData.style_id,
//         metal_id: formData.metal_id,
//         images: uploadedImageUrls,
//         category: categories.find(c => c.id == formData.category_id)?.name || '',
//         // Variant configuration
//         hasMetalChoice: formData.hasMetalChoice,
//         hasDiamondChoice: formData.hasDiamondChoice,
//         selectedMetalOptions: formData.selectedMetalOptions,
//         selectedDiamondOptions: formData.selectedDiamondOptions,
//         selectedSizes: formData.selectedSizes,
//         variantPricing: formData.variantPricing
//       };

//       // Update main product
//       const response = await axios.post(
//         `${API_URL}/products/update`,
//         {
//           product_id: product.id,
//           category_id: formData.category_id,
//           name: formData.name,
//           slug: formData.slug,
//           product_details: productDetails
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         // Update variants if any
//         const variants = [];
//         for (const [key, isSelected] of Object.entries(formData.selectedSizes)) {
//           if (!isSelected) continue;

//           const pricing = formData.variantPricing[key];
//           if (!pricing || !pricing.original_price) continue;

//           const [metalPart, diamondPart, sizePart] = key.split('-');
          
//           variants.push({
//             metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
//             diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
//             size_option_id: parseInt(sizePart),
//             original_price: parseFloat(pricing.original_price),
//             discount_price: parseFloat(pricing.discount_price) || parseFloat(pricing.original_price),
//             discount_percentage: parseInt(pricing.discount_percentage) || 0,
//             file_types: pricing.file_types || []
//           });
//         }

//         if (variants.length > 0) {
//           await axios.post(
//             `${API_URL}/product-variants/pricing`,
//             { product_id: product.id, variants },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//         }

//         alert('✅ Product updated successfully');
//         onSave();
//       }
//     } catch (error) {
//       console.error('Error updating product:', error);
//       alert('❌ Error updating product');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const renderVariantConfiguration = () => (
//     <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
//       <h5 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
//         ⚙️ Variant Configuration (Optional)
//       </h5>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//         {/* Choice of Metal */}
//         <div className="border-2 border-gray-200 rounded p-3">
//           <label className="flex items-center gap-2 mb-3 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={formData.hasMetalChoice}
//               onChange={toggleMetalChoice}
//               className="w-5 h-5"
//             />
//             <span className="font-bold">🔩 Choice of Metal</span>
//           </label>
          
//           {formData.hasMetalChoice && (
//             <div className="space-y-2">
//               {categoryData?.attributes?.metal?.options?.map(opt => (
//                 <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
//                   <input
//                     type="checkbox"
//                     checked={formData.selectedMetalOptions.includes(opt.id)}
//                     onChange={() => toggleMetalOption(opt.id)}
//                     className="w-4 h-4"
//                   />
//                   <span className="text-sm">{opt.option_name}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Diamond Quality */}
//         <div className="border-2 border-gray-200 rounded p-3">
//           <label className="flex items-center gap-2 mb-3 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={formData.hasDiamondChoice}
//               onChange={toggleDiamondChoice}
//               className="w-5 h-5"
//             />
//             <span className="font-bold">💎 Diamond Quality</span>
//           </label>
          
//           {formData.hasDiamondChoice && (
//             <div className="space-y-2">
//               {categoryData?.attributes?.diamond?.options?.map(opt => (
//                 <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
//                   <input
//                     type="checkbox"
//                     checked={formData.selectedDiamondOptions.includes(opt.id)}
//                     onChange={() => toggleDiamondOption(opt.id)}
//                     className="w-4 h-4"
//                   />
//                   <span className="text-sm">{opt.option_name}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Size Info */}
//         <div className="border-2 border-blue-300 rounded p-3 bg-blue-50">
//           <h6 className="font-bold mb-2">📏 Sizes</h6>
//           <p className="text-xs text-gray-600">Configure sizes below with pricing details</p>
//         </div>
//       </div>

//       {/* Size & Pricing Configuration */}
//       <div className="mt-4">
//         <h6 className="font-bold mb-3">📐 Configure Sizes & Pricing:</h6>
        
//         {/* Size Only (No Metal/Diamond) */}
//         {!formData.hasMetalChoice && !formData.hasDiamondChoice && (
//           <div className="space-y-3">
//             {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//               const key = `none-none-${sizeOpt.id}`;
//               const isSelected = formData.selectedSizes[key];
//               const pricing = formData.variantPricing[key] || {};
              
//               return (
//                 <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3">
//                   <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={isSelected || false}
//                       onChange={() => toggleSize(null, null, sizeOpt.id)}
//                       className="w-5 h-5"
//                     />
//                     <span className="font-bold">
//                       {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                     </span>
//                   </label>

//                   {isSelected && (
//                     <div className="ml-8 space-y-3">
//                       <div className="grid grid-cols-3 gap-3">
//                         <div>
//                           <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
//                           <input
//                             type="number"
//                             placeholder="15000"
//                             value={pricing.original_price || ''}
//                             onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'original_price', e.target.value)}
//                             className="w-full px-2 py-1 border rounded text-sm"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
//                           <input
//                             type="number"
//                             placeholder="13000"
//                             value={pricing.discount_price || ''}
//                             onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'discount_price', e.target.value)}
//                             className="w-full px-2 py-1 border rounded text-sm"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
//                           <input
//                             type="number"
//                             placeholder="13"
//                             value={pricing.discount_percentage || ''}
//                             onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'discount_percentage', e.target.value)}
//                             className="w-full px-2 py-1 border rounded text-sm"
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-xs font-medium mb-2">📁 File Types:</label>
//                         <div className="grid grid-cols-2 gap-2">
//                           {FILE_TYPE_OPTIONS.map(fileType => (
//                             <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={pricing.file_types?.includes(fileType) || false}
//                                 onChange={() => toggleVariantFileType(null, null, sizeOpt.id, fileType)}
//                                 className="w-4 h-4"
//                               />
//                               <span>{fileType}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Metal Only (No Diamond) */}
//         {formData.hasMetalChoice && !formData.hasDiamondChoice && formData.selectedMetalOptions.map(metalId => {
//           const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
//           return (
//             <div key={metalId} className="mb-4 border-2 border-blue-200 rounded p-4 bg-blue-50">
//               <h6 className="font-bold mb-3">{metalOpt?.option_name}</h6>
//               <div className="space-y-3">
//                 {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//                   const key = `${metalId}-none-${sizeOpt.id}`;
//                   const isSelected = formData.selectedSizes[key];
//                   const pricing = formData.variantPricing[key] || {};
                  
//                   return (
//                     <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
//                       <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={isSelected || false}
//                           onChange={() => toggleSize(metalId, null, sizeOpt.id)}
//                           className="w-5 h-5"
//                         />
//                         <span className="font-bold">
//                           {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                         </span>
//                       </label>

//                       {isSelected && (
//                         <div className="ml-8 space-y-3">
//                           <div className="grid grid-cols-3 gap-3">
//                             <div>
//                               <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
//                               <input
//                                 type="number"
//                                 placeholder="15000"
//                                 value={pricing.original_price || ''}
//                                 onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'original_price', e.target.value)}
//                                 className="w-full px-2 py-1 border rounded text-sm"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
//                               <input
//                                 type="number"
//                                 placeholder="13000"
//                                 value={pricing.discount_price || ''}
//                                 onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'discount_price', e.target.value)}
//                                 className="w-full px-2 py-1 border rounded text-sm"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
//                               <input
//                                 type="number"
//                                 placeholder="13"
//                                 value={pricing.discount_percentage || ''}
//                                 onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'discount_percentage', e.target.value)}
//                                 className="w-full px-2 py-1 border rounded text-sm"
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <label className="block text-xs font-medium mb-2">📁 File Types:</label>
//                             <div className="grid grid-cols-2 gap-2">
//                               {FILE_TYPE_OPTIONS.map(fileType => (
//                                 <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
//                                   <input
//                                     type="checkbox"
//                                     checked={pricing.file_types?.includes(fileType) || false}
//                                     onChange={() => toggleVariantFileType(metalId, null, sizeOpt.id, fileType)}
//                                     className="w-4 h-4"
//                                   />
//                                   <span>{fileType}</span>
//                                 </label>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           );
//         })}

//         {/* Metal + Diamond */}
//         {formData.hasMetalChoice && formData.hasDiamondChoice && formData.selectedMetalOptions.map(metalId => {
//           const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
//           return formData.selectedDiamondOptions.map(diamondId => {
//             const diamondOpt = categoryData?.attributes?.diamond?.options?.find(o => o.id === diamondId);
//             return (
//               <div key={`${metalId}-${diamondId}`} className="mb-4 border-2 border-purple-200 rounded p-4 bg-purple-50">
//                 <h6 className="font-bold mb-3">{metalOpt?.option_name} + {diamondOpt?.option_name}</h6>
//                 <div className="space-y-3">
//                   {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//                     const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
//                     const isSelected = formData.selectedSizes[key];
//                     const pricing = formData.variantPricing[key] || {};
                    
//                     return (
//                       <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
//                         <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={isSelected || false}
//                             onChange={() => toggleSize(metalId, diamondId, sizeOpt.id)}
//                             className="w-5 h-5"
//                           />
//                           <span className="font-bold">
//                             {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                           </span>
//                         </label>

//                         {isSelected && (
//                           <div className="ml-8 space-y-3">
//                             <div className="grid grid-cols-3 gap-3">
//                               <div>
//                                 <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
//                                 <input
//                                   type="number"
//                                   placeholder="15000"
//                                   value={pricing.original_price || ''}
//                                   onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'original_price', e.target.value)}
//                                   className="w-full px-2 py-1 border rounded text-sm"
//                                 />
//                               </div>
//                               <div>
//                                 <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
//                                 <input
//                                   type="number"
//                                   placeholder="13000"
//                                   value={pricing.discount_price || ''}
//                                   onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'discount_price', e.target.value)}
//                                   className="w-full px-2 py-1 border rounded text-sm"
//                                 />
//                               </div>
//                               <div>
//                                 <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
//                                 <input
//                                   type="number"
//                                   placeholder="13"
//                                   value={pricing.discount_percentage || ''}
//                                   onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'discount_percentage', e.target.value)}
//                                   className="w-full px-2 py-1 border rounded text-sm"
//                                 />
//                               </div>
//                             </div>

//                             <div>
//                               <label className="block text-xs font-medium mb-2">📁 File Types:</label>
//                               <div className="grid grid-cols-2 gap-2">
//                                 {FILE_TYPE_OPTIONS.map(fileType => (
//                                   <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
//                                     <input
//                                       type="checkbox"
//                                       checked={pricing.file_types?.includes(fileType) || false}
//                                       onChange={() => toggleVariantFileType(metalId, diamondId, sizeOpt.id, fileType)}
//                                       className="w-4 h-4"
//                                     />
//                                     <span>{fileType}</span>
//                                   </label>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           });
//         })}
//       </div>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
//       <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
//           <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
//             <span>✏️</span>
//             Edit Product - {product.name}
//           </h3>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl p-1 transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="border-b border-gray-200 bg-white">
//           <nav className="flex space-x-1 px-4 overflow-x-auto">
//             {['basic', 'variants'].map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveVariantTab(tab)}
//                 className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                   activeVariantTab === tab
//                     ? 'border-blue-500 text-blue-600 bg-blue-50'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <span>{tab === 'basic' ? '📋' : '⚙️'}</span>
//                 <span>{tab === 'basic' ? 'Basic Information' : 'Variant Configuration'}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-3 sm:p-4">
//           {activeVariantTab === 'basic' ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//               {/* Left Column - Basic Info */}
//               <div className="space-y-4 sm:space-y-6">
//                 {/* Category Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <span>📂</span>
//                     Category *
//                   </label>
//                   <select
//                     value={formData.category_id}
//                     onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map(cat => (
//                       <option key={cat.id} value={cat.id}>{cat.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Basic Info Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>📝</span>
//                       Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ 
//                         ...formData, 
//                         name: e.target.value, 
//                         slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
//                       })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                       placeholder="Product name"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>🔗</span>
//                       Slug
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.slug}
//                       onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                       readOnly
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>🎨</span>
//                       Style *
//                     </label>
//                     <select
//                       value={formData.style_id}
//                       onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                       disabled={!categoryData}
//                     >
//                       <option value="">Select Style</option>
//                       {categoryData?.styles.map(style => (
//                         <option key={style.id} value={style.id}>{style.name}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>💎</span>
//                       Metal/Stone *
//                     </label>
//                     <select
//                       value={formData.metal_id}
//                       onChange={(e) => setFormData({ ...formData, metal_id: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                       disabled={!categoryData}
//                     >
//                       <option value="">Select Metal</option>
//                       {categoryData?.metals.map(metal => (
//                         <option key={metal.id} value={metal.id}>{metal.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <span>📄</span>
//                     Description
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     rows="3"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     placeholder="Product description..."
//                   />
//                 </div>

//                 {/* Pricing Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>💰</span>
//                       Price *
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.price}
//                       onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>📊</span>
//                       Original Price
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.originalPrice}
//                       onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <span>🎯</span>
//                       Discount %
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.discount}
//                       onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Features & Images */}
//               <div className="space-y-4 sm:space-y-6">
//                 {/* Featured Options */}
//                 <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                     <span>⭐</span>
//                     Featured Tags
//                   </label>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                     {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
//                       <label key={feature} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
//                         <input
//                           type="checkbox"
//                           checked={formData.featured.includes(feature)}
//                           onChange={() => toggleFeatured(feature)}
//                           className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-sm">{feature}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Gender Selection */}
//                 <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                     <span>👥</span>
//                     Target Gender/Age
//                   </label>
//                   <div className="flex flex-wrap gap-4">
//                     {['Kids', 'Men', 'Women'].map(gender => (
//                       <label key={gender} className="flex items-center gap-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={formData.gender.includes(gender)}
//                           onChange={() => toggleGender(gender)}
//                           className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-sm">{gender}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Image Management */}
//                 <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                     <span>🖼️</span>
//                     Product Images
//                   </label>
                  
//                   {/* Image Upload */}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     onChange={(e) => handleImageSelect(e.target.files)}
//                     className="w-full text-sm mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
//                   />

//                   {/* Image Previews */}
//                   {imageUrls.length > 0 && (
//                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
//                       {imageUrls.map((url, idx) => (
//                         <div key={idx} className="relative group">
//                           <img 
//                             src={url.startsWith('blob:') ? url : `https://apichandra.rxsquare.in${url}`}
//                             alt={`Preview ${idx + 1}`}
//                             className="h-20 w-full object-cover rounded border shadow-sm group-hover:shadow-md transition-all"
//                           />
//                           <button
//                             onClick={() => removeImage(idx)}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             renderVariantConfiguration()
//           )}
//         </div>

//         {/* Footer Actions */}
//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
//           >
//             {saving ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <span>💾</span>
//                 Save Changes
//               </>
//             )}
//           </button>
//           <button
//             onClick={onClose}
//             className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold text-sm sm:text-base transition-colors"
//           >
//             <span>❌</span>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// // ==================== ADD PRODUCTS COMPONENT ====================
// // (Keep the existing AddProducts component as it is, as it's quite long)
// // The AddProducts component remains the same as in your original code


// const AddProducts = ({ onBack, categories, onRefresh }) => {
//   const [selectedCategoryId, setSelectedCategoryId] = useState('');
//   const [categoryData, setCategoryData] = useState(null);
//   const [selectedStyles, setSelectedStyles] = useState([]);
//   const [selectedMetals, setSelectedMetals] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeProductTab, setActiveProductTab] = useState(0);
//   const [uploadedPdfFiles, setUploadedPdfFiles] = useState({});
//   const [slugErrors, setSlugErrors] = useState({});

  
// const FILE_TYPE_OPTIONS = [
//   { value: 'stl_file', label: 'STL File', emoji: '📄', requiresPrice: true, requiresUpload: true },
//   { value: 'cam_product', label: 'CAM Product', emoji: '⚙️', requiresPrice: true, requiresUpload: true },
//   { value: 'rubber_mold', label: 'Rubber Mold', emoji: '🔧', requiresPrice: false, requiresUpload: false },
//   { value: 'casting_model', label: 'Casting Model', emoji: '🏭', requiresPrice: false, requiresUpload: false },
//   { value: 'finished_product', label: 'Finished Product', emoji: '✨', requiresPrice: false, requiresUpload: false },
// ];


//   // ✅ NEW: Check slug uniqueness
//   const checkSlugUniqueness = async (slug, productId = null) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${API_URL}/products/check-slug`,
//         { slug, product_id: productId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       return response.data.exists;
//     } catch (error) {
//       console.error('Slug check error:', error);
//       return false;
//     }
//   };


//   const fetchCategoryDetails = async (catId) => {
//     setLoading(true);
//     const token = localStorage.getItem('token');
    
//     try {
//       const [stylesRes, metalsRes, attributesRes] = await Promise.all([
//         axios.post(`${API_URL}/doAll`, {
//           action: 'get',
//           table: 'by_style',
//           where: { category_id: catId }
//         }, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.post(`${API_URL}/doAll`, {
//           action: 'get',
//           table: 'by_metal_and_stone',
//           where: { category_id: catId }
//         }, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${API_URL}/attributes`, {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//       ]);

//       const attributes = {
//         metal: { id: null, options: [] },
//         diamond: { id: null, options: [] },
//         size: { id: null, options: [] }
//       };
      
//       if (attributesRes.data.success) {
//         attributesRes.data.data.forEach(attr => {
//           attributes[attr.type] = { id: attr.id, options: attr.options };
//         });
//       }

//       setCategoryData({
//         styles: stylesRes.data.data,
//         metals: metalsRes.data.data,
//         attributes: attributes
//       });
//     } catch (error) {
//       console.error('Error fetching category details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategorySelect = (catId) => {
//     setSelectedCategoryId(catId);
//     setSelectedStyles([]);
//     setSelectedMetals([]);
//     setProducts([]);
//     setActiveProductTab(0);
//     if (catId) fetchCategoryDetails(catId);
//   };

//   const toggleStyle = (styleId) => {
//     setSelectedStyles(prev =>
//       prev.includes(styleId) ? prev.filter(id => id !== styleId) : [...prev, styleId]
//     );
//   };

//   const toggleMetal = (metalId) => {
//     setSelectedMetals(prev =>
//       prev.includes(metalId) ? prev.filter(id => id !== metalId) : [...prev, metalId]
//     );
//   };

//   const addProductRow = () => {
//     const defaultStyle = selectedStyles.length > 0 ? selectedStyles[0] : '';
//     const defaultMetal = selectedMetals.length > 0 ? selectedMetals[0] : '';
    
//     const newProduct = {
//       id: Date.now(),
//       name: '',
//       description: '',
//       slug: '',
//       style_id: defaultStyle,
//       metal_id: defaultMetal,
//       price: '',
//       originalPrice: '',
//       discount: 0,
//       featured: [],
//       gender: [],
//       imageFiles: [],
//       imageUrls: [],
//       pdfFiles: {},
//       hasMetalChoice: false,
//       hasDiamondChoice: false,
//       selectedMetalOptions: [],
//       selectedDiamondOptions: [],
//       metalSizeConfig: {},  // { metalId: true/false } - tracks if metal uses sizes
//       diamondSizeConfig: {},  // { metalId-diamondId: true/false }
//       metalOnlyFiles: {},  // Files for metals without size configuration
//       diamondOnlyFiles: {},  // Files for metal+diamond without size configuration
//       selectedSizes: {},
//       variantPricing: {},
//       configureSizes: false,
//     };
    
//     setProducts([...products, newProduct]);
//     setActiveProductTab(products.length);
//   };


//   // Toggle size configuration for a metal option
// const toggleMetalSizeConfig = (productId, metalId) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       return {
//         ...p,
//         metalSizeConfig: {
//           ...p.metalSizeConfig,
//           [metalId]: !p.metalSizeConfig[metalId]
//         }
//       };
//     }
//     return p;
//   }));
// };

// // Toggle size configuration for metal+diamond combination
// const toggleDiamondSizeConfig = (productId, metalId, diamondId) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       const key = `${metalId}-${diamondId}`;
//       return {
//         ...p,
//         diamondSizeConfig: {
//           ...p.diamondSizeConfig,
//           [key]: !p.diamondSizeConfig[key]
//         }
//       };
//     }
//     return p;
//   }));
// };

//   const removeProduct = (productId) => {
//     setProducts(products.filter(p => p.id !== productId));
//     if (activeProductTab >= products.length - 1) {
//       setActiveProductTab(Math.max(0, products.length - 2));
//     }
//   };

//   // const updateProduct = (id, field, value) => {
//   //   setProducts(products.map(p => {
//   //     if (p.id === id) {
//   //       const updated = { ...p, [field]: value };
//   //       if (field === 'name') {
//   //         updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//   //       }
//   //       return updated;
//   //     }
//   //     return p;
//   //   }));
//   // };


// const toggleConfigureSizes = (productId) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       return {
//         ...p,
//         configureSizes: !p.configureSizes
//       };
//     }
//     return p;
//   }));
// };

//    // ✅ UPDATED: Handle name change with slug generation and uniqueness check
//   const updateProduct = async (id, field, value) => {
//     setProducts(products.map(p => {
//       if (p.id === id) {
//         const updated = { ...p, [field]: value };
        
//         if (field === 'name') {
//           const newSlug = value.toLowerCase()
//             .replace(/\s+/g, '-')
//             .replace(/[^a-z0-9-]/g, '');
//           updated.slug = newSlug;
          
//           // Check slug uniqueness
//           checkSlugUniqueness(newSlug).then(exists => {
//             setSlugErrors(prev => ({
//               ...prev,
//               [id]: exists ? 'This slug already exists. Please create a unique one.' : ''
//             }));
//           });
//         }
        
//         // If manually editing slug, check uniqueness
//         if (field === 'slug') {
//           checkSlugUniqueness(value).then(exists => {
//             setSlugErrors(prev => ({
//               ...prev,
//               [id]: exists ? 'This slug already exists. Please create a unique one.' : ''
//             }));
//           });
//         }
        
//         return updated;
//       }
//       return p;
//     }));
//   };

//   const toggleProductFeatured = (productId, feature) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         const featured = p.featured.includes(feature)
//           ? p.featured.filter(f => f !== feature)
//           : [...p.featured, feature];
//         return { ...p, featured };
//       }
//       return p;
//     }));
//   };

//   const toggleProductGender = (productId, gender) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         const genders = p.gender.includes(gender)
//           ? p.gender.filter(g => g !== gender)
//           : [...p.gender, gender];
//         return { ...p, gender: genders };
//       }
//       return p;
//     }));
//   };

//   // ✅ ADD THIS NEW FUNCTION:
// const handlePdfFileSelect = (productId, metalId, diamondId, sizeId, fileType, file) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//       const fileKey = `${key}-${fileType}`;
      
//       return {
//         ...p,
//         pdfFiles: {
//           ...p.pdfFiles,
//           [fileKey]: file
//         }
//       };
//     }
//     return p;
//   }));
// };

//   //   const handleImageSelect = (productId, files) => {
//   //     const fileArray = Array.from(files);
//   //     setProducts(products.map(p => {
//   //       if (p.id === productId) {
//   //         const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
//   //         return {
//   //           ...p,
//   //           imageFiles: [...p.imageFiles, ...fileArray],
//   //           imageUrls: [...p.imageUrls, ...newImageUrls]
//   //         };
//   //       }
//   //       return p;
//   //     }));
//   //   };


//   // const removeImage = (productId, index) => {
//   //   setProducts(products.map(p => {
//   //     if (p.id === productId) {
//   //       return {
//   //         ...p,
//   //         imageFiles: p.imageFiles.filter((_, i) => i !== index),
//   //         imageUrls: p.imageUrls.filter((_, i) => i !== index)
//   //       };
//   //     }
//   //     return p;
//   //   }));
//   // };




// // ✅ Fixed Image preview with proper blob URL creation
// const handleImageSelect = (productId, files) => {
//   const fileArray = Array.from(files);
  
//   // Validate files
//   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
//   const validFiles = fileArray.filter(file => {
//     // Check file type
//     if (!file.type.startsWith('image/')) {
//       alert(`File "${file.name}" is not an image. Please select image files only.`);
//       return false;
//     }
    
//     // Check file size
//     if (file.size > MAX_FILE_SIZE) {
//       alert(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`);
//       return false;
//     }
    
//     return true;
//   });
  
//   if (validFiles.length === 0) return;
  
//   // Create preview URLs
//   const previewUrls = validFiles.map(file => {
//     try {
//       return URL.createObjectURL(file);
//     } catch (error) {
//       console.error('Error creating blob URL:', error);
//       return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="75" font-family="Arial" font-size="12" text-anchor="middle" fill="%236b7280">${file.name}</text></svg>`;
//     }
//   });
  
//   // Update state
//   setProducts(prevProducts => 
//     prevProducts.map(p => {
//       if (p.id === productId) {
//         return {
//           ...p,
//           imageFiles: [...p.imageFiles, ...validFiles],
//           imageUrls: [...p.imageUrls, ...previewUrls]
//         };
//       }
//       return p;
//     })
//   );
  
// };


// const removeImage = (productId, index) => {
//   setProducts(prevProducts => 
//     prevProducts.map(p => {
//       if (p.id === productId) {
//         // Revoke blob URL to prevent memory leaks
//         const urlToRevoke = p.imageUrls[index];
//         if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
//           try {
//             URL.revokeObjectURL(urlToRevoke);
//           } catch (error) {
//             console.error('Error revoking blob URL:', error);
//           }
//         }
        
//         return {
//           ...p,
//           imageFiles: p.imageFiles.filter((_, i) => i !== index),
//           imageUrls: p.imageUrls.filter((_, i) => i !== index)
//         };
//       }
//       return p;
//     })
//   );
// };


//   const handlePdfUpload = async (productId, metalId, diamondId, sizeId, fileType, file) => {
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
      
//       // Update product's variant pricing with file path
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

//   const toggleProductMetalChoice = (productId) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         return {
//           ...p,
//           hasMetalChoice: !p.hasMetalChoice,
//           selectedMetalOptions: !p.hasMetalChoice ? [] : p.selectedMetalOptions
//         };
//       }
//       return p;
//     }));
//   };

//   const toggleProductDiamondChoice = (productId) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         return {
//           ...p,
//           hasDiamondChoice: !p.hasDiamondChoice,
//           selectedDiamondOptions: !p.hasDiamondChoice ? [] : p.selectedDiamondOptions
//         };
//       }
//       return p;
//     }));
//   };

// const toggleProductMetalOption = (productId, optionId) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       const selectedMetalOptions = p.selectedMetalOptions.includes(optionId)
//         ? p.selectedMetalOptions.filter(id => id !== optionId)
//         : [...p.selectedMetalOptions, optionId];
      
//       const updatedProduct = { ...p, selectedMetalOptions };
      
//       // Auto-add STL file when metal option is selected
//       if (!p.selectedMetalOptions.includes(optionId)) {
//         const directKey = `${optionId}-none-none`;
//         const current = p.variantPricing[directKey] || {};
//         const currentFiles = current.files || [];
        
//         // Add STL if not already present
//         if (!currentFiles.some(f => f.file_type === 'stl_file')) {
//           updatedProduct.variantPricing = {
//             ...p.variantPricing,
//             [directKey]: {
//               ...current,
//               files: [...currentFiles, { file_type: 'stl_file', price: null }]
//             }
//           };
//         }
//       }
      
//       return updatedProduct;
//     }
//     return p;
//   }));
// };

//   const toggleProductDiamondOption = (productId, optionId) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         const selectedDiamondOptions = p.selectedDiamondOptions.includes(optionId)
//           ? p.selectedDiamondOptions.filter(id => id !== optionId)
//           : [...p.selectedDiamondOptions, optionId];
//         return { ...p, selectedDiamondOptions };
//       }
//       return p;
//     }));
//   };

//   // const toggleProductSize = (productId, metalId, diamondId, sizeId) => {
//   //   setProducts(products.map(p => {
//   //     if (p.id === productId) {
//   //       const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//   //       return {
//   //         ...p,
//   //         selectedSizes: {
//   //           ...p.selectedSizes,
//   //           [key]: !p.selectedSizes[key]
//   //         }
//   //       };
//   //     }
//   //     return p;
//   //   }));
//   // };


//    // ✅ UPDATED: Auto-select STL file for each size
//   const toggleProductSize = (productId, metalId, diamondId, sizeId) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//         const isSelecting = !p.selectedSizes[key];
        
//         const updated = {
//           ...p,
//           selectedSizes: {
//             ...p.selectedSizes,
//             [key]: isSelecting
//           }
//         };
        
//         // ✅ If selecting size, auto-add STL file as mandatory
//         if (isSelecting) {
//           const current = p.variantPricing[key] || {};
//           updated.variantPricing = {
//             ...p.variantPricing,
//             [key]: {
//               ...current,
//               files: [
//                 { file_type: 'stl_file', price: null } // Mandatory STL
//               ]
//             }
//           };
//         }
        
//         return updated;
//       }
//       return p;
//     }));
//   };

//   const updateVariantPricing = (productId, metalId, diamondId, sizeId, field, value) => {
//     setProducts(products.map(p => {
//       if (p.id === productId) {
//         const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
//         return {
//           ...p,
//           variantPricing: {
//             ...p.variantPricing,
//             [key]: {
//               ...p.variantPricing[key],
//               [field]: value
//             }
//           }
//         };
//       }
//       return p;
//     }));
//   };


// const updateFilePrice = (productId, metalId, diamondId, sizeId, fileType, price) => {
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       const key = sizeId
//         ? `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`
//         : `${metalId || 'none'}-${diamondId || 'none'}-none`;
      
//       const current = p.variantPricing[key] || {};
//       const currentFiles = current.files || [];
      
//       const updatedFiles = currentFiles.map(f => 
//         f.file_type === fileType ? { ...f, price: parseFloat(price) || null } : f
//       );
      
//       return {
//         ...p,
//         variantPricing: {
//           ...p.variantPricing,
//           [key]: {
//             ...current,
//             files: updatedFiles
//           }
//         }
//       };
//     }
//     return p;
//   }));
// };

// // REPLACE the existing toggleVariantFileType function with this:
// // const toggleVariantFileType = (productId, metalId, diamondId, sizeId, fileType) => {
// //   setProducts(products.map(p => {
// //     if (p.id === productId) {
// //       const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
// //       const current = p.variantPricing[key] || {};
// //       const currentFiles = current.files || [];
      
// //       const fileExists = currentFiles.some(f => f.file_type === fileType);
      
// //       const newFiles = fileExists
// //         ? currentFiles.filter(f => f.file_type !== fileType)
// //         : [...currentFiles, { file_type: fileType, price: null }];
      
// //       return {
// //         ...p,
// //         variantPricing: {
// //           ...p.variantPricing,
// //           [key]: {
// //             ...current,
// //             files: newFiles
// //           }
// //         }
// //       };
// //     }
// //     return p;
// //   }));
// // };

// const toggleVariantFileType = (productId, metalId, diamondId, sizeId, fileType) => {
//   // Prevent unchecking STL file
//   if (fileType === 'stl_file') {
//     alert('STL File is mandatory and cannot be removed');
//     return;
//   }
  
//   setProducts(products.map(p => {
//     if (p.id === productId) {
//       // Handle files without sizes (sizeId is null)
//       const key = sizeId 
//         ? `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`
//         : `${metalId || 'none'}-${diamondId || 'none'}-none`; // Special key for files without sizes
      
//       const current = p.variantPricing[key] || {};
//       const currentFiles = current.files || [];
      
//       const fileExists = currentFiles.some(f => f.file_type === fileType);
      
//       const newFiles = fileExists
//         ? currentFiles.filter(f => f.file_type !== fileType)
//         : [...currentFiles, { file_type: fileType, price: null }];
      
//       return {
//         ...p,
//         variantPricing: {
//           ...p.variantPricing,
//           [key]: {
//             ...current,
//             files: newFiles
//           }
//         }
//       };
//     }
//     return p;
//   }));
// };

//   const saveProducts = async () => {
//     if (products.length === 0) {
//       alert('Please add at least one product');
//       return;
//     }

//     for (const product of products) {
//       if (!product.name || !product.style_id || !product.metal_id ) {
//         alert('Please fill all required fields for all products');
//         return;
//       }
//     }

//     setLoading(true);
//     const token = localStorage.getItem('token');

//     try {
//       for (const product of products) {

//         let uploadedImageUrls = [];
//         if (product.imageFiles.length > 0) {
//           const formData = new FormData();
//           product.imageFiles.forEach(file => {
//             formData.append('images', file);
//           });

//           const uploadRes = await axios.post(`${API_URL}/upload-images`, formData, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'multipart/form-data'
//             }
//           });


//           // if (uploadRes.data.success) {
//           //   uploadedImageUrls = uploadRes.data.data.images.map(img => img.url);
//           // }

//           if (uploadRes.data.success && uploadRes.data.data && Array.isArray(uploadRes.data.data.images)) {
//             uploadedImageUrls = uploadRes.data.data.images.map(img => img.url);
//           }

//           // Upload PDF files
// const uploadedPdfFiles = {};
// if (product.pdfFiles && Object.keys(product.pdfFiles).length > 0) {
//   for (const [fileKey, pdfFile] of Object.entries(product.pdfFiles)) {
//     const pdfFormData = new FormData();
//     pdfFormData.append('file', pdfFile);
    
//     const pdfUploadRes = await axios.post(`${API_URL}/upload-pdf`, pdfFormData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data'
//       }
//     });
    
//     if (pdfUploadRes.data.success) {
//       uploadedPdfFiles[fileKey] = pdfUploadRes.data.data.file_path;
//     }
//   }
// }
//       }

//         const productDetails = {
//           slug: product.slug,
//           description: product.description || '',
//           price: parseFloat(product.price),
//           originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price),
//           discount: parseInt(product.discount) || 0,
//           style_id: product.style_id,
//           metal_id: product.metal_id,
//           featured: product.featured,
//           gender: product.gender,
//           images: uploadedImageUrls,
//           category: categories.find(c => c.id == selectedCategoryId)?.name || ''
//         };

//         const productRes = await axios.post(`${API_URL}/doAll`, {
//           action: 'insert',
//           table: 'products',
//           data: {
//             category_id: selectedCategoryId,
//             name: product.name,
//             slug: product.slug,
//             product_details: JSON.stringify(productDetails)
//           }
//         }, { headers: { Authorization: `Bearer ${token}` } });
// if (productRes.data.success && productRes.data.insertId) {
//   const productDbId = productRes.data.insertId;
//   const variants = [];

//   // ✅ SAFETY CHECK: Only process variants if selectedSizes exists and is an object
//   if (product.selectedSizes && typeof product.selectedSizes === 'object' && Object.keys(product.selectedSizes).length > 0) {
    
//     for (const [key, isSelected] of Object.entries(product.selectedSizes)) {
//       if (!isSelected) continue;

//       const pricing = product.variantPricing?.[key];
//       if (!pricing) continue;

//       const [metalPart, diamondPart, sizePart] = key.split('-');
      
//       // ✅ SAFETY CHECK: Ensure files is an array
//       const files = Array.isArray(pricing.files) ? pricing.files : [];
      
//       // Only add variant if it has files configured
//       if (files.length === 0) continue;
      
// variants.push({
//   metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
//   diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
//   size_option_id: parseInt(sizePart),
//   end_product_price: parseFloat(pricing.end_product_price) || null,
//   end_product_discount: parseFloat(pricing.end_product_discount) || null,
//   end_product_discount_percentage: parseInt(pricing.end_product_discount_percentage) || null,
//   files: files.map(f => ({
//     ...f,
//     file_path: uploadedPdfFiles[`${key}-${f.file_type}`] || null  
//   }))
// });
//     }
//   }

//   // Only call API if variants exist
//   if (variants.length > 0) {
//     await axios.post(
//       `${API_URL}/product-variants/pricing`,
//       { product_id: productDbId, variants },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//   }
// }
//       }

//       alert('✅ Products and variants saved successfully!');
//       setProducts([]);
//       setActiveProductTab(0);
//       onRefresh();
//     } catch (error) {
//       console.error('Error saving products:', error);
//       alert('❌ Error saving products: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedCategory = categories.find(c => c.id == selectedCategoryId);

//   return (
//     <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
//       {/* Header Section */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 sm:mb-6">
//         <div className="flex items-center gap-2">
//           <div className="bg-blue-100 p-2 rounded-lg">
//             <span className="text-xl">📦</span>
//           </div>
//           <div>
//             <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
//               Add Products
//             </h2>
//             <p className="text-xs sm:text-sm text-gray-600">
//               Add new products with variant configurations
//             </p>
//           </div>
//         </div>
//         <button 
//           onClick={onBack}
//           className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-colors"
//         >
//           <span>←</span>
//           <span>Back to Products</span>
//         </button>
//       </div>

//       {/* Category Selection */}
//       <div className="bg-blue-50 rounded-lg p-4 mb-4 sm:mb-6">
//         <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
//           <span className="bg-blue-500 text-white p-1 rounded">📂</span>
//           Select Category
//         </label>
//         <select
//           value={selectedCategoryId}
//           onChange={(e) => handleCategorySelect(e.target.value)}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
//         >
//           <option value="">-- Select a Category --</option>
//           {categories.map(cat => (
//             <option key={cat.id} value={cat.id}>{cat.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* Category Details */}
//       {categoryData && selectedCategory && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
//           {/* Styles Section */}
//           <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//             <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
//               <span className="bg-purple-100 p-1 rounded">🎨</span>
//               Available Styles
//             </h3>
//             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
//               {categoryData.styles.map(style => (
//                 <label key={style.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors border border-gray-200 min-w-[120px]">
//                   <input
//                     type="checkbox"
//                     checked={selectedStyles.includes(style.id)}
//                     onChange={() => toggleStyle(style.id)}
//                     className="w-4 h-4 text-purple-600 focus:ring-purple-500"
//                   />
//                   <span className="text-xs sm:text-sm text-gray-700">{style.name}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Metals Section */}
//           <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//             <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
//               <span className="bg-yellow-100 p-1 rounded">💎</span>
//               Available Metals & Stones
//             </h3>
//             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
//               {categoryData.metals.map(metal => (
//                 <label key={metal.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors border border-gray-200 min-w-[120px]">
//                   <input
//                     type="checkbox"
//                     checked={selectedMetals.includes(metal.id)}
//                     onChange={() => toggleMetal(metal.id)}
//                     className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
//                   />
//                   <span className="text-xs sm:text-sm text-gray-700">{metal.name}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Product Button */}
//       {categoryData && (
//         <div className="flex justify-between items-center mb-4 sm:mb-6">
//           <button
//             onClick={addProductRow}
//             className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base flex items-center gap-2 transition-colors shadow-md"
//           >
//             <span>+</span>
//             <span>Add Product</span>
//           </button>
          
//           {products.length > 0 && (
//             <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
//               {products.length} product{products.length !== 1 ? 's' : ''} added
//             </div>
//           )}
//         </div>
//       )}

//       {/* Products Tabs */}
//       {products.length > 0 && (
//         <div className="mb-4 sm:mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-1 overflow-x-auto">
//               {products.map((product, index) => (
//                 <button
//                   key={product.id}
//                   onClick={() => setActiveProductTab(index)}
//                   className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
//                     activeProductTab === index
//                       ? 'border-blue-500 text-blue-600 bg-blue-50'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <span>📦</span>
//                   <span>Product {index + 1}</span>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeProduct(product.id);
//                     }}
//                     className="text-gray-400 hover:text-red-500 ml-1"
//                   >
//                     ×
//                   </button>
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>
//       )}

//       {/* Product Forms */}
//       {products.map((product, index) => (
//         <div 
//           key={product.id} 
//           className={`bg-white border-2 rounded-xl shadow-sm mb-6 transition-all duration-300 ${
//             activeProductTab === index ? 'border-blue-300 block' : 'border-gray-200 hidden'
//           }`}
//         >
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-xl border-b">
//             <h4 className="font-bold text-lg text-gray-800 flex items-center gap-3">
//               <span className="bg-blue-500 text-white p-2 rounded-lg">📦</span>
//               <span>Product #{index + 1} - {product.name || 'New Product'}</span>
//             </h4>
//           </div>

//           <div className="p-4 sm:p-6">
//             {/* Basic Information Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
//               {/* Product Name */}
//   <div className="space-y-2">
//       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//         <span>📝</span>
//         Product Name *
//       </label>
//       <input
//         type="text"
//         value={product.name}
//         onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
//         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//         placeholder="e.g., Diamond Heart Ring"
//       />
//     </div>

//               {/* Description */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <span>📄</span>
//                   Description
//                 </label>
//                 <input
//                   type="text"
//                   value={product.description || ''}
//                   onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   placeholder="Beautiful description..."
//                 />
//               </div>

//               {/* Slug */}
//    <div className="space-y-2">
//       <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//         <span>🔗</span>
//         URL Slug
//       </label>
//       <input
//         type="text"
//         value={product.slug}
//         onChange={(e) => updateProduct(product.id, 'slug', e.target.value)}
//         className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//           slugErrors[product.id] ? 'border-red-500' : 'border-gray-300'
//         }`}
//         placeholder="auto-generated-slug"
//       />
//       {slugErrors[product.id] && (
//         <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
//           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
//           </svg>
//           {slugErrors[product.id]}
//         </p>
//       )}
//     </div>

//               {/* Style Selection */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <span>🎨</span>
//                   Style *
//                 </label>
//                 <select
//                   value={product.style_id}
//                   onChange={(e) => updateProduct(product.id, 'style_id', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 >
//                   <option value="">Select Style</option>
//                   {categoryData?.styles.map(style => (
//                     <option key={style.id} value={style.id}>{style.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Metal Selection */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <span>💎</span>
//                   Metal/Stone *
//                 </label>
//                 <select
//                   value={product.metal_id}
//                   onChange={(e) => updateProduct(product.id, 'metal_id', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 >
//                   <option value="">Select Metal</option>
//                   {categoryData?.metals.map(metal => (
//                     <option key={metal.id} value={metal.id}>{metal.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Pricing Grid */}

//             </div>

//             {/* Featured & Gender Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
//               {/* Featured Options */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                   <span>⭐</span>
//                   Featured Options
//                 </label>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
//                     <label key={feature} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
//                       <input
//                         type="checkbox"
//                         checked={product.featured.includes(feature)}
//                         onChange={() => toggleProductFeatured(product.id, feature)}
//                         className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-sm text-gray-700">{feature}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Gender Options */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                   <span>👥</span>
//                   Target Audience
//                 </label>
//                 <div className="flex flex-wrap gap-3">
//                   {['Kids', 'Men', 'Women'].map(gender => (
//                     <label key={gender} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors flex-1 min-w-[100px]">
//                       <input
//                         type="checkbox"
//                         checked={product.gender.includes(gender)}
//                         onChange={() => toggleProductGender(product.id, gender)}
//                         className="w-4 h-4 text-green-600 focus:ring-green-500"
//                       />
//                       <span className="text-sm text-gray-700">{gender}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

// {/* Image Upload Section - FIXED */}
// <div className="mb-6 sm:mb-8">
//   <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//     <span>🖼️</span>
//     Product Images
//   </label>
  
//   {/* File Upload Input */}
//   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
//     <input
//       type="file"
//       accept="image/*"
//       multiple
//       onChange={(e) => {
//         if (e.target.files && e.target.files.length > 0) {
//           handleImageSelect(product.id, e.target.files);
//           // Reset the input to allow selecting the same file again
//           e.target.value = '';
//         }
//       }}
//       className="hidden"
//       id={`image-upload-${product.id}`}
//     />
//     <label
//       htmlFor={`image-upload-${product.id}`}
//       className="cursor-pointer flex flex-col items-center justify-center"
//     >
//       <div className="text-gray-400 mb-2">
//         <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//       </div>
//       <p className="text-sm text-gray-600 mb-1 font-medium">
//         Click to upload product images
//       </p>
//       <p className="text-xs text-gray-500">
//         PNG, JPG, WEBP up to 10MB
//       </p>
//       <button 
//         type="button"
//         className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
//         onClick={(e) => {
//           e.preventDefault();
//           document.getElementById(`image-upload-${product.id}`).click();
//         }}
//       >
//         Choose Files
//       </button>
//     </label>
//   </div>

//   {/* Image Previews - FIXED */}
//   {product.imageUrls.length > 0 && (
//     <div className="mt-6">
//       <div className="flex items-center justify-between mb-3">
//         <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//           <span>📷</span>
//           Image Previews ({product.imageUrls.length})
//         </h4>
//         <button
//           type="button"
//           onClick={() => {
//             // Clear all images
//             product.imageUrls.forEach((url, idx) => {
//               if (url.startsWith('blob:')) {
//                 URL.revokeObjectURL(url);
//               }
//             });
//             setProducts(products.map(p => 
//               p.id === product.id 
//                 ? { ...p, imageFiles: [], imageUrls: [] } 
//                 : p
//             ));
//           }}
//           className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
//         >
//           <span>🗑️</span>
//           Clear All
//         </button>
//       </div>
      
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {product.imageUrls.map((url, idx) => {
//           // Ensure URL is valid
//           const imgUrl = url.startsWith('blob:') 
//             ? url 
//             : url.startsWith('/') 
//               ? `https://apichandra.rxsquare.in${url}`
//               : url;
          
//           return (
//             <div key={idx} className="relative group bg-white rounded-lg border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow">
//               <div className="relative h-32 w-full">
//                 <img 
//                   src={imgUrl}
//                   alt={`Preview ${idx + 1}`}
//                   className="h-full w-full object-cover rounded-lg"
//                   onLoad={(e) => {
//                     console.log(`Image ${idx + 1} loaded successfully`);
//                   }}
//                   onError={(e) => {
//                     console.error(`Failed to load image ${idx + 1}:`, url);
//                     e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="%236b7280">Image ${idx + 1}</text><text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="%239ca3af">Failed to load</text></svg>`;
//                   }}
//                 />
//               </div>
              
//               <button
//                 type="button"
//                 onClick={() => removeImage(product.id, idx)}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors z-10"
//                 title="Remove image"
//               >
//                 ×
//               </button>
              
//               <div className="mt-2 flex items-center justify-between">
//                 <span className="text-xs text-gray-500 truncate">
//                   {product.imageFiles[idx]?.name || `Image ${idx + 1}`}
//                 </span>
//                 <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                   {idx + 1}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   )}
// </div>
//             {/* Variant Configuration - This section remains largely the same but with responsive classes */}
//              <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
//             <h5 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
//               ⚙️ Variant Configuration (Optional)
//             </h5>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               {/* Choice of Metal */}
//               <div className="border-2 border-gray-200 rounded p-3">
//                 <label className="flex items-center gap-2 mb-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={product.hasMetalChoice}
//                     onChange={() => toggleProductMetalChoice(product.id)}
//                     className="w-5 h-5"
//                   />
//                   <span className="font-bold">🔩 Choice of Metal</span>
//                 </label>
                
//                 {product.hasMetalChoice && (
//                   <div className="space-y-2">
//                     {categoryData?.attributes?.metal?.options?.map(opt => (
//                       <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
//                         <input
//                           type="checkbox"
//                           checked={product.selectedMetalOptions.includes(opt.id)}
//                           onChange={() => toggleProductMetalOption(product.id, opt.id)}
//                           className="w-4 h-4"
//                         />
//                         <span className="text-sm">{opt.option_name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Diamond Quality */}
//               <div className="border-2 border-gray-200 rounded p-3">
//                 <label className="flex items-center gap-2 mb-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={product.hasDiamondChoice}
//                     onChange={() => toggleProductDiamondChoice(product.id)}
//                     className="w-5 h-5"
//                   />
//                   <span className="font-bold">💎 Diamond Quality</span>
//                 </label>
                
//                 {product.hasDiamondChoice && (
//                   <div className="space-y-2">
//                     {categoryData?.attributes?.diamond?.options?.map(opt => (
//                       <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
//                         <input
//                           type="checkbox"
//                           checked={product.selectedDiamondOptions.includes(opt.id)}
//                           onChange={() => toggleProductDiamondOption(product.id, opt.id)}
//                           className="w-4 h-4"
//                         />
//                         <span className="text-sm">{opt.option_name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

// {/* Size Info - Now with checkbox */}
// <div className="border-2 border-gray-200 rounded p-3">
//   <label className="flex items-center gap-2 mb-3 cursor-pointer">
//     <input
//       type="checkbox"
//       checked={product.configureSizes || false}
//       onChange={() => toggleConfigureSizes(product.id)}
//       className="w-5 h-5"
//     />
//     <span className="font-bold">📏 Configure Sizes with Pricing</span>
//   </label>
//   <p className="text-xs text-gray-600 ml-7">
//     {product.hasMetalChoice || product.hasDiamondChoice 
//       ? "✅ Size configuration is active (required for variants)" 
//       : "Check this to configure pricing for individual sizes"}
//   </p>
// </div>

//             </div>
//           {/* Size & Pricing Configuration */}
//     {(product.hasMetalChoice || product.hasDiamondChoice || product.configureSizes) && (
//     <div className="mt-4">
//       <h6 className="font-bold mb-3">📐 Configure Variants:</h6>
      
//       {/* ========== KEEP: Size Only (No Metal/Diamond) ========== */}
//       {!product.hasMetalChoice && !product.hasDiamondChoice && (
//         <div className="space-y-3">
//           {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//             const key = `none-none-${sizeOpt.id}`;
//             const isSelected = product.selectedSizes[key];
//             const pricing = product.variantPricing[key] || {};
            
//             return (
//               <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3">
//                 <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={isSelected || false}
//                     onChange={() => toggleProductSize(product.id, null, null, sizeOpt.id)}
//                     className="w-5 h-5"
//                   />
//                   <span className="font-bold">
//                     {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                   </span>
//                 </label>

//                 {isSelected && (
//                   <div className="ml-8 space-y-3">
//                     <div>
//                       <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
//                       <div className="space-y-3">
//                         {FILE_TYPE_OPTIONS.map(fileOption => {
//                           const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
//                           const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
//                           const fileKey = `${product.id}-none-none-${sizeOpt.id}-${fileOption.value}`;
//                           const uploadedFile = uploadedPdfFiles[fileKey];
//                           const isSTL = fileOption.value === 'stl_file';
                          
//                           return (
//                             <div key={fileOption.value} className="border rounded p-3 bg-white">
//                               <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? 'opacity-50 cursor-not-allowed' : ''}`}>
//                                 <input
//                                   type="checkbox"
//                                   checked={isFileSelected}
//                                   onChange={() => !isSTL && toggleVariantFileType(product.id, null, null, sizeOpt.id, fileOption.value)}
//                                   disabled={isSTL}
//                                   className="w-4 h-4"
//                                 />
//                                 <span className="text-lg">{fileOption.emoji}</span>
//                                 <span className="font-medium">{fileOption.label}</span>
//                                 {isSTL && <span className="text-xs text-blue-600 ml-auto">(Mandatory)</span>}
//                               </label>
                              
//                               {isFileSelected && (
//                                 <div className="ml-6 space-y-3">
//                                   {fileOption.requiresPrice && (
//                                     <div className="p-3 bg-green-50 rounded border border-green-200">
//                                       <p className="text-xs text-gray-700 mb-2 font-semibold">
//                                         🟩 {fileOption.label} Price {isSTL && '*'}
//                                       </p>
//                                       <p className="text-xs text-gray-500 mb-2">
//                                         {isSTL 
//                                           ? 'This price will be displayed to customers (Required)'
//                                           : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`
//                                         }
//                                       </p>
//                                       <input
//                                         type="number"
//                                         placeholder={isSTL ? "Enter price (required)" : "Enter price"}
//                                         value={filePrice}
//                                         onChange={(e) => updateFilePrice(product.id, null, null, sizeOpt.id, fileOption.value, e.target.value)}
//                                         className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
//                                         required={isSTL}
//                                       />
//                                       {isSTL && !filePrice && (
//                                         <p className="text-xs text-red-600 mt-1">STL price is required</p>
//                                       )}
//                                     </div>
//                                   )}
                                  
//                                   {fileOption.requiresUpload !== false && (
//                                     <div className="p-3 bg-purple-50 rounded border border-purple-200">
//                                       <label className="block text-xs font-semibold text-purple-800 mb-2">
//                                         📎 Upload {fileOption.label} {isSTL && '(Optional)'}
//                                       </label>
//                                       <input
//                                         type="file"
//                                         accept=".pdf,.stl,.zip,.cam"
//                                         onChange={(e) => {
//                                           if (e.target.files[0]) {
//                                             handlePdfUpload(product.id, null, null, sizeOpt.id, fileOption.value, e.target.files[0]);
//                                           }
//                                         }}
//                                         className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
//                                       />
//                                       {uploadedFile && (
//                                         <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
//                                           <span>✓</span>
//                                           <span className="font-medium">{uploadedFile.file_name}</span>
//                                         </div>
//                                       )}
//                                     </div>
//                                   )}
                                  
//                                   {!fileOption.requiresPrice && (
//                                     <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
//                                       💡 Enquiry only - no price needed
//                                     </p>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ========== NEW: Metal Only (No Diamond) ========== */}
//       {product.hasMetalChoice && !product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
//         const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
//         const useSizeConfig = product.metalSizeConfig[metalId];
        
//         return (
//           <div key={metalId} className="mb-4 border-2 border-blue-200 rounded p-4 bg-blue-50">
//             {/* ✅ NEW: Header with Size Toggle */}
//             <div className="flex items-center justify-between mb-3">
//               <h6 className="font-bold flex items-center gap-2">
//                 <span>🔩</span>
//                 <span>{metalOpt?.option_name}</span>
//               </h6>
              
//               <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
//                 <input
//                   type="checkbox"
//                   checked={useSizeConfig || false}
//                   onChange={() => toggleMetalSizeConfig(product.id, metalId)}
//                   className="w-5 h-5"
//                 />
//                 <span className="text-sm font-semibold">+ Config with Sizes</span>
//               </label>
//             </div>

//             {/* ✅ CONDITIONAL: Show Sizes OR Files */}
//             {useSizeConfig ? (
//               /* Show sizes with files */
//               <div className="space-y-3">
//                 {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//                   const key = `${metalId}-none-${sizeOpt.id}`;
//                   const isSelected = product.selectedSizes[key];
//                   const pricing = product.variantPricing[key] || {};
                  
//                   return (
//                     <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
//                       <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={isSelected || false}
//                           onChange={() => toggleProductSize(product.id, metalId, null, sizeOpt.id)}
//                           className="w-5 h-5"
//                         />
//                         <span className="font-bold">
//                           {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                         </span>
//                       </label>

//                       {isSelected && (
//                         <div className="ml-8 space-y-3">
//                           <div>
//                             <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
//                             <div className="space-y-3">
//                               {FILE_TYPE_OPTIONS.map((fileOption) => {
//                                 const isFileSelected = pricing.files?.some((f) => f.file_type === fileOption.value) || false;
//                                 const filePrice = pricing.files?.find((f) => f.file_type === fileOption.value)?.price || "";
//                                 const fileKey = `${product.id}-${metalId}-none-${sizeOpt.id}-${fileOption.value}`;
//                                 const uploadedFile = uploadedPdfFiles[fileKey];
//                                 const isSTL = fileOption.value === "stl_file";

//                                 return (
//                                   <div key={fileOption.value} className="border rounded p-3 bg-white">
//                                     <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? "opacity-50 cursor-not-allowed" : ""}`}>
//                                       <input
//                                         type="checkbox"
//                                         checked={isFileSelected}
//                                         onChange={() => !isSTL && toggleVariantFileType(product.id, metalId, null, sizeOpt.id, fileOption.value)}
//                                         disabled={isSTL}
//                                         className="w-4 h-4"
//                                       />
//                                       <span className="text-lg">{fileOption.emoji}</span>
//                                       <span className="font-medium">{fileOption.label}</span>
//                                       {isSTL && <span className="text-xs text-blue-600 ml-auto">(Mandatory)</span>}
//                                     </label>

//                                     {isFileSelected && (
//                                       <div className="ml-6 space-y-3">
//                                         {fileOption.requiresPrice && (
//                                           <div className="p-3 bg-green-50 rounded border border-green-200">
//                                             <p className="text-xs text-gray-700 mb-2 font-semibold">
//                                               🟩 {fileOption.label} Price {isSTL && "*"}
//                                             </p>
//                                             <p className="text-xs text-gray-500 mb-2">
//                                               {isSTL ? "This price will be displayed to customers (Required)" : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
//                                             </p>
//                                             <input
//                                               type="number"
//                                               placeholder={isSTL ? "Enter price (required)" : "Enter price"}
//                                               value={filePrice}
//                                               onChange={(e) => updateFilePrice(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.value)}
//                                               className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? "border-red-500" : ""}`}
//                                               required={isSTL}
//                                             />
//                                             {isSTL && !filePrice && (
//                                               <p className="text-xs text-red-600 mt-1">STL price is required</p>
//                                             )}
//                                           </div>
//                                         )}

//                                         {fileOption.requiresUpload !== false && (
//                                           <div className="p-3 bg-purple-50 rounded border border-purple-200">
//                                             <label className="block text-xs font-semibold text-purple-800 mb-2">
//                                               📎 Upload {fileOption.label} {isSTL && "(Optional)"}
//                                             </label>
//                                             <input
//                                               type="file"
//                                               accept=".pdf,.stl,.zip,.cam"
//                                               onChange={(e) => {
//                                                 if (e.target.files[0]) {
//                                                   handlePdfUpload(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.files[0]);
//                                                 }
//                                               }}
//                                               className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
//                                             />
//                                             {uploadedFile && (
//                                               <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
//                                                 <span>✓</span>
//                                                 <span className="font-medium">{uploadedFile.file_name}</span>
//                                               </div>
//                                             )}
//                                           </div>
//                                         )}

//                                         {!fileOption.requiresPrice && (
//                                           <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
//                                             💡 Enquiry only - no price needed
//                                           </p>
//                                         )}
//                                       </div>
//                                     )}
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//   ) : (
//     /* ✅ NEW: Show files directly WITHOUT sizes */
//     <div className="space-y-3 border-2 border-gray-200 rounded p-3 bg-white">
//       <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
//       <div className="space-y-3">
//         {FILE_TYPE_OPTIONS.map(fileOption => {
//           const directKey = `${metalId}-none-none`;
//           const pricing = product.variantPricing[directKey] || {};
//           const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
//           const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
//           const fileKey = `${product.id}-${metalId}-direct-${fileOption.value}`;
//           const uploadedFile = uploadedPdfFiles[fileKey];
//           const isSTL = fileOption.value === 'stl_file';
          
//           // For STL, we need to check if it exists in the files array
//           // STL should always be considered as "selected" when metal is selected
//           const shouldShowSTL = isSTL && product.selectedMetalOptions.includes(metalId);
          
//           return (
//             <div key={fileOption.value} className="border rounded p-3 bg-gray-50">
//               {/* STL is mandatory - show it without checkbox */}
//               {isSTL ? (
//                 <div className="flex items-center gap-2 text-sm mb-2">
//                   <span className="text-lg">{fileOption.emoji}</span>
//                   <span className="font-medium">{fileOption.label} (Mandatory)</span>
//                 </div>
//               ) : (
//                 // Other file types have checkboxes
//                 <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
//                   <input
//                     type="checkbox"
//                     checked={isFileSelected}
//                     onChange={() => {
//                       // Call toggleVariantFileType for files without sizes
//                       // Since there's no size, pass null for sizeId
//                       toggleVariantFileType(product.id, metalId, null, null, fileOption.value);
//                     }}
//                     className="w-4 h-4"
//                   />
//                   <span className="text-lg">{fileOption.emoji}</span>
//                   <span className="font-medium">{fileOption.label}</span>
//                 </label>
//               )}
              
//               {/* Show price and upload for STL (always) or other files (when checked) */}
//               {(isSTL || isFileSelected) && (
//                 <div className="ml-6 space-y-3">
//                   {fileOption.requiresPrice && (
//                     <div className="p-3 bg-green-50 rounded border border-green-200">
//                       <p className="text-xs text-gray-700 mb-2 font-semibold">
//                         🟩 {fileOption.label} Price {isSTL && '*'}
//                       </p>
//                       <input
//                         type="number"
//                         placeholder={isSTL ? "Enter price (required)" : "Enter price"}
//                         value={filePrice}
//                         onChange={(e) => {
//                           // Update file price for files without sizes
//                           updateFilePrice(product.id, metalId, null, null, fileOption.value, e.target.value);
//                         }}
//                         className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
//                       />
//                     </div>
//                   )}
                  
//                   {fileOption.requiresUpload !== false && (
//                     <div className="p-3 bg-purple-50 rounded border border-purple-200">
//                       <label className="block text-xs font-semibold text-purple-800 mb-2">
//                         📎 Upload {fileOption.label}
//                       </label>
//                       <input
//                         type="file"
//                         accept=".pdf,.stl,.zip,.cam"
//                         onChange={(e) => {
//                           if (e.target.files[0]) {
//                             handlePdfUpload(product.id, metalId, null, null, fileOption.value, e.target.files[0]);
//                           }
//                         }}
//                         className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
//                       />
//                       {uploadedFile && (
//                         <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
//                           <span>✓</span>
//                           <span className="font-medium">{uploadedFile.file_name}</span>
//                         </div>
//                       )}
//                     </div>
//                   )}
                  
//                   {!fileOption.requiresPrice && (
//                     <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
//                       💡 Enquiry only - no price needed
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   )}
//           </div>
//         );
//       })}


//       {/* Metal + Diamond */}
//       {product.hasMetalChoice && product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
//         const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
//         return product.selectedDiamondOptions.map(diamondId => {
//           const diamondOpt = categoryData?.attributes?.diamond?.options?.find(o => o.id === diamondId);
//           const comboKey = `${metalId}-${diamondId}`;
//           const useSizeConfig = product.diamondSizeConfig[comboKey];
          
//           return (
//             <div key={comboKey} className="mb-4 border-2 border-purple-200 rounded p-4 bg-purple-50">
//               {/* ✅ UPDATED: Header with Size Toggle */}
//               <div className="flex items-center justify-between mb-3">
//                 <h6 className="font-bold flex items-center gap-2">
//                   <span>🔩</span>
//                   <span>{metalOpt?.option_name}</span>
//                   <span>+</span>
//                   <span>💎</span>
//                   <span>{diamondOpt?.option_name}</span>
//                 </h6>
                
//                 <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
//                   <input
//                     type="checkbox"
//                     checked={useSizeConfig || false}
//                     onChange={() => toggleDiamondSizeConfig(product.id, metalId, diamondId)}
//                     className="w-5 h-5"
//                   />
//                   <span className="text-sm font-semibold">+ Config with Sizes</span>
//                 </label>
//               </div>

//               {/* ✅ CONDITIONAL: Show Sizes OR Files */}
//               {useSizeConfig ? (
//                 /* Show sizes with files */
//                 <div className="space-y-3">
//                   {categoryData?.attributes?.size?.options?.map(sizeOpt => {
//                     const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
//                     const isSelected = product.selectedSizes[key];
//                     const pricing = product.variantPricing[key] || {};
                    
//                     return (
//                       <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
//                         <label className="flex items-center gap-3 mb-2 cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={isSelected || false}
//                             onChange={() => toggleProductSize(product.id, metalId, diamondId, sizeOpt.id)}
//                             className="w-5 h-5"
//                           />
//                           <span className="font-bold">
//                             {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//                           </span>
//                         </label>

//                         {isSelected && (
//                           <div className="ml-8 space-y-3">
//                             {/* File Type Pricing Section */}
//                             <div>
//                               <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
//                               <div className="space-y-3">
//                                 {FILE_TYPE_OPTIONS.map(fileOption => {
//                                   const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
//                                   const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
//                                   const fileKey = `${product.id}-${metalId}-${diamondId}-${sizeOpt.id}-${fileOption.value}`;
//                                   const uploadedFile = uploadedPdfFiles[fileKey];
//                                   const isSTL = fileOption.value === "stl_file";
                                  
//                                   return (
//                                     <div key={fileOption.value} className="border rounded p-3 bg-white">
//                                       <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? "opacity-50 cursor-not-allowed" : ""}`}>
//                                         <input
//                                           type="checkbox"
//                                           checked={isFileSelected}
//                                           onChange={() =>
//                                             !isSTL &&
//                                             toggleVariantFileType(product.id, metalId, diamondId, sizeOpt.id, fileOption.value)
//                                           }
//                                           disabled={isSTL}
//                                           className="w-4 h-4"
//                                         />
//                                         <span className="text-lg">{fileOption.emoji}</span>
//                                         <span className="font-medium">{fileOption.label}</span>
//                                         {isSTL && <span className="text-xs text-blue-600 ml-auto">(Mandatory)</span>}
//                                       </label>
                                      
//                                       {isFileSelected && (
//                                         <div className="ml-6 space-y-3">
//                                           {fileOption.requiresPrice && (
//                                             <div className="p-3 bg-green-50 rounded border border-green-200">
//                                               <p className="text-xs text-gray-700 mb-2 font-semibold">
//                                                 🟩 {fileOption.label} Price {isSTL && "*"}
//                                               </p>
//                                               <p className="text-xs text-gray-500 mb-2">
//                                                 {isSTL
//                                                   ? "This price will be displayed to customers (Required)"
//                                                   : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`
//                                                 }
//                                               </p>
//                                               <input
//                                                 type="number"
//                                                 placeholder={
//                                                   isSTL
//                                                     ? "Enter price (required)"
//                                                     : "Enter price"
//                                                 }
//                                                 value={filePrice}
//                                                 onChange={(e) =>
//                                                   updateFilePrice(
//                                                     product.id,
//                                                     metalId,
//                                                     diamondId,
//                                                     sizeOpt.id,
//                                                     fileOption.value,
//                                                     e.target.value
//                                                   )
//                                                 }
//                                                 className={`w-full px-3 py-2 border rounded text-sm ${
//                                                   isSTL && !filePrice ? "border-red-500" : ""
//                                                 }`}
//                                                 required={isSTL}
//                                               />
//                                               {isSTL && !filePrice && (
//                                                 <p className="text-xs text-red-600 mt-1">
//                                                   STL price is required
//                                                 </p>
//                                               )}
//                                             </div>
//                                           )}
                                          
//                                           {/* PDF Upload Section */}
//                                           {fileOption.requiresUpload !== false && (
//                                             <div className="p-3 bg-purple-50 rounded border border-purple-200">
//                                               <label className="block text-xs font-semibold text-purple-800 mb-2">
//                                                 📎 Upload {fileOption.label} {isSTL && "(Optional)"}
//                                               </label>
//                                               <input
//                                                 type="file"
//                                                 accept=".pdf,.stl,.zip,.cam"
//                                                 onChange={(e) => {
//                                                   if (e.target.files[0]) {
//                                                     handlePdfUpload(product.id, metalId, diamondId, sizeOpt.id, fileOption.value, e.target.files[0]);
//                                                   }
//                                                 }}
//                                                 className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
//                                               />
//                                               {uploadedFile && (
//                                                 <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
//                                                   <span>✓</span>
//                                                   <span className="font-medium">{uploadedFile.file_name}</span>
//                                                 </div>
//                                               )}
//                                             </div>
//                                           )}
                                          
//                                           {!fileOption.requiresPrice && (
//                                             <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
//                                               💡 Enquiry only - no price needed
//                                             </p>
//                                           )}
//                                         </div>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 /* ✅ NEW: Show files directly WITHOUT sizes */
//                 <div className="space-y-3 border-2 border-gray-200 rounded p-3 bg-white">
//                   <label className="block text-sm font-semibold mb-2">📁 File Types & Pricing:</label>
//                   <div className="space-y-3">
//                     {FILE_TYPE_OPTIONS.map(fileOption => {
//                       const directKey = `${metalId}-${diamondId}-none`;
//                       const pricing = product.variantPricing[directKey] || {};
//                       const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
//                       const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
//                       const fileKey = `${product.id}-${metalId}-${diamondId}-direct-${fileOption.value}`;
//                       const uploadedFile = uploadedPdfFiles[fileKey];
//                       const isSTL = fileOption.value === 'stl_file';
                      
//                       // STL should always be considered as "selected" when metal+diamond is selected
//                       const shouldShowSTL = isSTL && product.selectedMetalOptions.includes(metalId) && 
//                                           product.selectedDiamondOptions.includes(diamondId);
                      
//                       return (
//                         <div key={fileOption.value} className="border rounded p-3 bg-gray-50">
//                           {/* STL is mandatory - show it without checkbox */}
//                           {isSTL ? (
//                             <div className="flex items-center gap-2 text-sm mb-2">
//                               <span className="text-lg">{fileOption.emoji}</span>
//                               <span className="font-medium">{fileOption.label} (Mandatory)</span>
//                             </div>
//                           ) : (
//                             // Other file types have checkboxes
//                             <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
//                               <input
//                                 type="checkbox"
//                                 checked={isFileSelected}
//                                 onChange={() => {
//                                   // Call toggleVariantFileType for files without sizes
//                                   // Since there's no size, pass null for sizeId
//                                   toggleVariantFileType(product.id, metalId, diamondId, null, fileOption.value);
//                                 }}
//                                 className="w-4 h-4"
//                               />
//                               <span className="text-lg">{fileOption.emoji}</span>
//                               <span className="font-medium">{fileOption.label}</span>
//                             </label>
//                           )}
                          
//                           {/* Show price and upload for STL (always) or other files (when checked) */}
//                           {(isSTL || isFileSelected) && (
//                             <div className="ml-6 space-y-3">
//                               {fileOption.requiresPrice && (
//                                 <div className="p-3 bg-green-50 rounded border border-green-200">
//                                   <p className="text-xs text-gray-700 mb-2 font-semibold">
//                                     🟩 {fileOption.label} Price {isSTL && '*'}
//                                   </p>
//                                   <input
//                                     type="number"
//                                     placeholder={isSTL ? "Enter price (required)" : "Enter price"}
//                                     value={filePrice}
//                                     onChange={(e) => {
//                                       // Update file price for files without sizes
//                                       updateFilePrice(product.id, metalId, diamondId, null, fileOption.value, e.target.value);
//                                     }}
//                                     className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
//                                   />
//                                 </div>
//                               )}
                              
//                               {fileOption.requiresUpload !== false && (
//                                 <div className="p-3 bg-purple-50 rounded border border-purple-200">
//                                   <label className="block text-xs font-semibold text-purple-800 mb-2">
//                                     📎 Upload {fileOption.label}
//                                   </label>
//                                   <input
//                                     type="file"
//                                     accept=".pdf,.stl,.zip,.cam"
//                                     onChange={(e) => {
//                                       if (e.target.files[0]) {
//                                         handlePdfUpload(product.id, metalId, diamondId, null, fileOption.value, e.target.files[0]);
//                                       }
//                                     }}
//                                     className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
//                                   />
//                                   {uploadedFile && (
//                                     <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
//                                       <span>✓</span>
//                                       <span className="font-medium">{uploadedFile.file_name}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
                              
//                               {!fileOption.requiresPrice && (
//                                 <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
//                                   💡 Enquiry only - no price needed
//                                 </p>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         });
//       })}
              
//             </div>
//             )}
//           </div>
//           </div>
//         </div>
//       ))}

//       {/* Save Button */}
//       {products.length > 0 && (
//         <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
//           <button
//             onClick={saveProducts}
//             disabled={loading}
//             className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md"
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                 <span>Saving All Products...</span>
//               </>
//             ) : (
//               <>
//                 <span>💾</span>
//                 <span>Save {products.length} Product{products.length !== 1 ? 's' : ''}</span>
//               </>
//             )}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };
// export default Products;

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

const Products = () => {
  const [currentStep, setCurrentStep] = useState('dashboard');
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
    if (userRole === 'admin') {
      fetchPendingCount();
    }
  }, [userRole]);

  const fetchUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role || null);
  };

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/products/pending-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPendingCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: 'get', table: 'category' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Admin-specific header */}
      {userRole === 'admin' && (
        <div className="mb-4 flex justify-between items-center">
          <div></div>
          <button
            onClick={() => setShowVendorSidebar(true)}
            className="relative px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <span>📋</span>
            <span>Vendor Products</span>
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Navigation Steps */}
      <div className="mb-6 sm:mb-8">
        <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
          <StepButton
            step="dashboard"
            currentStep={currentStep}
            onClick={() => setCurrentStep('dashboard')}
            icon="📊"
            label="Dashboard"
          />
          <div className="text-gray-400">›</div>
          <StepButton
            step="view-products"
            currentStep={currentStep}
            onClick={() => setCurrentStep('view-products')}
            icon="👁️"
            label={userRole === 'admin' ? "View All Products" : "My Products"}
          />
          
          {/* Only show Add Products for vendors */}
          {userRole === 'admin' &&  (
            <>
              <div className="text-gray-400">›</div>
              <StepButton
                step="add-products"
                currentStep={currentStep}
                onClick={() => {
                  if (categories.length === 0) {
                    alert('Please create a category first!');
                    return;
                  }
                  setCurrentStep('add-products');
                }}
                icon="➕"
                label="Add Products"
                disabled={categories.length === 0}
              />
            </>
          )}
        </nav>
      </div>

      {/* Vendor sidebar for admin */}
      {showVendorSidebar && userRole === 'admin' && (
        <>
          <div 
            className="fixed inset-0  z-30"
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
      {currentStep === 'dashboard' && (
        <ProductsDashboard 
          categories={categories}
          onViewProducts={() => setCurrentStep('view-products')}
          onAddProducts={() => {
            if (categories.length === 0) {
              alert('Please create a category first!');
              return;
            }
            setCurrentStep('add-products');
          }}
          userRole={userRole}
          pendingCount={pendingCount}
          onOpenVendorSidebar={() => setShowVendorSidebar(true)}
        />
      )}

      {currentStep === 'view-products' && (
        <ViewProducts 
          categories={categories}
          onBack={() => setCurrentStep('dashboard')}
          onAddProduct={() => {
            if (categories.length === 0) {
              alert('Please create a category first!');
              return;
            }
            setCurrentStep('add-products');
          }}
          userRole={userRole}
        />
      )}

      {currentStep === 'add-products' && (
        <AddProducts 
          onBack={() => setCurrentStep('dashboard')}
          categories={categories}
          onRefresh={fetchCategories}
          userRole={userRole}
        />
      )}
    </div>
  );
};

// Step Navigation Button Component
const StepButton = ({ step, currentStep, onClick, icon, label, disabled = false }) => {
  const isActive = currentStep === step;
  const isCompleted = 
    (step === 'dashboard' && currentStep !== 'dashboard') ||
    (step === 'view-products' && currentStep === 'add-products');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : isCompleted
          ? 'bg-green-100 text-green-700 border border-green-300'
          : disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
      {isCompleted && <span className="text-green-500">✓</span>}
    </button>
  );
};

// ==================== VENDOR PRODUCTS SIDEBAR ====================
const VendorProductsSidebar = ({ onClose, onApproveProduct }) => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('all');

  useEffect(() => {
    fetchPendingProducts();
    fetchVendors();
  }, [selectedVendor]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { status: 'pending' };
      
      if (selectedVendor !== 'all') {
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
      console.error('Error fetching pending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: 'get', table: 'admin_users', where: { role: 'vendor', is_deleted: 0 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleApprove = async (productId, approve = true) => {
    if (!approve && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/products/vendor/approve`,
        {
          product_id: productId,
          action: approve ? 'approve' : 'reject',
          reason: rejectionReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Product ${approve ? 'approved' : 'rejected'} successfully`);
        fetchPendingProducts();
        setSelectedProduct(null);
        setRejectionReason('');
        if (onApproveProduct) onApproveProduct();
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Error processing approval');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            ←
          </button>
          <h3 className="text-lg font-semibold">Vendor Products</h3>
        </div>
        <div className="text-sm bg-blue-800 px-2 py-1 rounded">
          {pendingProducts.length} pending
        </div>
      </div>

      {/* Vendor Filter */}
      <div className="p-4 border-b">
        <label className="block text-sm font-medium mb-2">Filter by Vendor:</label>
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Vendors</option>
          {vendors.map(vendor => (
            <option key={vendor.id} value={vendor.id}>{vendor.username}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">✅</div>
            <p>No pending products</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProducts.map(product => {
              let productDetails = product.product_details;
              if (typeof productDetails === 'string') {
                try {
                  productDetails = JSON.parse(productDetails);
                } catch (e) {
                  productDetails = {};
                }
              }

              return (
                <div key={product.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    {productDetails.images && productDetails.images.length > 0 && (
                      <img 
                        src={`https://apichandra.rxsquare.in${productDetails.images[0]}`} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{product.slug}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {productDetails.category || 'No category'}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          ₹{productDetails.price?.toLocaleString() || '0'}
                        </span>
                        {productDetails.gender?.map((gender, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {gender}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Added by: <strong>{product.vendor_name || 'Unknown'}</strong>
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(product.id, true)}
                          className="flex-1 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedProduct(product.id)}
                          className="flex-1 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                      
                      {selectedProduct === product.id && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <label className="block text-sm font-medium text-red-800 mb-2">
                            Reason for rejection:
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                            className="w-full px-3 py-2 border rounded text-sm mb-2"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(product.id, false)}
                              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(null);
                                setRejectionReason('');
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== DASHBOARD COMPONENT ====================
const ProductsDashboard = ({ categories, onViewProducts, onAddProducts, userRole, pendingCount, onOpenVendorSidebar }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowStock: 0,
    pendingProducts: pendingCount
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/doAll`,
        { action: 'get', table: 'products', where: { is_deleted: 0 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const products = response.data.data || [];
        const featured = products.filter(p => {
          try {
            const details = typeof p.product_details === 'string' 
              ? JSON.parse(p.product_details) 
              : p.product_details || {};
            return details.featured?.includes('Latest Designs') || 
                   details.featured?.includes('Bestsellers');
          } catch {
            return false;
          }
        }).length;

        const user = JSON.parse(localStorage.getItem('user'));
        const isVendor = userRole === 'vendor';
        
        const filteredProducts = isVendor 
          ? products.filter(p => p.vendor_id === user?.id && p.status === 'approved')
          : products.filter(p => p.status === 'approved');
        
        const pending = isVendor
          ? products.filter(p => p.vendor_id === user?.id && p.status === 'pending').length
          : products.filter(p => p.status === 'pending').length;
        
        setStats({
          totalProducts: filteredProducts.length,
          activeProducts: filteredProducts.length,
          featuredProducts: featured,
          lowStock: 0,
          pendingProducts: pending
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="📦" 
          value={stats.totalProducts} 
          label="Total Products" 
          color="blue" 
        />
        
        {userRole === 'vendor' && (
          <StatCard 
            icon="⏳" 
            value={stats.pendingProducts} 
            label="Pending Approval" 
            color="yellow" 
          />
        )}
        
        {userRole === 'admin' && (
          <StatCard 
            icon="⏳" 
            value={pendingCount} 
            label="Pending Approval" 
            color="yellow" 
            onClick={onOpenVendorSidebar}
            clickable={pendingCount > 0}
          />
        )}
        
        <StatCard 
          icon="✅" 
          value={stats.activeProducts} 
          label="Active Products" 
          color="green" 
        />
        
        <StatCard 
          icon="⭐" 
          value={stats.featuredProducts} 
          label="Featured Products" 
          color="purple" 
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          icon="👁️"
          title={userRole === 'admin' ? "View All Products" : "My Products"}
          description={userRole === 'admin' ? "Browse all products from vendors and admins" : "View your submitted products"}
          buttonText="View Products"
          onClick={onViewProducts}
          color="blue"
        />
        
        {userRole === 'vendor' && (
          <ActionCard
            icon="➕"
            title="Add Products"
            description="Add new products for admin approval"
            buttonText="Add Products"
            onClick={onAddProducts}
            color="green"
          />
        )}
        
        {userRole === 'admin' && (
          <ActionCard
            icon="📋"
            title="Vendor Submissions"
            description="Review and approve vendor products"
            buttonText="Review Products"
            onClick={onOpenVendorSidebar}
            color="yellow"
          />
        )}
        
        <ActionCard
          icon="📊"
          title="Analytics"
          description="View product performance metrics"
          buttonText="View Analytics"
          onClick={() => alert('Analytics coming soon!')}
          color="purple"
        />
        
        <ActionCard
          icon="🔄"
          title="Refresh Data"
          description="Update all product information"
          onClick={fetchStats}
          buttonText="Refresh"
          color="gray"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon="🔍"
            title="Search Products"
            description="Find specific products quickly"
            onClick={onViewProducts}
          />
          <QuickAction
            icon="📈"
            title="Sales Report"
            description="Check recent sales data"
            onClick={() => alert('Sales report coming soon!')}
          />
          <QuickAction
            icon="📦"
            title="Inventory"
            description="Manage stock levels"
            onClick={() => alert('Inventory management coming soon!')}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color, onClick, clickable = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  return (
    <div 
      onClick={clickable ? onClick : undefined}
      className={`p-4 rounded-lg border-2 ${colorClasses[color]} ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-80">{label}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, description, buttonText, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <div className={`p-6 rounded-lg border-2 transition-colors ${colorClasses[color]}`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <button
            onClick={onClick}
            className={`px-6 py-2 text-white rounded-lg font-semibold transition-colors ${buttonClasses[color]}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState(
    userRole === 'vendor' ? ['pending', 'approved'] : ['approved']
  );

  const toggleCategory = (catId) => {
    setSelectedCategoryIds(prev => {
      const newSelection = prev.includes(catId)
        ? prev.filter(id => id !== catId)
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
    const token = localStorage.getItem('token');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = { 
        category_ids: selectedCategoryIds,
        status: statusFilter
      };
      
      if (userRole === 'vendor') {
        payload.vendor_id = user.id;
      }

      const response = await axios.post(
        `${API_URL}/products/by-status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryIds, statusFilter, userRole]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryIds, statusFilter, fetchProducts]);

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/products/delete`,
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const canEditDelete = (product) => {
    if (userRole === 'admin') return true;
    if (userRole === 'vendor') {
      const user = JSON.parse(localStorage.getItem('user'));
      return product.vendor_id === user.id && product.status === 'pending';
    }
    return false;
  };

  const filteredProducts = products
    .filter(product => {
      const productName = product.name || '';
      const productSlug = product.slug || '';
      const searchLower = searchTerm.toLowerCase();
      return productName.toLowerCase().includes(searchLower) ||
             productSlug.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      let aDetails = a.product_details;
      let bDetails = b.product_details;
      
      if (typeof aDetails === 'string') {
        try { aDetails = JSON.parse(aDetails); } catch { aDetails = {}; }
      }
      if (typeof bDetails === 'string') {
        try { bDetails = JSON.parse(bDetails); } catch { bDetails = {}; }
      }

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-high':
          return (bDetails.price || 0) - (aDetails.price || 0);
        case 'price-low':
          return (aDetails.price || 0) - (bDetails.price || 0);
        case 'discount':
          return (bDetails.discount || 0) - (aDetails.discount || 0);
        case 'date-new':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-old':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

  const renderStatusFilter = () => {
    if (userRole !== 'vendor') return null;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Status:</label>
        <div className="flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => {
                if (statusFilter.includes(status)) {
                  setStatusFilter(statusFilter.filter(s => s !== status));
                } else {
                  setStatusFilter([...statusFilter, status]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                statusFilter.includes(status)
                  ? status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : status === 'approved'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {status === 'pending' && '⏳'}
              {status === 'approved' && '✅'}
              {status === 'rejected' && '❌'}
              {' '}{status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === 'admin' ? 'View All Products' : 'My Products'}
          </h1>
        </div>
        {userRole === 'vendor' && (
          <button
            onClick={onAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add Product</span>
          </button>
        )}
      </div>

      {renderStatusFilter()}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Mobile Filter Bar */}
        <div className="lg:hidden p-4 border-b border-gray-200">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="name">📝 Name</option>
              <option value="price-high">💰 High to Low</option>
              <option value="price-low">💰 Low to High</option>
              <option value="discount">🎯 Discount</option>
              <option value="date-new">📅 Newest</option>
              <option value="date-old">📅 Oldest</option>
            </select>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategoryIds.includes(cat.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Desktop Sidebar - Categories */}
          <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4">📂 Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-sm">{cat.name}</span>
                </label>
              ))}
            </div>

            {selectedCategoryIds.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  ✅ {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
                </p>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="🔍 Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="name">📝 Name</option>
                  <option value="price-high">💰 High to Low</option>
                  <option value="price-low">💰 Low to High</option>
                  <option value="discount">🎯 Discount</option>
                  <option value="date-new">📅 Newest</option>
                  <option value="date-old">📅 Oldest</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                📊 {filteredProducts.length} products found
              </div>
            </div>

            {/* Products Grid */}
            {selectedCategoryIds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg mb-4">Select a category to view products</p>
                {userRole === 'vendor' && (
                  <button
                    onClick={onAddProduct}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    ➕ Add Your First Product
                  </button>
                )}
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm mb-4">Try selecting different categories or search terms</p>
                {userRole === 'vendor' && (
                  <button
                    onClick={onAddProduct}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    ➕ Add New Product
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
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
            )}
          </div>
        </div>
      </div>

      {/* Image Popup */}
      {imagePopup && (
        <ImagePopup images={imagePopup} onClose={() => setImagePopup(null)} />
      )}

      {/* Edit Product Panel */}
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
const ProductCard = ({ product, onEdit, onDelete, onViewImages, canEditDelete, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  let productDetails = product.product_details;
  if (typeof productDetails === 'string') {
    try {
      productDetails = JSON.parse(productDetails);
    } catch (e) {
      productDetails = {};
    }
  }
  
  const mainImage = productDetails.images?.[0] || '';
  const isVendor = userRole === 'vendor';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group relative">
      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          product.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
            : product.status === 'approved'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : product.status === 'rejected'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-gray-100 text-gray-800 border border-gray-300'
        }`}>
          {product.status === 'pending' && '⏳ Pending'}
          {product.status === 'approved' && '✅ Approved'}
          {product.status === 'rejected' && '❌ Rejected'}
          {!product.status && '📝 Draft'}
        </span>
      </div>

      {/* Discount Badge */}
      {productDetails.discount > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          🎯 {productDetails.discount}% OFF
        </div>
      )}

      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={mainImage ? `https://apichandra.rxsquare.in${mainImage}` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="150" y="100" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* Image Count Badge */}
        {productDetails.images?.length > 0 && (
          <button
            onClick={() => onViewImages(productDetails.images)}
            className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm hover:bg-opacity-90 transition-colors"
            title="View Images"
          >
            📷 {productDetails.images.length}
          </button>
        )}

        {/* Action Overlay - Only show if user can edit/delete */}
        {canEditDelete && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110 shadow-lg"
                title="Edit Product"
              >
                <span className="text-lg">✏️</span>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110 shadow-lg"
                title="Delete Product"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Header with Expand Toggle */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm leading-tight">
            {product.name}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-gray-500 hover:text-gray-700 text-xs p-1 hover:bg-gray-100 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Slug */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
          <span>🔗</span>
          {product.slug}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600 flex items-center gap-1">
            <span>💰</span>
            ₹{productDetails.price?.toLocaleString() || '0'}
          </span>
          {productDetails.originalPrice > productDetails.price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{productDetails.originalPrice?.toLocaleString() || '0'}
            </span>
          )}
        </div>

        {/* Category & Gender */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
            <span>📂</span>
            {productDetails.category || 'Uncategorized'}
          </span>
          {productDetails.gender?.map(gender => (
            <span key={gender} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
              <span>👤</span>
              {gender}
            </span>
          ))}
        </div>

        {/* Vendor Info (Admin only) */}
        {userRole === 'admin' && product.vendor_name && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div className="flex items-center gap-1">
              <span>👨‍💼</span>
              <span>Vendor: <strong>{product.vendor_name}</strong></span>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 animate-slideDown">
            {/* Featured Tags */}
            {productDetails.featured?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <span>⭐</span>
                  Featured:
                </p>
                <div className="flex flex-wrap gap-1">
                  {productDetails.featured.map((tag, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Style & Metal */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">🎨</span>
                <span className="font-medium truncate" title={productDetails.style_id}>
                  {productDetails.style_id || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">💎</span>
                <span className="font-medium truncate" title={productDetails.metal_id}>
                  {productDetails.metal_id || 'N/A'}
                </span>
              </div>
            </div>

            {/* Description */}
            {productDetails.description && (
              <div>
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <span>📝</span>
                  Description:
                </p>
                <p className="text-xs font-medium line-clamp-2 text-gray-700">
                  {productDetails.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - Mobile */}
        {canEditDelete && (
          <div className="flex lg:hidden gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl z-10 hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
        
        <div className="relative">
          <img
            src={`https://apichandra.rxsquare.in${images[currentIndex]}`}
            alt={`Product ${currentIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg transition-all ${
                  idx === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-400'
                }`}
              >
                <img
                  src={`https://apichandra.rxsquare.in${img}`}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-white text-center mt-3 font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PRODUCT PANEL ====================
const EditProductPanel = ({ product, onClose, onSave, categories, userRole }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.product_details?.description || '',
    price: product.product_details?.price || 0,
    originalPrice: product.product_details?.originalPrice || product.product_details?.price || 0,
    discount: product.product_details?.discount || 0,
    featured: product.product_details?.featured || [],
    gender: product.product_details?.gender || [],
    style_id: product.product_details?.style_id || '',
    metal_id: product.product_details?.metal_id || '',
    category_id: product.category_id || '',
    hasMetalChoice: product.product_details?.hasMetalChoice || false,
    hasDiamondChoice: product.product_details?.hasDiamondChoice || false,
    selectedMetalOptions: product.product_details?.selectedMetalOptions || [],
    selectedDiamondOptions: product.product_details?.selectedDiamondOptions || [],
    selectedSizes: product.product_details?.selectedSizes || {},
    variantPricing: product.product_details?.variantPricing || {}
  });

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState(product.product_details?.images || []);
  const [activeVariantTab, setActiveVariantTab] = useState('basic');

  const FILE_TYPE_OPTIONS = ['STL File', 'CAM Product', 'Rubber Mold', 'Casting Model'];

  useEffect(() => {
    if (formData.category_id) {
      fetchCategoryDetails(formData.category_id);
    }
  }, [formData.category_id]);

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_style',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_metal_and_stone',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] }
      };
      
      if (attributesRes.data.success) {
        attributesRes.data.data.forEach(attr => {
          attributes[attr.type] = { id: attr.id, options: attr.options };
        });
      }

      setCategoryData({
        styles: stylesRes.data.data,
        metals: metalsRes.data.data,
        attributes: attributes
      });
    } catch (error) {
      console.error('Error fetching category details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (files) => {
    const fileArray = Array.from(files);
    const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...fileArray]);
    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeatured = (feature) => {
    setFormData(prev => ({
      ...prev,
      featured: prev.featured.includes(feature)
        ? prev.featured.filter(f => f !== feature)
        : [...prev.featured, feature]
    }));
  };

  const toggleGender = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter(g => g !== gender)
        : [...prev.gender, gender]
    }));
  };

  const toggleMetalChoice = () => {
    setFormData(prev => ({
      ...prev,
      hasMetalChoice: !prev.hasMetalChoice,
      selectedMetalOptions: !prev.hasMetalChoice ? [] : prev.selectedMetalOptions
    }));
  };

  const toggleDiamondChoice = () => {
    setFormData(prev => ({
      ...prev,
      hasDiamondChoice: !prev.hasDiamondChoice,
      selectedDiamondOptions: !prev.hasDiamondChoice ? [] : prev.selectedDiamondOptions
    }));
  };

  const toggleMetalOption = (optionId) => {
    setFormData(prev => ({
      ...prev,
      selectedMetalOptions: prev.selectedMetalOptions.includes(optionId)
        ? prev.selectedMetalOptions.filter(id => id !== optionId)
        : [...prev.selectedMetalOptions, optionId]
    }));
  };

  const toggleDiamondOption = (optionId) => {
    setFormData(prev => ({
      ...prev,
      selectedDiamondOptions: prev.selectedDiamondOptions.includes(optionId)
        ? prev.selectedDiamondOptions.filter(id => id !== optionId)
        : [...prev.selectedDiamondOptions, optionId]
    }));
  };

  const toggleSize = (metalId, diamondId, sizeId) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    setFormData(prev => ({
      ...prev,
      selectedSizes: {
        ...prev.selectedSizes,
        [key]: !prev.selectedSizes[key]
      }
    }));
  };

  const updateVariantPricing = (metalId, diamondId, sizeId, field, value) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    setFormData(prev => ({
      ...prev,
      variantPricing: {
        ...prev.variantPricing,
        [key]: {
          ...prev.variantPricing[key],
          [field]: value
        }
      }
    }));
  };

  const toggleVariantFileType = (metalId, diamondId, sizeId, fileType) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    const current = formData.variantPricing[key] || {};
    const currentFiles = current.file_types || [];
    const newFiles = currentFiles.includes(fileType)
      ? currentFiles.filter(f => f !== fileType)
      : [...currentFiles, fileType];
    
    setFormData(prev => ({
      ...prev,
      variantPricing: {
        ...prev.variantPricing,
        [key]: {
          ...current,
          file_types: newFiles
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      let uploadedImageUrls = [...imageUrls.filter(url => !url.startsWith('blob:'))];

      if (imageFiles.length > 0) {
        const formDataObj = new FormData();
        imageFiles.forEach(file => {
          formDataObj.append('images', file);
        });

        const uploadRes = await axios.post(`${API_URL}/upload-images`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (uploadRes.data.success) {
          uploadedImageUrls = [...uploadedImageUrls, ...uploadRes.data.data.images.map(img => img.url)];
        }
      }

      const productDetails = {
        ...product.product_details,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        featured: formData.featured,
        gender: formData.gender,
        style_id: formData.style_id,
        metal_id: formData.metal_id,
        images: uploadedImageUrls,
        category: categories.find(c => c.id == formData.category_id)?.name || '',
        hasMetalChoice: formData.hasMetalChoice,
        hasDiamondChoice: formData.hasDiamondChoice,
        selectedMetalOptions: formData.selectedMetalOptions,
        selectedDiamondOptions: formData.selectedDiamondOptions,
        selectedSizes: formData.selectedSizes,
        variantPricing: formData.variantPricing
      };

      const response = await axios.post(
        `${API_URL}/products/update`,
        {
          product_id: product.id,
          category_id: formData.category_id,
          name: formData.name,
          slug: formData.slug,
          product_details: productDetails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const variants = [];
        for (const [key, isSelected] of Object.entries(formData.selectedSizes)) {
          if (!isSelected) continue;

          const pricing = formData.variantPricing[key];
          if (!pricing || !pricing.original_price) continue;

          const [metalPart, diamondPart, sizePart] = key.split('-');
          
          variants.push({
            metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
            diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
            size_option_id: parseInt(sizePart),
            original_price: parseFloat(pricing.original_price),
            discount_price: parseFloat(pricing.discount_price) || parseFloat(pricing.original_price),
            discount_percentage: parseInt(pricing.discount_percentage) || 0,
            file_types: pricing.file_types || []
          });
        }

        if (variants.length > 0) {
          await axios.post(
            `${API_URL}/product-variants/pricing`,
            { product_id: product.id, variants },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        alert('✅ Product updated successfully');
        onSave();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const renderVariantConfiguration = () => (
    <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
      <h5 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
        ⚙️ Variant Configuration (Optional)
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Choice of Metal */}
        <div className="border-2 border-gray-200 rounded p-3">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasMetalChoice}
              onChange={toggleMetalChoice}
              className="w-5 h-5"
            />
            <span className="font-bold">🔩 Choice of Metal</span>
          </label>
          
          {formData.hasMetalChoice && (
            <div className="space-y-2">
              {categoryData?.attributes?.metal?.options?.map(opt => (
                <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={formData.selectedMetalOptions.includes(opt.id)}
                    onChange={() => toggleMetalOption(opt.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{opt.option_name}</span>
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
              checked={formData.hasDiamondChoice}
              onChange={toggleDiamondChoice}
              className="w-5 h-5"
            />
            <span className="font-bold">💎 Diamond Quality</span>
          </label>
          
          {formData.hasDiamondChoice && (
            <div className="space-y-2">
              {categoryData?.attributes?.diamond?.options?.map(opt => (
                <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
                  <input
                    type="checkbox"
                    checked={formData.selectedDiamondOptions.includes(opt.id)}
                    onChange={() => toggleDiamondOption(opt.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{opt.option_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Info */}
        <div className="border-2 border-blue-300 rounded p-3 bg-blue-50">
          <h6 className="font-bold mb-2">📏 Sizes</h6>
          <p className="text-xs text-gray-600">Configure sizes below with pricing details</p>
        </div>
      </div>

      {/* Size & Pricing Configuration */}
      <div className="mt-4">
        <h6 className="font-bold mb-3">📐 Configure Sizes & Pricing:</h6>
        
        {/* Size Only (No Metal/Diamond) */}
        {!formData.hasMetalChoice && !formData.hasDiamondChoice && (
          <div className="space-y-3">
            {categoryData?.attributes?.size?.options?.map(sizeOpt => {
              const key = `none-none-${sizeOpt.id}`;
              const isSelected = formData.selectedSizes[key];
              const pricing = formData.variantPricing[key] || {};
              
              return (
                <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3">
                  <label className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => toggleSize(null, null, sizeOpt.id)}
                      className="w-5 h-5"
                    />
                    <span className="font-bold">
                      {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                    </span>
                  </label>

                  {isSelected && (
                    <div className="ml-8 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                          <input
                            type="number"
                            placeholder="15000"
                            value={pricing.original_price || ''}
                            onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'original_price', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                          <input
                            type="number"
                            placeholder="13000"
                            value={pricing.discount_price || ''}
                            onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'discount_price', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                          <input
                            type="number"
                            placeholder="13"
                            value={pricing.discount_percentage || ''}
                            onChange={(e) => updateVariantPricing(null, null, sizeOpt.id, 'discount_percentage', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {FILE_TYPE_OPTIONS.map(fileType => (
                            <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pricing.file_types?.includes(fileType) || false}
                                onChange={() => toggleVariantFileType(null, null, sizeOpt.id, fileType)}
                                className="w-4 h-4"
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
        {formData.hasMetalChoice && !formData.hasDiamondChoice && formData.selectedMetalOptions.map(metalId => {
          const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
          return (
            <div key={metalId} className="mb-4 border-2 border-blue-200 rounded p-4 bg-blue-50">
              <h6 className="font-bold mb-3">{metalOpt?.option_name}</h6>
              <div className="space-y-3">
                {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                  const key = `${metalId}-none-${sizeOpt.id}`;
                  const isSelected = formData.selectedSizes[key];
                  const pricing = formData.variantPricing[key] || {};
                  
                  return (
                    <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                      <label className="flex items-center gap-3 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => toggleSize(metalId, null, sizeOpt.id)}
                          className="w-5 h-5"
                        />
                        <span className="font-bold">
                          {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                        </span>
                      </label>

                      {isSelected && (
                        <div className="ml-8 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                              <input
                                type="number"
                                placeholder="15000"
                                value={pricing.original_price || ''}
                                onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'original_price', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                              <input
                                type="number"
                                placeholder="13000"
                                value={pricing.discount_price || ''}
                                onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'discount_price', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                              <input
                                type="number"
                                placeholder="13"
                                value={pricing.discount_percentage || ''}
                                onChange={(e) => updateVariantPricing(metalId, null, sizeOpt.id, 'discount_percentage', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                            <div className="grid grid-cols-2 gap-2">
                              {FILE_TYPE_OPTIONS.map(fileType => (
                                <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={pricing.file_types?.includes(fileType) || false}
                                    onChange={() => toggleVariantFileType(metalId, null, sizeOpt.id, fileType)}
                                    className="w-4 h-4"
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
        {formData.hasMetalChoice && formData.hasDiamondChoice && formData.selectedMetalOptions.map(metalId => {
          const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
          return formData.selectedDiamondOptions.map(diamondId => {
            const diamondOpt = categoryData?.attributes?.diamond?.options?.find(o => o.id === diamondId);
            return (
              <div key={`${metalId}-${diamondId}`} className="mb-4 border-2 border-purple-200 rounded p-4 bg-purple-50">
                <h6 className="font-bold mb-3">{metalOpt?.option_name} + {diamondOpt?.option_name}</h6>
                <div className="space-y-3">
                  {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                    const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
                    const isSelected = formData.selectedSizes[key];
                    const pricing = formData.variantPricing[key] || {};
                    
                    return (
                      <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                        <label className="flex items-center gap-3 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() => toggleSize(metalId, diamondId, sizeOpt.id)}
                            className="w-5 h-5"
                          />
                          <span className="font-bold">
                            {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="ml-8 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">💰 Original Price *</label>
                                <input
                                  type="number"
                                  placeholder="15000"
                                  value={pricing.original_price || ''}
                                  onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'original_price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">📊 Discount Price</label>
                                <input
                                  type="number"
                                  placeholder="13000"
                                  value={pricing.discount_price || ''}
                                  onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'discount_price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">🎯 Discount %</label>
                                <input
                                  type="number"
                                  placeholder="13"
                                  value={pricing.discount_percentage || ''}
                                  onChange={(e) => updateVariantPricing(metalId, diamondId, sizeOpt.id, 'discount_percentage', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium mb-2">📁 File Types:</label>
                              <div className="grid grid-cols-2 gap-2">
                                {FILE_TYPE_OPTIONS.map(fileType => (
                                  <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={pricing.file_types?.includes(fileType) || false}
                                      onChange={() => toggleVariantFileType(metalId, diamondId, sizeOpt.id, fileType)}
                                      className="w-4 h-4"
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

  const isVendor = userRole === 'vendor';
  const canEdit = !isVendor || (isVendor && product.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>✏️</span>
            Edit Product - {product.name}
            {!canEdit && (
              <span className="text-sm font-normal text-yellow-600 ml-2">
                (Cannot edit approved/rejected products)
              </span>
            )}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-1 px-4 overflow-x-auto">
            {['basic', 'variants'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveVariantTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeVariantTab === tab
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab === 'basic' ? '📋' : '⚙️'}</span>
                <span>{tab === 'basic' ? 'Basic Information' : 'Variant Configuration'}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {activeVariantTab === 'basic' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4 sm:space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>📂</span>
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={!canEdit}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>📝</span>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        name: e.target.value, 
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Product name"
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>🔗</span>
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      readOnly
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>🎨</span>
                      Style *
                    </label>
                    <select
                      value={formData.style_id}
                      onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!categoryData || !canEdit}
                    >
                      <option value="">Select Style</option>
                      {categoryData?.styles.map(style => (
                        <option key={style.id} value={style.id}>{style.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>💎</span>
                      Metal/Stone *
                    </label>
                    <select
                      value={formData.metal_id}
                      onChange={(e) => setFormData({ ...formData, metal_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!categoryData || !canEdit}
                    >
                      <option value="">Select Metal</option>
                      {categoryData?.metals.map(metal => (
                        <option key={metal.id} value={metal.id}>{metal.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>📄</span>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Product description..."
                    disabled={!canEdit}
                  />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>💰</span>
                      Price *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>📊</span>
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <span>🎯</span>
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Features & Images */}
              <div className="space-y-4 sm:space-y-6">
                {/* Featured Options */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>⭐</span>
                    Featured Tags
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                      <label key={feature} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.featured.includes(feature)}
                          onChange={() => toggleFeatured(feature)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          disabled={!canEdit}
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>👥</span>
                    Target Gender/Age
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['Kids', 'Men', 'Women'].map(gender => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.gender.includes(gender)}
                          onChange={() => toggleGender(gender)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          disabled={!canEdit}
                        />
                        <span className="text-sm">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Management */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>🖼️</span>
                    Product Images
                  </label>
                  
                  {/* Image Upload */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageSelect(e.target.files)}
                    className="w-full text-sm mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    disabled={!canEdit}
                  />

                  {/* Image Previews */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={url.startsWith('blob:') ? url : `https://apichandra.rxsquare.in${url}`}
                            alt={`Preview ${idx + 1}`}
                            className="h-20 w-full object-cover rounded border shadow-sm group-hover:shadow-md transition-all"
                          />
                          {canEdit && (
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            canEdit ? renderVariantConfiguration() : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔒</div>
                <p className="text-lg">You cannot edit variant configuration for approved/rejected products</p>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          {canEdit ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 text-center py-2 text-gray-600">
              This product cannot be edited as it's already {product.status}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold text-sm sm:text-base transition-colors"
          >
            <span>❌</span>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ADD PRODUCTS COMPONENT ====================
const AddProducts = ({ onBack, categories, onRefresh, userRole }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
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
    { value: 'stl_file', label: 'STL File', emoji: '📄', requiresPrice: true, requiresUpload: true },
    { value: 'cam_product', label: 'CAM Product', emoji: '⚙️', requiresPrice: true, requiresUpload: true },
    { value: 'rubber_mold', label: 'Rubber Mold', emoji: '🔧', requiresPrice: false, requiresUpload: false },
    { value: 'casting_model', label: 'Casting Model', emoji: '🏭', requiresPrice: false, requiresUpload: false },
    { value: 'finished_product', label: 'Finished Product', emoji: '✨', requiresPrice: false, requiresUpload: false },
  ];

  const checkSlugUniqueness = async (slug, productId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/products/check-slug`,
        { slug, product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data.exists;
    } catch (error) {
      console.error('Slug check error:', error);
      return false;
    }
  };

  const fetchCategoryDetails = async (catId) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [stylesRes, metalsRes, attributesRes] = await Promise.all([
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_style',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.post(`${API_URL}/doAll`, {
          action: 'get',
          table: 'by_metal_and_stone',
          where: { category_id: catId }
        }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/attributes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const attributes = {
        metal: { id: null, options: [] },
        diamond: { id: null, options: [] },
        size: { id: null, options: [] }
      };
      
      if (attributesRes.data.success) {
        attributesRes.data.data.forEach(attr => {
          attributes[attr.type] = { id: attr.id, options: attr.options };
        });
      }

      setCategoryData({
        styles: stylesRes.data.data,
        metals: metalsRes.data.data,
        attributes: attributes
      });
    } catch (error) {
      console.error('Error fetching category details:', error);
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
    setSelectedStyles(prev =>
      prev.includes(styleId) ? prev.filter(id => id !== styleId) : [...prev, styleId]
    );
  };

  const toggleMetal = (metalId) => {
    setSelectedMetals(prev =>
      prev.includes(metalId) ? prev.filter(id => id !== metalId) : [...prev, metalId]
    );
  };

  const addProductRow = () => {
    const defaultStyle = selectedStyles.length > 0 ? selectedStyles[0] : '';
    const defaultMetal = selectedMetals.length > 0 ? selectedMetals[0] : '';
    
    const newProduct = {
      id: Date.now(),
      name: '',
      description: '',
      slug: '',
      style_id: defaultStyle,
      metal_id: defaultMetal,
      price: '',
      originalPrice: '',
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
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          metalSizeConfig: {
            ...p.metalSizeConfig,
            [metalId]: !p.metalSizeConfig[metalId]
          }
        };
      }
      return p;
    }));
  };

  const toggleDiamondSizeConfig = (productId, metalId, diamondId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId}-${diamondId}`;
        return {
          ...p,
          diamondSizeConfig: {
            ...p.diamondSizeConfig,
            [key]: !p.diamondSizeConfig[key]
          }
        };
      }
      return p;
    }));
  };

  const removeProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    if (activeProductTab >= products.length - 1) {
      setActiveProductTab(Math.max(0, products.length - 2));
    }
  };

  const toggleConfigureSizes = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          configureSizes: !p.configureSizes
        };
      }
      return p;
    }));
  };

  const updateProduct = async (id, field, value) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        
        if (field === 'name') {
          const newSlug = value.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          updated.slug = newSlug;
          
          checkSlugUniqueness(newSlug).then(exists => {
            setSlugErrors(prev => ({
              ...prev,
              [id]: exists ? 'This slug already exists. Please create a unique one.' : ''
            }));
          });
        }
        
        if (field === 'slug') {
          checkSlugUniqueness(value).then(exists => {
            setSlugErrors(prev => ({
              ...prev,
              [id]: exists ? 'This slug already exists. Please create a unique one.' : ''
            }));
          });
        }
        
        return updated;
      }
      return p;
    }));
  };

  const toggleProductFeatured = (productId, feature) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const featured = p.featured.includes(feature)
          ? p.featured.filter(f => f !== feature)
          : [...p.featured, feature];
        return { ...p, featured };
      }
      return p;
    }));
  };

  const toggleProductGender = (productId, gender) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const genders = p.gender.includes(gender)
          ? p.gender.filter(g => g !== gender)
          : [...p.gender, gender];
        return { ...p, gender: genders };
      }
      return p;
    }));
  };

  const handlePdfFileSelect = (productId, metalId, diamondId, sizeId, fileType, file) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        const fileKey = `${key}-${fileType}`;
        
        return {
          ...p,
          pdfFiles: {
            ...p.pdfFiles,
            [fileKey]: file
          }
        };
      }
      return p;
    }));
  };

  const handleImageSelect = (productId, files) => {
    const fileArray = Array.from(files);
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image. Please select image files only.`);
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    const previewUrls = validFiles.map(file => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating blob URL:', error);
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="75" font-family="Arial" font-size="12" text-anchor="middle" fill="%236b7280">${file.name}</text></svg>`;
      }
    });
    
    setProducts(prevProducts => 
      prevProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            imageFiles: [...p.imageFiles, ...validFiles],
            imageUrls: [...p.imageUrls, ...previewUrls]
          };
        }
        return p;
      })
    );
  };

  const removeImage = (productId, index) => {
    setProducts(prevProducts => 
      prevProducts.map(p => {
        if (p.id === productId) {
          const urlToRevoke = p.imageUrls[index];
          if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(urlToRevoke);
            } catch (error) {
              console.error('Error revoking blob URL:', error);
            }
          }
          
          return {
            ...p,
            imageFiles: p.imageFiles.filter((_, i) => i !== index),
            imageUrls: p.imageUrls.filter((_, i) => i !== index)
          };
        }
        return p;
      })
    );
  };

  const handlePdfUpload = async (productId, metalId, diamondId, sizeId, fileType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const fileKey = `${productId}-${metalId || 'none'}-${diamondId || 'none'}-${sizeId}-${fileType}`;
        setUploadedPdfFiles(prev => ({
          ...prev,
          [fileKey]: {
            file_path: response.data.data.file_path,
            file_name: response.data.data.file_name
          }
        }));
        
        setProducts(products.map(p => {
          if (p.id === productId) {
            const variantKey = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
            const current = p.variantPricing[variantKey] || {};
            const currentFiles = current.files || [];
            
            const updatedFiles = currentFiles.map(f => 
              f.file_type === fileType 
                ? { ...f, file_path: response.data.data.file_path }
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

  const toggleProductMetalChoice = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          hasMetalChoice: !p.hasMetalChoice,
          selectedMetalOptions: !p.hasMetalChoice ? [] : p.selectedMetalOptions
        };
      }
      return p;
    }));
  };

  const toggleProductDiamondChoice = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          hasDiamondChoice: !p.hasDiamondChoice,
          selectedDiamondOptions: !p.hasDiamondChoice ? [] : p.selectedDiamondOptions
        };
      }
      return p;
    }));
  };

  const toggleProductMetalOption = (productId, optionId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const selectedMetalOptions = p.selectedMetalOptions.includes(optionId)
          ? p.selectedMetalOptions.filter(id => id !== optionId)
          : [...p.selectedMetalOptions, optionId];
        
        const updatedProduct = { ...p, selectedMetalOptions };
        
        if (!p.selectedMetalOptions.includes(optionId)) {
          const directKey = `${optionId}-none-none`;
          const current = p.variantPricing[directKey] || {};
          const currentFiles = current.files || [];
          
          if (!currentFiles.some(f => f.file_type === 'stl_file')) {
            updatedProduct.variantPricing = {
              ...p.variantPricing,
              [directKey]: {
                ...current,
                files: [...currentFiles, { file_type: 'stl_file', price: null }]
              }
            };
          }
        }
        
        return updatedProduct;
      }
      return p;
    }));
  };

  const toggleProductDiamondOption = (productId, optionId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const selectedDiamondOptions = p.selectedDiamondOptions.includes(optionId)
          ? p.selectedDiamondOptions.filter(id => id !== optionId)
          : [...p.selectedDiamondOptions, optionId];
        return { ...p, selectedDiamondOptions };
      }
      return p;
    }));
  };

  const toggleProductSize = (productId, metalId, diamondId, sizeId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        const isSelecting = !p.selectedSizes[key];
        
        const updated = {
          ...p,
          selectedSizes: {
            ...p.selectedSizes,
            [key]: isSelecting
          }
        };
        
        if (isSelecting) {
          const current = p.variantPricing[key] || {};
          updated.variantPricing = {
            ...p.variantPricing,
            [key]: {
              ...current,
              files: [
                { file_type: 'stl_file', price: null }
              ]
            }
          };
        }
        
        return updated;
      }
      return p;
    }));
  };

  const updateVariantPricing = (productId, metalId, diamondId, sizeId, field, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
        return {
          ...p,
          variantPricing: {
            ...p.variantPricing,
            [key]: {
              ...p.variantPricing[key],
              [field]: value
            }
          }
        };
      }
      return p;
    }));
  };

  const updateFilePrice = (productId, metalId, diamondId, sizeId, fileType, price) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = sizeId
          ? `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`
          : `${metalId || 'none'}-${diamondId || 'none'}-none`;
        
        const current = p.variantPricing[key] || {};
        const currentFiles = current.files || [];
        
        const updatedFiles = currentFiles.map(f => 
          f.file_type === fileType ? { ...f, price: parseFloat(price) || null } : f
        );
        
        return {
          ...p,
          variantPricing: {
            ...p.variantPricing,
            [key]: {
              ...current,
              files: updatedFiles
            }
          }
        };
      }
      return p;
    }));
  };

  const toggleVariantFileType = (productId, metalId, diamondId, sizeId, fileType) => {
    if (fileType === 'stl_file') {
      alert('STL File is mandatory and cannot be removed');
      return;
    }
    
    setProducts(products.map(p => {
      if (p.id === productId) {
        const key = sizeId 
          ? `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`
          : `${metalId || 'none'}-${diamondId || 'none'}-none`;
        
        const current = p.variantPricing[key] || {};
        const currentFiles = current.files || [];
        
        const fileExists = currentFiles.some(f => f.file_type === fileType);
        
        const newFiles = fileExists
          ? currentFiles.filter(f => f.file_type !== fileType)
          : [...currentFiles, { file_type: fileType, price: null }];
        
        return {
          ...p,
          variantPricing: {
            ...p.variantPricing,
            [key]: {
              ...current,
              files: newFiles
            }
          }
        };
      }
      return p;
    }));
  };

  const saveProducts = async () => {
    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    for (const product of products) {
      if (!product.name || !product.style_id || !product.metal_id ) {
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

        const uploadedPdfFiles = {};
        if (product.pdfFiles && Object.keys(product.pdfFiles).length > 0) {
          for (const [fileKey, pdfFile] of Object.entries(product.pdfFiles)) {
            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfFile);
            
            const pdfUploadRes = await axios.post(`${API_URL}/upload-pdf`, pdfFormData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
            
            if (pdfUploadRes.data.success) {
              uploadedPdfFiles[fileKey] = pdfUploadRes.data.data.file_path;
            }
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

          if (product.selectedSizes && typeof product.selectedSizes === 'object' && Object.keys(product.selectedSizes).length > 0) {
            for (const [key, isSelected] of Object.entries(product.selectedSizes)) {
              if (!isSelected) continue;

              const pricing = product.variantPricing?.[key];
              if (!pricing) continue;

              const [metalPart, diamondPart, sizePart] = key.split('-');
              
              const files = Array.isArray(pricing.files) ? pricing.files : [];
              
              if (files.length === 0) continue;
              
              variants.push({
                metal_option_id: metalPart === 'none' ? null : parseInt(metalPart),
                diamond_option_id: diamondPart === 'none' ? null : parseInt(diamondPart),
                size_option_id: parseInt(sizePart),
                end_product_price: parseFloat(pricing.end_product_price) || null,
                end_product_discount: parseFloat(pricing.end_product_discount) || null,
                end_product_discount_percentage: parseInt(pricing.end_product_discount_percentage) || null,
                files: files.map(f => ({
                  ...f,
                  file_path: uploadedPdfFiles[`${key}-${f.file_type}`] || null  
                }))
              });
            }
          }

          if (variants.length > 0) {
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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <span className="text-xl">📦</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Add Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {userRole === 'vendor' 
                ? 'Add new products for admin approval' 
                : 'Add new products directly to catalog'}
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
      <div className="bg-blue-50 rounded-lg p-4 mb-4 sm:mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="bg-blue-500 text-white p-1 rounded">📂</span>
          Select Category
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
        >
          <option value="">-- Select a Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category Details */}
      {categoryData && selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Styles Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <span className="bg-purple-100 p-1 rounded">🎨</span>
              Available Styles
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {categoryData.styles.map(style => (
                <label key={style.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors border border-gray-200 min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={selectedStyles.includes(style.id)}
                    onChange={() => toggleStyle(style.id)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{style.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metals Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <span className="bg-yellow-100 p-1 rounded">💎</span>
              Available Metals & Stones
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {categoryData.metals.map(metal => (
                <label key={metal.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors border border-gray-200 min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={selectedMetals.includes(metal.id)}
                    onChange={() => toggleMetal(metal.id)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{metal.name}</span>
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
              {products.length} product{products.length !== 1 ? 's' : ''} added
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
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            activeProductTab === index ? 'border-blue-300 block' : 'border-gray-200 hidden'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-xl border-b">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-3">
              <span className="bg-blue-500 text-white p-2 rounded-lg">📦</span>
              <span>Product #{index + 1} - {product.name || 'New Product'}</span>
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
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  value={product.description || ''}
                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  onChange={(e) => updateProduct(product.id, 'slug', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    slugErrors[product.id] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="auto-generated-slug"
                />
                {slugErrors[product.id] && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
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
                  onChange={(e) => updateProduct(product.id, 'style_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Style</option>
                  {categoryData?.styles.map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
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
                  onChange={(e) => updateProduct(product.id, 'metal_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Metal</option>
                  {categoryData?.metals.map(metal => (
                    <option key={metal.id} value={metal.id}>{metal.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>💰</span>
                  Price *
                </label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., 15000"
                />
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
                  {['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'].map(feature => (
                    <label key={feature} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={product.featured.includes(feature)}
                        onChange={() => toggleProductFeatured(product.id, feature)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
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
                  {['Kids', 'Men', 'Women'].map(gender => (
                    <label key={gender} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors flex-1 min-w-[100px]">
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageSelect(product.id, e.target.files);
                      e.target.value = '';
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
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`image-upload-${product.id}`).click();
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
                          if (url.startsWith('blob:')) {
                            URL.revokeObjectURL(url);
                          }
                        });
                        setProducts(products.map(p => 
                          p.id === product.id 
                            ? { ...p, imageFiles: [], imageUrls: [] } 
                            : p
                        ));
                      }}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <span>🗑️</span>
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {product.imageUrls.map((url, idx) => {
                      const imgUrl = url.startsWith('blob:') 
                        ? url 
                        : url.startsWith('/') 
                          ? `https://apichandra.rxsquare.in${url}`
                          : url;
                      
                      return (
                        <div key={idx} className="relative group bg-white rounded-lg border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow">
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
                                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="80" font-family="Arial" font-size="14" text-anchor="middle" fill="%236b7280">Image ${idx + 1}</text><text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="%239ca3af">Failed to load</text></svg>`;
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
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
            <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
              <h5 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
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
                      className="w-5 h-5"
                    />
                    <span className="font-bold">🔩 Choice of Metal</span>
                  </label>
                  
                  {product.hasMetalChoice && (
                    <div className="space-y-2">
                      {categoryData?.attributes?.metal?.options?.map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
                          <input
                            type="checkbox"
                            checked={product.selectedMetalOptions.includes(opt.id)}
                            onChange={() => toggleProductMetalOption(product.id, opt.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{opt.option_name}</span>
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
                      className="w-5 h-5"
                    />
                    <span className="font-bold">💎 Diamond Quality</span>
                  </label>
                  
                  {product.hasDiamondChoice && (
                    <div className="space-y-2">
                      {categoryData?.attributes?.diamond?.options?.map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
                          <input
                            type="checkbox"
                            checked={product.selectedDiamondOptions.includes(opt.id)}
                            onChange={() => toggleProductDiamondOption(product.id, opt.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{opt.option_name}</span>
                        </label>
                      ))}
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
                      className="w-5 h-5"
                    />
                    <span className="font-bold">📏 Configure Sizes with Pricing</span>
                  </label>
                  <p className="text-xs text-gray-600 ml-7">
                    {product.hasMetalChoice || product.hasDiamondChoice 
                      ? "✅ Size configuration is active (required for variants)" 
                      : "Check this to configure pricing for individual sizes"}
                  </p>
                </div>
              </div>

              {/* Size & Pricing Configuration */}
              {(product.hasMetalChoice || product.hasDiamondChoice || product.configureSizes) && (
                <div className="mt-4">
                  <h6 className="font-bold mb-3">📐 Configure Variants:</h6>
                  
                  {/* Size Only (No Metal/Diamond) */}
                  {!product.hasMetalChoice && !product.hasDiamondChoice && (
                    <div className="space-y-3">
                      {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                        const key = `none-none-${sizeOpt.id}`;
                        const isSelected = product.selectedSizes[key];
                        const pricing = product.variantPricing[key] || {};
                        
                        return (
                          <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3">
                            <label className="flex items-center gap-3 mb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={() => toggleProductSize(product.id, null, null, sizeOpt.id)}
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
                                    {FILE_TYPE_OPTIONS.map(fileOption => {
                                      const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
                                      const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
                                      const fileKey = `${product.id}-none-none-${sizeOpt.id}-${fileOption.value}`;
                                      const uploadedFile = uploadedPdfFiles[fileKey];
                                      const isSTL = fileOption.value === 'stl_file';
                                      
                                      return (
                                        <div key={fileOption.value} className="border rounded p-3 bg-white">
                                          <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                              type="checkbox"
                                              checked={isFileSelected}
                                              onChange={() => !isSTL && toggleVariantFileType(product.id, null, null, sizeOpt.id, fileOption.value)}
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
                                                    🟩 {fileOption.label} Price {isSTL && '*'}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mb-2">
                                                    {isSTL 
                                                      ? 'This price will be displayed to customers (Required)'
                                                      : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`
                                                    }
                                                  </p>
                                                  <input
                                                    type="number"
                                                    placeholder={isSTL ? "Enter price (required)" : "Enter price"}
                                                    value={filePrice}
                                                    onChange={(e) => updateFilePrice(product.id, null, null, sizeOpt.id, fileOption.value, e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
                                                    required={isSTL}
                                                  />
                                                  {isSTL && !filePrice && (
                                                    <p className="text-xs text-red-600 mt-1">STL price is required</p>
                                                  )}
                                                </div>
                                              )}
                                              
                                              {fileOption.requiresUpload !== false && (
                                                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                                  <label className="block text-xs font-semibold text-purple-800 mb-2">
                                                    📎 Upload {fileOption.label} {isSTL && '(Optional)'}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept=".pdf,.stl,.zip,.cam"
                                                    onChange={(e) => {
                                                      if (e.target.files[0]) {
                                                        handlePdfUpload(product.id, null, null, sizeOpt.id, fileOption.value, e.target.files[0]);
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
                                                <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
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
                                                <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? "opacity-50 cursor-not-allowed" : ""}`}>
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
                                                          {isSTL ? "This price will be displayed to customers (Required)" : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`}
                                                        </p>
                                                        <input
                                                          type="number"
                                                          placeholder={isSTL ? "Enter price (required)" : "Enter price"}
                                                          value={filePrice}
                                                          onChange={(e) => updateFilePrice(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.value)}
                                                          className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? "border-red-500" : ""}`}
                                                          required={isSTL}
                                                        />
                                                        {isSTL && !filePrice && (
                                                          <p className="text-xs text-red-600 mt-1">STL price is required</p>
                                                        )}
                                                      </div>
                                                    )}

                                                    {fileOption.requiresUpload !== false && (
                                                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                                        <label className="block text-xs font-semibold text-purple-800 mb-2">
                                                          📎 Upload {fileOption.label} {isSTL && "(Optional)"}
                                                        </label>
                                                        <input
                                                          type="file"
                                                          accept=".pdf,.stl,.zip,.cam"
                                                          onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                              handlePdfUpload(product.id, metalId, null, sizeOpt.id, fileOption.value, e.target.files[0]);
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
                                                      <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
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
                                          <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                            <label className="block text-xs font-semibold text-purple-800 mb-2">
                                              📎 Upload {fileOption.label}
                                            </label>
                                            <input
                                              type="file"
                                              accept=".pdf,.stl,.zip,.cam"
                                              onChange={(e) => {
                                                if (e.target.files[0]) {
                                                  handlePdfUpload(product.id, metalId, null, null, fileOption.value, e.target.files[0]);
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
                                          <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
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
                  {product.hasMetalChoice && product.hasDiamondChoice && product.selectedMetalOptions.map(metalId => {
                    const metalOpt = categoryData?.attributes?.metal?.options?.find(o => o.id === metalId);
                    return product.selectedDiamondOptions.map(diamondId => {
                      const diamondOpt = categoryData?.attributes?.diamond?.options?.find(o => o.id === diamondId);
                      const comboKey = `${metalId}-${diamondId}`;
                      const useSizeConfig = product.diamondSizeConfig[comboKey];
                      
                      return (
                        <div key={comboKey} className="mb-4 border-2 border-purple-200 rounded p-4 bg-purple-50">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-bold flex items-center gap-2">
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
                                onChange={() => toggleDiamondSizeConfig(product.id, metalId, diamondId)}
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-semibold">+ Config with Sizes</span>
                            </label>
                          </div>

                          {useSizeConfig ? (
                            <div className="space-y-3">
                              {categoryData?.attributes?.size?.options?.map(sizeOpt => {
                                const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
                                const isSelected = product.selectedSizes[key];
                                const pricing = product.variantPricing[key] || {};
                                
                                return (
                                  <div key={sizeOpt.id} className="border-2 border-gray-200 rounded p-3 bg-white">
                                    <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isSelected || false}
                                        onChange={() => toggleProductSize(product.id, metalId, diamondId, sizeOpt.id)}
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
                                            {FILE_TYPE_OPTIONS.map(fileOption => {
                                              const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
                                              const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
                                              const fileKey = `${product.id}-${metalId}-${diamondId}-${sizeOpt.id}-${fileOption.value}`;
                                              const uploadedFile = uploadedPdfFiles[fileKey];
                                              const isSTL = fileOption.value === "stl_file";
                                              
                                              return (
                                                <div key={fileOption.value} className="border rounded p-3 bg-white">
                                                  <label className={`flex items-center gap-2 text-sm cursor-pointer mb-2 ${isSTL ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                    <input
                                                      type="checkbox"
                                                      checked={isFileSelected}
                                                      onChange={() =>
                                                        !isSTL &&
                                                        toggleVariantFileType(product.id, metalId, diamondId, sizeOpt.id, fileOption.value)
                                                      }
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
                                                              : `If the customer selects ${fileOption.label.toLowerCase()}, this price will be shown.`
                                                            }
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
                                                                sizeOpt.id,
                                                                fileOption.value,
                                                                e.target.value
                                                              )
                                                            }
                                                            className={`w-full px-3 py-2 border rounded text-sm ${
                                                              isSTL && !filePrice ? "border-red-500" : ""
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
                                                        <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                                          <label className="block text-xs font-semibold text-purple-800 mb-2">
                                                            📎 Upload {fileOption.label} {isSTL && "(Optional)"}
                                                          </label>
                                                          <input
                                                            type="file"
                                                            accept=".pdf,.stl,.zip,.cam"
                                                            onChange={(e) => {
                                                              if (e.target.files[0]) {
                                                                handlePdfUpload(product.id, metalId, diamondId, sizeOpt.id, fileOption.value, e.target.files[0]);
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
                                                        <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
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
                                  const directKey = `${metalId}-${diamondId}-none`;
                                  const pricing = product.variantPricing[directKey] || {};
                                  const isFileSelected = pricing.files?.some(f => f.file_type === fileOption.value) || false;
                                  const filePrice = pricing.files?.find(f => f.file_type === fileOption.value)?.price || '';
                                  const fileKey = `${product.id}-${metalId}-${diamondId}-direct-${fileOption.value}`;
                                  const uploadedFile = uploadedPdfFiles[fileKey];
                                  const isSTL = fileOption.value === 'stl_file';
                                  
                                  const shouldShowSTL = isSTL && product.selectedMetalOptions.includes(metalId) && 
                                                        product.selectedDiamondOptions.includes(diamondId);
                                  
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
                                              toggleVariantFileType(product.id, metalId, diamondId, null, fileOption.value);
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
                                                  updateFilePrice(product.id, metalId, diamondId, null, fileOption.value, e.target.value);
                                                }}
                                                className={`w-full px-3 py-2 border rounded text-sm ${isSTL && !filePrice ? 'border-red-500' : ''}`}
                                              />
                                            </div>
                                          )}
                                          
                                          {fileOption.requiresUpload !== false && (
                                            <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                              <label className="block text-xs font-semibold text-purple-800 mb-2">
                                                📎 Upload {fileOption.label}
                                              </label>
                                              <input
                                                type="file"
                                                accept=".pdf,.stl,.zip,.cam"
                                                onChange={(e) => {
                                                  if (e.target.files[0]) {
                                                    handlePdfUpload(product.id, metalId, diamondId, null, fileOption.value, e.target.files[0]);
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
                                            <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded border border-blue-200">
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
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Saving All Products...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save {products.length} Product{products.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Vendor Note */}
      {userRole === 'vendor' && products.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⏳</span>
            <p className="text-sm">
              <strong>Note:</strong> All products added by vendors require admin approval before appearing on the website.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
