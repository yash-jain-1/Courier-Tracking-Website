import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#E6F3FF",
    100: "#B3D9FF",
    200: "#80BFFF",
    300: "#4DA6FF",
    400: "#1A8CFF",
    500: "#0073E6",
    600: "#005BB2",
    700: "#004080",
    800: "#002A55",
    900: "#001533"
  },
  navy: {
    50: "#F0F4F8",
    100: "#D9E2EC",
    200: "#BCCCDC",
    300: "#9FB3C8",
    400: "#829AB1",
    500: "#627D98",
    600: "#486581",
    700: "#334E68",
    800: "#243B53",
    900: "#102A43"
  },
  gray: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B"
  }
};

// Color-mode-aware tokens; use these instead of hardcoded light-only colors
const semanticTokens = {
  colors: {
    'fg.heading': { default: 'navy.800', _dark: 'gray.50' },
    'fg.body': { default: 'gray.700', _dark: 'gray.200' },
    'fg.muted': { default: 'gray.600', _dark: 'gray.400' },
    'fg.subtle': { default: 'gray.500', _dark: 'gray.400' },
    'bg.surface': { default: 'white', _dark: 'gray.800' },
    'bg.input': { default: 'white', _dark: 'gray.700' },
    'bg.track': { default: 'gray.200', _dark: 'gray.600' },
    'border.subtle': { default: 'gray.200', _dark: 'gray.600' },
  },
};

const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "600",
      borderRadius: "lg",
    },
    variants: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: {
          bg: "brand.600",
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
        _active: {
          bg: "brand.700",
          transform: "translateY(0)",
        },
        transition: "all 0.2s",
      },
      outline: {
        borderColor: "brand.500",
        color: "brand.500",
        _hover: {
          bg: "whiteAlpha.100",
          _light: { bg: "brand.50" },
          transform: "translateY(-1px)",
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: "xl",
        boxShadow: "sm",
        border: "1px solid",
        borderColor: "border.subtle",
        _hover: {
          boxShadow: "md",
          transform: "translateY(-2px)",
        },
        transition: "all 0.2s",
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: "gray.50",
          borderRadius: "lg",
          _dark: { bg: "gray.700" },
          _hover: {
            bg: "gray.100",
            _dark: { bg: "gray.600" },
          },
          _focus: {
            bg: "bg.input",
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          },
        },
      },
    },
    defaultProps: {
      variant: "filled",
    },
  },
};


const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const customTheme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts,
  components,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "gray.100" : "gray.800",
      },
    }),
  },
});

export default customTheme;