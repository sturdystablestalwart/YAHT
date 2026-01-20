import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import NotificationPrompt from "./components/notifications/NotificationPrompt.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { useColorModeValue } from "./components/ui/color-mode.jsx";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler.js";
import { useAuth } from "./contexts/AuthContext.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  // Initialize notification scheduler for logged-in users
  useNotificationScheduler();

  return (
    <Box minH="100vh" bg={useColorModeValue("#bbbbbbff", "#222222ff")}>
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
      </Routes>
    </Box>
  );
}

export default App;
