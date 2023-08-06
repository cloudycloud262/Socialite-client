import { FC } from "react";

import Layout from "../../components/layout";
import Posts from "../../components/posts";

const Home: FC = () => {
  return (
    <Layout>
      <Posts query={{ page: "home" }} />
    </Layout>
  );
};

export default Home;
