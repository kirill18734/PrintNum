// Тип и значения настроек приложения, используемые при первом запуске и хранении.
export interface AppSettings {
  printer: string;
  hybrid: boolean;
  idNum: boolean;
  endLine: boolean;
  endLine_manual: boolean;
  bold: boolean;
  bold_manual: boolean;
  paper: string;
  font: string;
  opacity: number;
  opacity_manual: number;
  font_manual: string;
  showCodeText: boolean;
  background: string;
  background_manual: string;
  expand: number;
  theme: "system" | "light" | "dark";
  themeStyle: string;
  excludedTexts: string[];
}

export const defaultConfig: AppSettings = {
  printer: "",
  hybrid: false,
  idNum: false,
  endLine: false,
  endLine_manual: false,
  bold: false,
  bold_manual: false,
  showCodeText: true,
  background: "Без фона",
  background_manual: "Без фона",
  font: "Arial",
  font_manual: "Arial",
  opacity: 50,
  opacity_manual: 50,
  paper: "30*20",
  expand: 500,
  theme: "system",
  themeStyle: "vercel",
  excludedTexts: [],
};
