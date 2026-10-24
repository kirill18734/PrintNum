  import type {
  AutoPrintStage,
  AutoPrintStep,
  LatestAutoPrintStatus,
} from "./types.ts";
import type { ManualPrintJob } from "../label-creation/types.ts";

export interface PipelineState {
  status: AutoPrintStep["status"] | "idle";
  message: string;
}

export function getPipeline(
  event: LatestAutoPrintStatus | null,
): Record<AutoPrintStage, PipelineState> {
  const stages: Record<AutoPrintStage, PipelineState> = {
    received: {
      status: "idle",
      message: "Ожидается первое задание автопечати",
    },
    readiness: { status: "idle", message: "Настройте запуск" },
    exclusions: { status: "idle", message: "Ожидание проверки" },
    formatting: { status: "idle", message: "Настройте вид этикетки" },
    result: { status: "idle", message: "Заданий ещё не было" },
  };
  if (!event) return stages;

  stages.received = { status: "complete", message: "Текст получен" };
  for (const step of event.steps) {
    const stage = step.stage ?? legacyStage(step);
    if (stage && stage !== "received") {
      stages[stage] = {
        status:
          step.status === "blocked" &&
          step.message.toLocaleLowerCase().includes("принтер")
            ? "error"
            : step.status,
        message: step.message,
      };
    }
  }

  if (event.status === "printed") {
    stages.readiness = {
      status: "complete",
      message: "Принтер и этикетка готовы",
    };
    stages.exclusions = {
      status: "complete",
      message: "Совпадений не найдено",
    };
    stages.formatting = { status: "complete", message: "Оформление применено" };
    stages.result = {
      status: "complete",
      message: "Успешно отправлено на печать",
    };
  } else if (event.status === "processing") {
    stages.result = { status: "pending", message: "Обработка задания…" };
  } else {
    const reason = [...event.steps]
      .reverse()
      .find(
        (step) =>
          step.status === "blocked" ||
          step.status === "skipped" ||
          step.status === "error",
      );
    stages.result = {
      status:
        event.status === "error" ||
        Object.values(stages).some((stage) => stage.status === "error")
          ? "error"
          : event.status === "skipped"
            ? "skipped"
            : "blocked",
      message: reason?.message ?? "Задание не отправлено на печать",
    };
    for (const stage of ["readiness", "exclusions", "formatting"] as const) {
      if (stages[stage].status === "idle") {
        stages[stage].message =
          event.status === "error"
            ? "Выполнение не подтверждено"
            : "Этап не выполнялся";
      }
    }
  }
  return stages;
}

function manualState(job: ManualPrintJob): PipelineState {
  return {
    status:
      job.status === "printed"
        ? "complete"
        : job.status === "processing"
          ? "pending"
          : "error",
    message: job.message,
  };
}

export function getDisplayPipeline(
  event: LatestAutoPrintStatus | null,
  manualJob: ManualPrintJob | null,
  mode: "autoprint" | "create",
  printerReady: boolean,
  readinessMessage: string,
  running = true,
) {
  const stages = getPipeline(event);
  // Polling the same automatic event must not overwrite a newer manual result.
  const manualIsLatest =
    manualJob !== null && (!event || manualJob.startedAt >= event.receivedAt);
  const resultSource = manualIsLatest
    ? "Создание этикетки"
    : event
      ? "Автопечать"
      : null;
  const resultText = manualIsLatest ? manualJob.content : (event?.text ?? null);
  const resultTime = manualIsLatest
    ? manualJob.startedAt
    : (event?.receivedAt ?? null);
  if (manualIsLatest) {
    stages.result = manualState(manualJob);
    stages.readiness =
      manualJob.status === "printed"
        ? { status: "complete", message: "Принтер и этикетка готовы" }
        : { status: "idle", message: readinessMessage };
  }

  if (mode === "create") {
    stages.formatting = manualJob
      ? manualState(manualJob)
      : {
          status: "idle",
          message: "Создайте этикетку и отправьте её на печать",
        };
    if (manualJob?.status === "printed")
      stages.formatting.message = "Этикетка создана и отправлена на печать";
  }

  // Принтер оффлайн — красный «Запуск», остальные сброшены
  if (!printerReady) {
    for (const stage of Object.values(stages)) stage.status = "idle";
    stages.readiness = { status: "error", message: readinessMessage };
    // Не подсвечиваем «Этикетку» даже в режиме создания — оставляем дефолт
    stages.formatting = {
      status: "idle",
      message: stages.formatting.message || "Печать недоступна",
    };
    if (resultSource)
      stages.result.message = `Последний результат: ${stages.result.message}`;
  }

  // Автопечать остановлена — стилизация как при оффлайне
  if (printerReady && !running) {
    for (const stage of Object.values(stages)) stage.status = "idle";
    stages.readiness = {
      status: "error",
      message: readinessMessage || "Автопечать остановлена",
    };
    if (mode === "create")
      stages.formatting = {
        status: "error",
        message: readinessMessage || "Автопечать остановлена",
      };
    if (resultSource)
      stages.result.message = `Последний результат: ${stages.result.message}`;
  }

  // Если принтер доступен (выбран и online) — этап 1 всегда зелёный
  if (printerReady) {
    stages.readiness = { status: "complete", message: "" };
  }
  // Статус этапа 1 показываем только рядом с заголовком «Принтер»,
  // поэтому убираем текстовое сообщение на самом этапе.
  stages.readiness.message = "";

  return { stages, resultSource, resultText, resultTime };
}
