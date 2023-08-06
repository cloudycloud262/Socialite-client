import {
  FC,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  FormEvent,
} from "react";
import { communityValidator, postValidator } from "../../utils/validators";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "../../store/postApi";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { Post } from "./post";
import { convertToBase64 } from "../../utils/formatters";
import { useLocation } from "react-router-dom";

import Loading from "../loading";
import Textarea from "../textarea";

import styles from "./index.module.css";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import { IconButton } from "@mui/material";
import {
  Community,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
} from "../../store/communityApi";

type PostFormProps = {
  type: "create" | "update";
  post?: Post;
  tab: "post" | "community";
  setEditPostIndex?: Dispatch<SetStateAction<number>>;
  setShowCommEdit?: Dispatch<SetStateAction<boolean>>;
  community?: Community;
};

const PostForm: FC<PostFormProps> = (props) => {
  const [postBody, setPostBody] = useState(
    props.type === "update"
      ? props.post?.body || props.community?._id || ""
      : ""
  );
  const [errors, setErrors] = useState<{ body?: string; title?: string }>({
    body: "",
    title: "",
  });
  const [image, setImage] = useState(props.post?.image || "");
  const { pathname } = useLocation();

  const [createPost, createPostStatus] = useCreatePostMutation();
  const [updatePost, updatePostStatus] = useUpdatePostMutation();
  const [createCommunity, createCommunityStatus] = useCreateCommunityMutation();
  const [updateCommunity, updateCommunityStatus] = useUpdateCommunityMutation();
  const currentUser = useGetCurrentUserQuery();

  useEffect(() => {
    if (createPostStatus.isSuccess) {
      setPostBody("");
      setImage("");
    }
    if (createCommunityStatus.isSuccess || updateCommunityStatus.isSuccess) {
      setPostBody("");
    }
  }, [
    createPostStatus.isSuccess,
    createCommunityStatus.isSuccess,
    updateCommunityStatus.isSuccess,
  ]);
  useEffect(() => {
    if (
      createCommunityStatus.isError &&
      "data" in createCommunityStatus.error
    ) {
      setErrors({ ...errors, ...(createCommunityStatus.error.data as {}) });
    }
    if (
      updateCommunityStatus.isError &&
      "data" in updateCommunityStatus.error
    ) {
      setErrors({ ...errors, ...(updateCommunityStatus.error.data as {}) });
    }
  }, [createCommunityStatus.isError, updateCommunityStatus.isError]);
  useEffect(() => {
    setPostBody("");
    setErrors({ title: "", body: "" });
  }, [props.tab]);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setImage(base64);
    }
  };

  const formSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (props.tab === "post") {
      const err = postValidator({ body: postBody });
      if (!err.body && currentUser.data) {
        if (props.type === "create") {
          const obj = { body: postBody, userId: currentUser.data._id, image };
          createPost(
            pathname.includes("/community") && props.community
              ? { ...obj, communityId: props.community._id }
              : obj
          );
        } else if (props.type === "update") {
          if (props.post) {
            updatePost({ body: postBody, id: props.post?._id, image });
          }
          if (props.setEditPostIndex) {
            props.setEditPostIndex(-1);
          }
        }
      } else {
        setErrors(err);
      }
    } else {
      const err = communityValidator({ title: postBody });
      if (!err.title && currentUser.data) {
        if (props.type === "create") {
          createCommunity({ title: postBody });
        } else if (props.type === "update") {
          if (props.community) {
            updateCommunity({ title: postBody, id: props.community._id });
          }
        }
      } else {
        setErrors(err);
      }
    }
  };

  return (
    <form className="create-post-form" onSubmit={formSubmitHandler}>
      {createPostStatus.isLoading ||
      updatePostStatus.isLoading ||
      createCommunityStatus.isLoading ||
      updateCommunityStatus.isLoading ? (
        <Loading />
      ) : null}
      <div className="form-input-wrapper">
        <label id="create-post" className="filled-input">
          {props.tab === "post" ? (
            <Textarea
              value={postBody}
              onChange={(val) => {
                setPostBody(val);
                errors.body && setErrors((prev) => ({ ...prev, body: "" }));
              }}
              placeholder={
                pathname.includes("/community")
                  ? `Create Post for ${props.community?.title}`
                  : "What's on your mind?"
              }
              maxLength={200}
            />
          ) : (
            <input
              value={postBody}
              onChange={(e) => {
                setPostBody(e.target.value);
                errors.body && setErrors((prev) => ({ ...prev, body: "" }));
              }}
              placeholder="Name your community"
              maxLength={50}
            />
          )}
        </label>
        <span className="fs-small fw-medium error">
          {props.tab === "post" ? errors.body : errors.title}
        </span>
      </div>
      {image ? <img src={image} alt="" className={styles.postImage} /> : null}
      <div className={`btn-grp ${styles.btnGrp}`}>
        <label
          htmlFor="post-image-field"
          className={styles.imageInputWrapper}
          onClick={(e) => e.currentTarget.click()}
        >
          {props.tab === "post" ? (
            <>
              <input
                type="file"
                id="post-image-field"
                onChange={handleImageChange}
                accept=".jpeg, .png, .jpg"
                className={styles.pictureInputField}
              />
              <IconButton>
                <ImageIcon />
              </IconButton>
            </>
          ) : null}
        </label>
        {props.type === "update" ? (
          <button
            className="outlined-btn icon-btn danger-btn"
            type="button"
            onClick={() => {
              props.setEditPostIndex && props.setEditPostIndex(-1);
              props.setShowCommEdit && props.setShowCommEdit(false);
            }}
          >
            <CloseIcon fontSize="small" />
            <span className="fs-small fw-medium">Cancel</span>
          </button>
        ) : null}
        <button className="contained-btn icon-btn">
          <EditIcon fontSize="small" />
          <span className="fs-small fw-medium">
            {props.tab === "post"
              ? props.type === "create"
                ? "Create Post"
                : "Update Post"
              : props.type === "create"
              ? "Create Community"
              : "Update Community"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default PostForm;
