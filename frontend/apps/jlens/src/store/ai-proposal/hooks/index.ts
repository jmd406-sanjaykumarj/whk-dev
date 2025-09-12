import {  useQuery } from '@tanstack/react-query'
import { aiProposalApi } from '../actions'

export const useAiProposal = {
  listTemplates:useQuery({
    queryKey:['ai-proposal:templates'],
    queryFn:()=> aiProposalApi.getTemplates(),
  }),

 
}
