import { FC, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetUserQuery } from "../../store/userApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  chatApi,
  useGetChatsQuery,
  useGetMessagesQuery,
} from "../../store/chatApi";
import socket from "../../socket";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { RootState, useAppDispatch } from "../../store";
import { typers } from "../../utils/variables";
import {
  incrementTotalUnreadCount,
  setActiveChatIndex,
  setCurrUnread,
} from "../../store/chatSlice";
import { useSelector } from "react-redux";

import Textarea from "../../components/textarea";
import Loading from "../../components/loading";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const Chats: FC = () => {
  const searchParams = Object.fromEntries(useSearchParams()[0]);
  const [messageBody, setMessageBody] = useState("");
  const [showChatRoom, setShowChatRoom] = useState(false);
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    activeChatIndex,
    currUnread,
    render: _render,
  } = useSelector((state: RootState) => state.chatSlice);

  const getUser = useGetUserQuery(searchParams.userId ?? skipToken);
  const currentUser = useGetCurrentUserQuery();
  const getChats = useGetChatsQuery();
  const getMessages = useGetMessagesQuery(
    getChats.data?.[activeChatIndex]?.uuid ?? skipToken
  );

  useEffect(() => {
    if (id && getChats.isSuccess) {
      const i = getChats.data.findIndex((c) => c.uuid === id);
      dispatch(setActiveChatIndex(i));
    }
  }, [getChats.isSuccess]);
  useEffect(() => {
    return () => {
      dispatch(setActiveChatIndex(-1));
    };
  }, []);
  useEffect(() => {
    if (
      activeChatIndex >= 0 &&
      getMessages.isSuccess &&
      getChats.data?.[activeChatIndex]?.unreadCount &&
      getChats.data?.[activeChatIndex]?.lastMessageSenderId ===
        getChats.data?.[activeChatIndex]?.userId
    ) {
      dispatch(
        incrementTotalUnreadCount(
          -(getChats.data?.[activeChatIndex].unreadCount || 0)
        )
      );
      dispatch(
        chatApi.util.updateQueryData("getChats", undefined, (draft) => {
          draft[activeChatIndex].unreadCount = 0;
          draft[activeChatIndex].lastMessageSenderId = "";
        })
      );
      socket.emit("message-read", id, getChats.data?.[activeChatIndex]?.userId);
    }
    dispatch(
      setCurrUnread({
        count: getChats.data?.[activeChatIndex]?.unreadCount || 0,
        sender: getChats.data?.[activeChatIndex]?.lastMessageSenderId || "",
      })
    );
  }, [getMessages.isSuccess, id]);

  const sendMessageHandler = () => {
    if (
      id &&
      currentUser.data &&
      (getChats.data?.[activeChatIndex]?.userId || searchParams.userId)
    ) {
      const messageObj = {
        body: messageBody,
        chatId: id,
        senderId: currentUser.data._id,
      };
      socket.emit("send-message", messageObj, {
        isNew: Boolean(searchParams.userId),
        receiverId:
          getChats.data?.[activeChatIndex]?.userId || searchParams.userId,
      });
      if (searchParams.userId) {
        dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => [
            {
              username: getUser.data ? getUser.data.username : "",
              displayPicture: "",
              uuid: messageObj.chatId,
              userId: searchParams.userId,
              unreadCount: 1,
              lastMessageSenderId: currentUser.data?._id,
            },
            ...draft,
          ])
        );
        dispatch(chatApi.util.upsertQueryData("getMessages", id, [messageObj]));
      } else {
        dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => {
            draft[activeChatIndex].unreadCount =
              (draft[activeChatIndex]?.unreadCount || 0) + 1;
            draft[activeChatIndex].lastMessageSenderId = currentUser.data?._id;
            if (activeChatIndex > 0) {
              draft.unshift(draft[activeChatIndex]);
              draft.splice(activeChatIndex + 1, 1);
            }
          })
        );
        dispatch(
          chatApi.util.updateQueryData("getMessages", id, (draft) => {
            draft.push(messageObj);
          })
        );
      }
      dispatch(setActiveChatIndex(0));

      dispatch(
        setCurrUnread({
          count: currUnread.count + 1,
          sender: currentUser.data?._id,
        })
      );
      setMessageBody("");
      navigate(`/chats/${id}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`list ${styles.list}`}>
        {getChats.isFetching || getChats.isLoading ? <Loading /> : null}
        <span className="list-header fs-medium fw-medium">Chats</span>
        <div className="list">
          {getChats.data?.map((chat, index) => (
            <div
              className={`user-card user-card-hover ${
                activeChatIndex === index ? "user-card-active" : ""
              }`}
              key={index}
              onClick={() => {
                setShowChatRoom(true);
                dispatch(setActiveChatIndex(index));
                navigate(`/chats/${chat.uuid}`);
              }}
            >
              <img
                src={chat.displayPicture || "/placeholderDp.png"}
                alt=""
                className="dp-icon"
              />
              <div className={styles.listUsername}>
                <span className="fs-medium fw-medium">{chat.username}</span>
                {index !== activeChatIndex && typers.get(chat.userId) ? (
                  <span className="fs-small fw-thin disabled-text">
                    is typing...
                  </span>
                ) : null}
              </div>
              {chat.unreadCount &&
              chat.lastMessageSenderId === chat.userId &&
              index !== activeChatIndex ? (
                <div className={styles.unreadCount}>
                  {chat.unreadCount <= 99 ? chat.unreadCount : "99+"}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div
        className={`${styles.room} ${showChatRoom ? styles.roomActive : ""}`}
      >
        {activeChatIndex >= 0 || searchParams.userId ? (
          <div className={`user-card ${styles.roomHeader}`}>
            <img
              src={
                getChats.data?.[activeChatIndex]?.displayPicture ||
                getUser.data?.displayPicture ||
                "/placeholderDp.png"
              }
              alt=""
              className="dp-icon"
            />
            <span className="fs-medium fw-medium">
              {getChats.data?.[activeChatIndex]?.username ||
                getUser.data?.username}
            </span>
            <CloseIcon
              fontSize="small"
              htmlColor="grey"
              className={styles.closeRoomBtn}
              onClick={() => setShowChatRoom(false)}
            />
          </div>
        ) : null}
        {activeChatIndex >= 0 || searchParams.userId ? (
          <div className={styles.chats}>
            {getMessages.isFetching || getMessages.isLoading ? (
              <Loading />
            ) : null}
            {typers.get(getChats.data?.[activeChatIndex]?.userId) ||
            typers.get(searchParams.userId) ? (
              <div
                className={`${styles.bubble} ${styles.receivedBubble} ${styles.isTyping}`}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : null}
            {getMessages.data
              ?.slice(getMessages.data.length - (currUnread.count || 0))
              .reverse()
              .map((message, index) => (
                <div
                  className={`${
                    message.senderId === currentUser.data?._id
                      ? styles.sentBubble
                      : styles.receivedBubble
                  } ${styles.bubble} ${
                    message.senderId === currentUser.data?._id
                      ? styles.unreadBubble
                      : ""
                  } fw-medium fs-medium`}
                  key={index}
                >
                  {message.body}
                </div>
              ))}
            {currUnread.count &&
            currUnread.sender === getChats.data?.[activeChatIndex]?.userId ? (
              <div
                className={`${styles.nfBubble} ${styles.bubble} fw-medium fs-medium`}
              >
                Unread Messages
              </div>
            ) : null}
            {getMessages.data
              ?.slice(0, getMessages.data.length - (currUnread.count || 0))
              .reverse()
              .map((message, index) => (
                <div
                  className={`${
                    message.senderId === currentUser.data?._id
                      ? styles.sentBubble
                      : styles.receivedBubble
                  } ${styles.bubble} fw-medium fs-medium`}
                  key={index}
                >
                  {message.body}
                </div>
              ))}
          </div>
        ) : (
          <div className={styles.placeholder}>Click on a chat</div>
        )}
        {activeChatIndex >= 0 || searchParams.userId ? (
          <div className="chat-area">
            <Textarea
              value={messageBody}
              placeholder="Start Chatting..."
              onChange={(val) => setMessageBody(val)}
              className="filled-input"
              onFocus={() =>
                socket.emit(
                  "is-typing",
                  getChats.data?.[activeChatIndex]?.userId ||
                    searchParams.userId,
                  true
                )
              }
              onBlur={() =>
                socket.emit(
                  "is-typing",
                  getChats.data?.[activeChatIndex]?.userId ||
                    searchParams.userId,
                  false
                )
              }
            />
            <SendIcon
              htmlColor="#62a6fe"
              onClick={() => sendMessageHandler()}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Chats;
