import React from 'react';
import styled from '@emotion/styled';
import { Button } from './styles';

/** Terug-knop linksboven op menuschermen. */
const BackLinkButton = styled(Button)`
  padding: 0.7rem 1.5rem;
  margin-bottom: 1.5rem;
  align-self: flex-start;
`;

const BackLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <BackLinkButton type="button" variant="outline" onClick={onClick}>
    {children}
  </BackLinkButton>
);

export default BackLink;
