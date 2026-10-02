// De privacyverklaring (/privacy), in gewone taal voor kinderen en ouders.

import React from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import { BackLink, colors, Page, PageTitle } from '../ui';
import { PRIVACY } from './config';

const Article = styled.article`
  width: 100%;
  max-width: 720px;
  background: white;
  border-radius: 8px;
  padding: 2rem 2.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: ${colors.text};
  line-height: 1.6;
  text-align: left;

  h2 {
    font-size: 1.25rem;
    margin: 1.75rem 0 0.5rem 0;
    color: ${colors.primary};
  }

  p,
  ul {
    margin: 0 0 0.75rem 0;
  }

  ul {
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.3rem;
  }

  a {
    color: ${colors.primary};
  }
`;

const Updated = styled.p`
  color: ${colors.muted};
  font-size: 0.9rem;
`;

const Summary = styled.div`
  background: #e8f0fe;
  border-radius: 6px;
  padding: 1rem 1.25rem 0.25rem 1.25rem;
`;

const Contact: React.FC = () =>
  PRIVACY.contact ? (
    <a href={`mailto:${PRIVACY.contact}`}>{PRIVACY.contact}</a>
  ) : (
    <em>(e-mailadres volgt nog)</em>
  );

const PrivacyScreen: React.FC = () => {
  const navigate = useNavigate();
  const goBack = () => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (index > 0) navigate(-1);
    else navigate('/categories');
  };

  return (
    <Page>
      <BackLink onClick={goBack}>← Terug</BackLink>
      <PageTitle>Privacyverklaring</PageTitle>
      <Article>
        <Updated>Laatst bijgewerkt: {PRIVACY.updated}</Updated>

        <Summary>
          <p>
            <strong>Kort gezegd</strong>
          </p>
          <ul>
            <li>
              Je kunt oefenen zonder account. Dan krijgen wij niets van je: je voortgang staat
              alleen in je eigen browser.
            </li>
            <li>
              Maak je een account, dan bewaren we je e-mailadres en je voortgang, zodat je op elke
              computer verder kunt. Verder niets.
            </li>
            <li>Geen reclame, we volgen je niet en we verkopen of delen niets.</li>
            <li>Je kunt je account en alles wat we bewaren zelf verwijderen, wanneer je wilt.</li>
          </ul>
        </Summary>

        <h2>Wie zijn wij?</h2>
        <p>
          Topografiewereld is een gratis website om topografie te oefenen. Verantwoordelijk voor je
          gegevens is {PRIVACY.controller}. Vragen of verzoeken over je gegevens? Mail naar{' '}
          <Contact />.
        </p>

        <h2>Zonder account</h2>
        <p>
          Je voortgang (munten, prijzen, sterren en spellen) wordt alleen in je browser bewaard, op
          je eigen computer. Die gegevens komen niet bij ons. De website staat bij Netlify; zoals
          bij elke website ziet Netlify technische gegevens, zoals je IP-adres, om de pagina's naar
          je computer te kunnen sturen. We gebruiken geen cookies voor reclame of statistieken.
        </p>

        <h2>Met een account: wat bewaren we?</h2>
        <ul>
          <li>
            <strong>Je e-mailadres</strong>, om in te loggen en om je mails te sturen (account
            bevestigen, wachtwoord vergeten).
          </li>
          <li>
            <strong>Je wachtwoord</strong>, versleuteld. Wij kunnen het niet lezen.
          </li>
          <li>
            <strong>Je voortgang</strong>: munten, prijzen, stickers, hoe je prijzenkast eruitziet,
            sterren, spellen die je nog niet af hebt, plekken die je lastig vindt, de dagelijkse
            uitdaging, cijfers van de oefentoets en of je liever op de kaart of met meerkeuze
            speelt.
          </li>
          <li>
            Wanneer je account is gemaakt, wanneer je voor het laatst inlogde en wanneer je
            voortgang voor het laatst veranderde.
          </li>
        </ul>
        <p>We vragen geen naam, adres, geboortedatum of school.</p>
        <p>
          De beheerder van de site kan je voortgang bekijken en aanpassen, bijvoorbeeld om munten
          terug te geven als je die kwijt bent. Elke aanpassing wordt bijgehouden in een logboek,
          dat ook verdwijnt als je je account verwijdert.
        </p>

        <h2>Waarom mogen we dit?</h2>
        <p>
          Omdat je toestemming geeft als je een account maakt. Ben je jonger dan 16, dan moet je
          ouder of verzorger toestemming geven; daarom maakt die het account samen met jou en vult
          die het e-mailadres in. Je kunt je toestemming altijd intrekken door je account te
          verwijderen.
        </p>

        <h2>Waar staan je gegevens?</h2>
        <p>
          Bij Supabase, op servers in Frankfurt (Duitsland), dus in de Europese Unie. Supabase
          bewaart de gegevens alleen voor ons en gebruikt ze niet zelf. De mails worden verstuurd
          via {PRIVACY.mailService}. De verbinding met de website is versleuteld, en iedereen kan
          alleen zijn eigen voortgang zien.
        </p>

        <h2>Hoe lang?</h2>
        <p>
          Zolang je account bestaat. Verwijder je je account, dan worden je e-mailadres en al je
          voortgang meteen verwijderd.
        </p>

        <h2>Wat mag jij?</h2>
        <ul>
          <li>
            <strong>Zien wat we bewaren:</strong> kies op <Link to="/account">Mijn account</Link>{' '}
            voor "Download mijn gegevens".
          </li>
          <li>
            <strong>Alles verwijderen:</strong> kies op <Link to="/account">Mijn account</Link> voor
            "Account verwijderen".
          </li>
          <li>
            <strong>Iets laten verbeteren</strong>, zoals je e-mailadres: mail naar <Contact />.
          </li>
          <li>
            <strong>Een klacht indienen</strong> bij de{' '}
            <a
              href="https://autoriteitpersoonsgegevens.nl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Autoriteit Persoonsgegevens
            </a>
            , als je vindt dat we niet goed met je gegevens omgaan. Mail ons gerust eerst.
          </li>
        </ul>
      </Article>
    </Page>
  );
};

export default PrivacyScreen;
