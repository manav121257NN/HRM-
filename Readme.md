# BACKEND

to run backendt run this commad "nodemon server.js" in backedn forlder


# FRONTEND

to run backend run this command "npm run dev" in frontend folder 


backend work in mongo db with "login.manavbaldaniya@gmail.com" with hrm file



# Dayflow - Human Resource Management System

> **Every workday, perfectly aligned.**

Dayflow is a web-based Human Resource Management System (HRMS) built using the **MERN Stack**. [cite_start]It digitizes core HR operations, including employee authentication, attendance tracking, leave management, and payroll viewing[cite: 6].

## 📂 Project Structure & Key Files

This project is divided into two main parts: the **Backend** (API & Database) and the **Frontend** (User Interface). Below are the core files created for this fresh implementation:

### 1. Backend (`/backend`)
* **`server.js`**: The main entry point. Sets up the Express server, connects to MongoDB, and handles API routes.
* [cite_start]**`models/User.js`**: Database schema for storing Admin and Employee credentials and roles[cite: 9].
* [cite_start]**`models/Attendance.js`**: Schema for storing daily check-in and check-out times[cite: 11].
* [cite_start]**`models/Leave.js`**: Schema for managing leave requests (dates, reason, status)[cite: 11].
* [cite_start]**`models/Payroll.js`**: Schema for storing salary structure and payment history[cite: 95].

### 2. Frontend (`/frontend`)
* **`src/main.jsx`**: The entry point for the React application (Vite).
* **`src/App.jsx`**: Handles routing between Login, Employee Dashboard, and Admin Dashboard.
* [cite_start]**`src/Login.jsx`**: The authentication page for users to sign in[cite: 9].
* [cite_start]**`src/EmployeeDashboard.jsx`**: Interface for employees to view profile, mark attendance, and apply for leave[cite: 39].
* [cite_start]**`src/AdminDashboard.jsx`**: Interface for HR/Admins to view all employees, approve leaves, and manage payroll[cite: 46].

---

## 🚀 Prerequisites

Before running the application, ensure you have the following installed:
* **Node.js** (v14 or higher)
* **MongoDB** (Locally installed or a MongoDB Atlas connection string)
* **Git**

---

## 🛠️ Installation & Setup

Follow these steps to get the project running locally.

### Step 1: Clone the Repository
```bash
git clone [https://github.com/manav121257NN/HRM-.git](https://github.com/manav121257NN/HRM-.git)
cd "FULL HRM WEBSITE"
