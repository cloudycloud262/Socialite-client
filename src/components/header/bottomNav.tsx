import { FC } from "react";

import Navbar from "./navbar";

import styles from "./index.module.css";

const BottomNav: FC = () => {
  return (
    <div className={styles.bottomNav}>
      <Navbar />
    </div>
  );
};
export default BottomNav;
