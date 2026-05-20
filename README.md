# 🚀 Running the Project

Refer to overall and semester documentation in the GitHub Wiki.

---

## 📦 Install the Repository

```bash
git clone https://github.com/your-username/NuLookUp.git
cd NuLookUp
npm install
⚙️ Backend Setup
📁 Go to backend directory
cd backend
📦 Install backend dependencies
npm install
🔐 Set up environment variables

Create a .env file inside backend/:

DATABASE_URL="file:./dev.db"
PORT=5000

Or copy from example (if available):

cp .env.example .env
🧠 Prisma Setup
npx prisma generate
npx prisma migrate dev --name init
What this does:
Creates and configures SQLite database
Generates Prisma client
Applies database schema migrations
▶️ Run Backend Server
npm run dev

Backend will run at:

http://localhost:5000
💻 Frontend Setup
📁 Go to frontend directory
cd ../frontend
📦 Install frontend dependencies
npm install
▶️ Run Frontend Server
npm run dev

Frontend will run at:

http://localhost:5173
🧪 Prisma Studio (Database Viewer)
cd backend
npx prisma studio
🧩 Run Full Project (2 Terminals)
Terminal 1 — Backend
cd backend
npm run dev
Terminal 2 — Frontend
cd frontend
npm run dev
📁 Project Structure
NuLookUp/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
🧰 Tech Stack
⚛️ React (TypeScript) — Frontend
🟦 Node.js (TypeScript) — Backend
🧬 Prisma — ORM
🗄️ SQLite — Database
🧠 Notes
SQLite is used for lightweight local development (no setup required)
Prisma handles all database queries and migrations
Backend serves API endpoints for the frontend
Both frontend and backend must run simultaneously
Use Prisma Studio to inspect database visually
🚀 Summary

NuLookUp allows users to:

Search items of value
View price trends over time
Analyze current market value
Read related news articles
