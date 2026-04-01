import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          gap: '40px',
          minHeight: '85vh',
          backgroundColor: '#f9fafb',
          flexWrap: 'wrap'
        }}>

          {/* ===== LEFT SIDE ===== */}
          <div style={{
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <img
              src="/left foodsaver.png"
              alt="Help Us Save Food"
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '280px',
                objectFit: 'cover',
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/left foodsaver.jpg';
              }}
            />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#F97316',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              Help Us to Save Food
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.8',
              maxWidth: '340px'
            }}>
              Join our mission to reduce food waste and
              connect surplus food with those who need it
              most. Together, we can make a difference in
              our communities.
            </p>
          </div>

          {/* ===== CENTER IMAGE ===== */}
          <div style={{
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/poor boy.png"
              alt="Boy with rice plate"
              style={{
                width: '100%',
                maxWidth: '380px',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
              }}
            />
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div style={{
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <img
              src="/right foodsaver.png"
              alt="Support Us to Provide Hope"
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '280px',
                objectFit: 'cover',
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#F97316',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              Support Us to Provide Hope
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.8',
              maxWidth: '340px'
            }}>
              Your support helps us bridge the gap between
              food providers and recipients. Every contribution
              creates opportunities for nourishment and hope
              in our society.
            </p>
          </div>

        </div>
      </section>

      {/* About Section - How We Work */}
      <section id="about" style={{ padding: '60px 40px' }}>
        <div className="container">
          <h2 className="section-title">How We Work</h2>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">✈️</div>
              <h3 className="card-title">Post Your Request</h3>
              <p className="card-description">
                Submit your requests or availability on our portal. Let's connect resources efficiently
                and ensure help reaches those in need.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">✓</div>
              <h3 className="card-title">Accept an Availability</h3>
              <p className="card-description">
                Find the right request or availability you need and confirm it, ensuring timely support
                and resources for those in need.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">❤️</div>
              <h3 className="card-title">Pick Up Your Request</h3>
              <p className="card-description">
                Confirm your food order and pick it up easily with clear directions, ensuring a smooth
                and timely collection process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '60px 40px', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">📝</div>
              <h3 className="card-title">Post Requests</h3>
              <p className="card-description">
                We provide the best service you ever need.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">🤝</div>
              <h3 className="card-title">Connecting</h3>
              <p className="card-description">
                We provide the best service you ever need.
              </p>
            </div>

            <div className="card">
              <div className="card-icon">🚚</div>
              <h3 className="card-title">Pickup</h3>
              <p className="card-description">
                We provide the best service you ever need.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
