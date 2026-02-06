# BACKEND

to run backendt run this commad "nodemon server.js" in backedn forlder


# FRONTEND

to run backend run this command "npm run dev" in frontend folder 


backend work in mongo db with "login.manavbaldaniya@gmail.com" with hrm file



# Dayflow - Human Resource Management System

> **Every workday, perfectly aligned.**

Dayflow is a web-based Human Resource Management System (HRMS) built using the **MERN Stack**. It digitizes core HR operations, including employee authentication, attendance tracking, leave management, and payroll viewing.

## 📂 Project Structure

This project is divided into two main parts:
* **Backend (`/backend`):** Node.js & Express API connected to MongoDB.
* **Frontend (`/frontend`):** React.js application built with Vite.

**Note:** The `node_modules` folders are excluded from this repository to keep it lightweight. You will need to install dependencies locally (see instructions below).

---

## 🚀 Prerequisites

Before running the application, ensure you have the following installed:
* **Node.js** (v14 or higher)
* **MongoDB** (Locally installed or a MongoDB Atlas connection string)
* **Git**

---

## 🔑 Configuration & Security (Important)

⚠️ **This repository does not include the `.env` file.**
For security reasons, sensitive keys (like database passwords) are **ignored** by Git. You must create this file manually.

1.  Navigate to the `backend` folder.
2.  Create a new file named `.env`.
3.  Paste the following content inside and save it:

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string_here
    JWT_SECRET=your_super_secret_key_here
    ```

---

## 🛠️ Installation & Setup

Follow these steps to get the project running locally.

### Step 1: Clone the Repository
```bash
git clone [https://github.com/manav121257NN/HRM-.git](https://github.com/manav121257NN/HRM-.git)
cd "FULL HRM WEBSITE"
