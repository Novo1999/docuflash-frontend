'use client'
import { HStack, Text, VStack } from '@chakra-ui/react'

export default function HowItWorks() {
  return (
    <HStack gap={0} justify="center" w="full" borderTopWidth="1px" borderColor="blackAlpha.100" pt={8} mt={2} alignItems="flex-start">
      {[
        { step: '01', label: 'Upload', desc: 'Drop your file into the box' },
        { step: '02', label: 'Get link', desc: 'Receive a unique shareable URL' },
        { step: '03', label: 'Share', desc: 'Send the link to anyone' },
      ].map((s, i) => (
        <HStack key={s.step} gap={0} flex={1} alignItems="flex-start">
          <VStack gap={1} textAlign="center" flex={1} px={2}>
            <Text fontSize="xs" fontWeight="500" color="#c8a96e" letterSpacing="widest" fontFamily="var(--font-dm-sans)">
              {s.step}
            </Text>
            <Text fontSize="sm" fontWeight="500" color="#0f1c2e" fontFamily="var(--font-dm-sans)">
              {s.label}
            </Text>
            <Text fontSize="xs" color="#5a6a7e" fontFamily="var(--font-dm-sans)">
              {s.desc}
            </Text>
          </VStack>
          {i < 2 && (
            <Text color="blackAlpha.200" fontSize="lg" mt={2}>
              →
            </Text>
          )}
        </HStack>
      ))}
    </HStack>
  )
}
