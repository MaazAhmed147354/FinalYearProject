import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Mail,
  FileText,
  Calendar,
  Settings,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Sliders,
  PieChart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // Add this line
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart, path: "/dashboard" },
    {
      id: "email",
      label: "Email Integration",
      icon: Mail,
      path: "/email-integration",
    },
    {
      id: "resumes",
      label: "Resume Management",
      icon: FileText,
      path: "/manage-resumes",
    },
    {
      id: "criteria",
      label: "Setup Criteria",
      icon: Sliders,
      path: "/setup-criteria",
    },
    {
      id: "calendar",
      label: "Interview Scheduler",
      icon: Calendar,
      path: "/interview-scheduler",
    },
    { id: "reports", label: "Reports", icon: PieChart, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">ResuMatch</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block">
                    {user?.email || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm fixed left-0 h-full z-40">
          <nav className="mt-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                  location.pathname === item.path
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
