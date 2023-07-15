import { FC, useEffect, useState } from "react";
import { useAppDispatch } from "../../store";
import { useGetCurrentUserQuery } from "../../store/authApi";
import {
  notificationApi,
  useGetNfUnreadCountQuery,
} from "../../store/notificationApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import Layout from "../../components/layout";
import { default as List } from "../../components/notifications";

const Notifications: FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useAppDispatch();

  const currentUser = useGetCurrentUserQuery();
  const getNfUnreadCount = useGetNfUnreadCountQuery(
    currentUser.data?.nfReadTime ?? skipToken
  );

  useEffect(() => {
    getNfUnreadCount.isSuccess && setUnreadCount(getNfUnreadCount.data);
    currentUser.isSuccess &&
      dispatch(
        notificationApi.util.updateQueryData(
          "getNfUnreadCount",
          currentUser.data?.nfReadTime,
          () => 0
        )
      );
  }, [getNfUnreadCount.isSuccess]);

  return (
    <Layout>
      <List unreadCount={unreadCount} query={{}} />
    </Layout>
  );
};

export default Notifications;
