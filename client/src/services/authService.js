import api from './api';

export const authService = {
  // Step 1: Initiate registration (creates user, sends email OTP)
  async register(name, email, mobile) {
    const res = await api.post('/auth/register', { name, email, mobile });
    return res.data;
  },

  // Step 2: Verify 6-digit email OTP
  async verifyOtp(email, otp) {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  // Resend email OTP (with 60s cooldown)
  async resendOtp(email) {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },

  // Get test identities for sandbox Aadhaar verification
  async getAadhaarTestIdentities() {
    const res = await api.get('/auth/aadhaar/test-identities');
    return res.data;
  },

  // Step 3A: Initiate simulated Aadhaar verification
  async initiateAadhaar(email, aadhaarNumber) {
    const res = await api.post('/auth/aadhaar/initiate', { email, aadhaarNumber });
    return res.data;
  },

  // Step 3B: Verify Aadhaar OTP (stores referenceId only)
  async verifyAadhaar(referenceId, otp) {
    const res = await api.post('/auth/aadhaar/verify', { referenceId, otp });
    return res.data;
  },

  // Step 4: Set strong password (allowed only if email & aadhaar verified)
  async setPassword(email, password, confirmPassword) {
    const res = await api.post('/auth/set-password', { email, password, confirmPassword });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Step 5: Login with email & password
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Fetch current user profile
  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },

  // Update profile
  async updateProfile(profileData) {
    const res = await api.put('/users/me', profileData);
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
