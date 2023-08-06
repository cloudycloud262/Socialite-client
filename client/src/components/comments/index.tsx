import { FC, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
} from "../../store/commentApi";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { relTimeFormatter } from "../../utils/formatters";
import {
  useGetPostQuery,
  useLikeMutation,
  useUnLikeMutation,
} from "../../store/postApi";
import useCloseOnOutsideClick from "../../hooks/useCloseOnOutsideClick";

import Layout from "../layout";
import Textarea from "../textarea";
import Loading from "../loading";
import Post from "../posts/post";

import styles from "./index.module.css";
import postStyles from "../posts/index.module.css";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const Comments: FC = () => {
  const { id: postId } = useParams();
  const [commentMenuIndex, setCommentMenuIndex] = useState(-1);
  const commentMenuRef = useRef<HTMLDivElement | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const navigate = useNavigate();
  useCloseOnOutsideClick(commentMenuRef, () => setCommentMenuIndex(-1));

  const currentUser = useGetCurrentUserQuery();
  const getComments = useGetCommentsQuery(postId ?? skipToken);
  const getPost = useGetPostQuery(postId ?? skipToken);
  const [createComment, createCommentStatus] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [likePost] = useLikeMutation();
  const [unlikePost] = useUnLikeMutation();

  return (
    <Layout>
      <div className={`list ${styles.wrapper}`}>
        <div className="list">
          {getPost.data ? (
            <Post
              post={getPost.data}
              likePost={likePost}
              unlikePost={unlikePost}
              cacheKey={{ postId }}
              insideComment={true}
            />
          ) : null}
          <div className="list-header fw-medium fs-medium">Comments</div>
          {getComments.isFetching ||
          getComments.isLoading ||
          createCommentStatus.isLoading ? (
            <Loading />
          ) : null}
          {getComments.data?.map((comment, index) => (
            <div key={index}>
              <div className={postStyles.postWrapper}>
                <img
                  src={comment.displayPicture || "/placeholderDp.png"}
                  alt=""
                  className="dp-icon"
                />
                <div className={postStyles.postBody}>
                  <div
                    className={`${postStyles.postHeader} disabled-text fs-small fw-medium`}
                  >
                    <span
                      onClick={() =>
                        comment.userId === currentUser.data?._id
                          ? navigate(`/account`)
                          : navigate(`/user/${comment.userId}`)
                      }
                    >
                      {comment.username}
                    </span>
                    <span>•</span>
                    <span>{relTimeFormatter(comment.createdAt)}</span>
                    {currentUser.data?._id === comment.userId ? (
                      <div
                        className="menu-wrapper"
                        ref={commentMenuRef}
                        onClick={(e) => {
                          const eventTarget = e.target as HTMLDivElement;
                          if (eventTarget.classList.contains("menu-btn")) {
                            commentMenuRef.current = e.currentTarget;
                          }
                        }}
                      >
                        <MoreVertIcon
                          fontSize="small"
                          htmlColor="grey"
                          className="menu-btn"
                          onClick={() => {
                            setCommentMenuIndex((prev) =>
                              prev === index ? -1 : index
                            );
                          }}
                        />
                        <div
                          className={`menu ${
                            commentMenuIndex === index ? "menu-active " : ""
                          }`}
                        >
                          <button
                            className="menu-item danger-btn transparent-btn icon-btn"
                            onClick={() => {
                              deleteComment({
                                id: comment._id,
                                postId: comment.postId,
                              });
                              commentMenuRef.current = null;
                              setCommentMenuIndex(-1);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                            <span className="fw-medium fs-small">
                              Delete Comment
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="fs-medium fw-medium">{comment.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        <Textarea
          value={commentBody}
          placeholder="What do you think about this post?"
          onChange={(val) => setCommentBody(val)}
          className="filled-input"
        />
        <SendIcon
          htmlColor="#62a6fe"
          onClick={() => {
            postId && createComment({ body: commentBody, postId });
            setCommentBody("");
          }}
        />
      </div>
    </Layout>
  );
};

export default Comments;
