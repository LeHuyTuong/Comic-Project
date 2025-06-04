# Comic-Project – Next-Gen Web Story Platform

[![Issues](https://img.shields.io/github/issues/LeHuyTuong/Comic-Project)](https://github.com/LeHuyTuong/Comic-Project/issues)  
[![Forks](https://img.shields.io/github/forks/LeHuyTuong/Comic-Project)](https://github.com/LeHuyTuong/Comic-Project/network)  
[![Stars](https://img.shields.io/github/stars/LeHuyTuong/Comic-Project)](https://github.com/LeHuyTuong/Comic-Project/stargazers)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  

> **Elevate your ROI on interactive storytelling** with a scalable, high-performance full-stack solution. No fluff—just actionable insights.

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)  
2. [Core Capabilities](#core-capabilities)  
3. [Tech Stack & Architecture](#tech-stack--architecture)  
4. [Project Structure](#project-structure)  
5. [Getting Started](#getting-started)  
   - [Backend (comic-backend)](#backend-comic-backend)  
   - [Frontend (comic-frontend)](#frontend-comic-frontend)  
6. [API Overview](#api-overview)  
7. [Contributing](#contributing)  
8. [License & Contact](#license--contact)  

---

## 🚀 Executive Summary
Comic-Project is a **robust**, **future-proof** platform built for **rapid iteration**, **cross-team scalability**, and **best-in-class** user engagement. Powered by Node.js + Express + MongoDB on the back end, and a TailwindCSS-driven SPA on the front end, this repo is your MVP to dominate the web-reading space.

---

## 💡 Core Capabilities

### Frontend
- **Dynamic Hub**: Showcase trending, newly released, and top-ranked comics.  
- **Detail Pages**: Rich metadata, synopsis, and chapter navigation.  
- **Seamless Reader UX**: Infinite-scroll vertical reader with auto-load.  
- **Advanced Search & Filter**: Multi-dimensional filtering by genre, author, status.  
- **Dark Mode**: Adapt UI to any environment—boost retention.  
- **Auth Flow**: JWT-based sign-up/sign-in for personalized journeys.  

### Backend
- **Modular REST API**: Node.js + Express with clear service segregation.  
- **CRUD for Stories & Chapters**: Role-based access control for content governance.  
- **User Management**: Secure JWT authentication, profile endpoints.  
- **Data Persistence**: MongoDB + Mongoose for schema-driven storage.  
- **Middleware Ecosystem**: Centralized error handling, logging, validation.  
- **Performance Tuning**: CORS, rate-limiting, environment configs for enterprise readiness.  

---

## ⚙️ Tech Stack & Architecture
- **Frontend**: HTML5 ● CSS3 (TailwindCSS) ● JavaScript (ES6+) ● Font Awesome  
- **Backend**: Node.js ● Express.js ● MongoDB ● Mongoose ● JWT ● bcryptjs  
- **DevOps**: dotenv ● npm scripts ● live-server for local prototyping  

---

## 🗂️ Project Structure
```bash
/your-project-root
├── comic-backend        # API services
│   ├── config           # Env & DB configs
│   ├── controllers      # Business logic
│   ├── middlewares      # Auth, error handling
│   ├── models           # Mongoose schemas
│   ├── routes           # API endpoints
│   ├── .env             # Env vars (create manually)
│   └── server.js        # Entry point
└── comic-frontend       # UI client
    ├── assets           # Images, fonts, icons
    ├── components       # Reusable UI blocks
    ├── css              # Tailwind & custom styles
    ├── js               # API integration & UI scripts
    └── index.html       # Main entry
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** v14+ & **npm**  
- **MongoDB** (local or Atlas)  
- **Git CLI**  

### Backend (comic-backend)
```bash
cd comic-backend
npm install
cp .env.example .env        # Configure PORT, MONGODB_URI, JWT_SECRET
npm run dev                 # Start in hot-reload mode
```

### Frontend (comic-frontend)
```bash
cd ../comic-frontend
# Trong js/api.js, đảm bảo API_BASE_URL trỏ đúng backend URI
npm install -g live-server   # optional
live-server                  # Mở UI tại http://127.0.0.1:8080
```
### Deploying to GitHub Pages
```bash
# Build and deploy the frontend via root scripts
VITE_BASE_PATH=/Comic-Project npm run build
npm run deploy
```


---

## 🔌 API Overview

| Endpoint                                 | Method | Description                              |
| ---------------------------------------- | ------ | ---------------------------------------- |
| **Auth**                                 |        |                                          |
| `POST /api/auth/register`                | POST   | Onboard new user                         |
| `POST /api/auth/login`                   | POST   | Authenticate & issue JWT                 |
| **Stories**                              |        |                                          |
| `GET /api/stories`                       | GET    | List all stories (+ filters)             |
| `GET /api/stories/:id`                   | GET    | Story details                            |
| `POST /api/stories`                      | POST   | Create new story (auth required)         |
| `PUT /api/stories/:id`                   | PUT    | Update story (owner/admin)               |
| `DELETE /api/stories/:id`                | DELETE | Delete story (owner/admin)               |
| **Chapters** (nested under story)        |        |                                          |
| `GET /api/stories/:id/chapters`          | GET    | List chapters                            |
| `POST /api/stories/:id/chapters`         | POST   | Create chapter                           |
| `PUT /api/stories/:id/chapters/:cid`     | PUT    | Update chapter                           |
| `DELETE /api/stories/:id/chapters/:cid`  | DELETE | Delete chapter                           |

---

## 🤝 Contributing
1. **Fork** this repo  
2. **Branch**: `git checkout -b feature/YourFeature`  
3. **Commit**: `git commit -m "Implement YourFeature"`
4. **Push**: `git.push origin feature/YourFeature`  
5. **PR**: Open a pull request—let’s ship fast.  

---

## 📝 License & Contact
- **License**: MIT — see [LICENSE](LICENSE)  
- **Contact**: [Le Huy Tuong](mailto:you@example.com) ● Twitter: [@yourhandle](https://twitter.com/yourhandle)  
- **Repo**: https://github.com/LeHuyTuong/Comic-Project  
