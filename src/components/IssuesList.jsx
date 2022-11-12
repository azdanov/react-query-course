import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { xfetch } from "../helpers/xfetch";
import { IssueItem } from "./IssueItem";
import Loader from "./Loader";

async function fetchIssues(signal, { status, labels, page }, queryClient) {
  const statusString = status ? `&status=${status}` : "";
  const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
  const pageString = page ? `&page=${page}` : "";
  const issues = await xfetch.get(
    `/api/issues?${labelsString}${statusString}${pageString}`,
    {
      signal,
    }
  );

  issues.forEach((issue) => {
    queryClient.setQueryData(["issues", issue.number], issue);
  });

  return issues;
}

export default function IssuesList({ labels, status, page, setPage }) {
  const queryClient = useQueryClient();
  const issuesQuery = useQuery(
    ["issues", { labels, status, page }],
    ({ signal }) => fetchIssues(signal, { status, labels, page }, queryClient),
    { retry: false, keepPreviousData: true }
  );

  useEffect(() => {
    queryClient.prefetchQuery(
      ["issues", { labels, status, page: page + 1 }],
      ({ signal }) =>
        fetchIssues(signal, { status, labels, page: page + 1 }, queryClient)
    );
  }, [queryClient, labels, status, page]);

  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useQuery(
    ["issues", "search", searchValue],
    ({ signal }) =>
      xfetch.get(`/api/search/issues?q=${searchValue}`, { signal }),
    { enabled: !!searchValue }
  );

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.elements.search.value);
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="Search"
          name="search"
          id="search"
          onChange={(event) => {
            if (event.target.value.length === 0) {
              setSearchValue("");
            }
          }}
        />
      </form>
      <h2>Issues List {issuesQuery.isFetching && <Loader />}</h2>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : searchQuery.fetchStatus === "idle" && searchQuery.isLoading ? (
        <>
          <ul className="issues-list">
            {issuesQuery.data.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <p>
              Page {page} {issuesQuery.isFetching && "..."}
            </p>
            <button
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={
                issuesQuery.data?.length === 0 || issuesQuery.isPreviousData
              }
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
