import { FC, useState, useEffect } from "react";
import {
  useCreateUpdatePasswordLinkMutation,
  useDeleteAccountMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} from "../../store/authApi";
import { useSetPrivacyMutation } from "../../store/userApi";

import Loading from "../../components/loading";

import styles from "./index.module.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type EditProfileProps = {
  showEditForm: boolean;
};

const EditProfile: FC<EditProfileProps> = (props) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currPassword, setCurrPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showCreatePassBtn, setShowCreatePassBtn] = useState(true);
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    currPassword: "",
  });

  const currentUser = useGetCurrentUserQuery();
  const [updateProfile, updateStatus] = useUpdateProfileMutation();
  const [deleteAccount, deleteStatus] = useDeleteAccountMutation();
  const [createUpdatePassLink, createUpdatePassLinkStatus] =
    useCreateUpdatePasswordLinkMutation();
  const [setPrivacy] = useSetPrivacyMutation();
  useEffect(() => {
    if (currentUser.isSuccess) {
      setEmail(currentUser.data.email);
      setUsername(currentUser.data.username);
    }
  }, [currentUser.isSuccess]);
  useEffect(() => {
    if (updateStatus.isError && "data" in updateStatus.error) {
      setErrors({ ...errors, ...(updateStatus.error.data as {}) });
    }
  }, [updateStatus.isError]);
  useEffect(() => {
    if (deleteStatus.isError && "data" in deleteStatus.error) {
      setErrors({ ...errors, ...(deleteStatus.error.data as {}) });
    }
  }, [deleteStatus.isError]);
  useEffect(() => {
    if (createUpdatePassLinkStatus.isSuccess) {
      setShowCreatePassBtn(false);
    }
  }, [createUpdatePassLinkStatus.isSuccess]);

  return (
    <div
      className={`${styles.editProfile} ${
        props.showEditForm ? styles.editProfileActive : ""
      } form`}
    >
      <div className={styles.privacyWrapper}>
        <span className="fs-medium fw-medium">Private Account</span>
        <button
          onClick={() => setPrivacy(!currentUser.data?.isPrivate)}
          className={`toggle-btn ${
            currentUser.data?.isPrivate ? "toggle-btn-active" : ""
          }`}
        ></button>
      </div>
      {updateStatus.isLoading ? <Loading /> : null}
      {currentUser.data?.hasPassword ? (
        <>
          <div className={styles.privacyWrapper}>
            <span className="fs-medium fw-medium">Update Password</span>
            <button
              onClick={() => setShowPasswordField((prev) => !prev)}
              className={`toggle-btn ${
                showPasswordField ? "toggle-btn-active" : ""
              }`}
            ></button>
          </div>
          <div className="form-input-wrapper">
            <input
              type="text"
              className="filled-input"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                errors.email && setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            <span className="fs-small fw-medium error">{errors.email}</span>
          </div>
          <div className="form-input-wrapper">
            <input
              type="text"
              className="filled-input"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                errors.username &&
                  setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            <span className="fs-small fw-medium error">{errors.username}</span>
          </div>
          {showPasswordField ? (
            <div className="form-input-wrapper">
              <label htmlFor="password-field" className="filled-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-field"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    errors.password &&
                      setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {showPassword ? (
                  <VisibilityOffIcon
                    fontSize="small"
                    htmlColor="grey"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <VisibilityIcon
                    fontSize="small"
                    htmlColor="grey"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </label>
              <span className="fs-small fw-medium error">
                {errors.password}
              </span>
            </div>
          ) : null}
          <span className="fs-small fw-medium">
            To update or delete this account, enter the current password
          </span>
          <div className="form-input-wrapper">
            <label htmlFor="curr-password-field" className="filled-input">
              <input
                type={showCurrPassword ? "text" : "password"}
                id="curr-password-field"
                placeholder="Current Password"
                value={currPassword}
                onChange={(e) => {
                  setCurrPassword(e.target.value);
                  errors.currPassword &&
                    setErrors((prev) => ({ ...prev, currPassword: "" }));
                }}
              />
              {showCurrPassword ? (
                <VisibilityOffIcon
                  fontSize="small"
                  htmlColor="grey"
                  onClick={() => setShowCurrPassword(false)}
                />
              ) : (
                <VisibilityIcon
                  fontSize="small"
                  htmlColor="grey"
                  onClick={() => setShowCurrPassword(true)}
                />
              )}
            </label>
            <span className="fs-small fw-medium error">
              {errors.currPassword}
            </span>
          </div>
          <button
            className="contained-btn icon-btn"
            onClick={() =>
              updateProfile(
                showPasswordField
                  ? {
                      email,
                      username,
                      password,
                      currPassword,
                      isUpdatingPassword: showPasswordField,
                    }
                  : {
                      email,
                      username,
                      currPassword,
                      isUpdatingPassword: showPasswordField,
                    }
              )
            }
          >
            <EditIcon fontSize="small" />
            <span className="fs-small fw-medium">Update</span>
          </button>
          <button
            className="outlined-btn danger-btn icon-btn"
            onClick={() => deleteAccount(currPassword)}
          >
            <DeleteIcon fontSize="small" />
            <span className="fs-small fw-medium">Delete</span>
          </button>
        </>
      ) : showCreatePassBtn ? (
        <>
          {createUpdatePassLinkStatus.isLoading ? <Loading /> : null}
          <span className="fs-small fw-medium">
            To update email or delete account, you have to create password
          </span>
          <button
            className="outlined-btn"
            type="button"
            onClick={() => createUpdatePassLink({ email })}
          >
            Create Password
          </button>
        </>
      ) : (
        <span className="fs-medium fw-medium">
          Check your email for the link to update your password
        </span>
      )}
    </div>
  );
};

export default EditProfile;
