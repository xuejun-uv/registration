import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import QrScanner from 'qr-scanner';
import StampGrid from "../components/StampGrid";
import "../App.css";

// Fix for QrScanner worker in React/Webpack environment
// Using a CDN to ensure the worker is loaded correctly
QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';

const StampPage = () => {
  const [searchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [userError, setUserError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const scannerRef = useRef(null);

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
      setUserError("");
      fetch(`/api/get-stamp?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.stamps) {
            setStamps(data.stamps);
            if (data.user) {
              setUserInfo(data.user);
            }
          } else {
            setUserError(data.error || "Failed to load user data");
          }
        })
        .catch((err) => {
          console.error("Error fetching stamps:", err);
          setUserError("Unable to connect to server");
        });
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
            if (data.message) {
              console.log(data.message);
            }
          } else {
            console.error("Stamp marking failed:", data.error);
            setCameraError(data.error || "Failed to mark stamp");
          }
        })
        .catch((err) => {
          console.error("Error marking stamp:", err);
          setCameraError("Unable to mark stamp - connection error");
        });
    }
  }, [id, booth]);

  // Handle QR code detection result
  const handleQRCodeDetected = async (data) => {
    console.log("QR Code detected:", data);
    
    // Stop scanning immediately to prevent multiple triggers
    stopScanning();

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    try {
      // Robust extraction of booth ID
      // 1. Try to find "boothX" or "booth X" anywhere in the string (case insensitive)
      const boothRegex = /booth\s*(\d+)/i;
      const match = data.match(boothRegex);
      
      let boothName = null;
      
      if (match) {
        const boothNumber = parseInt(match[1]);
        // Validate it's between 1 and 11
        if (boothNumber >= 1 && boothNumber <= 11) {
            boothName = `booth${boothNumber}`;
        }
      }

      // 2. Fallback: Check for URL parameter "booth=..."
      if (!boothName && data.includes('booth=')) {
        try {
            // Handle full URL or just query string
            const queryString = data.includes('?') ? data.split('?')[1] : data;
            const urlParams = new URLSearchParams(queryString);
            const param = urlParams.get('booth');
            if (param) {
                const paramMatch = param.match(/(\d+)/);
                if (paramMatch) {
                    const num = parseInt(paramMatch[1]);
                    if (num >= 1 && num <= 11) {
                        boothName = `booth${num}`;
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to parse URL params:", e);
        }
      }
      
      if (boothName && id) {
        const response = await fetch(`/api/mark-stamp?id=${id}&booth=${boothName}`, { 
          method: "POST" 
        });
        const result = await response.json();
        
        if (result.success) {
          setStamps(result.stamps);
          alert(`✅ Success! Stamp collected for ${boothName.replace('booth', 'Booth ')}`);
        } else {
          alert(`❌ ${result.error || result.message || 'Failed to collect stamp'}`);
        }
      } else {
        alert(`⚠️ Invalid QR Code. Could not find a valid booth ID (Booth 1-11) in the scanned code.`);
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      alert(`❌ Error processing QR code: ${error.message}`);
    }
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
      
      // Create fullscreen camera interface
      const cameraContainer = document.createElement("div");
      cameraContainer.id = "camera-scanner";
      cameraContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;
      
      // Create video element for camera preview
      const video = document.createElement("video");
      video.setAttribute('playsinline', true);
      video.setAttribute('muted', true);
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.6; /* Dim the video slightly */
      `;
      
      // Overlay UI
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none; /* Let clicks pass through to close button */
      `;
      
      // Scanning Frame (The box)
      const scanFrame = document.createElement("div");
      scanFrame.style.cssText = `
        width: 280px;
        height: 280px;
        border: 4px solid #00ff00;
        border-radius: 24px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7); /* Darken everything outside */
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // "Scanning..." text
      const scanText = document.createElement("div");
      scanText.innerText = "Align QR Code within frame";
      scanText.style.cssText = `
        position: absolute;
        bottom: -50px;
        color: white;
        font-size: 16px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        background: rgba(0,0,0,0.5);
        padding: 8px 16px;
        border-radius: 20px;
      `;
      scanFrame.appendChild(scanText);

      // Close Button
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "✕";
      closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        backdrop-filter: blur(4px);
        z-index: 10000;
      `;
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        stopScanning();
      };
      
      // Assemble the interface
      overlay.appendChild(scanFrame);
      cameraContainer.appendChild(video);
      cameraContainer.appendChild(overlay);
      cameraContainer.appendChild(closeBtn);
      document.body.appendChild(cameraContainer);
      
      // Initialize QR Scanner
      const qrScanner = new QrScanner(
        video,
        (result) => {
            console.log('decoded qr code:', result);
            const data = typeof result === 'object' && result.data ? result.data : result;
            handleQRCodeDetected(data);
        },
        { 
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
        }
      );

      scannerRef.current = qrScanner;
      await qrScanner.start();
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsScanning(false);
      stopScanning();
      
      let errorMessage = "Camera access failed";
      if (error.name === 'NotAllowedError') {
        errorMessage = "📷 Camera permission denied. Please allow camera access in your browser.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "📵 No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "📷 Camera is being used by another app.";
      }
      
      setCameraError(errorMessage);
    }
  };

  // Stop camera and cleanup
  const stopScanning = () => {
    setIsScanning(false);
    
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }

    // Remove camera interface
    const cameraContainer = document.getElementById("camera-scanner");
    if (cameraContainer) {
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

          {userError && (
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
              🚫 {userError}
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

        {id && userInfo && (
          <p className="user-info">
            Welcome, {userInfo.nickname}! (ID: {id})
          </p>
        )}

        {id && !userInfo && !userError && (
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