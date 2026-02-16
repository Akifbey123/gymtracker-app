import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner';

// Pages
import Login from "./pages/login"
import Register from "./pages/Signup" // Check filename casing
import FitnessDashboard from "./pages/FitnessDashboard" // Assuming this is your layout
import ProtectedRoute from "./components/ProtectedRoute"
import UserInfoForm from "./pages/UserInfoForm"

// Sub-pages (Views)
import HomeView from "./pages/Home"
import WorkoutView from "./pages/Workout"
import NutritionView from "./pages/Nutrition"
import GoalsView from './pages/Goals'
import SettingsView from './pages/Settings'
import CameraCapture from './pages/CameraCapture'
import AIWorkoutCoach from './components/AIWorkoutCoach'
// ... import other pages

export default function App() {
  return (
    <>
      <Toaster richColors position="top-center" theme="dark" />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- PROTECTED ROUTES --- */}
        {/* 1. Check if user is logged in (ProtectedRoute)
          2. If yes, render FitnessDashboard (Layout)
          3. Render specific sub-page inside Dashboard 
      */}
        <Route element={<ProtectedRoute />}>

          {/* This assumes FitnessDashboard contains an <Outlet /> where content goes */}
          <Route path="/" element={<FitnessDashboard />}>
            {/* Default path redirects to home or renders home */}
            <Route index element={<HomeView />} />
            <Route path="/user-info" element={<UserInfoForm />} />
            <Route path="home" element={<HomeView />} />
            <Route path="workout" element={<WorkoutView />} />
            <Route path="nutrition" element={<NutritionView />} />
            <Route path="goals" element={<GoalsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="camera" element={<CameraCapture />} />
            <Route path="ai-coach" element={<AIWorkoutCoach />} />
            {/* Add other protected routes here */}
          </Route>

        </Route>

        {/* Catch all - Redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}