const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics cards would go here */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-800">Total Views</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">12.4K</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;