import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    const name = decodeURIComponent(
      params.get('name') || ''
    );

    console.log('Google success - token:', !!token);
    console.log('Google success - role:', role);
    console.log('Google success - name:', name);

    if (token && role) {
      // Save to localStorage
      localStorage.setItem('foodsaver_token', token);
      localStorage.setItem('foodsaver_role', role);
      localStorage.setItem('foodsaver_name', name);

      // Update AuthContext
      login({ token, role, name });

      // Redirect based on role
      setTimeout(() => {
        if (role === 'provider') {
          window.location.href = '/provider';
        } else if (role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/recipient';
        }
      }, 500);
    } else {
      console.error('No token or role received');
      navigate('/login?error=auth_failed');
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>
        🍱
      </div>
      <h2 style={{ 
        color: '#F97316', 
        marginBottom: '8px' 
      }}>
        Signing you in...
      </h2>
      <p style={{ color: '#6b7280' }}>
        Please wait while we set up your account
      </p>
      <div style={{
        marginTop: '20px',
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #F97316',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
