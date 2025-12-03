// import { Outlet } from "react-router-dom";
// import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
// import { useState } from "react";
// import Sidebar from "./Sidebar";

// const Dashboard = ({ onLogout, user }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen flex bg-green-50">
//       {/* Sidebar */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         onLogout={onLogout}
//         user={user}
//       />

//       {/* Main content */}
//       <div className="flex-1 lg:ml-64 min-h-screen">
//         {/* Header */}
//         <header className="bg-green-800 text-white sticky top-0 z-10 shadow-sm">
//           <div className="px-4 sm:px-5 lg:px-6 h-14 flex justify-between items-center">
//             {/* Hamburger */}
//             <button
//               className="lg:hidden p-1.5 rounded text-green-200 hover:bg-green-700"
//               onClick={() => setSidebarOpen(true)}
//             >
//               <Bars3Icon className="w-5" />
//             </button>

//             <div>
//               <h1 className="text-lg font-bold">Dashboard Overview</h1>
//               <p className="text-xs text-green-200 hidden sm:block">
//                 Welcome to your admin panel
//               </p>
//             </div>

//             {/* Right Side */}
//             <div className="flex items-center gap-3">
//               <button className="p-1.5 rounded-md text-green-200 hover:bg-green-700 relative">
//                 <BellIcon className="w-5" />
//                 <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
//               </button>

//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-medium text-sm">
//                   {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
//                 </div>

//                 <div className="hidden sm:block">
//                   <p className="font-medium text-sm">{user?.name || user?.username}</p>
//                   <p className="text-xs text-green-200">Administrator</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Body */}
//         <main className="p-3 sm:p-4 lg:p-5">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import { Outlet } from "react-router-dom";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Dashboard = ({ onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get user role display
  const userRole = user?.role || "User";
  const isAdmin = userRole.toLowerCase() === "admin";

  return (
    <div className="min-h-screen flex bg-green-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-green-800 text-white sticky top-0 z-10 shadow-sm">
          <div className="px-4 sm:px-5 lg:px-6 h-14 flex justify-between items-center">
            {/* Hamburger */}
            <button
              className="lg:hidden p-1.5 rounded text-green-200 hover:bg-green-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-5" />
            </button>

            <div>
              <h1 className="text-lg font-bold">
                {isAdmin ? "Dashboard Overview" : "Vendor Dashboard"}
              </h1>
              <p className="text-xs text-green-200 hidden sm:block">
                {isAdmin ? "Welcome to your admin panel" : "Manage your products"}
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="p-1.5 rounded-md text-green-200 hover:bg-green-700 relative">
                <BellIcon className="w-5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-medium text-sm">
                  {user?.full_name?.charAt(0) || user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>

                <div className="hidden sm:block">
                  <p className="font-medium text-sm">
                    {user?.full_name || user?.name || user?.username}
                  </p>
                  <p className="text-xs text-green-200 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;