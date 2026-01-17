import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { keyframes } from "@emotion/react";

// Define the gradient animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 100%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;

const HomeCard = ({ gradientFrom, gradientTo, gradientVia, children }) => {
  return (
    <Box
      flex={1}
      p={1}
      m={1}
      bgGradient="to-l"
      borderRadius="xl"
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      gradientVia={gradientVia}
      css={{
        backgroundSize: "1000% 1000%",
        animation: `${gradientAnimation} 20s ease infinite`,
      }}
      overflow="hidden"
    >
      <Box
        flex={1}
        bg={useColorModeValue("#bbbbbbff", "#222222ff")}
        borderRadius="xl"
        h="100%"
        overflow="auto"
      >
        {children}
      </Box>
    </Box>
  );
};

export default HomeCard;
