# LetsTrain

A full-stack web application connecting gym trainers to clients in Lebanon.

## Features

- User authentication (clients and trainers)
- Trainer profiles with portfolios, reviews, locations
- Client goal posting
- Session booking
- Real-time chat
- Payment processing with commission
- Ranking system for trainers

## Tech Stack

- Frontend: React.js with React Router, Axios, Socket.io-client
- Backend: Node.js, Express, MongoDB, Socket.io
- Authentication: JWT
- Real-time: Socket.io

## Setup

### Prerequisites

- Node.js
- MongoDB
- npm

### Backend

1. cd backend
2. npm install
3. Create .env file with MONGO_URI and JWT_SECRET
4. npm run dev (for development)

### Frontend

1. cd frontend
2. npm install
3. npm start

### Running

Start MongoDB, then backend, then frontend.

Access at http://localhost:3000

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/trainers
- GET /api/trainers/:id
- POST /api/trainers (create profile)
- GET /api/clients/goals
- POST /api/clients/goals
- GET /api/bookings
- POST /api/bookings
- PUT /api/bookings/:id
- POST /api/payments

## Chat

Real-time chat per booking using Socket.io.