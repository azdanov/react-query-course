import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GoGear } from "react-icons/go";
import { useLabelsData } from "../helpers/useLabelsData";
import { xfetch } from "../helpers/xfetch";

export default function IssueLabels({ labels, issueNumber }) {
  const labelsQuery = useLabelsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const setLabels = useMutation(
    (label) => {
      const newLabels = labels.includes(label)
        ? labels.filter((l) => l !== label)
        : [...labels, label];
      return xfetch.put(`/api/issues/${issueNumber}`, { labels: newLabels });
    },
    {
      onMutate: (label) => {
        const oldLabels = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).labels;
        const newLabels = labels.includes(label)
          ? oldLabels.filter((l) => l !== label)
          : [...oldLabels, label];

        queryClient.setQueryData(["issues", issueNumber], (oldData) => ({
          ...oldData,
          labels: newLabels,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (oldData) => {
            const rollbackLabels = labels.includes(label)
              ? [...oldLabels, label]
              : oldLabels.filter((l) => l !== label);
            return {
              ...oldData,
              labels: rollbackLabels,
            };
          });
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
        <span>Labels</span>
      </div>
      {labelsQuery.isLoading
        ? null
        : labels.map((label) => {
            const labelData = labelsQuery.data.find(
              (labelData) => labelData.id === label
            );
            return (
              <span key={label} className={`label ${labelData?.color}`}>
                {labelData?.name}
              </span>
            );
          })}
      <GoGear
        onClick={() => {
          !labelsQuery.isLoading && setMenuOpen((open) => !open);
        }}
      />
      {menuOpen && (
        <div className="picker-menu labels">
          {labelsQuery.data?.map((label) => {
            const selected = labels.includes(label.id);
            return (
              <div
                key={label.id}
                className={`${selected ? "selected" : ""}`}
                onClick={() => {
                  setLabels.mutate(label.id);
                }}
              >
                <span
                  className="label-dot"
                  style={{ backgroundColor: label.color }}
                ></span>
                {label.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
