import { useCallback } from "react";
import { useXmtpStore } from "../store/xmtp";

const useSendMessage = (conversationId: string) => {
  console.log('useSendMessage convoId: ', conversationId);
  const conversations = useXmtpStore((state) => state.conversations);
  console.log(conversations);
  let selectedConversation = conversations.get(conversationId);
  // Find any conversation that has 0x0000000000000000000000000000000000000000 in the conversationId at all
  if (!selectedConversation) {
    // Iterate through conversations and find where the key includes the string 0x00000000
    for (const [key, value] of conversations) {
      if (key.includes('0x000000000000')) {
        selectedConversation = value;
      }
    }
  }
  console.log('useSendMessage: ', selectedConversation);


  const sendMessage = useCallback(
    async (message: string) => {
      console.log('sending message: ', message);
      console.log('currently selectedConversation: ', selectedConversation);
      await selectedConversation?.send(message);
    },
    [selectedConversation],
  );

  return {
    sendMessage,
  };
};

export default useSendMessage;
