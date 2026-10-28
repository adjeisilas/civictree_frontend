export type TimetableType = 'BECE' | 'WASSCE_NOVDEC' | 'CTVET_NABTEX'

export interface TimetableConfig {
  id: string
  type: TimetableType
  title: string
  examYear: number
  startDate: string
  description: string
  isPublished: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: string
  createdAt: string
  updatedAt: string
}

export interface TimetableApiResponse {
  success: boolean
  message: string
  data: TimetableConfig[]
}

export interface SingleTimetableApiResponse {
  success: boolean
  message: string
  data: TimetableConfig
}
