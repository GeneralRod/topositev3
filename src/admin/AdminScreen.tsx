// Beheerpagina (/beheer): alle accounts bekijken en de voortgang van een speler
// aanpassen (munten, prijzen, stickers, kast, prestaties, sterren). Alleen voor
// accounts met de rol 'admin' (tabel user_roles); de database controleert dat.

import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { BackLink, Button, colors, Page, PageTitle } from '../ui';
import { startAccount, useAccount } from '../account/session';
import { shelves, stickers, finishes, extras } from '../cabinet/catalog';
import { achievements } from '../game/achievements';
import type { SaveData } from '../storage';
import {
  getProgress,
  listPlayers,
  recentLog,
  saveProgress,
  useIsAdmin,
  type LogEntry,
  type Player,
  type PlayerProgress,
} from './api';
import {
  describeChanges,
  setCoins,
  setStars,
  starPackages,
  toggleItem,
  type ListField,
} from './edit';

const Wide = styled.div`
  width: 100%;
  max-width: 1100px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const Box = styled.section`
  background: white;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.2rem;
    color: ${colors.primary};
  }

  h3 {
    margin: 1rem 0 0.4rem 0;
    font-size: 1rem;
    color: ${colors.text};
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const Input = styled.input`
  font: inherit;
  padding: 0.5rem 0.7rem;
  border: 2px solid #dadce0;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.45rem 0.6rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }

  th {
    color: ${colors.muted};
    font-weight: 600;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background: #f1f6fe;
  }
`;

const Selected = styled.tr`
  background: #e8f0fe;
`;

const Checks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 0.25rem 1rem;

  label {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
`;

const Muted = styled.p`
  color: ${colors.muted};
  margin: 0;
`;

const Notice = styled.p<{ kind: 'error' | 'success' }>`
  margin: 0;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  background: ${(p) => (p.kind === 'error' ? '#fce8e6' : '#e6f4ea')};
  color: ${(p) => (p.kind === 'error' ? '#c5221f' : '#137333')};
`;

const Changes = styled.ul`
  margin: 0.25rem 0 0.75rem 0;
  padding-left: 1.25rem;
`;

function formatDate(value: string | null): string {
  if (!value) return '–';
  return new Date(value).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Er ging iets mis.';
}

const LIST_SECTIONS: {
  field: ListField;
  title: string;
  groups: { title: string; items: { id: string; name: string }[] }[];
}[] = [
  {
    field: 'prizes',
    title: 'Prijzen',
    groups: shelves.map((shelf) => ({ title: shelf.title, items: shelf.items })),
  },
  { field: 'stickers', title: 'Stickers', groups: [{ title: '', items: stickers }] },
  {
    field: 'upgrades',
    title: 'Kast-upgrades',
    groups: [{ title: '', items: [...finishes, ...extras] }],
  },
  { field: 'achievements', title: 'Prestaties', groups: [{ title: '', items: achievements }] },
];

const PlayerEditor: React.FC<{ userId: string; onSaved: () => void }> = ({ userId, onSaved }) => {
  const [original, setOriginal] = useState<PlayerProgress | null>(null);
  const [draft, setDraft] = useState<SaveData | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  // Telt op na opslaan, zodat de voortgang opnieuw wordt opgehaald.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getProgress(userId)
      .then((progress) => {
        if (cancelled) return;
        setOriginal(progress);
        setDraft(progress.data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setNotice({ kind: 'error', text: errorText(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  const changes = useMemo(() => describeChanges(original?.data ?? null, draft), [original, draft]);

  if (!original || !draft) {
    return (
      <Box>{notice ? <Notice kind="error">{notice.text}</Notice> : <Muted>Laden…</Muted>}</Box>
    );
  }

  const save = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await saveProgress(userId, draft, original.revision, reason);
      setNotice({
        kind: 'success',
        text: 'Opgeslagen. De speler krijgt het zodra de site de voortgang ophaalt (bij openen of terugkomen in het tabblad).',
      });
      setReason('');
      setVersion((n) => n + 1);
      onSaved();
    } catch (error) {
      setNotice({ kind: 'error', text: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Box>
        <h2>{original.email}</h2>
        {original.revision === null && (
          <Muted>
            Deze speler heeft nog geen voortgang online (nog nooit gespeeld met account).
          </Muted>
        )}
        <h3>Munten</h3>
        <Row>
          <Input
            type="number"
            min={0}
            value={draft.coins}
            onChange={(e) => setDraft(setCoins(draft, Number(e.target.value)))}
            style={{ width: '9rem' }}
          />
          {[-500, -100, 100, 500, 1000].map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              onClick={() => setDraft(setCoins(draft, draft.coins + amount))}
            >
              {amount > 0 ? '+' : ''}
              {amount}
            </Button>
          ))}
        </Row>
      </Box>

      {LIST_SECTIONS.map(({ field, title, groups }) => (
        <Box key={field}>
          <h2>{title}</h2>
          {groups.map((group) => (
            <div key={group.title}>
              {group.title && <h3>{group.title}</h3>}
              <Checks>
                {group.items.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={draft[field].includes(item.id)}
                      onChange={() => setDraft(toggleItem(draft, field, item.id))}
                    />
                    {item.name}
                  </label>
                ))}
              </Checks>
            </div>
          ))}
        </Box>
      ))}

      <Box>
        <h2>Sterren</h2>
        {starPackages().map(({ category, packages }) => (
          <div key={category}>
            <h3>{category}</h3>
            <Checks>
              {packages.map((pkg) => (
                <label key={pkg.id}>
                  <select
                    value={draft.stars[pkg.id] ?? 0}
                    onChange={(e) => setDraft(setStars(draft, pkg.id, Number(e.target.value)))}
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? '–' : '★'.repeat(n)}
                      </option>
                    ))}
                  </select>
                  {pkg.title}
                </label>
              ))}
            </Checks>
          </div>
        ))}
      </Box>

      <Box>
        <h2>Opslaan</h2>
        {changes.length === 0 ? (
          <Muted>Nog niets veranderd.</Muted>
        ) : (
          <Changes>
            {changes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </Changes>
        )}
        <Row style={{ marginTop: '0.5rem' }}>
          <Input
            placeholder="Reden (bijv. munten kwijt na nieuwe laptop)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ flex: 1, minWidth: '16rem' }}
          />
          <Button type="button" disabled={busy || changes.length === 0} onClick={() => void save()}>
            {busy ? 'Bezig…' : 'Opslaan'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || changes.length === 0}
            onClick={() => setDraft(original.data)}
          >
            Ongedaan maken
          </Button>
        </Row>
        {notice && (
          <div style={{ marginTop: '0.75rem' }}>
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        )}
      </Box>
    </>
  );
};

const AdminPanel: React.FC = () => {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listPlayers(), recentLog()])
      .then(([list, entries]) => {
        if (cancelled) return;
        setPlayers(list);
        setLog(entries);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorText(e));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const shown = (players ?? []).filter((p) =>
    p.email.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Wide>
      <Box>
        <h2>Accounts {players && `(${players.length})`}</h2>
        {error && <Notice kind="error">{error}</Notice>}
        <Row style={{ marginBottom: '0.75rem' }}>
          <Input
            type="search"
            placeholder="Zoek op e-mailadres"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </Row>
        {!players ? (
          <Muted>Laden…</Muted>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>E-mailadres</th>
                  <th>Munten</th>
                  <th>Prijzen</th>
                  <th>Pakketten met sterren</th>
                  <th>Bevestigd</th>
                  <th>Laatst ingelogd</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const Tr = p.userId === selected ? Selected : 'tr';
                  return (
                    <Tr key={p.userId} onClick={() => setSelected(p.userId)}>
                      <td>{p.email}</td>
                      <td>{p.coins}</td>
                      <td>{p.prizes}</td>
                      <td>{p.stars}</td>
                      <td>{p.confirmed ? 'ja' : 'nee'}</td>
                      <td>{formatDate(p.lastSignInAt)}</td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        {players && !selected && (
          <Muted style={{ marginTop: '0.75rem' }}>Klik op een account om het aan te passen.</Muted>
        )}
      </Box>

      {selected && (
        <PlayerEditor key={selected} userId={selected} onSaved={() => setVersion((n) => n + 1)} />
      )}

      <Box>
        <h2>Logboek</h2>
        {log.length === 0 ? (
          <Muted>Nog niets aangepast.</Muted>
        ) : (
          log.map((entry) => (
            <div key={entry.at} style={{ marginBottom: '0.75rem' }}>
              <strong>{formatDate(entry.at)}</strong> · {entry.email ?? 'verwijderd account'}
              {entry.reason && <> · “{entry.reason}”</>}
              <Changes>
                {describeChanges(entry.before, entry.after).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </Changes>
            </div>
          ))
        )}
      </Box>
    </Wide>
  );
};

const AdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const account = useAccount();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    void startAccount();
  }, []);

  let content: React.ReactNode;
  if (account.status === 'out') {
    content = (
      <Box>
        <Muted style={{ marginBottom: '1rem' }}>Log eerst in met het beheeraccount.</Muted>
        <Button type="button" onClick={() => navigate('/account')}>
          Naar inloggen
        </Button>
      </Box>
    );
  } else if (isAdmin === null) {
    content = <Muted>Even laden…</Muted>;
  } else if (!isAdmin) {
    content = (
      <Box>
        <Muted>Deze pagina is alleen voor de beheerder.</Muted>
      </Box>
    );
  } else {
    content = <AdminPanel />;
  }

  return (
    <Page>
      <BackLink onClick={() => navigate('/account')}>← Terug</BackLink>
      <PageTitle>Beheer</PageTitle>
      {content}
    </Page>
  );
};

export default AdminScreen;
