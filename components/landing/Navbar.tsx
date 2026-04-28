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
      bg="brand.50"
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
          bg="ink.900"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={LuFileText} color="brand.400" fontSize="sm" />
        </Box>
        <Text fontSize="17px" fontWeight="500" color="ink.900" letterSpacing="tight" fontFamily="var(--font-dm-sans)">
          Docuflash
        </Text>
      </HStack>

      <HStack gap={8}>
        <Link href="#" fontSize="sm" color="ink.600" textDecoration="none" _hover={{ color: 'ink.900' }}>How it works</Link>
        <Link href="#" fontSize="sm" color="ink.600" textDecoration="none" _hover={{ color: 'ink.900' }}>Pricing</Link>
      </HStack>

      <HStack gap={1} bg="brandAlpha.12" border="1px solid" borderColor="brandAlpha.30" px={3} py={1.5} borderRadius="full">
        <Icon as={LuShield} color="brand.400" boxSize={3} />
        <Text fontSize="xs" fontWeight="500" color="brand.400">No sign-up required</Text>
      </HStack>
    </Box>
  )
}
