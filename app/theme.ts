import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#f5f0e8' },
          100: { value: '#ede7d9' },
          400: { value: '#c8a96e' },
        },
        brandAlpha: {
          4: { value: 'rgba(200,169,110,0.04)' },
          8: { value: 'rgba(200,169,110,0.08)' },
          12: { value: 'rgba(200,169,110,0.12)' },
          30: { value: 'rgba(200,169,110,0.3)' },
          50: { value: 'rgba(200,169,110,0.5)' },
        },
        ink: {
          600: { value: '#5a6a7e' },
          800: { value: '#1a2d45' },
          900: { value: '#0f1c2e' },
        },
      },
    },
  },
})

export const theme = createSystem(defaultConfig, config)
