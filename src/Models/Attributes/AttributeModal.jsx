import { useState, useEffect } from 'react';
import { Plus, X, Loader, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoAll } from '../../api/auth';
import toast from 'react-hot-toast';

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 transition-colors duration-200 text-sm"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const OptionItem = ({ option, index, onUpdate, onRemove, attributeType, isLast }) => {
  // Auto-generate value from name
  const handleNameChange = (value) => {
    // Update the name
    onUpdate(index, 'option_name', value);
    
    // Auto-generate value from name (lowercase, hyphenated)
    const autoValue = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onUpdate(index, 'option_value', autoValue);
  };

  return (
    <div className="flex gap-2 items-start mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 grid grid-cols-1 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Option Name *
          </label>
          <input
            type="text"
            value={option.option_name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 text-sm"
            placeholder={
              attributeType === 'metal' ? 'e.g., 14KT Yellow Gold' :
              attributeType === 'diamond' ? 'e.g., GH-SI Quality' :
              'e.g., Size 5'
            }
            required
          />
        </div>

        {/* Hidden auto-generated value display (read-only) */}
        {/* <div className="bg-gray-100 px-3 py-2 rounded border border-gray-200">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Auto-generated Value
          </label>
          <div className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded border">
            {option.option_value || 'will be generated...'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This value is automatically generated from the option name
          </p>
        </div> */}

        {attributeType === 'size' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Size in MM *
            </label>
            <input
              type="text"
              value={option.size_mm || ''}
              onChange={(e) => onUpdate(index, 'size_mm', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 text-sm"
              placeholder="e.g., 15.7"
              required
            />
          </div>
        )}
      </div>
      
      {!isLast && (
        <button
          onClick={() => onRemove(index)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-xs font-medium mt-2"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const AttributeModal = ({ 
  showModal, 
  setShowModal, 
  editingAttribute, 
  fetchAttributes 
}) => {
  const [options, setOptions] = useState([{ option_name: '', option_value: '', size_mm: '' }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAttribute && showModal) {
      loadAttributeData();
    } else if (showModal) {
      resetForm();
    }
  }, [editingAttribute, showModal]);

  const loadAttributeData = () => {
    setLoading(true);
    try {
      if (editingAttribute?.options && editingAttribute.options.length > 0) {
        setOptions(editingAttribute.options.map(opt => ({
          option_name: opt.option_name || '',
          option_value: opt.option_value || '',
          size_mm: opt.size_mm || ''
        })));
      } else {
        setOptions([{ option_name: '', option_value: '', size_mm: '' }]);
      }
    } catch (error) {
      console.error('Error loading attribute data:', error);
      toast.error('Error loading attribute data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOptions([{ option_name: '', option_value: '', size_mm: '' }]);
  };

  const addOption = () => {
    setOptions([...options, { option_name: '', option_value: '', size_mm: '' }]);
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    // Validate form
    const validOptions = options.filter(opt => {
      if (!opt.option_name.trim()) return false;
      if (editingAttribute?.type === 'size' && !opt.size_mm.trim()) return false;
      return true;
    });

    if (validOptions.length === 0) {
      toast.error('Please add at least one valid option');
      return;
    }

    setSaving(true);

    try {
      if (editingAttribute?.id) {
        // Add options to existing attribute
        for (const option of validOptions) {
          await DoAll({
            action: 'insert',
            table: 'attribute_options',
            data: {
              attribute_id: editingAttribute.id,
              option_name: option.option_name,
              option_value: option.option_value || this.generateSlug(option.option_name),
              size_mm: editingAttribute.type === 'size' ? option.size_mm : null
            }
          });
        }
        
        toast.success('Options added successfully!');
      } else if (editingAttribute) {
        // Create new attribute
        const attributeName = 
          editingAttribute.type === 'metal' ? 'Choice of Metal' : 
          editingAttribute.type === 'diamond' ? 'Diamond Quality' : 'Size';

        // First create the attribute
        const attributeResponse = await DoAll({
          action: 'insert',
          table: 'attributes',
          data: {
            name: attributeName,
            type: editingAttribute.type
          }
        });
        
        if (attributeResponse.data.success) {
          const newAttributeId = attributeResponse.data.data.id;
          
          // Then add all options
          for (const option of validOptions) {
            await DoAll({
              action: 'insert',
              table: 'attribute_options',
              data: {
                attribute_id: newAttributeId,
                option_name: option.option_name,
                option_value: option.option_value || this.generateSlug(option.option_name),
                size_mm: editingAttribute.type === 'size' ? option.size_mm : null
              }
            });
          }
          
          toast.success('Attribute created successfully!');
        }
      }

      if (fetchAttributes) fetchAttributes();
      handleClose();
    } catch (error) {
      console.error('Error saving attribute:', error);
      toast.error('Error saving attribute');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to generate slug
  const generateSlug = (text) => {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getAttributeTitle = () => {
    if (!editingAttribute) return 'Add Attribute';
    return `Manage ${editingAttribute.name}`;
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300
            }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-emerald-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {getAttributeTitle()}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="ml-2 text-gray-600 text-sm">Loading attribute details...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-emerald-800 mb-1">
                      {editingAttribute?.name}
                    </h3>
                    <p className="text-xs text-emerald-600">
                      {editingAttribute?.type === 'size' 
                        ? 'Add size options with corresponding measurements'
                        : 'Add available options for this attribute'
                      }
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Options {editingAttribute?.type === 'size' && '(Size)'}
                    </h3>
                    <button
                      onClick={addOption}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {options.map((option, index) => (
                      <OptionItem
                        key={index}
                        option={option}
                        index={index}
                        onUpdate={updateOption}
                        onRemove={removeOption}
                        attributeType={editingAttribute?.type}
                        isLast={options.length === 1}
                      />
                    ))}
                  </div>

                  {editingAttribute?.type === 'size' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> For size attributes, please provide both the option name and measurement in millimeters.
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700">
                      <strong>How it works:</strong> Enter the option name, and the value will be automatically generated as a URL-friendly slug.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-emerald-100 bg-white">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50 min-w-[100px]"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <span>
                  {saving ? 'Saving...' : editingAttribute?.id ? 'Add Options' : 'Create'}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttributeModal;