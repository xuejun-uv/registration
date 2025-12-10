// Central configuration for Booths and their images
export const BOOTH_CONFIG = {
  1: { id: 'booth1', image: '/booth1.jpg', name: 'Booth 1' },
  2: { id: 'booth2', image: '/booth2.jpg', name: 'Booth 2' },
  3: { id: 'booth3', image: '/booth3.jpg', name: 'Booth 3' },
  4: { id: 'booth4', image: '/booth4.jpg', name: 'Booth 4' },
  5: { id: 'booth5', image: '/booth5.png', name: 'Booth 5' }, // PNG
  6: { id: 'booth6', image: '/booth6.png', name: 'Booth 6' }, // PNG
  7: { id: 'booth7', image: '/booth7.png', name: 'Booth 7' }, // PNG
  8: { id: 'booth8', image: '/booth8.jpg', name: 'Booth 8' },
  9: { id: 'booth9', image: '/booth9.jpg', name: 'Booth 9' },
  10: { id: 'booth10', image: '/booth10.jpg', name: 'Booth 10' },
  11: { id: 'booth11', image: '/booth11.jpg', name: 'Booth 11' },
};

// Helper to get booth info by ID string (e.g. "booth1")
export const getBoothById = (boothId) => {
  const num = parseInt(boothId.replace('booth', ''));
  return BOOTH_CONFIG[num];
};
