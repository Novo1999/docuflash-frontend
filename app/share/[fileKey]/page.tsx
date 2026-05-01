'use client'

import { FileAccessType, FileType } from '@/types/file'
import { Badge, Box, Button, Heading, HStack, Icon, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCalendar, LuClock, LuDownload, LuFile, LuHardDrive, LuLock, LuMonitor, LuShield } from 'react-icons/lu'

interface FileDetails {
  id: string
  fileName: string
  fileType: FileType
  fileSize: number
  accessType: FileAccessType
  downloadCount: number
  uploadDate: string
  expireAt: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    ip: string
  }
}

interface SharedFilePageProps {
  fileKey: string
}

const getFileTypeIcon = (fileType: FileType) => {
  switch (fileType) {
    case FileType.PDF:
      return { icon: LuFile, color: 'red.500', label: 'PDF' }
    case FileType.DOCX:
      return { icon: LuFile, color: 'blue.500', label: 'Word' }
    case FileType.XLS:
      return { icon: LuFile, color: 'green.500', label: 'Excel' }
    case FileType.ZIP:
      return { icon: LuFile, color: 'orange.500', label: 'ZIP' }
    default:
      return { icon: LuFile, color: 'gray.500', label: 'File' }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Expired'
  } else if (diffDays === 0) {
    return 'Expires today'
  } else if (diffDays === 1) {
    return 'Expires in 1 day'
  } else if (diffDays < 7) {
    return `Expires in ${diffDays} days`
  } else if (diffDays < 30) {
    return `Expires in ${Math.floor(diffDays / 7)} weeks`
  } else {
    return `Expires in ${Math.floor(diffDays / 30)} months`
  }
}

export default function SharedFilePage({ fileKey }: SharedFilePageProps) {
  const [password, setPassword] = useState('')
  const [isPasswordMode, setIsPasswordMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mockFileDetails: FileDetails = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fileName: 'Q4_Financial_Report_2024.pdf',
    fileType: FileType.PDF,
    fileSize: 2458624,
    accessType: FileAccessType.PROTECTED,
    downloadCount: 5,
    uploadDate: new Date('2024-01-15T10:30:00').toISOString(),
    expireAt: new Date('2024-02-15T10:30:00').toISOString(),
    deviceInfo: {
      browser: 'Chrome 120',
      os: 'Windows 11',
      device: 'Desktop',
      ip: '192.168.1.100',
    },
  }

  const fileTypeInfo = getFileTypeIcon(mockFileDetails.fileType)
  const isExpired = new Date(mockFileDetails.expireAt) < new Date()
  const isPublic = mockFileDetails.accessType === FileAccessType.PUBLIC

  const handlePasswordSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsPasswordMode(false)
    setIsLoading(false)
  }

  const handleDownload = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  if (isExpired) {
    return (
      <Box minH="100vh" bg="brand.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack bg="white" p={10} borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" boxShadow="0 4px 40px rgba(15,28,46,0.07)" textAlign="center" gap={6} maxW="480px" w="full">
          <Box w="64px" h="64px" bg="red.50" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
            <Icon as={LuClock} color="red.500" boxSize={7} />
          </Box>
          <VStack gap={2}>
            <Heading size="lg" fontFamily="var(--font-instrument-serif)" color="ink.900">
              This link has expired
            </Heading>
            <Text color="ink.600" fontFamily="var(--font-dm-sans)">
              The shared file is no longer available for download.
            </Text>
          </VStack>
        </VStack>
      </Box>
    )
  }

  if (mockFileDetails.accessType === FileAccessType.PROTECTED && isPasswordMode) {
    return (
      <Box minH="100vh" bg="brand.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack bg="white" p={10} borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" boxShadow="0 4px 40px rgba(15,28,46,0.07)" textAlign="center" gap={6} maxW="420px" w="full">
          <Box w="64px" h="64px" bg="brandAlpha.12" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
            <Icon as={LuLock} color="brand.400" boxSize={7} />
          </Box>
          <VStack gap={2}>
            <Heading size="lg" fontFamily="var(--font-instrument-serif)" color="ink.900">
              Password Required
            </Heading>
            <Text color="ink.600" fontFamily="var(--font-dm-sans)">
              This file is protected. Enter the password to access it.
            </Text>
          </VStack>
          <VStack gap={4} w="full">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              size="lg"
              bg="brand.50"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              borderRadius="xl"
              px={4}
              py={6}
              fontSize="md"
              _focus={{
                borderColor: 'brand.400',
                boxShadow: '0 0 0 3px rgba(200,169,110,0.1)',
              }}
            />
            <Button w="full" onClick={handlePasswordSubmit} loadingText="Verifying" bg="ink.900" color="brand.50" borderRadius="xl" fontSize="md" fontWeight="500" py={6} _hover={{ bg: 'ink.800' }}>
              Unlock File
            </Button>
          </VStack>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="brand.50">
      <Box maxW="720px" mx="auto" pt="72px" pb={10} px={4}>
        <VStack gap={6}>
          {/* Header Card */}
          <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)">
            <VStack gap={6}>
              {/* File Icon and Title */}
              <HStack gap={4} align="flex-start">
                <Box w="64px" h="64px" bg={`${fileTypeInfo.color}.50`} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                  <Icon as={fileTypeInfo.icon} color={fileTypeInfo.color} boxSize={8} />
                </Box>
                <VStack gap={1} align="flex-start" flex={1}>
                  <Heading size="md" fontFamily="var(--font-instrument-serif)" color="ink.900" wordBreak="break-word">
                    {mockFileDetails.fileName}
                  </Heading>
                  <HStack gap={2}>
                    <Badge colorScheme="brand" fontSize="xs" fontWeight="500" px={2} py={1} borderRadius="md">
                      {fileTypeInfo.label}
                    </Badge>
                    <Badge colorScheme="gray" fontSize="xs" fontWeight="500" px={2} py={1} borderRadius="md">
                      {formatFileSize(mockFileDetails.fileSize)}
                    </Badge>
                    {isPublic ? (
                      <HStack gap={1}>
                        <Icon as={LuShield} boxSize={3} color="green.500" />
                        <Text fontSize="xs" color="green.600" fontWeight="500">
                          Public
                        </Text>
                      </HStack>
                    ) : (
                      <HStack gap={1}>
                        <Icon as={LuLock} boxSize={3} color="amber.500" />
                        <Text fontSize="xs" color="amber.600" fontWeight="500">
                          Protected
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              {/* Download Button */}
              <Button w="full" onClick={handleDownload} loadingText="Preparing..." bg="ink.900" color="brand.50" borderRadius="xl" fontSize="md" fontWeight="500" py={6} _hover={{ bg: 'ink.800' }}>
                Download File
              </Button>
            </VStack>
          </Box>

          {/* File Details Card */}
          <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)">
            <VStack gap={5} align="stretch">
              <Heading size="md" fontFamily="var(--font-instrument-serif)" color="ink.900">
                File Details
              </Heading>

              <VStack gap={4}>
                {/* Upload Date */}
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuCalendar} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Uploaded
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {formatDate(mockFileDetails.uploadDate)}
                  </Text>
                </HStack>

                {/* Expiry */}
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuClock} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Expires
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={getRelativeTime(mockFileDetails.expireAt) === 'Expired' ? 'red.600' : 'ink.900'} fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {formatDate(mockFileDetails.expireAt)}
                  </Text>
                </HStack>

                {/* Downloads */}
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuDownload} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Downloads
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {mockFileDetails.downloadCount}
                  </Text>
                </HStack>

                {/* File Size */}
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuHardDrive} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      File Size
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {formatFileSize(mockFileDetails.fileSize)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Uploader Info Card */}
          <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)">
            <VStack gap={5} align="stretch">
              <Heading size="md" fontFamily="var(--font-instrument-serif)" color="ink.900">
                Upload Information
              </Heading>

              <VStack gap={4}>
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuMonitor} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Device
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {mockFileDetails.deviceInfo.device}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                    Browser
                  </Text>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {mockFileDetails.deviceInfo.browser}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                    OS
                  </Text>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {mockFileDetails.deviceInfo.os}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
