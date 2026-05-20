# 🎓 Campus Management System - Comprehensive Educational ERP

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)

The **Campus Management System** is a robust, highly scalable, full-stack educational ERP (Enterprise Resource Planning) platform. Designed to digitize and streamline academic operations, the system provides dedicated, secure environments for Students, Faculty, and Administrators to interact, manage records, and facilitate the learning process.

## 🚀 Project Overview

Built with a modern **MERN architecture**, this platform moves beyond a simple web app by utilizing a modular structure separated into three distinct codebases: a Public/Student/Faculty Client, a secure Admin Portal, and a centralized RESTful API. 

It handles complex real-world workflows, including document verification (marksheet/photo uploads), attendance tracking, academic material distribution, and secure fee payment processing.

## ✨ Key Features

### 👨‍🎓 Student Portal
* **Academic Dashboard:** Real-time access to enrolled courses, timetables, and campus notices.
* **Attendance Tracking:** Visual breakdown of attendance records across all registered subjects.
* **Digital Learning:** Download study materials, assignments, and interact via the "Doubts" system.
* **Fee Management:** Secure, integrated digital fee payment system.

### 👨‍🏫 Faculty Portal
* **Classroom Management:** Seamlessly mark and update student attendance for assigned courses.
* **Resource Sharing:** Upload and distribute study materials, syllabus files, and important notices.
* **Student Interaction:** Review and respond to student queries and doubts in real-time.

### 🛡️ Administrator Portal (Dedicated Client)
* **Application Processing:** Review incoming student applications, verify uploaded documents (photos, marksheets), and approve/reject admissions.
* **User Management:** Complete CRUD capabilities for managing Student and Faculty profiles.
* **Curriculum Control:** Create and manage courses, assign faculty, and design academic timetables.
* **System Oversight:** Centralized analytics and global notification dispatch.

## 💻 Tech Stack

**Frontend (Client & Admin Portals)**
* **React.js:** Component-driven UI architecture.
* **Tailwind CSS:** Utility-first CSS framework for a responsive, modern interface.
* **React Router:** For seamless single-page application (SPA) navigation.

**Backend (REST API)**
* **Node.js & Express.js:** Highly scalable server architecture.
* **MongoDB & Mongoose:** Flexible NoSQL database modeling for complex relational data (Users, Courses, Attendance, Queries).
* **JSON Web Tokens (JWT):** Secure, role-based authentication and session management.
* **Multer:** Advanced multipart/form-data handling for secure document and image uploads.

## 📂 Architecture & Project Structure

The project is structured into three distinct modules to ensure separation of concerns and maintainability:

```text
campus-management-system/
├── api/                      # Node/Express Backend Server
│   ├── controllers/          # Business logic (Auth, Attendance, Faculty, Students)
│   ├── middleware/           # Security & JWT validation
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── uploads/              # Secure document storage
├── client/                   # React Frontend (Students & Faculty)
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Reusable UI & role-specific dashboards
│       ├── pages/            # Core views (Home, Courses, Dashboard)
│       └── apiConfig.js      # API integration logic
└── admin/                    # React Frontend (Administrators Only)
    ├── public/               
    └── src/
        ├── components/       # Admin-specific management components
        └── pages/            # Admin dashboard and login
