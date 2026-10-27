import { Router, type Request, type Response } from 'express';
import { createActivity, createTeam, getLeaderboard, listActivities, listTeams, suggestWorkouts } from '../services/octofitService.js';

export const apiRouter = Router();

function sendError(response: Response, error: unknown) {
  const candidate = error as { status?: unknown; message?: unknown };
  const status = typeof candidate.status === 'number' ? candidate.status : 500;
  const message = typeof candidate.message === 'string' ? candidate.message : 'Internal server error';
  response.status(status).json({ error: message });
}

apiRouter.get('/activities', async (_request: Request, response: Response) => {
  try { response.json({ activities: await listActivities() }); } catch (error: unknown) { sendError(response, error); }
});
apiRouter.post('/activities', async (request: Request, response: Response) => {
  try { response.status(201).json({ activity: await createActivity(request.body) }); } catch (error: unknown) { sendError(response, error); }
});
apiRouter.get('/teams', async (_request: Request, response: Response) => {
  try { response.json({ teams: await listTeams() }); } catch (error: unknown) { sendError(response, error); }
});
apiRouter.post('/teams', async (request: Request, response: Response) => {
  try { response.status(201).json({ team: await createTeam(request.body) }); } catch (error: unknown) { sendError(response, error); }
});
apiRouter.get('/leaderboard', async (_request: Request, response: Response) => {
  try { response.json({ leaderboard: await getLeaderboard() }); } catch (error: unknown) { sendError(response, error); }
});
apiRouter.get('/workouts/suggestions/:userEmail', async (request: Request, response: Response) => {
  try { response.json({ suggestions: await suggestWorkouts(String(request.params.userEmail)) }); } catch (error: unknown) { sendError(response, error); }
});
