import { useRef } from "react";
import { HStack, Input, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode.jsx";

function TimeInput({ value, onChange, size = "sm" }) {
  const textColor = useColorModeValue("#333333ff", "#cececeff");
  const borderColor = useColorModeValue("#a1a1aa", "#52525b");

  // Parse value into 4 digits
  const digits = (value || "").replace(":", "").padEnd(4, "").split("");
  const [h1, h2, m1, m2] = digits;

  // Refs for each input
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, newDigit) => {
    // Only allow single digit 0-9
    if (newDigit && !/^[0-9]$/.test(newDigit)) return;

    // Build new value
    const newDigits = [...digits];
    newDigits[index] = newDigit || "";

    // Validate hours (00-23) and minutes (00-59)
    const hour = parseInt(newDigits[0] + newDigits[1], 10);
    const minute = parseInt(newDigits[2] + newDigits[3], 10);

    // Limit first hour digit to 0-2
    if (index === 0 && newDigit && parseInt(newDigit) > 2) return;

    // Limit second hour digit based on first digit
    if (index === 1 && newDigits[0] === "2" && newDigit && parseInt(newDigit) > 3) return;

    // Limit first minute digit to 0-5
    if (index === 2 && newDigit && parseInt(newDigit) > 5) return;

    // Format as HH:mm
    const h = (newDigits[0] || "") + (newDigits[1] || "");
    const m = (newDigits[2] || "") + (newDigits[3] || "");
    const formatted = h + (m ? ":" + m : h.length === 2 ? ":" : "");

    onChange(formatted);

    // Auto-focus next field if digit entered
    if (newDigit && index < 3) {
      refs[index + 1].current?.focus();
      refs[index + 1].current?.select();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - move to previous field if empty
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
      refs[index - 1].current?.select();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      refs[index - 1].current?.focus();
      refs[index - 1].current?.select();
    }
    if (e.key === "ArrowRight" && index < 3) {
      refs[index + 1].current?.focus();
      refs[index + 1].current?.select();
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const inputStyle = {
    width: size === "sm" ? "28px" : "36px",
    height: size === "sm" ? "32px" : "40px",
    textAlign: "center",
    padding: 0,
    fontSize: size === "sm" ? "14px" : "16px",
    fontFamily: "monospace",
  };

  return (
    <HStack gap={0} align="center">
      <Input
        ref={refs[0]}
        value={h1 || ""}
        onChange={(e) => handleChange(0, e.target.value.slice(-1))}
        onKeyDown={(e) => handleKeyDown(0, e)}
        onFocus={handleFocus}
        maxLength={1}
        placeholder="H"
        borderColor={borderColor}
        borderRightRadius={0}
        style={inputStyle}
      />
      <Input
        ref={refs[1]}
        value={h2 || ""}
        onChange={(e) => handleChange(1, e.target.value.slice(-1))}
        onKeyDown={(e) => handleKeyDown(1, e)}
        onFocus={handleFocus}
        maxLength={1}
        placeholder="H"
        borderColor={borderColor}
        borderLeftRadius={0}
        borderLeft="none"
        style={inputStyle}
      />
      <Text color={textColor} fontWeight="bold" fontSize={size === "sm" ? "lg" : "xl"} px={1}>
        :
      </Text>
      <Input
        ref={refs[2]}
        value={m1 || ""}
        onChange={(e) => handleChange(2, e.target.value.slice(-1))}
        onKeyDown={(e) => handleKeyDown(2, e)}
        onFocus={handleFocus}
        maxLength={1}
        placeholder="M"
        borderColor={borderColor}
        borderRightRadius={0}
        style={inputStyle}
      />
      <Input
        ref={refs[3]}
        value={m2 || ""}
        onChange={(e) => handleChange(3, e.target.value.slice(-1))}
        onKeyDown={(e) => handleKeyDown(3, e)}
        onFocus={handleFocus}
        maxLength={1}
        placeholder="M"
        borderColor={borderColor}
        borderLeftRadius={0}
        borderLeft="none"
        style={inputStyle}
      />
    </HStack>
  );
}

export default TimeInput;
