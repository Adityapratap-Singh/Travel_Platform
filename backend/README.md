# Travel Platform - Backend API

The backend API for the Travel Platform, built with Node.js, Express, and MongoDB. It handles authentication, data management, and integrations with external services like Cloudinary and Google AI.

## 🛠 Tech Stack

- **Node.js & Express**: Core server framework.
- **MongoDB & Mongoose**: Database and Object Data Modeling.
- **JWT (JSON Web Tokens)**: Secure authentication.
- **Bcryptjs**: Password hashing.
- **Multer & Cloudinary**: File upload and cloud storage.
- **Google Generative AI**: AI-powered travel recommendations.

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance running (Local or Atlas)
- Cloudinary Account (for image uploads)
- Google AI API Key (for AI features)

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `backend` root with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/travel_db
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

### Running the Server

```bash
# Start the server
node index.js
```
The server will start on `http://localhost:3000`.

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Destinations
- `GET /api/destinations` - Get all destinations
- `POST /api/destinations` - Create destination (Admin/Agent)
- `GET /api/destinations/:id` - Get destination details

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create a new trip
- `PUT /api/trips/:id` - Update trip details

### Hotels
- `GET /api/hotels` - List hotels
- `POST /api/hotels` - Add a hotel (Hotel Manager/Admin)

### Experiences
- `GET /api/experiences` - List experiences
- `POST /api/experiences` - Add experience (Guide/Admin)

### AI Assistant
- `POST /api/ai/chat` - Chat with the AI travel assistant

## 📂 Project Structure

```
backend/
├── controllers/    # Request logic (auth, user, trip, etc.)
├── middleware/     # Auth checks, file uploads, error handling
├── models/         # Mongoose schemas (User, Trip, Destination, etc.)
├── routes/         # API Route definitions
├── services/       # External services (AI, OSM, Events)
├── db.js           # Database connection setup
├── index.js        # Entry point
└── seed.js         # Script to seed initial database data
```

## 🌱 Seeding Data

To populate the database with initial data:

```bash
node seed.js
```
