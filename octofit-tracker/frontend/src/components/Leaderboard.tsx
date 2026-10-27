import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Ranking { teamName: string; totalPoints: number; rank: number }
interface LeaderboardResponse { leaderboard: Ranking[] }

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getJson<LeaderboardResponse>('/api/leaderboard').then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load leaderboard')); }, []);
  return <section><h2>Leaderboard</h2>{error ? <p role="alert">Unable to load leaderboard: {error}</p> : !data ? <p role="status">Loading leaderboard…</p> : data.leaderboard.length === 0 ? <p>No leaderboard rankings yet.</p> : <div className="table-responsive"><table className="table table-hover"><caption className="visually-hidden">Team leaderboard</caption><thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead><tbody>{data.leaderboard.map((ranking) => <tr key={ranking.teamName}><th scope="row">{ranking.rank}</th><td>{ranking.teamName}</td><td>{ranking.totalPoints}</td></tr>)}</tbody></table></div>}</section>;
}
import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." />;
}
