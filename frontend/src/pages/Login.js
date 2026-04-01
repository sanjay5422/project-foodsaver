import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'recipient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Logic to handle token from Google OAuth redirect
      localStorage.setItem('token', token);
      // We might need to fetch user data if AuthContext doesn't handle just having a token
      // Assuming AuthContext will pick up the token on next render or we can force it
      window.location.href = '/'; // Simple way to force refresh and trigger auth check
    }
  }, []);

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
      await login(formData.email, formData.password);
      const role = localStorage.getItem('foodsaver_role');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/recipient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', position: 'relative' }}>
      {/* Floating Home Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'transparent',
          border: '1px solid #F97316',
          borderRadius: '8px',
          padding: '6px 14px',
          color: '#F97316',
          fontWeight: '500',
          fontSize: '14px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        🏠 Home
      </button>

      <div className="container">
        <div className="form-container">
          {/* Back to Home Link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#F97316',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Back to Home
            </Link>
          </div>

          {/* Clickable Logo */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/">
              <img
                src="/foodsaver-logo.png"
                alt="FoodSaver Logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              />
            </Link>
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#ff6b35' }}>
            Login to FoodSaver
          </h2>

          {error && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="recipient">Recipient</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="form-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '16px 0'
            }}>
              <hr style={{ flex: 1, borderColor: '#e5e7eb' }} />
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>OR</span>
              <hr style={{ flex: 1, borderColor: '#e5e7eb' }} />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px 16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                color: '#374151',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: '20px', height: '20px' }}
              />
              Continue with Google
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b35',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
