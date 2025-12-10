import React from 'react';
import { BOOTH_CONFIG } from '../constants';

const StampGrid = ({ count, stamps = [], startIndex = 1 }) => {
  // Create array of stamp boxes based on count
  const stampBoxes = Array.from({ length: count }, (_, index) => {
    const boothNumber = startIndex + index;
    const isStamped = stamps.some(stamp => stamp.boothId === `booth${boothNumber}` && stamp.filled);
    return {
      index: boothNumber,
      filled: isStamped,
      config: BOOTH_CONFIG[boothNumber] // Get config for this booth
    };
  });

  return (
    <div className="stamp-grid">
      {stampBoxes.map((stampBox) => {
        // Use image from config, or fallback to generated path
        const imagePath = stampBox.config ? stampBox.config.image : \`/booth\${stampBox.index}.jpg\`;
        
        return (
          <div
            key={stampBox.index}
            className={\`stamp-box \${stampBox.filled ? 'filled' : ''}\`}
          >
            <img 
              src={imagePath}
              alt={\`Stamp \${stampBox.index}\`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                opacity: stampBox.filled ? 1 : 0.3
              }}
              onError={(e) => {
                // Fallback to old naming convention if new image fails
                const ext = stampBox.index === 9 ? 'jpg' : 'png';
                e.target.src = \`/s\${stampBox.index}.\${ext}\`;
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