import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QrScanner from "qr-scanner";
import StampGrid from "../components/StampGrid";
import "../App.css";

const StampPage = () => {
  const [searchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

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
    
    setIsScanning(true);
    try {
      const videoElem = document.createElement("video");
      videoElem.style.position = "fixed";
      videoElem.style.top = "0";
      videoElem.style.left = "0";
      videoElem.style.width = "100%";
      videoElem.style.height = "100%";
      videoElem.style.zIndex = "1000";
      videoElem.style.objectFit = "cover";
      
      const qrScanner = new QrScanner(videoElem, (result) => {
        const qrCode = result.data;
        console.log("QR Code scanned:", qrCode);
        
        // Parse the URL to get booth information
        try {
          const url = new URL(qrCode);
          const boothParam = url.searchParams.get('booth');
          if (boothParam && id) {
            // Redirect to the stamp page with booth parameter
            window.location.href = `${window.location.origin}/stamps?id=${id}&booth=${boothParam}`;
          }
        } catch (e) {
          console.error("Invalid QR code URL:", e);
        }
        
        qrScanner.stop();
        videoElem.remove();
        setIsScanning(false);
      });
      
      document.body.appendChild(videoElem);
      await qrScanner.start();
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      setIsScanning(false);
    }
  };

  return (
    <div className="stamp-page">
      <div className="container">
        <h1 className="title">Stamp Collection</h1>
        
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="main-btn camera-btn"
        >
          {isScanning ? "📷 Scanning..." : "📷 Scan QR Code"}
        </button>

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
