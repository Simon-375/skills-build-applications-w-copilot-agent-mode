import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team { name: string; mascot?: string; members?: string[] }
interface TeamsResponse { teams: Team[] }

export default function Teams() {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getJson<TeamsResponse>('/api/teams').then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load teams')); }, []);
  return <section><h2>Teams</h2>{error ? <p role="alert">Unable to load teams: {error}</p> : !data ? <p role="status">Loading teams…</p> : data.teams.length === 0 ? <p>No teams yet.</p> : <div className="row g-3">{data.teams.map((team) => <div className="col-md-6" key={team.name}><article className="card h-100"><div className="card-body"><h3 className="h5">{team.name}</h3><p className="mb-1">Mascot: {team.mascot ?? '—'}</p><p className="mb-0">Members: {team.members?.length ?? 0}</p></div></article></div>)}</div>}</section>;
}
import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard title="Teams" description="Manage teams and members." />;
}
