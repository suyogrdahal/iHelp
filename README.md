# iHelp – A Peer-to-Peer Help Request Platform

iHelp is a full-stack web application built for students to request and offer help to one another across campus. Designed with usability, trust, and simplicity in mind, iHelp empowers students to post their needs and get assistance from verified peers. It includes a dedicated admin dashboard for monitoring system activity.

---

##  Features

###  For Students
- Register with GVSU email and verify via email link
- Login and manage your own help requests
- Offer help to other students and track your offers
- Accept or reject help offers on your own posts
- View the helper's contact information once an offer is accepted

###  For Admins
- Secure admin login
- Dashboard with time-series chart of help post activity
- Total registered user count
- Admin-only API access

---

##  Tech Stack

| Layer        | Tech                       |
|--------------|----------------------------|
| Frontend     | React, HTML/CSS, Chart.js  |
| Backend      | FastAPI (Python)           |
| Database     | MongoDB                    |
| Auth         | JWT (JSON Web Tokens)      |
| Email        | Gmail SMTP (via App Passwords) |
| Hosting      | Render.com (frontend + backend) |

---

##  Authentication

- Only users with a valid `@mail.gvsu.edu` email can register.
- Account must be verified via an email link before login is allowed.
- Token-based session management via localStorage.

---

##  Project Structure
/frontend → React app (student and admin UI) /backend └── main.py → FastAPI entry point └── routes/ → All API routes └── models/ → Pydantic schemas └── controllers/→ Core business logic └── db.py → MongoDB connection

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ihelp.git
cd ihelp

2. Set up environment variables Create .env files in both /frontend and /backend as needed:

Backend .env:
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SECRET_KEY=your_jwt_secret
MONGO_URL=mongodb+srv://...

Frontend .env:
REACT_APP_API_BASE_URL=http://localhost:8000

Run Backend

cd backend
pip install requirements.txt
uvicorn main:app --reload

Run Frontend
cd frontend
npm install
npm start
