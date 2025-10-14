import React from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const Title = styled.h1`
  color: #1a73e8;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
`;

const CategoryCard = styled.div<{ color: string }>`
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

const CategoryTitle = styled.h2`
  color: #202124;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const CategoryDescription = styled.p`
  color: #5f6368;
  margin: 0;
  font-size: 0.9rem;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #1a73e8;
  color: #1a73e8;
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 2rem;
  transition: all 0.2s;
  align-self: flex-start;

  &:hover {
    background: #1a73e8;
    color: white;
  }
`;

const CategoryScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>← Terug</BackButton>
      <Title>Selecteer een categorie</Title>
      <CategoryGrid>
        <CategoryCard color="#1a73e8" onClick={() => navigate('/main/capitals')}>
          <CategoryTitle>Hoofd- en wereldsteden</CategoryTitle>
          <CategoryDescription>Oefen met hoofdsteden en belangrijke steden wereldwijd</CategoryDescription>
        </CategoryCard>
        <CategoryCard color="#34a853" onClick={() => navigate('/main/landscapes')}>
          <CategoryTitle>Wereldwijde wateren en landschappen</CategoryTitle>
          <CategoryDescription>Leer over belangrijke wateren en gebergtes</CategoryDescription>
        </CategoryCard>
      </CategoryGrid>
    </Container>
  );
};

export default CategoryScreen;
