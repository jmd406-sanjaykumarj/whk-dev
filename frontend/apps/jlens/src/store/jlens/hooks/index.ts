import { useMutation, useQuery } from '@tanstack/react-query'
import { chatApi } from '../actions'

export const useChat = {
  generate: () => useMutation({mutationFn:chatApi.generateResponse}),

  conversations: () =>
    useQuery({queryKey:['chat:conversations'], queryFn:()=>chatApi.listConversations}),


}