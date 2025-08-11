# 🚀 Gym Management System

> A centralized dashboard to manage Shape Up cycles, teams, pitches, and progress with clarity and precision.

## 📌 Overview

**Shape Up: Command Center** is a modern web application built to help teams implement the **Shape Up methodology** by Basecamp. This tool simplifies the process of managing bets, cycles, pitches, and team responsibilities — all in one place.

## 🎯 Key Features

- 🕒 **Cycle Management**: Visualize active, upcoming, and completed cycles.
- 🧠 **Pitch Tracking**: Create, edit, and assign pitches to teams.
- 👥 **Team Collaboration**: Track who’s working on what and when.
- 📊 **Progress Overview**: View burndowns and delivery timelines at a glance.
- 📝 **Shaping & Betting Board**: Plan pitches and document shaped work.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand / React Context
- **Deployment**: Vercel / Netlify / Custom

## 🚧 Project Structure

```
├── src/
│   ├── components/        # UI Components
│   ├── pages/             # Page views (Dashboard, Pitches, etc.)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Helper functions
│   └── supabase/          # Supabase client setup
├── public/                # Static assets
├── .env                   # Environment variables (API keys etc.)
├── bun.lockb              # Bun package lock
└── README.md              # You're here!
```

## 🔐 Environment Setup

Create a `.env` file in the root with the following:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧑‍💻 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/goushithm22/shape-up-command-center.git


## 📚 Learn More

- [Shape Up by Basecamp](https://basecamp.com/shapeup)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contributions

PRs are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

MIT © [M Goushith](https://github.com/goushithm22)
