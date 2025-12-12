import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import QrScanner from 'qr-scanner';
import StampGrid from "../components/StampGrid";
import { BOOTH_CONFIG } from "../constants";
import "../App.css";

// Fix for QrScanner worker in React/Webpack environment
// Using a CDN to ensure the worker is loaded correctly
QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';

const StampPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  
  // Camera & Scanning States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [userError, setUserError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  
  // Refs for scanner cleanup
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get ID from URL or LocalStorage
  const urlId = searchParams.get("id");
  const [id, setId] = useState(urlId || localStorage.getItem('userId'));

  const booth = searchParams.get("booth");

  // Sync ID with LocalStorage and URL
  useEffect(() => {
    if (urlId) {
      setId(urlId);
      localStorage.setItem('userId', urlId);
    } else {
      const storedId = localStorage.getItem('userId');
      if (storedId) {
        setId(storedId);
      }
    }
  }, [urlId]);

  // Initialize stamps array
  useEffect(() => {
    const initialStamps = Array.from({ length: 11 }, (_, i) => ({
      boothId: `booth${i + 1}`,
      filled: false
    }));
    setStamps(initialStamps);
  }, []);

  // Fetch user stamp data
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
      handleMarkStamp(booth);
    }
  }, [id, booth]);

  const handleMarkStamp = (boothName) => {
    if (!id) return;
    
    fetch(`/api/mark-stamp?id=${id}&booth=${boothName}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stamps) {
          setStamps(data.stamps);
          
          // Find booth name for the alert
          const boothNum = parseInt(boothName.replace('booth', ''));
          const boothConfig = BOOTH_CONFIG[boothNum];
          alert(`✅ Success! Stamp collected for ${boothConfig?.name || boothName}`);
        } else {
          if (data.status === 409 || data.message?.includes("already")) {
             alert(`⚠️ You have already collected this stamp!`);
          } else {
             alert(`❌ ${data.error || "Failed to mark stamp"}`);
          }
        }
      })
      .catch((err) => {
        console.error("Error marking stamp:", err);
        alert("Unable to mark stamp - connection error");
      });
  };

  // --- Core Scanning Logic ---

  const processScannedData = (data) => {
    console.log("Processing data:", data);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(200);

    let boothName = null;

    // 1. Try parsing as URL
    try {
      const urlString = data.startsWith('http') ? data : `http://dummy.com?${data}`;
      const url = new URL(urlString);
      const param = url.searchParams.get('booth');
      if (param) {
          const num = parseInt(param.replace(/\D/g, ''));
          if (num >= 1 && num <= 11) boothName = `booth${num}`;
      }
    } catch (e) {}

    // 2. Regex search
    if (!boothName) {
      const match = data.match(/booth[\W_]*(\d+)/i);
      if (match) {
          const num = parseInt(match[1]);
          if (num >= 1 && num <= 11) boothName = `booth${num}`;
      }
    }

    // 3. Raw number
    if (!boothName) {
      const cleanData = data.trim();
      if (/^\d+$/.test(cleanData)) {
          const num = parseInt(cleanData);
          if (num >= 1 && num <= 11) boothName = `booth${num}`;
      }
    }
    
    if (boothName) {
      setIsScanning(false); // Stop scanning on success
      handleMarkStamp(boothName);
    } else {
      alert(`⚠️ Invalid QR Code.\nCould not find a valid booth ID (1-11).\nData: "${data}"`);
      // Note: We don't stop scanning here, letting user try again
    }
  };

  // --- Camera Effect Hook ---
  useEffect(() => {
    let qrScanner = null;

    if (isScanning && videoRef.current) {
      setCameraError("");
      
      // Initialize Scanner
      qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
            const data = typeof result === 'object' && result.data ? result.data : result;
            processScannedData(data);
        },
        { 
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
        }
      );

      qrScanner.start().catch((err) => {
        console.error("Camera start error:", err);
        setCameraError("Camera failed to start. Please try the 'Upload Image' button instead.");
        setIsScanning(false);
      });

      scannerRef.current = qrScanner;
    }

    // Cleanup function
    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
        scannerRef.current = null;
      }
    };
  }, [isScanning]); // Re-run only when scanning state changes

  const stopScanning = () => {
    setIsScanning(false);
  };

  // --- File Upload Fallback ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      processScannedData(result);
    } catch (error) {
      console.error("File scan error:", error);
      alert("❌ Could not detect a QR code in this image. Please ensure the QR code is clear.");
    } finally {
      // Reset input so same file can be selected again
      e.target.value = null; 
    }
  };

  return (
    <div className="stamp-page">
      <div className="container">
        <h1 className="title">Stamp Collection</h1>
        
        {/* Actions Area */}
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          
          {/* 1. Main Camera Button */}
          <button 
            onClick={() => setIsScanning(true)}
            disabled={!id || isScanning}
            style={{
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: !id ? 'not-allowed' : 'pointer',
              width: '100%',
              maxWidth: '300px',
              opacity: !id ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(78, 205, 196, 0.4)'
            }}
          >
            📸 Scan QR with Camera
          </button>

          {/* 2. Upload Image Fallback (Crucial for fixing camera errors) */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={!id}
            style={{
              background: 'white',
              color: '#4b5563',
              border: '2px solid #e5e7eb',
              padding: '12px 24px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !id ? 'not-allowed' : 'pointer',
              width: '100%',
              maxWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🖼️ Upload QR Image (If camera fails)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          {/* 3. Manual Entry */}
          {id && (
            <button
                onClick={() => {
                  const input = prompt("Enter Booth Number (1-11):");
                  if (input) processScannedData(input);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '13px',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Or enter code manually
            </button>
          )}

          {/* Error Messages */}
          {cameraError && (
            <div style={{
              padding: "12px",
              background: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "12px",
              color: "#b91c1c",
              fontSize: "14px",
              textAlign: "center"
            }}>
              ⚠️ {cameraError}
            </div>
          )}

          {userError && (
            <div style={{ color: "red", fontSize: "14px" }}>🚫 {userError}</div>
          )}
          
          {!id && (
            <div style={{ color: "#2563eb", fontSize: "14px" }}>
              💡 Enter your nickname first to enable scanning
            </div>
          )}
        </div>

        {/* User Info Display */}
        {id && (
          <p className="user-info">
            {userInfo ? `Welcome, ${userInfo.nickname}!` : `User ID: ${id}`}
          </p>
        )}

        {/* --- Fullscreen Camera Overlay --- */}
        {isScanning && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Close Button */}
                <button 
                    onClick={stopScanning}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10001
                    }}
                >
                    ✕
                </button>

                {/* Camera View */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <video 
                        ref={videoRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    
                    {/* Scan Frame Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '280px',
                        height: '280px',
                        border: '4px solid #00ff00',
                        borderRadius: '24px',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                        pointerEvents: 'none'
                    }} />
                    
                    <div style={{
                        position: 'absolute',
                        bottom: '100px',
                        left: 0,
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        Align QR Code within frame
                    </div>
                </div>
            </div>
        )}

        {/* Stamp Grids */}
        <h2>Discovery Atrium</h2>
        <StampGrid count={4} stamps={stamps.slice(0, 4)} startIndex={1} />

        <h2>Envision Gallery</h2>
        <StampGrid count={3} stamps={stamps.slice(4, 7)} startIndex={5} />

        <h2>Experience Zone</h2>
        <StampGrid count={4} stamps={stamps.slice(7, 11)} startIndex={8} />
      </div>
    </div>
  );
};

export default StampPage;