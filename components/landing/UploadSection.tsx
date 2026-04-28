'use client'

import { ACCESS_TYPES } from '@/app/constants/accessTypes'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { Button } from '@/components/ui/button'
import { FileUploadDropzone, FileUploadList, FileUploadRoot } from '@/components/ui/file-upload'
import { Box, HStack, Icon, IconButton, Portal, Select, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCopy, LuShare2, LuShield } from 'react-icons/lu'

export function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { startUpload } = useUploadThing('fileUploader', {
    onClientUploadComplete: (res) => {
      console.log('Files uploaded:', res)
      setIsUploading(false)
      setShareLink(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://docuflash.vercel.app'}/share/${res[0].key}`)
      setFiles([])
    },
    onUploadError: (error) => {
      console.error('Upload error:', error)
      setIsUploading(false)
      setUploadError(error.message || 'Upload failed')
    },
  })

  const handleStartUpload = async () => {
    if (files.length === 0) {
      setUploadError('Please select files to upload')
      return
    }
    setIsUploading(true)
    setUploadError(null)
    setShareLink(null)
    await startUpload(files)
  }

  const handleCopy = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setShareLink(null)
    setFiles([])
    setUploadError(null)
  }

  return (
    <>
      {/* Heading */}
      <Text as="h1" fontSize={{ base: '4xl', md: '5xl' }} lineHeight="1.1" color="ink.900" letterSpacing="-0.5px" fontFamily="var(--font-instrument-serif)">
        Share any document/zip,{' '}
        <Text as="em" color="brand.400" fontStyle="italic" fontFamily="var(--font-instrument-serif)">
          instantly
        </Text>
      </Text>

      {/* Subtitle */}
      <Text fontSize="md" color="ink.600" fontWeight="300" lineHeight="1.7" maxW="460px" fontFamily="var(--font-dm-sans)">
        Upload a PDF, Word doc, Excel sheet, or ZIP — get a shareable link in seconds. No account needed.
      </Text>

      {/* Upload Card */}
      <Box w="full" bg="white" borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" p={8} boxShadow="0 4px 40px rgba(15,28,46,0.07)" mt={2}>
        {!shareLink ? (
          <VStack gap={5} alignItems="stretch">
            <FileUploadRoot
              maxFiles={1}
              accept={[
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/zip',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
              ]}
              onFileChange={(details) => {
                console.log('Files:', details.acceptedFiles)
                setFiles(details.acceptedFiles)
                setUploadError(null)
              }}
              alignItems="stretch"
            >
              <FileUploadDropzone
                label="Drop your file here"
                description="PDF, DOCX, XLSX, ZIP — up to 10 MB"
                borderWidth="1.5px"
                borderStyle="dashed"
                borderColor="brandAlpha.50"
                borderRadius="xl"
                bg="brandAlpha.4"
                cursor="pointer"
                _hover={{ bg: 'brandAlpha.8', borderColor: 'brand.400' }}
                className='text-black'
              />
              <FileUploadList />
            </FileUploadRoot>

            {/* Format badges */}
            <HStack gap={2} justify="center" flexWrap="wrap">
              {['PDF', 'DOCX', 'XLSX', 'ZIP'].map((label) => (
                <Box
                  key={label}
                  fontSize="xs"
                  fontWeight="500"
                  letterSpacing="wide"
                  px={2.5}
                  py={1}
                  borderRadius="md"
                  bg="brand.100"
                  color="ink.600"
                  borderWidth="1px"
                  borderColor="blackAlpha.100"
                  fontFamily="var(--font-dm-sans)"
                >
                  {label}
                </Box>
              ))}
              <Select.Root collection={ACCESS_TYPES} size="sm">
                <Select.HiddenSelect />
                <Select.Label className="text-left text-black">Select Access Type</Select.Label>
                <Select.Control>
                  <Select.Trigger bg="brandAlpha.4">
                    <Select.ValueText className='text-black' placeholder="Access Type" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {ACCESS_TYPES.items.map((type) => (
                        <Select.Item bg="brandAlpha.4" className="text-black" item={type} key={type.value}>
                          {type.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </HStack>

            {/* Upload button */}
            <Button
              w="full"
              disabled={isUploading || files.length === 0}
              loading={isUploading}
              loadingText="Uploading..."
              onClick={handleStartUpload}
              bg="ink.900"
              color="brand.50"
              borderRadius="xl"
              fontSize="md"
              fontWeight="500"
              py={6}
              _hover={{ bg: 'ink.800' }}
              _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              Upload & get link
            </Button>

            {uploadError && (
              <Box bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="lg" px={4} py={3}>
                <Text fontSize="sm" color="red.700">
                  {uploadError}
                </Text>
              </Box>
            )}

            <HStack justify="center" gap={1}>
              <Icon as={LuShield} color="ink.600" boxSize={3} />
              <Text fontSize="xs" color="ink.600" fontFamily="var(--font-dm-sans)">
                Files under 5 MB require no registration
              </Text>
            </HStack>
          </VStack>
        ) : (
          /* Success state — share link */
          <VStack gap={5} alignItems="stretch">
            <VStack gap={2}>
              <Box w="48px" h="48px" bg="brandAlpha.12" borderRadius="full" display="flex" alignItems="center" justifyContent="center" mx="auto">
                <Icon as={LuShare2} color="brand.400" boxSize={5} />
              </Box>
              <Text fontSize="lg" fontWeight="500" color="ink.900" fontFamily="var(--font-instrument-serif)">
                Your file is ready to share
              </Text>
              <Text fontSize="sm" color="ink.600" fontFamily="var(--font-dm-sans)">
                Anyone with this link can download the file
              </Text>
            </VStack>

            {/* Link box */}
            <HStack bg="brand.50" borderWidth="1px" borderColor="blackAlpha.200" borderRadius="xl" px={4} py={3} justify="space-between" gap={3}>
              <Text fontSize="sm" color="ink.900" fontFamily="var(--font-dm-sans)" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex={1}>
                {shareLink}
              </Text>
              <IconButton aria-label="Copy link" size="sm" variant="ghost" color={copied ? 'brand.400' : 'ink.600'} onClick={handleCopy} _hover={{ bg: 'blackAlpha.50' }}>
                <LuCopy />
              </IconButton>
            </HStack>

            <Button w="full" onClick={handleCopy} bg="ink.900" color="brand.50" borderRadius="xl" fontSize="md" fontWeight="500" py={6} _hover={{ bg: 'ink.800' }}>
              {copied ? '✓ Copied!' : 'Copy link'}
            </Button>

            <Button w="full" variant="ghost" onClick={handleReset} color="ink.600" fontSize="sm" _hover={{ color: 'ink.900', bg: 'blackAlpha.50' }}>
              Upload another file
            </Button>
          </VStack>
        )}
      </Box>
    </>
  )
}
