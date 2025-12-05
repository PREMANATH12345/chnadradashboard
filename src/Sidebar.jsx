// import {
//   HomeIcon,
//   CubeIcon,
//   ChartBarIcon,
//   Cog6ToothIcon,
//   ArrowRightOnRectangleIcon,
//   RectangleStackIcon,AdjustmentsHorizontalIcon 
// } from "@heroicons/react/24/outline";
// import { NavLink } from "react-router-dom";

// const Sidebar = ({ sidebarOpen, setSidebarOpen, onLogout, user }) => {
//   return (
//     <>
//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm  z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`w-64 bg-gradient-to-b from-green-900 to-green-800 text-white fixed top-0 left-0 h-screen z-30 border-r border-green-700 transform transition-transform duration-300 lg:translate-x-0 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* Header */}
//         <div className="p-4 border-b border-green-700 flex justify-between items-center bg-green-950">
//           <div className="flex items-center gap-2">
//             <img
//               src="/logo.png"
//               alt="Logo"
//               className="w-8 h-8 rounded bg-green-600 p-1"
//             />

//             <div>
//               <h1 className="font-bold text-lg">EcoAdmin</h1>
//               <p className="text-green-300 text-xs">
//                 {user?.name || user?.username}
//               </p>
//             </div>
//           </div>

//           <button
//             className="lg:hidden text-green-300 hover:text-white text-sm"
//             onClick={() => setSidebarOpen(false)}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Menu */}
//         <nav className="p-2 space-y-1">
//           {[
//             { path: "home", label: "Home ", icon: <HomeIcon className="w-4" /> },
//             { path: "categories", label: "Categories", icon: <RectangleStackIcon className="w-4" /> },
//             { path: "attributes", label: "Attributes", icon: <AdjustmentsHorizontalIcon  className="w-4" /> },

//             { path: "products", label: "Products", icon: <CubeIcon className="w-4" /> },
//             { path: "analytics", label: "Analytics", icon: <ChartBarIcon className="w-4" /> },
//             { path: "orders", label: "Orders", icon: <ChartBarIcon className="w-4" /> },

//             { path: "vendorRegister", label: "vendorRegister", icon: <Cog6ToothIcon className="w-4" /> },
//           ].map((item) => (
//             <NavLink
//               key={item.path}
//               to={`/dashboard/${item.path}`}
//               onClick={() => setSidebarOpen(false)}
//               className={({ isActive }) =>
//                 `w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-sm ${
//                   isActive
//                     ? "bg-green-600 scale-105 shadow text-white"
//                     : "text-green-100 hover:bg-green-700 hover:text-white"
//                 }`
//               }
//             >
//               <div className="p-1.5 rounded bg-green-900">
//                 {item.icon}
//               </div>
//               <span className="font-medium">{item.label}</span>
//             </NavLink>
//           ))}

//           {/* Logout */}
//           <div className="pt-4 mt-4 border-t border-green-700">
//             <button
//               onClick={onLogout}
//               className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-300 hover:bg-red-700 hover:text-white transition-all text-sm"
//             >
//               <ArrowRightOnRectangleIcon className="w-4" />
//               <span className="font-medium">Logout</span>
//             </button>
//           </div>
//         </nav>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;



import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  AdjustmentsHorizontalIcon 
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen, onLogout, user }) => {
  // Define all menu items with role restrictions
  const allMenuItems = [
    { 
      path: "home", 
      label: "Home", 
      icon: <HomeIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
    { 
      path: "categories", 
      label: "Categories", 
      icon: <RectangleStackIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
    { 
      path: "attributes", 
      label: "Attributes", 
      icon: <AdjustmentsHorizontalIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
    { 
      path: "products", 
      label: "Products", 
      icon: <CubeIcon className="w-4" />,
      roles: ["admin", "vendor"] // Both can see
    },
    { 
      path: "analytics", 
      label: "Analytics", 
      icon: <ChartBarIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
    { 
      path: "orders", 
      label: "Orders", 
      icon: <ChartBarIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
    { 
      path: "vendorRegister", 
      label: "Vendor Register", 
      icon: <Cog6ToothIcon className="w-4" />,
      roles: ["admin"] // Only admin can see
    },
   
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role?.toLowerCase())
  );

  // Get user display name
  const userDisplayName = user?.full_name || user?.name || user?.username || "User";
  const userRole = user?.role || "User";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gradient-to-b from-green-900 to-green-800 text-white fixed top-0 left-0 h-screen z-30 border-r border-green-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-green-700 flex justify-between items-center bg-green-950">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded bg-green-600 p-1"
            />

            <div>
              <h1 className="font-bold text-lg">EcoAdmin</h1>
              <p className="text-green-300 text-xs">
                {userDisplayName}
              </p>
              <p className="text-green-400 text-xs font-medium capitalize">
                {userRole}
              </p>
            </div>
          </div>

          <button
            className="lg:hidden text-green-300 hover:text-white text-sm"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2 space-y-1">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={`/dashboard/${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-sm ${
                    isActive
                      ? "bg-green-600 scale-105 shadow text-white"
                      : "text-green-100 hover:bg-green-700 hover:text-white"
                  }`
                }
              >
                <div className="p-1.5 rounded bg-green-900">
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))
          ) : (
            <div className="text-center text-green-300 text-sm py-4">
              No menu items available
            </div>
          )}

          {/* Logout */}
          <div className="pt-4 mt-4 border-t border-green-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-300 hover:bg-red-700 hover:text-white transition-all text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;