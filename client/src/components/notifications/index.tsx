import { FC } from "react";
import { NfsArgs, useGetNotificationsQuery } from "../../store/notificationApi";
import { useNavigate } from "react-router-dom";
import { relTimeFormatter } from "../../utils/formatters";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type NfProps = {
  unreadCount?: number;
  isSideCard?: boolean;
  query: NfsArgs;
};

const Notifications: FC<NfProps> = (props) => {
  const navigate = useNavigate();

  const getNotification = useGetNotificationsQuery(props.query);

  return (
    <div className="list">
      <span className="list-header fs-medium fw-medium">Notifications</span>
      <div className="list">
        {getNotification.data?.map((nf, index) => (
          <div className="user-card" key={index}>
            <img
              src={nf.displayPicture || "/placeholderDp.png"}
              alt=""
              className="dp-icon"
            />
            <span className="fs-small fw-medium">
              <span onClick={() => navigate(`/post/${nf.postId}`)}>
                {nf.type === "like" ? (
                  <>
                    <b>{nf.username}</b> liked your post
                  </>
                ) : null}
              </span>
              {nf.type === "follow" ? (
                <>
                  <b>{nf.username}</b> started following you
                </>
              ) : null}
              <span onClick={() => navigate(`/community/${nf.communityId}`)}>
                {nf.type === "followcomm" ? (
                  <>
                    <b>{nf.username}</b> started following{" "}
                    <b>{nf.communityTitle}</b>
                  </>
                ) : null}
              </span>
              {nf.type === "requested" ? (
                <>
                  <b>{nf.username}</b> requested to follow you
                </>
              ) : null}
              {nf.type === "accepted" ? (
                <>
                  <b>{nf.username}</b> accepted your follow request
                </>
              ) : null}
              <span onClick={() => navigate(`/post/${nf.postId}`)}>
                {nf.type === "comment" ? (
                  <>
                    <b>{nf.username}</b> commented on your post:{" "}
                    <b>{nf.comment}</b>
                  </>
                ) : null}
              </span>
              <span className="disabled-text"> • </span>
              <span className="fs-small fw-medium disabled-text">
                {relTimeFormatter(nf.createdAt)}
              </span>
            </span>
            {!props.isSideCard &&
            props.unreadCount &&
            index < props.unreadCount ? (
              <FiberManualRecordIcon
                sx={{ fontSize: "0.6rem" }}
                htmlColor="#62a6fe"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
