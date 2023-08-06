import { FC, useEffect, useState } from "react";
import { useGetUserQuery, useGetUsersQuery } from "../../store/userApi";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { useGetCommunitiesQuery } from "../../store/communityApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import Profile from "./profile";
import EditProfile from "./editProfile";
import Posts from "../../components/posts";
import Loading from "../../components/loading";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PeopleIcon from "@mui/icons-material/People";

const Account: FC = () => {
  const [showPosts, setShowPosts] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [dp, setDp] = useState("");
  const [cover, setCover] = useState("");
  const [nav, setNav] = useState("Posts");
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useGetCurrentUserQuery();
  const getUser = useGetUserQuery((id || currentUser.data?._id) ?? skipToken);
  const getUsers = useGetUsersQuery(
    {
      type: nav === "Followers" ? "Followers" : "Following",
      id: id || currentUser.data?._id,
    },
    {
      skip:
        !getUser.isSuccess ||
        (getUser.data?.isPrivate &&
          getUser.data._id !== currentUser.data?._id &&
          "isFollowing" in getUser.data &&
          !getUser.data?.isFollowing) ||
        (nav !== "Followers" && nav !== "Following"),
    }
  );
  const getCommunities = useGetCommunitiesQuery(
    nav === "Community Following"
      ? { following: getUser.data?._id }
      : { creatorId: getUser.data?._id },
    {
      skip:
        !getUser.isSuccess ||
        (getUser.data?.isPrivate &&
          getUser.data._id !== currentUser.data?._id &&
          "isFollowing" in getUser.data &&
          !getUser.data?.isFollowing) ||
        (nav !== "Community Created" && nav !== "Community Following"),
    }
  );

  useEffect(() => {
    if (getUser.isSuccess) {
      setDp(getUser.data.displayPicture);
      setCover(getUser.data.coverPicture);
    }
  }, [getUser.isSuccess]);

  if (id === currentUser.data?._id) {
    return <Navigate to="/account" replace />;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        <Profile
          setNav={setNav}
          setShowEditForm={setShowEditForm}
          showEditForm={showEditForm}
          setShowPosts={setShowPosts}
          dp={dp}
          setDp={setDp}
          cover={cover}
          setCover={setCover}
        />
        {showEditForm ? (
          <EditProfile showEditForm={showEditForm} dp={dp} cover={cover} />
        ) : null}
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
            {(nav === "Followers" || nav === "Following") &&
            getUser.isSuccess ? (
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
            ) : (nav === "Community Created" ||
                nav === "Community Following") &&
              getUser.isSuccess ? (
              <div className="list">
                {getCommunities.isLoading || getCommunities.isFetching ? (
                  <Loading />
                ) : null}
                {getCommunities.data?.map((community, index) => (
                  <div
                    className="user-card user-card-hover"
                    key={index}
                    onClick={() => {
                      navigate(`/community/${community._id}`);
                    }}
                  >
                    <PeopleIcon fontSize="small" htmlColor="grey" />
                    <span className="fw-medium fs-medium">
                      {community.title}
                    </span>
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
