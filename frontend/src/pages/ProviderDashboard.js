import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatModal from '../components/ChatModal';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('foodsaver_name') || localStorage.getItem('name') || 'User';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [foodPosts, setFoodPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [selectedChatRequest, setSelectedChatRequest] = useState(null);
  const [formData, setFormData] = useState({
    organisationName: '',
    foodName: '',
    foodType: 'Veg',
    quantity: '',
    unit: 'Kg',
    mobileNumber: '',
    district: '',
    address: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);



  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const res = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data.data;
      if (userData) {
        setAverageRating(userData.averageRating || 0);
        setTotalRatings(userData.totalRatings || 0);
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const res = await axios.get('http://localhost:5000/api/requests/provider/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRatings(res.data.data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      console.log('Fetching posts with token:', token);

      const response = await axios.get('http://localhost:5000/api/foodposts/my-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('My posts response:', response.data);

      // Extract data from response
      const postsData = response.data.data || response.data;
      console.log('Posts data extracted:', postsData);

      // Ensure it's an array
      if (Array.isArray(postsData)) {
        setFoodPosts(postsData);
      } else {
        console.error('Posts data is not an array:', postsData);
        setFoodPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error fetching posts';
      alert(`Error: ${errorMessage}`);
      setFoodPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const response = await axios.get('http://localhost:5000/api/requests/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Requests response:', response.data);

      // Extract data from response
      const requestsData = response.data.data || response.data;
      console.log('Requests data extracted:', requestsData);

      // Ensure it's an array
      if (Array.isArray(requestsData)) {
        setRequests(requestsData);
      } else {
        console.error('Requests data is not an array:', requestsData);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error response:', error.response?.data);
      setRequests([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchMyPosts();
    fetchRequests();
    fetchRatings();
    fetchProviderProfile(); // Needed for average rating
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('foodsaver_token');
      console.log('Token being sent:', token);

      const response = await axios.post('http://localhost:5000/api/foodposts', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Food post created:', response.data);

      // Show success message
      alert('Food post created successfully!');

      // Reset form
      setFormData({
        organisationName: '',
        foodName: '',
        foodType: 'Veg',
        quantity: '',
        unit: 'Kg',
        mobileNumber: '',
        district: '',
        address: '',
        expiryDate: ''
      });

      // Refresh posts list
      fetchMyPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error creating food post';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('foodsaver_token');
        await axios.delete(`http://localhost:5000/api/foodposts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMyPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting food post');
      }
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      await axios.put(`http://localhost:5000/api/requests/${requestId}`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      alert(`Error ${action.toLowerCase()}ing request`);
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
            <h1 className="dashboard-title">Provider Dashboard</h1>
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
          {totalRatings > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>⭐</span>
              <span style={{ fontWeight: 'bold' }}>{averageRating} / 5</span>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>(based on {totalRatings} ratings)</span>
            </div>
          )}
        </div>

        {/* Post Availability Form */}
        <div className="form-container">
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>Post Food Availability</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Organisation Name</label>
              <input
                type="text"
                name="organisationName"
                value={formData.organisationName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Name</label>
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Food Type</label>
              <select
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="Kg">Kilograms</option>
                <option value="Litre">Litres</option>
                <option value="Per Person">Per Person</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date & Time</label>
              <input
                type="datetime-local"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-input"
                min={new Date().toISOString().slice(0, 16)}
              />
              <small style={{ color: '#666' }}>Leave empty if no expiry deadline</small>
            </div>

            <button type="submit" className="form-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Post'}
            </button>
          </form>
        </div>

        {/* My Posts */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>My Food Posts</h2>
          {foodPosts.length === 0 ? (
            <p>No food posts yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Food Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foodPosts.map(post => (
                    <tr key={post._id}>
                      <td>{post.foodName}</td>
                      <td>{post.foodType}</td>
                      <td>{post.quantity} {post.unit}</td>
                      <td>{post.district}</td>
                      <td>{post.status}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="action-btn action-btn-decline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Incoming Requests */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>Incoming Requests</h2>
          {requests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Recipient Name</th>
                    <th>Requested Quantity</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request._id}>
                      <td>{request.foodPostId?.foodName}</td>
                      <td>{request.recipientId?.name}</td>
                      <td>{request.requestedQuantity} {request.unit}</td>
                      <td>{request.recipientId?.contactNumber}</td>
                      <td>{request.status}</td>
                      <td>
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleRequestAction(request._id, 'Accepted')}
                              className="action-btn action-btn-accept"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestAction(request._id, 'Declined')}
                              className="action-btn action-btn-decline"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {request.status === 'Accepted' && (
                          <button
                            onClick={() => setSelectedChatRequest(request)}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            💬 Chat
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Received Ratings */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>Received Reviews</h2>
          {ratings.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="cards-grid">
              {ratings.map(rating => (
                <div key={rating._id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{rating.recipientId?.name}</h3>
                    <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
                      {'★'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}
                    </div>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    For: <strong>{rating.foodPostId?.foodName}</strong>
                  </p>
                  {rating.review && (
                    <p style={{ fontStyle: 'italic', color: '#444' }}>"{rating.review}"</p>
                  )}
                  <small style={{ color: '#999' }}>{new Date(rating.updatedAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedChatRequest && (
          <ChatModal
            request={selectedChatRequest}
            onClose={() => setSelectedChatRequest(null)}
          />
        )}

      </div>
    </div>
  );
};

export default ProviderDashboard;
