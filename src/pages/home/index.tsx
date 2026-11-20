// Собирает главный экран из верхней панели, рабочей области и нижней панели.
import { useAppStore } from "@/services/store";
import ThemeStyle from "@/components/theme-style";
import Header from "./header";
import Main from "./main/index";
import Footer from "./footer";

export default function Home() {
  const themeStyle = useAppStore((state) => state.themeStyle);
  const setSetting = useAppStore((state) => state.setSetting);

  const setThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);

  return (
    <>
      <Header />
      <Main />
      <div className="mx-auto flex w-full max-w-5xl justify-end px-1 pb-1 md:px-6">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={setThemeStyle}
        />
      </div>
      <Footer />
    </>
  );
}
// Собирает главный экран из верхней панели, рабочей области и нижней панели.
