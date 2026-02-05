# Travel Booth

A comprehensive travel management platform connecting tourists, agents, guides, and hotels. This project is a full-stack application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards for Tourists, Agents, Guides, Hotels, and Admins.
- **Trip Planning**: Interactive trip planning with destination discovery.
- **Booking Management**: Seamless booking flow for hotels and experiences.
- **Interactive Maps**: Integration with Leaflet for destination visualization.
- **AI Assistant**: Built-in AI travel assistant powered by Google Generative AI.
- **Community**: Blog and contribution sections for sharing travel stories.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Maps**: React Leaflet
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & Bcryptjs
- **File Storage**: Cloudinary
- **AI**: Google Generative AI SDK

## 📂 Project Structure

The project is divided into two main applications:

- **`frontend/`**: The React client application.
- **`backend/`**: The Node.js server API.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas URI)
- npm or yarn

### 1. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (see `backend/README.md` for details) and run the server:

```bash
# Start the server
node index.js
```
The server will run on `http://localhost:3000` (or your configured PORT).

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Run the development server:

```bash
npm run dev
```
The application will run on `http://localhost:5173`.

## 📄 Documentation

- [Backend Documentation](./backend/README.md) - API endpoints, environment variables, and models.
- [Frontend Documentation](./frontend/README.md) - Component structure, routing, and UI details.

## 🤝 Contribution

Contributions are welcome! Please check out the [Contribute](./frontend/src/pages/Contribute.tsx) page in the app or submit a Pull Request.

## 📜 License

This project is licensed under the ISC License.

## ✍️ Author

**Adityapratap Singh**

This project is licensed under the ISC License.
