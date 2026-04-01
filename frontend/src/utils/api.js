import axios from "axios"

// API base URL - replace with your Django backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem("auth_token", access)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_id")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// ============ AUTHENTICATION APIs ============

/**
 * Login user
 */
export async function loginUser(credentials) {
  try {
    const data1 = {
      email: credentials.email,
      password: credentials.password,
    }
    console.log("🔍 Login attempt with:", data1)
    const response = await api.post("/auth/login/", data1)
    console.log("✅ Login response:", response.data)
    const { access, refresh, user } = response.data
    // Store auth tokens and user ID
    localStorage.setItem("auth_token", access)
    localStorage.setItem("refresh_token", refresh)
    localStorage.setItem("user_id", user.id.toString())
    return user
  } catch (error) {
    console.error("❌ Login error:", error)
    let errorMessage = "Login failed"
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        errorMessage = error.response.data
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0]
      }
    }
    throw new Error(errorMessage)
  }
}

/**
 * Register user
 */
export async function registerUser(userData) {
  try {
    console.log("🔍 Registration attempt with data:", userData)

    // Transform frontend data to match Django backend expectations
    const backendData = {
      username: userData.email.split("@")[0] + Math.random().toString(36).substr(2, 5),
      email: userData.email,
      password: userData.password,
      password_confirm: userData.confirmPassword,
      first_name: userData.name.split(" ")[0] || "",
      last_name: userData.name.split(" ").slice(1).join(" ") || "",
      college: userData.college,
      phone: userData.phone,
    }

    console.log("📤 Sending to backend:", backendData)

    const response = await api.post("/auth/register/", backendData)
    console.log("✅ Registration response:", response.data)

    // Handle different response formats
    let user, access, refresh

    if (response.data.user && response.data.access) {
      user = response.data.user
      access = response.data.access
      refresh = response.data.refresh
    } else if (response.data.id) {
      user = response.data
      // Auto-login after registration
      try {
        const loginResponse = await api.post("/auth/login/", {
          email: userData.email,
          password: userData.password,
        })
        access = loginResponse.data.access
        refresh = loginResponse.data.refresh
      } catch (loginError) {
        console.warn("Could not auto-login after registration:", loginError)
      }
    } else {
      throw new Error("Unexpected response format from server")
    }

    // Store auth tokens if available
    if (access && refresh) {
      localStorage.setItem("auth_token", access)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("user_id", user.id.toString())
    }

    return user
  } catch (error) {
    console.error("❌ Registration error:", error)

    let errorMessage = "Registration failed"
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        errorMessage = error.response.data
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0]
      } else {
        const fieldErrors = []
        Object.keys(error.response.data).forEach((field) => {
          if (Array.isArray(error.response.data[field])) {
            fieldErrors.push(`${field}: ${error.response.data[field][0]}`)
          }
        })
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join(", ")
        }
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  try {
    const response = await api.get("/auth/user/")
    return response.data
  } catch (error) {
    console.error("Error fetching current user:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch user profile")
  }
}

/**
 * Logout user
 */
export function logoutUser() {
  // Clear local storage
  localStorage.removeItem("auth_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user_id")
}

// ============ PRODUCT APIs - FIXED ENDPOINTS ============

/**
 * Fetch all products with filters
 */
export async function fetchProducts(filters = {}) {
  try {
    const response = await api.get("/products/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    throw new Error("Failed to fetch products.");
  }
}

/**
 * Fetch product by ID
 */
export async function fetchProductById(id) {
  try {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error.response?.data || error.message);
    throw new Error("Failed to fetch product details.");
  }
}

/**
 * Create new product - FIXED ENDPOINT
 */
export async function createProduct(productData) {
  try {
    console.log("🔍 Creating product with data:", productData);

    const formData = new FormData();

    // Map and append main product fields
    const fieldMapping = {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      original_price: productData.originalPrice || null, // Use null if not provided
      category: productData.category,
      condition: productData.condition,
      brand: productData.brand || "",
      location: productData.location || "",
    };

    Object.keys(fieldMapping).forEach((key) => {
      // Append fields that have a value
      if (fieldMapping[key] !== null && fieldMapping[key] !== undefined) {
        formData.append(key, fieldMapping[key]);
      }
    });

    // Append tags if they exist
    if (productData.tags && Array.isArray(productData.tags)) {
      productData.tags.forEach((tag) => {
        formData.append("tags", tag);
      });
    }

    // Append images if they exist
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        if (image.file) {
          formData.append("images", image.file);
        }
      });
    }

    // Log FormData contents for debugging
    console.log("📤 Sending FormData to /products/create/");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const response = await api.post("/products/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Product created successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error creating product:", error.response || error);

    let errorMessage = "Failed to create product. Please check the form and try again.";
    if (error.response?.data) {
      const errors = error.response.data;
      // Extract the first error message to show to the user
      if (typeof errors === 'object' && errors !== null) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorField = Array.isArray(errors[firstErrorKey]) ? errors[firstErrorKey][0] : errors[firstErrorKey];
        errorMessage = `${firstErrorKey}: ${errorField}`;
      } else if (typeof errors === 'string') {
        errorMessage = errors;
      }
    }

    throw new Error(errorMessage);
  }
}


/**
 * Update product
 */
export async function updateProduct(id, productData) {
  const formData = new FormData();
  for (const key in productData) {
    if (key !== 'images' && productData[key] !== null && productData[key] !== undefined) {
      if (key === 'tags' && Array.isArray(productData[key])) {
        productData[key].forEach(tag => formData.append('tags', tag));
      } else {
        formData.append(key, productData[key]);
      }
    }
  }
  // Note: Handling of existing vs. new images might need more complex logic here.
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach(imageObj => {
      if (imageObj.file) formData.append("images", imageObj.file, imageObj.file.name);
    });
  }
  try {
    // UPDATED LOGIC: Changed endpoint to match backend urls.py
    const response = await api.patch(`/products/${id}/update/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error.response?.data || error.message);
    throw new Error("Failed to update product.");
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id) {
  try {
    // UPDATED LOGIC: Changed endpoint to match backend urls.py
    await api.delete(`/products/${id}/delete/`);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error.response?.data || error.message);
    throw new Error("Failed to delete product.");
  }
}

/**
 * Mark product as sold - FIXED ENDPOINT
 */
export async function markProductAsSold(id) {
  try {
    // UPDATED LOGIC: Uses the standard update endpoint.
    const response = await api.patch(`/products/${id}/update/`, { is_sold: true });
    return response.data;
  } catch (error) {
    console.error("Error marking product as sold:", error.response?.data || error.message);
    throw new Error("Failed to mark product as sold.");
  }
}

/**
 * Get user's listings - FIXED ENDPOINT
 */
export async function fetchUserListings() {
  try {
    const response = await api.get("/products/my-listings/");
    return response.data;
  } catch (error) {
    console.error("Error fetching user listings:", error.response?.data || error.message);
    throw new Error("Failed to fetch your listings.");
  }
}

/**
 * Get product statistics
 */
export async function fetchProductStats(id) {
  try {
    // UPDATED LOGIC: This data is already on the product, so we just fetch it.
    const product = await fetchProductById(id);
    return {
      views_count: product.views_count,
      likes_count: product.likes_count,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error.response?.data || error.message);
    throw new Error("Failed to fetch product statistics.");
  }
}

// ============ WISHLIST APIs ============

/**
 * Get user's wishlist
 */
export async function fetchWishlist() {
  try {
    // This endpoint does not exist in the current backend configuration.
    const response = await api.get("/wishlist/");
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlist:", error.response?.data || error.message);
    throw new Error("Failed to fetch wishlist.");
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId) {
  try {
    // UPDATED LOGIC: Changed to use the single toggle endpoint.
    const response = await api.post(`/wishlist/${productId}/toggle/`);
    return response.data;
  } catch (error) {
    console.error("Error adding to wishlist:", error.response?.data || error.message);
    throw new Error("Failed to add to wishlist.");
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId) {
  try {
    // UPDATED LOGIC: Changed to use the single toggle endpoint.
    // The backend handles removal if the item already exists.
    const response = await api.post(`/wishlist/${productId}/toggle/`);
    return response.data;
  } catch (error) {
    console.error("Error removing from wishlist:", error.response?.data || error.message);
    throw new Error("Failed to remove from wishlist.");
  }
}

// ============ CHAT APIs ============

/**
 * Fetch user conversations
 */
export async function getMyChats() {
  try {
    const response = await api.get("/chat/conversations/")
    return response
  } catch (error) {
    console.error("Error fetching conversations:", error)
    throw error;
  }
}

/**
 * Fetch messages for a conversation
 */
export async function getChatMessages(conversationId) {
  try {
    const response = await api.get(`/chat/conversations/${conversationId}/messages/`)
    return response
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error;
  }
}

/**
 * Send a message
 */
export async function createMessage(messageData) {
  try {
    const response = await api.post("/chat/messages/create/", messageData)
    return response
  } catch (error) {
    console.error("Error sending message:", error)
    throw error;
  }
}

/**
 * Start conversation with seller
 */
export async function startConversation(sellerId, productId) {
  try {
    // Corrected URL: /api/chat/conversations/start/
    const response = await api.post("/chat/conversations/start/", {
      seller_id: sellerId,
      product_id: productId,
    })
    return response.data
  } catch (error) {
    console.error("Error starting conversation:", error)
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId) {
  try {
    const response = await api.post(`/chat/conversations/${conversationId}/mark-read/`)
    return response.data
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw new Error(error.response?.data?.message || "Failed to mark messages as read")
  }
}

// ============ CATEGORIES APIs ============

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    const response = await api.get("/categories/");
    // --- FIX APPLIED ---
    // Ensure that the function always returns an array.
    // DRF list views return data in a paginated format or as a direct list.
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    // If the format is unexpected, return an empty array to prevent crashes.
    console.warn("Categories API returned unexpected format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    // Return an empty array on error to prevent the .map() error.
    return [];
  }
}

// ============ ANALYTICS APIs ============

/**
 * Get user dashboard stats
 */
export async function fetchUserStats() {
  try {
    const response = await api.get("/users/stats/")
    return response.data
  } catch (error) {
    console.error("Error fetching user stats:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch user statistics")
  }
}

/**
 * Get marketplace stats
 */
export async function fetchMarketplaceStats() {
  try {
    const response = await api.get("/marketplace/stats/")
    return response.data
  } catch (error) {
    console.error("Error fetching marketplace stats:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch marketplace statistics")
  }
}

// ============ SEARCH APIs ============

/**
 * Search products with advanced filters
 */
export async function searchProducts(query, filters = {}) {
  try {
    const params = { q: query, ...filters }
    const response = await api.get("/search/", { params })
    return response.data
  } catch (error) {
    console.error("Error searching products:", error)
    throw new Error(error.response?.data?.message || "Failed to search products")
  }
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(query) {
  try {
    const response = await api.get("/search/suggestions/", {
      params: { q: query },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch search suggestions")
  }
}

// ============ NOTIFICATIONS APIs ============
/**
 * Fetch user's wishlist count
 */
export async function fetchWishlistCount() {
  try {
    const response = await api.get("/products/wishlist/count/");
    return response.data.count;
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return 0; // Return 0 on error
  }
}

/**
 * Fetch user's unread messages count
 */
export async function fetchUnreadMessagesCount() {
  try {
    const response = await api.get("/chat/messages/unread-count/");
    return response.data.unread_count;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return 0; // Return 0 on error
  }
}
/**
 * Fetch user notifications
 */
export async function fetchNotifications() {
  try {
    const response = await api.get("/notifications/")
    return response.data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch notifications")
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await api.patch(`/notifications/${notificationId}/`, { is_read: true })
    return response.data
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw new Error(error.response?.data?.message || "Failed to mark notification as read")
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await api.post("/notifications/mark-all-read/")
    return response.data
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw new Error(error.response?.data?.message || "Failed to mark all notifications as read")
  }
}

// ============ USER PROFILE APIs ============

/**
 * Update user profile
 */
export async function updateUserProfile(profileData) {
  try {
    const response = await api.patch("/auth/user/", profileData)
    return response.data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error(error.response?.data?.message || "Failed to update profile")
  }
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(avatarFile) {
  try {
    const formData = new FormData()
    formData.append("avatar", avatarFile)

    const response = await api.post("/auth/user/avatar/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error("Error uploading avatar:", error)
    throw new Error(error.response?.data?.message || "Failed to upload avatar")
  }
}

/**
 * Change user password
 */
export async function changePassword(passwordData) {
  try {
    const response = await api.post("/auth/change-password/", passwordData)
    return response.data
  } catch (error) {
    console.error("Error changing password:", error)
    throw new Error(error.response?.data?.message || "Failed to change password")
  }
}

// ============ REVIEWS APIs ============

/**
 * Get product reviews
 */
export async function fetchProductReviews(productId) {
  try {
    const response = await api.get(`/products/${productId}/reviews/`)
    return response.data
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch reviews")
  }
}

/**
 * Add product review
 */
export async function addProductReview(productId, reviewData) {
  try {
    const response = await api.post(`/products/${productId}/reviews/`, reviewData)
    return response.data
  } catch (error) {
    console.error("Error adding product review:", error)
    throw new Error(error.response?.data?.message || "Failed to add review")
  }
}

/**
 * Get seller reviews
 */
export async function fetchSellerReviews(sellerId) {
  try {
    const response = await api.get(`/users/${sellerId}/reviews/`)
    return response.data
  } catch (error) {
    console.error("Error fetching seller reviews:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch seller reviews")
  }
}

// ============ REPORTS APIs ============

/**
 * Report a product
 */
export async function reportProduct(productId, reason) {
  try {
    const response = await api.post(`/products/${productId}/report/`, { reason })
    return response.data
  } catch (error) {
    console.error("Error reporting product:", error)
    throw new Error(error.response?.data?.message || "Failed to report product")
  }
}

/**
 * Report a user
 */
export async function reportUser(userId, reason) {
  try {
    const response = await api.post(`/users/${userId}/report/`, { reason })
    return response.data
  } catch (error) {
    console.error("Error reporting user:", error)
    throw new Error(error.response?.data?.message || "Failed to report user")
  }
}

// ============ PAYMENT APIs ============

/**
 * Create a payment order
 */
export async function createPaymentOrder(productId, orderData) {
  try {
    // Corrected URL to include the product ID
    const response = await api.post(`/products/${productId}/create-payment-order/`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment order:", error.response?.data || error.message);
    throw new Error("Failed to create payment order.");
  }
}

/**
 * Verify a payment
 */
export async function verifyPayment(paymentData) {
  try {
    const response = await api.post("/products/verify-payment/", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    throw new Error("Failed to verify payment.");
  }
}

export const generateDescriptionAPI = async (productData) => {
  // The URL of your Django backend endpoint.
  // This should match the URL in your Django urls.py
  const API_URL = '/products/generate-description/';

  try {
    // Make a POST request to the backend using axios, sending the whole object.
    // Your Django view will now receive all this data.
    const response = await api.post(API_URL, productData);

    // Axios automatically handles the JSON response, so we can access it via response.data
    if (response.data && response.data.description) {
      return response.data.description;
    } else {
      // Handle cases where the response might be successful (2xx) but not contain the expected data
      throw new Error('API returned an unexpected response format.');
    }
  } catch (error) {
    // Log the detailed error for debugging purposes
    console.error('Error calling generate description API:', error.response ? error.response.data : error.message);

    // Create a user-friendly error message from the backend response if available
    const errorMessage = error.response?.data?.error || 'Could not connect to the server to generate a description.';

    // Throw a new error to be caught by the calling component
    throw new Error(errorMessage);
  }
};
// ============ CHATBOT APIs ============

/**
 * Send a message to the AI chatbot
 */
export async function sendChatbotMessage(message, history = []) {
  try {
    const response = await api.post("/chatbot/", { message, history })
    return response.data
  } catch (error) {
    console.error("Error sending chatbot message:", error)
    throw new Error(error.response?.data?.error || "Failed to get AI response")
  }
}

// Export the axios instance for custom requests
export { api }
