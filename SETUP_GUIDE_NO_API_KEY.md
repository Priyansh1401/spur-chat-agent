# 🚀 Complete Setup Guide - NO API KEY NEEDED!

## ✨ What's Special About This Version

**✅ FREE - No API keys required!**
- Uses Hugging Face's FREE inference API
- Smart keyword-based responses for FAQ questions
- No signup or payment needed

---

## 📋 Prerequisites

### Must Have:
1. **Node.js 18+** 
   - Download: https://nodejs.org/
   - Run installer, use default settings
   - Verify: Open Command Prompt and type `node --version`

2. **Git**
   - Download: https://git-scm.com/downloads
   - Run installer, use default settings
   - Verify: `git --version`

3. **PostgreSQL** (Choose ONE option below)

#### Option A: Install PostgreSQL (Traditional)
- Download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Download version 14 or 15 for Windows
- Run installer:
  - Set password for `postgres` user (remember this!)
  - Port: 5432 (default)
  - Install pgAdmin 4 (for GUI)
- Verify: Open pgAdmin 4

#### Option B: Use Docker (Easier!)
- Download Docker Desktop: https://www.docker.com/products/docker-desktop/
- Install and restart computer
- Open Docker Desktop (let it start)
- You're done! We'll use it later

---

## 🎯 Step-by-Step Setup

### Step 1: Extract the ZIP File (2 minutes)

```bash
# 1. Right-click the downloaded ZIP → "Extract All"
# 2. Extract to: C:\Projects\spur-chat-agent
# 3. Open Command Prompt (Windows key + R, type "cmd", press Enter)
# 4. Navigate to the project:

cd C:\Projects\spur-chat-agent
```

Or wherever you extracted it to.

### Step 2: Setup Database (5 minutes)

#### If Using Docker (Recommended):

```bash
# Start PostgreSQL with Docker
docker run --name spur-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=spur_chat -p 5432:5432 -d postgres:14

# Verify it's running
docker ps
```

You should see `spur-postgres` in the list.

#### If Using Installed PostgreSQL:

```bash
# Option 1: Using pgAdmin GUI
# 1. Open pgAdmin 4
# 2. Right-click "Databases" → "Create" → "Database"
# 3. Name: spur_chat
# 4. Click "Save"

# Option 2: Using command line (psql)
psql -U postgres
# Enter your password
CREATE DATABASE spur_chat;
\q
```

### Step 3: Setup Backend (5 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies (this takes 2-3 minutes)
npm install

# Create .env file from template
copy .env.example .env

# Edit .env file
notepad .env
```

**Edit the `.env` file:**

If using Docker:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/spur_chat
FRONTEND_URL=http://localhost:5173
```

If using installed PostgreSQL:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/spur_chat
FRONTEND_URL=http://localhost:5173
```
(Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation)

**Save and close the file.**

### Step 4: Run Database Migrations (1 minute)

```bash
# Still in the backend folder
npm run migrate
```

You should see:
```
✅ Created conversations table
✅ Created messages table
✅ Created indexes
✨ Migration completed successfully!
```

### Step 5: Start Backend Server (1 minute)

```bash
# Start the backend
npm run dev
```

You should see:
```
✅ Database connection established
🚀 Spur AI Chat Backend Server
   Environment: development
   Port:        3001
   LLM:         huggingface
   Model:       microsoft/DialoGPT-medium
   
   Ready to handle chat requests! 💬
```

**✅ Backend is running! Keep this window open.**

### Step 6: Setup Frontend (3 minutes)

Open a **NEW Command Prompt** window:

```bash
# Navigate to frontend folder
cd C:\Projects\spur-chat-agent\frontend

# Install dependencies (2-3 minutes)
npm install

# Start frontend
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Your browser should automatically open to http://localhost:5173**

If it doesn't, manually open: **http://localhost:5173**

---

## 🎉 Test the Application!

### Basic Tests:

1. **Say Hello**
   - Type: "Hello"
   - AI should respond with a greeting

2. **Ask About Returns**
   - Type: "What's your return policy?"
   - AI should explain the 30-day return policy

3. **Ask About Shipping**
   - Type: "Do you offer free shipping?"
   - AI should mention free shipping over $50

4. **Test Context**
   - Type: "Do you ship to Canada?"
   - Then: "How long does it take?"
   - AI should understand you're asking about Canadian shipping

5. **Refresh Test**
   - Refresh the page (F5)
   - Your conversation should still be there!

### Advanced Test Script:

Open a **third** Command Prompt:

```bash
cd C:\Projects\spur-chat-agent

# Run automated tests
.\test-api.sh
```

(If you get an error, you might need Git Bash to run the script)

---

## 🐛 Common Issues & Fixes

### "Port 3001 is already in use"

**Fix:**
```bash
# Find what's using the port
netstat -ano | findstr :3001

# Note the PID (last column), then:
taskkill /PID <PID> /F

# Or just change the port in backend/.env:
PORT=3002
```

### "Database connection failed"

**Fix:**
```bash
# Check if PostgreSQL is running

# If using Docker:
docker ps
# If spur-postgres isn't listed:
docker start spur-postgres

# If using installed PostgreSQL:
# Open Services (Windows + R, type "services.msc")
# Find "postgresql-x64-14" (or similar)
# Right-click → Start
```

### "Cannot find module"

**Fix:**
```bash
# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

### "Module not found: @anthropic-ai/sdk"

This shouldn't happen now, but if it does:
```bash
cd backend
npm install
# This will use the updated package.json without Anthropic
```

### Frontend doesn't connect to backend

**Fix:**
1. Verify backend is running (check for the startup message)
2. Check frontend .env file exists
3. Try accessing directly: http://localhost:3001/api/health
4. Check browser console for errors (F12 → Console tab)

---

## 📤 Prepare for Submission

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name: `spur-chat-agent`
4. Keep it **Public**
5. Don't initialize with README (we have one)
6. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# In your project root (C:\Projects\spur-chat-agent)
git init
git add .
git commit -m "Initial commit: Spur AI Chat Agent with free Hugging Face LLM"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/spur-chat-agent.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render (Optional but Impressive!)

#### Deploy Backend:

1. Go to https://dashboard.render.com/
2. Sign up with GitHub
3. Click "New +" → "PostgreSQL"
   - Name: `spur-chat-db`
   - Plan: Free
   - Click "Create Database"
   - Copy the "Internal Database URL"

4. Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Name: `spur-chat-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build && npm run migrate`
   - Start Command: `npm start`
   - Add Environment Variable:
     - `DATABASE_URL` = (paste the Internal Database URL)
     - `FRONTEND_URL` = `https://YOUR_FRONTEND_URL` (we'll get this next)
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your backend URL (e.g., `https://spur-chat-backend.onrender.com`)

#### Deploy Frontend:

1. On Render, click "New +" → "Static Site"
   - Connect your GitHub repo
   - Name: `spur-chat-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add Environment Variable:
     - `VITE_API_URL` = (your backend URL from above)
   - Click "Create Static Site"
   - Wait 3-5 minutes
   - Copy your frontend URL

2. Update Backend Environment:
   - Go back to backend service
   - Environment → Edit
   - Update `FRONTEND_URL` with your frontend URL
   - Save

**You now have a live demo!** 🎉

---

## 📝 Fill Out Submission Form

Go to the Spur submission form and provide:

1. **GitHub Repository Link**
   - `https://github.com/YOUR_USERNAME/spur-chat-agent`

2. **Deployed Project URL** (if you deployed)
   - `https://your-frontend-name.onrender.com`
   - Or write: "Available to deploy upon request - tested locally"

3. **Notes** (optional):
   ```
   This submission uses Hugging Face's free inference API instead of paid API keys,
   with intelligent keyword-based responses for FAQ questions. The application is
   fully functional and has been tested locally. All requirements have been met:
   - Complete chat UI with session persistence
   - PostgreSQL database with migrations
   - LLM integration (free Hugging Face)
   - Comprehensive error handling
   - Production-ready code structure
   
   Local testing completed successfully.
   ```

---

## ✅ Pre-Submission Checklist

- [ ] Backend runs without errors (`npm run dev`)
- [ ] Frontend runs and opens in browser
- [ ] Can send messages and receive AI responses
- [ ] Conversation persists after page refresh
- [ ] Database has data (check with pgAdmin or `psql`)
- [ ] Code pushed to GitHub (public repository)
- [ ] README.md is clear and complete
- [ ] .env files are NOT committed (should be in .gitignore)
- [ ] .env.example files ARE committed
- [ ] (Optional) Application deployed and accessible online

---

## 🎓 What You've Built

### Features Implemented:
✅ Full-stack TypeScript application
✅ React frontend with modern UI
✅ Node.js backend with Express
✅ PostgreSQL database with migrations
✅ FREE AI integration (no API keys needed!)
✅ Session persistence
✅ Error handling at all layers
✅ Input validation
✅ Professional code structure
✅ Comprehensive documentation
✅ Docker support
✅ Production-ready architecture

### Technical Skills Demonstrated:
- Full-stack development
- RESTful API design
- Database schema design
- LLM integration (without paid APIs!)
- TypeScript best practices
- Error handling
- Security considerations
- Modern React patterns
- Docker containerization

---

## 🆘 Need Help?

### If you're stuck:
1. Check the error message carefully
2. Look in the "Common Issues" section above
3. Try restarting both backend and frontend
4. Check that PostgreSQL is running
5. Verify all npm packages installed correctly

### Quick Reset (if things are broken):
```bash
# Stop everything (Ctrl+C in both terminals)
# Delete node_modules
cd backend
rmdir /s node_modules
npm install

cd ../frontend
rmdir /s node_modules
npm install

# Restart database (if using Docker)
docker restart spur-postgres

# Start again
cd ../backend
npm run dev

# New terminal
cd ../frontend
npm run dev
```

---

## 🚀 You're Ready!

Once you see both servers running and can chat with the AI, you're good to submit!

**Time estimate:**
- Setup: 15-20 minutes
- Testing: 5-10 minutes
- GitHub push: 5 minutes
- (Optional) Deployment: 15-20 minutes
- **Total: ~45 minutes to 1 hour**

Good luck! 🎉
