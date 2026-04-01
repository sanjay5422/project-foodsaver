import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'recipient', mobile: '', location: ''
  });
  const [otp, setOtp] = useState(
    ['', '', '', '', '', '']
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(300);
  const [intervalId, setIntervalId] = useState(null);
  const { login } = useAuth();

  const startTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setTimer(300);
    const id = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    setError('');
    if (!form.name || !form.email ||
        !form.password || !form.mobile ||
        !form.location) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/auth/send-otp`, form
      );
      if (res.data.success) {
        setStep(2);
        setSuccess('OTP sent to ' + form.email);
        startTimer();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Enter complete 6 digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/auth/verify-otp`,
        { email: form.email, otp: otpString }
      );
      if (res.data.success && res.data.token) {
        localStorage.setItem(
          'foodsaver_token', res.data.token
        );
        localStorage.setItem(
          'foodsaver_role', res.data.role
        );
        localStorage.setItem(
          'foodsaver_name', res.data.name || ''
        );

        // Keep AuthContext in sync with localStorage
        login({
          token: res.data.token,
          role: res.data.role,
          name: res.data.name || ''
        });

        if (res.data.role === 'provider') {
          window.location.href = '/provider/dashboard';
        } else if (res.data.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/recipient/dashboard';
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] &&
        index > 0) {
      document.getElementById(`otp-${index - 1}`)
        ?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(
        `${API}/api/auth/resend-otp`,
        { email: form.email }
      );
      setSuccess('New OTP sent!');
      setError('');
      startTimer();
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const inp = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '6px'
  };

  const lbl = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'block'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px'
      }}>
        <Link to="/" style={{
          color: '#F97316',
          textDecoration: 'none',
          border: '1px solid #F97316',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>🏠 Home</Link>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <img src="/foodsaver-logo.png"
            alt="FoodSaver"
            style={{ height: '48px' }} />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>❌ {error}</div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>✅ {success}</div>
        )}

        {step === 1 && (
          <>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#F97316',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Register for FoodSaver
            </h2>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={lbl}>Full Name *</label>
                <input type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm({
                    ...form, name: e.target.value
                  })}
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>
                  Email Address *
                </label>
                <input type="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={e => setForm({
                    ...form, email: e.target.value
                  })}
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>Password *</label>
                <input type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({
                    ...form, password: e.target.value
                  })}
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm({
                    ...form, role: e.target.value
                  })}
                  style={{ ...inp, backgroundColor: 'white' }}
                >
                  <option value="recipient">
                    Recipient (NGO / Person in Need)
                  </option>
                  <option value="provider">
                    Provider (Food Donor)
                  </option>
                </select>
              </div>
              <div>
                <label style={lbl}>
                  Contact Number *
                </label>
                <input type="text"
                  placeholder="10 digit mobile"
                  value={form.mobile}
                  maxLength={10}
                  onChange={e => setForm({
                    ...form, mobile: e.target.value
                  })}
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>District *</label>
                <input type="text"
                  placeholder="Your district"
                  value={form.location}
                  onChange={e => setForm({
                    ...form, location: e.target.value
                  })}
                  style={inp} />
              </div>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading
                  ? '#fdba74' : '#F97316',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading
                  ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              {loading
                ? '⏳ Sending...'
                : '📧 Send OTP to Email'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '16px 0'
            }}>
              <hr style={{
                flex: 1, borderColor: '#e5e7eb'
              }} />
              <span style={{
                color: '#9ca3af', fontSize: '13px'
              }}>OR</span>
              <hr style={{
                flex: 1, borderColor: '#e5e7eb'
              }} />
            </div>

            <button
              onClick={() => window.location.href =
                'http://localhost:5000/api/auth/google'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#374151'
              }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: '20px', height: '20px' }}
              />
              Continue with Google
            </button>

            <p style={{
              textAlign: 'center',
              marginTop: '16px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#F97316',
                fontWeight: '600',
                textDecoration: 'none'
              }}>Login here</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '56px' }}>📧</div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#1f2937',
                margin: '12px 0 8px'
              }}>Verify Your Email</h2>
              <p style={{
                color: '#6b7280', fontSize: '14px'
              }}>
                OTP sent to
              </p>
              <p style={{
                color: '#F97316',
                fontWeight: '700',
                fontSize: '15px'
              }}>
                {form.email}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e =>
                    handleOtpChange(i, e.target.value)
                  }
                  onKeyDown={e =>
                    handleOtpKeyDown(i, e)
                  }
                  style={{
                    width: '50px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: '700',
                    border: digit
                      ? '2px solid #F97316'
                      : '2px solid #d1d5db',
                    borderRadius: '10px',
                    outline: 'none',
                    backgroundColor: digit
                      ? '#fff7ed' : 'white'
                  }}
                />
              ))}
            </div>

            <p style={{
              textAlign: 'center',
              color: timer < 60 ? '#EF4444' : '#6b7280',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              ⏱️ Expires in:{' '}
              <strong style={{
                color: timer < 60
                  ? '#EF4444' : '#F97316'
              }}>
                {formatTime(timer)}
              </strong>
            </p>

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading
                  ? '#fdba74' : '#F97316',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading
                  ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {loading
                ? '⏳ Verifying...'
                : '✅ Verify OTP'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '0 0 8px'
              }}>
                Didn't receive?{' '}
                <button
                  onClick={handleResend}
                  disabled={timer > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: timer > 0
                      ? '#9ca3af' : '#F97316',
                    cursor: timer > 0
                      ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Resend OTP
                </button>
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                  setSuccess('');
                  if (intervalId) clearInterval(intervalId);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                ← Change Email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
