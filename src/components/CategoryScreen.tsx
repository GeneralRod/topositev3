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
  gap: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem 3rem;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CategoryScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <CategoryCard onClick={() => navigate('/main/capitals')}>Hoofd- en wereldsteden</CategoryCard>
      <CategoryCard onClick={() => navigate('/main/landscapes')}>
        Wereldwijde wateren en landschappen
      </CategoryCard>
    </Container>
  );
};

export default CategoryScreen;
