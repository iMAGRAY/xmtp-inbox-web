import { SortDirection } from "@xmtp/xmtp-js";
import { useEffect, useState } from "react";
import { MESSAGE_LIMIT } from "../helpers";
import { useXmtpStore } from "../store/xmtp";

const useGetMessages = (conversationKey: string, endTime?: Date) => {
  const convoMessages = useXmtpStore((state) =>
    state.convoMessages.get(conversationKey),
  );
  let conversation = useXmtpStore((state) => {
    let foundConvo = state.conversations.get(conversationKey);
    if (!foundConvo) {
      // Iterate through conversations and find where the key includes the string 0x00000000
      for (const [key, value] of state.conversations) {
        if (key.includes("0x000000000000")) {
          foundConvo = value;
        }
      }
    }
    return foundConvo;
  });
  console.log("useGetMessages: ", conversation);
  const addMessages = useXmtpStore((state) => state.addMessages);
  const [hasMore, setHasMore] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const loadMessages = async () => {
      const newMessages = await conversation.messages({
        direction: SortDirection.SORT_DIRECTION_DESCENDING,
        limit: MESSAGE_LIMIT,
        endTime: endTime,
      });
      if (newMessages.length > 0) {
        addMessages(conversationKey, newMessages);
        if (newMessages.length < MESSAGE_LIMIT) {
          hasMore.set(conversationKey, false);
          setHasMore(new Map(hasMore));
        } else {
          hasMore.set(conversationKey, true);
          setHasMore(new Map(hasMore));
        }
      } else {
        hasMore.set(conversationKey, false);
        setHasMore(new Map(hasMore));
      }
    };
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, conversationKey, endTime]);

  return {
    convoMessages,
    hasMore: hasMore.get(conversationKey) ?? false,
  };
};

export default useGetMessages;
