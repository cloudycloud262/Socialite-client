import { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loginValidator } from "../../utils/validators";
import { useLoginMutation } from "../../store/authApi";

import Loading from "../../components/loading";

import styles from "../signup/index.module.css";
import GoogleIcon from "@mui/icons-material/Google";
import MailIcon from "@mui/icons-material/Mail";
import KeyIcon from "@mui/icons-material/Key";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [login, status] = useLoginMutation();

  useEffect(() => {
    if (status.isError && "data" in status.error) {
      setErrors({ ...errors, ...(status.error.data as {}) });
    }
  }, [status.isError]);

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
            const err = loginValidator({ email, password });
            if (!err.email && !err.password) {
              login({ email, password });
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
                placeholder="Email or Username"
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
            <Link
              to="/password/forget"
              className="fs-small fw-medium"
              style={{ marginLeft: "auto" }}
            >
              Forget Password?
            </Link>
            <span className="fs-small fw-medium error">{errors.password}</span>
          </div>
          <button className="contained-btn">Login</button>
        </form>
        <p className="fw-medium fs-medium">
          Doesn't have an account? <Link to="/signup">Signup</Link>
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

export default Login;
