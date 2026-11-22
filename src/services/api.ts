import type {
  GeneratedOutput,
  GenerateRequestPayload,
} from "../types";

export async function generateMessage(
  payload: GenerateRequestPayload
): Promise<GeneratedOutput> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Server returned an unexpected response (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as GeneratedOutput;
}
