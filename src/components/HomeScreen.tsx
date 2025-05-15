import React from 'react';
import styled from '@emotion/styled';

interface HomeScreenProps {
  onSelectPackage: (packageName: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
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
`;

const PackageCard = styled.div<{ color: string }>`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 4px solid ${props => props.color};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectPackage }) => {
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
    </Container>
  );
};

export default HomeScreen; 