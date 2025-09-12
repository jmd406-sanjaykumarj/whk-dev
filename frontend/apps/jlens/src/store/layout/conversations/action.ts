import { axiosInstance } from "../../axios"

export interface SendMessageRequest {
  workspace_id: string
  conversation_id?: string
  content: string
  role: string
  model_type: string
  chat_type: string
  component_type?: string
  input_tokens: number
  output_tokens: number
}

export const chatAPI = {
  sendMessage: async (data: SendMessageRequest) => {
    const response = await axiosInstance.post("/messages/", data)
    return response.data
  },
  streamMessage: async (conversation_id: string) => {
    const response = await fetch(`/messages/stream/${conversation_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error("Streaming failed");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    return { reader, decoder };
  },
  deleteConversation: async (conversation_id: string) => {
    await axiosInstance.delete(`/conversations/${conversation_id}`);
    return conversation_id; 
  },

   createConversation: async (data: {
    title: string;
    workspace_id: string;
    component_type: string;
  }) => {
    const response = await axiosInstance.post("/conversations/", data);
    return response.data;
},
}
