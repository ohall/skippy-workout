#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { join } from 'path';
import { initDb, getRecentPerformance, createSession, closeDb } from '../src/db.js';
import { getTodaysWorkout, getRecommendationsForWorkout, getWeeklySetTotals } from '../src/workout.js';
import { generateWorkoutPage } from '../src/page.js';

const WORKSPACE = process.env.OPENCLAW_WORKSPACE
  || process.env.HOME && join(process.env.HOME, '.openclaw', 'workspace')
  || process.cwd();

const dbPath = join(WORKSPACE, 'gym_progress.sqlite');
const db = initDb(dbPath);

const today = new Date();
const workout = getTodaysWorkout(today);
const dateStr = today.toISOString().slice(0, 10);

// Ensure today's session row exists
createSession(db, { date: dateStr, cycleDay: workout.cycleDay, workoutName: workout.name });

const recs = getRecommendationsForWorkout(workout, db);
const recent = getRecentPerformance(db, workout.name);
const weeklySets = getWeeklySetTotals();

const html = generateWorkoutPage({ today, workout, recs, recent, weeklySets });
const outputPath = join(WORKSPACE, 'gym_workout.html');
writeFileSync(outputPath, html);
console.log(`Workout page written to ${outputPath}`);

closeDb(db);
