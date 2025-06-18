import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

interface HomeScreenProps {
  onSelectPackage: (packageName: string) => void;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow-y: auto;
  overflow-x: hidden;
`;

const Title = styled.h1`
  color: #1a73e8;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.9rem;
`;

const PackageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 2rem;
`;

const PackageCard = styled.div<{ color: string }>`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-top: 4px solid ${(props) => props.color};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PackageTitle = styled.h2`
  color: #202124;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const PackageDescription = styled.p`
  color: #5f6368;
  margin: 0;
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  color: #202124;
  margin: 2rem 0 1rem 0;
  width: 100%;
  max-width: 1200px;
  font-size: 1.5rem;
`;

const TrophyButton = styled.button`
  background: #f1c40f;
  color: #2c3e50;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition:
    transform 0.2s,
    background 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
    background: #f39c12;
  }
`;

const TrophyIcon = styled.span`
  font-size: 1.5rem;
`;

const VersionTag = styled.div`
  position: fixed;
  left: 16px;
  bottom: 12px;
  font-size: 0.95rem;
  color: #888;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 10px;
  border-radius: 6px;
  z-index: 2000;
  pointer-events: none;
`;

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectPackage }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>Topografie Wereld: hoofd- en wereldsteden</Title>

      <SectionTitle>Oefenpakketten</SectionTitle>
      <PackageGrid>
        <PackageCard color="#1a73e8" onClick={() => onSelectPackage('pakket1')}>
          <PackageTitle>Pakket 1</PackageTitle>
          <PackageDescription>Basis steden over de hele wereld</PackageDescription>
        </PackageCard>
        <PackageCard color="#34a853" onClick={() => onSelectPackage('pakket2')}>
          <PackageTitle>Pakket 2</PackageTitle>
          <PackageDescription>Extra steden over de wereld</PackageDescription>
        </PackageCard>
        <PackageCard color="#fbbc05" onClick={() => onSelectPackage('pakket3')}>
          <PackageTitle>Pakket 3</PackageTitle>
          <PackageDescription>Extra steden over de wereld</PackageDescription>
        </PackageCard>
      </PackageGrid>

      <SectionTitle>Gecombineerde Pakketten</SectionTitle>
      <PackageGrid>
        <PackageCard color="#ea4335" onClick={() => onSelectPackage('pakket1-2')}>
          <PackageTitle>Pakket 1 + 2</PackageTitle>
          <PackageDescription>Alle steden uit pakket 1 en 2</PackageDescription>
        </PackageCard>
        <PackageCard color="#9334e6" onClick={() => onSelectPackage('pakket2-3')}>
          <PackageTitle>Pakket 2 + 3</PackageTitle>
          <PackageDescription>Alle steden uit pakket 2 en 3</PackageDescription>
        </PackageCard>
        <PackageCard color="#4285f4" onClick={() => onSelectPackage('pakket1-2-3')}>
          <PackageTitle>Pakket 1 + 2 + 3</PackageTitle>
          <PackageDescription>Alle steden uit alle pakketten</PackageDescription>
        </PackageCard>
      </PackageGrid>

      <SectionTitle>Interactieve Kaarten</SectionTitle>
      <PackageGrid>
        <PackageCard color="#1a73e8" onClick={() => onSelectPackage('interactive1')}>
          <PackageTitle>Interactieve kaart pakket 1</PackageTitle>
          <PackageDescription>Bekijk alle steden uit pakket 1</PackageDescription>
        </PackageCard>
        <PackageCard color="#34a853" onClick={() => onSelectPackage('interactive2')}>
          <PackageTitle>Interactieve kaart pakket 2</PackageTitle>
          <PackageDescription>Bekijk alle steden uit pakket 2</PackageDescription>
        </PackageCard>
        <PackageCard color="#fbbc05" onClick={() => onSelectPackage('interactive3')}>
          <PackageTitle>Interactieve kaart pakket 3</PackageTitle>
          <PackageDescription>Bekijk alle steden uit pakket 3</PackageDescription>
        </PackageCard>
      </PackageGrid>

      <TrophyButton onClick={() => navigate('/trophy-cabinet')}>
        <TrophyIcon>🏆</TrophyIcon>
        Prijzenkast
      </TrophyButton>
      <VersionTag>Versie: 7.3</VersionTag>
    </Container>
  );
};

export default HomeScreen;
