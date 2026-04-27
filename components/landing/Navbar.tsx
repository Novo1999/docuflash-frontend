'use client'

import { Box, HStack, Icon, Link, Text } from '@chakra-ui/react'

import { LuFileText, LuShield } from 'react-icons/lu'

export default function Navbar() {
  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={10}
      bg="#f5f0e8"
      borderBottomWidth="1px"
      borderColor="blackAlpha.200"
      px={10}
      h="64px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack gap={2}>
        <Box
          w="32px"
          h="32px"
          bg="#0f1c2e"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={LuFileText} color="#c8a96e" fontSize="sm" />
        </Box>
        <Text fontSize="17px" fontWeight="500" color="#0f1c2e" letterSpacing="tight" fontFamily="var(--font-dm-sans)">
          Docuflash
        </Text>
      </HStack>

      <HStack gap={8}>
        <Link href="#" fontSize="sm" color="#5a6a7e" textDecoration="none" _hover={{ color: '#0f1c2e' }}>How it works</Link>
        <Link href="#" fontSize="sm" color="#5a6a7e" textDecoration="none" _hover={{ color: '#0f1c2e' }}>Pricing</Link>
      </HStack>

      <HStack gap={1} bg="rgba(200,169,110,0.12)" border="1px solid" borderColor="rgba(200,169,110,0.3)" px={3} py={1.5} borderRadius="full">
        <Icon as={LuShield} color="#c8a96e" boxSize={3} />
        <Text fontSize="xs" fontWeight="500" color="#c8a96e">No sign-up required</Text>
      </HStack>
    </Box>
  )
}
