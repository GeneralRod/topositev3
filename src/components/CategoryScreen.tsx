import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../content/catalog';
import { BackLink, Card, CardGrid, Page, PageTitle } from '../ui';

const CategoryScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page centered>
      <BackLink onClick={() => navigate('/')}>← Terug</BackLink>
      <PageTitle>Selecteer een categorie</PageTitle>
      <CardGrid maxWidth={800}>
        {categories.map((category) => (
          <Card
            key={category.id}
            title={category.title}
            description={category.description}
            color={category.color}
            onClick={() => navigate(`/main/${category.id}`)}
          />
        ))}
      </CardGrid>
    </Page>
  );
};

export default CategoryScreen;
