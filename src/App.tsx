import { useAppContext } from "./AppContext";

import "./App.scss";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Load from "./components/Load";

function App() {
  const { status }: any = useAppContext();

  return status !== "Сервер НЕДОСТУПЕН" ? (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  ) : (
    <Load />
  );
}

export default App;
