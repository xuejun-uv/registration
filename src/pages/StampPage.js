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

  // Handle web camera scanning within Chrome/Google browser
  const handleScan = async () => {
    if (isScanning) {
      stopScanning();
      return;
    }
    
    setCameraError("");
    setIsScanning(true);
    
    try {
      console.log("Opening camera in browser...");
      
      // Use the standard WebRTC MediaDevices API to request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera for QR scanning
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        } 
      });
      
      // Create fullscreen camera interface
      const cameraContainer = document.createElement("div");
      cameraContainer.id = "camera-scanner";
      cameraContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;
      
      // Create video element for camera preview using standard approach
      const video = document.createElement("video");
      video.setAttribute('playsinline', true);
      video.setAttribute('muted', true);
      video.setAttribute('autoplay', true); // Ensure autoplay as per WebRTC best practices
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      
      // Set the video element source to the camera stream (standard WebRTC approach)
      video.srcObject = stream;
      
      // Create overlay with scanning frame and instructions
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        box-sizing: border-box;
      `;
      
      // Instructions
      const instructions = document.createElement("div");
      instructions.style.cssText = `
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        margin-top: 40px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      `;
      instructions.innerHTML = "📱 Point camera at QR code";
      
      // Scanning frame
      const scanFrame = document.createElement("div");
      scanFrame.style.cssText = `
        width: 280px;
        height: 280px;
        border: 3px solid #00ff00;
        border-radius: 20px;
        position: relative;
        background: transparent;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
      `;
      
      // Scan line animation
      const scanLine = document.createElement("div");
      scanLine.style.cssText = `
        position: absolute;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #00ff00, transparent);
        top: 0;
        left: 0;
        animation: scanMove 2s linear infinite;
      `;
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes scanMove {
          0% { top: 0; }
          50% { top: calc(100% - 3px); }
          100% { top: 0; }
        }
      `;
      document.head.appendChild(style);
      
      scanFrame.appendChild(scanLine);
      
      // Control buttons
      const controlPanel = document.createElement("div");
      controlPanel.style.cssText = `
        display: flex;
        gap: 20px;
        margin-bottom: 40px;
        pointer-events: all;
      `;
      
      // Manual input button
      const manualButton = document.createElement("button");
      manualButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid white;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      `;
      manualButton.innerHTML = "✏️ Enter Manually";
      manualButton.onclick = () => {
        stopScanning();
        showManualInput("Enter the booth name from the QR code:");
      };
      
      // Close button
      const closeButton = document.createElement("button");
      closeButton.style.cssText = `
        background: rgba(255, 68, 68, 0.9);
        border: 2px solid #ff4444;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      `;
      closeButton.innerHTML = "❌ Close";
      closeButton.onclick = () => stopScanning();
      
      controlPanel.appendChild(manualButton);
      controlPanel.appendChild(closeButton);
      
      // Assemble the interface
      overlay.appendChild(instructions);
      overlay.appendChild(scanFrame);
      overlay.appendChild(controlPanel);
      
      cameraContainer.appendChild(video);
      cameraContainer.appendChild(overlay);
      document.body.appendChild(cameraContainer);
      
      // Video will start automatically due to autoplay attribute
      // The stream is already assigned to video.srcObject above
      
      // QR Code scanning using canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const scanForQR = () => {
        if (!isScanning) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple QR detection would go here - for now we rely on manual input
        // as implementing QR detection requires additional libraries
        
        setTimeout(scanForQR, 100); // Scan every 100ms
      };
      
      video.onloadedmetadata = () => {
        scanForQR();
      };
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsScanning(false);
      
      let errorMessage = "Camera access failed";
      if (error.name === 'NotAllowedError') {
        errorMessage = "📷 Camera permission denied. Please allow camera access in your browser.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "📵 No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "📷 Camera is being used by another app.";
      }
      
      setCameraError(errorMessage);
      showManualInput("Camera unavailable. Please enter the booth name manually:");
    }
  };

  // Stop camera and cleanup
  const stopScanning = () => {
    setIsScanning(false);
    
    // Remove camera interface
    const cameraContainer = document.getElementById("camera-scanner");
    if (cameraContainer) {
      // Stop all video tracks
      const video = cameraContainer.querySelector('video');
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      cameraContainer.remove();
    }
    
    // Remove injected styles
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      if (style.textContent.includes('@keyframes scanMove')) {
        style.remove();
      }
    });
    
    console.log("Camera scanning stopped");
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

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

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
                ? "📷 Stop Camera" 
                : "📸 Start Camera Scan"
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