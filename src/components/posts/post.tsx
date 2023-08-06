import { FC, Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";
import { PostCacheKey } from ".";
import { numberFormatter, relTimeFormatter } from "../../utils/formatters";

import styles from "./index.module.css";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";

export interface Post {
  _id: string;
  body: string;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  displayPicture: string;
  communityId: string;
  communityTitle: string;
  image: string;
  __v: number;
}

type PostProps = {
  post: Post;
  currentUserPost?: boolean;
  setEditPostIndex?: Dispatch<SetStateAction<number>>;
  index?: number;
  deletePost?: Function;
  likePost: Function;
  unlikePost: Function;
  navigate?: NavigateFunction;
  postMenuIndex?: number;
  setPostMenuIndex?: React.Dispatch<React.SetStateAction<number>>;
  postMenuRef?: React.MutableRefObject<HTMLDivElement | null>;
  cacheKey: PostCacheKey;
  insideComment?: boolean;
};

const Post: FC<PostProps> = (props) => {
  return (
    <div className={styles.postWrapper}>
      <img
        src={props.post.displayPicture || "/placeholderDp.png"}
        alt=""
        className="dp-icon"
      />
      <div className={styles.postBody}>
        {props.post.communityId ? (
          <div
            className={styles.community}
            onClick={() =>
              props.navigate &&
              props.navigate(`/community/${props.post.communityId}`)
            }
          >
            <PeopleIcon htmlColor="grey" sx={{ fontSize: "1.1rem" }} />
            <span className="fs-small fw-medium disabled-text">
              {props.post.communityTitle}
            </span>
          </div>
        ) : null}
        <div
          className={`${styles.postHeader} disabled-text fs-small fw-medium`}
        >
          <span
            onClick={() => {
              if (props.navigate) {
                props.currentUserPost
                  ? props.navigate(`/account`)
                  : props.navigate(`/user/${props.post.userId}`);
              }
            }}
          >
            {props.post.username}
          </span>
          <span>•</span>
          <span>{relTimeFormatter(props.post.createdAt)}</span>
          {props.currentUserPost ? (
            <div
              className="menu-wrapper"
              ref={props.postMenuRef}
              onClick={(e) => {
                const eventTarget = e.target as HTMLDivElement;
                if (eventTarget.classList.contains("menu-btn")) {
                  if (props.postMenuRef) {
                    props.postMenuRef.current = e.currentTarget;
                  }
                }
              }}
            >
              <MoreVertIcon
                fontSize="small"
                htmlColor="grey"
                className="menu-btn"
                onClick={() => {
                  if (
                    props.setPostMenuIndex &&
                    typeof props.index === "number" &&
                    props?.index >= 0 &&
                    typeof props?.postMenuIndex === "number" &&
                    props?.postMenuIndex >= -1
                  ) {
                    props.setPostMenuIndex(
                      props.postMenuIndex === props.index ? -1 : props.index
                    );
                  }
                }}
              />
              <div
                className={`menu ${
                  props.postMenuIndex === props.index ? "menu-active " : ""
                }number`}
              >
                <button
                  className="menu-item transparent-btn icon-btn disabled-text"
                  onClick={() => {
                    if (
                      props.setEditPostIndex &&
                      typeof props.index === "number" &&
                      props.index >= 0 &&
                      props.postMenuRef &&
                      props.setPostMenuIndex
                    ) {
                      props.setEditPostIndex(props.index);
                      props.postMenuRef.current = null;
                      props.setPostMenuIndex(-1);
                    }
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                  <span className="fw-medium fs-small">Update Post</span>
                </button>
                <button
                  className="menu-item danger-btn transparent-btn icon-btn"
                  onClick={() => {
                    if (
                      props.deletePost &&
                      props.postMenuRef &&
                      props.setPostMenuIndex
                    ) {
                      props.deletePost(props.post._id);
                      props.postMenuRef.current = null;
                      props.setPostMenuIndex(-1);
                    }
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                  <span className="fw-medium fs-small">Delete Post</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="fs-medium fw-medium">{props.post.body}</div>
        {props.post.image ? (
          <img src={props.post.image} alt="" className={styles.postImage} />
        ) : null}
        <div
          className={`${styles.engagement} disabled-text fs-small fw-medium`}
        >
          <div>
            {props.post.isLiked ? (
              <StarIcon
                fontSize="small"
                htmlColor="grey"
                onClick={() =>
                  props.unlikePost({
                    id: props.post._id,
                    cacheKey: props.cacheKey,
                  })
                }
              />
            ) : (
              <StarBorderOutlinedIcon
                fontSize="small"
                htmlColor="grey"
                onClick={() =>
                  props.likePost({
                    id: props.post._id,
                    cacheKey: props.cacheKey,
                  })
                }
              />
            )}
            <span>{numberFormatter(props.post.likesCount)}</span>
          </div>
          {props.insideComment ? null : (
            <div
              onClick={() => {
                if (props.navigate) {
                  props.navigate(`/post/${props.post._id}`);
                }
              }}
            >
              <RateReviewOutlinedIcon fontSize="small" htmlColor="grey" />
              <span>{numberFormatter(props.post.commentsCount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
