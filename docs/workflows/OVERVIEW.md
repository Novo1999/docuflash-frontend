# Subagent-Based Workflow System

## Overview

The DocuFlash Subagent-Based Workflow System is a modular, extensible architecture designed to handle complex document processing tasks through coordinated specialized agents. Each subagent is responsible for a specific domain of functionality, working together through a centralized workflow orchestrator.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Orchestrator                     │
│  - Manages workflow execution                                │
│  - Coordinates subagent communication                        │
│  - Handles error recovery and retry logic                    │
│  - Tracks progress and state                                 │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  UploadAgent  │    │  ShareAgent   │    │  Validation   │
│               │    │               │    │    Agent      │
│ - File intake │    │ - Link gen    │    │               │
│ - Type check  │    │ - Permissions │    │ - Validation  │
│ - Size limit  │    │ - Expiry      │    │ - Sanitization│
└───────────────┘    └───────────────┘    └───────────────┘
```

## Core Components

### 1. Workflow Orchestrator
The central coordinator that:
- Manages workflow lifecycle (start, pause, resume, cancel)
- Routes tasks to appropriate subagents
- Handles inter-agent communication
- Manages shared context between agents
- Implements error handling and recovery strategies

### 2. SubAgents
Specialized agents that handle specific tasks:

| Agent | Responsibility |
|-------|---------------|
| `UploadAgent` | File upload handling, type validation, size checks |
| `ShareAgent` | Link generation, permission management, expiry handling |
| `ValidationAgent` | Document validation, content sanitization |
| `NotificationAgent` | User notifications, progress updates |
| `StorageAgent` | File storage management, cleanup operations |

### 3. Workflow Registry
A centralized registry that:
- Stores workflow definitions
- Manages workflow versions
- Provides workflow discovery

### 4. Context Manager
Manages shared state and data flow between subagents:
- Maintains workflow context
- Handles data transformation between agents
- Provides context persistence

## Workflow Execution Model

### Sequential Execution
```
Step 1 → Step 2 → Step 3 → Complete
```

### Parallel Execution
```
        ┌→ Step 2A ─┐
Step 1 ─┤           ├→ Step 3 → Complete
        └→ Step 2B ─┘
```

### Conditional Execution
```
Step 1 → [Condition] → Step 2 (if true)
                     → Step 3 (if false)
```

## Key Features

1. **Modularity**: Each subagent is independently developed, tested, and deployed
2. **Reusability**: Subagents can be composed into multiple workflows
3. **Scalability**: Add new agents without modifying existing ones
4. **Observability**: Built-in logging, metrics, and tracing
5. **Resilience**: Automatic retry, fallback, and error handling
6. **Flexibility**: Support for synchronous and asynchronous execution

## Use Cases

### Document Upload Flow
1. `ValidationAgent` validates file type and size
2. `UploadAgent` handles the upload process
3. `StorageAgent` stores the file
4. `ShareAgent` generates sharing link

### Document Sharing Flow
1. `ValidationAgent` verifies sharing permissions
2. `ShareAgent` generates or retrieves sharing link
3. `NotificationAgent` sends notification to recipients

## Configuration

Workflows are configured using a declarative JSON/YAML format:

```json
{
  "id": "document-upload-flow",
  "name": "Document Upload Workflow",
  "version": "1.0.0",
  "steps": [
    {
      "id": "validate",
      "agentId": "ValidationAgent",
      "name": "Validate Document"
    },
    {
      "id": "upload",
      "agentId": "UploadAgent",
      "name": "Upload Document",
      "dependsOn": ["validate"]
    },
    {
      "id": "share",
      "agentId": "ShareAgent",
      "name": "Generate Share Link",
      "dependsOn": ["upload"]
    }
  ]
}
```

## Error Handling Strategies

| Strategy | Description |
|----------|-------------|
| `stop` | Immediately halt workflow on error |
| `continue` | Log error and proceed to next step |
| `retry` | Retry failed step with configurable attempts |
| `fallback` | Execute alternative step on failure |

## Related Documents

- [Subagent Specifications](./SUBAGENTS.md)
- [Workflow Definitions](./WORKFLOWS.md)
- [Integration Guide](./INTEGRATION.md)
