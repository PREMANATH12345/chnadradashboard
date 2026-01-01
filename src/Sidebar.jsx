import { useState, useEffect, useRef } from "react";
import {
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen, onLogout, user }) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef(null);

  // Define all menu items with role restrictions and appropriate icons
  const allMenuItems = [
    {
      path: "home",
      label: "Home",
      icon: <HomeIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "attributes",
      label: "Attributes",
      icon: <TagIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "categories",
      label: "Categories",
      icon: <RectangleStackIcon className="w-4" />,
      roles: ["admin"],
    },
    // {
    //   path: "feature",
    //   label: "Featured Collection",
    //   icon: <StarIcon className="w-4" />,
    //   roles: ["admin"],
    // },
    {
      path: "target",
      label: "Target Audience",
      icon: <UserGroupIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "blogs",
      label: "Blogs",
      icon: <BookOpenIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "Faq",
      label: "FAQs",
      icon: <QuestionMarkCircleIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "products",
      label: "Products",
      icon: <CubeIcon className="w-4" />,
      roles: ["admin", "vendor"],
    },
    {
      path: "vendorDash",
      label: "Vendor Dashboard",
      icon: <BuildingStorefrontIcon className="w-4" />,
      roles: ["vendor"],
    },
    {
      path: "reviews",
      label: "Reviews",
      icon: <StarIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "analytics",
      label: "Analytics",
      icon: <ChartPieIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "invoice",
      label: "Invoice",
      icon: <ChatBubbleLeftRightIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "users",
      label: "Users",
      icon: <UsersIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "orders",
      label: "Orders",
      icon: <ShoppingCartIcon className="w-4" />,
      roles: ["admin"],
    },
    {
      path: "vendorRegister",
      label: "Vendor Register",
      icon: <UserPlusIcon className="w-4" />,
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role?.toLowerCase())
  );

  // Check if there's scrollable content
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const hasScrollableContent =
          container.scrollHeight > container.clientHeight;
        setShowScrollIndicator(hasScrollableContent);
      }
    };

    checkScrollable();

    // Add resize listener
    window.addEventListener("resize", checkScrollable);

    // Initial check
    setTimeout(checkScrollable, 100);

    return () => window.removeEventListener("resize", checkScrollable);
  }, [user?.role]);

  // Handle scroll to show/hide indicator
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isScrolled = container.scrollTop > 0;

      // Hide indicator when user starts scrolling
      if (isScrolled) {
        setShowScrollIndicator(false);
      }
    }
  };

  // Get user display name
  const userDisplayName =
    user?.full_name || user?.name || user?.username || "User";
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
              <p className="text-green-300 text-xs">{userDisplayName}</p>
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

        {/* Scrollable Menu Section with Hidden Scrollbar */}
        <div className="relative h-[calc(100vh-4rem-5rem)] overflow-hidden">
          {/* Scroll Down Indicator - Fixed width and position */}
          {showScrollIndicator && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
              <div className="inline-flex flex-col items-center">
                <div className="bg-green-800/90 backdrop-blur-sm rounded-full p-1 shadow-lg w-6 h-6 flex items-center justify-center">
                  <ChevronDownIcon className="w-3 h-3 text-green-200" />
                </div>
                <div className="text-xs text-green-300 text-center mt-0.5 whitespace-nowrap">
                  Scroll for more
                </div>
              </div>
            </div>
          )}

          {/* Hidden Scrollbar Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto"
            style={{
              msOverflowStyle: "none" /* IE and Edge */,
              scrollbarWidth: "none" /* Firefox */,
            }}
          >
            <nav className="p-2 space-y-1 pb-8">
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
            </nav>
          </div>

          {/* CSS to hide scrollbar for Webkit browsers (Chrome, Safari, Edge) */}
          <style jsx>{`
            div[class*="overflow-y-auto"]::-webkit-scrollbar {
              display: none;
              width: 0;
              height: 0;
            }
          `}</style>
        </div>

        {/* Fixed Logout Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-green-700 bg-green-650 p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-red-300 hover:bg-red-700 hover:text-white transition-all text-sm font-medium"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
   