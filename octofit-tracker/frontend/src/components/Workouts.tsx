import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Workout { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string }
interface WorkoutsResponse { suggestions: Workout[] }

export default function Workouts() {
  const [data, setData] = useState<WorkoutsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const email = encodeURIComponent('mona@example.com'); getJson<WorkoutsResponse>(`/api/workouts/suggestions/${email}`).then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load workout suggestions')); }, []);
  return <section><h2>Workout suggestions</h2>{error ? <p role="alert">Unable to load workout suggestions: {error}</p> : !data ? <p role="status">Loading workout suggestions…</p> : data.suggestions.length === 0 ? <p>No workout suggestions yet.</p> : <div className="row g-3">{data.suggestions.map((workout) => <div className="col-md-6" key={workout.title}><article className="card h-100"><div className="card-body"><h3 className="h5">{workout.title}</h3><p className="mb-1">{workout.minutes ?? 'Flexible'} minutes · {workout.difficulty ?? 'Custom'}</p><p className="mb-0">{workout.reason ?? `Focus: ${workout.focus ?? 'general fitness'}`}</p></div></article></div>)}</div>}</section>;
}
import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." />;
}
