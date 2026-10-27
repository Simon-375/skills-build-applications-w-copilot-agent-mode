import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type ActivityInput = { userId: string; teamId: string; type: string; minutes: number };
type TeamInput = { name: string; mascot: string; members?: string[] };

function recordFrom(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') throw Object.assign(new Error('Request body must be an object'), { status: 400 });
  return input as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw Object.assign(new Error(`${field} is required`), { status: 400 });
  return value.trim();
}

function objectId(value: unknown, field: string): string {
  const id = requiredString(value, field);
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error(`${field} must be a valid id`), { status: 400 });
  return id;
}

function positiveMinutes(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  return value;
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean().exec();
}

export async function createActivity(input: unknown) {
  const body = recordFrom(input) as Partial<ActivityInput>;
  const userId = objectId(body.userId, 'userId');
  const teamId = objectId(body.teamId, 'teamId');
  const type = requiredString(body.type, 'type');
  const minutes = positiveMinutes(body.minutes);
  const [user, team] = await Promise.all([User.findById(userId).exec(), Team.findById(teamId).exec()]);
  if (!user || !team) throw Object.assign(new Error('userId and teamId must reference existing records'), { status: 400 });
  const activity = await Activity.create({ user: user._id, team: team._id, type, minutes, points: minutes, occurredAt: new Date() });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean().exec();
}

export async function createTeam(input: unknown) {
  const body = recordFrom(input) as Partial<TeamInput>;
  const name = requiredString(body.name, 'name');
  const mascot = requiredString(body.mascot, 'mascot');
  const members = body.members ?? [];
  if (!Array.isArray(members) || members.some((member) => !mongoose.isValidObjectId(member))) {
    throw Object.assign(new Error('members must be an array of valid ids'), { status: 400 });
  }
  const existingMembers = members.length ? await User.countDocuments({ _id: { $in: members } }) : 0;
  if (existingMembers !== members.length) throw Object.assign(new Error('members must reference existing users'), { status: 400 });
  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((entry) => entry._id) } }).lean().exec();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.map((entry, index) => ({ teamName: names.get(entry._id.toString()) ?? 'Unknown team', totalPoints: entry.totalPoints, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = decodeURIComponent(userEmail).trim().toLowerCase();
  const user = await User.findOne({ email }).lean().exec();
  if (!user) throw Object.assign(new Error('No user found for that email'), { status: 404 });
  const latest = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean().exec();
  const focus = user.fitnessGoal || latest?.type;
  const workouts = await Workout.find(focus ? { focus } : {}).sort({ minutes: 1 }).lean().exec();
  const fallback = workouts.length ? workouts : await Workout.find().sort({ minutes: 1 }).lean().exec();
  return fallback.map((workout) => ({ ...workout, reason: `Recommended for ${focus ?? 'your recent activity'} goals and activity.` }));
}

export { User };
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  throw Object.assign(new Error('Activity validation is not implemented yet'), { status: 501 });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
