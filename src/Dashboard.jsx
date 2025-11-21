import { useState } from 'react';
import Sidebar from './Sidebar';
import Homepage from './pages/Homepage';
import Products from './pages/Products';

const Dashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Homepage user={user} />;
      case 'products':
        return <Products />;
      default:
        return <Homepage user={user} />;
    }
  };

  return (
    <div className="flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        user={user}
      />
      <div className="lg:ml-64 flex-1 min-h-screen bg-gray-50 w-full">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="mr-4 text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          {user && (
            <div className="text-sm text-gray-300">
              Welcome, {user.name || user.username}
            </div>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;