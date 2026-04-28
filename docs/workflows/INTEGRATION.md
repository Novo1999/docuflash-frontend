# Integration Guide

This guide explains how to integrate the subagent-based workflow system into the DocuFlash application.

---

## Quick Start

### 1. Install Dependencies

The workflow system requires no additional dependencies beyond the existing Next.js setup.

### 2. Import Workflow Components

```typescript
import { WorkflowOrchestrator } from '@/app/workflows/core/WorkflowOrchestrator'
import { UploadAgent } from '@/app/workflows/agents/UploadAgent'
import { ShareAgent } from '@/app/workflows/agents/ShareAgent'
import { ValidationAgent } from '@/app/workflows/agents/ValidationAgent'
```

### 3. Initialize the System

```typescript
// Create agent registry
const registry = new SubAgentRegistry()

// Register agents
registry.register(new UploadAgent())
registry.register(new ShareAgent())
registry.register(new ValidationAgent())

// Create orchestrator
const orchestrator = new WorkflowOrchestrator(registry)
```

---

## Using Workflows in React Components

### Basic Usage with Hook

```typescript
'use client'

import { useWorkflow } from '@/app/workflows/hooks/useWorkflow'
import { WORKFLOW_IDS } from '@/app/workflows/registry'

function UploadComponent() {
  const {
    execute,
    status,
    progress,
    result,
    error
  } = useWorkflow(WORKFLOW_IDS.DOCUMENT_UPLOAD)

  const handleUpload = async (file: File) => {
    try {
      await execute({ file, accessType: 'public' })
      console.log('Upload complete:', result)
    } catch (err) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div>
      <button
        onClick={() => handleUpload(selectedFile)}
        disabled={status === 'running'}
      >
        {status === 'running' ? 'Uploading...' : 'Upload'}
      </button>

      {progress && (
        <ProgressBar
          current={progress.completedSteps}
          total={progress.totalSteps}
        />
      )}
    </div>
  )
}
```

### With Progress Callback

```typescript
import { useWorkflow } from '@/app/workflows/hooks/useWorkflow'

function UploadWithProgress() {
  const { execute, status, progress } = useWorkflow(
    WORKFLOW_IDS.DOCUMENT_UPLOAD,
    {
      onProgress: (progress) => {
        console.log(`Step ${progress.completedSteps}/${progress.totalSteps}`)
        console.log(`Current step: ${progress.currentStep}`)
      }
    }
  )

  // ... rest of component
}
```

---

## Creating Custom Workflows

### Step 1: Define Workflow Configuration

```typescript
import { WorkflowConfig } from '@/app/workflows/types'

export const MY_CUSTOM_WORKFLOW: WorkflowConfig = {
  id: 'my-custom-workflow',
  name: 'My Custom Workflow',
  description: 'Description of what this workflow does',
  version: '1.0.0',
  onError: 'stop',
  maxRetries: 3,
  timeout: 120000,
  steps: [
    {
      id: 'step-1',
      agentId: 'validation-agent',
      name: 'Validate Input',
    },
    {
      id: 'step-2',
      agentId: 'upload-agent',
      name: 'Upload File',
      dependsOn: ['step-1'],
    },
    {
      id: 'step-3',
      agentId: 'share-agent',
      name: 'Generate Link',
      dependsOn: ['step-2'],
    },
  ],
}
```

### Step 2: Register Workflow

```typescript
import { workflowRegistry } from '@/app/workflows/registry'
import { MY_CUSTOM_WORKFLOW } from './my-custom-workflow'

workflowRegistry.register(MY_CUSTOM_WORKFLOW)
```

### Step 3: Use in Component

```typescript
const { execute } = useWorkflow('my-custom-workflow')
```

---

## Creating Custom SubAgents

### Step 1: Extend Base Agent

```typescript
import { SubAgent, AgentDefinition, AgentExecuteParams, AgentResult } from '@/app/workflows/types'

interface MyAgentInput {
  data: string
}

interface MyAgentOutput {
  processed: string
}

export class MyCustomAgent implements SubAgent<MyAgentInput, MyAgentOutput> {
  public readonly definition: AgentDefinition = {
    id: 'my-custom-agent',
    name: 'MyCustomAgent',
    description: 'Processes data in a custom way',
    version: '1.0.0',
  }

  private status: AgentStatus = 'idle'

  public async execute(
    params: AgentExecuteParams<MyAgentInput>
  ): Promise<AgentResult & { data?: MyAgentOutput }> {
    this.status = 'running'

    try {
      // Your processing logic here
      const processed = params.input.data.toUpperCase()

      this.status = 'completed'

      return {
        success: true,
        data: { processed },
      }
    } catch (error) {
      this.status = 'failed'
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  public canHandle(input: unknown): boolean {
    return typeof input === 'object' && input !== null && 'data' in input
  }

  public getStatus(): AgentStatus {
    return this.status
  }

  public reset(): void {
    this.status = 'idle'
  }
}
```

### Step 2: Register Agent

```typescript
import { subAgentRegistry } from '@/app/workflows/registry'
import { MyCustomAgent } from './agents/MyCustomAgent'

subAgentRegistry.register(new MyCustomAgent())
```

---

## Error Handling

### Workflow-Level Error Handling

```typescript
const { execute, error } = useWorkflow(WORKFLOW_IDS.DOCUMENT_UPLOAD, {
  onError: (error) => {
    console.error('Workflow error:', error)
    // Show user notification
  },
  onComplete: (result) => {
    console.log('Workflow completed:', result)
  },
})
```

### Step-Level Retry

```typescript
const workflow: WorkflowConfig = {
  // ... other config
  steps: [
    {
      id: 'upload',
      agentId: 'upload-agent',
      name: 'Upload File',
      onError: 'retry',
      maxRetries: 5,
    },
  ],
}
```

### Error Recovery

```typescript
const { execute, status, error } = useWorkflow(WORKFLOW_IDS.DOCUMENT_UPLOAD)

if (status === 'failed') {
  // Option 1: Retry entire workflow
  await execute(input)

  // Option 2: Resume from specific step
  await resumeFromStep('step-2')
}
```

---

## Advanced Patterns

### Parallel Step Execution

```typescript
const workflow: WorkflowConfig = {
  id: 'parallel-upload',
  name: 'Parallel File Upload',
  version: '1.0.0',
  steps: [
    {
      id: 'upload-1',
      agentId: 'upload-agent',
      name: 'Upload File 1',
    },
    {
      id: 'upload-2',
      agentId: 'upload-agent',
      name: 'Upload File 2',
    },
    {
      id: 'finalize',
      agentId: 'share-agent',
      name: 'Generate Links',
      dependsOn: ['upload-1', 'upload-2'],
    },
  ],
}
```

### Conditional Execution

```typescript
const workflow: WorkflowConfig = {
  id: 'conditional-workflow',
  name: 'Conditional Workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'validate',
      agentId: 'validation-agent',
      name: 'Validate',
    },
    {
      id: 'public-share',
      agentId: 'share-agent',
      name: 'Public Share',
      dependsOn: ['validate'],
      condition: (ctx) => ctx.accessType === 'public',
    },
    {
      id: 'protected-share',
      agentId: 'share-agent',
      name: 'Protected Share',
      dependsOn: ['validate'],
      condition: (ctx) => ctx.accessType === 'protected',
    },
  ],
}
```

### Workflow Chaining

```typescript
async function uploadAndShare(file: File) {
  // Execute upload workflow
  const uploadResult = await executeWorkflow(WORKFLOW_IDS.DOCUMENT_UPLOAD, { file })

  // Execute share workflow with upload result
  const shareResult = await executeWorkflow(WORKFLOW_IDS.DOCUMENT_SHARE, {
    fileKey: uploadResult.fileKey,
    accessType: 'public',
  })

  return shareResult
}
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Workflow Configuration
NEXT_PUBLIC_WORKFLOW_TIMEOUT=300000
NEXT_PUBLIC_WORKFLOW_MAX_RETRIES=3

# Storage Configuration
NEXT_PUBLIC_STORAGE_PROVIDER=s3
NEXT_PUBLIC_STORAGE_BUCKET=docuflash-files

# Share Configuration
NEXT_PUBLIC_SHARE_BASE_URL=https://docuflash.app
NEXT_PUBLIC_SHARE_DEFAULT_EXPIRY_HOURS=24
```

### Provider Setup

```typescript
// app/workflows/provider.tsx
'use client'

import { WorkflowProvider } from '@/app/workflows/context/WorkflowContext'

export function WorkflowConfigProvider({ children }) {
  const config = {
    timeout: Number(process.env.NEXT_PUBLIC_WORKFLOW_TIMEOUT) || 300000,
    maxRetries: Number(process.env.NEXT_PUBLIC_WORKFLOW_MAX_RETRIES) || 3,
    enableLogging: process.env.NODE_ENV === 'development',
  }

  return (
    <WorkflowProvider config={config}>
      {children}
    </WorkflowProvider>
  )
}
```

---

## Testing

### Unit Testing Agents

```typescript
import { UploadAgent } from '@/app/workflows/agents/UploadAgent'

describe('UploadAgent', () => {
  it('should accept valid file', async () => {
    const agent = new UploadAgent()
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    const result = await agent.execute({
      input: { file, accessType: 'public' },
      context: {},
    })

    expect(result.success).toBe(true)
  })

  it('should reject invalid file type', async () => {
    const agent = new UploadAgent()
    const file = new File(['test'], 'test.exe', { type: 'application/exe' })

    const result = await agent.execute({
      input: { file, accessType: 'public' },
      context: {},
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('File type not allowed')
  })
})
```

### Integration Testing Workflows

```typescript
import { executeWorkflow } from '@/app/workflows/core/executeWorkflow'

describe('Document Upload Workflow', () => {
  it('should complete full upload flow', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    const result = await executeWorkflow(WORKFLOW_IDS.DOCUMENT_UPLOAD, {
      file,
      accessType: 'public',
    })

    expect(result.status).toBe('completed')
    expect(result.result).toHaveProperty('fileKey')
    expect(result.result).toHaveProperty('shareLink')
  })
})
```

---

## Debugging

### Enable Debug Logging

```typescript
import { setDebugMode } from '@/app/workflows/utils/logging'

// Enable in development
setDebugMode(true)

// Logs all workflow steps, agent execution, and context changes
```

### Workflow Inspector

```typescript
import { useWorkflowInspector } from '@/app/workflows/hooks/useWorkflowInspector'

function DebugPanel({ workflowId }) {
  const inspector = useWorkflowInspector(workflowId)

  return (
    <div>
      <pre>{JSON.stringify(inspector, null, 2)}</pre>
    </div>
  )
}
```

---

## Related Documents

- [Workflow System Overview](./OVERVIEW.md)
- [Subagent Specifications](./SUBAGENTS.md)
- [Workflow Definitions](./WORKFLOWS.md)
