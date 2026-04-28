import { createListCollection } from '@chakra-ui/react'

const ACCESS_TYPES = createListCollection({
  items: [
    { label: 'Public', value: 'public' },
    { label: 'Protected', value: 'protected' },
  ],
})


export { ACCESS_TYPES }
