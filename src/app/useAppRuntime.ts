import { useThemeRuntime } from "./runtime/useTheme";
import { usePlatformRuntime } from "./runtime/usePlatform";
import { useBackendRuntime } from "./runtime/useBackend";

export function useAppRuntime(): void {
  useThemeRuntime();
  usePlatformRuntime();
  useBackendRuntime();
}