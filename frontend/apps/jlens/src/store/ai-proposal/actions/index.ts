import { axiosInstance } from '../../axios'

export const aiProposalApi = {
  getTemplates: async () => {
    return axiosInstance.get('/ai-proposals/templates')
  },
  createProposal: async (payload: any) => {
    return axiosInstance.post('/ai-proposals', payload)
  },
  getProposalById: async (id: string) => {
    return axiosInstance.get(`/ai-proposals/${id}`)
  },
  deleteProposal: async (id: string) => {
    return axiosInstance.delete(`/ai-proposals/${id}`)
  },
}