import { themeStyleCookieStorage } from "@/.server/theme-style.sessions";
import { sendServer } from "@/services/api";
import ThemeSelect from "@/components/theme";
import ThemeStyle from "@/components/theme-style";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { tempConfig } from "@/config/tempConfig";
import { DEFAULT_THEME_STYLE } from "@/config/theme-style";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))
    ?.themeStyle;

  return await sendServer
    .get("get-config")
    .then(async (response) => {
      let json = await response.json();
      return {
        themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
        config: json,
      };
    })
    .catch(() => {
      return {
        themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
        config: tempConfig,
      };
    });
}

export default function Settings() {
  const fetcher = useFetcher();
  const { themeStyle, config } = useLoaderData();
  const [version, setVersion] = useState("");

  const sendChange = (data) => {
    // Отправляем на сервер с указанием типа шифрования JSON
    fetcher.submit(data, {
      method: "POST",
      action: "/action/set-config",
      encType: "application/json", // Обязательный параметр!
    });
  };

  useEffect(() => {
    invoke("get_version").then(
      (message) => message && setVersion(`${message}`),
    );
  }, []);

  return (
    <div
      data-tauri-drag-region
      className=" flex-1 flex flex-col justify-between h-full gap-2"
    >
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <div className="flex flex-col items-center">
          <span>Принтер</span>
          <Select
            defaultValue={config.printer}
            onValueChange={(e) => {
              sendChange({ printer: e });
            }}
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Выберете принтер" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {config.listPrinters.map((printer, i) => (
                  <SelectItem value={printer} key={i}>
                    {printer}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* Этикетка */}
        <div data-tauri-drag-region className="flex flex-col items-center">
          <span>Этикетка (mm)</span>
          <Select
            defaultValue={config.paper}
            onValueChange={(e) => {
              sendChange({ paper: e });
            }}
          >
            <SelectTrigger className="w-full max-w-48" title="Ширина*Высота">
              <SelectValue placeholder="Выберете этикетку" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {config.listPapers.map((paper, i) => (
                  <SelectItem value={paper} key={i}>
                    {paper}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator />
      {/* Оформление этикетки */}
      <div data-tauri-drag-region className="flex flex-col items-center gap-2">
        <span className="font-medium">Оформление этикетки</span>

        <div data-tauri-drag-region className="flex items-start gap-7 w-full">
          {/* Настройки */}
          <div
            data-tauri-drag-region
            className="flex flex-col items-end justify-end gap-2 w-full"
          >
            <div data-tauri-drag-region className="flex flex-col items-start ">
              {/* Показывать ID */}
              <Field orientation="horizontal" className="p-1 w-auto">
                <Checkbox
                  id="checkbox-idNum"
                  checked={config.idNum}
                  onCheckedChange={(e) => sendChange({ idNum: e })}
                />
                <FieldLabel htmlFor="checkbox-idNum">Показывать ID</FieldLabel>
              </Field>

              {/* Нижняя линия */}
              <Field orientation="horizontal" className="p-1 w-auto">
                <Checkbox
                  id="checkbox-line"
                  checked={config.endLine}
                  onCheckedChange={(e) => sendChange({ endLine: e })}
                />
                <FieldLabel htmlFor="checkbox-line">Нижняя линия</FieldLabel>
              </Field>
              {/* Гибридный формат */}
              <div
                data-tauri-drag-region
                className={`flex flex-col items-center justify-center rounded-lg p-1  ${
                  config.hybrid ? "border border-border bg-muted/30" : ""
                }`}
              >
                <Field orientation="horizontal">
                  <Checkbox
                    id="checkbox-hybrid"
                    checked={config.hybrid}
                    onCheckedChange={(e) => sendChange({ hybrid: e })}
                  />
                  <FieldLabel htmlFor="checkbox-hybrid">
                    Гибридный формат
                  </FieldLabel>
                </Field>
                {config.hybrid && (
                  <div className="flex flex-col gap-1 pl-6">
                    <label
                      htmlFor="expand-value"
                      className="text-xs text-muted-foreground"
                    >
                      Начиная с номера
                    </label>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          sendChange({ expand: Math.max(1, config.expand - 1) })
                        }
                      >
                        −
                      </Button>

                      <Input
                        id="expand-value"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={config.expand}
                        onChange={(e) => {
                          const value = e.target.value;
                          // разрешаем пустое поле во время ввода
                          if (value === "") {
                            sendChange({ expand: "" });
                          }

                          // только целые числа
                          if (/^\d+$/.test(value)) {
                            sendChange({ expand: Number(value) });
                          }
                        }}
                        onBlur={() => {
                          if (
                            !Number.isInteger(Number(config.expand)) ||
                            Number(config.expand) < 1
                          )
                            sendChange({ expand: 1 });
                        }}
                        className="
      h-8 w-16 text-center
      [appearance:textfield]
      [&::-webkit-outer-spin-button]:appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
    "
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          sendChange({ expand: config.expand + 1 })
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Превью */}
          <div data-tauri-drag-region className="flex gap-4 w-full">
            <div className="flex flex-col items-center gap-1 p-1">
              {config.hybrid && (
                <span className="text-xs text-muted-foreground">
                  Этикетки 1 –{" "}
                  {config.expand - 1 < 1 ? config.expand : config.expand - 1}
                </span>
              )}

              <div
                className="flex flex-col justify-center items-center
          w-20 h-14 p-1 rounded-lg
          border border-border
          bg-white text-black shadow-sm font-[Arial]"
              >
                {config.idNum && (
                  <div className="flex justify-end items-center w-full text-right align-center  h-[0.5rem]">
                    <span className="text-[0.6rem]">−47</span>
                  </div>
                )}

                <div className="flex justify-center items-center  leading-none flex-1 ">
                  <span
                    className={`text-4xl font-bold ${config.endLine && "underline  decoration-3"}`}
                  >
                    123{!config.endLine && "."}
                  </span>
                </div>
              </div>
            </div>

            {config.hybrid && (
              <div className="flex flex-col items-center gap-1 p-1">
                <span className="text-xs text-muted-foreground">
                  Этикетки от {config.expand}
                </span>

                <div
                  className="flex flex-col justify-around items-center
            w-20 h-14 p-1 rounded-lg
            border border-border
            bg-white text-black shadow-sm font-[Arial]"
                >
                  <div className="flex justify-start items-center w-full text-right align-center  h-[0.5rem]">
                    <span className="text-[0.6rem]">{config.expand}−</span>
                  </div>
                  <div className="flex justify-center items-center  leading-none flex-1 ">
                    <span
                      className={`text-4xl font-bold ${config.endLine ? "underline  decoration-3" : ""}`}
                    >
                      123{!config.endLine && "."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator />
      {/* тема/стиль */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <div className="flex items-center gap-2">
          <span>Тема</span>
          <ThemeSelect />
        </div>
        <div className="flex  items-center gap-2">
          <span>Стиль</span>
          <ThemeStyle defaultThemeStyle={themeStyle} />
        </div>
      </div>
      <div data-tauri-drag-region className="flex items-center justify-center">
        v{version}
      </div>
    </div>
  );
}
