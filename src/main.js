const { invoke } = window.__TAURI__.core;
const { getCurrentWindow, WebviewWindow } = window.__TAURI__.window;
const { PhysicalSize, LogicalSize } = window.__TAURI__.dpi;
const { open, Command } = window.__TAURI__.shell;
const { exists, BaseDirectory, writeTextFile, readTextFile } = window.__TAURI__.fs;

const them_style = "theme-style";
const btn_change_theme = "change_theme";
const title_screen_area = "screen_area";
const div_container_screen = "container_screen";
const checkbox_mode = "switch";
const state_run = "state_run_text";
const list_printers = "select_printer";
const is_running = "run";
const show_cur_area = "show_current_area";
const change_tracking_area = "change_tracking_area";
const stateprinter = "no_printer_text";
const btn_github = "github";
const width_win = 460;
const height_error = 7;
let height_win;
let isFirstRequestSent = false;
let response;
let config;
let dotsInterval = null;
// ---------- Работа с backend ----------
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

// ---------- Работа с конфигом ----------

async function loadConfig() {
  const data = await readTextFile("config.json", {
    baseDir: BaseDirectory.AppLocalData,
  });
  return JSON.parse(data);
}
async function updateConfig(updateFn) {
  const data = await readTextFile("config.json", {
    baseDir: BaseDirectory.AppLocalData,
  });
  const cfg = JSON.parse(data);

  // изменяем объект через колбэк
  updateFn(cfg);

  await writeConfig(cfg);
  return cfg;
}

async function writeConfig(data) {
  const contents = JSON.stringify(data, null, 2); // читаемый JSON
  await writeTextFile("config.json", contents, {
    baseDir: BaseDirectory.AppLocalData,
  });
}
// ---------------------------
// Конфигурация по умолчанию
//---------------------------
async function initConfig() {
  const fileExists = await exists("config.json", {
    baseDir: BaseDirectory.AppLocalData,
  });
  if (!fileExists) {
    const defaultConfig = {
      mode: "extension",
      theme: "night",
      printer: "",
      area: { x: 674, y: 432, width: 475, height: 157 },
      is_running: false,
      expand_number_after: 450
    };
    await writeConfig(defaultConfig);
  }
}

// ---------- UI функции ----------
// ---------- Отправка на сервер ----------

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

    if (endpoint == "get_list_printers") {
      get_printers(response.printers);
    }
    if (endpoint == "check_state_printer") {
      state_printer(response);
    }
     return data;
     })
    .catch((error) => {
      console.error("Ошибка при отправке данных:", error);
      throw error;
    });
}


// ---------- Список принтеров ----------
async function get_printers(printers) {
  const select = document.getElementById(list_printers);
  select.innerHTML = "";
  
  // Загружаем текущий конфиг
  let cfg = await loadConfig();
  let defaultPrinter = cfg.printer || "";
  console.log(defaultPrinter)
  // Если список пустой → вставляем пустой option и очищаем config.printer
  if (!Array.isArray(printers) || printers.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = ""; // можно написать "Нет принтеров"
    select.appendChild(option);

    // если в конфиге был выбран принтер — очищаем
    if (defaultPrinter) {
      cfg = await updateConfig((conf) => {
        conf.printer = "";
      });
    }
    return;
  }

  // Добавляем все принтеры из списка
  printers.forEach((printerName) => {
    const option = document.createElement("option");
    option.value = printerName;
    option.textContent = printerName;
    if (printerName === defaultPrinter) option.selected = true;
    select.appendChild(option);
  });
}

// ---------- Статус принтера ----------
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

// ---------- Тема ----------
function setTheme(theme) {
  if (theme === "dark" || theme === "night") {
    document.getElementById(them_style).href = "night.css";
    document.getElementById(btn_change_theme).value = "☀️";
  } else {
    document.getElementById(them_style).href = "light.css";
    document.getElementById(btn_change_theme).value = "🌙";
  }
}
// ---------- Режим ----------
async function setWindowSize(width, height) {
  const appWindow = getCurrentWindow();
  await appWindow.setSize(new LogicalSize(width, height));
}
function change_mode(mode) {
  if (mode == "neiro") {
    document.getElementById(checkbox_mode).checked = true;

    const titles = document.getElementsByClassName(title_screen_area);
    for (let el of titles) el.style.display = "block";

    const containers = document.getElementsByClassName(div_container_screen);
    for (let el of containers) el.style.display = "flex";
    height_win = 425;
    setWindowSize(width_win, height_win);
  } else {
    const titles = document.getElementsByClassName(title_screen_area);
    for (let el of titles) el.style.display = "none";

    const containers = document.getElementsByClassName(div_container_screen);
    for (let el of containers) el.style.display = "none";
    height_win = 275;
    setWindowSize(width_win, height_win);
  }
}
// Обёртка для повторных попыток
function sendDataRunWithRetry(endpoint, data = "", interval = 1000, timeout = 10000) {
  return new Promise((resolve, reject) => {
    let finished = false;

    // Стоп через timeout
    const stopTimer = setTimeout(() => {
      if (!finished) {
        finished = true;
        clearInterval(intervalId);
        reject(new Error(`Не удалось связаться с backend (${endpoint}) за ${timeout / 1000} сек.`));
      }
    }, timeout);

    // Запускаем попытки
    const intervalId = setInterval(async () => {
      if (finished) return;
      try {
        const result = await sendDataRun(endpoint, data);
        if (result) {
          finished = true;
          clearTimeout(stopTimer);
          clearInterval(intervalId);
          resolve(result);
        }
      } catch (err) {
        // если ошибка, просто ждём следующую попытку
        console.warn(`Попытка запроса ${endpoint} не удалась:`, err.message);
      }
    }, interval);
  });
}

// ---------- Таймер для изменения области отслеживания ----------
function set_area(btn) {
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

// ---------- Запуск ----------

function run_app(isRunning) {
  const element = document.getElementById(is_running);

  if (isRunning) {
    element.value = "Остановить";
    element.style.backgroundColor = "red";
  } else {
    element.value = "Запустить";
    element.style.backgroundColor = "green";
  }

  element.onmouseover = () => {
    element.style.backgroundColor = isRunning ? "darkred" : "darkgreen";
  };
  element.onmouseout = () => {
    element.style.backgroundColor = isRunning ? "red" : "green";
  };

  animateDots(isRunning);
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

// ---------- Основная инициализация ----------
document.addEventListener("DOMContentLoaded", async () => {
  //первый запуск приложения (загрузка настроек)
  if (!isFirstRequestSent) {
    await initConfig();
    config = await loadConfig();
    setTheme(config.theme);
    change_mode(config.mode);
    run_app(config.is_running);
    run_backend();

    try {
      await sendDataRunWithRetry("get_list_printers");
      console.log("Связь с backend установлена ✅");
    } catch (err) {
      console.error("Не удалось подключиться к backend ❌", err.message);
    }
    isFirstRequestSent = true
  }
  // режим
  document.getElementById(checkbox_mode).onclick = async () => {
    config = await updateConfig((cfg) => {
      cfg.mode = cfg.mode === "neiro" ? "extension" : "neiro";
    });
    change_mode(config.mode);
    sendDataRun("run_neiro");
  };

  // тема
  document.getElementById(btn_change_theme).onclick = async () => {
    config = await updateConfig((cfg) => {
      cfg.theme = cfg.theme === "light" ? "dark" : "light";
    });
    setTheme(config.theme);
  };
  
  // запуск/остановка приложения
  document.getElementById(is_running).onclick = async () => {
    config = await updateConfig((cfg) => {
      cfg.is_running = !cfg.is_running;
    });

    run_app(config.is_running);
    sendDataRun("run_neiro");
  };
  // получаем список принтеров
  document.getElementById(list_printers).onclick = async () => {
    sendDataRun("get_list_printers");
  };
  //изменяем принтер
  document
  .getElementById(list_printers)
  .addEventListener("change", async (e) => {
    const newPrinter = e.target.value;
    
    // обновляем конфиг
    config = await updateConfig((cfg) => {
      cfg.printer = newPrinter;
    });

    // сразу проставляем selected вручную
    const select = document.getElementById(list_printers);
    for (let i = 0; i < select.options.length; i++) {
      select.options[i].selected = (select.options[i].value === newPrinter);
    }
  });

    // получаем область отлеживания
  document.getElementById(show_cur_area).onclick = async () => {
    sendDataRun("show_area");
  };
  document.getElementById(change_tracking_area).onclick = async () => {
    set_area(change_tracking_area);
    setTimeout(() => {
      sendDataRun("set_area");
    }, 4000);
  };
  // открыть github
  document.getElementById(btn_github).onclick = () => {
    open("https://github.com/kirill18734/PrintNum");
  };
  setInterval(() => {
    sendDataRun("check_state_printer");
  }, 3000);
});