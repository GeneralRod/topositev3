// Het accountscherm (/account): inloggen, account maken, wachtwoord vergeten,
// nieuw wachtwoord kiezen en uitloggen.

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSaveData } from '../storage';
import { BackLink, Button, colors, Page, PageTitle } from '../ui';
import {
  adoptKeptGuest,
  deleteAccount,
  getKeptGuest,
  sendPasswordReset,
  setNewPassword,
  signIn,
  signOut,
  signUp,
  startAccount,
  useAccount,
  type Result,
} from './session';
import { linkErrorMessage, passwordProblem } from './messages';
import { useSyncStatus, type SyncStatus } from './sync';
import { MIN_PASSWORD_LENGTH } from './config';
import { progressSummary } from './guest';
import { useIsAdmin } from '../admin/api';

const Panel = styled.div`
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-top: 4px solid ${colors.primary};
  text-align: left;
  margin-bottom: 2rem;
`;

const Intro = styled.p`
  color: ${colors.muted};
  max-width: 440px;
  text-align: center;
  margin: -1rem 0 1.5rem 0;
  line-height: 1.5;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 1.5rem;
  background: #f1f3f4;
  border-radius: 999px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.active ? colors.primary : 'transparent')};
  color: ${(p) => (p.active ? 'white' : colors.primary)};

  &:hover {
    background: ${(p) => (p.active ? colors.primary : '#e8f0fe')};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: ${colors.text};
  font-weight: 600;
`;

const Input = styled.input`
  font: inherit;
  font-weight: normal;
  padding: 0.7rem 0.8rem;
  border: 2px solid #dadce0;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const CheckLabel = styled.label`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  color: ${colors.text};
  font-size: 0.95rem;
  line-height: 1.4;

  input {
    margin-top: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
  }
`;

const SubmitButton = styled(Button)`
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const LinkButton = styled.button`
  align-self: center;
  background: none;
  border: none;
  padding: 0.25rem;
  color: ${colors.primary};
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: underline;
`;

const Notice = styled.p<{ kind: 'error' | 'success' }>`
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  line-height: 1.45;
  background: ${(p) => (p.kind === 'error' ? '#fce8e6' : '#e6f4ea')};
  color: ${(p) => (p.kind === 'error' ? '#c5221f' : '#137333')};
`;

const Muted = styled.p`
  margin: 0;
  color: ${colors.muted};
  line-height: 1.5;
`;

const Email = styled.strong`
  word-break: break-all;
`;

const FooterLink = styled(Link)`
  color: ${colors.muted};
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

type View = 'login' | 'signup' | 'forgot';

/** Houdt bij of een formulier bezig is en wat de uitkomst was. */
function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async <R extends Result>(action: () => Promise<R>): Promise<R> => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) setError(result.message);
    return result;
  };
  return { busy, error, setError, submit };
}

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
}> = ({ label, value, onChange, autoComplete }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Label>
        {label}
        <Input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          minLength={autoComplete === 'new-password' ? MIN_PASSWORD_LENGTH : undefined}
        />
      </Label>
      <CheckLabel>
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        Laat wachtwoord zien
      </CheckLabel>
    </>
  );
};

const EmailField: React.FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange,
}) => (
  <Label>
    E-mailadres
    <Input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="email"
      required
    />
  </Label>
);

const LoginForm: React.FC<{
  email: string;
  setEmail: (v: string) => void;
  onForgot: () => void;
}> = ({ email, setEmail, onForgot }) => {
  const [password, setPassword] = useState('');
  const { busy, error, submit } = useSubmit();
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(() => signIn(email, password));
      }}
    >
      <EmailField value={email} onChange={setEmail} />
      <PasswordField
        label="Wachtwoord"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton type="submit" disabled={busy}>
        {busy ? 'Bezig…' : 'Inloggen'}
      </SubmitButton>
      <LinkButton type="button" onClick={onForgot}>
        Wachtwoord vergeten?
      </LinkButton>
    </Form>
  );
};

const SignUpForm: React.FC<{ email: string; setEmail: (v: string) => void }> = ({
  email,
  setEmail,
}) => {
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { busy, error, setError, submit } = useSubmit();

  if (sentTo) {
    return (
      <Notice kind="success">
        Bijna klaar! We hebben een mail gestuurd naar <Email>{sentTo}</Email>. Klik op de link in
        die mail om je account te bevestigen. Zie je niets? Kijk ook bij ongewenste mail.
      </Notice>
    );
  }

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = passwordProblem(password);
        if (problem) return setError(problem);
        const result = await submit(() => signUp(email, password));
        if (result.ok && 'checkMail' in result) setSentTo(email.trim());
      }}
    >
      <EmailField value={email} onChange={setEmail} />
      <PasswordField
        label={`Kies een wachtwoord (minstens ${MIN_PASSWORD_LENGTH} tekens)`}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <CheckLabel>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span>
          Ik ben 16 jaar of ouder, of mijn ouder of verzorger maakt dit account samen met mij en
          vult zijn of haar e-mailadres in. We bewaren alleen het e-mailadres en je voortgang (lees
          de{' '}
          <a href="/privacy" target="_blank" rel="noopener">
            privacyverklaring
          </a>
          ).
        </span>
      </CheckLabel>
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton type="submit" disabled={busy || !consent}>
        {busy ? 'Bezig…' : 'Account maken'}
      </SubmitButton>
    </Form>
  );
};

const ForgotForm: React.FC<{
  email: string;
  setEmail: (v: string) => void;
  onBack: () => void;
}> = ({ email, setEmail, onBack }) => {
  const [sent, setSent] = useState(false);
  const { busy, error, submit } = useSubmit();
  if (sent) {
    return (
      <Form as="div">
        <Notice kind="success">
          Als er een account is met <Email>{email.trim()}</Email>, krijg je een mail met een link om
          een nieuw wachtwoord te kiezen.
        </Notice>
        <LinkButton type="button" onClick={onBack}>
          Terug naar inloggen
        </LinkButton>
      </Form>
    );
  }
  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        if ((await submit(() => sendPasswordReset(email))).ok) setSent(true);
      }}
    >
      <Muted>
        Vul je e-mailadres in. Je krijgt een mail met een link om een nieuw wachtwoord te kiezen.
      </Muted>
      <EmailField value={email} onChange={setEmail} />
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton type="submit" disabled={busy}>
        {busy ? 'Bezig…' : 'Stuur mail'}
      </SubmitButton>
      <LinkButton type="button" onClick={onBack}>
        Terug naar inloggen
      </LinkButton>
    </Form>
  );
};

const NewPasswordForm: React.FC<{ onDone: () => void; onCancel?: () => void }> = ({
  onDone,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const { busy, error, setError, submit } = useSubmit();
  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = passwordProblem(password);
        if (problem) return setError(problem);
        if ((await submit(() => setNewPassword(password))).ok) onDone();
      }}
    >
      <PasswordField
        label={`Nieuw wachtwoord (minstens ${MIN_PASSWORD_LENGTH} tekens)`}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton type="submit" disabled={busy}>
        {busy ? 'Bezig…' : 'Wachtwoord opslaan'}
      </SubmitButton>
      {onCancel && (
        <LinkButton type="button" onClick={onCancel}>
          Annuleren
        </LinkButton>
      )}
    </Form>
  );
};

/** Een bestand met alles wat er van je bewaard wordt (recht op inzage, AVG). */
function downloadData(email: string): void {
  const content = JSON.stringify(
    { account: email, gedownload: new Date().toISOString(), voortgang: getSaveData() },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'topografiewereld-mijn-gegevens.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0.5rem 0;
`;

const DeleteAccount: React.FC<{ onDeleted: () => void }> = ({ onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const { busy, error, submit } = useSubmit();
  if (!confirming) {
    return (
      <LinkButton
        type="button"
        onClick={() => setConfirming(true)}
        style={{ color: colors.danger }}
      >
        Account verwijderen
      </LinkButton>
    );
  }
  return (
    <>
      <Notice kind="error">
        Weet je het zeker? Je account en al je voortgang (munten, prijzen, sterren) worden voorgoed
        verwijderd, online én op deze computer. Dit kan niet ongedaan worden gemaakt.
      </Notice>
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton
        type="button"
        variant="danger"
        disabled={busy}
        onClick={async () => {
          if ((await submit(deleteAccount)).ok) onDeleted();
        }}
      >
        {busy ? 'Bezig…' : 'Ja, verwijder mijn account'}
      </SubmitButton>
      <LinkButton type="button" onClick={() => setConfirming(false)}>
        Nee, toch niet
      </LinkButton>
    </>
  );
};

/** Na "nee, van iemand anders" bij het inloggen: toch van jou? Dan alsnog erbij. */
const KeptGuest: React.FC = () => {
  const [kept, setKept] = useState(getKeptGuest);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  if (added)
    return <Notice kind="success">De voortgang van deze computer staat nu op je account.</Notice>;
  if (!kept) return null;
  return (
    <>
      <Muted style={{ fontSize: '0.9rem' }}>
        Op deze computer staat ook voortgang die je niet op je account hebt gezet (
        {progressSummary(kept)}). Na uitloggen staat die er weer.
      </Muted>
      <SubmitButton
        type="button"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await adoptKeptGuest();
          setBusy(false);
          setKept(null);
          setAdded(true);
        }}
      >
        {busy ? 'Bezig…' : 'Is toch van mij: zet het op mijn account'}
      </SubmitButton>
    </>
  );
};

const SignedIn: React.FC<{
  email: string;
  recovering: boolean;
  onLeave: (message: string) => void;
}> = ({ email, recovering, onLeave }) => {
  const [changing, setChanging] = useState(recovering);
  const [saved, setSaved] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const { busy, error, submit } = useSubmit();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  if (changing) {
    return (
      <>
        <Muted style={{ marginBottom: '1rem' }}>
          Kies een nieuw wachtwoord voor <Email>{email}</Email>.
        </Muted>
        <NewPasswordForm
          onDone={() => {
            setChanging(false);
            setSaved(true);
          }}
          onCancel={() => setChanging(false)}
        />
      </>
    );
  }

  const logOut = async (force: boolean) => {
    const result = await submit(() => signOut(force));
    setUnsaved(!result.ok && 'unsaved' in result);
    if (result.ok) onLeave('Je bent uitgelogd.');
  };

  return (
    <Form as="div">
      <Muted>
        Je bent ingelogd als <Email>{email}</Email>.
      </Muted>
      <SyncNotice />
      <KeptGuest />
      {isAdmin && (
        <SubmitButton type="button" variant="outline" onClick={() => navigate('/beheer')}>
          🛠️ Naar beheer
        </SubmitButton>
      )}
      {saved && <Notice kind="success">Je nieuwe wachtwoord is opgeslagen.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton type="button" variant="outline" onClick={() => setChanging(true)}>
        Wachtwoord wijzigen
      </SubmitButton>
      {unsaved ? (
        <SubmitButton type="button" variant="danger" disabled={busy} onClick={() => logOut(true)}>
          {busy ? 'Bezig…' : 'Toch uitloggen'}
        </SubmitButton>
      ) : (
        <SubmitButton type="button" disabled={busy} onClick={() => logOut(false)}>
          {busy ? 'Bezig…' : 'Uitloggen'}
        </SubmitButton>
      )}
      <Muted style={{ fontSize: '0.9rem' }}>
        Na uitloggen staat je voortgang niet meer op deze computer. Log weer in om verder te gaan.
      </Muted>
      <Divider />
      <LinkButton type="button" onClick={() => downloadData(email)}>
        Download mijn gegevens
      </LinkButton>
      <DeleteAccount onDeleted={() => onLeave('Je account en al je voortgang zijn verwijderd.')} />
    </Form>
  );
};

const SYNC_TEXT: Record<
  SyncStatus,
  { kind: 'success' | 'waiting' | 'error'; text: string } | null
> = {
  off: null,
  saved: { kind: 'success', text: '✓ Je voortgang is online bewaard.' },
  pending: { kind: 'waiting', text: 'Je voortgang wordt bewaard…' },
  offline: {
    kind: 'error',
    text: 'Je voortgang is nog niet online bewaard: geen verbinding. Dat gebeurt vanzelf zodra er weer internet is.',
  },
};

const SyncBox = styled.p<{ kind: 'success' | 'waiting' | 'error' }>`
  margin: 0;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  font-size: 0.95rem;
  line-height: 1.45;
  background: ${(p) =>
    p.kind === 'success' ? '#e6f4ea' : p.kind === 'error' ? '#fef7e0' : '#f1f3f4'};
  color: ${(p) => (p.kind === 'success' ? '#137333' : p.kind === 'error' ? '#b06000' : colors.muted)};
`;

/** Staat alles online? */
const SyncNotice: React.FC = () => {
  const info = SYNC_TEXT[useSyncStatus()];
  return info && <SyncBox kind={info.kind}>{info.text}</SyncBox>;
};

const AccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useAccount();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  // Fout uit een verlopen maillink; één keer lezen, Supabase haalt de # daarna weg.
  const [linkError] = useState(() => linkErrorMessage(window.location.hash));
  // Melding na uitloggen of verwijderen.
  const [leftMessage, setLeftMessage] = useState<string | null>(null);
  const recovering = new URLSearchParams(location.search).has('herstel');

  useEffect(() => {
    void startAccount();
  }, []);

  const goBack = () => {
    // Via een maillink binnengekomen: dan is er geen vorige pagina op deze site.
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (index > 0) navigate(-1);
    else navigate('/categories');
  };

  return (
    <Page>
      <BackLink onClick={goBack}>← Terug</BackLink>
      <PageTitle>Mijn account</PageTitle>
      {account.status !== 'in' && (
        <Intro>
          Je hebt geen account nodig om te oefenen. Met een account bewaren we je munten, prijzen en
          sterren ook online, zodat je op elke computer verder kunt.
        </Intro>
      )}
      <Panel>
        {account.status === 'loading' && <Muted>Even laden…</Muted>}
        {account.status === 'in' && (
          <SignedIn email={account.email} recovering={recovering} onLeave={setLeftMessage} />
        )}
        {account.status === 'out' && (
          <>
            {leftMessage && (
              <Notice kind="success" style={{ marginBottom: '1rem' }}>
                {leftMessage}
              </Notice>
            )}
            {linkError && !leftMessage && (
              <Notice kind="error" style={{ marginBottom: '1rem' }}>
                {linkError}
              </Notice>
            )}
            {view !== 'forgot' && (
              <Tabs role="tablist">
                <Tab
                  type="button"
                  role="tab"
                  aria-selected={view === 'login'}
                  active={view === 'login'}
                  onClick={() => setView('login')}
                >
                  Inloggen
                </Tab>
                <Tab
                  type="button"
                  role="tab"
                  aria-selected={view === 'signup'}
                  active={view === 'signup'}
                  onClick={() => setView('signup')}
                >
                  Account maken
                </Tab>
              </Tabs>
            )}
            {view === 'login' && (
              <LoginForm email={email} setEmail={setEmail} onForgot={() => setView('forgot')} />
            )}
            {view === 'signup' && <SignUpForm email={email} setEmail={setEmail} />}
            {view === 'forgot' && (
              <ForgotForm email={email} setEmail={setEmail} onBack={() => setView('login')} />
            )}
          </>
        )}
      </Panel>
      <FooterLink to="/privacy">Privacyverklaring</FooterLink>
    </Page>
  );
};

export default AccountScreen;
