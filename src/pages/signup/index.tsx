import { FC, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupValidator } from "../../utils/validators";
import { useSignupMutation } from "../../store/authApi";

import Loading from "../../components/loading";

import styles from "./index.module.css";
import GoogleIcon from "@mui/icons-material/Google";
import MailIcon from "@mui/icons-material/Mail";
import KeyIcon from "@mui/icons-material/Key";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Signup: FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [signup, status] = useSignupMutation();

  useEffect(() => {
    if (status.isError && "data" in status.error) {
      setErrors({ ...errors, ...(status.error.data as {}) });
    }
  }, [status.isError]);
  useEffect(() => {
    if (status.isSuccess) {
      navigate("/verifyemail");
    }
  }, [status.isSuccess]);

  return (
    <div className={styles.bg}>
      {status.isLoading ? <Loading /> : null}
      <div className={styles.wrapper}>
        <div className="logo">
          <img src="/vite.svg" alt="" />
          <span>Socialy</span>
        </div>
        <p className={`${styles.branding} fw-medium fs-medium`}>
          Share your thoughts with people and create connections
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const err = signupValidator({ email, username, password });
            if (!err.email && !err.username && !err.password) {
              signup({ email, username, password });
            } else {
              setErrors(err);
            }
          }}
        >
          <div className="form-input-wrapper">
            <label htmlFor="email-field" className="filled-input">
              <MailIcon fontSize="small" htmlColor="grey" />
              <input
                type="text"
                id="email-field"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  errors.email && setErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
            </label>
            <span className="fs-small fw-medium error">{errors.email}</span>
          </div>
          <div className="form-input-wrapper">
            <label htmlFor="username-field" className="filled-input">
              <AlternateEmailIcon fontSize="small" htmlColor="grey" />
              <input
                type="text"
                id="username-field"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  errors.username &&
                    setErrors((prev) => ({ ...prev, username: "" }));
                }}
              />
            </label>
            <span className="fs-small fw-medium error">{errors.username}</span>
          </div>
          <div className="form-input-wrapper">
            <label htmlFor="password-field" className="filled-input">
              <KeyIcon fontSize="small" htmlColor="grey" />
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
            <span className="fs-small fw-medium error">{errors.password}</span>
          </div>
          <button className="contained-btn">Signup</button>
        </form>
        <p className="fw-medium fs-medium">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <div className={styles.line}></div>
        <div className={styles.thirdPartyBtns}>
          <button
            className="icon-btn contained-btn"
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_BASE_URL}/api/auth/google`,
                "_self"
              )
            }
          >
            <GoogleIcon fontSize="small" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
