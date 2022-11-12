import { useQuery } from "@tanstack/react-query";
import { defaultUsers } from "./defaultData";
import { xfetch } from "./xfetch";

export function useUserData(userId) {
  const userQuery = useQuery(
    ["users", userId],
    ({ signal }) => xfetch.get(`/api/users/${userId}`, { signal }),
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
      placeholderData: defaultUsers,
    }
  );

  return userQuery;
}
