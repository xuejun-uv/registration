import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");

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
      </div>
    </div>
  );
};

export default HomePage;
