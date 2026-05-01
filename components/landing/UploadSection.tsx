'use client'

import { ACCESS_TYPES } from '@/app/constants/accessTypes'
import { ACCEPTED_UPLOAD_MIME_TYPES, SUPPORTED_UPLOAD_FORMATS } from '@/app/constants/upload'
import { deleteUploadedStorageFile, uploadFile } from '@/app/lib/api/files'
import { useUploadThing } from '@/app/utils/generateReactHelpers'
import { getClientId, getDeviceInfo, getShareLink, resolveFileType } from '@/app/utils/upload'
import { uploadSchema, type UploadFormValues } from '@/app/zod/uploadSchema'
import { Button } from '@/components/ui/button'
import { FileUploadDropzone, FileUploadList, FileUploadRoot } from '@/components/ui/file-upload'
import { FileAccessType } from '@/types/file'
import { Box, Field, HStack, Icon, IconButton, Input, Portal, Select, Text, VStack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuClock, LuCopy, LuEye, LuEyeOff, LuFile, LuLock, LuShare2, LuShield } from 'react-icons/lu'

export function UploadSection() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setFocus,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      files: [],
      accessType: 'public',
      password: '',
      expireAt: '',
    },
  })

  const files = watch('files')
  const accessType = watch('accessType')

  const [shareLinks, setShareLinks] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fileSizeMB = files?.[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : null

  const { startUpload } = useUploadThing('fileUploader', {
    onUploadError: (error) => {
      setError('root', { message: 'Upload failed. Please try again.' })
      console.error('Upload error:', error)
    },
  })

  const onSubmit = async (data: UploadFormValues) => {
    const file = data.files[0]
    const fileType = resolveFileType(file)
    const deviceInfo = getDeviceInfo()
    const fileAccessType = data.accessType as FileAccessType

    setShareLinks(null)
    setCopied(false)
    clearErrors('root')

    if (!fileType) {
      setError('root', { message: 'This file type is not supported.' })
      return
    }

    try {
      const uploadResult = await startUpload(data.files, {
        accessType: fileAccessType,
        password: data.accessType === 'protected' ? data.password : undefined,
        expireAt: data.expireAt,
        fileType,
        deviceInfo: JSON.stringify(deviceInfo),
      })

      const uploadedFile = uploadResult?.[0]

      if (!uploadedFile) {
        throw new Error('Upload did not return a storage key')
      }

      try {
        const fileRecord = await uploadFile({
          fileName: uploadedFile.name,
          fileType,
          fileSize: uploadedFile.size,
          storageKey: uploadedFile.key,
          clientId: getClientId(),
          accessType: fileAccessType,
          expireAt: data.expireAt,
          password: data.accessType === 'protected' ? data.password : undefined,
          deviceInfo,
        })

        setShareLinks(getShareLink(fileRecord.shareToken))
        setShowPassword(false)
        reset()
      } catch (metadataError) {
        try {
          await deleteUploadedStorageFile(uploadedFile.key)
        } catch (cleanupError) {
          console.error('Upload cleanup failed:', {
            storageKey: uploadedFile.key,
            error: cleanupError,
          })
        }

        throw metadataError
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('root', { message: 'Upload failed. Please try again.' })
    }
  }

  const handleCopy = () => {
    if (!shareLinks) return
    navigator.clipboard.writeText(shareLinks)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setShareLinks(null)
    setShowPassword(false)
    clearErrors('root')
    reset()
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
        {!shareLinks ? (
          <VStack gap={5} alignItems="stretch" as="form" onSubmit={handleSubmit(onSubmit)}>
            {/* File dropzone */}
            <Controller
              name="files"
              control={control}
              render={({ field }) => (
                <Field.Root invalid={!!errors.files}>
                  <FileUploadRoot
                    maxFiles={1}
                    accept={ACCEPTED_UPLOAD_MIME_TYPES}
                    onFileChange={(details) => {
                      clearErrors('root')
                      field.onChange(details.acceptedFiles)
                    }}
                    alignItems="stretch"
                  >
                    <FileUploadDropzone
                      label="Drop your file here"
                      description="PDF, DOCX, XLSX, ZIP — up to 10 MB"
                      borderWidth="1.5px"
                      borderStyle="dashed"
                      borderColor={errors.files ? 'red.400' : 'brandAlpha.50'}
                      borderRadius="xl"
                      bg="brandAlpha.4"
                      cursor="pointer"
                      _hover={{ bg: 'brandAlpha.8', borderColor: 'brand.400' }}
                      className="text-black"
                    />
                    <FileUploadList />
                  </FileUploadRoot>
                  {errors.files && <Field.ErrorText>{errors.files.message}</Field.ErrorText>}
                </Field.Root>
              )}
            />

            {/* Format badges + file size */}
            <HStack gap={2} justify="center" flexWrap="wrap">
              {SUPPORTED_UPLOAD_FORMATS.map((label) => (
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
              {fileSizeMB && (
                <HStack gap={1} px={2.5} py={1} borderRadius="md" bg="brandAlpha.8" borderWidth="1px" borderColor="blackAlpha.100">
                  <Icon as={LuFile} boxSize={3} color="ink.600" />
                  <Text fontSize="xs" fontWeight="500" color="ink.600" fontFamily="var(--font-dm-sans)">
                    {fileSizeMB} MB
                  </Text>
                </HStack>
              )}
            </HStack>

            {/* Access Type */}
            <Controller
              name="accessType"
              control={control}
              render={({ field }) => (
                <Field.Root>
                  <Select.Root
                    collection={ACCESS_TYPES}
                    size="sm"
                    value={[field.value]}
                    onValueChange={(e) => {
                      const val = e.value[0] as 'public' | 'protected'
                      field.onChange(val)
                      if (val !== 'protected') {
                        setValue('password', '')
                        setShowPassword(false)
                      } else {
                        setTimeout(() => setFocus('password'), 0)
                      }
                    }}
                  >
                    <Select.HiddenSelect />
                    <Select.Label className="text-left text-black">Access Type</Select.Label>
                    <Select.Control>
                      <Select.Trigger bg="brandAlpha.4">
                        <Select.ValueText className="text-black" placeholder="Access Type" />
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
                </Field.Root>
              )}
            />

            {/* Password — only when protected */}
            {accessType === 'protected' && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Field.Root invalid={!!errors.password}>
                    <Field.Label className="text-left text-black">
                      <HStack gap={1}>
                        <Icon as={LuLock} boxSize={4} />
                        <Text>Password</Text>
                      </HStack>
                    </Field.Label>
                    <Box position="relative" w="full">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Set a password for this file"
                        bg="brand.50"
                        borderWidth="1px"
                        borderColor={errors.password ? 'red.400' : 'blackAlpha.200'}
                        borderRadius="xl"
                        px={4}
                        py={3}
                        pr={12}
                        fontSize="md"
                        color="ink.900"
                        _placeholder={{ color: 'ink.400' }}
                        _focus={{
                          borderColor: 'brand.400',
                          boxShadow: '0 0 0 3px rgba(200,169,110,0.1)',
                        }}
                      />
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        type="button"
                        size="sm"
                        variant="ghost"
                        color="ink.600"
                        position="absolute"
                        top="50%"
                        right={2}
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword((current) => !current)}
                        _hover={{ bg: 'blackAlpha.50' }}
                      >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </IconButton>
                    </Box>
                    {errors.password && <Field.ErrorText>{errors.password.message}</Field.ErrorText>}
                  </Field.Root>
                )}
              />
            )}

            {/* Expiration */}
            <Controller
              name="expireAt"
              control={control}
              render={({ field }) => (
                <Field.Root invalid={!!errors.expireAt}>
                  <Field.Label className="text-left text-black">
                    <HStack gap={1}>
                      <Icon as={LuClock} boxSize={4} />
                      <Text>Expires At</Text>
                    </HStack>
                  </Field.Label>
                  <Input
                    {...field}
                    type="datetime-local"
                    bg="brand.50"
                    borderWidth="1px"
                    borderColor={errors.expireAt ? 'red.400' : 'blackAlpha.200'}
                    borderRadius="xl"
                    px={4}
                    py={3}
                    fontSize="md"
                    min={new Date().toISOString().slice(0, 16)}
                    color="ink.900"
                    _focus={{
                      borderColor: 'brand.400',
                      boxShadow: '0 0 0 3px rgba(200,169,110,0.1)',
                    }}
                  />
                  {errors.expireAt && <Field.ErrorText>{errors.expireAt.message}</Field.ErrorText>}
                </Field.Root>
              )}
            />

            {errors.root && (
              <Text fontSize="sm" color="red.500" fontFamily="var(--font-dm-sans)" textAlign="center">
                {errors.root.message}
              </Text>
            )}

            <Button
              type="submit"
              w="full"
              disabled={isSubmitting || files.length === 0}
              loading={isSubmitting}
              loadingText="Uploading..."
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

            <HStack justify="center" gap={1}>
              <Icon as={LuShield} color="ink.600" boxSize={3} />
              <Text fontSize="xs" color="ink.600" fontFamily="var(--font-dm-sans)">
                Files under 5 MB require no registration
              </Text>
            </HStack>
          </VStack>
        ) : (
          /* Success state */
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

            <HStack bg="brand.50" borderWidth="1px" borderColor="blackAlpha.200" borderRadius="xl" px={4} py={3} justify="space-between" gap={3}>
              <Text fontSize="sm" color="ink.900" fontFamily="var(--font-dm-sans)" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex={1}>
                {shareLinks}
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
