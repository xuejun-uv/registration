import React from 'react';

const StampGrid = ({ count, stamps = [] }) => {
  // Create array of stamp boxes based on count
  const stampBoxes = Array.from({ length: count }, (_, index) => {
    const isStamped = stamps.some(stamp => stamp.boothId === `booth${index + 1}` && stamp.filled);
    return {
      index: index + 1,
      filled: isStamped
    };
  });

  return (
    <div className="stamp-grid">
      {stampBoxes.map((stampBox) => (
        <div
          key={stampBox.index}
          className={`stamp-box ${stampBox.filled ? 'filled' : ''}`}
        >
          {stampBox.filled ? '✅' : ''}
        </div>
      ))}
    </div>
  );
};

export default StampGrid;