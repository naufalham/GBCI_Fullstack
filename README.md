# YouApp - Fullstack Application

A fullstack dating/social application built with **NestJS** (backend) and **Next.js** (frontend), featuring JWT authentication, real-time chat, profile management with automatic Zodiac & Horoscope calculation.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **NestJS** | ^11.0.1 | Backend framework |
| **MongoDB** | 7 | Database |
| **Mongoose** | ^9.2.3 | MongoDB ODM |
| **Passport + JWT** | ^0.7.0 / ^11.0.2 | Authentication |
| **Socket.io** | ^4.8.3 | Real-time WebSocket communication |
| **RabbitMQ (amqplib)** | ^0.10.9 | Message queue |
| **Swagger** | ^11.2.6 | API documentation |
| **class-validator** | ^0.14.4 | DTO validation |
| **bcrypt** | ^6.0.0 | Password hashing |
| **Jest** | ^29.5.0 | Testing framework |
| **Docker** | - | Containerization |
| **TypeScript** | ^5.7.3 | Language |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.5 | React framework (App Router) |
| **React** | ^18 | UI library |
| **Tailwind CSS** | ^3.4.1 | Styling |
| **Socket.io Client** | ^4.7.5 | Real-time communication |
| **TypeScript** | ^5 | Language |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Multi-container orchestration |
| **MongoDB 7** | Primary database |
| **RabbitMQ 3** | Message broker with management UI |
| **mongodb-memory-server** | In-memory MongoDB for local development |

---

## Project Structure

```
fullstack/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   │   ├── dto/            # Login & Register DTOs
│   │   │   ├── guards/         # JWT Auth Guard
│   │   │   ├── schemas/        # User schema
│   │   │   ├── strategies/     # JWT Passport strategy
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.spec.ts
│   │   ├── profile/            # Profile module
│   │   │   ├── dto/            # Create & Update Profile DTOs
│   │   │   ├── schemas/        # Profile schema
│   │   │   ├── profile.controller.ts
│   │   │   ├── profile.service.ts
│   │   │   └── profile.service.spec.ts
│   │   ├── chat/               # Chat module
│   │   │   ├── dto/            # Send & View Messages DTOs
│   │   │   ├── gateway/        # WebSocket gateway
│   │   │   ├── schemas/        # Message & Conversation schemas
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.service.spec.ts
│   │   │   └── rabbitmq.service.ts
│   │   ├── common/
│   │   │   └── utils/
│   │   │       ├── zodiac.util.ts        # Horoscope & Zodiac calculator
│   │   │       └── zodiac.util.spec.ts   # 25 test cases
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                   # E2E tests
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (main)/
│   │   │   │   ├── chat/page.tsx
│   │   │   │   ├── chat/[userId]/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   └── profile/
│   │   │       ├── AboutSection.tsx
│   │   │       └── InterestSection.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   ├── lib/
│   │   │   ├── api.ts          # API client
│   │   │   └── zodiac.ts       # Client-side zodiac calculation
│   │   └── types/
│   │       └── index.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Register a new user | No |
| POST | `/api/login` | Login and receive JWT token | No |

### Profile
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/createProfile` | Create user profile | JWT |
| GET | `/api/getProfile` | Get current user profile | JWT |
| PUT | `/api/updateProfile` | Update user profile | JWT |

### Chat
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/sendMessage` | Send a message | JWT |
| GET | `/api/viewMessages` | View messages (paginated) | JWT |
| GET | `/api/conversations` | List all conversations | JWT |

### WebSocket Events
| Event | Direction | Description |
|---|---|---|
| `sendMessage` | Client → Server | Send real-time message |
| `newMessage` | Server → Client | Receive new message |
| `typing` | Client → Server | Typing indicator start |
| `stopTyping` | Client → Server | Typing indicator stop |
| `markAsRead` | Client → Server | Mark messages as read |

### API Documentation
Swagger UI is available at `/api-docs` when the backend is running.

---

## Features

- **JWT Authentication** - Secure register/login with bcrypt password hashing
- **Profile Management** - CRUD operations with image upload (base64)
- **Auto Zodiac/Horoscope** - Automatically calculated from birthday (Chinese Zodiac + Western Horoscope)
- **Real-time Chat** - WebSocket-based messaging with Socket.io
- **Message Queue** - RabbitMQ integration for notifications (graceful fallback if unavailable)
- **Mobile-first UI** - 375px responsive design matching Figma specifications
- **Interest Tags** - Add/remove interest tags with full-screen editor
- **DTO Validation** - Request validation with class-validator
- **Unit Tests** - Jest unit tests for services and utilities

---

## Getting Started

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Local Development (Recommended)

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

The backend will start on `http://localhost:3002` with an in-memory MongoDB instance (no external MongoDB required).

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3001`.

### Option 2: Docker Compose

```bash
cd backend
docker-compose up --build
```

This starts:
- **API** on port `3000`
- **MongoDB** on port `27017`
- **RabbitMQ** on port `5672` (Management UI: `15672`)

### Environment Variables

#### Backend (`backend/.env`)
```env
JWT_SECRET=youapp-jwt-secret-key-2024
JWT_EXPIRES_IN=24h
PORT=3002
# MONGODB_URI=mongodb://localhost:27017/youapp  # Optional: uses in-memory if not set
# RABBITMQ_URI=amqp://guest:guest@localhost:5672 # Optional: skips if not available
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## Running Tests

```bash
cd backend

# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

**Test coverage includes:**
- Auth service (register, login, duplicate handling)
- Profile service (CRUD, horoscope/zodiac calculation)
- Chat service (messages, conversations, pagination)
- Zodiac utility (25 test cases for all zodiac signs and horoscopes)

---

## Screenshots

The application follows a mobile-first design (375px) based on the YouApp Figma design:

1. **Login/Register** - Dark themed authentication pages
2. **Profile View** - Banner with photo, About section, Interest tags
3. **Profile Edit** - Inline editing with image upload, form fields
4. **Interest Editor** - Full-screen overlay with tag management
5. **Chat** - Real-time messaging interface

---

## License

This project was built as a technical assessment for GBCI Ventures.
