import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('foodsaver_name') || localStorage.getItem('name') || 'User';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [stats, setStats] = useState({
    totalProviders: 0,
    totalRecipients: 0,
    totalFoodPosts: 0,
    totalRequests: 0,
    acceptedRequests: 0,
    declinedRequests: 0,
    pendingRequests: 0,
    totalFoodSaved: 0,
    requestsByDistrict: [],
    monthlyFoodSaved: []
  });
  const [users, setUsers] = useState([]);
  const [foodPosts, setFoodPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setUsers(response.data.users || []);
      setFoodPosts(response.data.foodPosts || response.data.posts || []);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // =====================
      // PAGE 1 - HEADER
      // =====================
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FoodSaver', pageWidth / 2, 20, {
        align: 'center'
      });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Reducing Food Waste, Providing Hope',
        pageWidth / 2,
        32,
        { align: 'center' }
      );

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Admin Report', pageWidth / 2, 58, {
        align: 'center'
      });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Generated on: ${today}`,
        pageWidth / 2,
        68,
        { align: 'center' }
      );

      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.5);
      doc.line(14, 74, pageWidth - 14, 74);

      // =====================
      // STATISTICS SECTION
      // =====================
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Platform Statistics', 14, 86);

      autoTable(doc, {
        startY: 92,
        head: [['Metric', 'Count']],
        body: [
          ['Total Providers', stats.totalProviders || '0'],
          ['Total Recipients', stats.totalRecipients || '0'],
          ['Total Food Posts', stats.totalFoodPosts || '0'],
          ['Total Requests', stats.totalRequests || '0'],
          ['Accepted Requests', stats.acceptedRequests || '0'],
          ['Declined Requests', stats.declinedRequests || '0'],
          ['Pending Requests', stats.pendingRequests || '0'],
          ['Total Food Saved', `${stats.totalFoodSaved || '0'} Kg/Litre`]
        ],
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        bodyStyles: {
          fontSize: 10,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'center', cellWidth: 60 }
        },
        margin: { left: 14, right: 14 }
      });

      // =====================
      // PAGE 2 - USERS TABLE
      // =====================
      doc.addPage();

      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FoodSaver - User Report', 14, 13);

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Registered Users', 14, 34);

      const usersData = users?.map((user) => [
        user.name || '-',
        user.email || '-',
        user.role || '-',
        user.mobile || user.contactNumber || '-',
        user.location || user.district || '-',
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-IN')
          : '-'
      ]) || [];

      autoTable(doc, {
        startY: 40,
        head: [[
          'Name',
          'Email',
          'Role',
          'Mobile',
          'Location',
          'Joined'
        ]],
        body: usersData.length > 0
          ? usersData
          : [['No users found', '', '', '', '', '']],
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        },
        margin: { left: 14, right: 14 }
      });

      // =====================
      // PAGE 3 - FOOD POSTS
      // =====================
      doc.addPage();

      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FoodSaver - Food Posts Report', 14, 13);

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Food Availability Posts', 14, 34);

      const foodData = foodPosts?.map((post) => [
        post.organisationName || '-',
        post.foodName || '-',
        post.foodType || '-',
        `${post.quantity || '0'} ${post.unit || ''}`,
        post.district || post.location || '-',
        post.createdAt
          ? new Date(post.createdAt).toLocaleDateString('en-IN')
          : '-'
      ]) || [];

      autoTable(doc, {
        startY: 40,
        head: [[
          'Organisation',
          'Food Name',
          'Type',
          'Quantity',
          'District',
          'Posted On'
        ]],
        body: foodData.length > 0
          ? foodData
          : [['No food posts found', '', '', '', '', '']],
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        },
        margin: { left: 14, right: 14 }
      });

      // =====================
      // PAGE 4 - REQUESTS
      // =====================
      doc.addPage();

      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FoodSaver - Requests Report', 14, 13);

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Food Requests', 14, 34);

      const requestsData = requests?.map((req) => [
        req.foodName || req.availabilityId?.foodName || '-',
        req.providerName || req.providerId?.name || '-',
        req.recipientName || req.recipientId?.name || '-',
        `${req.requestedQuantity || '0'} ${req.unit || ''}`,
        req.status || '-',
        req.createdAt
          ? new Date(req.createdAt).toLocaleDateString('en-IN')
          : '-'
      ]) || [];

      autoTable(doc, {
        startY: 40,
        head: [[
          'Food',
          'Provider',
          'Recipient',
          'Quantity',
          'Status',
          'Date'
        ]],
        body: requestsData.length > 0
          ? requestsData
          : [['No requests found', '', '', '', '', '']],
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const status = String(data.cell.raw || '').toLowerCase();
            data.cell.styles.fontStyle = 'bold';
            if (status === 'accepted') data.cell.styles.textColor = [34, 197, 94];
            else if (status === 'declined') data.cell.styles.textColor = [239, 68, 68];
            else data.cell.styles.textColor = [234, 179, 8];
          }
        },
        margin: { left: 14, right: 14 }
      });

      // =====================
      // FOOTER ON ALL PAGES
      // =====================
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFillColor(31, 41, 55);
        doc.rect(
          0,
          doc.internal.pageSize.getHeight() - 16,
          pageWidth,
          16,
          'F'
        );

        doc.setTextColor(156, 163, 175);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          '© 2024 FoodSaver — Reducing Food Waste, Providing Hope',
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: 'center' }
        );

        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 6,
          { align: 'right' }
        );
      }

      // =====================
      // SAVE PDF
      // =====================
      const fileName = `FoodSaver_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      alert('Report generated successfully! ✅');
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(`Failed to generate report: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="container">Loading...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <button
              onClick={() => navigate('/profile')}
              title="View Profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F97316',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getInitials(userName)}
            </button>
          </div>
          <button
            onClick={generatePDF}
            style={{
              backgroundColor: '#22C55E',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Generate Report
          </button>
        </div>

        {/* Statistics Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalProviders}</div>
            <div className="stat-label">Total Providers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalRecipients}</div>
            <div className="stat-label">Total Recipients</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalFoodPosts}</div>
            <div className="stat-label">Total Food Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalRequests}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.acceptedRequests}</div>
            <div className="stat-label">Accepted Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.declinedRequests}</div>
            <div className="stat-label">Declined Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalFoodSaved}</div>
            <div className="stat-label">Total Food Saved (units)</div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>Analytics</h2>

          <div className="cards-grid">
            {/* Requests by District Chart */}
            <div className="card">
              <h3 className="card-title">Requests by District</h3>
              <div style={{ marginTop: '1rem' }}>
                {stats.requestsByDistrict.length === 0 ? (
                  <p>No data available</p>
                ) : (
                  <div>
                    {stats.requestsByDistrict.map((district, index) => (
                      <div key={district._id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{district._id}</span>
                          <span>{district.count}</span>
                        </div>
                        <div style={{
                          background: '#e0e0e0',
                          height: '20px',
                          borderRadius: '10px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: '#ff6b35',
                            height: '100%',
                            width: `${(district.count / Math.max(...stats.requestsByDistrict.map(d => d.count))) * 100}%`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Accept/Decline Pie Chart */}
            <div className="card">
              <h3 className="card-title">Request Status</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Accepted</span>
                    <span>{stats.acceptedRequests}</span>
                  </div>
                  <div style={{
                    background: '#d4edda',
                    height: '30px',
                    borderRadius: '5px',
                    position: 'relative'
                  }}>
                    <div style={{
                      background: '#28a745',
                      height: '100%',
                      width: stats.totalRequests > 0 ? `${(stats.acceptedRequests / stats.totalRequests) * 100}%` : '0%',
                      borderRadius: '5px'
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Declined</span>
                    <span>{stats.declinedRequests}</span>
                  </div>
                  <div style={{
                    background: '#f8d7da',
                    height: '30px',
                    borderRadius: '5px',
                    position: 'relative'
                  }}>
                    <div style={{
                      background: '#dc3545',
                      height: '100%',
                      width: stats.totalRequests > 0 ? `${(stats.declinedRequests / stats.totalRequests) * 100}%` : '0%',
                      borderRadius: '5px'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Food Saved */}
            <div className="card">
              <h3 className="card-title">Monthly Food Saved</h3>
              <div style={{ marginTop: '1rem' }}>
                {stats.monthlyFoodSaved.length === 0 ? (
                  <p>No data available</p>
                ) : (
                  <div>
                    {stats.monthlyFoodSaved.map((month, index) => (
                      <div key={`${month._id.year}-${month._id.month}`} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{month._id.month}/{month._id.year}</span>
                          <span>{month.totalFood} units</span>
                        </div>
                        <div style={{
                          background: '#e0e0e0',
                          height: '20px',
                          borderRadius: '10px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: '#007bff',
                            height: '100%',
                            width: `${(month.totalFood / Math.max(...stats.monthlyFoodSaved.map(m => m.totalFood))) * 100}%`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
