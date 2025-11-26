import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QrScanner from "qr-scanner";
import StampGrid from "../components/StampGrid";
import "../App.css";

const StampPage = () => {
  const [searchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [qrScanner, setQrScanner] = useState(null);

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

  // Handle QR scanning with improved camera access
  const handleScan = async () => {
    if (isScanning) {
      // Stop scanning if already scanning
      stopScanning();
      return;
    }
    
    setCameraError("");
    setIsScanning(true);
    
    try {
      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Create video element for camera preview
      const videoElem = document.createElement("video");
      videoElem.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        object-fit: cover;
        background: black;
      `;
      
      // Create overlay with instructions and close button
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1001;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        box-sizing: border-box;
      `;
      
      // Instructions at the top
      const instructions = document.createElement("div");
      instructions.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        font-size: 16px;
        text-align: center;
        margin-top: 60px;
      `;
      instructions.innerHTML = "📱 Point camera at QR code to scan";
      
      // Close button at the bottom
      const closeButton = document.createElement("button");
      closeButton.style.cssText = `
        background: #ff4757;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
        margin-bottom: 40px;
      `;
      closeButton.innerHTML = "❌ Close Scanner";
      closeButton.onclick = () => stopScanning();
      
      overlay.appendChild(instructions);
      overlay.appendChild(closeButton);
      
      // Initialize QR scanner
      const scanner = new QrScanner(
        videoElem, 
        (result) => {
          const qrCode = result.data;
          console.log("QR Code scanned:", qrCode);
          
          // Parse the URL to get booth information
          try {
            const url = new URL(qrCode);
            const boothParam = url.searchParams.get('booth');
            if (boothParam && id) {
              // Success feedback
              instructions.innerHTML = "✅ QR Code detected! Redirecting...";
              instructions.style.background = "rgba(34, 197, 94, 0.9)";
              
              // Redirect after brief delay
              setTimeout(() => {
                window.location.href = `${window.location.origin}/stamps?id=${id}&booth=${boothParam}`;
              }, 1000);
            } else {
              instructions.innerHTML = "⚠️ Invalid QR code. Please scan a booth QR code.";
              instructions.style.background = "rgba(239, 68, 68, 0.9)";
            }
          } catch (e) {
            console.error("Invalid QR code URL:", e);
            instructions.innerHTML = "⚠️ Invalid QR code format. Please try again.";
            instructions.style.background = "rgba(239, 68, 68, 0.9)";
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5
        }
      );
      
      // Store scanner instance for cleanup
      setQrScanner(scanner);
      
      // Add elements to page
      document.body.appendChild(videoElem);
      document.body.appendChild(overlay);
      
      // Start scanner
      await scanner.start();
      
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      
      let errorMessage = "Unable to access camera";
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another application.";
      } else if (error.message.includes('No camera')) {
        errorMessage = "No camera available on this device.";
      }
      
      setCameraError(errorMessage);
      setIsScanning(false);
    }
  };
  
  // Function to stop scanning and cleanup
  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    
    // Remove video and overlay elements
    const videoElements = document.querySelectorAll('video');
    const overlayElements = document.querySelectorAll('div[style*="z-index: 1001"]');
    
    videoElements.forEach(el => el.remove());
    overlayElements.forEach(el => el.remove());
    
    setIsScanning(false);
    setCameraError("");
  };
  
  // Cleanup on component unmount
  useEffect(() => {
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
                ? "📷 Stop Scanner" 
                : "📱 Scan QR Code"
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
