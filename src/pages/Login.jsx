import { useState } from 'react';
import axios from 'axios';

// const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';
const API_URL = import.meta.env.VITE_API_BASE_URL_DAS

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        onLogin(response.data.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-4">
      
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* LEFT SIDE IMAGE - hidden on mobile/tablets */}
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/Login.jpg')",
          }}
        ></div>

        {/* RIGHT SIDE (FORM) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          
          <div className="w-full max-w-md mx-auto">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-600">
                Sign in to your admin dashboard
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">

                {/* USERNAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-green-500
                                 text-gray-900 placeholder-gray-400"
                      placeholder="Enter your username or email"
                    />

                    {/* ICON */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-green-500
                                 text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                    />

                    {/* ICON */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              {/* REMEMBER + FORGOT */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <a className="text-sm text-green-600 hover:text-green-500 cursor-pointer">
                  Forgot your password?
                </a>
              </div>

              {/* BUTTON */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm
                             text-sm font-medium text-white bg-green-600 hover:bg-green-700
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                             disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in to dashboard"
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              © 2024 EcoAdmin. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
