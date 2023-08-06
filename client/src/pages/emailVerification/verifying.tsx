import { FC, useEffect } from "react";
import { authApi, useVerifyEmailMutation } from "../../store/authApi";
import { Navigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../store";

import PageNotFound from "../pageNotFound";
import Loading from "../../components/loading";

const Verifying: FC = () => {
  const { token, userId } = useParams();
  const [verifyEmail, verifyEmailStatus] = useVerifyEmailMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && userId) verifyEmail({ token, userId });
  }, []);

  if (verifyEmailStatus.isError) {
    return <PageNotFound />;
  }
  if (verifyEmailStatus.isSuccess) {
    dispatch(authApi.util.invalidateTags(["CurrentUser"]));
    return <Navigate to="/" replace />;
  }
  return <Loading />;
};

export default Verifying;
