import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { FaCoins } from 'react-icons/fa';
import { Button } from '../ui';
import type { CabinetItem } from './catalog';
import { PrizeArt, StickerArt } from './art';

export interface Selection {
  kind: 'prize' | 'sticker';
  item: CabinetItem;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(40, 25, 10, 0.55);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Dialog = styled.div`
  width: min(380px, 100%);
  background: #fffaf0;
  border: 4px solid #8b5a2b;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
`;

const Name = styled.h2`
  color: #6b4226;
  font-size: 1.5rem;
`;

const Description = styled.p`
  color: #5f6368;
`;

const Price = styled.p`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #6b4226;

  svg {
    color: #e0a526;
  }
`;

const Message = styled.p<{ tone: 'good' | 'info' }>`
  font-weight: 600;
  color: ${(p) => (p.tone === 'good' ? '#2b7f40' : '#b0552b')};
`;

const BuyButton = styled(Button)`
  background: #3aa655;
  border-color: #3aa655;
  font-size: 1.15rem;
  padding: 0.6rem 1.4rem;

  &:hover:not(:disabled) {
    background: #2b7f40;
    border-color: #2b7f40;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

interface BuyDialogProps {
  selection: Selection;
  coins: number;
  owned: boolean;
  onBuy: () => void;
  onClose: () => void;
}

const BuyDialog: React.FC<BuyDialogProps> = ({ selection, coins, owned, onBuy, onClose }) => {
  const { item, kind } = selection;
  const canAfford = coins >= item.price;

  // Sluiten met Escape
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {kind === 'prize' ? (
          <PrizeArt id={item.id} size={140} />
        ) : (
          <StickerArt id={item.id} size={140} />
        )}
        <Name>{item.name}</Name>
        <Description>{item.description}</Description>
        {owned ? (
          <>
            <Message tone="good">
              {kind === 'prize' ? 'Deze staat al in je kast!' : 'Deze sticker zit al op je kast!'}
            </Message>
            <Buttons>
              <Button onClick={onClose}>Mooi!</Button>
            </Buttons>
          </>
        ) : (
          <>
            <Price>
              <FaCoins /> {item.price} munten
            </Price>
            {!canAfford && (
              <Message tone="info">
                Je hebt nog {item.price - coins} munten nodig. Speel nog een pakket!
              </Message>
            )}
            <Buttons>
              {canAfford && (
                <BuyButton onClick={onBuy} autoFocus>
                  Kopen!
                </BuyButton>
              )}
              <Button variant="outline" onClick={onClose}>
                {canAfford ? 'Nee, toch niet' : 'Oké'}
              </Button>
            </Buttons>
          </>
        )}
      </Dialog>
    </Overlay>
  );
};

export default BuyDialog;
