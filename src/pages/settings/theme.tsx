import ThemeSelect from "@/components/theme";

export default function Theme() {
  return (
    <div className="flex items-center gap-2">
      <span>Тема</span>
      <ThemeSelect />
    </div>
  );
}
