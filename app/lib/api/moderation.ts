import type { CreateReportPayload, ReportReceipt } from '@/types/moderation'
import { ApiError, apiClient } from './client'

export async function createReport(payload: CreateReportPayload): Promise<ReportReceipt> {
  const response = await apiClient<ReportReceipt>('/api/moderation/reports', {
    method: 'POST',
    body: payload,
  })

  if (!response.success) {
    throw new ApiError(response.msg || 'Could not send the report', response.status)
  }

  return response.data
}
