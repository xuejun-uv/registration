import React, { useState } from 'react';
import '../App.css';

const FormTestPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    userId: '',
    phone: '',
    organization: ''
  });
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      // Test FormSG webhook format
      const webhookPayload = {
        formId: 'test-form-6911b9ea7b7a150c5e112447',
        submissionId: `test-submission-${Date.now()}`,
        encryptedContent: null,
        responses: [
          {
            question: 'Email Address',
            answer: formData.email,
            fieldType: 'email'
          },
          {
            question: 'Full Name',
            answer: formData.name,
            fieldType: 'textfield'
          },
          {
            question: 'User ID (for testing)',
            answer: formData.userId || `auto-${Math.random().toString(36).substr(2, 9)}`,
            fieldType: 'textfield'
          },
          {
            question: 'Phone Number',
            answer: formData.phone,
            fieldType: 'mobile'
          },
          {
            question: 'Organization',
            answer: formData.organization,
            fieldType: 'textfield'
          }
        ]
      };

      console.log('🚀 Sending webhook payload:', webhookPayload);

      const res = await fetch('/api/formsg-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FormSG/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await res.json();
      setResponse({
        status: res.status,
        data: result,
        success: res.ok
      });

    } catch (error) {
      setResponse({
        status: 500,
        data: { error: error.message },
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="home-page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="title">🧪 FormSG Webhook Tester</h1>
        
        <p style={{ 
          margin: "20px 0", 
          color: "#666", 
          fontSize: "14px",
          backgroundColor: "#e3f2fd",
          padding: "10px",
          borderRadius: "8px"
        }}>
          Test your FormSG webhook integration and verify that custom fields like User ID are captured correctly.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
              placeholder="your.email@example.com"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
              placeholder="John Doe"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#ff6b35'
            }}>
              🎯 User ID (Test Field)
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ff6b35',
                borderRadius: '5px',
                fontSize: '14px',
                backgroundColor: '#fff3e0'
              }}
              placeholder="test-user-123 (optional - auto-generated if empty)"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              This field tests if FormSG captures custom user IDs
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
              placeholder="+65 9123 4567"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Organization
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
              placeholder="School of Technology"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="main-btn"
            style={{ 
              width: '100%',
              backgroundColor: isLoading ? '#ccc' : '#007bff'
            }}
          >
            {isLoading ? '🔄 Testing Webhook...' : '🚀 Test FormSG Webhook'}
          </button>
        </form>

        {response && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: response.success ? '#e8f5e8' : '#ffe6e6',
            border: `1px solid ${response.success ? '#28a745' : '#dc3545'}`
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: response.success ? '#28a745' : '#dc3545',
              fontSize: '16px'
            }}>
              {response.success ? '✅ Success!' : '❌ Error'}
            </h3>
            
            <div style={{ fontSize: '12px' }}>
              <strong>Status:</strong> {response.status}
            </div>
            
            <pre style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(response.data, null, 2)}
            </pre>

            {response.success && response.data.userId && (
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={() => window.open(`/stamps?id=${response.data.userId}`, '_blank')}
                  className="main-btn"
                  style={{ 
                    backgroundColor: '#28a745',
                    fontSize: '12px',
                    padding: '8px 15px'
                  }}
                >
                  🎯 View Stamp Card
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '20px',
          textAlign: 'center' 
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormTestPage;