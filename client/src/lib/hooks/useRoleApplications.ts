import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { 
  RoleApplication, 
  RoleApplicationCreate, 
  RoleApplicationUpdate,
  ApplicationableRole,
  RoleApplicationStatus
} from '../types/api'

// API functions
const roleApplicationsApi = {
  apply: async (data: RoleApplicationCreate): Promise<{ message: string; data: { application_id: number } }> => {
    const response = await apiClient.post('/role-applications/apply', data)
    return response.data
  },

  getMyApplications: async (): Promise<RoleApplication[]> => {
    const response = await apiClient.get('/role-applications/my-applications')
    return response.data
  },

  getAllApplications: async (
    status?: RoleApplicationStatus,
    role?: ApplicationableRole,
    skip = 0,
    limit = 20
  ): Promise<RoleApplication[]> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (role) params.append('role', role)
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())
    
    const response = await apiClient.get(`/role-applications/all?${params}`)
    return response.data
  },

  review: async (applicationId: number, data: RoleApplicationUpdate): Promise<{ message: string }> => {
    const response = await apiClient.put(`/role-applications/${applicationId}/review`, data)
    return response.data
  },

  withdraw: async (applicationId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/role-applications/${applicationId}`)
    return response.data
  },

  getStats: async (): Promise<{
    total_applications: number
    pending_applications: number
    approved_applications: number
    rejected_applications: number
    applications_by_role: Record<string, number>
  }> => {
    const response = await apiClient.get('/role-applications/stats')
    return response.data
  }
}

// Hooks
export const useRoleApplications = () => {
  const queryClient = useQueryClient()

  const applyForRole = useMutation({
    mutationFn: roleApplicationsApi.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'stats'] })
    }
  })

  const reviewApplication = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: RoleApplicationUpdate }) =>
      roleApplicationsApi.review(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const withdrawApplication = useMutation({
    mutationFn: roleApplicationsApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['roleApplications', 'stats'] })
    }
  })

  return {
    applyForRole,
    reviewApplication,
    withdrawApplication,
  }
}

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['roleApplications', 'my'],
    queryFn: roleApplicationsApi.getMyApplications
  })
}

export const useAllApplications = (
  status?: RoleApplicationStatus,
  role?: ApplicationableRole,
  skip = 0,
  limit = 20
) => {
  return useQuery({
    queryKey: ['roleApplications', 'all', status, role, skip, limit],
    queryFn: () => roleApplicationsApi.getAllApplications(status, role, skip, limit)
  })
}

export const useApplicationStats = () => {
  return useQuery({
    queryKey: ['roleApplications', 'stats'],
    queryFn: roleApplicationsApi.getStats
  })
}
