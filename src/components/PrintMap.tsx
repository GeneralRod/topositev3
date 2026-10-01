import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { MapContainer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Category, GamePackage } from '../content/catalog';
import type { City } from '../data/cities';
import { numberPlaces, printBounds } from '../game/printMap';
import ShapeLayers from './map/ShapeLayers';
import WorldLayer from './map/WorldLayer';
import BaseLayer from './map/BaseLayer';
import { WATER_COLOR } from './map/mapSettings';
import { Button, colors } from '../ui';

// Oefenkaart printen (zie src/game/printMap.ts): een blinde kaart met nummers en
// invulregels, en op een tweede blad het antwoordblad. Printen (of opslaan als
// PDF) gaat met de printknop van de browser.

const printStyles = css`
  .oefenkaart-nummer {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #c62828;
    color: #202124;
    font: 700 11px/1 sans-serif;
    box-sizing: border-box;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    html,
    body,
    #root {
      height: auto !important;
      overflow: visible !important;
      background: white !important;
    }
    /* De app staat normaal vast op het scherm; bij printen moet alles mee. */
    #root > div,
    .oefenkaart-scroll {
      position: static !important;
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
      background: white !important;
      padding: 0 !important;
    }
    .geen-print {
      display: none !important;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

const Scroll = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: ${colors.background};
  padding: 1rem 0 3rem;
`;

const Toolbar = styled.div`
  width: 210mm;
  max-width: calc(100% - 32px);
  margin: 0 auto 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.text};
`;

/** Eén A4-blad: op het scherm een wit vel, bij printen gewoon de pagina. */
const Sheet = styled.section<{ newPage?: boolean }>`
  width: 210mm;
  max-width: calc(100% - 32px);
  min-height: 297mm;
  margin: 0 auto 1.5rem;
  padding: 12mm;
  box-sizing: border-box;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  color: #202124;
  font-family: sans-serif;

  @media print {
    width: auto;
    max-width: none;
    min-height: 0;
    margin: 0;
    padding: 0;
    box-shadow: none;
    ${(p) => (p.newPage ? 'break-before: page;' : '')}
  }
`;

const SheetTitle = styled.h1`
  font-size: 16pt;
  margin: 0 0 3mm;
`;

const Fields = styled.div`
  display: flex;
  gap: 8mm;
  font-size: 11pt;
  margin-bottom: 4mm;

  span {
    flex: 1;
    border-bottom: 1px solid #555;
    padding-bottom: 1mm;
  }
`;

const MapBox = styled.div`
  width: 100%;
  height: 125mm;
  border: 1px solid #999;

  .leaflet-control-zoom {
    display: none;
  }
`;

const Instruction = styled.p`
  font-size: 11pt;
  margin: 4mm 0 2mm;
`;

const Lines = styled.ol<{ columns: number }>`
  columns: ${(p) => p.columns};
  column-gap: 8mm;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 10.5pt;

  li {
    break-inside: avoid;
    display: flex;
    gap: 2mm;
    align-items: flex-end;
    height: 7.5mm;
  }
  b {
    min-width: 7mm;
    text-align: right;
  }
  span {
    flex: 1;
    border-bottom: 1px solid #888;
  }
`;

const Answers = styled.ol`
  columns: 2;
  column-gap: 10mm;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11pt;
  line-height: 1.7;

  b {
    display: inline-block;
    min-width: 8mm;
    text-align: right;
    margin-right: 2mm;
  }
`;

function numberIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="oefenkaart-nummer">${n}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

interface PrintMapProps {
  category: Category;
  pkg: GamePackage;
  places: City[];
  onBack: () => void;
}

const PrintMap: React.FC<PrintMapProps> = ({ category, pkg, places, onBack }) => {
  const [withAnswers, setWithAnswers] = useState(true);
  const numbered = useMemo(() => numberPlaces(places), [places]);
  const bounds = useMemo(() => printBounds(places), [places]);
  // Vormen en bergtoppen; steden zijn alleen een nummer.
  const shapes = useMemo(
    () => places.filter((p) => p.kind !== undefined && p.kind !== 'city'),
    [places],
  );
  const map = category.map;
  const title = `Oefenkaart ${category.title}: ${pkg.title}`;
  const columns = numbered.length > 24 ? 3 : 2;

  return (
    <Scroll className="oefenkaart-scroll">
      <Global styles={printStyles} />
      <Toolbar className="geen-print">
        <Button variant="outline" onClick={onBack}>
          Terug
        </Button>
        <Button onClick={() => window.print()}>Printen of opslaan als PDF</Button>
        <Check>
          <input
            type="checkbox"
            checked={withAnswers}
            onChange={(e) => setWithAnswers(e.target.checked)}
          />
          Antwoordblad meeprinten
        </Check>
      </Toolbar>

      <Sheet>
        <SheetTitle>{title}</SheetTitle>
        <Fields>
          <span>Naam:</span>
          <span>Klas:</span>
          <span>Datum:</span>
        </Fields>
        <MapBox>
          <MapContainer
            bounds={bounds}
            zoomSnap={0.1}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            preferCanvas
            style={{ height: '100%', width: '100%', background: WATER_COLOR }}
          >
            {map ? <BaseLayer load={map.loadBase} attribution={map.attribution} /> : <WorldLayer />}
            {category.loadShapes && shapes.length > 0 && (
              <ShapeLayers
                places={shapes}
                load={category.loadShapes}
                status={{}}
                onPick={() => {}}
                isOnLand={map?.isOnLand}
              />
            )}
            {numbered.map((place, i) => (
              <Marker
                key={place.name}
                position={[place.lat, place.lng]}
                icon={numberIcon(i + 1)}
                interactive={false}
              />
            ))}
          </MapContainer>
        </MapBox>
        <Instruction>
          Schrijf bij elk nummer de naam van {category.words.neuter ? 'het' : 'de'}{' '}
          {category.words.one}.
        </Instruction>
        <Lines columns={columns}>
          {numbered.map((place, i) => (
            <li key={place.name}>
              <b>{i + 1}.</b>
              <span />
            </li>
          ))}
        </Lines>
      </Sheet>

      {withAnswers && (
        <Sheet newPage>
          <SheetTitle>Antwoordblad: {pkg.title}</SheetTitle>
          <Instruction>{title}</Instruction>
          <Answers>
            {numbered.map((place, i) => (
              <li key={place.name}>
                <b>{i + 1}.</b>
                {place.name}
              </li>
            ))}
          </Answers>
        </Sheet>
      )}
    </Scroll>
  );
};

export default PrintMap;
