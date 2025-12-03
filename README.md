<div align="center">
  <a href="https://erthaloka.com" target="_blank">
    <img src="/src/assets/logo-new.png" alt="Erthaloka Logo" width="200" style="filter: invert(100%);" />
  </a>
</div>

<h1 align="center">🌍 Erthaloka — Experimental Website</h1>

<p align="center">
  <b>Innovating the future, one pixel at a time.</b><br/>

</p>

---
## 🌱 **About Erthaloka**

**Erthaloka** is a next-generation web platform at the intersection of **technology, ecology, and community**.
We aim to **redefine the digital ecosystem** by embedding sustainability into every pixel, every interaction, and every transaction.

Our mission is to **empower people and organizations** to contribute directly to planetary regeneration — making *preservation more profitable than destruction.*

---

## 🚀 **Getting Started**

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

---

### 📦 **Frontend Setup** (React + Vite)

```bash
# Navigate to project root
cd main-1

# Install dependencies
npm install

# Create environment file (copy from example or create new)
# Add your Firebase config to .env

# Start development server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

### 🐍 **Backend Setup** (FastAPI + Python)

```bash
# Navigate to backend directory
cd Hello-/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

---

### ⚙️ **Environment Variables**

#### Frontend (`.env` in root)
```env
VITE_PHI_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

#### Backend (`Hello-/backend/.env`)
```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
FIREBASE_PROJECT_ID=your_project_id

# Supabase (for query tracking)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=phi-reports

# External APIs
OPENAQ_API_KEY=your_openaq_api_key

# Server
PORT=8000
SENSOR_CACHE_TTL=1800
EXTERNAL_API_CACHE_TTL=300
```

---

### 🗄️ **Database Setup** (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `Hello-/backend/supabase_schema.sql`
3. Create a storage bucket named `phi-reports` in **Storage**

---

### 🧪 **Running Both Servers**

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd Hello-/backend
.\venv\Scripts\Activate.ps1   # Windows
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd main-1
npm run dev
```

---

### 📁 **Project Structure**

```
main-1/
├── src/                    # Frontend React source
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── auth/               # Firebase auth
├── Hello-/
│   └── backend/            # FastAPI backend
│       ├── app/
│       │   ├── api/        # API routes
│       │   ├── services/   # Business logic
│       │   │   └── external_apis/  # Open-Meteo, OpenAQ
│       │   └── main.py     # Entry point
│       ├── requirements.txt
│       └── .env
└── README.md
```

---

### 🔗 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/query` | POST | Get PHI report for location |
| `/api/pdf` | POST | Generate PDF report |
| `/api/history` | GET | User query history |
| `/api/external/air-quality` | GET | Real-time air quality |

---

<p align="center">
  Made by Erthaloka Team</b>
</p>



