import { FC } from "react";
import { Link } from "react-router-dom";

import styles from "./index.module.css";

const PageNotFound: FC = () => {
  return (
    <div className={styles.bg}>
      <div className={styles.main}>
        <div className={styles.title}>404</div>
        <Link
          className={`outlined-btn btn fs-medium fw-medium ${styles.navigateBtn}`}
          to="/"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
