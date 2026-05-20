# 🚀 NuLookUp

NuLookUp is a full-stack web application that allows users to search for items of value and analyze their market behavior over time.

Users can view:
- 📈 Historical price trendlines  
- 💰 Current average market value  
- 📰 Related news articles and updates  

The goal of NuLookUp is to provide a simple, centralized way to understand how an item’s value is changing in real time.

---

## 🧰 Tech Stack

- **Frontend:** React (TypeScript)
- **Backend:** Node.js (TypeScript)
- **ORM:** Prisma
- **Database:** SQLite

---

## 📦 Getting Started

Follow these steps to run the project locally.

---

## 📁 1. Clone the Repository

```bash
git clone https://github.com/your-username/NuLookUp.git
cd NuLookUp
⚙️ 2. Backend Setup
Go to backend folder
cd backend
Install dependencies
npm install
Create environment variables

Create a .env file inside backend/:

DATABASE_URL="file:./dev.db"
PORT=5000
Setup Prisma
npx prisma generate
npx prisma migrate dev --name init

This will:

Create and configure the SQLite database
Generate Prisma client
Apply database schema
Start backend server
npm run dev

Backend will run at:

http://localhost:5000
💻 3. Frontend Setup
Go to frontend folder
cd ../frontend
Install dependencies
npm install
Start development server
npm run dev

Frontend will run at:

http://localhost:5173
🧪 4. Prisma Studio (Optional)

View your database visually:

cd backend
npx prisma studio
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
🧠 Notes
SQLite is used for simple local development (no external DB required)
Prisma handles database queries and migrations
Backend provides API endpoints used by the frontend
Make sure both frontend and backend servers are running
🚀 Running the Full Project

Run both servers in separate terminals:

Backend
cd backend
npm run dev
Frontend
cd frontend
npm run dev
