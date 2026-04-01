import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent.jsx';
import ChatModal from '../components/ChatModal';
import { useNavigate } from 'react-router-dom';

const RecipientDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('foodsaver_name') || localStorage.getItem('name') || 'User';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [foodPosts, setFoodPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestedQuantity: '',
    unit: 'Kg'
  });

  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequestToRate, setSelectedRequestToRate] = useState(null);
  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: ''
  });

  const [viewMode, setViewMode] = useState('list');
  const [selectedMapPost, setSelectedMapPost] = useState(null);
  const [selectedChatRequest, setSelectedChatRequest] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [loading, setLoading] = useState(true);



  const fetchFoodPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (searchTerm) params.append('search', searchTerm);
      if (foodTypeFilter) params.append('foodType', foodTypeFilter);
      if (sortBy) params.append('sort', sortBy);

      const url = `http://localhost:5000/api/foodposts?${params.toString()}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Extract data from response
      const postsData = response.data.data || response.data;
      console.log('Food posts data extracted:', postsData);

      // Ensure it's an array
      if (Array.isArray(postsData)) {
        setFoodPosts(postsData);
      } else {
        console.error('Food posts data is not an array:', postsData);
        setFoodPosts([]);
      }
    } catch (error) {
      console.error('Error fetching food posts:', error);
      setFoodPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, searchTerm, foodTypeFilter, sortBy]);

  const fetchMyRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      const response = await axios.get('http://localhost:5000/api/requests/recipient', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Extract data from response
      const requestsData = response.data.data || response.data;
      console.log('My requests data extracted:', requestsData);

      // Ensure it's an array
      if (Array.isArray(requestsData)) {
        setMyRequests(requestsData);
      } else {
        console.error('My requests data is not an array:', requestsData);
        setMyRequests([]);
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
      setMyRequests([]); // Set empty array on error
    }
  }, []);

  const fetchDistricts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/foodposts/districts/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('foodsaver_token')}`
        }
      });

      // Extract data from response
      const districtsData = response.data.data || response.data;
      console.log('Districts data extracted:', districtsData);

      // Ensure it's an array
      if (Array.isArray(districtsData)) {
        setDistricts(districtsData);
      } else {
        console.error('Districts data is not an array:', districtsData);
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]); // Set empty array on error
    }
  }, []);

  useEffect(() => {
    fetchFoodPosts();
    fetchMyRequests();
    fetchDistricts();
  }, [fetchFoodPosts, fetchMyRequests, fetchDistricts]);

  const handleTakeNow = (post) => {
    setSelectedPost(post);
    setShowModal(true);
    setRequestForm({
      requestedQuantity: '',
      unit: post.unit
    });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('foodsaver_token');
      if (!token) {
        alert('Please login again');
        window.location.href = '/login';
        return;
      }

      await axios.post('http://localhost:5000/api/requests', {
        foodPostId: selectedPost._id,
        requestedQuantity: requestForm.requestedQuantity,
        unit: requestForm.unit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowModal(false);
      fetchMyRequests();
      fetchFoodPosts();
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Request error:', error.response?.data || error.message);
      alert(
        'Error: ' +
        (error.response?.data?.message || 'Error submitting request')
      );
    }
  };

  const handleMarkPickedUp = async (requestId) => {
    try {
      const token = localStorage.getItem('foodsaver_token');
      await axios.patch(`http://localhost:5000/api/requests/${requestId}/pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyRequests();

      // Open rating modal after successful pickup
      const request = myRequests.find(r => r._id === requestId);
      setSelectedRequestToRate(request);
      setShowRatingModal(true);
      setRatingForm({ rating: 0, review: '' });

    } catch (error) {
      console.error('Error marking as picked up:', error);
      alert(error.response?.data?.message || 'Error updating pickup status');
    }
  };

  const submitRating = async () => {
    try {
      if (ratingForm.rating === 0) {
        alert('Please select a rating');
        return;
      }

      const token = localStorage.getItem('foodsaver_token');
      await axios.post(`http://localhost:5000/api/requests/${selectedRequestToRate._id}/rate`, ratingForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Rating submitted successfully!');
      setShowRatingModal(false);
      fetchMyRequests();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.response?.data?.message || 'Error submitting rating');
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
            <h1 className="dashboard-title">Recipient Dashboard</h1>
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
        </div>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <input
            type="text"
            placeholder="🔍 Search food or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '200px', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <select
            value={foodTypeFilter}
            onChange={(e) => setFoodTypeFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Types</option>
            <option value="Veg">Vegetarian</option>
            <option value="Non-Veg">Non-Vegetarian</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="quantity_desc">Quantity: High → Low</option>
            <option value="quantity_asc">Quantity: Low → High</option>
          </select>
          {(searchTerm || foodTypeFilter || sortBy || selectedDistrict) && (
            <button
              onClick={() => { setSearchTerm(''); setFoodTypeFilter(''); setSortBy(''); setSelectedDistrict(''); }}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ✕ Clear
            </button>
          )}
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Filter by District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Available Food Posts */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#ff6b35', margin: 0 }}>Available Food</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ff6b35', background: viewMode === 'list' ? '#ff6b35' : '#fff', color: viewMode === 'list' ? '#fff' : '#ff6b35', borderRadius: '4px', cursor: 'pointer' }}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ff6b35', background: viewMode === 'map' ? '#ff6b35' : '#fff', color: viewMode === 'map' ? '#fff' : '#ff6b35', borderRadius: '4px', cursor: 'pointer' }}
              >
                Map View
              </button>
            </div>
          </div>

          {foodPosts.length === 0 ? (
            <p>No food posts available.</p>
          ) : viewMode === 'map' ? (
            <div style={{ display: 'flex', gap: '1rem', height: '500px' }}>
              <div style={{ flex: '2', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <MapComponent
                  posts={foodPosts}
                  onMarkerClick={(post) => setSelectedMapPost(post)}
                  selectedPostId={selectedMapPost?._id}
                />
              </div>
              <div style={{ flex: '1', height: '100%', overflowY: 'auto' }}>
                {selectedMapPost ? (
                  <div className="card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="card-title">{selectedMapPost.organisationName}</h3>
                    <p><strong>Food:</strong> {selectedMapPost.foodName}</p>
                    <p><strong>Type:</strong> {selectedMapPost.foodType}</p>
                    <p><strong>Quantity:</strong> {selectedMapPost.quantity} {selectedMapPost.unit}</p>
                    <p><strong>📍 District:</strong> {selectedMapPost.district}</p>
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
                      🔒 Full address and contact visible after acceptance
                    </p>
                    <button
                      onClick={() => handleTakeNow(selectedMapPost)}
                      className="action-btn action-btn-primary"
                      style={{ width: '100%', marginTop: 'auto' }}
                    >
                      Take Now
                    </button>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
                    Click a marker on the map to see food details.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="cards-grid">
              {foodPosts.map(post => (
                <div key={post._id} className="card">
                  <h3 className="card-title">{post.organisationName}</h3>
                  <p><strong>Food:</strong> {post.foodName}</p>
                  <p><strong>Type:</strong> {post.foodType}</p>
                  <p><strong>Quantity:</strong> {post.quantity} {post.unit}</p>
                  <p><strong>📍 District:</strong> {post.district}</p>
                  <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    🔒 Full address and contact visible after acceptance
                  </p>
                  <button
                    onClick={() => handleTakeNow(post)}
                    className="action-btn action-btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Take Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>My Request Status</h2>
          {myRequests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Provider</th>
                    <th>Requested Quantity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Pickup Details</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(request => (
                    <tr key={request._id}>
                      <td>{request.foodPostId?.foodName}</td>
                      <td>{request.providerId?.name}</td>
                      <td>{request.requestedQuantity} {request.unit}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '3px',
                          backgroundColor:
                            request.status === 'Accepted' ? '#d4edda' :
                              request.status === 'Declined' ? '#f8d7da' :
                                '#fff3cd',
                          color:
                            request.status === 'Accepted' ? '#155724' :
                              request.status === 'Declined' ? '#721c24' :
                                '#856404'
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        {request.status === 'Accepted' && (
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem' }}>
                            <p style={{ color: '#15803d', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>✅ Request Accepted!</p>
                            <p style={{ color: '#374151', margin: '0 0 0.25rem 0' }}>
                              <strong>📍 Address:</strong> {request.foodPostId?.address}
                            </p>
                            <p style={{ color: '#374151', margin: '0' }}>
                              <strong>📞 Contact:</strong> {request.foodPostId?.mobileNumber}
                            </p>
                            <button
                              onClick={() => navigator.clipboard.writeText(request.foodPostId?.address)}
                              style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              Copy Address
                            </button>

                            <button
                              onClick={() => setSelectedChatRequest(request)}
                              style={{ display: 'block', marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              💬 Chat with Provider
                            </button>

                            {!request.isPickedUp ? (
                              <button
                                onClick={() => handleMarkPickedUp(request._id)}
                                style={{ display: 'block', marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                ✅ Mark as Picked Up
                              </button>
                            ) : request.rating ? (
                              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Your Rating:</p>
                                <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
                                  {'★'.repeat(request.rating)}{'☆'.repeat(5 - request.rating)}
                                </div>
                                {request.review && (
                                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', fontStyle: 'italic', color: '#444' }}>"{request.review}"</p>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedRequestToRate(request);
                                  setShowRatingModal(true);
                                  setRatingForm({ rating: 0, review: '' });
                                }}
                                style={{ display: 'block', marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                ⭐ Rate Provider
                              </button>
                            )}

                          </div>
                        )}
                        {request.status === 'Pending' && (
                          <p style={{ color: '#ca8a04', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            ⏳ Address will be revealed once provider accepts your request.
                          </p>
                        )}
                        {request.status === 'Declined' && (
                          <p style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            ❌ Your request was declined by the provider.
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Request Modal */}
        {showModal && selectedPost && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
              <span
                className="close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </span>
              <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>
                Request Food - {selectedPost.foodName}
              </h2>
              <form onSubmit={handleRequestSubmit}>
                <div className="form-group">
                  <label className="form-label">Required Quantity</label>
                  <input
                    type="number"
                    value={requestForm.requestedQuantity}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requestedQuantity: e.target.value
                    })}
                    className="form-input"
                    max={selectedPost.quantity}
                    required
                  />
                  <small>Available: {selectedPost.quantity} {selectedPost.unit}</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    value={requestForm.unit}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      unit: e.target.value
                    })}
                    className="form-select"
                    required
                  >
                    <option value="Kg">Kilograms</option>
                    <option value="Litre">Litres</option>
                    <option value="Per Person">Per Person</option>
                  </select>
                </div>

                <button type="submit" className="form-btn">
                  Confirm Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedRequestToRate && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
              <span
                className="close"
                onClick={() => setShowRatingModal(false)}
              >
                &times;
              </span>
              <h2 style={{ marginBottom: '1.5rem', color: '#ff6b35' }}>
                Rate Provider
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                How was your experience with <strong>{selectedRequestToRate.providerId?.name}</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2.5rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                    style={{ color: star <= ratingForm.rating ? '#f59e0b' : '#d1d5db', transition: 'color 0.2s' }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Review (Optional)</label>
                <textarea
                  value={ratingForm.review}
                  onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Leave a positive comment..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={submitRating}
                  className="form-btn"
                  style={{ flex: 1 }}
                >
                  Submit Rating
                </button>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="form-btn"
                  style={{ flex: 1, backgroundColor: '#9ca3af' }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

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

export default RecipientDashboard;
