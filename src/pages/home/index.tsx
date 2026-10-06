// Собирает главный экран из верхней панели, рабочей области и нижней панели.
import Header from "./header";
import Main from "./main/index";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 select-none">
      <Header />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Main />
      </div>
      <Footer />
    </div>
  );
}
// Собирает главный экран из верхней панели, рабочей области и нижней панели.
