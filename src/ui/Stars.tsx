import React from 'react';
import styled from '@emotion/styled';

const Row = styled.span<{ size: number }>`
  display: inline-flex;
  gap: 2px;
  font-size: ${(p) => p.size}px;
  line-height: 1;
  letter-spacing: 0;
`;

const Star = styled.span<{ on: boolean }>`
  color: ${(p) => (p.on ? '#f7b500' : '#d7dbe0')};
  text-shadow: ${(p) => (p.on ? '0 1px 0 #c48f10' : 'none')};
`;

/** Drie sterren, waarvan `count` gekleurd. */
const Stars: React.FC<{ count: number; size?: number }> = ({ count, size = 20 }) => (
  <Row size={size} role="img" aria-label={`${count} van de 3 sterren`}>
    {[1, 2, 3].map((n) => (
      <Star key={n} on={n <= count}>
        ★
      </Star>
    ))}
  </Row>
);

export default Stars;
