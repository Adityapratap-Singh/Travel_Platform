# Travel Platform - Frontend Client

The frontend application for the Travel Platform, built with React, TypeScript, and Vite. It features a responsive UI, interactive maps, and role-specific dashboards.

## 🛠 Tech Stack

- **React 19**: UI Library.
- **Vite**: Build tool and dev server.
- **TypeScript**: Static typing.
- **Tailwind CSS**: Utility-first styling.
- **React Router DOM**: Client-side routing.
- **React Leaflet**: Interactive maps.
- **Framer Motion**: UI animations.
- **Lucide React**: Icon set.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- Backend server running (for full functionality).

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `frontend` root (optional, if you need custom API URLs):

```env
VITE_API_URL=http://localhost:3000/api
```

### Running the App

```bash
# Start development server
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```
frontend/
├── src/
│   ├── assets/        # Static assets (images, svgs)
│   ├── components/    # Reusable UI components
│   │   ├── features/  # Complex feature components (Map, AI, Weather)
│   │   ├── layout/    # Header, Footer, Layout wrappers
│   │   └── ui/        # Base UI elements (Button, Card, Badge)
│   ├── context/       # React Context (Auth, Toast)
│   ├── lib/           # Utilities and API helpers
│   ├── pages/         # Application pages (Home, Dashboard, Login)
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main App component with Routes
│   └── main.tsx       # Entry point
```

## 🔑 Key Features

### Role-Based Dashboards
- **Tourist**: View bookings, planned trips, and recommendations.
- **Agent**: Manage destinations and client bookings.
- **Guide**: Manage experiences and schedule.
- **Hotel**: Manage room availability and bookings.
- **Admin**: System-wide oversight.

### Interactive Map
Located in `src/components/features/InteractiveMap.tsx`, this component uses Leaflet to display destinations and points of interest on an interactive map.

### AI Assistant
The `AiAssistant` component provides a chat interface for users to ask travel-related questions, powered by the backend AI service.

## 📜 Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Type-check and build for production.
- `npm run lint`: Run ESLint to check code quality.
- `npm run preview`: Preview the production build locally.
