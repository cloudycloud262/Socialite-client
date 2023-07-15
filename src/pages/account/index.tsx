import { FC, useState } from "react";
import { useGetUserQuery, useGetUsersQuery } from "../../store/userApi";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import Profile from "./profile";
import EditProfile from "./editProfile";
import Posts from "../../components/posts";
import Loading from "../../components/loading";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Account: FC = () => {
  const [showPosts, setShowPosts] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [nav, setNav] = useState("Posts");
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useGetCurrentUserQuery();
  const getUser = useGetUserQuery((id || currentUser.data?._id) ?? skipToken);
  const getUsers = useGetUsersQuery(
    {
      type: nav as "Followers" | "Following",
      id: id || currentUser.data?._id,
    },
    {
      skip:
        !getUser.isSuccess ||
        (getUser.data?.isPrivate &&
          "isFollowing" in getUser.data &&
          !getUser.data?.isFollowing) ||
        (nav !== "Followers" && nav !== "Following") ||
        (!id && !currentUser.data?._id),
    }
  );

  if (id === currentUser.data?._id) {
    return <Navigate to="/account" />;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        <Profile
          setNav={setNav}
          setShowEditForm={setShowEditForm}
          showEditForm={showEditForm}
          setShowPosts={setShowPosts}
        />
        <EditProfile showEditForm={showEditForm} />
      </div>
      <div
        className={`${styles.posts} ${
          showPosts ? styles.postsActive : ""
        } list`}
      >
        <div className="list-header">
          <span className="fs-medium fw-medium">{nav}</span>
          <CloseIcon
            fontSize="small"
            htmlColor="grey"
            className={styles.listCloseBtn}
            onClick={() => setShowPosts(false)}
          />
        </div>
        {id &&
        getUser.data?.isPrivate &&
        "isFollowing" in getUser.data &&
        !getUser.data?.isFollowing ? (
          <div className={styles.privatePlaceholder}>
            <LockOutlinedIcon fontSize="large" />
            <span>This account is private</span>
          </div>
        ) : (
          <>
            {nav === "Followers" && getUser.isSuccess ? (
              <div className="list">
                {getUsers.isLoading || getUsers.isFetching ? <Loading /> : null}
                {getUsers.data?.map((user, index) => (
                  <div
                    className="user-card user-card-hover"
                    key={index}
                    onClick={() => {
                      user._id === currentUser.data?._id
                        ? navigate(`/account`)
                        : navigate(`/user/${user._id}`);
                    }}
                  >
                    <img src="/placeholderDp.png" alt="" className="dp-icon" />
                    <span className="fw-medium fs-medium">{user.username}</span>
                  </div>
                ))}
              </div>
            ) : nav === "Following" && getUser.isSuccess ? (
              <div className="list">
                {getUsers.isLoading || getUsers.isFetching ? <Loading /> : null}
                {getUsers.data?.map((user, index) => (
                  <div
                    className="user-card user-card-hover"
                    key={index}
                    onClick={() => {
                      user._id === currentUser.data?._id
                        ? navigate(`/account`)
                        : navigate(`/user/${user._id}`);
                    }}
                  >
                    <img src="/placeholderDp.png" alt="" className="dp-icon" />
                    <span className="fw-medium fs-medium">{user.username}</span>
                  </div>
                ))}
              </div>
            ) : nav === "Posts" && getUser.isSuccess ? (
              <Posts query={{ userId: id || currentUser.data?._id }} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
