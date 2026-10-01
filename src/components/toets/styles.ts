// Opmaak van de oefentoets en de aanwijstoets, zodat ze er hetzelfde uitzien.

import styled from '@emotion/styled';
import { colors } from '../../ui';

export const Screen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.background};
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1000;
`;

export const Title = styled.h1`
  font-size: 1.4rem;
  color: ${colors.primary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const Progress = styled.div`
  color: ${colors.muted};
  font-weight: 600;
`;

export const PlayArea = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

export const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
`;

export const Panel = styled.aside`
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;

  @media (max-width: 700px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    padding: 14px 16px;
  }
`;

export const Question = styled.h3`
  color: ${colors.text};
  font-size: 1.2rem;
  margin: 0;
`;

export const AnswerInput = styled.input`
  padding: 12px 14px;
  font-size: 1.2rem;
  border: 2px solid #d6dde6;
  border-radius: 12px;
  outline: none;

  &:focus {
    border-color: ${colors.primary};
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const Help = styled.p`
  color: ${colors.muted};
  font-size: 0.9rem;
  margin: 0;
`;

export const Page = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Box = styled.div`
  width: 100%;
  max-width: 720px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const LengthButton = styled.button<{ active: boolean }>`
  flex: 1;
  min-width: 150px;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid ${(p) => (p.active ? colors.primary : '#d6dde6')};
  background: ${(p) => (p.active ? '#e8f0fe' : 'white')};
  font-size: 1rem;
  text-align: left;
  cursor: pointer;

  strong {
    display: block;
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
  }
`;

export const Grade = styled.div<{ passed: boolean }>`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  color: ${(p) => (p.passed ? colors.success : colors.danger)};
`;

export const PartLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eef2f7;
  font-weight: 600;
`;

export const AnswerList = styled.ul`
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const AnswerItem = styled.li<{ correct: boolean }>`
  padding: 8px 12px;
  border-radius: 10px;
  background: ${(p) => (p.correct ? '#e6f4ea' : '#fde8e6')};

  small {
    display: block;
    color: ${colors.muted};
  }
`;

/** De gevraagde plek bij aanwijzen: groot en duidelijk. */
export const PointName = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${colors.primary};
`;
