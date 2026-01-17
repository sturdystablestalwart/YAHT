import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Text,
  Input,
  Button,
  Flex,
  Link,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode.jsx";
import { useAuth } from "../contexts/AuthContext";
import HomeCard from "../components/HomeCard.jsx";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Call hooks at component top level
  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const borderColor = useColorModeValue("#a1a1aa", "#52525b");
  const hoverBg = useColorModeValue("#a1a1aa33", "#52525b33");

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation matching backend requirements
    if (!validateEmail(email)) {
      setError("Please provide a valid email address");
      return;
    }

    if (username.length < 3 || username.length > 30) {
      setError("Username must be between 3 and 30 characters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const result = await register(email, username, password);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <Container maxW="md" pt={10}>
      <Text
        fontSize={{ base: "3xl", xl: "4xl" }}
        fontWeight="bold"
        color={textColor}
        textAlign="center"
        mb={6}
      >
        Register
      </Text>

      <HomeCard
        gradientFrom="#007241"
        gradientTo="#A65F00"
        gradientVia="#94002D"
      >
        <Box p={10}>
          <form onSubmit={handleSubmit}>
            <Flex flexDir="column" gap={4}>
              {error && (
                <Text color="red.500" textAlign="center">
                  {error}
                </Text>
              )}

              <Field.Root required>
                <Field.Label color={textColor}>Email</Field.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  variant="flushed"
                  borderColor={borderColor}
                  color={textColor}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label color={textColor}>Username</Field.Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3-30 characters"
                  variant="flushed"
                  borderColor={borderColor}
                  color={textColor}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label color={textColor}>Password</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  variant="flushed"
                  borderColor={borderColor}
                  color={textColor}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label color={textColor}>Confirm Password</Field.Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  variant="flushed"
                  borderColor={borderColor}
                  color={textColor}
                />
              </Field.Root>

              <Button
                type="submit"
                mt={4}
                borderWidth={1}
                variant="outline"
                color={textColor}
                borderColor={borderColor}
                _hover={{ bg: hoverBg }}
                loading={isLoading}
                loadingText="Creating account..."
              >
                Register
              </Button>

              <Text textAlign="center" color={textColor}>
                Already have an account?{" "}
                <Link as={RouterLink} to="/login" color="blue.400">
                  Login
                </Link>
              </Text>
            </Flex>
          </form>
        </Box>
      </HomeCard>
    </Container>
  );
};

export default Register;
