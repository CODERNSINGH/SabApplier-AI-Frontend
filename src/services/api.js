// import { UNSAFE_createClientRoutesWithHMRRevalidationOptOut } from "react-router-dom";
import axios from "axios";


// const API_BASE_URL = 'https://api.sabapplier.com/api';
const API_BASE_URL = 'http://localhost:8000/api';



console.log('🔗 API_BASE_URL configured:', API_BASE_URL);

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Helper function to set auth token
// const setAuthToken = (token) => {
//   if (token) {
//     localStorage.setItem("token", token);
//   } else {
//     localStorage.removeItem("token");
//   }
// };

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCookie("csrftoken"), // Send CSRF token
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const api = {

  // OTP: Send OTP to email
  sendOtp: async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/send-otp/`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    } catch (error) {
      throw new Error(error.detail || "Could not send OTP. Please try again.");
    }
  },

  // OTP: Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/verify-otp/`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    } catch (error) {
      throw new Error(error.detail || "Invalid OTP. Please try again.");
    }
  },

  // Forgot Password: Send OTP to registered email
  sendForgotPasswordOtp: async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password/send-otp/`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    } catch (error) {
      throw new Error(error.detail || "Could not send password reset OTP. Please try again.");
    }
  },

  // Forgot Password: Reset password with OTP verification
  resetPassword: async (email, otp, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password/reset/`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    } catch (error) {
      throw new Error(error.detail || "Password reset failed. Please try again.");
    }
  },




  signup: async (userData) => {
    try {
      // Only send the required fields as JSON
      const payload = {
        email: userData.email,
        password: userData.password,
      };
      if (userData.confirmPassword) {
        payload.confirmPassword = userData.confirmPassword;
      }
      const response = await axios.post(
        `${API_BASE_URL}/users/register/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      throw new Error("Signup failed: user already exists or invalid data");
    }
  },

  googleSignup: async (credentialToken) => {
    try {
      console.log('Sending Google credential to backend:', credentialToken);
      const response = await axios.post(
        `${API_BASE_URL}/users/google-signup/`,
        { credential: credentialToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Google signup error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Google signup failed";
      throw new Error(errorMessage);
    }
  },

  update: async (userData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      console.log('Updating user data:', userData);
      
      if (!('email' in userData) || !userData.email) {
        if (currentUser && currentUser.email) {
          userData.email = currentUser.email;
        } else {
          throw new Error("No email found for user update");
        }
      }

      const payload = { ...userData };
      if (userData.confirmPassword) {
        payload.confirmPassword = userData.confirmPassword;
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/update/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  },

  delete: async (userData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      console.log(userData.email);
      if (!('email' in userData) || !userData.email){
        userData.email = currentUser.email
      }
      const payload =  {
        ...userData
      };
      const response = await axios.post(
        `${API_BASE_URL}/users/delete/`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      throw new Error("Signup failed: user already exists or invalid data");
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login/`,
        credentials
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_BASE_URL}/users/logout/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },

  getProfile: async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User data not found. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/users/profile/?email=${currentUser.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get profile");
      }

      if (!data.user_data) {
        throw new Error("Invalid profile data received");
      }

      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  updateProfile: async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/update/`,
        formData,
        {
          headers: {
            "X-CSRFToken": getCookie("csrftoken"), // Send CSRF token
            // Don't set Content-Type for multipart/form-data, let axios set it with boundary
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  },

  deleteDocument: async (docType) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/delete/`,
        { 
          email: currentUser.email,
          field: docType 
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Document deletion error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Document deletion failed");
    }
  },

  // Data Sharing APIs
  shareDataWithFriend: async (receiverEmail, selectedDocuments = []) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/share/send/`,
        {
          sender_email: currentUser.email,
          receiver_email: receiverEmail,
          selected_documents: selectedDocuments
        },
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Share data error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to share data");
    }
  },

  respondToShareRequest: async (shareId, action) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/share/respond/`,
        {
          share_id: shareId,
          action: action, // 'accept' or 'decline'
          receiver_email: currentUser.email
        },
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Respond to share error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to respond to share request");
    }
  },

  stopDataSharing: async (receiverEmail) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/share/stop/`,
        {
          sender_email: currentUser.email,
          receiver_email: receiverEmail
        },
        {
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Stop sharing error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to stop data sharing");
    }
  },

  getSharedData: async (senderEmail) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/users/share/get-data/`,
        {
          params: {
            receiver_email: currentUser.email,
            sender_email: senderEmail
          },
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get shared data error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to get shared data");
    }
  },

  getUserNotifications: async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/users/notifications/`,
        {
          params: {
            email: currentUser.email
          },
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to get notifications");
    }
  },

  getUserShares: async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        throw new Error("User not found. Please log in again.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/users/shares/`,
        {
          params: {
            email: currentUser.email
          },
          headers: getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get user shares error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to get user shares");
    }
  },

  getActiveAutofillData: async () => {
    try {
      // Check if user has selected to use shared data
      const activeData = localStorage.getItem('activeAutofillData');
      
      if (activeData) {
        const parsedData = JSON.parse(activeData);
        if (parsedData.source === 'shared' && parsedData.data) {
          // Return the shared data
          return {
            source: 'shared',
            senderEmail: parsedData.senderEmail,
            data: parsedData.data
          };
        }
      }
      
      // Fall back to user's own data
      const response = await api.getProfile();
      return {
        source: 'own',
        data: response.user_data
      };
    } catch (error) {
      console.error("Get active autofill data error:", error);
      throw new Error("Failed to get autofill data");
    }
  },

  switchToSharedData: async (senderEmail) => {
    try {
      const sharedData = await api.getSharedData(senderEmail);
      localStorage.setItem('activeAutofillData', JSON.stringify({
        source: 'shared',
        senderEmail: senderEmail,
        data: sharedData.shared_data
      }));
      return sharedData.shared_data;
    } catch (error) {
      console.error("Switch to shared data error:", error);
      throw new Error("Failed to switch to shared data");
    }
  },

  switchToOwnData: () => {
    localStorage.removeItem('activeAutofillData');
  },
};
