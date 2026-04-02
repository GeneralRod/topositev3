import styled from '@emotion/styled';

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #1a73e8;
  color: #1a73e8;
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
  align-self: flex-start;

  &:hover {
    background: #1a73e8;
    color: white;
  }
`;

export default BackButton;
