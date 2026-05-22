import { ArrowUpIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "~components/ui/button";
import "~main.css";

function IndexPopup() {
  useEffect(() => {
    const theme = "system";
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

export default IndexPopup;
