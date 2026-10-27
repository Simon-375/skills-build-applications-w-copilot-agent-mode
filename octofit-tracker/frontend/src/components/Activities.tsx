import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity { type: string; minutes: number; points: number; occurredAt?: string }
interface ActivitiesResponse { activities: Activity[] }

export default function Activities() {
  const [data, setData] = useState<ActivitiesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getJson<ActivitiesResponse>('/api/activities').then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load activities')); }, []);
  return <section><h2>Activities</h2>{error ? <p role="alert">Unable to load activities: {error}</p> : !data ? <p role="status">Loading activities…</p> : data.activities.length === 0 ? <p>No activities yet.</p> : <div className="table-responsive"><table className="table table-striped"><caption className="visually-hidden">Recorded activities</caption><thead><tr><th scope="col">Type</th><th scope="col">Minutes</th><th scope="col">Points</th></tr></thead><tbody>{data.activities.map((activity, index) => <tr key={`${activity.type}-${activity.occurredAt ?? index}`}><td>{activity.type}</td><td>{activity.minutes}</td><td>{activity.points}</td></tr>)}</tbody></table></div>}</section>;
}
import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." />;
}
