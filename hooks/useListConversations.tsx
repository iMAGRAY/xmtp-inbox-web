import { Conversation } from "@xmtp/xmtp-js";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { getConversationId } from "../helpers";
import fetchMostRecentMessage from "../helpers/fetchMostRecentMessage";
import { useXmtpStore } from "../store/xmtp";
import useStreamAllMessages from "./useStreamAllMessages";
import { useConversations, useStreamConversations } from "@xmtp/react-sdk";

const chunkArray = <T,>(arr: T[], chunkSize: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    out.push(chunk);
  }

  return out;
};

export const useListConversations = () => {
  const { address: walletAddress } = useAccount();

  const {
    conversations: allConversations,
    error,
    isLoading,
  } = useConversations();

  const conversations = useXmtpStore((state) => state.conversations);
  const setConversations = useXmtpStore((state) => state.setConversations);
  const previewMessages = useXmtpStore((state) => state.previewMessages);
  const setPreviewMessage = useXmtpStore((state) => state.setPreviewMessage);
  const setLoadingConversations = useXmtpStore(
    (state) => state.setLoadingConversations,
  );

  const streamConversations = async (conversation: Conversation) => {
    if (conversation.peerAddress !== walletAddress) {
      conversations.set(getConversationId(conversation), conversation);
      setConversations(new Map(conversations));

      const preview = await fetchMostRecentMessage(conversation);
      if (preview.message) {
        setPreviewMessage(preview.key, preview.message);
      }
    }
  };

  useStreamConversations(streamConversations);
  useStreamAllMessages();

  useEffect(() => {
    const listConversations = async () => {
      // Diff the conversations and preview messages to see which ones are missing
      const needsSync = allConversations.filter(
        (convo) => previewMessages.get(getConversationId(convo)) === undefined,
      );

      for (const chunk of chunkArray(needsSync, 50)) {
        // Yield to the UI between pages of conversations, since this all happens in the background
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await Promise.all(
          chunk.map(async (convo) => {
            if (!convo) {
              return;
            }
            const latestMessage = await fetchMostRecentMessage(convo);
            const existingValue = previewMessages.get(latestMessage.key)?.sent;
            if (
              latestMessage.message &&
              (!existingValue || latestMessage?.message.sent > existingValue)
            ) {
              setPreviewMessage(latestMessage.key, latestMessage.message);
            }
            if (convo.peerAddress !== walletAddress) {
              conversations.set(getConversationId(convo), convo);
            }
          }),
        );
        setConversations(conversations);
      }

      setLoadingConversations(false);
    };

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (!isLoading && !error) {
      listConversations();
    }
  }, [walletAddress, error, allConversations]);
};

export default useListConversations;
