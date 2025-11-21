const Homepage = ({ user }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        {user && (
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back, {user.name || user.username}!
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Products</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600">0</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Across all categories</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Categories</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-green-600">0</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Product categories</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-purple-600">0</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Pending and completed</p>
        </div>
      </div>

    </div>
  );
};

export default Homepage;