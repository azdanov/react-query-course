import { useMutation, useQueryClient } from "@tanstack/react-query";
import { xfetch } from "../helpers/xfetch";
import { StatusSelect } from "./StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient();
  const setStatus = useMutation(
    (newStatus) => {
      return xfetch.put(`/api/issues/${issueNumber}`, { status: newStatus });
    },
    {
      onMutate: (newStatus) => {
        const oldStatus = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).status;

        queryClient.setQueryData(["issues", issueNumber], (oldData) => ({
          ...oldData,
          status: newStatus,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (oldData) => ({
            ...oldData,
            status: oldStatus,
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
        <span>Status</span>
        <StatusSelect
          noEmptyOption
          value={status}
          onChange={(event) => {
            setStatus.mutate(event.target.value);
          }}
        />
      </div>
    </div>
  );
}
