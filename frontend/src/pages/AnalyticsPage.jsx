import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/provider/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="dashboard"><div className="container">Loading analytics...</div></div>;
    if (!data) return <div className="dashboard"><div className="container">No data available.</div></div>;

    const { summary, monthlyDonations, topItems, districtBreakdown } = data;

    const statCards = [
        { label: 'Total Posts', value: summary.totalPosts, icon: '📝', color: '#3b82f6' },
        { label: 'Active', value: summary.activePosts, icon: '🟢', color: '#10b981' },
        { label: 'Claimed', value: summary.claimedPosts, icon: '✅', color: '#f59e0b' },
        { label: 'Expired', value: summary.expiredPosts, icon: '⏰', color: '#ef4444' },
        { label: 'Total Requests', value: summary.totalRequests, icon: '📩', color: '#8b5cf6' },
        { label: 'Accepted', value: summary.acceptedRequests, icon: '👍', color: '#10b981' },
        { label: 'Declined', value: summary.declinedRequests, icon: '👎', color: '#ef4444' },
        { label: 'Picked Up', value: summary.pickedUp, icon: '📦', color: '#06b6d4' },
    ];

    const monthlyChartData = {
        labels: monthlyDonations.map(m => m._id),
        datasets: [{
            label: 'Monthly Donations',
            data: monthlyDonations.map(m => m.count),
            backgroundColor: 'rgba(255, 107, 53, 0.6)',
            borderColor: '#ff6b35',
            borderWidth: 1
        }]
    };

    const districtChartData = {
        labels: districtBreakdown.map(d => d._id),
        datasets: [{
            data: districtBreakdown.map(d => d.count),
            backgroundColor: ['#ff6b35', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
        }]
    };

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">📊 Provider Analytics</h1>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="card" style={{ textAlign: 'center', padding: '1rem', borderTop: `3px solid ${s.color}` }}>
                            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                            <div style={{ color: '#666', fontSize: '0.85rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Monthly Chart */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ color: '#ff6b35', marginBottom: '1rem' }}>Monthly Donations</h3>
                        {monthlyDonations.length > 0 ? (
                            <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center' }}>No data yet</p>
                        )}
                    </div>

                    {/* District Doughnut */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ color: '#ff6b35', marginBottom: '1rem' }}>By District</h3>
                        {districtBreakdown.length > 0 ? (
                            <Doughnut data={districtChartData} options={{ responsive: true }} />
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center' }}>No data yet</p>
                        )}
                    </div>
                </div>

                {/* Top Items */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#ff6b35', marginBottom: '1.5rem' }}>🏆 Top Donated Items</h2>
                    {topItems.length === 0 ? (
                        <p>No items yet.</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Food Item</th>
                                        <th>Times Donated</th>
                                        <th>Total Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topItems.map((item, i) => (
                                        <tr key={item._id}>
                                            <td>#{i + 1}</td>
                                            <td style={{ fontWeight: 'bold' }}>{item._id}</td>
                                            <td>{item.count}</td>
                                            <td>{item.totalQuantity}</td>
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

export default AnalyticsPage;
