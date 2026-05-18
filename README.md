# Task Note App

A secure note-taking application with user authentication, JWT tokens, and note sharing capabilities. Features a beautiful sidebar-based dashboard for managing notes.

## Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Note Management** - Create, read, update, and delete notes with timestamps
- **Note Sharing** - Share notes with other users by email with access control
- **Sidebar Dashboard** - Beautiful sidebar navigation with user profile and note management
- **API Documentation** - OpenAPI (Swagger) specification at `/openapi.json`
- **Separated Frontend/Backend** - Independently deployable components for flexible hosting

## Structure

- `backend/` - Express + MongoDB backend API with JWT authentication
- `frontend/` - Next.js frontend app with sidebar layout and protected routes

## Frontend Pages

- `/` - Redirects to login or notes based on authentication state
- `/login` - User login page with gradient design
- `/register` - User registration page with form validation
- `/notes` - Main notes dashboard with sidebar (protected route)

## Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
3. Update environment variables:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true
   JWT_SECRET=your_super_secret_key_change_in_production
   PORT=5000
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `.env.local` if backend is on different host:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Frontend Dashboard Features

### Sidebar
- User profile with avatar and email
- "Create Note" button (prominent call-to-action)
- Navigation menu
- Logout button

### Notes Grid
- Responsive grid layout (3 columns on desktop, 1 on mobile)
- Note cards with:
  - Title and content preview
  - Creation date
  - "Shared with X users" badge if shared
  - Edit, Share, Delete action buttons
- Empty state with create prompt

### Note Actions
- **Create** - Modal form to add new note
- **Edit** - Inline editing within card with save/cancel
- **Delete** - Confirmation dialog before deletion
- **Share** - Modal to enter recipient email with validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with name, email, password
- `POST /api/auth/login` - Login with email and password, returns JWT token

### Notes (All require `Authorization: Bearer <token>` header)
- `GET /api/notes` - Get all notes user created or has access to
- `GET /api/notes/{id}` - Get specific note (user must be owner or have access)
- `POST /api/notes` - Create new note with title and content
- `PUT /api/notes/{id}` - Update note (owner only)
- `DELETE /api/notes/{id}` - Delete note (owner only)
- `POST /api/notes/{id}/share` - Share note with another user by email

### System
- `GET /openapi.json` - OpenAPI/Swagger API documentation
- `GET /about` - Application info and features list

## Example Usage

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
# Returns: { "token": "jwt_token_here", "user": {...} }
```

### 3. Create a note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the note content"
  }'
```

### 4. Get all notes
```bash
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <your_jwt_token>"
```

### 5. Share a note
```bash
curl -X POST http://localhost:5000/api/notes/{noteId}/share \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "share_with_email": "friend@example.com"
  }'
```

## Deployment

### Frontend Deployment (Vercel - Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL` environment variable
4. Deploy

### Backend Deployment (Railway/Heroku)
1. Set environment variables:
   - `MONGODB_URI` - Production MongoDB connection
   - `JWT_SECRET` - Secure random key
   - `PORT` - Usually 3000 or provided by host
2. Deploy

## Default Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemon** - Development server auto-reload

### Frontend
- **Next.js** - React framework
- **CSS Modules** - Component scoped styling
- **JavaScript (ES6+)** - Modern JavaScript

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected API routes (all notes require auth)
- User isolation (users can only access their notes and shared notes)
- Email validation for sharing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Note",
    "content": "Note content here"
  }'
```

### Share Note
```bash
curl -X POST http://localhost:5000/api/notes/{noteId}/share \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "share_with_email": "friend@example.com"
  }'
```

## Deployment

### Frontend
- Vercel (recommended)
- Netlify
- Any static hosting

### Backend
- Heroku
- Railway
- AWS
- Any Node.js hosting

Update `NEXT_PUBLIC_BACKEND_URL` environment variable when deploying to different backend URL.

## Default Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Environment Variables

### Backend (.env)
```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_secret_key>
PORT=5000
```

### Frontend (.env.local - optional)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```
