import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class AuthService {
  async loginUser(email, password) {
    return axios.post(
      BASE_API_URL + "/auth/login",
      { email: email, password: password },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async registerUser(name, email, password, role, department) {
    return axios.post(
      BASE_API_URL + "/auth/register",
      {
        name: name,
        email: email,
        password: password,
        role: role,
        department: department,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async logoutUser() {
    return axios.post(BASE_API_URL + "/auth/logout", null, {
      withCredentials: true,
    });
  }

  async checkAuth() {
    return axios.get(BASE_API_URL + "/auth/check", {
      withCredentials: true,
    });
  }
}

export default new AuthService();
