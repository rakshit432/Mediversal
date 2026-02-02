# 🏥 Mediversal - Comprehensive Healthcare Management System

![Project Status](https://img.shields.io/badge/Status-Development-orange)
![License](https://img.shields.io/badge/License-ISC-blue)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)

**Mediversal** is a full-stack web application designed to bridge the gap between patients and healthcare providers. It features a robust backend, a responsive patient frontend, and a dedicated admin/doctor dashboard. The platform integrates **AI-powered symptom triage**, real-time appointment booking, and secure payment processing.

---

## � Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Admin Setup](#3-admin-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

---

## 📖 About the Project

Mediversal aims to simplify healthcare access. Patients can browse doctors, book appointments, and even use an AI assistant to analyze symptoms before booking. Doctors and Admins have their own dedicated panels to manage appointments, availability, and system data.

---

## ✨ Key Features

### 👤 For Patients (Frontend)
-   **Appointment Booking**: Browse doctors by specialty and book slots securely.
-   **AI Symptom Triage**: utilizing Google GenAI to analyze symptoms and suggest likely conditions.
-   **My Appointments**: Track past and upcoming appointments.
-   **Profile Management**: Update personal details and medical history.
-   **Secure Payments**: Integrated Razorpay for seamless transactions.

### 👨‍⚕️ For Doctors (Admin/Doctor Panel)
-   **Dashboard**: Overview of earnings, appointments, and patient stats.
-   **Appointment Management**: Accept, cancel, or complete appointments.
-   **Profile Control**: Manage availability and bio.

### 🛡️ For Admins (Admin Panel)
-   **System Oversight**: Manage all doctors and users.
-   **Verification**: Add or remove doctors from the platform.
-   **Global Settings**: (Planned) System-wide configurations.

---

## 💻 Technology Stack

This project is built using the **MERN** stack with modern tooling.

| Component | Tech | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 7 | Fast, modern UI library |
| **Styling** | TailwindCSS 4 | Utility-first CSS framework |
| **Backend** | Node.js, Express 5 | Robust server-side runtime |
| **Database** | MongoDB, Mongoose 8 | NoSQL database with strict modeling |
| **AI** | Google GenAI | For symptom analysis features |
| **Images** | Cloudinary | Cloud storage for profile and medical images |
| **Payments** | Razorpay | Secure payment gateway integration |
| **Auth** | JWT, Bcrypt | Stateless authentication and encryption |

---

## 📂 Project Architecture

```plaintext
mediversal/
├── backend/                # Server-side Application
│   ├── config/             # DB & Cloudinary Configs
│   ├── controllers/        # Business Logic (User, Doctor, Admin, Triage)
│   ├── middlewares/        # Auth & Validations
│   ├── models/             # Mongoose Schemas (User, Doctor, Appointment)
│   ├── routes/             # API Endpoints
│   └── index.js            # App Entry Point
│
├── frontend/               # Patient Client Application
│   ├── src/
│   │   ├── context/        # App State (AppContext)
│   │   ├── pages/          # Routes (Home, Doctors, Appointment, Login)
│   │   └── components/     # Reusable UI Components
│   └── vite.config.js      # Vite Configuration
│
└── admin/                  # Admin & Doctor Dashboard
    ├── src/
    │   ├── pages/          # Admin/Doctor Specific Pages
    │   └── context/        # Dashboard State
    └── vite.config.js      # Vite Configuration
```

---

## 🚀 Getting Started

Follow these steps to run the complete system locally.

### Prerequisites
-   **Node.js** (v18+ recommended)
-   **npm** or **yarn**
-   **MongoDB** (Local or Atlas URI)

### 1. Backend Setup
The backend serves both the frontend and admin panels.

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section below)
cp .env.example .env

# Start the Development Server
npm run dev
```
*Server runs on `http://localhost:4000` by default.*

### 2. Frontend Setup
The patient-facing interface.

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Development Server
npm run dev
```
*App runs on `http://localhost:5173` (usually).*

### 3. Admin Setup
The dashboard for doctors and administrators.

```bash
# Open a new terminal and navigate to admin
cd admin

# Install dependencies
npm install

# Start the Development Server
npm run dev
```
*App runs on `http://localhost:5174` (usually).*

---

## � Environment Variables

Create a `.env` file in the **backend** folder with the following variables:

```env
# Server Configuration
PORT=4000
MONGODB_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI (Google Gemini)
# Add any specific keys required for @google/genai if applicable
```

---

## 📡 API Reference

Here is a quick summary of the main API routes available.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/user/login` | User authentication |
| **POST** | `/api/doctor/login` | Doctor authentication |
| **POST** | `/api/admin/login` | Admin authentication |
| **GET** | `/api/doctor/list` | Get list of all doctors |
| **POST** | `/api/user/book-appointment` | Book a slot with a doctor |
| **POST** | `/api/triage/analyze` | AI analysis of user symptoms |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Generated for Mediversal Project.*
