// Knop rechtsboven naar het accountscherm, op de start- en menuschermen.

import React from 'react';
import styled from '@emotion/styled';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../ui';
import { useAccount } from './session';

/** Alleen op deze schermen; in een spel of de prijzenkast zit hij in de weg. */
const SHOWN_ON = ['/', '/categories', '/main/:category'];

const FloatingButton = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: min(320px, calc(100vw - 32px));
  padding: 0.6rem 1.1rem;
  border: 2px solid ${colors.primary};
  border-radius: 999px;
  background: white;
  color: ${colors.primary};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background: ${colors.primary};
    color: white;
  }
`;

const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useAccount();

  if (!SHOWN_ON.some((path) => matchPath(path, location.pathname))) return null;

  return (
    <FloatingButton type="button" onClick={() => navigate('/account')}>
      <span aria-hidden>👤</span>
      <Label>{account.status === 'in' ? account.email : 'Inloggen'}</Label>
    </FloatingButton>
  );
};

export default AccountButton;
