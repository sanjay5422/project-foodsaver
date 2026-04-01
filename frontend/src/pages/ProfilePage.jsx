import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', mobile: '', location: '', bio: ''
    });

    const [passForm, setPassForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    });

    const token = localStorage.getItem('foodsaver_token') || localStorage.getItem('token'); // handle both token names just in case

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/profile/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.user);
            setForm({
                name: res.data.user.name || '',
                mobile: res.data.user.mobile || '',
                location: res.data.user.location || '',
                bio: res.data.user.bio || ''
            });
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.patch(
                'http://localhost:5000/api/profile/update',
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data.user);
            setMessage('Profile updated successfully!');
            setEditMode(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    const handlePasswordChange = async () => {
        try {
            await axios.patch(
                'http://localhost:5000/api/profile/change-password',
                passForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Password changed successfully!');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Password change failed');
        }
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'provider') return '#22C55E';
        if (role === 'recipient') return '#3B82F6';
        return '#F97316';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (loading) return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh',
            fontSize: '18px', color: '#F97316'
        }}>
            Loading profile...
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #F97316',
                        color: '#F97316',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        fontWeight: '500'
                    }}
                >
                    ← Back
                </button>

                {/* Success/Error Messages */}
                {message && (
                    <div style={{
                        backgroundColor: '#dcfce7',
                        border: '1px solid #22C55E',
                        color: '#166534',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        ✅ {message}
                    </div>
                )}
                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #EF4444',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}
                        onClick={() => setError('')}
                    >
                        ❌ {error}
                    </div>
                )}

                {/* Profile Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    marginBottom: '24px'
                }}>
                    {/* Orange Header Banner */}
                    <div style={{
                        backgroundColor: '#F97316',
                        height: '80px'
                    }} />

                    {/* Avatar + Name */}
                    <div style={{ padding: '0 32px 32px', marginTop: '-40px' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#1f2937',
                            border: '4px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '16px'
                        }}>
                            {getInitials(user?.name)}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                    margin: '0 0 6px'
                                }}>
                                    {user?.name}
                                </h2>
                                <p style={{ color: '#6b7280', margin: '0 0 8px' }}>
                                    {user?.email}
                                </p>
                                {/* Role Badge */}
                                <span style={{
                                    backgroundColor: getRoleBadgeColor(user?.role),
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    textTransform: 'capitalize'
                                }}>
                                    {user?.role}
                                </span>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setEditMode(!editMode)}
                                style={{
                                    backgroundColor: editMode ? '#6b7280' : '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {editMode ? 'Cancel' : '✏️ Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Info Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    padding: '32px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '24px',
                        color: '#1f2937'
                    }}>
                        👤 Profile Information
                    </h3>

                    <div style={{ display: 'grid', gap: '20px' }}>

                        {/* Name */}
                        <div>
                            <label style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '6px'
                            }}>
                                FULL NAME
                            </label>
                            {editMode ? (
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px', fontSize: '15px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            ) : (
                                <p style={{
                                    fontSize: '16px', color: '#1f2937',
                                    margin: 0, fontWeight: '500'
                                }}>
                                    {user?.name || '—'}
                                </p>
                            )}
                        </div>

                        {/* Email - always readonly */}
                        <div>
                            <label style={{
                                fontSize: '13px', color: '#6b7280',
                                fontWeight: '600', display: 'block',
                                marginBottom: '6px'
                            }}>
                                EMAIL ADDRESS 🔒
                            </label>
                            <p style={{
                                fontSize: '16px', color: '#6b7280',
                                margin: 0
                            }}>
                                {user?.email}
                            </p>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label style={{
                                fontSize: '13px', color: '#6b7280',
                                fontWeight: '600', display: 'block',
                                marginBottom: '6px'
                            }}>
                                MOBILE NUMBER
                            </label>
                            {editMode ? (
                                <input
                                    value={form.mobile}
                                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                                    maxLength={10}
                                    placeholder="10 digit mobile number"
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px', fontSize: '15px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            ) : (
                                <p style={{
                                    fontSize: '16px', color: '#1f2937',
                                    margin: 0, fontWeight: '500'
                                }}>
                                    {user?.mobile || '—'}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label style={{
                                fontSize: '13px', color: '#6b7280',
                                fontWeight: '600', display: 'block',
                                marginBottom: '6px'
                            }}>
                                LOCATION
                            </label>
                            {editMode ? (
                                <input
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="Your district / city"
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px', fontSize: '15px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            ) : (
                                <p style={{
                                    fontSize: '16px', color: '#1f2937',
                                    margin: 0, fontWeight: '500'
                                }}>
                                    {user?.location || '—'}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={{
                                fontSize: '13px', color: '#6b7280',
                                fontWeight: '600', display: 'block',
                                marginBottom: '6px'
                            }}>
                                BIO
                            </label>
                            {editMode ? (
                                <textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    placeholder="Tell us about yourself (max 200 chars)"
                                    maxLength={200}
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px', fontSize: '15px',
                                        boxSizing: 'border-box', resize: 'vertical'
                                    }}
                                />
                            ) : (
                                <p style={{
                                    fontSize: '16px', color: '#1f2937',
                                    margin: 0
                                }}>
                                    {user?.bio || '—'}
                                </p>
                            )}
                        </div>

                        {/* Member Since */}
                        <div>
                            <label style={{
                                fontSize: '13px', color: '#6b7280',
                                fontWeight: '600', display: 'block',
                                marginBottom: '6px'
                            }}>
                                MEMBER SINCE
                            </label>
                            <p style={{
                                fontSize: '16px', color: '#1f2937',
                                margin: 0, fontWeight: '500'
                            }}>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        </div>

                    </div>

                    {/* Save Button */}
                    {editMode && (
                        <button
                            onClick={handleUpdate}
                            style={{
                                marginTop: '24px',
                                backgroundColor: '#F97316',
                                color: 'white',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            💾 Save Changes
                        </button>
                    )}
                </div>

                {/* Change Password Card */}
                {!user?.isGoogleUser && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        padding: '32px'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            marginBottom: '24px',
                            color: '#1f2937'
                        }}>
                            🔒 Change Password
                        </h3>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passForm.currentPassword}
                                onChange={e => setPassForm({
                                    ...passForm, currentPassword: e.target.value
                                })}
                                style={{
                                    width: '100%', padding: '10px 14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '15px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="New Password (min 8 characters)"
                                value={passForm.newPassword}
                                onChange={e => setPassForm({
                                    ...passForm, newPassword: e.target.value
                                })}
                                style={{
                                    width: '100%', padding: '10px 14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '15px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passForm.confirmPassword}
                                onChange={e => setPassForm({
                                    ...passForm, confirmPassword: e.target.value
                                })}
                                style={{
                                    width: '100%', padding: '10px 14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px', fontSize: '15px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                onClick={handlePasswordChange}
                                style={{
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🔐 Update Password
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
