import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RoleApplicationsAPI } from '../api/role-applications'
import {
  RoleApplication,
  RoleApplicationUpdate,
  ApplicationableRole,
  RoleApplicationStatus,
  PaginatedResponse
} from '../types/api'

const roleApplicationsApi = {
  apply: RoleApplicationsAPI.applyForRole,
  getMyApplications: async (): Promise<PaginatedResponse<RoleApplication>> => {
    return RoleApplicationsAPI.getMyApplications()
  },
  getAllApplications: async (
    status?: RoleApplicationStatus,
    role?: ApplicationableRole,
    skip = 0,
    limit = 20
  ): Promise<PaginatedResponse<RoleApplication>> => {
    const page = Math.floor(skip / limit) + 1
    const statusParam = status ? (status === RoleApplicationStatus.PENDING ? "PENDING" as const :
                                   status === RoleApplicationStatus.APPROVED ? "APPROVED" as const :
                                   "REJECTED" as const) : undefined
    const roleParam = role ? (role === ApplicationableRole.MENTOR ? "MENTOR" as const :
                               role === ApplicationableRole.SELLER ? "SELLER" as const :
                               "WRITER" as const) : undefined
    return RoleApplicationsAPI.getAllApplications({
      status: statusParam,
      role: roleParam,
      page,
      size: limit
    })
  },
  review: async (applicationId: number, data: RoleApplicationUpdate) => {
    if (!data.status) throw new Error('Status is required for review')
    const status = data.status === RoleApplicationStatus.APPROVED ? RoleApplicationStatus.APPROVED : RoleApplicationStatus.REJECTED
    return RoleApplicationsAPI.reviewApplication(applicationId, {
      status,
      admin_notes: data.admin_notes
    })
  },
  withdraw: RoleApplicationsAPI.withdrawApplication,
  getStats: RoleApplicationsAPI.getApplicationStats
}

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
