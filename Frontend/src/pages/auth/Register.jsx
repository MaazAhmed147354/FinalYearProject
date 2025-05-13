import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Mail, Lock, User, Building } from "lucide-react";
import AuthService from "../../services/AuthService"; // Import AuthService

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "hr",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    if (formData.role === "department" && !formData.department) {
      setError("Department is required for department role");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Use AuthService instead of direct axios call
      await AuthService.registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.department
      );

      // Redirect to login page on successful registration
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.message === "Email already in use") {
        setError(
          "This email is already registered. Please use a different email."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md"
                  placeholder="Create a password"
                  required
                  minLength="6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md"
                  required
                >
                  <option value="hr">HR</option>
                  <option value="department">Department</option>
                </select>
              </div>
            </div>
            {formData.role === "department" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border rounded-md"
                    placeholder="Enter your department"
                    required={formData.role === "department"}
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 py-2 text-lg"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:text-blue-600">
                Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
