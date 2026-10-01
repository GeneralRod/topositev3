import React from 'react';
import styled from '@emotion/styled';
import type { Category, GamePackage } from '../content/catalog';
import type { City } from '../data/cities';
import { BackLink, colors, Page, PageTitle } from '../ui';

// Vlaggen bekijken: alle vlaggen van een werelddeel met hun naam, om rustig te leren.

const Grid = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const Item = styled.figure`
  margin: 0;
  padding: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Flag = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  border: 1px solid #e2e8f0;
`;

const Name = styled.figcaption`
  font-weight: 600;
  color: ${colors.text};
  text-align: center;
`;

interface FlagGalleryProps {
  category: Category;
  pkg: GamePackage;
  places: City[];
  onBack: () => void;
}

const FlagGallery: React.FC<FlagGalleryProps> = ({ category, pkg, places, onBack }) => {
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  return (
    <Page>
      <BackLink onClick={onBack}>← Terug naar de vlaggen</BackLink>
      <PageTitle>Vlaggen van {pkg.title}</PageTitle>
      <Grid>
        {sorted.map((place) => (
          <Item key={place.name}>
            <Flag
              src={category.flagOf?.(place.name)}
              alt={`Vlag van ${place.name}`}
              loading="lazy"
            />
            <Name>{place.name}</Name>
          </Item>
        ))}
      </Grid>
    </Page>
  );
};

export default FlagGallery;
