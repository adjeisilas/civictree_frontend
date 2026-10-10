import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { TimetableApiResponse, SingleTimetableApiResponse } from '../types/timetable'

export const usePublicTimetables = () => {
  return useQuery({
    queryKey: ['timetables', 'public'],
    queryFn: async () => {
      const response = await apiClient.get<TimetableApiResponse>(ENDPOINTS.WEBSITE.TIMETABLE)
      return response.data.data
    },
  })
}

export const useAdminTimetables = () => {
  return useQuery({
    queryKey: ['timetables', 'admin'],
    queryFn: async () => {
      const response = await apiClient.get<TimetableApiResponse>(ENDPOINTS.ADMIN_TIMETABLES.GET_ALL)
      return response.data.data
    },
  })
}

export const useUpdateTimetable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, formData }: { type: string; formData: FormData }) => {
      const response = await apiClient.patch<SingleTimetableApiResponse>(
        ENDPOINTS.ADMIN_TIMETABLES.UPDATE(type),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
    },
  })
}
