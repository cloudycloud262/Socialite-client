import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "./store/authApi";

import Home from "./pages/home";
import Explore from "./pages/explore";
import Requests from "./pages/requests";
import Notifications from "./pages/notifications";
import Chats from "./pages/chats";
import Account from "./pages/account";
import Community from "./pages/community";
import CommunityInfo from "./pages/community/communityInfo";
import Comments from "./components/comments";
import Header from "./components/header";
import BottomNav from "./components/header/bottomNav";
import Signup from "./pages/signup";
import Login from "./pages/login";
import PageNotFound from "./pages/pageNotFound";
import Loading from "./components/loading";
import ProtectedRoute from "./utils/protectedRoute";
import UpdatePassword from "./pages/emailVerification/updatePassword";
import Verifying from "./pages/emailVerification/verifying";
import ForgetPassword from "./pages/emailVerification/forgetPassword";

import "./index.css";

const App: FC = () => {
  const currentUser = useGetCurrentUserQuery();

  if (currentUser.isLoading || currentUser.isFetching) {
    return <Loading />;
  }
  return (
    <>
      {currentUser.isSuccess ? <Header /> : null}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:id"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/:id"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/:id/info"
          element={
            <ProtectedRoute>
              <CommunityInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <Comments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={currentUser.isError ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={currentUser.isError ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/password/forget"
          element={
            currentUser.isError ? <ForgetPassword /> : <Navigate to="/" />
          }
        />
        <Route path="/verifyEmail/:userId/:token" element={<Verifying />} />
        <Route
          path="/password/update/:userId/:token"
          element={<UpdatePassword />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <PageNotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
      {currentUser.isSuccess && currentUser.data.isVerified ? (
        <BottomNav />
      ) : null}
    </>
  );
};

export default App;
