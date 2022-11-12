import { useLabelsData } from "../helpers/useLabelsData";

export function Label({ label }) {
  const labelsQuery = useLabelsData();

  if (labelsQuery.isLoading) {
    return null;
  }
  const labelData = labelsQuery.data.find((l) => l.id === label);
  if (!labelData) {
    return null;
  }

  return <span className={`label ${labelData.color}`}>{labelData.name}</span>;
}
