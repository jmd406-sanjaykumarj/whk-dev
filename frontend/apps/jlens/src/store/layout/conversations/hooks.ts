import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "./action";
import { axiosInstance } from "../../axios";
import axios from "axios";
import { useState } from "react";


// Define the Conversation interface
export interface Conversation {
  id: string;
  title: string;
  workspace_id: string;
}

export const useConversations = (workspace_id: string) => {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", workspace_id],
    queryFn: async () => {
      const res = await axios.get(`/messages/workspace/${workspace_id}`);
      return res.data;
    },
    enabled: !!workspace_id,
  });
};

export const allConversationsQueryKey = ["allConversations"];

export const useAllConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: allConversationsQueryKey,
    queryFn: async () => {
      const res = await axiosInstance.get("/conversations/");
      return res.data;
    },
    staleTime: 0, // Ensure immediate refetch on invalidation
    refetchOnWindowFocus: true,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMessage,
    onMutate: async (variables) => {
      // Optimistically update allConversations for new conversations
      if (variables.workspace_id && !variables.conversation_id) {
        const previousConversations: Conversation[] =
          queryClient.getQueryData<Conversation[]>(allConversationsQueryKey) || [];

        const optimisticConversation: Conversation = {
          id: `temp-${Date.now()}`, // Temporary ID
          title:  "New Chat", // Use message content as temporary title
          workspace_id: variables.workspace_id,
        };

        queryClient.setQueryData<Conversation[]>(allConversationsQueryKey, [
          ...previousConversations,
          optimisticConversation,
        ]);

        return { previousConversations }; // Store for rollback if needed
      }
    },
    onSuccess: ( _ , variables) => {
      // If it's a first message (creating a new conversation)
      if (variables.workspace_id && !variables.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", variables.workspace_id],
        });

        // Refresh the allConversations used in Sidebar
        queryClient.invalidateQueries({
          queryKey: allConversationsQueryKey,
          refetchType: "active", // Ensure active queries are refetched immediately
        });
      }

      // If it's a follow-up message, refresh the message thread
      if (variables.workspace_id && variables.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversationMessages", variables.conversation_id],
        });
      }
    },
    onError: (_, __, context) => {
      // Rollback optimistic update if the mutation fails
      if (context?.previousConversations) {
        queryClient.setQueryData<Conversation[]>(
          allConversationsQueryKey,
          context.previousConversations
        );
      }
    },
  });
};

export const useStreamMessage = () => {
  const [streamedText, setStreamedText] = useState<string>("");

  const streamMessage = async (conversation_id: string) => {
    const { reader, decoder } = await chatAPI.streamMessage(conversation_id);

    let fullText = "";
    if (!reader) {
      throw new Error("Stream reader is undefined.");
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setStreamedText(prev => prev + chunk);
    }

    return fullText;
  };

  return { streamMessage, streamedText };
};

export const useConversationMessages = (conversation_id: string) => {
  console.log("Fetching messages for conversation:", conversation_id);
  return useQuery({
    queryKey: ["conversationMessages", conversation_id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/conversations/${conversation_id}`);
      console.log("Fetched messages:", res.data);
      return res.data;
    },
    enabled: !!conversation_id,
    refetchOnWindowFocus: true,
  });
};

export const useSharedWorkspaceConversations = (workspace_id: string) => {
  return useQuery<Conversation[]>({
    queryKey: allConversationsQueryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(`/conversations/workspaces/${workspace_id}`);
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.deleteConversation,
    onSuccess: (deletedConversationId: string) => {
      // Remove deleted conversation from allConversations
      queryClient.setQueryData<Conversation[]>(
        allConversationsQueryKey,
        (old = []) => old.filter((conv) => conv.id !== deletedConversationId)
      );

      // Remove any cached conversation messages
      queryClient.removeQueries({
        queryKey: ["conversationMessages", deletedConversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["allConversations"] });
      console.log("Conversation deleted Successfully:", deletedConversationId);
    },
    onError: (err) => {
      console.error("Failed to delete conversation:", err);
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: chatAPI.createConversation,
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(
        allConversationsQueryKey,
        (old = []) => [...old, newConversation]
      );
 
      queryClient.invalidateQueries({ queryKey: allConversationsQueryKey });
      queryClient.invalidateQueries({
        queryKey: ["conversations", newConversation.workspace_id],
      });
    },
    onError: (err) => {
      console.error("Failed to create conversation:", err);
    },
  });
};