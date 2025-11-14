import React from 'react';

const StampGrid = ({ count, stamps = [], startIndex = 1 }) => {
  // Create array of stamp boxes based on count
  const stampBoxes = Array.from({ length: count }, (_, index) => {
    const boothNumber = startIndex + index;
    const isStamped = stamps.some(stamp => stamp.boothId === `booth${boothNumber}` && stamp.filled);
    return {
      index: boothNumber,
      filled: isStamped
    };
  });

  return (
    <div className="stamp-grid">
      {stampBoxes.map((stampBox) => {
        // Determine image extension (s9 is jpg, others are png)
        const imageExt = stampBox.index === 9 ? 'jpg' : 'png';
        const imagePath = `/s${stampBox.index}.${imageExt}`;
        
        return (
          <div
            key={stampBox.index}
            className={`stamp-box ${stampBox.filled ? 'filled' : ''}`}
          >
            <img 
              src={imagePath}
              alt={`Stamp ${stampBox.index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                opacity: stampBox.filled ? 1 : 0.3
              }}
            />
            {stampBox.filled && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                fontSize: '20px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ✅
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StampGrid;