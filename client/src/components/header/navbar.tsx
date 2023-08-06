import { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../store/authApi";
import { useGetNfUnreadCountQuery } from "../../store/notificationApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

import styles from "./index.module.css";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ExploreIcon from "@mui/icons-material/Explore";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import MarkUnreadChatAltOutlinedIcon from "@mui/icons-material/MarkUnreadChatAltOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";

const Navbar: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { totalUnreadCount } = useSelector(
    (state: RootState) => state.chatSlice
  );

  const currentUser = useGetCurrentUserQuery();
  const getNfUnreadCount = useGetNfUnreadCountQuery(
    currentUser.data?.nfReadTime ?? skipToken
  );

  return (
    <div className={styles.navbar}>
      <Link
        to="/"
        className={`${styles.navItem} ${
          pathname === "/" ? styles.activeNavItem : ""
        }`}
      >
        {pathname === "/" ? (
          <HomeIcon htmlColor="#62a6fe" sx={{ fontSize: "1.35rem" }} />
        ) : (
          <HomeOutlinedIcon htmlColor="grey" sx={{ fontSize: "1.35rem" }} />
        )}
      </Link>
      <Link
        to="/explore"
        className={`${styles.navItem} ${
          pathname === "/explore" ? styles.activeNavItem : ""
        }`}
      >
        {pathname === "/explore" ? (
          <ExploreIcon htmlColor="#62a6fe" sx={{ fontSize: "1.35rem" }} />
        ) : (
          <ExploreOutlinedIcon htmlColor="grey" sx={{ fontSize: "1.35rem" }} />
        )}
      </Link>
      <Link
        to="/requests"
        className={`${styles.navItem} ${
          pathname === "/requests" ? styles.activeNavItem : ""
        }`}
      >
        {pathname === "/requests" ? (
          <PersonIcon htmlColor="#62a6fe" sx={{ fontSize: "1.35rem" }} />
        ) : (
          <PersonOutlinedIcon htmlColor="grey" sx={{ fontSize: "1.35rem" }} />
        )}
      </Link>
      <Link
        to="/notifications"
        className={`${styles.navItem} ${
          pathname === "/notifications" ? styles.activeNavItem : ""
        }`}
      >
        {pathname === "/notifications" ? (
          <NotificationsIcon htmlColor="#62a6fe" sx={{ fontSize: "1.35rem" }} />
        ) : getNfUnreadCount.data ? (
          <NotificationsActiveOutlinedIcon
            htmlColor="grey"
            sx={{ fontSize: "1.35rem" }}
          />
        ) : (
          <NotificationsNoneOutlinedIcon
            htmlColor="grey"
            sx={{ fontSize: "1.35rem" }}
          />
        )}
      </Link>
      <div
        className={`${styles.navItem} ${
          pathname.includes("chats") ? styles.activeNavItem : ""
        }`}
        onClick={() => !pathname.includes("chats") && navigate("/chats")}
      >
        {pathname.includes("chats") ? (
          <ChatIcon htmlColor="#62a6fe" sx={{ fontSize: "1.35rem" }} />
        ) : totalUnreadCount ? (
          <MarkUnreadChatAltOutlinedIcon
            htmlColor="grey"
            sx={{ fontSize: "1.35rem" }}
          />
        ) : (
          <ChatOutlinedIcon htmlColor="grey" sx={{ fontSize: "1.35rem" }} />
        )}
      </div>
    </div>
  );
};

export default Navbar;
