import { Box, HStack, IconButton, Link, Text } from '@chakra-ui/react'
import { LuGithub } from 'react-icons/lu'

export default async function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="blackAlpha.100" bg="#f5f0e8" px={10} py={5} display="flex" alignItems="center" justifyContent="space-between">
      <Text fontSize="sm" color="#5a6a7e" fontFamily="var(--font-dm-sans)">
        © {new Date().getFullYear()} Docuflash Inc.
      </Text>
      <HStack gap={6}>
        {['Privacy', 'Terms'].map((l) => (
          <Link key={l} href="#" fontSize="sm" color="#5a6a7e" textDecoration="none" _hover={{ color: '#0f1c2e' }}>
            {l}
          </Link>
        ))}
        <IconButton variant="ghost" aria-label="GitHub" size="sm" color="#5a6a7e">
          <LuGithub />
        </IconButton>
      </HStack>
    </Box>
  )
}
