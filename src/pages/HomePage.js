import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (name) => {
    if (!name || typeof name !== 'string') return 'Please enter a nickname.';
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 20) return 'Nickname must be 2-20 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(nickname);
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch('/api/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      });
      const data = await res.json();
      if (data && data.success && data.id) {
        navigate(`/stamps?id=${encodeURIComponent(data.id)}`);
      } else {
        setError(data.message || 'Failed to create guest account');
      }
    } catch (err) {
      console.error('Error creating guest:', err);
      setError('Internal error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="container" style={{ 
        maxWidth: '100%', 
        padding: '16px', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          border: '1px solid #e6e6e6', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '600',
              color: '#333',
              letterSpacing: '-0.5px'
            }}>avabot</h1>
          </div>

          <h2 style={{ 
            fontWeight: '700', 
            marginTop: '16px',
            marginBottom: '8px',
            fontSize: '24px',
            color: '#1a1a1a',
            textAlign: 'left'
          }}>Enter your nickname</h2>

          <p style={{ 
            marginTop: '8px',
            marginBottom: '8px',
            color: '#666',
            fontSize: '16px',
            textAlign: 'left'
          }}>Jump right in as a guest</p>

          <p style={{
            marginBottom: '20px',
            fontSize: '14px',
            color: '#333',
            textAlign: 'left',
            lineHeight: '1.4'
          }}><strong>Choose a unique nickname. You can use your IG/TikTok handle or create a new one.</strong></p>

          <form onSubmit={handleSubmit}>
            <input
              aria-label="Your nickname"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e1e5e9',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: '#f8f9fa',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e5e9';
                e.target.style.boxShadow = 'none';
              }}
            />

            <div style={{ 
              marginTop: '8px', 
              fontSize: '13px', 
              color: '#666',
              textAlign: 'left'
            }}>2-20 characters</div>

            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginTop: '12px',
                fontSize: '14px',
                textAlign: 'left',
                padding: '8px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '20px',
                width: '100%',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                touchAction: 'manipulation',
                transform: loading ? 'none' : 'scale(1)',
                boxShadow: loading ? 'none' : '0 2px 4px rgba(0,123,255,0.3)'
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {loading ? 'Entering...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
