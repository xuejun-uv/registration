import React, { useState } from "react";
import "../App.css";

const AdminPage = () => {
  const [selectedBooth, setSelectedBooth] = useState("");

  // List of booths with their corresponding QR code files
  const booths = [
    { id: "booth1", name: "Booth 1", qrFile: "booth1_qrcode-1024.png" },
    { id: "booth2", name: "Booth 2", qrFile: "booth2_qrcode.png" },
    { id: "booth3", name: "Booth 3", qrFile: "booth3_qrcode-1024.png" },
    { id: "booth4", name: "Booth 4", qrFile: "booth4_qrcode-1024.png" },
    { id: "booth5", name: "Booth 5", qrFile: "booth5_qrcode-1024.png" },
    { id: "booth6", name: "Booth 6", qrFile: "booth6_qrcode-1024.png" },
    { id: "booth7", name: "Booth 7", qrFile: "booth7_qrcode-1024.png" },
    { id: "booth8", name: "Booth 8", qrFile: "booth8_qrcode-1024.png" },
    { id: "booth9", name: "Booth 9", qrFile: "booth9_qrcode-1024.png" },
    { id: "booth10", name: "Booth 10", qrFile: "booth10_qrcode-1024.png" },
    { id: "booth11", name: "Booth 11", qrFile: "booth11_qrcode-1024.png" }
  ];

  const handleBoothChange = (e) => {
    setSelectedBooth(e.target.value);
  };

  const selectedBoothData = booths.find(booth => booth.id === selectedBooth);

  return (
    <div className="home-page">
      <div className="container" style={{ 
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Header Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          marginBottom: '40px',
          width: '100%',
          maxWidth: '500px'
        }}>
          
          {/* Logo/Icon */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              animation: 'shimmer 3s infinite',
              transform: 'rotate(45deg)'
            }}></div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '900',
                margin: '0',
                color: 'white',
                letterSpacing: '-1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>Booth</h1>
            </div>
          </div>

          <h2 style={{ 
            fontWeight: '800', 
            marginTop: '8px',
            marginBottom: '12px',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            QR Code Management
          </h2>

          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            margin: '0',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            Select a booth to display its QR code
          </p>
        </div>

        {/* Dropdown Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '32px'
        }}>
          
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '12px'
          }}>
            📍 Select Booth:
          </label>

          <select
            value={selectedBooth}
            onChange={handleBoothChange}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              fontWeight: '500',
              background: 'white',
              transition: 'all 0.3s ease',
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#2d3748',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '48px'
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
          >
            <option value="">Choose a booth...</option>
            {booths.map(booth => (
              <option key={booth.id} value={booth.id}>
                {booth.name}
              </option>
            ))}
          </select>
        </div>

        {/* QR Code Display Section */}
        {selectedBoothData && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>🏷️</span>
              {selectedBoothData.name} QR Code
            </h3>

            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              marginBottom: '20px'
            }}>
              <img 
                src={`/${selectedBoothData.qrFile}`}
                alt={`${selectedBoothData.name} QR Code`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  display: 'block',
                  margin: '0 auto'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{
                display: 'none',
                padding: '40px',
                color: '#6b7280',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                ⚠️ QR Code image not found: {selectedBoothData.qrFile}
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              color: '#2563eb',
              fontWeight: '500',
              lineHeight: '1.5'
            }}>
              <span>💡</span> Scan this QR code with the registration app to mark stamps for {selectedBoothData.name}
            </div>
          </div>
        )}

        {/* Instructions when no booth selected */}
        {!selectedBooth && (
          <div style={{
            background: 'rgba(156, 163, 175, 0.1)',
            border: '1px solid rgba(156, 163, 175, 0.2)',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
            width: '100%',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <p style={{ margin: '0', lineHeight: '1.6' }}>
              Please select a booth from the dropdown menu above to view its QR code.
            </p>
          </div>
        )}
      </div>

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;