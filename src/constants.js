// Central configuration for Booths and their images
export const BOOTH_CONFIG = {
  1: { id: 'booth1', image: '/booth1.jpg', name: 'Booth 1', qrFile: '/booth1_qr.png' },
  2: { id: 'booth2', image: '/booth2.jpg', name: 'Booth 2', qrFile: '/booth2_qr.png' },
  3: { id: 'booth3', image: '/booth3.jpg', name: 'Booth 3', qrFile: '/booth3_qr.png' },
  4: { id: 'booth4', image: '/booth4.jpg', name: 'Booth 4', qrFile: '/booth4_qr.png' },
  5: { id: 'booth5', image: '/booth5.png', name: 'Booth 5', qrFile: '/booth5_qr.png' }, // PNG
  6: { id: 'booth6', image: '/booth6.png', name: 'Booth 6', qrFile: '/booth6_qr.png' }, // PNG
  7: { id: 'booth7', image: '/booth7.png', name: 'Booth 7', qrFile: '/booth7_qr.png' }, // PNG
  8: { id: 'booth8', image: '/booth8.jpg', name: 'Booth 8', qrFile: '/booth8_qr.png' },
  9: { id: 'booth9', image: '/booth9.jpg', name: 'Booth 9', qrFile: '/booth9_qr.png' },
  10: { id: 'booth10', image: '/booth10.jpg', name: 'Booth 10', qrFile: '/booth10_qr.png' },
  11: { id: 'booth11', image: '/booth11.jpg', name: 'Booth 11', qrFile: '/booth11_qr.png' },
};

// Helper to get booth info by ID string (e.g. "booth1")
export const getBoothById = (boothId) => {
  const num = parseInt(boothId.replace('booth', ''));
  return BOOTH_CONFIG[num];
};
