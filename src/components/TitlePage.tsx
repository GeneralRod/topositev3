import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #0a0a1a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 5rem;
  color: white;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  margin-bottom: 3rem;
  font-weight: 700;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const StartButton = styled.button`
  background: linear-gradient(45deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 2rem;
    font-size: 1.25rem;
  }
`;

const TitlePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // De wereldbol wordt pas na de eerste weergave geladen, zodat titel en
  // startknop meteen zichtbaar zijn. Bij weggaan wordt alles gestopt.
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    const load = () =>
      import('./title/globeScene')
        .then(({ startGlobe }) => {
          if (!cancelled && canvasRef.current) stop = startGlobe(canvasRef.current);
        })
        .catch((error) => console.error('Wereldbol kon niet laden:', error));
    // Wacht tot de browser even niets te doen heeft (oudere Safari: korte pauze).
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(load, { timeout: 1000 })
      : window.setTimeout(load, 200);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      stop?.();
    };
  }, []);

  return (
    <Container>
      <Canvas ref={canvasRef} />
      <ContentWrapper>
        <Title>Topografiewereld</Title>
        <StartButton onClick={() => navigate('/categories')}>Start</StartButton>
      </ContentWrapper>
    </Container>
  );
};

export default TitlePage;
