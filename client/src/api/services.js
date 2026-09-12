import api from './client';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getUserById: (id) => api.get(`/users/${id}`),
  addTeachSkill: (data) => api.post('/users/me/skills/teach', data),
  removeTeachSkill: (skillId) => api.delete(`/users/me/skills/teach/${skillId}`),
  addLearnSkill: (data) => api.post('/users/me/skills/learn', data),
  removeLearnSkill: (skillId) => api.delete(`/users/me/skills/learn/${skillId}`),
  blockUser: (id) => api.post(`/users/${id}/block`),
  unblockUser: (id) => api.delete(`/users/${id}/block`)
};

export const skillService = {
  getSkills: (params) => api.get('/skills', { params })
};

export const availabilityService = {
  getMyAvailability: () => api.get('/availability/me'),
  createSlot: (data) => api.post('/availability', data),
  deleteSlot: (id) => api.delete(`/availability/${id}`)
};

export const matchingService = {
  getMatches: (params) => api.get('/matches', { params })
};

export const requestService = {
  createRequest: (data) => api.post('/requests', data),
  getSentRequests: () => api.get('/requests/sent'),
  getReceivedRequests: () => api.get('/requests/received'),
  acceptRequest: (id) => api.patch(`/requests/${id}/accept`),
  rejectRequest: (id) => api.patch(`/requests/${id}/reject`),
  cancelRequest: (id) => api.patch(`/requests/${id}/cancel`)
};

export const sessionService = {
  createSession: (data) => api.post('/sessions', data),
  getMySessions: (params) => api.get('/sessions/me', { params }),
  completeSession: (id) => api.patch(`/sessions/${id}/complete`),
  cancelSession: (id) => api.patch(`/sessions/${id}/cancel`)
};

export const ratingService = {
  createRating: (data) => api.post('/ratings', data),
  getUserRatings: (userId) => api.get(`/ratings/users/${userId}`)
};

export const creditService = {
  getBalance: () => api.get('/credits/balance'),
  getHistory: () => api.get('/credits/history')
};

export const badgeService = {
  getAllBadges: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/me')
};

export const analyticsService = {
  getTrendingSkills: () => api.get('/analytics/trending-skills')
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard')
};

export const searchService = {
  globalSearch: (params) => api.get('/search', { params })
};

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
  deleteConversation: (conversationId) => api.delete(`/chat/conversations/${conversationId}`),
  deleteMessage: (conversationId, messageId) => api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`)
};

