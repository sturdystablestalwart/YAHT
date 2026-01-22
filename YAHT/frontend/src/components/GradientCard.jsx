import { Box } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { keyframes } from "@emotion/react";
import { colors } from "../theme/colors.js";

// Define the gradient animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 100%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;

const GradientCard = ({ gradientFrom, gradientTo, gradientVia, children }) => {
  const bgColor = useColorModeValue(colors.bg.light, colors.bg.dark);

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
      <Box flex={1} bg={bgColor} borderRadius="xl" h="100%" overflow="auto">
        {children}
      </Box>
    </Box>
  );
};

export default GradientCard;
