import React from 'react';
import styled from '@emotion/styled';
import { colors } from './theme';

const CardButton = styled.button<{ accent: string }>`
  font: inherit;
  text-align: left;
  background: white;
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-top: 4px solid ${(props) => props.accent};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h2`
  color: ${colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const CardText = styled.p`
  color: ${colors.muted};
  margin: 0;
  font-size: 0.9rem;
`;

/** Klikbare kaart met gekleurde bovenrand, voor categorieën en pakketten. */
const Card: React.FC<{
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}> = ({ title, description, color, onClick }) => (
  <CardButton type="button" accent={color} onClick={onClick}>
    <CardTitle>{title}</CardTitle>
    <CardText>{description}</CardText>
  </CardButton>
);

export default Card;
