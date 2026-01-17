import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useColorModeValue } from "./components/ui/color-mode.jsx";

function App() {
  return (
    <Box minH="100vh" bg={useColorModeValue("#bbbbbbff", "#222222ff")}>
      <Navbar />
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
      </Routes>
    </Box>
  );
}

export default App;
