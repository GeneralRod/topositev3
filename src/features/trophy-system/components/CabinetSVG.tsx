import React from 'react';
import styled from '@emotion/styled';

const StyledSVG = styled.svg`
  display: block;
  margin: 0 auto;
`;

/**
 * A semi-realistic, vector-style wooden cabinet illustration with open doors and shelves.
 * Uses gradients and shadows for depth.
 */
const CabinetSVG: React.FC = () => (
  <StyledSVG
    width="800"
    height="500"
    viewBox="0 0 800 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="woodBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2b77a" />
        <stop offset="100%" stopColor="#a97c50" />
      </linearGradient>
      <linearGradient id="woodDoor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e2b77a" />
        <stop offset="100%" stopColor="#b88a5a" />
      </linearGradient>
      <radialGradient id="shadow" cx="0.5" cy="0.7" r="0.7">
        <stop offset="0%" stopColor="#000" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Main cabinet body */}
    <rect
      x="180"
      y="80"
      width="440"
      height="340"
      rx="36"
      fill="url(#woodBody)"
      stroke="#7c5a2a"
      strokeWidth="8"
    />
    {/* Shadow inside cabinet */}
    <ellipse cx="400" cy="320" rx="180" ry="60" fill="url(#shadow)" />
    {/* Left door */}
    <rect
      x="40"
      y="80"
      width="140"
      height="340"
      rx="28"
      fill="url(#woodDoor)"
      stroke="#7c5a2a"
      strokeWidth="8"
    />
    {/* Right door */}
    <rect
      x="620"
      y="80"
      width="140"
      height="340"
      rx="28"
      fill="url(#woodDoor)"
      stroke="#7c5a2a"
      strokeWidth="8"
    />
    {/* Top arch with improved connection */}
    <path d="M180 80 Q400 10 620 80" fill="url(#woodBody)" stroke="#7c5a2a" strokeWidth="8" />
    {/* Additional roof pieces to connect edges */}
    <path d="M180 80 L180 90" stroke="#7c5a2a" strokeWidth="8" />
    <path d="M620 80 L620 90" stroke="#7c5a2a" strokeWidth="8" />
    {/* Shelves - clear and prominent */}
    <rect
      x="210"
      y="340"
      width="380"
      height="22"
      rx="7"
      fill="#f5e1b7"
      stroke="#a97c50"
      strokeWidth="4"
    />
    <rect
      x="210"
      y="260"
      width="380"
      height="22"
      rx="7"
      fill="#f5e1b7"
      stroke="#a97c50"
      strokeWidth="4"
    />
    <rect
      x="210"
      y="180"
      width="380"
      height="22"
      rx="7"
      fill="#f5e1b7"
      stroke="#a97c50"
      strokeWidth="4"
    />
    {/* Door details */}
    <ellipse cx="110" cy="250" rx="20" ry="20" fill="#c49a6c" />
    <ellipse cx="690" cy="250" rx="20" ry="20" fill="#c49a6c" />
    {/* Door handles */}
    <ellipse cx="170" cy="250" rx="8" ry="14" fill="#a67c52" />
    <ellipse cx="630" cy="250" rx="8" ry="14" fill="#a67c52" />
  </StyledSVG>
);

export default CabinetSVG;
