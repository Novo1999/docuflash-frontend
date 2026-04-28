# Subagent Specifications

This document details the specifications for each subagent in the DocuFlash workflow system.

---

## UploadAgent

### Overview
Handles all file upload operations including file intake, validation, and transfer to storage.

### Agent Definition
```typescript
{
  id: "upload-agent",
  name: "UploadAgent",
  description: "Handles file upload operations",
  version: "1.0.0"
}
```

### Responsibilities
- Accept file uploads from users
- Validate file types (PDF, DOCX, XLSX, ZIP)
- Check file size limits (default: 10MB, configurable)
- Handle multipart uploads for large files
- Track upload progress
- Report upload status

### Input Schema
```typescript
interface UploadAgentInput {
  file: File
  accessType: 'public' | 'protected'
  metadata?: {
    originalName?: string
    description?: string
    tags?: string[]
  }
}
```

### Output Schema
```typescript
interface UploadAgentOutput {
  fileKey: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: Date
  accessType: 'public' | 'protected'
  storageLocation: string
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `UPLOAD_001` | File type not allowed |
| `UPLOAD_002` | File size exceeds limit |
| `UPLOAD_003` | Upload interrupted |
| `UPLOAD_004` | Storage unavailable |

### Configuration Options
```typescript
interface UploadAgentConfig {
  maxFileSize: number        // bytes, default: 10485760 (10MB)
  allowedTypes: string[]     // MIME types
  storageProvider: string    // 'local' | 's3' | 'azure'
  enableProgressTracking: boolean
  retryAttempts: number
  retryDelay: number         // milliseconds
}
```

---

## ShareAgent

### Overview
Manages document sharing operations including link generation, permission management, and access control.

### Agent Definition
```typescript
{
  id: "share-agent",
  name: "ShareAgent",
  description: "Handles document sharing and link generation",
  version: "1.0.0"
}
```

### Responsibilities
- Generate unique sharing links
- Manage access permissions (public/protected)
- Set and enforce link expiration
- Track access analytics
- Handle link revocation
- Manage password protection for protected shares

### Input Schema
```typescript
interface ShareAgentInput {
  fileKey: string
  accessType: 'public' | 'protected'
  expiresAt?: Date
  password?: string
  maxDownloads?: number
  allowedEmails?: string[]
}
```

### Output Schema
```typescript
interface ShareAgentOutput {
  shareLink: string
  shareId: string
  fileKey: string
  accessType: 'public' | 'protected'
  expiresAt?: Date
  maxDownloads?: number
  createdAt: Date
  downloadCount: number
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `SHARE_001` | File not found |
| `SHARE_002` | Invalid access type |
| `SHARE_003` | Link generation failed |
| `SHARE_004` | Share already exists |
| `SHARE_005` | Link expired |

### Configuration Options
```typescript
interface ShareAgentConfig {
  baseUrl: string
  linkLength: number         // characters in generated link
  defaultExpiryHours: number
  maxExpiryHours: number
  enablePasswordProtection: boolean
  enableDownloadLimits: boolean
  enableEmailRestrictions: boolean
}
```

---

## ValidationAgent

### Overview
Performs comprehensive validation and sanitization of documents before processing.

### Agent Definition
```typescript
{
  id: "validation-agent",
  name: "ValidationAgent",
  description: "Validates and sanitizes documents",
  version: "1.0.0"
}
```

### Responsibilities
- Validate file integrity
- Check for malicious content
- Sanitize document metadata
- Verify file format compliance
- Extract and validate document properties
- Detect and reject corrupted files

### Input Schema
```typescript
interface ValidationAgentInput {
  file: File | ArrayBuffer
  expectedType?: string
  checks: ValidationCheck[]
}

type ValidationCheck =
  | 'file-type'
  | 'file-size'
  | 'malware'
  | 'corruption'
  | 'metadata'
```

### Output Schema
```typescript
interface ValidationAgentOutput {
  isValid: boolean
  fileType: string
  fileSize: number
  properties: {
    pageCount?: number
    hasText?: boolean
    isEncrypted?: boolean
    author?: string
    createdAt?: Date
    modifiedAt?: Date
  }
  warnings: string[]
  errors: string[]
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `VALID_001` | Invalid file type |
| `VALID_002` | File corrupted |
| `VALID_003` | Malware detected |
| `VALID_004` | Encryption detected |
| `VALID_005` | Invalid metadata |

### Configuration Options
```typescript
interface ValidationAgentConfig {
  enableMalwareScan: boolean
  enableCorruptionCheck: boolean
  strictTypeValidation: boolean
  maxMetadataSize: number
  allowedEncryptionMethods: string[]
}
```

---

## NotificationAgent

### Overview
Handles all user notifications including progress updates, completion notices, and error alerts.

### Agent Definition
```typescript
{
  id: "notification-agent",
  name: "NotificationAgent",
  description: "Manages user notifications",
  version: "1.0.0"
}
```

### Responsibilities
- Send real-time progress updates
- Notify on workflow completion
- Alert on errors and failures
- Manage notification preferences
- Support multiple notification channels (toast, email, webhook)

### Input Schema
```typescript
interface NotificationAgentInput {
  type: 'progress' | 'success' | 'error' | 'warning'
  channel: 'toast' | 'email' | 'webhook'
  title: string
  message: string
  data?: Record<string, unknown>
  priority: 'low' | 'normal' | 'high'
}
```

### Output Schema
```typescript
interface NotificationAgentOutput {
  notificationId: string
  status: 'sent' | 'queued' | 'failed'
  deliveredAt?: Date
  recipientCount?: number
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `NOTIF_001` | Invalid notification type |
| `NOTIF_002` | Channel unavailable |
| `NOTIF_003` | Rate limit exceeded |
| `NOTIF_004` | Invalid recipient |

### Configuration Options
```typescript
interface NotificationAgentConfig {
  enabledChannels: string[]
  rateLimitPerMinute: number
  enableProgressNotifications: boolean
  defaultPriority: 'low' | 'normal' | 'high'
  webhookUrl?: string
}
```

---

## StorageAgent

### Overview
Manages file storage operations including storage, retrieval, and cleanup.

### Agent Definition
```typescript
{
  id: "storage-agent",
  name: "StorageAgent",
  description: "Handles file storage operations",
  version: "1.0.0"
}
```

### Responsibilities
- Store files in configured storage backend
- Retrieve files by key
- Manage file metadata
- Handle storage cleanup and garbage collection
- Support multiple storage providers
- Manage storage quotas

### Input Schema
```typescript
interface StorageAgentInput {
  action: 'store' | 'retrieve' | 'delete' | 'cleanup'
  fileKey?: string
  file?: File | ArrayBuffer
  metadata?: Record<string, unknown>
  ttl?: number  // time to live in seconds
}
```

### Output Schema
```typescript
interface StorageAgentOutput {
  success: boolean
  fileKey?: string
  storageLocation?: string
  fileSize?: number
  metadata?: Record<string, unknown>
  deletedCount?: number
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `STORE_001` | Storage unavailable |
| `STORE_002` | File not found |
| `STORE_003` | Storage quota exceeded |
| `STORE_004` | Delete failed |
| `STORE_005` | Invalid file key |

### Configuration Options
```typescript
interface StorageAgentConfig {
  provider: 'local' | 's3' | 'azure' | 'gcs'
  bucket?: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  enableEncryption: boolean
  enableCompression: boolean
  defaultTTL: number  // seconds, 0 = never expire
}
```

---

## SubAgent Base Interface

All subagents implement the following base interface:

```typescript
interface SubAgent<TInput = unknown, TOutput = unknown> {
  // Agent identification
  definition: AgentDefinition

  // Core execution method
  execute(params: AgentExecuteParams<TInput>): Promise<AgentResult & { data?: TOutput }>

  // Capability checking
  canHandle(input: unknown): boolean

  // Lifecycle management
  getStatus(): AgentStatus
  reset(): void

  // Optional hooks
  onBeforeExecute?(input: TInput): Promise<void>
  onAfterExecute?(output: TOutput): Promise<void>
  onError?(error: Error): Promise<void>
}
```

---

## Related Documents

- [Workflow System Overview](./OVERVIEW.md)
- [Workflow Definitions](./WORKFLOWS.md)
- [Integration Guide](./INTEGRATION.md)
