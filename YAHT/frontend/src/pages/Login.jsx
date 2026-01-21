import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
import { colors } from "../theme/colors.js";
import { useAuth } from "../contexts/AuthContext";
import HomeCard from "../components/HomeCard.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Call hooks at component top level
  const textColor = useColorModeValue(colors.text.light, colors.text.dark);
  const borderColor = useColorModeValue(colors.border.light, colors.border.dark);
  const hoverBg = useColorModeValue(colors.hover.light + "33", colors.hover.dark + "33");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
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
        Login
      </Text>

      <HomeCard
        gradientFrom={colors.gradient.from}
        gradientTo={colors.gradient.to}
        gradientVia={colors.gradient.via}
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
                <Field.Label color={textColor}>Password</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  variant="flushed"
                  borderColor={borderColor}
                  color={textColor}
                />
              </Field.Root>

              <Button
                type="submit"
                mt={4}
                minH="44px"
                borderWidth={1}
                variant="outline"
                color={textColor}
                borderColor={borderColor}
                _hover={{ bg: hoverBg }}
                loading={isLoading}
                loadingText="Logging in..."
              >
                Login
              </Button>

              <Text textAlign="center" color={textColor}>
                Don't have an account?{" "}
                <Link as={RouterLink} to="/register" color={colors.gradient.from}>
                  Register
                </Link>
              </Text>
            </Flex>
          </form>
        </Box>
      </HomeCard>
    </Container>
  );
};

export default Login;
