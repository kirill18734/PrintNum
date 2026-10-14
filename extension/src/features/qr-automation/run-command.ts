import type { QrCommand } from "@/types/qr-command";
import { SELECTOR } from "@/utils/constants";
import { get_local_storage, set_local_storage } from "@/utils/storage";
import { qrCommands } from "./commands";
import { executeDomActions, selectInputByLabel } from "./dom-actions";

const packageCycle: (string | null)[] = [
  null,
  SELECTOR.packageM,
  SELECTOR.packageL,
];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function getNextPackage(): Promise<string | null> {
  const cycleIndex = (await get_local_storage("packageCycleIndex")) || 0;
  const packageSelector = packageCycle[cycleIndex];
  const nextIndex = (cycleIndex + 1) % packageCycle.length;

  await set_local_storage("packageCycleIndex", nextIndex);
  return packageSelector;
}

async function getActionsForIteration(
  command: QrCommand,
): Promise<string[]> {
  const actions = [...command.actions];
  if (command.group !== "package_cycle") {
    return actions;
  }

  const packageSelector = await getNextPackage();
  if (packageSelector && actions.length > 0) {
    actions.splice(actions.length - 1, 0, packageSelector);
  }

  return actions;
}

async function runCommand(command: QrCommand): Promise<void> {
  const disabledCommands = (await get_local_storage("offQrCodes")) || [];
  if (disabledCommands.includes(command.name)) {
    return;
  }

  if (
    command.group === "recommendation" ||
    command.group === "package_radio"
  ) {
    const inputType = command.group === "package_radio" ? "radio" : "checkbox";
    await selectInputByLabel(command.name, inputType);
    return;
  }

  let remainingLoops = 50;
  do {
    const actions = await getActionsForIteration(command);
    const succeeded = await executeDomActions(actions, command.name);
    if (!succeeded) {
      break;
    }

    if (command.isLoop) {
      await delay(1000);
      remainingLoops--;
    }
  } while (command.isLoop && remainingLoops > 0);
}

export function createQrCommandHandler(): (qrCode: string) => void {
  let isRunning = false;

  return (qrCode) => {
    const command = qrCommandsByCode.get(qrCode);
    if (!command) {
      return;
    }

    const isPathValid =
      command.group === "issue_all" || command.id === "auto_all"
        ? location.pathname === command.path
        : location.pathname.startsWith(command.path);
    if (!isPathValid || isRunning) {
      return;
    }

    isRunning = true;
    void runCommand(command)
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        isRunning = false;
      });
  };
}

const qrCommandsByCode = new Map(
  qrCommands.map((command) => [command.code, command]),
);
