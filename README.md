# ⚡ Pulse — Personal Productivity & Focus Studio

A full-stack dark-mode glassmorphism productivity app with a Pomodoro timer, task manager, and analytics dashboard.

## 🧱 Tech Stack

| Layer     | Tech                                         |
|-----------|----------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion  |
| Charts    | Recharts                                     |
| Backend   | Node.js, Express 4                           |
| Database  | MongoDB (Mongoose)                           |
| Auth      | JWT + bcryptjs                               |

## 📁 Project Structure

```
25070521345/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── api/         # Axios instance with auth interceptor
│   │   ├── components/  # Navbar, ProtectedRoute
│   │   ├── context/     # AuthContext (JWT)
│   │   └── pages/       # Login, Register, Dashboard, Pomodoro, Analytics
│   └── package.json
└── server/          # Express backend
    ├── src/
    │   ├── models/      # User, Task, FocusSession (Mongoose)
    │   ├── routes/      # auth, tasks, focus
    │   └── middleware/  # JWT auth
    ├── .env
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** v18+ — https://nodejs.org
2. **MongoDB Community Server** — https://www.mongodb.com/try/download/community
   - Install MongoDB and make sure it's running as a Windows Service
   - Default connection: `mongodb://localhost:27017/pulse`
3. Optionally install **MongoDB Compass** for a GUI: https://www.mongodb.com/try/download/compass

### Start the Server

```bash
cd server
npm install       # already done
npm run dev       # starts on http://localhost:5000
```

### Start the Client

```bash
cd client
npm install       # already done
npm run dev       # starts on http://localhost:5173
```

Open your browser at **http://localhost:5173**

## ✨ Features

- 🔐 **Auth** — Register & Login with JWT, passwords bcrypt-hashed in MongoDB
- 🏠 **Dashboard** — Live animated clock, rotating motivational quotes, task CRUD with priorities
- ⏱️ **Pomodoro Timer** — SVG progress ring, 25/5/15 minute modes, session logging to DB
- 📊 **Analytics** — Area + Bar charts (Recharts), 7-day stats, streak counter, weekly breakdown
- 🌙 **Dark Glassmorphism UI** — Tailwind, backdrop blur, gradient borders, Framer Motion animations
- 📱 **Responsive** — Mobile hamburger nav drawer + desktop sidebar

## 🔧 Environment Variables

`server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pulse
JWT_SECRET=pulse_super_secret_jwt_key_2024
```

## 📖 API Endpoints

| Method | Route                | Auth | Description             |
|--------|---------------------|------|-------------------------|
| POST   | /api/auth/register  | No   | Create account          |
| POST   | /api/auth/login     | No   | Login, get JWT          |
| GET    | /api/auth/me        | Yes  | Get current user        |
| GET    | /api/tasks          | Yes  | List user's tasks       |
| POST   | /api/tasks          | Yes  | Create task             |
| PATCH  | /api/tasks/:id      | Yes  | Update/complete task    |
| DELETE | /api/tasks/:id      | Yes  | Delete task             |
| POST   | /api/focus          | Yes  | Log focus session       |
| GET    | /api/focus          | Yes  | Get 7-day focus stats   |
