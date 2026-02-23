import { useState, useEffect } from "react";
import { Plus, X, Loader, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DoAll } from "../../api/auth";
import toast from "react-hot-toast";

const OptionItem = ({
  option,
  index,
  onUpdate,
  onRemove,
  attributeType,
  isLast,
}) => {
  // Handle name change — batch both option_name and option_value in ONE update
  const handleNameChange = (value) => {
    const nameSlug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const currentValue = option.option_value || "";
    const oldNameSlug = (option.option_name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Only auto-update value if it's empty or was previously auto-generated
    const shouldUpdateValue = !currentValue || currentValue === oldNameSlug;

    // ✅ Single batched update — prevents double re-render / focus loss
    onUpdate(index, {
      option_name: value,
      ...(shouldUpdateValue && { option_value: nameSlug }),
    });
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
            value={option.option_name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 text-sm"
            placeholder={
              attributeType === "metal"
                ? "e.g., 14KT Yellow Gold"
                : attributeType === "diamond"
                  ? "e.g., GH-SI Quality"
                  : "e.g., Size 5"
            }
            required
          />
          {option.id && (
            <p className="text-xs text-gray-500 mt-1">
              Existing option ID: {option.id}
            </p>
          )}

          {/* Show the auto-generated value */}
          <div className="mt-1 p-1 bg-gray-100 rounded text-xs">
            <span className="text-gray-600">Value will be: </span>
            <span className="font-mono text-gray-800">
              {option.option_value || "auto-generated from name"}
            </span>
          </div>
        </div>

        {attributeType === "size" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Size in MM *
            </label>
            <input
              type="text"
              value={option.size_mm || ""}
              onChange={(e) => onUpdate(index, { size_mm: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-400 text-sm"
              placeholder="e.g., 15.7"
              required
            />
          </div>
        )}
      </div>

      {!isLast && (
        <button
          type="button"
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
  fetchAttributes,
}) => {
  const [options, setOptions] = useState([]);
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
        setOptions(
          editingAttribute.options.map((opt) => ({
            id: opt.id,
            option_name: opt.option_name || "",
            option_value: opt.option_value || "",
            size_mm: opt.size_mm || "",
          }))
        );
      } else {
        setOptions([{ option_name: "", option_value: "", size_mm: "" }]);
      }
    } catch (error) {
      console.error("Error loading attribute data:", error);
      toast.error("Error loading attribute data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOptions([{ option_name: "", option_value: "", size_mm: "" }]);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { option_name: "", option_value: "", size_mm: "" },
    ]);
  };

  // ✅ Updated to accept a fields object for batched updates
  const updateOption = (index, fields) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };
      return updated;
    });
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

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSave = async () => {
    const validOptions = options.filter((opt) => {
      if (!opt.option_name.trim()) return false;
      if (editingAttribute?.type === "size" && !opt.size_mm.trim())
        return false;
      return true;
    });

    if (validOptions.length === 0) {
      toast.error("Please add at least one valid option");
      return;
    }

    const optionNames = new Set();
    for (const option of validOptions) {
      const name = option.option_name.trim().toLowerCase();
      if (optionNames.has(name)) {
        toast.error(`Duplicate option name: "${option.option_name}"`);
        return;
      }
      optionNames.add(name);
    }

    setSaving(true);

    try {
      if (editingAttribute?.id) {
        await saveAttributeOptions(editingAttribute.id, validOptions);
        toast.success("Options updated successfully!");
      } else if (editingAttribute) {
        const attributeName =
          editingAttribute.type === "metal"
            ? "Choice of Metal"
            : editingAttribute.type === "diamond"
              ? "Diamond Quality"
              : "Size";

        const createResponse = await DoAll({
          action: "insert",
          table: "attributes",
          data: {
            name: attributeName,
            type: editingAttribute.type,
            created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            is_deleted: 0,
          },
        });

        if (!createResponse?.success) {
          throw new Error(
            createResponse.message || "Failed to create attribute"
          );
        }

        const attributeId = createResponse.insertId;
        if (!attributeId) {
          throw new Error("No attribute ID returned from database");
        }

        await saveAttributeOptions(attributeId, validOptions);
        toast.success("Attribute created successfully!");
      }

      if (fetchAttributes) {
        await fetchAttributes();
      }
      handleClose();
    } catch (error) {
      console.error("Error saving attribute:", error);
      toast.error(
        `Error ${editingAttribute?.id ? "updating" : "creating"} attribute: ${error.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAttributeOptions = async (attributeId, optionsToSave) => {
    const validOptions = optionsToSave.filter((opt) => opt.option_name.trim());

    if (validOptions.length === 0) {
      console.warn("No valid options to save");
      return;
    }

    try {
      if (editingAttribute?.id) {
        try {
          await DoAll({
            action: "soft_delete",
            table: "attribute_options",
            where: { attribute_id: attributeId },
          });
        } catch (deleteError) {
          console.warn("Error deleting old options:", deleteError);
        }
      }

      const optionPromises = validOptions.map(async (option) => {
        const response = await DoAll({
          action: "insert",
          table: "attribute_options",
          data: {
            attribute_id: attributeId,
            option_name: option.option_name.trim(),
            option_value:
              option.option_value || generateSlug(option.option_name),
            size_mm: editingAttribute?.type === "size" ? option.size_mm : null,
            created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            is_deleted: 0,
          },
        });

        if (!response.success) {
          console.error(
            `Failed to save option "${option.option_name}":`,
            response
          );
        }

        return response;
      });

      const results = await Promise.allSettled(optionPromises);
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        console.error("Some options failed to save:", failures);
        toast.warning(
          `${validOptions.length - failures.length} of ${validOptions.length} options saved`
        );
      }
    } catch (error) {
      console.error("Error saving attribute options:", error);
      throw new Error("Failed to save options");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getAttributeTitle = () => {
    if (!editingAttribute) return "Add Attribute";
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-emerald-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {getAttributeTitle()}
              </h2>
              <button
                type="button"
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
                  <span className="ml-2 text-gray-600 text-sm">
                    Loading attribute details...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-emerald-800 mb-1">
                      {editingAttribute?.name}
                    </h3>
                    <p className="text-xs text-emerald-600">
                      {editingAttribute?.type === "size"
                        ? "Add size options with corresponding measurements"
                        : "Add available options for this attribute"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Options {editingAttribute?.type === "size" && "(Size)"}
                    </h3>
                    <button
                      type="button"
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
                        key={option.id || index}
                        option={option}
                        index={index}
                        onUpdate={updateOption}
                        onRemove={removeOption}
                        attributeType={editingAttribute?.type}
                        isLast={options.length === 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-emerald-100 bg-white">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50 min-w-[100px]"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <span>
                  {saving
                    ? "Saving..."
                    : editingAttribute?.id
                      ? "Update Options"
                      : "Create"}
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