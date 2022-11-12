import { useUserData } from "../helpers/useUserData";
import { GoGear } from "react-icons/go";
import { xfetch } from "../helpers/xfetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function IssueAssignment({ assignee, issueNumber }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUserData(assignee);
  const usersQuery = useQuery(["users"], () => xfetch.get("/api/users"));

  const queryClient = useQueryClient();
  const setAssignment = useMutation(
    (newAssignee) => {
      return xfetch.put(`/api/issues/${issueNumber}`, {
        assignee: newAssignee,
      });
    },
    {
      onMutate: (newAssignee) => {
        const oldAssignee = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).assignee;

        queryClient.setQueryData(["issues", issueNumber], (oldData) => ({
          ...oldData,
          assignee: newAssignee,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (oldData) => ({
            ...oldData,
            assignee: oldAssignee,
          }));
        };
      },
      onError: (_error, _variables, rollback) => {
        rollback();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true });
      },
    }
  );

  return (
    <div className="issue-options">
      <div>
        <span>Assignment</span>
        {user.isSuccess && (
          <div>
            {user.data.profilePictureUrl && (
              <img src={user.data.profilePictureUrl} alt="User picture" />
            )}
            {user.data.name}
          </div>
        )}
      </div>
      <GoGear
        onClick={() => {
          !usersQuery.isLoading && setMenuOpen((open) => !open);
        }}
      />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery.data?.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setAssignment.mutate(user.id);
              }}
            >
              <img src={user.profilePictureUrl} alt="User picture" />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
