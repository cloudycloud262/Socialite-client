import { FC, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import PostForm from "../posts/postForm";
import Posts from "../posts";
import Notifications from "../notifications";

import styles from "./index.module.css";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = (props) => {
  const { pathname } = useLocation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <PostForm type="create" />
      </div>
      <div className={`${styles.center}`}>
        <PostForm type="create" />
        {props.children}
      </div>
      <div className={styles.right}>
        {pathname === "/explore" ? (
          <div className="list">
            <Notifications query={{ limit: 5 }} isSideCard={true} />
            <Link className={styles.nfLink} to="/notifications">
              <span className="fs-small fw-medium">Show All Notifications</span>
              <ChevronRightIcon fontSize="small" />
            </Link>
          </div>
        ) : (
          <div className="list">
            <div className="list">
              <span className="list-header fw-medium fs-medium">New Posts</span>
              <Posts query={{ page: "explore", limit: 5 }} />
              <Link className={styles.nfLink} to="/explore">
                <span className="fs-small fw-medium">Explore</span>
                <ChevronRightIcon fontSize="small" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
