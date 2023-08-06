import { FC, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetCurrentUserQuery } from "../store/authApi";
import VerificationPending from "../pages/emailVerification/pending";

type props = {
  children: ReactNode;
};

const ProtectedRoute: FC<props> = (props) => {
  const currentUser = useGetCurrentUserQuery();
  const { pathname } = useLocation();

  return (
    <>
      {currentUser.isSuccess ? (
        currentUser.data.isVerified || pathname === "/account" ? (
          props.children
        ) : (
          <VerificationPending />
        )
      ) : (
        <Navigate to="/login" replace />
      )}
    </>
  );
};

export default ProtectedRoute;
