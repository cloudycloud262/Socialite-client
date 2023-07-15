import { FC, useState } from "react";

import Layout from "../../components/layout";
import {
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useGetUsersQuery,
  useRemoveRequestMutation,
} from "../../store/userApi";

const Requests: FC = () => {
  const [tab, setTab] = useState("received");

  const getUsers = useGetUsersQuery({
    type: tab === "received" ? "ReceivedRequest" : "SentRequest",
  });
  const [acceptRequest] = useAcceptRequestMutation();
  const [declineRequest] = useDeclineRequestMutation();
  const [removeRequest] = useRemoveRequestMutation();

  return (
    <Layout>
      <div className="list">
        <span className="list-header fs-medium fw-medium">Requests</span>
        <div className="tab">
          <div
            className={`tab-item fs-medium fw-medium ${
              tab === "received" ? "active-tab" : ""
            }`}
            onClick={() => setTab("received")}
          >
            Received
          </div>
          <div
            className={`tab-item fs-medium fw-medium ${
              tab === "sent" ? "active-tab" : ""
            }`}
            onClick={() => setTab("sent")}
          >
            Sent
          </div>
        </div>
        <div className="list">
          {getUsers.data?.map((user, index) => (
            <div className="user-card" key={index}>
              <img src="/placeholderDp.png" alt="" className="dp-icon" />
              <span className="fs-medium fw-medium">{user.username}</span>
              <div className="btn-grp">
                {tab === "sent" ? (
                  <button
                    className="danger-btn outlined-btn"
                    onClick={() => removeRequest(user._id)}
                  >
                    Remove
                  </button>
                ) : (
                  <>
                    <button
                      className="contained-btn"
                      onClick={() => acceptRequest(user._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="danger-btn outlined-btn"
                      onClick={() => declineRequest(user._id)}
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Requests;
