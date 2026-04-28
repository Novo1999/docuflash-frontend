import Footer from '@/components/landing/Footer'
import HowItWorks from '@/components/landing/HowItWorks'
import Navbar from '@/components/landing/Navbar'
import { UploadSection } from '@/components/landing/UploadSection'
import { Box, VStack } from '@chakra-ui/react'

export default function LandingPage() {
  return (
    <Box minH="100vh" bg="brand.50">
      <Navbar />
      <Box maxW="680px" mx="auto" pt="72px" pb="64px" px={4} textAlign="center">
        <VStack gap={5}>
          <UploadSection />
          <HowItWorks />
        </VStack>
      </Box>
      <Footer />
    </Box>
  )
}
