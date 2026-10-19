import { SELECTOR } from "@/utils/constants";
import { waitLoadElement } from "@/utils/find";

async function clickElement(
  selector: string,
  textValue: string,
  commandName: string,
): Promise<boolean> {
  const element = await waitLoadElement(selector, textValue, commandName);
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  element.click();
  return true;
}

export async function selectInputByLabel(
  labelText: string,
  type: "checkbox" | "radio",
): Promise<boolean> {
  const label = await waitLoadElement(
    "label",
    labelText,
    "",
    document,
    500,
    true,
  );
  if (!(label instanceof HTMLElement)) {
    return false;
  }

  const input = await waitLoadElement(
    `[type="${type}"]`,
    "",
    "",
    label,
    300,
  );
  if (input instanceof HTMLElement) {
    input.click();
  }

  return true;
}

export async function executeDomActions(
  actions: string[],
  commandName: string,
): Promise<boolean> {
  for (const action of actions) {
    const isPackageSelector =
      action === SELECTOR.packageL || action === SELECTOR.packageM;
    const selector = isPackageSelector ? action : "button";
    const text = isPackageSelector ? "" : action;

    if (!(await clickElement(selector, text, commandName))) {
      return false;
    }
  }

  return true;
}
