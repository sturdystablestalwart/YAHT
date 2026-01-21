const API_BASE_URL = "http://localhost:1996/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const authAPI = {
  register: async (email, username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateNotificationSettings: async (settings) => {
    const response = await fetch(`${API_BASE_URL}/auth/notification-settings`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },
};

export const habitsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOne: async (id) => {
    const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (habitData) => {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });
    return handleResponse(response);
  },

  update: async (id, habitData) => {
    const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const completionsAPI = {
  log: async (habitId) => {
    const response = await fetch(`${API_BASE_URL}/completions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ habitId }),
    });
    return handleResponse(response);
  },

  getForHabit: async (habitId, startDate, endDate) => {
    let url = `${API_BASE_URL}/completions/${habitId}`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStats: async (days = 7) => {
    const response = await fetch(`${API_BASE_URL}/completions/stats?days=${days}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDailyStats: async (days = 5) => {
    const response = await fetch(`${API_BASE_URL}/completions/daily-stats?days=${days}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStreaks: async () => {
    const response = await fetch(`${API_BASE_URL}/completions/streaks`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteToday: async (habitId) => {
    const response = await fetch(`${API_BASE_URL}/completions/${habitId}/today`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const notificationsAPI = {
  getPending: async (currentTime, timezone) => {
    let url = `${API_BASE_URL}/notifications/pending`;
    const params = new URLSearchParams();
    if (currentTime) params.append("currentTime", currentTime);
    if (timezone) params.append("timezone", timezone);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markSent: async (habitId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-sent`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ habitId }),
    });
    return handleResponse(response);
  },
};

export const dashboardAPI = {
  getSummary: async (range = "30d") => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary?range=${range}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCalendar: async (weeks = 12, habitId = null) => {
    let url = `${API_BASE_URL}/dashboard/calendar?weeks=${weeks}`;
    if (habitId) url += `&habitId=${habitId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTrends: async (range = "90d", habitId = null) => {
    let url = `${API_BASE_URL}/dashboard/trends?range=${range}`;
    if (habitId) url += `&habitId=${habitId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTimeHeatmap: async (range = "30d", habitId = null) => {
    let url = `${API_BASE_URL}/dashboard/time-heatmap?range=${range}`;
    if (habitId) url += `&habitId=${habitId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
