import styled from '@emotion/styled';
import { colors } from './theme';

type ButtonVariant = 'primary' | 'danger' | 'outline';

const variantStyles: Record<ButtonVariant, string> = {
  primary: `background: ${colors.primary}; color: white; border: 2px solid ${colors.primary};
    &:hover:not(:disabled) { background: ${colors.primaryDark}; border-color: ${colors.primaryDark}; }`,
  danger: `background: ${colors.danger}; color: white; border: 2px solid ${colors.danger};
    &:hover:not(:disabled) { background: ${colors.dangerDark}; border-color: ${colors.dangerDark}; }`,
  outline: `background: transparent; color: ${colors.primary}; border: 2px solid ${colors.primary};
    &:hover:not(:disabled) { background: ${colors.primary}; color: white; }`,
};

export const Button = styled.button<{ variant?: ButtonVariant }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background-color 0.2s,
    color 0.2s;
  ${(props) => variantStyles[props.variant ?? 'primary']}

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`;

export const Page = styled.div<{ centered?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${(props) => (props.centered ? 'center' : 'flex-start')};
  padding: 2rem;
  background: ${colors.background};
  overflow-y: auto;
  overflow-x: hidden;
`;

export const PageTitle = styled.h1`
  color: ${colors.primary};
  margin-bottom: 2rem;
  text-align: center;
  font-size: clamp(1.8rem, 5vw, 2.9rem);
`;

export const SectionTitle = styled.h2`
  color: ${colors.text};
  margin: 2rem 0 1rem 0;
  width: 100%;
  max-width: 1200px;
  font-size: 1.5rem;
`;

export const CardGrid = styled.div<{ maxWidth?: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: ${(props) => props.maxWidth ?? 1200}px;
  margin-bottom: 2rem;
`;
