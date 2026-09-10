# Skill Swap — Production-Ready Backend API

Skill Swap is a campus-based peer-learning platform that connects students who have skills they can teach with students who want to learn those skills. The backend features an intelligent matching engine, Skill Credit economy, gamified reputation system, real-time chat, and comprehensive administrative controls.

---

## 🌟 Key Features

* **JWT & bcrypt Authentication**: Secure user registration, password hashing, role management (student/admin), and optional college email domain restriction (`@campus.edu`).
* **Intelligent Skill Normalization**: Automatically normalizes alias variations (e.g. `JS` / `Javascript` $\rightarrow$ `JavaScript`, `ReactJS` $\rightarrow$ `React`).
* **Smart Matching Engine (50/25/15/10)**:
  * **Skill Compatibility (50%)**: Supports two-way direct swaps and one-way credit-supported learning.
  * **Availability Overlap (25%)**: Calculates exact minute-by-minute time intersection (e.g., Saturday 4–6 PM vs Saturday 4–5 PM $\rightarrow$ Saturday 4–5 PM overlap).
  * **Skill-Level Compatibility (15%)**: Ensures teacher expertise matches learner goals.
  * **Campus Proximity (10%)**: Proximity bonus for students on the same campus.
* **Swap Request & Session Management**: Complete lifecycle from initial request $\rightarrow$ acceptance $\rightarrow$ scheduling $\rightarrow$ completion.
* **Skill Credit Economy**: Atomic credit distribution (+1 credit per 30 minutes taught) with balance checks preventing negative balances.
* **Gamification & Badges**: Automated badge unlocking (`First Session`, `Helpful Mentor`, `Skill Sharer`, etc.) and Contributor Levels (Level 1 to Level 5 Campus Expert).
* **Ratings & Reputation**: Multi-dimensional reviews (Communication, Teaching Quality, Punctuality) updating average ratings and reputation scores.
* **Campus Trending Skills Analytics**: Real-time analytics tracking unmet skill demand across campus.
* **Trust & Safety**: User blocking, harassment reporting, and admin moderation workflows.
* **Real-time Chat**: Socket.io real-time chat enabled upon swap request acceptance.
* **Aggregated Dashboard API**: Single endpoint (`GET /api/dashboard`) serving complete state for future frontends.
* **OpenAPI / Swagger Docs**: Interactive API documentation at `/api-docs`.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB & Mongoose ORM
* **Authentication**: JWT (JSON Web Tokens) & bcryptjs
* **Validation**: express-validator
* **Security**: Helmet, CORS, Express Rate Limit
* **Real-Time**: Socket.io
* **Documentation**: Swagger UI & OpenAPI 3.0
* **Testing**: Jest, Supertest & mongodb-memory-server

---

## 📁 Project Structure

```
SwapSkills/
├── package.json
├── .env.example
├── .env
├── .gitignore
├── README.md
├── swagger.json
├── postman_collection.json
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── Availability.js
│   │   ├── SwapRequest.js
│   │   ├── Session.js
│   │   ├── Rating.js
│   │   ├── SkillCredit.js
│   │   ├── Badge.js
│   │   ├── Notification.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── Report.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── skillController.js
│   │   ├── availabilityController.js
│   │   ├── matchingController.js
│   │   ├── requestController.js
│   │   ├── sessionController.js
│   │   ├── ratingController.js
│   │   ├── creditController.js
│   │   ├── badgeController.js
│   │   ├── notificationController.js
│   │   ├── chatController.js
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── searchController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── index.js
│   │   └── [featureRoutes].js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimitMiddleware.js
│   ├── services/
│   │   ├── matchingService.js
│   │   ├── creditService.js
│   │   ├── badgeService.js
│   │   ├── notificationService.js
│   │   └── reputationService.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── matchScore.js
│   │   ├── skillNormalizer.js
│   │   └── apiResponse.js
│   └── seed/
│       └── seedData.js
└── tests/
    ├── setup.js
    ├── auth.test.js
    ├── skills.test.js
    ├── availability.test.js
    ├── matching.test.js
    ├── requests.test.js
    ├── sessions.test.js
    ├── credits.test.js
    └── ratings.test.js
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* Node.js (v18+ recommended)
* MongoDB running locally (`mongodb://127.0.0.1:27017/skillswap`) or MongoDB Atlas URI

### 2. Clone & Install
```bash
git clone https://github.com/Mohiddin25/SkillSwap.git
cd SkillSwap
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=skillswap_super_secret_jwt_key_2026_campus_app
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAINS=
CREDIT_PER_30_MINUTES=1
```

### 4. Seed Demo Data
Populate MongoDB with 25 realistic student profiles, skills, availability slots, completed sessions, and badges:
```bash
npm run seed
```

**Seed Credentials**:
* **Student A**: `studenta@campus.edu` / `Password123!`
* **Student B**: `studentb@campus.edu` / `Password123!`
* **Admin**: `admin@campus.edu` / `AdminPassword123!`

### 5. Start Backend Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```


Server will run at `http://localhost:5000`.

---

## 📖 API Documentation & Postman

* **Interactive Swagger UI**: Open `http://localhost:5000/api-docs` in your browser.
* **Postman Collection**: Import `postman_collection.json` into Postman. Login requests automatically save the JWT token into collection variables for easy testing.

---

## 🧮 Matching Engine & Algorithm

The engine calculates a match score from 0–100 using configurable weights:
$$\text{Match Score} = (0.50 \times S) + (0.25 \times A) + (0.15 \times L) + (0.10 \times P) + \text{Bonus}$$

* **$S$ (Skill Compatibility)**: 100% for 2-way barter, 60% for 1-way swap (supported via Skill Credits).
* **$A$ (Availability Overlap)**: Calculates minute-by-minute common slots across days of week.
* **$L$ (Level Compatibility)**: Higher score when teacher level exceeds learner goal.
* **$P$ (Proximity)**: 100% for same campus.

### Section 37 Verification Example:
* **Student A**: Teaches Python, wants UI/UX, Available Saturday 4–6 PM (16:00–18:00).
* **Student B**: Teaches UI/UX, wants Python, Available Saturday 4–5 PM (16:00–17:00).
* **Result**: `matchScore: 95`, Common Availability: `Saturday 16:00 - 17:00`.

---

## 🧪 Testing

Run the automated Jest test suite:
```bash
npm test
```
Uses `mongodb-memory-server` so tests run in-memory without affecting your local MongoDB database.

---

## 🔮 Future Improvements

1. **Email Service Integration**: Send real SMTP email notifications for request approvals and session reminders.
2. **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) for mobile push notifications.
3. **Calendar Integration**: Export session schedules to iCal / Google Calendar `.ics` files.
