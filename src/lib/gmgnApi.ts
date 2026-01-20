import { AddressFlow, normalizeAddressFlows } from "./gmgnData";

const buildEndpoint = (token: string): string => {
  const cleanToken = token.trim();
  const baseUrl = new URL("/api/v1/token/top-traders", window.location.origin);
  baseUrl.searchParams.set("token", cleanToken);
  baseUrl.searchParams.set("limit", "30");
  return baseUrl.toString();
};

export const fetchTop30AddressFlows = async (
  token: string,
  signal?: AbortSignal
): Promise<AddressFlow[]> => {
  if (!token.trim()) {
    return [];
  }

  const response = await fetch(buildEndpoint(token), {
    credentials: "include",
    signal
  });

  if (!response.ok) {
    throw new Error(`GMGN request failed: ${response.status}`);
  }

  const payload = await response.json();
  return normalizeAddressFlows(payload);
};
