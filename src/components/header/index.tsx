import { useRef, useState, FC, useEffect } from "react";
import useCloseOnOutsideClick from "../../hooks/useCloseOnOutsideClick";
import { useNavigate } from "react-router-dom";
import { useGetCurrentUserQuery, useLogoutMutation } from "../../store/authApi";
import { useGetUsersQuery } from "../../store/userApi";
import socket from "../../socket";
import useChatsSocketHooks from "../../hooks/useChatsSocketHooks";
import { useGetChatsQuery } from "../../store/chatApi";
import { useAppDispatch } from "../../store";
import { setTotalUnreadCount } from "../../store/chatSlice";
import { useGetCommunitiesQuery } from "../../store/communityApi";

import Navbar from "./navbar";
import Loading from "../loading";

import styles from "./index.module.css";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";

const Header: FC = () => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState({ term: "", debounced: "" });
  const [showAccMenu, setShowAccMenu] = useState(false);
  const [searchType, setSearchType] = useState<"user" | "community">("user");
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentUser = useGetCurrentUserQuery();
  const getUsers = useGetUsersQuery(
    {
      type: "Search",
      username: searchTerm.debounced,
    },
    { skip: !searchTerm.debounced || searchType !== "user" }
  );
  const getCommunities = useGetCommunitiesQuery(
    { title: searchTerm.debounced },
    { skip: !searchTerm.debounced || searchType !== "community" }
  );
  const getChats = useGetChatsQuery();
  const [logout, logoutStatus] = useLogoutMutation();

  useEffect(() => {
    const to = setTimeout(() => {
      setSearchTerm((prev) => ({ ...prev, debounced: prev.term }));
    }, 500);
    return () => {
      clearTimeout(to);
    };
  }, [searchTerm.term]);
  useEffect(() => {
    socket.emit("add-user", currentUser.data?._id);
  }, []);
  useEffect(() => {
    if (getChats.isSuccess) {
      const unreadCount = getChats.data.reduce(
        (accumulator, chat) =>
          accumulator +
          (chat.unreadCount &&
          chat.lastMessageSenderId !== currentUser.data?._id
            ? chat.unreadCount
            : 0),
        0
      );
      dispatch(setTotalUnreadCount(unreadCount));
    }
  }, [getChats.isSuccess]);
  useCloseOnOutsideClick(accountMenuRef, () => setShowAccMenu(false));
  useChatsSocketHooks();
  useCloseOnOutsideClick(searchWrapperRef, (target: HTMLElement) => {
    if (!searchButtonRef.current?.contains(target)) {
      setShowSearchBar(false);
    }
  });

  return (
    <>
      <div className={styles.wrapper}>
        <div className={`logo ${styles.logo}`}>
          <img src="/vite.svg" alt="" />
          <span>Socialy</span>
        </div>
        <div
          className={`${styles.searchWrapper} ${
            showSearchBar ? styles.activeSearch : ""
          }`}
          ref={searchWrapperRef}
        >
          <label htmlFor="search" className={`filled-input ${styles.search}`}>
            <SearchIcon fontSize="small" htmlColor="grey" />
            <input
              type="text"
              id="search"
              value={searchTerm.term}
              onChange={(e) =>
                setSearchTerm((prev) => ({ ...prev, term: e.target.value }))
              }
              placeholder="Search Account"
              ref={searchFieldRef}
              onFocus={() => setShowSearchBar(true)}
            />
            {searchTerm.term ? (
              <CloseIcon
                fontSize="small"
                htmlColor="grey"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchTerm((prev) => ({ ...prev, term: "" }));
                  setShowSearchBar(false);
                }}
              />
            ) : null}
          </label>
          {searchTerm.term && showSearchBar ? (
            <div className={`${styles.searchMenu} list`}>
              <div className="tab">
                <div
                  className={`tab-item fs-medium fw-medium ${
                    searchType === "user" ? "active-tab" : ""
                  }`}
                  onClick={() => setSearchType("user")}
                >
                  User
                </div>
                <div
                  className={`tab-item fs-small fw-medium ${
                    searchType === "community" ? "active-tab" : ""
                  }`}
                  onClick={() => setSearchType("community")}
                >
                  Community
                </div>
              </div>
              {getUsers.isLoading ||
              getUsers.isFetching ||
              getCommunities.isLoading ||
              getCommunities.isFetching ? (
                <div className={styles.searchLoading}>
                  <Loading />
                </div>
              ) : null}
              {searchType === "user" && getUsers.currentData?.length === 0 ? (
                <div className={`fs-small fw-medium ${styles.searchEmpty}`}>
                  No Results Found
                </div>
              ) : searchType === "community" &&
                getCommunities.currentData?.length === 0 ? (
                <div className={`fs-small fw-medium ${styles.searchEmpty}`}>
                  No Results Found
                </div>
              ) : null}
              {getUsers.currentData?.map((user, index) => (
                <div
                  className="user-card user-card-hover"
                  key={index}
                  onClick={() => {
                    user._id === currentUser.data?._id
                      ? navigate(`/account`)
                      : navigate(`/user/${user._id}`);
                    setSearchTerm((prev) => ({ ...prev, term: "" }));
                    setShowSearchBar(false);
                  }}
                >
                  <img
                    src={user.displayPicture || "/placeholderDp.png"}
                    alt=""
                    className="dp-icon"
                  />
                  <span className="fw-medium fs-small">{user.username}</span>
                </div>
              ))}
              {getCommunities.currentData?.map((community, index) => (
                <div
                  className="user-card user-card-hover"
                  key={index}
                  onClick={() => {
                    navigate(`/community/${community._id}`);
                    setSearchTerm((prev) => ({ ...prev, term: "" }));
                    setShowSearchBar(false);
                  }}
                >
                  <PeopleIcon htmlColor="grey" fontSize="small" />
                  <span className="fw-medium fs-small">{community.title}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <span ref={searchButtonRef} className={styles.searchIcon}>
          <SearchIcon
            htmlColor="grey"
            sx={{ fontSize: "1.35rem" }}
            onClick={() => {
              searchFieldRef.current?.focus();
              setShowSearchBar(true);
            }}
          />
        </span>
        <Navbar />
        <div className="menu-wrapper" ref={accountMenuRef}>
          <div
            className={styles.account}
            onClick={() => setShowAccMenu((prev) => !prev)}
          >
            <img
              src={currentUser.data?.displayPicture || "/placeholderDp.png"}
              alt=""
              className="dp-icon"
            />
            <span className="fs-medium fw-medium">
              {currentUser.data?.username}
            </span>
            <ArrowDropDownIcon fontSize="small" />
          </div>
          <div className={`menu ${showAccMenu ? "menu-active " : ""}`}>
            <button
              className="menu-item transparent-btn icon-btn disabled-text"
              onClick={() => {
                navigate("/account");
                setShowAccMenu(false);
              }}
            >
              <AccountCircleOutlinedIcon fontSize="small" />
              <span className="fw-medium fs-small">Account</span>
            </button>
            <button
              className="menu-item danger-btn transparent-btn icon-btn"
              onClick={() => {
                logout();
                setShowAccMenu(false);
              }}
            >
              <LogoutIcon fontSize="small" />
              <span className="fw-medium fs-small">Logout</span>
            </button>
          </div>
        </div>
      </div>
      {logoutStatus.isLoading ? <Loading /> : null}
    </>
  );
};

export default Header;
