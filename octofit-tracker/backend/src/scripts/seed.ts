import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

async function upsertDemoUser(name: string, email: string, teamId: InstanceType<typeof Team>['_id'], fitnessGoal: string) {
  const previousUser = await User.findOne({ email }).select('_id team');
  if (previousUser?.team && previousUser.team.toString() !== teamId.toString()) {
    await Team.updateOne({ _id: previousUser.team }, { $pull: { members: previousUser._id } });
  }
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, email, team: teamId, fitnessGoal } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Team.updateOne({ _id: teamId }, { $addToSet: { members: user._id } });
  return user;
}

async function upsertDemoTeam(name: string, mascot: string) {
  return Team.findOneAndUpdate({ name }, { $set: { name, mascot }, $setOnInsert: { members: [] } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function seed() {
  await connectDatabase();
  try {
    const octocats = await upsertDemoTeam('Octocats', 'Mona');
    const robocats = await upsertDemoTeam('Robocats', 'Hubot');
    const codecats = await upsertDemoTeam('Codecats', 'Copilot');
    const devcats = await upsertDemoTeam('Devcats', 'Octo');
    const mona = await upsertDemoUser('Mona', 'mona@example.com', octocats._id, 'endurance');
    const hubot = await upsertDemoUser('Hubot', 'hubot@example.com', robocats._id, 'strength');
    const ada = await upsertDemoUser('Ada', 'ada@example.com', codecats._id, 'mobility');

    const records = [
      { user: mona._id, team: octocats._id, type: 'run', minutes: 40, points: 40, occurredAt: new Date('2026-01-10T12:00:00.000Z') },
      { user: hubot._id, team: robocats._id, type: 'cycle', minutes: 25, points: 25, occurredAt: new Date('2026-01-11T12:00:00.000Z') },
      { user: ada._id, team: codecats._id, type: 'stretch', minutes: 20, points: 20, occurredAt: new Date('2026-01-12T12:00:00.000Z') },
    ];
    for (const record of records) {
      await Activity.updateOne({ user: record.user, team: record.team, type: record.type, occurredAt: record.occurredAt }, { $set: record }, { upsert: true });
    }
    for (const workout of [
      { title: 'Intervals', focus: 'endurance', minutes: 30, difficulty: 'moderate' },
      { title: 'Strength Circuit', focus: 'strength', minutes: 30, difficulty: 'moderate' },
      { title: 'Mobility Flow', focus: 'mobility', minutes: 20, difficulty: 'easy' },
    ]) {
      await Workout.updateOne({ title: workout.title }, { $set: workout }, { upsert: true });
    }
    await Team.updateOne({ _id: devcats._id }, { $setOnInsert: { members: [] } });
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
