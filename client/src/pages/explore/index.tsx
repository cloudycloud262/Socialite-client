import { FC } from "react";

import Layout from "../../components/layout";
import Posts from "../../components/posts";

const Explore: FC = () => {
  return (
    <Layout>
      <Posts query={{ page: "explore" }} />
    </Layout>
  );
};

export default Explore;
