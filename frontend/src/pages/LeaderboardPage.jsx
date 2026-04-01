import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardPage = () => {
    const [topProviders, setTopProviders] = useState([]);
    const [topDistricts, setTopDistricts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [provRes, distRes, statRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/leaderboard/top-providers'),
                    axios.get('http://localhost:5000/api/leaderboard/top-districts'),
                    axios.get('http://localhost:5000/api/leaderboard/stats')
                ]);
                setTopProviders(provRes.data.data || []);
                setTopDistricts(distRes.data.data || []);
                setStats(statRes.data.data || {});
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard"><div className="container">Loading...</div></div>;

    const statCards = [
        { label: 'Total Providers', value: stats.totalProviders || 0, icon: '🏪' },
        { label: 'Total Recipients', value: stats.totalRecipients || 0, icon: '🤝' },
        { label: 'Food Posts', value: stats.totalPosts || 0, icon: '🍱' },
        { label: 'Requests Accepted', value: stats.totalAccepted || 0, icon: '✅' },
        { label: 'Pickups Completed', value: stats.totalPickedUp || 0, icon: '📦' },
    ];

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">🏆 Community Leaderboard</h1>
                </div>

                {/* Impact Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b35' }}>{s.value}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Top Providers */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>🥇 Top Food Heroes</h2>
                    {topProviders.length === 0 ? (
                        <p>No donations yet.</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Provider</th>
                                        <th>District</th>
                                        <th>Donations</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProviders.map((p, i) => (
                                        <tr key={p._id}>
                                            <td style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </td>
                                            <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                                            <td>{p.district}</td>
                                            <td>{p.totalDonations}</td>
                                            <td>
                                                {p.averageRating > 0 ? (
                                                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(p.averageRating))}{'☆'.repeat(5 - Math.round(p.averageRating))} ({p.averageRating})</span>
                                                ) : 'No ratings'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Top Districts */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>📍 Most Active Districts</h2>
                    {topDistricts.length === 0 ? (
                        <p>No data yet.</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>District</th>
                                        <th>Total Posts</th>
                                        <th>Total Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topDistricts.map((d, i) => (
                                        <tr key={d._id}>
                                            <td style={{ fontWeight: 'bold' }}>#{i + 1}</td>
                                            <td style={{ fontWeight: 'bold' }}>{d._id}</td>
                                            <td>{d.totalPosts}</td>
                                            <td>{d.totalQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
