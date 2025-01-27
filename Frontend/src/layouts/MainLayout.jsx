import React, { useState } from "react";
import {
  BarChart,
  Mail,
  FileText,
  Calendar,
  Settings,
  Bell,
  User,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";

const MainLayout = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "email", label: "Email Integration", icon: Mail },
    { id: "resumes", label: "Resume Management", icon: FileText },
    { id: "calendar", label: "Interview Scheduler", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">
                ResuMatch
              </span>
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
                  <span className="hidden md:block">John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <a
                      href="#logout"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </a>
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
              <a
                key={item.id}
                className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                  activeTab === item.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </a>
            ))}
          </nav>

          {/* Team Chat Section */}
          <div className="absolute bottom-0 w-full p-4 border-t bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Team Chat</h3>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sarah Smith (Online)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm">Mike Johnson (Offline)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

// import React, { useState } from "react";
// import {
//   BarChart,
//   Mail,
//   FileText,
//   Calendar,
//   Settings,
//   Bell,
//   User,
//   MessageSquare,
//   ChevronDown,
// } from "lucide-react";
// import { Link, Outlet } from "react-router-dom";
// import { Button } from "../components/ui/button";

// const MainLayout = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: BarChart, path: "/" },
//     { id: "email", label: "Email Integration", icon: Mail, path: "/email-integration" },
//     { id: "resumes", label: "Resume Management", icon: FileText, path: "/manage-resumes" },
//     { id: "calendar", label: "Interview Scheduler", icon: Calendar, path: "/interview-scheduler" },
//     { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Top Navigation Bar */}
//       <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
//         <div className="max-w-full px-4">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <span className="text-xl font-bold text-gray-800">
//                 ResuMatch
//               </span>
//             </div>

//             <div className="flex items-center space-x-4">
//               <Button variant="ghost" size="sm" className="relative">
//                 <Bell className="h-5 w-5" />
//                 <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
//               </Button>

//               <div className="relative">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="flex items-center space-x-2"
//                   onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 >
//                   <User className="h-5 w-5" />
//                   <span className="hidden md:block">John Doe</span>
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>

//                 {isProfileOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                     <a
//                       href="#profile"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       Your Profile
//                     </a>
//                     <a
//                       href="#settings"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       Settings
//                     </a>
//                     <a
//                       href="#logout"
//                       className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                     >
//                       Sign out
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Layout */}
//       <div className="flex h-screen pt-16">
//         {/* Sidebar */}
//         <aside className="w-64 bg-white shadow-sm fixed left-0 h-full z-40">
//           <nav className="mt-6">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.id}
//                 to={item.path}
//                 className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
//                   activeTab === item.id
//                     ? "bg-blue-50 border-l-4 border-blue-500"
//                     : ""
//                 }`}
//                 onClick={() => setActiveTab(item.id)}
//               >
//                 <item.icon className="h-5 w-5 mr-3" />
//                 {item.label}
//               </Link>
//             ))}
//           </nav>

//           {/* Team Chat Section */}
//           <div className="absolute bottom-0 w-full p-4 border-t bg-white">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-semibold">Team Chat</h3>
//               <MessageSquare className="h-4 w-4 text-gray-500" />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="text-sm">Sarah Smith (Online)</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
//                 <span className="text-sm">Mike Johnson (Offline)</span>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 ml-64 p-6 overflow-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;

