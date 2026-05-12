type JsonLdProps = {
  data: Record<string, unknown>
}

const serializeJsonLd = (data: Record<string, unknown>) => JSON.stringify(data).replace(/</g, '\\u003c')

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
