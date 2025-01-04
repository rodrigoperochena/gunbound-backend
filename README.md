# **Gunbound Thor's Hammer - Backend**

The **Gunbound Thor's Hammer** backend is a modernized Node.js REST API that replaces outdated PHP scripts, improving security, performance, and maintainability for the beloved nostalgic game. This backend handles user registration, login records, and player data, while maintaining compatibility with the legacy MySQL database (`v5.1.36`).

---

## **Table of Contents**
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Folder Structure](#folder-structure)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Usage](#usage)
7. [API Endpoints](#api-endpoints)
8. [Technologies Used](#technologies-used)
9. [Future Plans](#future-plans)
10. [Contributing](#contributing)
11. [License](#license)

---

## **Project Overview**
The project aims to:
- Replace insecure legacy PHP scripts used for user account handling.
- Enhance security to prevent SQL injections and weak password storage.
- Improve performance by leveraging Node.js and `mysql2` connection pooling.
- Provide a modern, maintainable backend for an old but beloved online game.

---

## **Features**
- **User Registration:** Securely register new players and assign default attributes.
- **Player Data:** View player stats, game points (GP), and recent login activity.
- **Session Handling:** Uses `express-session` to manage sessions.
- **Cross-Origin Resource Sharing (CORS):** Supports multiple origins for frontend communication.
- **Input Validation:** Ensures robust form data validation to prevent injections.

---

## **Folder Structure**
```
gunbound-backend/
├── controllers/       # Route handlers (user registration, login data, etc.)
├── routes/            # API route definitions
├── utils/             # Database connection and utility functions
├── node_modules/      # Dependencies
├── .env               # Environment variables (not included in the repo)
├── package.json       # Project metadata and dependencies
├── server.js          # Main entry point for the backend
```

---

## **Installation**

### **1. Clone the Repository:**
```bash
git clone https://github.com/username/gunbound-backend.git
cd gunbound-backend
```

### **2. Install Dependencies:**
```bash
npm install
```

### **3. Set Up MySQL Database:**
- Ensure your MySQL server is running `v5.1.36`.
- Create the required tables: `user`, `gunwcuser`, `game`, `cash`, `loginlog`.

---

## **Environment Variables**
Create a `.env` file in the root folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=gunbound_db
SESSION_SECRET=supersecretkey
ADMIN_REGISTRATION_TOKEN=admintoken
```
- `SESSION_SECRET`: Secret key for securing user sessions.
- `ADMIN_REGISTRATION_TOKEN`: Optional admin token for special privileges during registration.

---

## **Usage**
### **Run the Development Server:**
```bash
node server.js
```
The server will start on `http://localhost:5000`.

---

## **API Endpoints**
### **User Routes (`/api/users`)**

| Method | Endpoint         | Description                         | Request Body        |
|--------|------------------|------------------------------------- |-------------------- |
| `POST` | `/register`       | Register a new user                  | `{ username, password, email, gender, country }` |
| `GET`  | `/`               | Fetch all users                      | -                   |
| `GET`  | `/last-seen?days` | Fetch players who logged in recently | `?days=<number>` (optional, defaults to 1 day) |
| `GET`  | `/:id`            | Fetch details of a specific player   | `:id` (player username) |

---

## **Technologies Used**
- **Node.js** (Express): Server framework for routing and middleware.
- **MySQL 5.1.36:** Legacy MySQL database for compatibility with the original game server.
- **mysql2:** Handles database queries and connection pooling.
- **dotenv:** Manages environment variables securely.
- **bcrypt:** Password hashing (future plans).
- **express-session:** Manages session data for persistent login sessions.
- **CORS:** Enables cross-origin requests from the frontend.

---

## **Future Plans**

- **Frontend User Authentication (via API)**:
  - Implement secure **user authentication endpoints** for frontend logins.
  - **Password Hashing:** Use `bcrypt` to hash and validate passwords for user accounts created via the frontend.
  - **Session-Based Login:** Continue using `express-session` for session management.
  - **Persistent Login Sessions:** Enable automatic session renewal to avoid frequent logouts.

- **Separation of Game Accounts and Web User Accounts:**
  - Introduce **separate frontend user accounts** to manage access to the web app.
  - Allow users to link their **game server account** to their **web account** for personalized player data (stats, last login, etc.).
  - Add support for **admin-only features** (e.g., viewing user statistics, managing users).

- **Admin Dashboard API Endpoints:**
  - Add endpoints for admin-level access:
    - `GET /api/admin/stats` – Fetch game statistics (e.g., active players, total GP).
    - `DELETE /api/users/:id` – Allow admin to delete inactive or banned user accounts.
    - `PATCH /api/users/:id` – Allow admin to reset passwords or update player roles.

- **API Access Rate Limiting:** 
  - Add **rate-limiting middleware** to prevent abuse of public endpoints (especially login and registration).
  - Example: Limit user login attempts to 5 requests per minute.

- **Improved Error Handling and Logging:**
  - Add structured logging (e.g., `winston` or `morgan`) to log requests, errors, and API performance.
  - Implement centralized error handling with clear response codes (`400`, `401`, `500`).

- **CORS and Security Headers:**
  - Harden security by adding custom CORS rules (based on deployment domains).
  - Use `helmet` middleware to add secure HTTP headers.

- **Email Notifications (Optional Future Feature):**
  - Add email notifications via `nodemailer` to:
    - Confirm successful account registration.
    - Notify users when unusual login activity is detected.

- **Future-Proof API Design:**
  - Use **versioning** for API endpoints (e.g., `/api/v1/users/`), allowing backward compatibility when future updates are made.
  - Consider adding **Swagger/OpenAPI** documentation for easy API consumption.

---

### **To-Do Checklist**:
Here's a handy **checklist** to help track progress:

#### **Authentication & Accounts:**
- [ ] Implement password hashing with `bcrypt`.
- [ ] Add login/logout endpoints for session-based user authentication.
- [ ] Create API endpoint for linking game accounts to frontend accounts.

#### **Admin Dashboard Features:**
- [ ] Add endpoint for viewing global player stats (`/api/admin/stats`).
- [ ] Add endpoint for user management (update/delete users).
- [ ] Add rate-limiting middleware for login and registration.

#### **Security Enhancements:**
- [ ] Add CORS rules specific to production domains.
- [ ] Add `helmet` for HTTP security headers.
- [ ] Implement structured logging for better monitoring.

#### **Documentation & API Maintenance:**
- [ ] Add Swagger/OpenAPI documentation.
- [ ] Implement API versioning.

---

## **Contributing**
Contributions are welcome! If you’d like to help, please:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Submit a pull request.