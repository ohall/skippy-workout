# skippy-workout

OpenClaw workout coach and progress tracker with a local web UI and SQLite storage.

## Install

```bash
cd skippy-workout
npm install
```

Or link globally for CLI access:

```bash
npm link
```

## Usage

### Generate today's workout page

```bash
node bin/cli.js
# or: skippy-workout
```

Writes `gym_workout.html` to the workspace directory.

### Start the web server

```bash
node bin/server.js
# or: skippy-workout-server
```

Serves the workout page on `http://0.0.0.0:8765/` — accessible from any device on your home network.

### OpenClaw cron integration

```bash
# In your cron wrapper:
skippy-workout && python3 ~/.../skippy-workout/scripts/send_link.py
```

## What it does

- 7-day rotating workout plan (quad focus, push, pull, mobility, posterior chain, upper hypertrophy, off)
- SQLite database with session history, exercise sets, and load recommendations
- Double progression: hit the top of your rep range, then increase weight next time
- Weekly volume tracking per muscle group
- Self-contained HTML page with dark theme, auto-refreshes every 5 minutes

## License

MIT
