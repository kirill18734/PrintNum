import ThemeStyle from "@/components/theme-style";

export default function Style({ themeStyle }: any) {
  return (
    <div className="flex  items-center gap-2">
      <span>Стиль</span>
      <ThemeStyle defaultThemeStyle={themeStyle} />
    </div>
  );
}
