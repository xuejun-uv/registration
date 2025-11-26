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

  // Handle QR scanning with proper camera access
  const handleScan = async () => {
    if (isScanning) {
      // Stop scanning if already scanning
      stopScanning();
      return;
    }
    
    setCameraError("");
    setIsScanning(true);
    
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      // Check if QR scanner can detect cameras
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Create video element for camera preview
      const videoElem = document.createElement("video");
      videoElem.setAttribute('playsinline', true); // Important for iOS
      videoElem.setAttribute('muted', true);
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
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        font-size: 16px;
        text-align: center;
        margin-top: 60px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;
      instructions.innerHTML = "📱 Point your camera at the booth QR code";
      
      // Scanning frame indicator
      const scanFrame = document.createElement("div");
      scanFrame.style.cssText = `
        width: 250px;
        height: 250px;
        border: 3px solid #00ff00;
        border-radius: 12px;
        position: relative;
        background: transparent;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        animation: scanPulse 2s infinite;
      `;
      
      // Add scan frame animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes scanPulse {
          0%, 100% { border-color: #00ff00; }
          50% { border-color: #00ffff; }
        }
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: calc(100% - 2px); }
        }
      `;
      document.head.appendChild(style);
      
      // Add scanning line
      const scanLine = document.createElement("div");
      scanLine.style.cssText = `
        position: absolute;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00ff00, transparent);
        top: 0;
        left: 0;
        animation: scanLine 2s linear infinite;
      `;
      scanFrame.appendChild(scanLine);
      
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
        transition: all 0.2s;
      `;
      closeButton.innerHTML = "❌ Close Camera";
      closeButton.onmousedown = () => closeButton.style.transform = "scale(0.95)";
      closeButton.onmouseup = () => closeButton.style.transform = "scale(1)";
      closeButton.onclick = () => stopScanning();
      
      overlay.appendChild(instructions);
      overlay.appendChild(scanFrame);
      overlay.appendChild(closeButton);
      
      // Initialize QR scanner with the video element
      const scanner = new QrScanner(
        videoElem, 
        (result) => {
          const qrCode = result.data;
          console.log("QR Code scanned:", qrCode);
          
          // Provide immediate feedback
          instructions.innerHTML = "✅ QR Code detected! Processing...";
          instructions.style.background = "rgba(34, 197, 94, 0.9)";
          scanFrame.style.borderColor = "#00ff00";
          
          // Parse the URL to get booth information
          try {
            const url = new URL(qrCode);
            const boothParam = url.searchParams.get('booth');
            if (boothParam && id) {
              instructions.innerHTML = `✅ Booth ${boothParam} detected! Marking stamp...`;
              
              // Stop scanner and redirect after brief delay
              setTimeout(() => {
                stopScanning();
                window.location.href = `${window.location.origin}/stamps?id=${id}&booth=${boothParam}`;
              }, 1500);
            } else {
              instructions.innerHTML = "⚠️ This is not a valid booth QR code";
              instructions.style.background = "rgba(239, 68, 68, 0.9)";
              scanFrame.style.borderColor = "#ff0000";
              
              // Reset after 2 seconds
              setTimeout(() => {
                instructions.innerHTML = "📱 Point your camera at the booth QR code";
                instructions.style.background = "rgba(0, 0, 0, 0.8)";
                scanFrame.style.borderColor = "#00ff00";
              }, 2000);
            }
          } catch (e) {
            console.error("Invalid QR code URL:", e);
            instructions.innerHTML = "⚠️ Invalid QR code format. Please scan a booth QR code.";
            instructions.style.background = "rgba(239, 68, 68, 0.9)";
            scanFrame.style.borderColor = "#ff0000";
            
            // Reset after 2 seconds
            setTimeout(() => {
              instructions.innerHTML = "📱 Point your camera at the booth QR code";
              instructions.style.background = "rgba(0, 0, 0, 0.8)";
              scanFrame.style.borderColor = "#00ff00";
            }, 2000);
          }
        },
        {
          highlightScanRegion: false, // We're using our own scan frame
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5,
          calculateScanRegion: () => {
            // Define scan region to match our visual frame
            const frameSize = 250;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            return {
              x: centerX - frameSize / 2,
              y: centerY - frameSize / 2,
              width: frameSize,
              height: frameSize
            };
          }
        }
      );
      
      // Store scanner instance for cleanup
      setQrScanner(scanner);
      
      // Add elements to page
      document.body.appendChild(videoElem);
      document.body.appendChild(overlay);
      
      // Start the camera and scanner
      await scanner.start();
      
      console.log("Camera started successfully for QR scanning");
      
    } catch (error) {
      console.error("Error starting camera for QR scanner:", error);
      
      let errorMessage = "Unable to access camera";
      if (error.name === 'NotAllowedError') {
        errorMessage = "📷 Camera permission denied. Please allow camera access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "📵 No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "📷 Camera is being used by another application. Please close other apps and try again.";
      } else if (error.message?.includes('No camera')) {
        errorMessage = "📵 No camera available on this device.";
      } else if (error.name === 'SecurityError') {
        errorMessage = "🔒 Camera access blocked. Please enable camera permissions for this website.";
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
    
    // Remove video elements
    const videoElements = document.querySelectorAll('video[style*="position: fixed"]');
    videoElements.forEach(el => el.remove());
    
    // Remove overlay elements
    const overlayElements = document.querySelectorAll('div[style*="z-index: 1001"]');
    overlayElements.forEach(el => el.remove());
    
    // Remove any injected styles
    const injectedStyles = document.querySelectorAll('style');
    injectedStyles.forEach(el => {
      if (el.textContent.includes('@keyframes scanPulse')) {
        el.remove();
      }
    });
    
    setIsScanning(false);
    setCameraError("");
    console.log("Camera scanner stopped and cleaned up");
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
