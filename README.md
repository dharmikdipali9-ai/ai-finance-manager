# 💰 AI Finance Manager
An intelligent personal finance management web application that helps users track expenses, manage accounts, monitor budgets, and receive AI-driven financial insights.

## 🌐 Live Demo

- 🔗 Frontend: https://ai-finance-manager-nu.vercel.app/  
- 🔗 Backend API: https://ai-finance-manager-h6jl.onrender.com/

> ⚠️ Note: Backend may take a few seconds to wake up (free hosting).


---

## 📌 How to Use

1. Register with your email  
2. Enter the OTP received in your inbox  
3. Login and explore dashboard features  

> ⏳ OTP may take a few seconds to arrive. Check spam folder if needed.


---

## 🚀 Features

### 🔐 Authentication System
- Secure login & registration with JWT
- OTP-based email verification
- Forgot password with OTP reset flow
- Password strength indicator

### 🏦 Account Management
- Add multiple bank accounts
- Track balances in real-time
- Deposit updates with KYC verification (document upload)
- Low balance alerts

### ☁️ Cloud Storage (Cloudinary)
- Upload KYC documents securely
- Store and manage user files in the cloud
- Optimized image handling and delivery

### 💸 Transactions
- Add, edit, delete transactions
- Filter by type (Income / Expense)
- Search & date range filtering
- Smart account balance validation
- Mobile-friendly UI (accordion view)

### 🔔 Alerts & Notifications
- Real-time notifications
- Budget alerts, goal alerts, investment alerts
- Mark as read / delete individual / clear all
- Auto-refresh system

### 📊 AI Financial Insights
- AI-based spending advice
- Investment suggestions
- Budget recommendations

### 🎨 UI/UX
- Clean modern dashboard
- Fully responsive (mobile + desktop)
- Dark mode support (login page excluded)
- Smooth animations

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Bootstrap 5
- Axios
- React Toastify
- Lucide Icons

### Backend
- Flask (Python)
- Flask-JWT-Extended
- Flask-Mail (OTP system)
- SQLAlchemy
- Monolithic Flask architecture (single app.py)

### Database
- MySQL

### Cloud Services
- Cloudinary (Image & document storage)

### Deployment
- Frontend: Vercel  
- Backend: Render  
- Database: Railway

---

## 📂 Project Structure
frontend/
├── components/
├── pages/
├── context/
├── services/
└── App.js

backend/
└── app.py # Main backend file (routes, models, and logic handled here)

> ⚡ Note: The backend is currently implemented in a single `app.py` file for simplicity and rapid development.  
> The architecture is designed to be easily modularized into separate routes, models, and services as the application scales.

---

## ⚙️ Installation & Setup

### 1. Clone Repository

git clone https://github.com/dharmikdipali9-ai/ai-finance-manager.git

cd ai-finance-manager

### 2. Backend Setup

cd server
pip install -r requirements.txt

Create `.env` file:

SECRET_KEY=your_secret
JWT_SECRET_KEY=your_jwt_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
DB_URI=mysql://user:password@localhost/db_name

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Run backend:
python app.py

---

### 3. Frontend Setup

cd frontend
npm install
npm start

---

## 🔐 Environment Variables

| Variable | Description |
|--------|-------------|
| SECRET_KEY | Flask secret key |
| JWT_SECRET_KEY | JWT authentication key |
| MAIL_USERNAME | Email for OTP |
| MAIL_PASSWORD | Email password |
| DB_URI | MySQL connection string |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary secret |

---

## 📸 Screenshots

## Register Page
<img width="1363" height="681" alt="register" src="https://github.com/user-attachments/assets/9eb82c40-0c76-4333-b6dd-0754d1aa87cd" />


## login Page
<img width="1365" height="680" alt="login" src="https://github.com/user-attachments/assets/5b4a27cf-aaa8-46c3-b58a-1345c4b346c7" />

## Dashboard Page
<img width="1365" height="681" alt="Dashboard" src="https://github.com/user-attachments/assets/61ef62dd-64a4-443d-95b2-14dd11187676" />

## Accounts Page
<img width="1365" height="681" alt="accounts" src="https://github.com/user-attachments/assets/e8ecf353-d73d-40e2-9a2b-9fcac3b5fd20" />


## Transactions Page
<img width="1365" height="680" alt="transactions" src="https://github.com/user-attachments/assets/783e06be-a351-42b9-90fa-8b939fcc437e" />

## Ai-Insights Page
<img width="1364" height="679" alt="ai-insights" src="https://github.com/user-attachments/assets/22fb50c4-3ab6-4b26-92b0-b1cc3c934cc1" />




---

## 🌟 Future Improvements
- AI chatbot financial assistant
- Graphs & analytics dashboard
- Multi-currency support
- Export reports (PDF/Excel)

---

## 📜 License
MIT License

---

## 👨‍💻 Author
Dipali Dharmik

---

## ⭐ Support
If you like this project, give it a ⭐ on GitHub!



