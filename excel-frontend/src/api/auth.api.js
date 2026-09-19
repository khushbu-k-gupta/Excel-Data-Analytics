import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),

  register: ({ name, email, password }) =>
    api.post('/auth/register', { username: name, useremail: email, password }),

  getProfile: () => api.get('/auth/me'),

  updateProfile: ({ name, email }) =>
    api.put('/auth/me', { username: name, useremail: email }),

  changePassword: ({ oldPassword, newPassword }) =>
    api.put('/auth/change-password', { oldpassword: oldPassword, newpassword: newPassword }),
};