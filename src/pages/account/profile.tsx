import { FC, Dispatch, SetStateAction, ChangeEvent } from "react";
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
import { convertToBase64 } from "../../utils/formatters";
import { useDispatch } from "react-redux";

import Loading from "../../components/loading";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { setNewChatUserId } from "../../store/chatSlice";

type ProfileProps = {
  showEditForm: boolean;
  setShowEditForm: Dispatch<SetStateAction<boolean>>;
  setShowPosts: Dispatch<SetStateAction<boolean>>;
  setNav: Dispatch<SetStateAction<string>>;
  dp: string;
  setDp: Dispatch<SetStateAction<string>>;
  cover: string;
  setCover: Dispatch<SetStateAction<string>>;
};

const Profile: FC<ProfileProps> = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useGetCurrentUserQuery();
  const getUser = useGetUserQuery((id || currentUser.data?._id) ?? skipToken);
  const [follow] = useFollowMutation();
  const [unfollow] = useUnfollowMutation();
  const [removeRequest] = useRemoveRequestMutation();

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      if (type === "dp") {
        props.setDp(base64);
      } else if (type === "cover") {
        props.setCover(base64);
      }
    }
  };

  return (
    <>
      <div className={styles.dpContainer}>
        {getUser.isFetching || getUser.isLoading ? <Loading /> : null}
        <div className={styles.coverWrapper}>
          {props.showEditForm ? (
            <label htmlFor="cover-field">
              <input
                type="file"
                id="cover-field"
                onChange={(e) => handleImageChange(e, "cover")}
                accept=".jpeg, .png, .jpg"
                className={styles.pictureInputField}
              />
              <div className={styles.pictureEdit}>
                <EditOutlinedIcon htmlColor="white" />
              </div>
            </label>
          ) : null}
          <img
            src={props.cover || "/placeholderCover.jpg"}
            alt=""
            className={styles.cover}
          />
        </div>
        <div className={styles.dpWrapper}>
          {props.showEditForm ? (
            <label htmlFor="dp-field">
              <input
                type="file"
                id="dp-field"
                onChange={(e) => handleImageChange(e, "dp")}
                accept=".jpeg, .png, .jpg"
                className={styles.pictureInputField}
              />
              <div className={styles.pictureEdit}>
                <EditOutlinedIcon htmlColor="white" fontSize="small" />
              </div>
            </label>
          ) : null}
          <img
            src={props.dp || "/placeholderDp.png"}
            alt=""
            className={styles.dp}
          />
        </div>
        <div className={`btn-grp ${styles.profileActionBtn}`}>
          {id ? (
            <div className="btn-grp">
              <button
                className="outlined-btn"
                onClick={() => {
                  if (getUser.data) {
                    if (getUser.data?.chatId) {
                      navigate(`/chats/${getUser.data?.chatId}`);
                    } else {
                      navigate(`/chats/${uuidv4()}`);
                      dispatch(setNewChatUserId(getUser.data._id));
                    }
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
      {props.showEditForm ? null : (
        <>
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
          <div className={styles.connections}>
            <button
              onClick={() => {
                props.setShowPosts(true);
                props.setNav("Community Created");
              }}
            >
              <span className="fs-medium fw-medium">
                {getUser.data?.communityCount}
              </span>
              <span className="fs-small fw-thin">Community Created</span>
            </button>
            <button
              onClick={() => {
                props.setShowPosts(true);
                props.setNav("Community Following");
              }}
            >
              <span className="fs-medium fw-medium">
                {getUser.data?.followingCommCount}
              </span>
              <span className="fs-small fw-thin">Community Following</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
