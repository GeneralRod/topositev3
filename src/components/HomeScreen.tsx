import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../content/catalog';
import { BackLink, Card, CardGrid, Page, PageTitle, SectionTitle } from '../ui';

interface HomeScreenProps {
  category: Category;
}

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

const HomeScreen: React.FC<HomeScreenProps> = ({ category }) => {
  const navigate = useNavigate();

  return (
    <Page>
      <BackLink onClick={() => navigate('/categories')}>← Terug naar categorieën</BackLink>
      <PageTitle>{category.heading}</PageTitle>

      {category.sections.map((section) => (
        <React.Fragment key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <CardGrid>
            {section.packages.map((pkg) => (
              <Card
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                color={pkg.color}
                onClick={() =>
                  navigate(
                    `/${section.kind === 'map' ? 'interactive' : 'game'}/${category.id}/${pkg.id}`,
                  )
                }
              />
            ))}
          </CardGrid>
        </React.Fragment>
      ))}

      <TrophyButton onClick={() => navigate('/trophy-cabinet')}>
        <TrophyIcon>🏆</TrophyIcon>
        Prijzenkast
      </TrophyButton>
      <VersionTag>Versie: 9.0</VersionTag>
    </Page>
  );
};

export default HomeScreen;
