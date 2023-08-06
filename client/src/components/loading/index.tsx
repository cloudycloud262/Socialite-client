import { FC } from "react";

import styles from "./index.module.css";

const Loading: FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loading}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default Loading;
