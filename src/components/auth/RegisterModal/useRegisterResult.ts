import { useState } from "react";

export function useRegisterResult() {
  const [result, setResult] = useState<null | { type: "success" | "error" }>(
    null
  );

  const setSuccess = () => setResult({ type: "success" });
  const setError = () => setResult({ type: "error" });
  const clearResult = () => setResult(null);

  return {
    result,
    setSuccess,
    setError,
    clearResult,
  };
}
