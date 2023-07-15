import { FC, useEffect, useState } from "react";
import {
  authApi,
  useUpdatePasswordMutation,
  useVerifyUpdatePasswordLinkQuery,
} from "../../store/authApi";
import { Navigate, useParams } from "react-router-dom";
import PageNotFound from "../pageNotFound";
import { useAppDispatch } from "../../store";
import Loading from "../../components/loading";

import styles from "./index.module.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const UpdatePassword: FC = () => {
  const { token, userId } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const verifyLink = useVerifyUpdatePasswordLinkQuery({
    token: token || "",
    userId: userId || "",
  });
  const [errors, setErrors] = useState({ password: "" });
  const dispatch = useAppDispatch();
  const [updatePassword, updatePasswordStatus] = useUpdatePasswordMutation();

  useEffect(() => {
    if (updatePasswordStatus.isError && "data" in updatePasswordStatus.error) {
      setErrors({ ...errors, ...(updatePasswordStatus.error.data as {}) });
    }
  }, [updatePasswordStatus.isError]);

  if (verifyLink.isError || !token) {
    return <PageNotFound />;
  }
  if (updatePasswordStatus.isSuccess) {
    dispatch(authApi.util.invalidateTags(["CurrentUser"]));
    return <Navigate to="/" />;
  }
  return (
    <form
      className={styles.wrapper}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {updatePasswordStatus.isLoading ? <Loading /> : null}
      <div className="fw-thick fs-large">Update Password</div>
      <div className="form-input-wrapper ">
        <label htmlFor="password-field" className="filled-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <span className="fs-small fw-medium error">{errors.password}</span>
      </div>
      <button
        className={`contained-btn ${styles.resendBtn}`}
        onClick={() => userId && updatePassword({ userId, password })}
      >
        Submit
      </button>
    </form>
  );
};

export default UpdatePassword;
