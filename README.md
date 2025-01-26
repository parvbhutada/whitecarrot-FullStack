# Google Calendar Events Viewer

A web application that allows users to view and filter their Google Calendar events after authenticating with their Google account.

## Features

- Google OAuth2 Authentication
- View upcoming calendar events
- Filter events by date
- Responsive design with Tailwind CSS
- Secure JWT-based authentication
- Session management

## Tech Stack

### Frontend
- React
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- Passport.js
- Google Calendar API
- JWT

## Prerequisites

- Node.js (v14 or higher)
- npm
- Google Cloud Console Project with Calendar API enabled
- Google OAuth2 credentials

## Setup

1. Clone the repository:
    - git clone <repository-url>
    - cd <project-directory>

2. Install dependencies:
    - Backend:
        - cd backend
        - npm install 
    - Frontend:
        - cd frontend
        - npm install

3. Configure environment variables:
    - Create `.env` file in the backend directory:
        - PORT=3000
        - GOOGLE_CLIENT_ID = your_google_client_id
        - GOOGLE_CLIENT_SECRET = your_google_client_secret
        - SESSION_SECRET = your_session_secret
        - JWT_SECRET = your_jwt_secret
    - Create `.env` file in the frontend directory:
        - VITE_API_URL = http://localhost:3000

4. Start the servers:
    - Backend (from backend directory): npm start
    - Frontend (from frontend directory): npm run dev


## Usage

1. Navigate to `http://localhost:5173` in your browser
2. Click "Sign in with Google" and authorize the application
3. View your upcoming calendar events
4. Use the date filter to find specific events

## API Endpoints

- `GET /auth/google` - Initiates Google OAuth2 authentication
- `GET /google/callback` - OAuth2 callback URL
- `GET /calendar` - Fetches user's calendar events (requires authentication)
- `GET /auth/status` - Checks authentication status

## Security

- JWT-based authentication
- Secure session management
- CORS enabled for frontend domain
- Environment variables for sensitive data
