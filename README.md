# Udaan Platform 🚀

> Empowering Dalit Students, Professionals, and Experts through Mentorship & Community

---

## Mission

Udaan is a mentorship and community platform built for Dalit students, professionals, and experts to connect, grow, and uplift each other through structured mentorship, knowledge sharing, and community networking.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Tailwind CSS              |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB (Mongoose ODM)              |
| Auth        | JWT + Google/LinkedIn OAuth         |
| Realtime    | Socket.io                           |
| Storage     | Local / AWS S3 (production)         |
| Email       | Nodemailer / SendGrid               |

---

## Project Structure

```
udaan-platform/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── config/       # DB connection, env config
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Route handler logic
│   │   ├── routes/       # API route definitions
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── services/     # Business logic layer
│   │   ├── utils/        # Utility helpers
│   │   └── validators/   # Request validation schemas
│   ├── tests/            # Backend tests
│   └── package.json
│
├── frontend/             # React.js application
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components
│       │   ├── common/   # Buttons, inputs, modals
│       │   ├── layout/   # Header, footer, sidebar
│       │   └── features/ # Feature-specific components
│       ├── pages/        # Page-level components
│       ├── context/      # React Context providers
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API communication layer
│       ├── utils/        # Frontend utilities
│       ├── styles/       # Global styles, themes
│       ├── assets/       # Images, icons
│       └── constants/    # App constants and enums
│
├── shared/               # Shared types and constants
└── docs/                 # Documentation
```

---

## Phase 1 Features (MVP)

- [x] Project Foundation
- [ ] User Authentication (JWT + OAuth)
- [ ] Role-based Access (Seeker, Expert, Admin)
- [ ] User Onboarding Flow
- [ ] Mentor Discovery & Filtering
- [ ] Mentorship Request Flow
- [ ] User Profile Pages
- [ ] Community Forum
- [ ] Resource Library
- [ ] Dashboard (Seeker + Expert)
- [ ] Real-time Notifications
- [ ] Admin Moderation Panel

---

## Phase 2 Features

- [ ] Job Board
- [ ] Internship Listings
- [ ] Business Directory
- [ ] Events
- [ ] Premium Features
- [ ] Organization Partnerships

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm v9+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/udaan-platform.git
   cd udaan-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm start
   ```

---

## API Documentation

Backend runs at: `http://localhost:5000/api/v1`

See [docs/API.md](docs/API.md) for full API documentation.

---

## Contributing

This is a community project. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for the Dalit community*
