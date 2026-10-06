// Тип и значения настроек приложения, используемые при первом запуске и хранении.
export interface AppSettings {
  printer: string;
  running: boolean;
  hybrid: boolean;
  idNum: boolean;
  endLine: boolean;
  paper: string;
  expand: number | "";
  theme: "system" | "light" | "dark";
  themeStyle: string;
  excludedTexts: string[];
}

export const defaultConfig: AppSettings = {
  printer: "",
  running: true,
  hybrid: false,
  idNum: false,
  endLine: false,
  paper: "30*20",
  expand: 500,
  theme: "system",
  themeStyle: "vercel",
  excludedTexts: [],
};
