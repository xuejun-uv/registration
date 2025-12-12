import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch('/api/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      });
      const data = await res.json();
      if (data && data.success && data.id) {
        // Save ID to localStorage for persistence
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userNickname', nickname.trim());

        if (data.isReturningUser) {
          setSuccessMessage(`Welcome back, ${nickname}!`);
        } else {
          setSuccessMessage(``);
        }
        
        // Redirect after showing message
        setTimeout(() => {
          navigate(`/stamps?id=${encodeURIComponent(data.id)}`);
        }, 1500);
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
        padding: '20px', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          borderRadius: '24px', 
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
            borderRadius: '24px 24px 0 0'
          }}></div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '20px',
              marginBottom: '8px'
            }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '32px', 
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>Registration</h1>
            </div>
          </div>

          <h2 style={{ 
            fontWeight: '800', 
            marginTop: '8px',
            marginBottom: '12px',
            fontSize: '28px',
            color: '#2d3748',
            textAlign: 'left',
            letterSpacing: '-0.5px'
          }}>Enter your nickname</h2>

          <p style={{ 
            marginTop: '0',
            marginBottom: '12px',
            color: '#718096',
            fontSize: '16px',
            textAlign: 'left',
            fontWeight: '500'
          }}>Jump right in as a guest</p>

          <p style={{
            marginBottom: '28px',
            fontSize: '14px',
            color: '#4a5568',
            textAlign: 'left',
            lineHeight: '1.5',
            padding: '12px 16px',
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}><strong>💡 Choose a unique nickname. You can use your IG/TikTok handle or create a new one.</strong></p>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
              <input
                aria-label="Your nickname"
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: '#2d3748'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              {/* Input decoration */}
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#cbd5e0',
                fontSize: '18px',
                pointerEvents: 'none'
              }}>✨</div>
            </div>

            <div style={{ 
              marginTop: '12px', 
              fontSize: '13px', 
              color: '#a0aec0',
              textAlign: 'left',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📝</span>
              <span>2-20 characters</span>
              <div style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: nickname.length >= 2 && nickname.length <= 20 ? '#48bb78' : '#e2e8f0',
                color: nickname.length >= 2 && nickname.length <= 20 ? 'white' : '#718096',
                fontSize: '11px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                {nickname.length}/20
              </div>
            </div>

            {error && (
              <div style={{ 
                color: '#e53e3e', 
                marginTop: '16px',
                fontSize: '14px',
                textAlign: 'left',
                padding: '12px 16px',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(229, 62, 62, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{ 
                color: '#38a169', 
                marginTop: '16px',
                fontSize: '14px',
                textAlign: 'left',
                padding: '12px 16px',
                backgroundColor: 'rgba(56, 161, 105, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(56, 161, 105, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}>
                <span>✅</span>
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '24px',
                width: '100%',
                borderRadius: '16px',
                padding: '18px',
                fontSize: '16px',
                fontWeight: '700',
                background: loading 
                  ? 'linear-gradient(135deg, #a0aec0, #718096)' 
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                touchAction: 'manipulation',
                transform: loading ? 'none' : 'scale(1)',
                boxShadow: loading 
                  ? 'none' 
                  : '0 10px 25px -3px rgba(102, 126, 234, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(0.98) translateY(1px)';
                  e.target.style.boxShadow = '0 5px 15px -3px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px -3px rgba(102, 126, 234, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px -3px rgba(102, 126, 234, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading ? '🚀 Entering...' : '✨ Enter'}
              </span>
              {/* Button shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
                ...(loading ? {} : {
                  animation: 'shine 2s infinite'
                })
              }}></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
