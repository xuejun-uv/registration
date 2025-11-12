import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [testFormData, setTestFormData] = useState({
    email: "",
    name: "",
    userId: ""
  });

  // Check for error or success messages from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const submissionId = searchParams.get('submissionId');

    if (error === 'form-submission-failed') {
      setMessage("❌ Form submission failed. Please try again.");
    } else if (error === 'redirect-error') {
      setMessage("❌ There was an error processing your form. Please try again.");
    } else if (success && submissionId) {
      setMessage("✅ Form submitted successfully! Redirecting to stamp collection...");
      // Auto-redirect to stamps page after success
      setTimeout(() => {
        navigate(`/stamps?submissionId=${submissionId}`);
      }, 2000);
    }
  }, [searchParams, navigate]);

  const goToStampPage = () => {
    navigate("/stamps");
  };

  const goToFormSG = () => {
    // For FormSG integration, you might need to configure the webhook URL
    // The webhook should be: https://registration-smoky-chi.vercel.app/api/formsg-webhook
    window.location.href = "https://form.gov.sg/6911b9ea7b7a150c5e112447";
  };

  // Test form submission to webhook
  const handleTestSubmit = async (e) => {
    e.preventDefault();
    
    if (!testFormData.email || !testFormData.name) {
      setMessage("❌ Please fill in email and name");
      return;
    }

    try {
      setMessage("🔄 Testing form submission...");
      
      const response = await fetch('/api/formsg-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: 'test-form-id',
          submissionId: `test-${Date.now()}`,
          responses: [
            {
              question: 'Email Address',
              answer: testFormData.email
            },
            {
              question: 'Full Name',
              answer: testFormData.name
            },
            {
              question: 'User ID (for testing)',
              answer: testFormData.userId || 'test-user-id'
            }
          ]
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Test successful! User ID: ${result.userId}`);
        setTimeout(() => {
          navigate(`/stamps?id=${result.userId}`);
        }, 2000);
      } else {
        setMessage(`❌ Test failed: ${result.message}`);
      }
      
    } catch (error) {
      setMessage(`❌ Error testing form: ${error.message}`);
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        <h1 className="title">School of Technology</h1>
        <p style={{ margin: "20px 0", color: "#666", fontSize: "14px" }}>
          Complete the registration form and collect stamps at our booths!
        </p>
        
        {message && (
          <div style={{
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            backgroundColor: message.includes("❌") ? "#ffe6e6" : "#e6f7e6",
            color: message.includes("❌") ? "#d32f2f" : "#2e7d32",
            fontSize: "14px"
          }}>
            {message}
          </div>
        )}
        
        <button
          onClick={goToFormSG}
          className="main-btn"
          style={{ marginBottom: "10px" }}
        >
          📝 Complete Registration Form
        </button>
        
        <button
          onClick={goToStampPage}
          className="main-btn"
          style={{ 
            backgroundColor: "#28a745",
            fontSize: "14px"
          }}
        >
          🎯 Go to Stamp Collection
        </button>
        
        <button
          onClick={() => navigate("/test-form")}
          className="main-btn"
          style={{ 
            backgroundColor: "#17a2b8",
            fontSize: "12px",
            marginTop: "10px"
          }}
        >
          🧪 Advanced Form Tester
        </button>
        
        <div style={{ 
          marginTop: "20px", 
          fontSize: "12px", 
          color: "#888",
          lineHeight: "1.4"
        }}>
          <p>📱 Scan QR codes at booths to collect stamps</p>
          <p>✅ Complete all sections to win prizes!</p>
          <p style={{ marginTop: "10px", fontSize: "11px" }}>
            📝 Submit the form first to get your unique stamp card
          </p>
        </div>

        {/* Test Form Section */}
        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ 
            fontSize: "14px", 
            marginBottom: "15px", 
            color: "#495057" 
          }}>
            🧪 Test Form Submission (Include UserID)
          </h3>
          
          <form onSubmit={handleTestSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="email"
                placeholder="Email Address"
                value={testFormData.email}
                onChange={(e) => setTestFormData({...testFormData, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Full Name"
                value={testFormData.name}
                onChange={(e) => setTestFormData({...testFormData, name: e.target.value})}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="User ID (optional - for testing)"
                value={testFormData.userId}
                onChange={(e) => setTestFormData({...testFormData, userId: e.target.value})}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                  backgroundColor: "#fff3cd",
                  borderColor: "#ffeaa7"
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🧪 Test Form Submission
            </button>
          </form>
          
          <p style={{ 
            fontSize: "11px", 
            color: "#6c757d", 
            marginTop: "10px",
            lineHeight: "1.3"
          }}>
            This form tests your webhook directly. The UserID field helps verify that FormSG captures custom fields correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
