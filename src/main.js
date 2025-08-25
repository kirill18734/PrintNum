const { invoke } = window.__TAURI__.core;
const { getCurrentWindow, WebviewWindow } = window.__TAURI__.window;
const { PhysicalSize, LogicalSize } = window.__TAURI__.dpi;
const { open, Command } = window.__TAURI__.shell;

async function run_backend() {
  const command = new Command("run_backend", "powershell.exe", {
    args: [
      "-Command",
      "Stop-Process -Name backend -Force -ErrorAction SilentlyContinue; if ((Split-Path -Leaf (Get-Location)) -eq 'src-tauri') { Start-Process -FilePath '../backend/output/backend/backend.exe' -WindowStyle Hidden } else { Start-Process -FilePath './output/backend/backend.exe' -WindowStyle Hidden }",
    ],
  });
  await command.spawn();
}

const window1 = getCurrentWindow();

async function killBackend() {
  const cmd = new Command("kill_backend", "powershell.exe", {
    args: [
      "-Command",
      "Stop-Process -Name backend -Force -ErrorAction SilentlyContinue",
    ],
  });
  await cmd.execute();
}

window1.onCloseRequested(async (event) => {
  await killBackend();
});

const them_style = "theme-style";
let btn_change_theme = "change_theme";
let title_screen_area = "screen_area";
let div_container_screen = "container_screen";
let checkbox_mode = "switch";
let state_run = "state_run_text";
let list_printers = "select_printer";
let is_running = "run";
let show_cur_area = "Show_current_area";
let change_tracking_area = "Change_tracking_area";
let stateprinter = "no_printer_text";
let btn_github = "github";
let height_win;
let width_win;
let height_error = 7;
let dotsInterval = null;
let isFirstRequestSent = false;
let response;

async function setWindowSize(width, height) {
  const appWindow = getCurrentWindow();
  await appWindow.setSize(new LogicalSize(width, height));
}

function run_app(isRunning) {
  console.log("Запущен?", isRunning);
  const element = document.getElementById(is_running);

  if (isRunning) {
    element.value = "Остановить";
    element.style.backgroundColor = "red";
  } else {
    element.value = "Запустить";
    element.style.backgroundColor = "green";
  }

  element.addEventListener("mouseover", function () {
    element.style.backgroundColor = isRunning ? "darkred" : "darkgreen";
  });
  element.addEventListener("mouseout", function () {
    element.style.backgroundColor = isRunning ? "red" : "green";
  });

  animateDots(isRunning);
}

async function get_printers(printer) {
  const select = document.getElementById(list_printers);
  select.innerHTML = "";
  let printers = [];
  let defaultPrinter = "";

  if (typeof printer == "string" && printer) {
    printers = [printer];
    defaultPrinter = printer;
  } else if (typeof printer == "object" && printer.printers) {
    printers = printer.printers;
    defaultPrinter = printer.default;
  } else {
    console.error("Некорректный формат данных для get_printers");
    return;
  }

  printers.forEach((printerName) => {
    const option = document.createElement("option");
    option.value = printerName;
    option.textContent = printerName;
    if (printerName == defaultPrinter) option.selected = true;
    select.appendChild(option);
  });
}

async function setTheme(theme) {
  if (theme == "night") {
    document.getElementById(them_style).href = "night.css";
    document.getElementById(btn_change_theme).value = "☀️";
  } else {
    document.getElementById(them_style).href = "light.css";
    document.getElementById(btn_change_theme).value = "🌙";
  }
}

async function change_mode(mode) {
  if (mode == "neiro") {
    document.getElementById(checkbox_mode).checked = true;
    const titleElements = document.getElementsByClassName(title_screen_area);
    for (let i = 0; i < titleElements.length; i++) {
      titleElements[i].style.display = "block";
    }
    const containerElements =
      document.getElementsByClassName(div_container_screen);
    for (let i = 0; i < containerElements.length; i++) {
      containerElements[i].style.display = "flex";
    }
    width_win = 460;
    height_win = 425;
    setWindowSize(width_win, height_win);
  } else {
    const titleElements = document.getElementsByClassName(title_screen_area);
    for (let i = 0; i < titleElements.length; i++) {
      titleElements[i].style.display = "none";
    }
    const containerElements =
      document.getElementsByClassName(div_container_screen);
    for (let i = 0; i < containerElements.length; i++) {
      containerElements[i].style.display = "none";
    }
    width_win = 450;
    height_win = 275;
    setWindowSize(width_win, height_win);
  }
}

function show_area(btn) {
  const button = document.getElementById(btn);
  let originalValue = button.value;
  let countdown = 3;

  const interval = setInterval(() => {
    button.value = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      button.value = originalValue;
    }
  }, 1000);
}

function state_printer(is_offline) {
  const elements = document.getElementsByClassName(stateprinter);
  if (elements.length === 0) {
    console.warn("Элементы с классом 'stateprinter' не найдены");
    return;
  }

  for (let el of elements) {
    if (is_offline) {
      el.style.color = "red";
      el.textContent = "Принтер отключен";
      if (height_win == 275 || height_win == 425) {
        setWindowSize(width_win, height_win + height_error);
      }
    } else {
      el.style.color = "";
      el.textContent = "";
      if (height_win != 275 || height_win != 425) {
        setWindowSize(width_win, height_win - height_error);
      }
    }
  }
}

function sendDataRun(endpoint, data = "") {
  return fetch(`http://127.0.0.1:5000/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      response = data.body;
      console.log("Ответ от сервера:", response);
      if (endpoint == "run") {
        setTheme(response.theme);
        change_mode(response.mode);
        run_app(response.is_running);
        get_printers(response.printer);
      }
      if (endpoint == "change_them") {
        setTheme(response.theme);
      }
      if (endpoint == "change_mode") {
        change_mode(response.mode);
      }
      if (endpoint == "get_list_printers") {
        get_printers(response);
      }
      if (endpoint == "set_printer") {
        get_printers(response);
      }
      if (endpoint == "run_app") {
        run_app(response.is_running);
      }
      if (endpoint == "check_state_printer") {
        state_printer(response);
      }
      return data; // возвращаем чтобы можно было ждать await
    })
    .catch((error) => {
      console.error("Ошибка при отправке данных:", error);
      throw error;
    });
}

function animateDots(isRunning) {
  const stateTextElement = document.getElementById(state_run);
  if (!stateTextElement) return;

  if (dotsInterval) {
    clearInterval(dotsInterval);
    dotsInterval = null;
  }

  if (isRunning) {
    let dots = "";
    let dotCount = 0;

    const updateDots = () => {
      if (dotCount < 3) {
        dots += ".";
        dotCount++;
      } else {
        dots = "";
        dotCount = 0;
      }
      stateTextElement.textContent = "Приложение запущено" + dots;
    };

    dotsInterval = setInterval(updateDots, 1000);
  } else {
    stateTextElement.textContent = "Приложение отключено";
  }
}

function waitForResponse(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout"));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!isFirstRequestSent) {
    run_backend();

    try {
      await waitForResponse(sendDataRun("run"), 10000);
      isFirstRequestSent = true;
      console.log("Ответ получен, isFirstRequestSent = true");
    } catch (err) {
      console.warn("Не удалось получить ответ за 10 секунд:", err);
    }
  }

  const change_theme = document.getElementById(btn_change_theme);
  change_theme.addEventListener("click", function () {
    sendDataRun("change_them");
  });

  const mode = document.getElementById(checkbox_mode);
  mode.addEventListener("click", function () {
    sendDataRun("change_mode");
  });

  const get_list_printers = document.getElementById(list_printers);
  get_list_printers.addEventListener("click", function () {
    sendDataRun("get_list_printers");
  });

  const select_printer = document.getElementById(list_printers);
  get_list_printers.addEventListener("change", function () {
    sendDataRun("set_printer", select_printer.value);
  });

  const run_app_btn = document.getElementById(is_running);
  run_app_btn.addEventListener("click", function () {
    sendDataRun("run_app");
  });

  const show_current_area = document.getElementById(show_cur_area);
  show_current_area.addEventListener("click", function () {
    sendDataRun("show_area");
  });

  const change_area = document.getElementById(change_tracking_area);
  change_area.addEventListener("click", function () {
    show_area(change_tracking_area);
    setTimeout(() => {
      sendDataRun("set_area");
    }, 4000);
  });

  const open_github = document.getElementById(btn_github);
  open_github.addEventListener("click", () => {
    open("https://github.com/kirill18734/PrintNum");
  });

  setInterval(() => {
    sendDataRun("check_state_printer");
  }, 1000);
});
