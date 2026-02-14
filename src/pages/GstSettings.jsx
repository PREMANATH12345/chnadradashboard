import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiSave, FiAlertCircle } from "react-icons/fi";

const GstSettings = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: "",
        gst_number: "",
        is_stl_gst_enabled: false,
        stl_gst_percent: 0,
        is_cam_gst_enabled: false,
        cam_gst_percent: 0,
        is_rubber_mold_gst_enabled: false,
        rubber_mold_gst_percent: 0,
        is_casting_model_gst_enabled: false,
        casting_model_gst_percent: 0,
        is_direct_product_gst_enabled: false,
        direct_product_gst_percent: 0,
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL_DAS

    useEffect(() => {
        fetchGstSettings();
    }, []);

    const fetchGstSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${API_URL}/gst`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success && data.data) {
                // Map backend data to state
                // Assuming backend returns 1 for true, 0 for false
                const s = data.data;
                setFormData({
                    company_name: s.company_name || "",
                    gst_number: s.gst_number || "",
                    is_stl_gst_enabled: !!s.is_stl_gst_enabled,
                    stl_gst_percent: s.stl_gst_percent || 0,
                    is_cam_gst_enabled: !!s.is_cam_gst_enabled,
                    cam_gst_percent: s.cam_gst_percent || 0,
                    is_rubber_mold_gst_enabled: !!s.is_rubber_mold_gst_enabled,
                    rubber_mold_gst_percent: s.rubber_mold_gst_percent || 0,
                    is_casting_model_gst_enabled: !!s.is_casting_model_gst_enabled,
                    casting_model_gst_percent: s.casting_model_gst_percent || 0,
                    is_direct_product_gst_enabled: !!s.is_direct_product_gst_enabled,
                    direct_product_gst_percent: s.direct_product_gst_percent || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching GST settings:", error);
            // toast.error("Failed to load GST settings");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                stl_gst_percent: Number(formData.stl_gst_percent || 0),
                cam_gst_percent: Number(formData.cam_gst_percent || 0),
                rubber_mold_gst_percent: Number(formData.rubber_mold_gst_percent || 0),
                casting_model_gst_percent: Number(formData.casting_model_gst_percent || 0),
                direct_product_gst_percent: Number(formData.direct_product_gst_percent || 0),
            };

            await axios.post(`${API_URL}/gst`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("GST Settings updated successfully");
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    const renderGstSection = (label, enabledKey, percentKey) => (
        <div className="p-4 border rounded-lg bg-gray-50 mb-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name={enabledKey}
                        checked={formData[enabledKey]}
                        onChange={handleChange}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                        id={enabledKey}
                    />
                    <label htmlFor={enabledKey} className="font-semibold text-gray-800 cursor-pointer select-none">
                        Enable GST for {label}
                    </label>
                </div>
            </div>

            {formData[enabledKey] && (
                <div className="mt-4 ml-8 animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Percentage (%)
                    </label>
                    <div className="relative max-w-xs">
                        <input
                            type="number"
                            name={percentKey}
                            value={formData[percentKey]}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pl-3 pr-8 py-2 border"
                            placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">%</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the tax percentage applicable for {label}.
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">GST Configuration</h1>
                    <p className="text-gray-600 mt-1">Manage tax settings for your products and services</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200 font-medium"
                >
                    <FiSave className="w-5 h-5" />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                        Company Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                placeholder="Ex: Lotus Jewel"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2.5"
                                placeholder="Ex: 22AAAAA0000A1Z5"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                        Tax Applicability
                    </h2>

                    <div className="space-y-2">
                        {renderGstSection("STL Files", "is_stl_gst_enabled", "stl_gst_percent")}
                        {renderGstSection("CAM Products", "is_cam_gst_enabled", "cam_gst_percent")}
                        {renderGstSection("Rubber Molds", "is_rubber_mold_gst_enabled", "rubber_mold_gst_percent")}
                        {renderGstSection("Direct Products", "is_direct_product_gst_enabled", "direct_product_gst_percent")}
                    </div>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-orange-50 text-orange-800 rounded-lg text-sm">
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>
                            <strong>Note:</strong> Changes made here will apply immediately to all new orders and carts.
                            Calculated tax will be shown to customers at checkout.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GstSettings;
