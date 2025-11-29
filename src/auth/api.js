import axios from 'axios';

const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

export const DoAll = async (params) => {
  try {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(`${API_URL}/doAll`, params, config);
    
    return response;
  } catch (error) {
    console.error('DoAll Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw error;
  }
};