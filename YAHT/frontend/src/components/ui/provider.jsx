"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";

export function Provider(props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <ChakraProvider value={defaultSystem}>{props.children}</ChakraProvider>
    </ThemeProvider>
  );
}
