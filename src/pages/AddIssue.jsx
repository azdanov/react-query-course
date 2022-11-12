import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { xfetch } from "../helpers/xfetch";

export default function AddIssue() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addIssue = useMutation({
    mutationFn: (issueBody) => {
      return xfetch.post("/api/issues", issueBody);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["issues"], { exact: true });
      queryClient.setQueryData(["issues", data.number], data);
      navigate(`/issues/${data.number}`);
    },
  });

  return (
    <div className="add-issue">
      <h2>Add Issue</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (addIssue.isLoading) return;
          const form = e.target;
          const formData = new FormData(form);
          const issueBody = {
            title: formData.get("title"),
            comment: formData.get("comment"),
          };
          addIssue.mutate(issueBody);
        }}
      >
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" placeholder="Title" />
        <label htmlFor="comment"></label>
        <textarea id="comment" name="comment" placeholder="Comment"></textarea>
        <button type="submit" disabled={addIssue.isLoading}>
          {addIssue.isLoading ? "Adding Issue..." : "Add Issue"}
        </button>
      </form>
    </div>
  );
}
