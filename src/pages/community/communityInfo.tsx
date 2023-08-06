import { FC } from "react";
import { useGetCommunityQuery } from "../../store/communityApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useNavigate, useParams } from "react-router-dom";
import { numberFormatter } from "../../utils/formatters";

import Loading from "../../components/loading";
import Layout from "../../components/layout";

import styles from "./index.module.css";

const Info: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const getCommunity = useGetCommunityQuery(id ?? skipToken);

  if (getCommunity.isLoading || getCommunity.isFetching) return <Loading />;
  if (getCommunity.isSuccess)
    return (
      <Layout community={getCommunity.data}>
        <div className={styles.info}>
          <span className="fs-medium fw-thin">
            Title <b>{getCommunity.data.title}</b>
          </span>
          <span
            className="fs-medium fw-thin"
            onClick={() => navigate(`/user/${getCommunity.data.creatorId}`)}
          >
            createdBy <b>{getCommunity.data.username}</b>
          </span>
          <span className="fs-medium fw-thin">
            followers <b>{numberFormatter(getCommunity.data.followersCount)}</b>
          </span>
        </div>
      </Layout>
    );
};

export default Info;
