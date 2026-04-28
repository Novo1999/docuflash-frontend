# Workflow Definitions

This document defines all workflows available in the DocuFlash system.

---

## Workflow 1: Document Upload Flow

### Overview
Handles the complete document upload process from file selection to storage.

### Workflow Definition
```json
{
  "id": "document-upload",
  "name": "Document Upload Workflow",
  "description": "Complete document upload process with validation and storage",
  "version": "1.0.0",
  "onError": "stop",
  "maxRetries": 3,
  "timeout": 300000
}
```

### Steps

| Step | Agent | Description | Input | Output |
|------|-------|-------------|-------|--------|
| 1 | ValidationAgent | Validate file type, size, and integrity | File | Validation result |
| 2 | UploadAgent | Handle file upload process | Validated file | Upload metadata |
| 3 | StorageAgent | Store file in storage backend | Upload metadata | Storage location |
| 4 | NotificationAgent | Send upload completion notification | Storage result | Notification status |

### Flow Diagram
```
┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
│  Start   │───▶│  Validation  │───▶│  Upload   │───▶│   Storage   │───▶│ Complete │
│          │    │    Agent     │    │   Agent   │    │    Agent    │    │          │
└──────────┘    └──────────────┘    └───────────┘    └──────────────┘    └──────────┘
                      │
                      ▼
               ┌──────────────┐
               │ Notification │
               │    Agent     │
               └──────────────┘
```

### Error Handling
- **Validation failure**: Notify user, terminate workflow
- **Upload failure**: Retry up to 3 times with exponential backoff
- **Storage failure**: Retry with fallback storage provider

---

## Workflow 2: Document Sharing Flow

### Overview
Generates a shareable link for an uploaded document.

### Workflow Definition
```json
{
  "id": "document-share",
  "name": "Document Sharing Workflow",
  "description": "Generate shareable links for documents",
  "version": "1.0.0",
  "onError": "stop",
  "maxRetries": 2,
  "timeout": 60000
}
```

### Steps

| Step | Agent | Description | Input | Output |
|------|-------|-------------|-------|--------|
| 1 | ValidationAgent | Verify file exists and is shareable | File key | Validation result |
| 2 | ShareAgent | Generate sharing link | File key, access type | Share link |
| 3 | NotificationAgent | Send share notification | Share result | Notification status |

### Flow Diagram
```
┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
│  Start   │───▶│  Validation  │───▶│   Share   │───▶│ Notification│───▶│ Complete │
│          │    │    Agent     │    │   Agent   │    │    Agent    │    │          │
└──────────┘    └──────────────┘    └───────────┘    └──────────────┘    └──────────┘
```

### Conditions
- Step 2 only executes if Step 1 validation passes
- Protected shares require password configuration

### Error Handling
- **File not found**: Return error to user
- **Link generation failure**: Retry once, then fail

---

## Workflow 3: Document Processing Flow

### Overview
Complete end-to-end document processing from upload to share.

### Workflow Definition
```json
{
  "id": "document-processing",
  "name": "Complete Document Processing Workflow",
  "description": "Full document lifecycle: upload, validate, store, and share",
  "version": "1.0.0",
  "onError": "stop",
  "maxRetries": 3,
  "timeout": 600000
}
```

### Steps

| Step | Agent | Description |
|------|-------|-------------|
| 1 | ValidationAgent | Validate uploaded file |
| 2 | UploadAgent | Process file upload |
| 3 | StorageAgent | Store file |
| 4 | ShareAgent | Generate sharing link |
| 5 | NotificationAgent | Send completion notification |

### Flow Diagram
```
                         ┌──────────────┐
                    ┌───▶│  Validation  │
                    │    │    Agent     │
                    │    └──────────────┘
                    │           │
                    │           ▼
┌──────────┐    ┌──────────────┐    ┌───────────┐
│  Start   │    │    Upload    │───▶│  Storage  │
│          │    │    Agent     │    │   Agent   │
└──────────┘    └──────────────┘    └───────────┘
                    │                    │
                    │                    ▼
                    │           ┌───────────┐
                    │           │   Share   │
                    └──────────▶│   Agent   │
                                └───────────┘
                                      │
                                      ▼
                                ┌──────────────┐
                                │ Notification │
                                │    Agent     │
                                └──────────────┘
```

### Parallel Execution
Steps 2-3 can execute in parallel for multiple files.

---

## Workflow 4: File Cleanup Flow

### Overview
Handles cleanup of expired or deleted files.

### Workflow Definition
```json
{
  "id": "file-cleanup",
  "name": "File Cleanup Workflow",
  "description": "Automated cleanup of expired files and shares",
  "version": "1.0.0",
  "onError": "continue",
  "maxRetries": 1,
  "timeout": 120000
}
```

### Steps

| Step | Agent | Description |
|------|-------|-------------|
| 1 | ShareAgent | Find expired shares |
| 2 | ShareAgent | Revoke expired links |
| 3 | StorageAgent | Delete orphaned files |
| 4 | NotificationAgent | Log cleanup summary |

### Flow Diagram
```
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
│  Start   │───▶│   Find    │───▶│   Revoke  │───▶│  Delete   │───▶│  Complete│
│          │    │  Expired  │    │   Links   │    │   Files   │    │          │
└──────────┘    └───────────┘    └───────────┘    └───────────┘    └──────────┘
```

### Schedule
- Runs daily at 2:00 AM UTC
- Can be triggered manually

---

## Workflow 5: Access Verification Flow

### Overview
Verifies user access to protected documents.

### Workflow Definition
```json
{
  "id": "access-verification",
  "name": "Access Verification Workflow",
  "description": "Verify and grant access to protected documents",
  "version": "1.0.0",
  "onError": "stop",
  "maxRetries": 0,
  "timeout": 30000
}
```

### Steps

| Step | Agent | Description |
|------|-------|-------------|
| 1 | ValidationAgent | Validate access token |
| 2 | ShareAgent | Verify share permissions |
| 3 | ShareAgent | Check expiry and limits |
| 4 | NotificationAgent | Log access attempt |

### Flow Diagram
```
┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
│  Start   │───▶│   Validate   │───▶│  Verify   │───▶│   Check   │───▶│  Grant   │
│          │    │    Token     │    │ Permissions│   │  Limits   │    │  Access  │
└──────────┘    └──────────────┘    └───────────┘    └───────────┘    └──────────┘
```

### Conditions
- Access granted only if all checks pass
- Failed attempts are logged

---

## Workflow Configuration Schema

```typescript
interface WorkflowConfig {
  // Workflow identification
  id: string
  name: string
  description: string
  version: string

  // Execution settings
  onError: 'stop' | 'continue' | 'retry'
  maxRetries: number
  timeout: number  // milliseconds

  // Steps
  steps: WorkflowStepConfig[]

  // Optional hooks
  onBeforeStart?: () => Promise<void>
  onComplete?: (result: WorkflowResult) => Promise<void>
  onError?: (error: Error) => Promise<void>
}

interface WorkflowStepConfig {
  id: string
  agentId: string
  name: string
  description?: string

  // Dependencies
  dependsOn?: string[]

  // Input/Output mapping
  inputMapping?: Record<string, string>
  outputMapping?: Record<string, string>

  // Conditional execution
  condition?: (context: WorkflowContext) => boolean

  // Step-specific error handling
  onError?: 'stop' | 'continue' | 'retry'
  maxRetries?: number
}
```

---

## Related Documents

- [Workflow System Overview](./OVERVIEW.md)
- [Subagent Specifications](./SUBAGENTS.md)
- [Integration Guide](./INTEGRATION.md)
