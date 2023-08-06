import { useEffect } from "react";
import socket from "../socket";
import { Chat, chatApi } from "../store/chatApi";
import { RootState, useAppDispatch } from "../store";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  incrementTotalUnreadCount,
  setActiveChatIndex,
  setCurrUnread,
  setRender,
} from "../store/chatSlice";
import { useSelector } from "react-redux";
import { typers } from "../utils/variables";

const useChatsSocketHooks = (): void => {
  const dispatch = useAppDispatch();
  const { currUnread, activeChatIndex } = useSelector(
    (state: RootState) => state.chatSlice
  );
  const searchParams = Object.fromEntries(useSearchParams()[0]);
  const { pathname } = useLocation();
  let i = -1;
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("add-message", async (messageObj, extraObj) => {
      if (extraObj.isNew) {
        i = 0;
        dispatch(
          chatApi.util.upsertQueryData("getMessages", messageObj.chatId, [
            messageObj,
          ])
        );
      } else {
        dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => {
            i = draft.findIndex((chat) => chat.uuid === messageObj.chatId);
            return draft;
          })
        );
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            messageObj.chatId,
            (draft) => {
              draft.push(messageObj);
              return draft;
            }
          )
        );
      }
      if (pathname.includes(messageObj.chatId)) {
        socket.emit("unread-status", messageObj, extraObj, false);
        if (currUnread.count) {
          dispatch(
            setCurrUnread({ ...currUnread, count: currUnread.count + 1 })
          );
        }
        dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => {
            draft.unshift(draft[i]);
            draft.splice(i + 1, 1);
          })
        );
        dispatch(setActiveChatIndex(0));
      } else {
        if (searchParams.userId === messageObj.senderId) {
          socket.emit("unread-status", messageObj, extraObj, false);
        } else {
          socket.emit("unread-status", messageObj, extraObj, true);
        }
        let newChat: Chat;
        if (extraObj.isNew) {
          const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/user/${messageObj.senderId}`,
            { credentials: "include" }
          );
          const username = (await res.json()).username;
          newChat = {
            username,
            uuid: messageObj.chatId,
            userId: messageObj.senderId,
            unreadCount: searchParams.userId === messageObj.senderId ? 0 : 1,
            lastMessageSenderId:
              searchParams.userId === messageObj.senderId
                ? ""
                : messageObj.senderId,
          };
        }
        dispatch(incrementTotalUnreadCount(1));
        dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => {
            if (extraObj.isNew) {
              draft.unshift(newChat);
              if (searchParams.userId === messageObj.senderId) {
                dispatch(setActiveChatIndex(0));
                navigate(`/chats/${messageObj.chatId}`);
              } else {
                activeChatIndex >= 0 &&
                  dispatch(setActiveChatIndex(activeChatIndex + 1));
              }
            } else {
              draft[i].unreadCount = (draft[i].unreadCount || 0) + 1;
              draft[i].lastMessageSenderId = messageObj.senderId;
              draft.unshift(draft[i]);
              draft.splice(i + 1, 1);
              activeChatIndex >= 0 &&
                i > activeChatIndex &&
                dispatch(setActiveChatIndex(activeChatIndex + 1));
            }
          })
        );
      }
    });
    socket.on("message-read", (chatId) => {
      dispatch(
        chatApi.util.updateQueryData("getChats", undefined, (draft) =>
          draft.map((chat) =>
            chat.uuid === chatId
              ? {
                  ...chat,
                  unreadCount: 0,
                  lastMessageSenderId: "",
                }
              : chat
          )
        )
      );
      if (pathname.includes(chatId)) {
        dispatch(setCurrUnread({ count: 0, sender: "" }));
      }
    });
    socket.on("is-typing", (receiverId, status) => {
      typers.set(receiverId, status);
      dispatch(setRender());
    });
    return () => {
      socket.removeAllListeners("add-message");
      socket.removeAllListeners("message-read");
      socket.removeAllListeners("is-typing");
    };
  }, [pathname, currUnread.count, activeChatIndex]);
};

export default useChatsSocketHooks;
