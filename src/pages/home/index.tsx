import Header from "./header";
import Main from "./main";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 select-none">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <Main />
      </div>
      <Footer />
    </div>
  );
}
