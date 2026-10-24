import Header from "./header";
import Main from "./main/index";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="grid h-dvh w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-neutral-50 text-neutral-900 select-none dark:bg-neutral-950 dark:text-neutral-50">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
