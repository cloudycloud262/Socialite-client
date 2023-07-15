import { FC } from "react";
import { useResendVerificationMutation } from "../../store/authApi";

import Loading from "../../components/loading";

import styles from "./index.module.css";

const VerificationPending: FC = () => {
  const [resendVerification, resendVerificationStatus] =
    useResendVerificationMutation();

  return (
    <div className={styles.wrapper}>
      {resendVerificationStatus.isLoading ? <Loading /> : null}
      <div className="fw-thick fs-large">Verify your Email</div>
      <div className="fw-medium fs-medium">
        A link has been sent to your email address. Open the link to verify your
        email.
      </div>
      <button
        className={`contained-btn ${styles.resendBtn}`}
        onClick={() => {
          if (!resendVerificationStatus.isLoading) {
            resendVerification();
          }
        }}
      >
        Resend Verification Link
      </button>
    </div>
  );
};

export default VerificationPending;
