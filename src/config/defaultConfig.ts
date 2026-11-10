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
  paper: "23*20",
  expand: 500,
  theme: "system",
  themeStyle: "vercel",
  excludedTexts: [],
};

export interface PaperFormat {
  id: string;
  label: string;
  isCustom?: boolean;
}

export const listPapers: PaperFormat[] = [
  { id: "30*20", label: "30 × 20 мм" },
  { id: "40*30", label: "40 × 30 мм" },
  { id: "43*25", label: "43 × 25 мм" },
  { id: "50*70", label: "50 × 70 мм" },
  { id: "58*40", label: "58 × 40 мм" },
  { id: "60*40", label: "60 × 40 мм" },
  { id: "75*120", label: "75 × 120 мм" },
  { id: "100*150", label: "100 × 150 мм" },
  { id: "custom_size", label: "Свой размер...", isCustom: true },
];
