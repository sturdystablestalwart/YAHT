import api from "./axiosInstance";

export const authAPI = {
  register: (email, username, password) =>
    api.post("/auth/register", { email, username, password }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),

  updateNotificationSettings: (settings) => api.patch("/auth/notification-settings", settings),
};

export const habitsAPI = {
  getAll: () => api.get("/habits"),

  getOne: (id) => api.get(`/habits/${id}`),

  create: (habitData) => api.post("/habits", habitData),

  update: (id, habitData) => api.put(`/habits/${id}`, habitData),

  delete: (id) => api.delete(`/habits/${id}`),
};

export const completionsAPI = {
  log: (habitId) => api.post("/completions", { habitId }),

  getForHabit: (habitId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString();
    return api.get(`/completions/${habitId}${query ? `?${query}` : ""}`);
  },

  getStats: (days = 7) => api.get(`/completions/stats?days=${days}`),

  getDailyStats: (days = 5) => api.get(`/completions/daily-stats?days=${days}`),

  getStreaks: () => api.get("/completions/streaks"),

  deleteToday: (habitId) => api.delete(`/completions/${habitId}/today`),
};

export const notificationsAPI = {
  getPending: (currentTime, timezone) => {
    const params = new URLSearchParams();
    if (currentTime) params.append("currentTime", currentTime);
    if (timezone) params.append("timezone", timezone);
    const query = params.toString();
    return api.get(`/notifications/pending${query ? `?${query}` : ""}`);
  },

  markSent: (habitId) => api.post("/notifications/mark-sent", { habitId }),
};

export const dashboardAPI = {
  getSummary: (range = "30d") => api.get(`/dashboard/summary?range=${range}`),

  getCalendar: (weeks = 12, habitId = null) => {
    let url = `/dashboard/calendar?weeks=${weeks}`;
    if (habitId) url += `&habitId=${habitId}`;
    return api.get(url);
  },

  getTrends: (range = "90d", habitId = null) => {
    let url = `/dashboard/trends?range=${range}`;
    if (habitId) url += `&habitId=${habitId}`;
    return api.get(url);
  },

  getTimeHeatmap: (range = "30d", habitId = null) => {
    let url = `/dashboard/time-heatmap?range=${range}`;
    if (habitId) url += `&habitId=${habitId}`;
    return api.get(url);
  },
};
