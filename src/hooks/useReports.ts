import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { type  ExportReportPayload, type  SalesReport, type ReportStats, ReportPeriod } from '../types/admin'

/**
 * Mutation hook to export a sales report as PDF, Excel, or CSV.
 * The response is a binary blob — this hook auto-triggers a file download.
 */
export function useExportReport() {
  return useMutation<void, Error, ExportReportPayload>({
    mutationFn: async ({ period, format }) => {
      const response = await apiClient.get(ENDPOINTS.REPORTS.EXPORT, {
        params: { period, format },
        responseType: 'blob',
      })

      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
      }

      const blob = new Blob([response.data], { type: mimeTypes[format] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `civictree-report-${period}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}


/** Fetches sales report data for a given period (daily, weekly, monthly, annual). */
export function useSalesReport(period: ReportPeriod) {
  return useQuery<SalesReport[]>({
    queryKey: ['reports', 'sales', period],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: SalesReport[] }>(ENDPOINTS.REPORTS.SALES, {
          params: { period },
        })
        .then((r) => r.data.data),
  })
}

/** Fetches the aggregated 6-month report statistics. */
export function useReportStats() {
  return useQuery<ReportStats[]>({
    queryKey: ['reports', 'stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ReportStats[] }>(ENDPOINTS.REPORTS.STATS)
        .then((r) => r.data.data),
  })
}
