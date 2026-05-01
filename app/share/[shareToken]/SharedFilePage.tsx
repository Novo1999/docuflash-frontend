'use client'

import { getFileDownloadUrl, verifyFilePassword } from '@/app/lib/api/files'
import { FileAccessType, FileRecord, FileType } from '@/types/file'
import { Badge, Box, Button, Heading, HStack, Icon, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCalendar, LuClock, LuDownload, LuFile, LuHardDrive, LuLock, LuShield } from 'react-icons/lu'

interface SharedFilePageProps {
  file: FileRecord
}

const getFileTypeInfo = (fileType: FileType) => {
  switch (fileType) {
    case FileType.PDF:
      return { color: 'red.500', label: 'PDF' }
    case FileType.DOCX:
      return { color: 'blue.500', label: 'Word' }
    case FileType.XLS:
      return { color: 'green.500', label: 'Excel' }
    case FileType.ZIP:
      return { color: 'orange.500', label: 'ZIP' }
    default:
      return { color: 'gray.500', label: 'File' }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getRelativeTime = (dateString: string): string => {
  const diffDays = Math.ceil((new Date(dateString).getTime() - Date.now()) / 86400000)
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires in 1 day'
  if (diffDays < 7) return `Expires in ${diffDays} days`
  if (diffDays < 30) return `Expires in ${Math.floor(diffDays / 7)} weeks`
  return `Expires in ${Math.floor(diffDays / 30)} months`
}

const triggerDownload = (fileUrl: string, fileName: string) => {
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = fileName
  a.click()
  a.remove()
}

export default function SharedFilePage({ file }: SharedFilePageProps) {
  const [password, setPassword] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const fileTypeInfo = getFileTypeInfo(file.fileType)
  const isExpired = new Date(file.expireAt) < new Date()
  const isProtected = file.accessType === FileAccessType.PROTECTED
  const isLocked = isProtected && !fileUrl

  // ---- Expired state ----
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

  const handleVerifyPassword = async () => {
    if (!password) return
    setIsVerifying(true)
    setError(null)
    try {
      const result = await verifyFilePassword(file.shareToken, password)
      setFileUrl(result.fileUrl)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Invalid password')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const url = fileUrl ?? (await getFileDownloadUrl(file.shareToken)).fileUrl
      triggerDownload(url, file.fileName)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Download failed. Please try again.')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Box minH="100vh" bg="brand.50">
      <Box maxW="720px" mx="auto" pt="72px" pb={10} px={4}>
        <VStack gap={6}>
          {/* Header Card */}
          <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)">
            <VStack gap={6}>
              <HStack gap={4} align="flex-start">
                <Box w="64px" h="64px" bg={`${fileTypeInfo.color}.50`} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                  <Icon as={LuFile} color={fileTypeInfo.color} boxSize={8} />
                </Box>
                <VStack gap={1} align="flex-start" flex={1}>
                  <Heading size="md" fontFamily="var(--font-instrument-serif)" color="ink.900" wordBreak="break-word">
                    {file.fileName}
                  </Heading>
                  <HStack gap={2}>
                    <Badge fontSize="xs" fontWeight="500" px={2} py={1} borderRadius="md">
                      {fileTypeInfo.label}
                    </Badge>
                    <Badge colorScheme="gray" fontSize="xs" fontWeight="500" px={2} py={1} borderRadius="md">
                      {formatFileSize(file.fileSize)}
                    </Badge>
                    {!isProtected ? (
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

              {/* Password gate */}
              {isLocked && (
                <VStack gap={3} w="full">
                  <HStack gap={2} w="full">
                    <Input
                      type="password"
                      placeholder="Enter password to unlock download"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                      bg="brand.50"
                      borderWidth="1px"
                      borderColor={error ? 'red.400' : 'blackAlpha.200'}
                      borderRadius="xl"
                      px={4}
                      fontSize="md"
                      color="ink.900"
                      _placeholder={{ color: 'ink.400' }}
                      _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(200,169,110,0.1)' }}
                    />
                    <Button
                      onClick={handleVerifyPassword}
                      loading={isVerifying}
                      loadingText="Verifying..."
                      bg="ink.900"
                      color="brand.50"
                      borderRadius="xl"
                      fontWeight="500"
                      px={6}
                      flexShrink={0}
                      _hover={{ bg: 'ink.800' }}
                    >
                      Unlock
                    </Button>
                  </HStack>
                  {error && (
                    <Text fontSize="sm" color="red.500" fontFamily="var(--font-dm-sans)" alignSelf="flex-start">
                      {error}
                    </Text>
                  )}
                </VStack>
              )}

              {/* Download button — shown when public or after unlock */}
              {!isLocked && (
                <Button
                  w="full"
                  onClick={handleDownload}
                  loading={isDownloading}
                  loadingText="Preparing..."
                  bg="ink.900"
                  color="brand.50"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="500"
                  py={6}
                  _hover={{ bg: 'ink.800' }}
                >
                  <Icon as={LuDownload} mr={2} />
                  Download File
                </Button>
              )}
            </VStack>
          </Box>

          {/* File Details Card */}
          <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)">
            <VStack gap={5} align="stretch">
              <Heading size="md" fontFamily="var(--font-instrument-serif)" color="ink.900">
                File Details
              </Heading>
              <VStack gap={4}>
                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuCalendar} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Uploaded
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {formatDate(file.uploadDate)}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuClock} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Expires
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="500" fontFamily="var(--font-dm-sans)" color={getRelativeTime(file.expireAt) === 'Expired' ? 'red.600' : 'ink.900'}>
                    {formatDate(file.expireAt)}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuDownload} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      Downloads
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {file.downloadCount}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <HStack gap={3}>
                    <Icon as={LuHardDrive} boxSize={4} color="ink.600" />
                    <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                      File Size
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ink.900" fontWeight="500" fontFamily="var(--font-dm-sans)">
                    {formatFileSize(file.fileSize)}
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
