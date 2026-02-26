<p align="center">
  <img src="/static/images/logo.jpeg" alt="ApnaMistri Logo" width="200"/>
</p>

---

# 🔧 ApnaMistri — Find trusted local workers, visually verified.

**ApnaMistri** is a Flask + Firebase powered web platform that connects customers with nearby skilled workers using verified visual portfolios, location-based discovery, and real job workflows.

Instead of relying on word-of-mouth, users can view real before/after work, chat directly, and hire with confidence.

---

## 🚀 Features

### 🧱 Core Features

- 📍 **Location-Based Worker Discovery**
- 🧑‍🔧 **Worker Portfolios with Before/After Images**
- 💬 **Direct Customer ↔ Worker Chat**
- 📝 **Job Creation & Tracking**
- ⭐ **Customer Ratings & Reviews**
- 🧭 **Area-Based Filtering**
- 🔐 Firebase Authentication (Google + Email)
- ☁️ Image Uploads via ImageKit

---

### 🧠 Future Enhancements

- 🤖 AI Work Confidence Score (image + job matching)
- 🛡 Trust Score System (unique customers + verified jobs)
- 📊 Worker Analytics Dashboard
- 📱 PWA Support
- 🔔 Job Status Notifications
- 🧾 Invoice & Work Report Export

---

## 🧩 Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Flask (Python) |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **Maps** | Leaflet + OpenStreetMap |
| **Storage** | ImageKit |
| **Hosting** | Vercel (frontend) / Flask server |

---

## ⚙️ Project Structure
```
ApnaMistri/
│
├── app.py
├── requirements.txt
│
├── templates/
│ ├── base.html
│ ├── getstarted.html
│ ├── choose_role.html
│ ├── customer_dashboard.html
│ ├── worker_dashboard.html
│ └── many more
│
├── static/
│ ├── css/
│ ├── js/
│ └── images/
│
└── services/
├── firebase_services.py
└── upload.py

```
---

## 🧠 How It Works

1. 👤 User signs in using Google or Email.
2. 🎯 New users choose role: Customer or Worker.
3. 🧑‍🔧 Workers complete onboarding (trade + area + location).
4. 📍 Customers discover nearby workers on map.
5. 👀 View worker portfolios.
6. 💬 Chat or Hire directly.
7. 📝 Job is created and tracked.
8. 📸 Worker uploads before images.
9. ✅ Customer uploads after images + rating.
10. ⭐ Job appears in worker portfolio.

---

## 🪜 Installation & Setup

1. Clone repo

```bash
git clone https://github.com/yourusername/apnamistri.git
cd apnamistri
```
2. Create virtual environment
```bash
python -m venv venv
venv\Scripts\activate
```
3. Install dependencies
```bash
pip install -r requirements.txt
Setup Firebase
```
4. Create Firebase project

5. Enable Firestore + Auth

6. Download service account key

7. Set environment variables

8. Run app
```bash
python app.py
```
9. Open browser
```bash
http://127.0.0.1:5000/
```
---

## 🏆 Why ApnaMistri?

### 🔍 Discover workers visually

### 🧾 Real job proof

### 💬 Direct communication

### 📍 Local-first discovery

### 🛡 Trust-based system

### 🇮🇳 Built for Indian service ecosystem

---

## 🤝 Contributing
- Pull requests welcome.
  If you’d like to add AI verification, PWA, or analytics — open an issue first.
---
## 📜 License
MIT License.


| “Skill deserves visibility. ApnaMistri gives every worker a digital identity.”
