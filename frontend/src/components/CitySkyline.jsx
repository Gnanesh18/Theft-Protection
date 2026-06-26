import React from 'react';

const CitySkyline = () => {
  return (
    <div className="relative w-full overflow-hidden h-40 md:h-56 bg-navy-dark border-t border-navy-border flex items-end">
      {/* City Background SVG Grid */}
      <div className="absolute inset-0 opacity-15 grid-bg"></div>

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 rounded-full bg-navy-light/5 blur-3xl"></div>
      <div className="absolute top-1/3 left-2/3 -translate-y-1/2 w-96 h-40 rounded-full bg-navy-light/3 blur-3xl animate-pulse"></div>

      {/* SVG Vector Skyline */}
      <svg className="w-full h-full text-navy-medium z-10" viewBox="0 0 1440 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {/* Layer 3 - Back Buildings (Faded) */}
        <path d="M 0,220 L 0,140 L 40,140 L 40,160 L 80,160 L 80,110 L 130,110 L 130,170 L 180,170 L 180,130 L 220,130 L 220,90 L 260,90 L 260,150 L 320,150 L 320,100 L 370,100 L 370,180 L 420,180 L 420,120 L 470,120 L 470,80 L 530,80 L 530,160 L 580,160 L 580,110 L 640,110 L 640,140 L 700,140 L 700,90 L 750,90 L 750,170 L 800,170 L 800,100 L 860,100 L 860,60 L 910,60 L 910,130 L 960,130 L 960,160 L 1020,160 L 1020,110 L 1080,110 L 1080,150 L 1140,150 L 1140,90 L 1200,90 L 1200,130 L 1250,130 L 1250,70 L 1310,70 L 1310,160 L 1380,160 L 1380,120 L 1440,120 L 1440,220 Z" fill="rgba(217, 167, 82, 0.04)" />
        
        {/* Layer 2 - Mid Buildings */}
        <path d="M 0,220 L 0,160 L 60,160 L 60,140 L 110,140 L 110,180 L 160,180 L 160,110 L 210,110 L 210,150 L 280,150 L 280,70 L 330,70 L 330,160 L 390,160 L 390,120 L 450,120 L 450,170 L 500,170 L 500,100 L 550,100 L 550,140 L 610,140 L 610,90 L 670,90 L 670,150 L 720,150 L 720,180 L 780,180 L 780,110 L 840,110 L 840,130 L 900,130 L 900,80 L 950,80 L 950,160 L 1000,160 L 1000,110 L 1060,110 L 1060,140 L 1110,140 L 1110,90 L 1180,90 L 1180,170 L 1240,170 L 1240,130 L 1300,130 L 1300,155 L 1360,155 L 1360,100 L 1440,100 L 1440,220 Z" fill="rgba(217, 167, 82, 0.1)" />

        {/* Layer 1 - Front Buildings (Darkest) */}
        <path d="M 0,220 L 0,180 L 80,180 L 80,150 L 140,150 L 140,190 L 200,190 L 200,130 L 250,130 L 250,170 L 300,170 L 300,120 L 360,120 L 360,95 L 410,95 L 410,180 L 480,180 L 480,140 L 540,140 L 540,160 L 590,160 L 590,120 L 660,120 L 660,180 L 710,180 L 710,100 L 760,100 L 760,150 L 820,150 L 820,130 L 880,130 L 880,165 L 930,165 L 930,110 L 980,110 L 980,175 L 1040,175 L 1040,130 L 1100,130 L 1100,150 L 1160,150 L 1160,110 L 1220,110 L 1220,180 L 1280,180 L 1280,140 L 1340,140 L 1340,170 L 1400,170 L 1400,130 L 1440,130 L 1440,220 Z" fill="#0A0A0B" />

        {/* Floating Beacons/Grid Points */}
        <circle cx="280" cy="70" r="3" fill="#D9A752" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="280" cy="70" r="2.5" fill="#D9A752" />
        
        <circle cx="860" cy="60" r="3" fill="#D9A752" className="animate-ping" style={{ animationDuration: '4s' }} />
        <circle cx="860" cy="60" r="2.5" fill="#D9A752" />

        <circle cx="1250" cy="70" r="3" fill="#D9A752" className="animate-ping" style={{ animationDuration: '2.5s' }} />
        <circle cx="1250" cy="70" r="2.5" fill="#D9A752" />

        {/* Radio/Radar sweep lines from tall buildings */}
        <line x1="860" y1="60" x2="860" y2="0" stroke="rgba(217, 167, 82, 0.15)" strokeWidth="1" className="animate-pulse" />
        <line x1="280" y1="70" x2="280" y2="0" stroke="rgba(217, 167, 82, 0.15)" strokeWidth="1" className="animate-pulse" />
      </svg>

      {/* Glowing horizontal line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D9A752] to-transparent shadow-[0_0_10px_#D9A752]"></div>
    </div>
  );
};

export default CitySkyline;