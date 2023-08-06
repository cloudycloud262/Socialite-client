import { FC, useState, useEffect } from "react";
import { useCreateUpdatePasswordLinkMutation } from "../../store/authApi";

import Loading from "../../components/loading";

import styles from "./index.module.css";

const ForgetPassword: FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [showForm, setShowForm] = useState(true);

  const [createLink, status] = useCreateUpdatePasswordLinkMutation();

  useEffect(() => {
    if (status.isError && "data" in status.error) {
      setErrors({
        ...errors,
        ...(status.error.data as {}),
      });
    }
  }, [status.isError]);
  useEffect(() => {
    status.isSuccess && setShowForm(false);
  }, [status.isSuccess]);

  return (
    <form
      className={styles.wrapper}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {status.isLoading ? <Loading /> : null}
      {showForm ? (
        <>
          {" "}
          <div className="fw-thick fs-large">Forgot Password</div>
          <div className="form-input-wrapper ">
            <input
              type="text"
              placeholder="Enter your email"
              className="filled-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="fs-small fw-medium error">{errors.email}</span>
          </div>
          <button
            className={`contained-btn ${styles.resendBtn}`}
            onClick={() => createLink({ email })}
          >
            Submit
          </button>
        </>
      ) : (
        <div className="fs-medium fw-medium">
          Check your email for link to update your password
        </div>
      )}
    </form>
  );
};

export default ForgetPassword;
