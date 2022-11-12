import { Link } from "react-router-dom";
import { GoIssueClosed, GoIssueOpened, GoComment } from "react-icons/go";
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";
import { Label } from "./Label";
import { useQueryClient } from "@tanstack/react-query";
import { xfetch } from "../helpers/xfetch";

export const IssueItem = ({
  title,
  number,
  assignee,
  commentCount,
  createdBy,
  createdDate,
  labels,
  status,
}) => {
  const queryClient = useQueryClient();
  const assigneeUser = useUserData(assignee);
  const createdByUser = useUserData(createdBy);

  return (
    <li
      onMouseEnter={() => {
        queryClient.prefetchQuery(["issues", number], () =>
          xfetch.get(`/api/issues/${number}`)
        );
        queryClient.prefetchQuery(["issues", number, "comments"], () =>
          xfetch.get(`/api/issues/${number}/comments`)
        );
      }}
    >
      <div>
        {status === "done" || status === "cancelled" ? (
          <GoIssueClosed style={{ color: "red" }}></GoIssueClosed>
        ) : (
          <GoIssueOpened style={{ color: "green" }}></GoIssueOpened>
        )}
      </div>
      <div className="issue-content">
        <span>
          <Link to={`/issues/${number}`}>{title}</Link>
          {labels.map((label) => (
            <Label key={label} label={label} />
          ))}
        </span>
        <small>
          #{number} opened {relativeDate(createdDate)}{" "}
          {createdByUser.isSuccess && `by ${createdByUser.data.name}`}
        </small>
      </div>
      {assignee && !assigneeUser.isLoading && (
        <img
          className="assigned-to"
          alt={`Assigned to ${
            assigneeUser.isSuccess ? assigneeUser.data.name : "user avatar"
          }`}
          src={
            assigneeUser.isSuccess ? assigneeUser.data.profilePictureUrl : ""
          }
        />
      )}
      <span className="comment-count">
        {commentCount > 0 && (
          <>
            <GoComment />
            {commentCount}
          </>
        )}
      </span>
    </li>
  );
};
