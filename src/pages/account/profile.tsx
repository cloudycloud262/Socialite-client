import { FC, Dispatch, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../store/authApi";
import {
  useFollowMutation,
  useGetUserQuery,
  useRemoveRequestMutation,
  useUnfollowMutation,
} from "../../store/userApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { v4 as uuidv4 } from "uuid";

import Loading from "../../components/loading";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

type ProfileProps = {
  showEditForm: boolean;
  setShowEditForm: Dispatch<SetStateAction<boolean>>;
  setShowPosts: Dispatch<SetStateAction<boolean>>;
  setNav: Dispatch<SetStateAction<string>>;
};

const Profile: FC<ProfileProps> = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useGetCurrentUserQuery();
  const getUser = useGetUserQuery((id || currentUser.data?._id) ?? skipToken);
  const [follow] = useFollowMutation();
  const [unfollow] = useUnfollowMutation();
  const [removeRequest] = useRemoveRequestMutation();

  return (
    <>
      <div className={styles.dpContainer}>
        {getUser.isFetching || getUser.isLoading ? <Loading /> : null}
        <img src="/placeholderCover.jpg" alt="" className={styles.cover} />
        <img src="/placeholderDp.png" alt="" className={styles.dp} />
        <div className={`btn-grp ${styles.profileActionBtn}`}>
          {id ? (
            <div className="btn-grp">
              <button
                className="outlined-btn"
                onClick={() => {
                  if (getUser.data) {
                    getUser.data?.chatId
                      ? navigate(`/chats/${getUser.data?.chatId}`)
                      : navigate(
                          `/chats/${uuidv4()}?userId=${getUser.data._id}`
                        );
                  }
                }}
              >
                Chat
              </button>
              {getUser.data &&
              "isFollowing" in getUser.data &&
              getUser.data.isFollowing ? (
                <button className="contained-btn" onClick={() => unfollow(id)}>
                  Unfollow
                </button>
              ) : getUser.data &&
                "isRequested" in getUser.data &&
                getUser.data.isRequested ? (
                <button
                  className="contained-btn"
                  onClick={() => removeRequest(id)}
                >
                  Requested
                </button>
              ) : (
                <button
                  className="contained-btn"
                  onClick={() =>
                    getUser.data &&
                    "isPrivate" in getUser.data &&
                    follow({ id, isPrivate: getUser.data?.isPrivate })
                  }
                >
                  Follow
                </button>
              )}
            </div>
          ) : props.showEditForm ? (
            <button
              className="outlined-btn icon-btn danger-btn"
              onClick={() => props.setShowEditForm(false)}
            >
              <CloseIcon fontSize="small" />
              <span className="fs-small fw-medium">Cancel</span>
            </button>
          ) : (
            <button
              className="contained-btn icon-btn"
              onClick={() => props.setShowEditForm(true)}
            >
              <EditIcon fontSize="small" />
              <span className="fs-small fw-medium">Edit Profile</span>
            </button>
          )}
        </div>
      </div>
      <div className="fw-medium fs-medium">{getUser.data?.username}</div>
      <div className={styles.connections}>
        <button
          onClick={() => {
            props.setShowPosts(true);
            props.setNav("Followers");
          }}
        >
          <span className="fs-medium fw-medium">
            {getUser.data?.followersCount}
          </span>
          <span className="fs-small fw-thin">Followers</span>
        </button>
        <button
          onClick={() => {
            props.setShowPosts(true);
            props.setNav("Following");
          }}
        >
          <span className="fs-medium fw-medium">
            {getUser.data?.followingCount}
          </span>
          <span className="fs-small fw-thin">Following</span>
        </button>
        <button
          onClick={() => {
            props.setShowPosts(true);
            props.setNav("Posts");
          }}
        >
          <span className="fs-medium fw-medium">
            {getUser.data?.postsCount}
          </span>
          <span className="fs-small fw-thin">Posts</span>
        </button>
      </div>
    </>
  );
};

export default Profile;
