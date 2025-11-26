import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StampGrid from "../components/StampGrid";
import "../App.css";

const StampPage = () => {
  const [searchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const id = searchParams.get("id");
  const booth = searchParams.get("booth");

  // Initialize stamps array
  useEffect(() => {
    const initialStamps = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false
    }));
    setStamps(initialStamps);
  }, []);

  // Fetch user stamp data when an ID is provided
  useEffect(() => {
    if (id) {
      fetch(`/api/get-stamp?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.stamps) {
            setStamps(data.stamps);
          }
        })
        .catch((err) => console.error("Error fetching stamps:", err));
    }
  }, [id]);

  // Mark a stamp if both id and booth are present
  useEffect(() => {
    if (id && booth) {
      fetch(`/api/mark-stamp?id=${id}&booth=${booth}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.stamps) {
            setStamps(data.stamps);
          }
        })
        .catch((err) => console.error("Error marking stamp:", err));
    }
  }, [id, booth]);

  // Handle QR code detection result
  const handleQRCodeDetected = async (data) => {
    console.log("QR Code detected:", data);
    
    try {
      // Extract booth name from QR data
      let boothName = data;
      if (data.includes('booth=')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        boothName = urlParams.get('booth');
      }
      
      if (boothName && id) {
        const response = await fetch(`/api/mark-stamp?id=${id}&booth=${boothName}`, { 
          method: "POST" 
        });
        const result = await response.json();
        
        if (result.success) {
          setStamps(result.stamps);
          alert(`✅ Stamp collected from ${boothName}!`);
        } else {
          alert(`❌ ${result.message || 'Failed to collect stamp'}`);
        }
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      alert("❌ Error processing QR code. Please try again.");
    }
    
    setIsScanning(false);
  };

  // Handle native camera app opening
  const handleScan = async () => {
    if (isScanning) {
      setIsScanning(false);
      return;
    }
    
    setCameraError("");
    setIsScanning(true);
    
    try {
      console.log("Opening native camera app...");
      
      // Detect device type and attempt to open native camera
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      let cameraOpened = false;
      
      if (isIOS) {
        // Try iOS camera app with file input
        try {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment'; // Use rear camera
          input.style.display = 'none';
          
          input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
              // Show manual input after photo capture
              showManualInput("Photo captured! Please enter the booth name you see in the QR code:");
            }
            setIsScanning(false);
          };
          
          input.oncancel = () => {
            setIsScanning(false);
          };
          
          document.body.appendChild(input);
          input.click();
          
          // Clean up after a delay
          setTimeout(() => {
            if (document.body.contains(input)) {
              document.body.removeChild(input);
            }
          }, 100);
          
          cameraOpened = true;
          
        } catch (error) {
          console.log("iOS camera capture failed:", error);
        }
      } else if (isAndroid) {
        // Try Android camera app using intent
        try {
          // Try to open camera intent for QR scanning
          window.location.href = "intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end";
          cameraOpened = true;
          
          // Show fallback after a delay if intent didn't work
          setTimeout(() => {
            showManualInput("If the camera didn't open, please manually enter the booth name:");
          }, 2000);
          
        } catch (error) {
          console.log("Android camera intent failed:", error);
        }
      }
      
      // If we're on desktop or mobile camera couldn't be opened, show instructions
      if (!cameraOpened || (!isIOS && !isAndroid)) {
        showManualInput("Please open your camera app and scan the QR code, then enter the booth name:");
      }
      
    } catch (error) {
      console.error("Error opening camera:", error);
      setCameraError("Unable to open camera. Please enter booth name manually.");
      showManualInput("Camera unavailable. Please enter the booth name:");
    }
  };

  // Show manual input dialog
  const showManualInput = (message) => {
    const instructionDialog = document.createElement("div");
    instructionDialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    const dialogContent = document.createElement("div");
    dialogContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    dialogContent.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
      <h2 style="margin: 0 0 16px 0; color: #333; font-size: 22px;">Camera Instructions</h2>
      <p style="color: #666; margin: 0 0 24px 0; line-height: 1.5; font-size: 16px;">
        ${message}
      </p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: bold;">Quick Guide:</p>
        <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;">📱 <strong>iPhone:</strong> Open Camera app</p>
        <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;">🤖 <strong>Android:</strong> Open Camera or Google Lens</p>
        <p style="margin: 0; color: #374151; font-size: 14px;">💻 <strong>Desktop:</strong> Use your phone</p>
      </div>
      <div style="margin-bottom: 20px;">
        <input 
          type="text" 
          placeholder="Enter booth name (e.g., Booth-A)"
          id="manualBoothInput"
          style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
          "
        />
      </div>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button id="submitBoothName" style="
          background: #22c55e;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          flex: 1;
          min-width: 120px;
        ">✅ Submit Booth</button>
        <button id="closeDialog" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          flex: 1;
          min-width: 120px;
        ">❌ Cancel</button>
      </div>
    `;
    
    instructionDialog.appendChild(dialogContent);
    document.body.appendChild(instructionDialog);
    
    // Handle manual booth submission
    const submitButton = document.getElementById("submitBoothName");
    const closeButton = document.getElementById("closeDialog");
    const boothInput = document.getElementById("manualBoothInput");
    
    const cleanup = () => {
      instructionDialog.remove();
      setIsScanning(false);
    };
    
    submitButton.onclick = async () => {
      const boothName = boothInput.value.trim();
      if (boothName) {
        cleanup();
        await handleQRCodeDetected(boothName);
      } else {
        alert("Please enter a booth name");
      }
    };
    
    closeButton.onclick = cleanup;
    
    // Auto-focus the input and handle enter key
    setTimeout(() => {
      boothInput.focus();
      boothInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          submitButton.click();
        }
      };
    }, 100);
  };

  return (
    <div className="stamp-page">
      <div className="container">
        <h1 className="title">Stamp Collection</h1>
        
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={handleScan}
            disabled={!id}
            style={{
              background: isScanning 
                ? 'linear-gradient(135deg, #ff6b6b, #ee5a6f)' 
                : 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: !id ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              width: '100%',
              maxWidth: '300px',
              opacity: !id ? 0.6 : 1,
              transform: 'scale(1)',
              touchAction: 'manipulation'
            }}
            onMouseDown={(e) => {
              if (id && !isScanning) {
                e.target.style.transform = 'scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (id) {
                e.target.style.transform = 'scale(1)';
              }
            }}
            onMouseLeave={(e) => {
              if (id) {
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {!id 
              ? "🚫 Need User ID to Scan" 
              : isScanning 
                ? "📷 Opening Camera..." 
                : "📸 Open Camera to Scan"
            }
          </button>
          
          {cameraError && (
            <div style={{
              marginTop: "12px",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "12px",
              color: "#dc2626",
              fontSize: "14px",
              textAlign: "center",
              fontWeight: "500"
            }}>
              ⚠️ {cameraError}
            </div>
          )}
          
          {!id && (
            <div style={{
              marginTop: "12px",
              padding: "12px 16px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              color: "#2563eb",
              fontSize: "14px",
              textAlign: "center",
              fontWeight: "500"
            }}>
              💡 Enter your nickname first to enable QR scanning
            </div>
          )}
        </div>

        {id && (
          <p className="user-info">
            User ID: {id}
          </p>
        )}

        <h2>Discovery Atrium</h2>
        <StampGrid count={4} stamps={stamps.slice(0, 4)} startIndex={1} />

        <h2>Envision Gallery</h2>
        <StampGrid count={3} stamps={stamps.slice(4, 7)} startIndex={5} />

        <h2>Experience Zone</h2>
        <StampGrid count={4} stamps={stamps.slice(7, 11)} startIndex={8} />
        
        <div style={{ 
          marginTop: "30px", 
          textAlign: "center",
          fontSize: "12px",
          color: "#888"
        }}>
          <p>Visit each booth and scan QR codes to collect stamps!</p>
        </div>
      </div>
    </div>
  );
};

export default StampPage;