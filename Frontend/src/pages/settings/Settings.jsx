// C:\Users\abdul\Downloads\FinalYearProject-main\FinalYearProject-main\Frontend\src\pages\settings\Settings.jsx

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  User,
  Mail,
  Lock,
  EyeOff,
  Eye,
  Bell,
  AlertTriangle,
  Save,
  Check,
} from "lucide-react";

const Settings = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "HR Manager",
    department: "Human Resources",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicantAlerts: true,
    interviewReminders: true,
    systemUpdates: false,
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [saveStatus, setSaveStatus] = useState({
    profile: null,
    password: null,
    notifications: null,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProfileSave = () => {
    // Save profile information
    setSaveStatus({ ...saveStatus, profile: "success" });
    setTimeout(() => setSaveStatus({ ...saveStatus, profile: null }), 3000);
  };

  const handlePasswordSave = () => {
    // Validate passwords
    if (passwords.new !== passwords.confirm) {
      setSaveStatus({ ...saveStatus, password: "error" });
      setTimeout(() => setSaveStatus({ ...saveStatus, password: null }), 3000);
      return;
    }

    // Save password changes
    setSaveStatus({ ...saveStatus, password: "success" });
    setTimeout(() => setSaveStatus({ ...saveStatus, password: null }), 3000);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleNotificationSave = () => {
    // Save notification settings
    setSaveStatus({ ...saveStatus, notifications: "success" });
    setTimeout(() => setSaveStatus({ ...saveStatus, notifications: null }), 3000);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="pl-10 w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="pl-10 w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <input
                    type="text"
                    value={user.department}
                    onChange={(e) => setUser({ ...user, department: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileSave} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {saveStatus.profile === "success" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveStatus.profile === "success" ? "Saved" : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Password Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 w-full p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 w-full p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 w-full p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {saveStatus.password === "error" && (
                <div className="p-2 bg-red-50 text-red-600 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Passwords do not match. Please try again.
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordSave} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {saveStatus.password === "success" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveStatus.password === "success" ? "Password Updated" : "Update Password"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="emailNotifications"
                    className="sr-only peer"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Applicant Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="applicantAlerts"
                    className="sr-only peer"
                    checked={notificationSettings.applicantAlerts}
                    onChange={handleNotificationChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Interview Reminders</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="interviewReminders"
                    className="sr-only peer"
                    checked={notificationSettings.interviewReminders}
                    onChange={handleNotificationChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">System Updates</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="systemUpdates"
                    className="sr-only peer"
                    checked={notificationSettings.systemUpdates}
                    onChange={handleNotificationChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNotificationSave} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {saveStatus.notifications === "success" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveStatus.notifications === "success" ? "Saved" : "Save Preferences"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
