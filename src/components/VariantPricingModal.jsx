// import { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:3019/api/v1/dashboard';

// const VariantPricingModal = ({ product, attributes, onClose, onSave }) => {
//   const [hasMetalChoice, setHasMetalChoice] = useState(false);
//   const [hasDiamondChoice, setHasDiamondChoice] = useState(false);
//   const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  
//   const [selectedMetalOptions, setSelectedMetalOptions] = useState([]);
//   const [selectedDiamondOptions, setSelectedDiamondOptions] = useState([]);
//   const [selectedSizes, setSelectedSizes] = useState({});
//   const [prices, setPrices] = useState({});
//   const [saving, setSaving] = useState(false);


//     const productId = product.dbId || product.id;

//  if (!productId || productId > 2147483647) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg p-6 max-w-md">
//           <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Error</h3>
//           <p className="mb-4">Please save the product first before configuring variants.</p>
//           <button
//             onClick={onClose}
//             className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }


//   const toggleMetalOption = (optionId) => {
//     if (hasDiamondChoice && selectedDiamondOptions.length === 0) {
//       alert('⚠️ Please select at least one Diamond Quality option first!');
//       return;
//     }

//     setSelectedMetalOptions(prev =>
//       prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
//     );
//   };

//   const toggleDiamondOption = (optionId) => {
//     setSelectedDiamondOptions(prev =>
//       prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
//     );
//   };

//   const toggleSize = (metalId, diamondId, sizeId) => {
//     const key = `${metalId}-${diamondId}-${sizeId}`;
//     setSelectedSizes(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   const updatePrice = (metalId, diamondId, sizeId, price) => {
//     const key = `${metalId}-${diamondId}-${sizeId}`;
//     setPrices(prev => ({
//       ...prev,
//       [key]: price
//     }));
//   };

//   const handleSaveChanges = async () => {
//     // Validate all selected sizes have prices
//     for (const [key, isSelected] of Object.entries(selectedSizes)) {
//       if (isSelected && (!prices[key] || prices[key] <= 0)) {
//         alert('⚠️ Please enter valid prices for all selected sizes!');
//         return;
//       }
//     }

//     setSaving(true);
//     const token = localStorage.getItem('token');

//     try {
//       const variants = [];

//       if (hasMetalChoice && !hasDiamondChoice) {
//         // Only Metal Choice
//         for (const metalId of selectedMetalOptions) {
//           const size_prices = [];
//           for (const [key, isSelected] of Object.entries(selectedSizes)) {
//             if (isSelected && key.startsWith(`${metalId}-null-`)) {
//               const sizeId = parseInt(key.split('-')[2]);
//               size_prices.push({
//                 size_option_id: sizeId,
//                 price: parseFloat(prices[key])
//               });
//             }
//           }
//           if (size_prices.length > 0) {
//             variants.push({
//               metal_option_id: metalId,
//               diamond_option_id: null,
//               size_prices
//             });
//           }
//         }
//       } else if (hasMetalChoice && hasDiamondChoice) {
//         // Both Metal + Diamond
//         for (const metalId of selectedMetalOptions) {
//           for (const diamondId of selectedDiamondOptions) {
//             const size_prices = [];
//             for (const [key, isSelected] of Object.entries(selectedSizes)) {
//               if (isSelected && key.startsWith(`${metalId}-${diamondId}-`)) {
//                 const sizeId = parseInt(key.split('-')[2]);
//                 size_prices.push({
//                   size_option_id: sizeId,
//                   price: parseFloat(prices[key])
//                 });
//               }
//             }
//             if (size_prices.length > 0) {
//               variants.push({
//                 metal_option_id: metalId,
//                 diamond_option_id: diamondId,
//                 size_prices
//               });
//             }
//           }
//         }
//       }

//       if (variants.length === 0) {
//         alert('⚠️ Please select at least one size with a price!');
//         setSaving(false);
//         return;
//       }

//       const response = await axios.post(
//         `${API_URL}/product-variants/pricing`,
//         {
//           product_id: productId,
//           variants
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert('✅ Variant pricing saved successfully!');
//         onSave();
//         onClose();
//       }
//     } catch (error) {
//       console.error('Save variant pricing error:', error);
//       alert('❌ Error saving variant pricing');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const renderSizeAndPriceInputs = (metalId, diamondId) => {
//     return (
//       <div className="mt-4 space-y-3">
//         <h5 className="font-semibold text-sm">Select Sizes & Enter Prices:</h5>
//         {attributes?.size?.options?.map(sizeOpt => {
//           const key = `${metalId}-${diamondId}-${sizeOpt.id}`;
//           const isSelected = selectedSizes[key];
          
//           return (
//             <div key={sizeOpt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
//               <input
//                 type="checkbox"
//                 checked={isSelected || false}
//                 onChange={() => toggleSize(metalId, diamondId, sizeOpt.id)}
//                 className="w-4 h-4"
//               />
//               <span className="font-medium flex-1">
//                 {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
//               </span>
//               {isSelected && (
//                 <input
//                   type="number"
//                   placeholder="Enter price"
//                   value={prices[key] || ''}
//                   onChange={(e) => updatePrice(metalId, diamondId, sizeOpt.id, e.target.value)}
//                   className="w-32 px-3 py-1 border border-gray-300 rounded-md"
//                 />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-bold">Configure Product Variants</h3>
//           <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">×</button>
//         </div>

//         {/* Step 1: Choice of Metal */}
//         <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
//           <div className="flex items-center gap-3 mb-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={hasMetalChoice}
//                 onChange={(e) => {
//                   setHasMetalChoice(e.target.checked);
//                   if (!e.target.checked) {
//                     setSelectedMetalOptions([]);
//                     setShowOptionsPopup(false);
//                   }
//                 }}
//                 className="w-5 h-5"
//               />
//               <span className="font-semibold text-lg">Choice of Metal</span>
//             </label>
//           </div>

//           {hasMetalChoice && (
//             <button
//               onClick={() => setShowOptionsPopup(true)}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 animate-bounce"
//             >
//               🔧 View All Options - Click Here!
//             </button>
//           )}
//         </div>

//         {/* Step 2: Diamond Quality */}
//         <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
//           <div className="flex items-center gap-3 mb-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={hasDiamondChoice}
//                 onChange={(e) => {
//                   setHasDiamondChoice(e.target.checked);
//                   if (!e.target.checked) {
//                     setSelectedDiamondOptions([]);
//                   }
//                 }}
//                 className="w-5 h-5"
//               />
//               <span className="font-semibold text-lg">Diamond Quality</span>
//             </label>
//           </div>

//           {hasDiamondChoice && hasMetalChoice && (
//             <button
//               onClick={() => setShowOptionsPopup(true)}
//               className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 animate-bounce"
//             >
//               💎 View All Options - Click Here!
//             </button>
//           )}
//         </div>

//         {/* Options Popup */}
//         {showOptionsPopup && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-bold">Select Options & Configure Pricing</h3>
//                 <button
//                   onClick={() => setShowOptionsPopup(false)}
//                   className="text-gray-600 hover:text-gray-900 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Left: Metal Options */}
//                 <div className="border-2 border-gray-200 rounded-lg p-4">
//                   <h4 className="font-bold text-lg mb-4">Choice of Metal</h4>
//                   <div className="space-y-2">
//                     {attributes?.metal?.options?.map(opt => (
//                       <label
//                         key={opt.id}
//                         className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectedMetalOptions.includes(opt.id)}
//                           onChange={() => toggleMetalOption(opt.id)}
//                           className="w-5 h-5"
//                         />
//                         <span className="font-medium">{opt.option_name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Right: Diamond Options */}
//                 {hasDiamondChoice && (
//                   <div className="border-2 border-gray-200 rounded-lg p-4">
//                     <h4 className="font-bold text-lg mb-4">Diamond Quality</h4>
//                     <p className="text-sm text-orange-600 mb-3">
//                       ⚠️ Please select metal options first, then choose diamond quality
//                     </p>
//                     <div className="space-y-2">
//                       {attributes?.diamond?.options?.map(opt => (
//                         <label
//                           key={opt.id}
//                           className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-purple-50"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={selectedDiamondOptions.includes(opt.id)}
//                             onChange={() => toggleDiamondOption(opt.id)}
//                             className="w-5 h-5"
//                           />
//                           <span className="font-medium">{opt.option_name}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Size & Price Inputs */}
//               {selectedMetalOptions.length > 0 && (
//                 <div className="mt-6 space-y-6">
//                   {selectedMetalOptions.map(metalId => {
//                     const metalOpt = attributes?.metal?.options?.find(o => o.id === metalId);
                    
//                     if (hasDiamondChoice && selectedDiamondOptions.length > 0) {
//                       return selectedDiamondOptions.map(diamondId => {
//                         const diamondOpt = attributes?.diamond?.options?.find(o => o.id === diamondId);
//                         return (
//                           <div key={`${metalId}-${diamondId}`} className="border-2 border-blue-200 rounded-lg p-4">
//                             <h5 className="font-bold text-lg mb-2">
//                               {metalOpt?.option_name} + {diamondOpt?.option_name}
//                             </h5>
//                             {renderSizeAndPriceInputs(metalId, diamondId)}
//                           </div>
//                         );
//                       });
//                     } else {
//                       return (
//                         <div key={metalId} className="border-2 border-blue-200 rounded-lg p-4">
//                           <h5 className="font-bold text-lg mb-2">{metalOpt?.option_name}</h5>
//                           {renderSizeAndPriceInputs(metalId, null)}
//                         </div>
//                       );
//                     }
//                   })}
//                 </div>
//               )}

//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={handleSaveChanges}
//                   disabled={saving}
//                   className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400"
//                 >
//                   {saving ? 'Saving...' : '💾 Save All Changes'}
//                 </button>
//                 <button
//                   onClick={() => setShowOptionsPopup(false)}
//                   className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VariantPricingModal;


































import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3019/api/v1/dashboard';

const FILE_TYPE_OPTIONS = ['STL File', 'CAM Product', 'Rubber Mold', 'Casting Model'];

const VariantPricingModal = ({ product, attributes, onClose, onSave }) => {
  const [hasMetalChoice, setHasMetalChoice] = useState(false);
  const [hasDiamondChoice, setHasDiamondChoice] = useState(false);
  
  const [selectedMetalOptions, setSelectedMetalOptions] = useState([]);
  const [selectedDiamondOptions, setSelectedDiamondOptions] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  
  // Pricing data: { "metal-diamond-size": { original_price, discount_price, discount_percentage, file_types: [] } }
  const [pricingData, setPricingData] = useState({});
  const [saving, setSaving] = useState(false);

  const productId = product.dbId || product.id;

  if (!productId || productId > 2147483647) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Error</h3>
          <p className="mb-4">Please save the product first before configuring variants.</p>
          <button onClick={onClose} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const toggleMetalOption = (optionId) => {
    setSelectedMetalOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const toggleDiamondOption = (optionId) => {
    setSelectedDiamondOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const toggleSize = (metalId, diamondId, sizeId) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    setSelectedSizes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updatePricingField = (metalId, diamondId, sizeId, field, value) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    setPricingData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const toggleFileType = (metalId, diamondId, sizeId, fileType) => {
    const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeId}`;
    setPricingData(prev => {
      const current = prev[key] || {};
      const currentFiles = current.file_types || [];
      const newFiles = currentFiles.includes(fileType)
        ? currentFiles.filter(f => f !== fileType)
        : [...currentFiles, fileType];
      
      return {
        ...prev,
        [key]: {
          ...current,
          file_types: newFiles
        }
      };
    });
  };

  const handleSaveChanges = async () => {
    const variants = [];

    // Build variants from selected sizes and pricing data
    for (const [key, isSelected] of Object.entries(selectedSizes)) {
      if (!isSelected) continue;

      const pricing = pricingData[key];
      if (!pricing || !pricing.original_price) {
        alert('⚠️ Please enter original price for all selected sizes!');
        return;
      }

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

    if (variants.length === 0) {
      alert('⚠️ Please select at least one size and configure pricing!');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${API_URL}/product-variants/pricing`,
        { product_id: productId, variants },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Variant pricing saved successfully!');
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Save variant pricing error:', error);
      alert('❌ Error saving variant pricing');
    } finally {
      setSaving(false);
    }
  };

  const renderSizePricingInputs = (metalId, diamondId) => {
    return (
      <div className="mt-4 space-y-4">
        <h5 className="font-semibold text-sm">Select Sizes & Configure Pricing:</h5>
        {attributes?.size?.options?.map(sizeOpt => {
          const key = `${metalId || 'none'}-${diamondId || 'none'}-${sizeOpt.id}`;
          const isSelected = selectedSizes[key];
          const pricing = pricingData[key] || {};
          
          return (
            <div key={sizeOpt.id} className="border-2 border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={() => toggleSize(metalId, diamondId, sizeOpt.id)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-lg">
                  {sizeOpt.option_name} {sizeOpt.size_mm && `(${sizeOpt.size_mm}mm)`}
                </span>
              </label>

              {isSelected && (
                <div className="ml-8 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Original Price *</label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={pricing.original_price || ''}
                        onChange={(e) => updatePricingField(metalId, diamondId, sizeOpt.id, 'original_price', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Discount Price</label>
                      <input
                        type="number"
                        placeholder="13000"
                        value={pricing.discount_price || ''}
                        onChange={(e) => updatePricingField(metalId, diamondId, sizeOpt.id, 'discount_price', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Discount %</label>
                      <input
                        type="number"
                        placeholder="13"
                        value={pricing.discount_percentage || ''}
                        onChange={(e) => updatePricingField(metalId, diamondId, sizeOpt.id, 'discount_percentage', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">File Types:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FILE_TYPE_OPTIONS.map(fileType => (
                        <label key={fileType} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pricing.file_types?.includes(fileType) || false}
                            onChange={() => toggleFileType(metalId, diamondId, sizeOpt.id, fileType)}
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
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Configure Product Variants</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">×</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Choice of Metal */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasMetalChoice}
                onChange={(e) => {
                  setHasMetalChoice(e.target.checked);
                  if (!e.target.checked) setSelectedMetalOptions([]);
                }}
                className="w-5 h-5"
              />
              <span className="font-bold text-lg">Choice of Metal</span>
            </label>
            
            {hasMetalChoice && (
              <div className="space-y-2">
                {attributes?.metal?.options?.map(opt => (
                  <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={selectedMetalOptions.includes(opt.id)}
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
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiamondChoice}
                onChange={(e) => {
                  setHasDiamondChoice(e.target.checked);
                  if (!e.target.checked) setSelectedDiamondOptions([]);
                }}
                className="w-5 h-5"
              />
              <span className="font-bold text-lg">Diamond Quality</span>
            </label>
            
            {hasDiamondChoice && (
              <div className="space-y-2">
                {attributes?.diamond?.options?.map(opt => (
                  <label key={opt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-purple-50">
                    <input
                      type="checkbox"
                      checked={selectedDiamondOptions.includes(opt.id)}
                      onChange={() => toggleDiamondOption(opt.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.option_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Size (Always visible) */}
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <h4 className="font-bold text-lg mb-3">Sizes (Required)</h4>
            <p className="text-xs text-gray-600 mb-3">Configure sizes alone or with metal/diamond options</p>
          </div>
        </div>

        {/* Size & Pricing Configuration */}
        <div className="mt-6 space-y-6">
          {!hasMetalChoice && !hasDiamondChoice && (
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <h5 className="font-bold text-lg mb-2">Size Only Configuration</h5>
              {renderSizePricingInputs(null, null)}
            </div>
          )}

          {hasMetalChoice && !hasDiamondChoice && selectedMetalOptions.map(metalId => {
            const metalOpt = attributes?.metal?.options?.find(o => o.id === metalId);
            return (
              <div key={metalId} className="border-2 border-blue-200 rounded-lg p-4">
                <h5 className="font-bold text-lg mb-2">{metalOpt?.option_name}</h5>
                {renderSizePricingInputs(metalId, null)}
              </div>
            );
          })}

          {hasMetalChoice && hasDiamondChoice && selectedMetalOptions.map(metalId => {
            const metalOpt = attributes?.metal?.options?.find(o => o.id === metalId);
            return selectedDiamondOptions.map(diamondId => {
              const diamondOpt = attributes?.diamond?.options?.find(o => o.id === diamondId);
              return (
                <div key={`${metalId}-${diamondId}`} className="border-2 border-blue-200 rounded-lg p-4">
                  <h5 className="font-bold text-lg mb-2">
                    {metalOpt?.option_name} + {diamondOpt?.option_name}
                  </h5>
                  {renderSizePricingInputs(metalId, diamondId)}
                </div>
              );
            });
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : '💾 Save All Configurations'}
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantPricingModal;