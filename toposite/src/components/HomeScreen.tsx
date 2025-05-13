import React, { useState } from 'react';

interface HomeScreenProps {
  onSelectPackage: (packageType: 'pakket1' | 'pakket2' | 'pakket3' | 'pakket1-2' | 'pakket2-3' | 'pakket1-2-3') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectPackage }) => {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '2.8em', 
        marginBottom: '30px',
        color: '#1a73e8',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        fontWeight: '700'
      }}>
        Topografie Oefenen
      </h1>
      
      <h2 style={{
        fontSize: '1.8em',
        marginBottom: '15px',
        color: '#202124',
        fontWeight: '600'
      }}>
        Individuele pakketten
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <PackageCard
          title="Pakket 1"
          description="Oefen hier met alle steden van pakket 1"
          onClick={() => onSelectPackage('pakket1')}
          color="#1a73e8"
        />
        <PackageCard
          title="Pakket 2"
          description="Oefen hier met alle steden van pakket 2"
          onClick={() => onSelectPackage('pakket2')}
          color="#34a853"
        />
        <PackageCard
          title="Pakket 3"
          description="Oefen hier met alle steden van pakket 3"
          onClick={() => onSelectPackage('pakket3')}
          color="#ea4335"
        />
      </div>

      <h2 style={{
        fontSize: '1.8em',
        marginBottom: '15px',
        color: '#202124',
        fontWeight: '600'
      }}>
        Gecombineerde pakketten
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <PackageCard
          title="Pakket 1 & 2"
          description="Oefen hier met alle steden van pakket 1 en 2 (60 steden)"
          onClick={() => onSelectPackage('pakket1-2')}
          color="#4285f4"
        />
        <PackageCard
          title="Pakket 2 & 3"
          description="Oefen hier met alle steden van pakket 2 en 3 (25 steden)"
          onClick={() => onSelectPackage('pakket2-3')}
          color="#0f9d58"
        />
        <PackageCard
          title="Pakket 1, 2 & 3"
          description="Oefen hier met alle steden van alle pakketten (75 steden)"
          onClick={() => onSelectPackage('pakket1-2-3')}
          color="#db4437"
        />
      </div>
    </div>
  );
};

interface PackageCardProps {
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ title, description, onClick, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '25px',
        boxShadow: isHovered 
          ? '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'
          : '0 4px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: `1px solid ${isHovered ? color : 'transparent'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
        opacity: isHovered ? 1 : 0.7
      }} />
      <h2 style={{ 
        fontSize: '1.6em',
        marginBottom: '12px',
        color: color,
        fontWeight: '600'
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '1.1em',
        color: '#5f6368',
        lineHeight: '1.5',
        margin: 0
      }}>
        {description}
      </p>
    </div>
  );
};

export default HomeScreen; 