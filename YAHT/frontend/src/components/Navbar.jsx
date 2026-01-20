import {
  Container,
  Flex,
  Text,
  HStack,
  IconButton,
  Button,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import { ColorModeButton, useColorModeValue } from "./ui/color-mode.jsx";
import { keyframes } from "@emotion/react";
import { FaPlus, FaUser } from "react-icons/fa6";
import { LuLogOut, LuSettings } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const gradientAnimation = keyframes`
  0% { background-position: 0% 100%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Call hooks at component top level
  const textColor = useColorModeValue("#333333ff", "#cececeff");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container maxW={"1920px"} px={4}>
      <Flex
        maxH={32}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={"row"}
      >
        <Text
          bgGradient="to-l"
          gradientFrom="#007241"
          gradientTo="#A65F00"
          gradientVia="#94002D"
          bgClip="text"
          fontSize={{
            base: "4xl",
            xl: "6xl",
          }}
          fontWeight="extrabold"
          css={{
            backgroundSize: "1000% 1000%",
            animation: `${gradientAnimation} 20s ease infinite`,
          }}
        >
          <Link to={"/"}>Y.A.H.T.</Link>
        </Text>
        <HStack gap={2}>
          {isAuthenticated ? (
            <>
              <IconButton
                variant="ghost"
                rounded="full"
                _hover={{
                  bg: "#777777ff",
                }}
              >
                <Link to={"/create"}>
                  <FaPlus style={{ width: "24px", height: "24px" }} />
                </Link>
              </IconButton>

              <MenuRoot>
                <MenuTrigger asChild>
                  <Button
                    variant="ghost"
                    _hover={{ bg: "#777777ff" }}
                    color={textColor}
                  >
                    <HStack>
                      <FaUser />
                      <Text display={{ base: "none", md: "block" }}>
                        {user?.username || "User"}
                      </Text>
                    </HStack>
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="settings" onClick={() => navigate("/settings")}>
                    <LuSettings style={{ marginRight: "8px" }} />
                    Settings
                  </MenuItem>
                  <MenuItem value="logout" onClick={handleLogout}>
                    <LuLogOut style={{ marginRight: "8px" }} />
                    Logout
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                color={textColor}
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline"
                borderColor={textColor}
                color={textColor}
              >
                Register
              </Button>
            </>
          )}

          <ColorModeButton />
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
