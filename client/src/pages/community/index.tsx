import { FC, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteCommunityMutation,
  useFollowCommunityMutation,
  useGetCommunityQuery,
  useUnfollowCommunityMutation,
} from "../../store/communityApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetCurrentUserQuery } from "../../store/authApi";
import useCloseOnOutsideClick from "../../hooks/useCloseOnOutsideClick";

import Layout from "../../components/layout";
import Posts from "../../components/posts";
import Loading from "../../components/loading";
import PostForm from "../../components/posts/postForm";

import styles from "./index.module.css";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";

const Community: FC = () => {
  const { id } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  const getCommunity = useGetCommunityQuery(id ?? skipToken);
  const [followCommunity] = useFollowCommunityMutation();
  const [unfollowCommunity] = useUnfollowCommunityMutation();
  const [deleteCommunity, deleteCommunityStatus] = useDeleteCommunityMutation();
  const currentUser = useGetCurrentUserQuery();

  useEffect(() => {
    deleteCommunityStatus.isSuccess && navigate("/", { replace: true });
  }, [deleteCommunityStatus.isSuccess]);
  useCloseOnOutsideClick(menuRef, () => setShowMenu(false));

  if (getCommunity.isLoading || getCommunity.isFetching) {
    return <Loading />;
  }
  if (getCommunity.isSuccess) {
    return (
      <Layout community={getCommunity.data}>
        <div className="list">
          <div className={`${styles.header} list-header`}>
            {showEdit ? (
              <PostForm
                tab="community"
                type="update"
                community={getCommunity.data}
                setShowCommEdit={setShowEdit}
              />
            ) : (
              <>
                <PeopleIcon htmlColor="grey" />
                <div className={`fs-medium fw-medium ${styles.title}`}>
                  {getCommunity.data?.title}
                </div>
                {getCommunity.data?.isFollowing ? (
                  <button
                    className="contained-btn"
                    onClick={() =>
                      getCommunity.data?._id &&
                      unfollowCommunity(getCommunity.data?._id)
                    }
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="contained-btn"
                    onClick={() =>
                      getCommunity.data?._id &&
                      followCommunity(getCommunity.data?._id)
                    }
                  >
                    Follow
                  </button>
                )}
                {currentUser.data?._id === getCommunity.data?.creatorId ? (
                  <div className="menu-wrapper" ref={menuRef}>
                    <IconButton onClick={() => setShowMenu((prev) => !prev)}>
                      <MoreVertIcon />
                    </IconButton>
                    <div className={`menu ${showMenu ? "menu-active " : ""}`}>
                      <button
                        className="menu-item transparent-btn icon-btn disabled-text"
                        onClick={() => {
                          navigate("info");
                        }}
                      >
                        <InfoIcon fontSize="small" />
                        <span className="fw-medium fs-small">Info</span>
                      </button>
                      <button
                        className="menu-item transparent-btn icon-btn disabled-text"
                        onClick={() => {
                          setShowEdit(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                        <span className="fw-medium fs-small">
                          Update Community
                        </span>
                      </button>
                      <button
                        className="menu-item danger-btn transparent-btn icon-btn"
                        onClick={() => {
                          if (getCommunity.data?._id) {
                            deleteCommunity(getCommunity.data?._id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                        <span className="fw-medium fs-small">
                          Delete Community
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
          <Posts query={{ communityId: id }} />
        </div>
      </Layout>
    );
  }
};

export default Community;
