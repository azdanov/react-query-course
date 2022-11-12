import { useQuery } from "@tanstack/react-query";
import { defaultLabels } from "./defaultData";
import { xfetch } from "./xfetch";

export function useLabelsData() {
  const labelsQuery = useQuery(
    ["labels"],
    ({ signal }) => xfetch.get("/api/labels", signal),
    {
      staleTime: 1000 * 60 * 60,
      placeholderData: defaultLabels,
    }
  );

  return labelsQuery;
}
