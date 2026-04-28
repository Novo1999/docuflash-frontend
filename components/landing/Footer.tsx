import { Box, HStack, IconButton, Link, Text } from '@chakra-ui/react'
import { LuGithub } from 'react-icons/lu'

export default async function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="blackAlpha.100" bg="brand.50" px={10} py={5} display="flex" alignItems="center" justifyContent="space-between">
      <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
        © {new Date().getFullYear()} Docuflash Inc.
      </Text>
      <HStack gap={6}>
        {['Privacy', 'Terms'].map((l) => (
          <Link key={l} href="#" fontSize="sm" color="ink.600" textDecoration="none" _hover={{ color: 'ink.900' }}>
            {l}
          </Link>
        ))}
        <IconButton variant="ghost" aria-label="GitHub" size="sm" color="ink.600">
          <LuGithub />
        </IconButton>
      </HStack>
    </Box>
  )
}
