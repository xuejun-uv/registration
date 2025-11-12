import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QrScanner from "qr-scanner";
import StampGrid from "../components/StampGrid";
import "../App.css";

const StampPage = () => {
  const [searchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('scan'); // 'scan' or 'photo'

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

  // Handle QR scanning
  const handleScan = async () => {
    if (isScanning) return;
    setCameraMode('scan');
    startCamera();
  };

  // Handle photo taking
  const handleTakePhoto = async () => {
    if (isScanning) return;
    setCameraMode('photo');
    startCamera();
  };

  // Unified camera function
  const startCamera = async () => {
    setIsScanning(true);
    setShowCamera(true);
    
    try {
      const videoElem = document.createElement("video");
      videoElem.style.position = "fixed";
      videoElem.style.top = "0";
      videoElem.style.left = "0";
      videoElem.style.width = "100%";
      videoElem.style.height = "100%";
      videoElem.style.zIndex = "1000";
      videoElem.style.objectFit = "cover";
      videoElem.autoplay = true;
      videoElem.playsInline = true;
      
      // Create camera controls overlay
      const controlsDiv = document.createElement("div");
      controlsDiv.style.position = "fixed";
      controlsDiv.style.bottom = "20px";
      controlsDiv.style.left = "50%";
      controlsDiv.style.transform = "translateX(-50%)";
      controlsDiv.style.zIndex = "1001";
      controlsDiv.style.display = "flex";
      controlsDiv.style.gap = "15px";
      
      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "❌ Close";
      closeBtn.style.padding = "12px 20px";
      closeBtn.style.backgroundColor = "#dc3545";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "8px";
      closeBtn.style.fontSize = "16px";
      closeBtn.style.cursor = "pointer";
      
      if (cameraMode === 'scan') {
        // QR Scanner mode
        const qrScanner = new QrScanner(videoElem, (result) => {
          const qrCode = result.data;
          console.log("QR Code scanned:", qrCode);
          
          try {
            const url = new URL(qrCode);
            const boothParam = url.searchParams.get('booth');
            if (boothParam && id) {
              window.location.href = `${window.location.origin}/stamps?id=${id}&booth=${boothParam}`;
            }
          } catch (e) {
            console.error("Invalid QR code URL:", e);
          }
          
          cleanup();
        });
        
        document.body.appendChild(videoElem);
        document.body.appendChild(controlsDiv);
        controlsDiv.appendChild(closeBtn);
        
        await qrScanner.start();
        
        closeBtn.onclick = () => {
          qrScanner.stop();
          cleanup();
        };
        
      } else {
        // Photo capture mode
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        videoElem.srcObject = stream;
        
        // Capture button
        const captureBtn = document.createElement("button");
        captureBtn.textContent = "📸 Capture";
        captureBtn.style.padding = "12px 20px";
        captureBtn.style.backgroundColor = "#007bff";
        captureBtn.style.color = "white";
        captureBtn.style.border = "none";
        captureBtn.style.borderRadius = "8px";
        captureBtn.style.fontSize = "16px";
        captureBtn.style.cursor = "pointer";
        
        controlsDiv.appendChild(captureBtn);
        controlsDiv.appendChild(closeBtn);
        
        document.body.appendChild(videoElem);
        document.body.appendChild(controlsDiv);
        
        captureBtn.onclick = () => {
          // Create canvas to capture photo
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = videoElem.videoWidth;
          canvas.height = videoElem.videoHeight;
          context.drawImage(videoElem, 0, 0);
          
          // Convert to blob and save
          canvas.toBlob((blob) => {
            const photoUrl = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString();
            const newPhoto = {
              id: Date.now(),
              url: photoUrl,
              timestamp: timestamp,
              booth: booth || 'general'
            };
            
            setCapturedPhotos(prev => [...prev, newPhoto]);
            
            // Show success message
            alert("📸 Photo captured successfully!");
          }, 'image/jpeg', 0.8);
          
          cleanup();
        };
        
        closeBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          cleanup();
        };
      }
      
      function cleanup() {
        videoElem.remove();
        controlsDiv.remove();
        setIsScanning(false);
        setShowCamera(false);
      }
      
    } catch (error) {
      console.error("Error starting camera:", error);
      setIsScanning(false);
      setShowCamera(false);
      alert("❌ Camera access denied or not available");
    }
  };

  return (
    <div className="stamp-page">
      <div className="container">
        <h1 className="title">Stamp Collection</h1>
        
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="main-btn camera-btn"
            style={{ flex: "1", minWidth: "140px" }}
          >
            {isScanning && cameraMode === 'scan' ? "📷 Scanning..." : "� Scan QR Code"}
          </button>
          
          <button 
            onClick={handleTakePhoto}
            disabled={isScanning}
            className="main-btn"
            style={{ 
              backgroundColor: "#28a745",
              flex: "1", 
              minWidth: "140px"
            }}
          >
            {isScanning && cameraMode === 'photo' ? "📸 Camera Active..." : "📸 Take Photo"}
          </button>
        </div>

        {id && (
          <p className="user-info">
            User ID: {id}
          </p>
        )}

        {capturedPhotos.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#333", marginBottom: "10px" }}>
              📷 Captured Photos ({capturedPhotos.length})
            </h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", 
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px"
            }}>
              {capturedPhotos.map((photo) => (
                <div key={photo.id} style={{ position: "relative" }}>
                  <img 
                    src={photo.url} 
                    alt={`Photo ${photo.id}`}
                    style={{ 
                      width: "100%", 
                      height: "80px", 
                      objectFit: "cover", 
                      borderRadius: "4px",
                      border: "2px solid #ddd"
                    }}
                    onClick={() => window.open(photo.url, '_blank')}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 4px",
                    borderRadius: "2px"
                  }}>
                    {photo.booth}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2>Discovery Atrium</h2>
        <StampGrid count={4} stamps={stamps.slice(0, 4)} />

        <h2>Envision Gallery</h2>
        <StampGrid count={3} stamps={stamps.slice(4, 7)} />

        <h2>Experience Zone</h2>
        <StampGrid count={4} stamps={stamps.slice(7, 11)} />
        
        <div style={{ 
          marginTop: "30px", 
          textAlign: "center",
          fontSize: "12px",
          color: "#888"
        }}>
          <p>📱 Scan QR codes to collect stamps</p>
          <p>📸 Take photos at each booth to capture memories!</p>
        </div>
      </div>
    </div>
  );
};

export default StampPage;
