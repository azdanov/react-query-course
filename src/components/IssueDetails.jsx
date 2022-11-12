import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { xfetch } from "../helpers/xfetch";
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";
import { IssueHeader } from "./IssueHeader";
import IssueStatus from "./IssueStatus";
import IssueAssignment from "./IssueAssignment";
import IssueLabels from "./IssueLabels";

function useIssueData(issueNumber) {
  return useQuery(["issues", issueNumber], ({ signal }) =>
    xfetch.get(`/api/issues/${issueNumber}`, { signal })
  );
}

function useIssueComments(issueNumber) {
  return useQuery(["issues", issueNumber, "comments"], ({ signal }) =>
    xfetch.get(`/api/issues/${issueNumber}/comments`, { signal })
  );
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = useUserData(createdBy);

  if (userQuery.isLoading) {
    return (
      <div className="comment">
        <div className="comment-header">Loading...</div>
      </div>
    );
  }

  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter avatar" />
      <div>
        <div className="comment-header">
          <span>{userQuery.data.name}</span> commented{" "}
          <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">{comment}</div>
      </div>
    </div>
  );
}

export default function IssueDetails() {
  const { number: issueNumber } = useParams();
  const issueQuery = useIssueData(Number(issueNumber));
  const commentsQuery = useIssueComments(Number(issueNumber));

  return (
    <div className="issue-details">
      {issueQuery.isLoading ? (
        <p>Loading issue...</p>
      ) : (
        <>
          <IssueHeader {...issueQuery.data} />

          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading comments...</p>
              ) : (
                <>
                  {commentsQuery.data?.map((comment) => (
                    <Comment key={comment.id} {...comment} />
                  ))}
                </>
              )}
            </section>
            <aside>
              <IssueStatus
                status={issueQuery.data.status}
                issueNumber={issueQuery.data.number}
              />
              <IssueAssignment
                assignee={issueQuery.data.assignee}
                issueNumber={issueQuery.data.number}
              />
              <IssueLabels
                labels={issueQuery.data.labels}
                issueNumber={issueQuery.data.number}
              />
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
