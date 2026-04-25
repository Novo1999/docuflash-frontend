'use client'

import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { Button } from '@/components/ui/button'
import { FileUploadDropzone, FileUploadList, FileUploadRoot } from '@/components/ui/file-upload'
import { Box, HStack, Icon, IconButton, Link, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCopy, LuFileText, LuGithub, LuShare2, LuShield } from 'react-icons/lu'

export default function LandingPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { startUpload } = useUploadThing('fileUploader', {
    onClientUploadComplete: (res) => {
      console.log('Files uploaded:', res)
      setIsUploading(false)
      setShareLink(`https://docuflash.io/share/${res[0].key}`)
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
    <Box minH="100vh" bg="#f5f0e8">

      {/* Navbar */}
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

      {/* Hero */}
      <Box maxW="680px" mx="auto" pt="72px" pb="64px" px={4} textAlign="center">
        <VStack gap={5}>

          {/* Heading */}
          <Text
            as="h1"
            fontSize={{ base: '4xl', md: '5xl' }}
            lineHeight="1.1"
            color="#0f1c2e"
            letterSpacing="-0.5px"
            fontFamily="var(--font-instrument-serif)"
          >
            Share any file,{' '}
            <Text as="em" color="#c8a96e" fontStyle="italic" fontFamily="var(--font-instrument-serif)">
              instantly
            </Text>
          </Text>

          {/* Subtitle */}
          <Text fontSize="md" color="#5a6a7e" fontWeight="300" lineHeight="1.7" maxW="460px" fontFamily="var(--font-dm-sans)">
            Upload a PDF, Word doc, Excel sheet, or ZIP — get a shareable link in seconds. No account needed.
          </Text>

          {/* Upload Card */}
          <Box
            w="full"
            bg="white"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            borderRadius="2xl"
            p={8}
            boxShadow="0 4px 40px rgba(15,28,46,0.07)"
            mt={2}
          >
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
                    borderColor="rgba(200,169,110,0.5)"
                    borderRadius="xl"
                    bg="rgba(200,169,110,0.04)"
                    cursor="pointer"
                    _hover={{ bg: 'rgba(200,169,110,0.08)', borderColor: '#c8a96e' }}
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
                      bg="#ede7d9"
                      color="#5a6a7e"
                      borderWidth="1px"
                      borderColor="blackAlpha.100"
                      fontFamily="var(--font-dm-sans)"
                    >
                      {label}
                    </Box>
                  ))}
                </HStack>

                {/* Upload button */}
                <Button
                  w="full"
                  disabled={isUploading || files.length === 0}
                  loading={isUploading}
                  loadingText="Uploading..."
                  onClick={handleStartUpload}
                  bg="#0f1c2e"
                  color="#f5f0e8"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="500"
                  py={6}
                  _hover={{ bg: '#1a2d45' }}
                  _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                >
                  Upload & get link
                </Button>

                {uploadError && (
                  <Box
                    bg="red.50"
                    borderWidth="1px"
                    borderColor="red.200"
                    borderRadius="lg"
                    px={4}
                    py={3}
                  >
                    <Text fontSize="sm" color="red.700">{uploadError}</Text>
                  </Box>
                )}

                <HStack justify="center" gap={1}>
                  <Icon as={LuShield} color="#5a6a7e" boxSize={3} />
                  <Text fontSize="xs" color="#5a6a7e" fontFamily="var(--font-dm-sans)">
                    Files under 5 MB require no registration
                  </Text>
                </HStack>
              </VStack>
            ) : (
              /* Success state — share link */
              <VStack gap={5} alignItems="stretch">
                <VStack gap={2}>
                  <Box
                    w="48px"
                    h="48px"
                    bg="rgba(200,169,110,0.12)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                  >
                    <Icon as={LuShare2} color="#c8a96e" boxSize={5} />
                  </Box>
                  <Text fontSize="lg" fontWeight="500" color="#0f1c2e" fontFamily="var(--font-instrument-serif)">
                    Your file is ready to share
                  </Text>
                  <Text fontSize="sm" color="#5a6a7e" fontFamily="var(--font-dm-sans)">
                    Anyone with this link can download the file
                  </Text>
                </VStack>

                {/* Link box */}
                <HStack
                  bg="#f5f0e8"
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  borderRadius="xl"
                  px={4}
                  py={3}
                  justify="space-between"
                  gap={3}
                >
                  <Text
                    fontSize="sm"
                    color="#0f1c2e"
                    fontFamily="var(--font-dm-sans)"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    flex={1}
                  >
                    {shareLink}
                  </Text>
                  <IconButton
                    aria-label="Copy link"
                    size="sm"
                    variant="ghost"
                    color={copied ? '#c8a96e' : '#5a6a7e'}
                    onClick={handleCopy}
                    _hover={{ bg: 'blackAlpha.50' }}
                  >
                    <LuCopy />
                  </IconButton>
                </HStack>

                <Button
                  w="full"
                  onClick={handleCopy}
                  bg="#0f1c2e"
                  color="#f5f0e8"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="500"
                  py={6}
                  _hover={{ bg: '#1a2d45' }}
                >
                  {copied ? '✓ Copied!' : 'Copy link'}
                </Button>

                <Button
                  w="full"
                  variant="ghost"
                  onClick={handleReset}
                  color="#5a6a7e"
                  fontSize="sm"
                  _hover={{ color: '#0f1c2e', bg: 'blackAlpha.50' }}
                >
                  Upload another file
                </Button>
              </VStack>
            )}
          </Box>

          {/* How it works */}
          <HStack
            gap={0}
            justify="center"
            w="full"
            borderTopWidth="1px"
            borderColor="blackAlpha.100"
            pt={8}
            mt={2}
            alignItems="flex-start"
          >
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
                  <Text color="blackAlpha.200" fontSize="lg" mt={2}>→</Text>
                )}
              </HStack>
            ))}
          </HStack>

        </VStack>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        borderTopWidth="1px"
        borderColor="blackAlpha.100"
        bg="#f5f0e8"
        px={10}
        py={5}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
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

    </Box>
  )
}
