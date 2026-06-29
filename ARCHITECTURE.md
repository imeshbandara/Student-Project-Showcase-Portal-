# Architecture & Implementation Plan: Student Project Showcase Portal

## 1. Repository Structure (Monorepo)

**Recommendation:** A Monorepo structure using a single Git repository with separate `frontend` and `backend` folders. 
**Justification:** For a university project, a monorepo significantly simplifies development. You only have one repository to clone, branch, and submit. It keeps frontend and backend code perfectly in sync, and you can easily share configuration or run both servers concurrently from the root directory using a package like `concurrently`.

```text
/
├── frontend/               # React application (e.g., built with Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Buttons, Cards, Navbar)
│   │   ├── pages/          # Page views (Home, Dashboard, ProjectDetails)
│   │   ├── context/        # React context (Auth state)
│   │   ├── services/       # API calling functions (axios instances)
│   │   ├── App.jsx         # Main router setup
│   │   └── index.css       # Global styles
│   └── package.json
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── config/         # DB connections, Passport setup, Env config
│   │   ├── controllers/    # Route handlers (logic for handling requests)
│   │   ├── events/         # Event emitters and listeners (Notification layer)
│   │   ├── middlewares/    # Auth guards, Error handling, Multer upload
│   │   ├── models/         # Database schema/ORM definitions
│   │   ├── routes/         # Express router definitions
│   │   ├── services/       # Reusable business logic (e.g., Image processing)
│   │   └── app.js          # Express app initialization
│   └── package.json
├── .gitignore
├── package.json            # Root package for running concurrent scripts
└── README.md
```

## 2. Database Choice & Schema

**Database Recommendation: PostgreSQL**
**Why?** This application is highly relational. Users follow users, users like projects, and notifications tie actors to entities. A relational database like PostgreSQL natively enforces these relationships through Foreign Keys, prevents orphaned records (via ON DELETE CASCADE), and handles complex joins (e.g., fetching a student's projects along with the total like count and checking if the current recruiter follows them) much more efficiently and safely than a NoSQL document store like MongoDB.

### Proposed Schema

**1. users**
- `id` (UUID, Primary Key)
- `google_id` (String, Unique) - For OAuth
- `email` (String, Unique)
- `name` (String)
- `avatar_url` (String)
- `role` (Enum: 'STUDENT', 'RECRUITER', 'ADMIN')
- `created_at` (Timestamp)

**2. projects**
- `id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key -> users.id, ON DELETE CASCADE)
- `title` (String)
- `description` (Text)
- `thumbnail_url` (String) - Path to uploaded image
- `repository_url` (String) - E.g., GitHub link
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**3. likes**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> users.id) - The user who liked
- `project_id` (UUID, Foreign Key -> projects.id, ON DELETE CASCADE)
- `created_at` (Timestamp)
- *Constraint: Unique(user_id, project_id)* - Prevent multiple likes from same user on same project.

**4. followers**
- `follower_id` (UUID, Foreign Key -> users.id) - The Recruiter
- `followed_id` (UUID, Foreign Key -> users.id) - The Student
- `created_at` (Timestamp)
- *Constraint: Primary Key(follower_id, followed_id)*

**5. notifications**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> users.id) - The recipient (e.g., Student)
- `actor_id` (UUID, Foreign Key -> users.id) - The triggerer (e.g., Recruiter)
- `type` (Enum: 'PROJECT_CREATED', 'PROJECT_LIKED', 'NEW_FOLLOWER')
- `entity_id` (UUID, Nullable) - ID of the relevant project or null if irrelevant
- `is_read` (Boolean, Default: false)
- `created_at` (Timestamp)

## 3. Recommended NPM Packages

### Backend
- **Core Web:** `express`, `cors`, `dotenv`
- **Database & ORM:** `pg` (PostgreSQL client) and **`prisma`** (Highly recommended modern ORM for Node.js. It generates a type-safe client based on your schema and handles migrations beautifully).
- **Authentication:** `passport`, `passport-google-oauth20`, `jsonwebtoken` (or `express-session`) for handling auth state post-login.
- **File Uploads:** `multer` (to handle `multipart/form-data` for thumbnails).
- **Event Handling:** Built-in Node.js `events` module (`EventEmitter`).

### Frontend
- **Core UI:** `react`, `react-dom`, `react-router-dom`
- **State/Data Fetching:** `axios` (HTTP client), `@tanstack/react-query` (Optional but amazing for caching and handling async API states).
- **Styling:** `tailwindcss` (Fast UI development) + `lucide-react` (Clean icons).

## 4. Event-Driven Notification Layer

To fulfill the requirement that notifications must *only* be created via events and never directly in the API handler:

1. We will use Node's native `EventEmitter`.
2. In `backend/src/events/index.js`, we instantiate a global emitter:
   ```javascript
   import { EventEmitter } from 'events';
   export const appEvents = new EventEmitter();
   ```
3. **API Handler (Controller) Logic:**
   When a recruiter likes a project, the controller inserts the like into the DB, and then simply calls:
   ```javascript
   appEvents.emit('ProjectLiked', { actorId: recruiter.id, projectId: project.id, studentId: project.studentId });
   ```
4. **Event Listener Logic:**
   A separate file (`backend/src/events/listeners.js`) will listen for this event and handle writing to the `notifications` table, completely decoupling it from the HTTP response cycle.
