import { FC, useState, useEffect, Dispatch, SetStateAction } from "react";
import { postValidator } from "../../utils/validators";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "../../store/postApi";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { Post } from "./post";

import Loading from "../loading";
import Textarea from "../textarea";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

type PostFormProps = {
  type: "create" | "update";
  post?: Post;
  setEditPostIndex?: Dispatch<SetStateAction<number>>;
};

const PostForm: FC<PostFormProps> = (props) => {
  const [postBody, setPostBody] = useState(props.post?.body || "");
  const [errors, setErrors] = useState({ body: "" });

  const [createPost, createPostStatus] = useCreatePostMutation();
  const [updatePost, updatePostStatus] = useUpdatePostMutation();
  const currentUser = useGetCurrentUserQuery();

  useEffect(() => {
    if (createPostStatus.isSuccess) {
      setPostBody("");
    }
  }, [createPostStatus.isSuccess]);

  return (
    <form
      className="create-post-form"
      onSubmit={(e) => {
        e.preventDefault();
        const err = postValidator({ body: postBody });
        if (!err.body && currentUser.data) {
          if (props.type === "create") {
            createPost({ body: postBody, userId: currentUser.data._id });
          } else if (props.type === "update") {
            if (props.post) {
              updatePost({ body: postBody, id: props.post?._id });
            }
            if (props.setEditPostIndex) {
              props.setEditPostIndex(-1);
            }
          }
        } else {
          setErrors(err);
        }
      }}
    >
      {createPostStatus.isLoading || updatePostStatus.isLoading ? (
        <Loading />
      ) : null}
      <div className="form-input-wrapper">
        <label id="create-post" className="filled-input">
          <Textarea
            value={postBody}
            onChange={(val) => {
              setPostBody(val);
              errors.body && setErrors((prev) => ({ ...prev, body: "" }));
            }}
            placeholder="What's on your mind?"
            maxLength={200}
          />
        </label>
        <span className="fs-small fw-medium error">{errors.body}</span>
      </div>
      <div className={`btn-grp ${styles.btnGrp}`}>
        {props.type === "update" ? (
          <button
            className="outlined-btn icon-btn danger-btn"
            type="button"
            onClick={() => props.setEditPostIndex && props.setEditPostIndex(-1)}
          >
            <CloseIcon fontSize="small" />
            <span className="fs-small fw-medium">Cancel</span>
          </button>
        ) : null}
        <button className="contained-btn icon-btn">
          <EditIcon fontSize="small" />
          <span className="fs-small fw-medium">
            {props.type === "create" ? "Create Post" : "Update Post"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default PostForm;
