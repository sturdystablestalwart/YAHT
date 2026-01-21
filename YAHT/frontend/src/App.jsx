import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Settings from "./pages/Settings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import NotificationPrompt from "./components/notifications/NotificationPrompt.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { useColorModeValue } from "./components/ui/color-mode.jsx";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { colors } from "./theme/colors.js";

function App() {
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue(colors.bg.light, colors.bg.dark);

  // Initialize notification scheduler for logged-in users
  useNotificationScheduler();

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      {isAuthenticated && <NotificationPrompt />}
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
