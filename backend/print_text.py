import win32ui
import win32print
import win32timezone  # модуль для компиляции, нужен для очистки очереди


def clear_printer_queue(printer_name):
    """
    Очищает очередь печати выбранного принтера.
    """
    try:
        printer = win32print.OpenPrinter(printer_name)
        jobs = win32print.EnumJobs(printer, 0, -1, 1)
        print(jobs)
        if jobs:
            print(f"Очистка очереди принтера '{printer_name}', найдено задач: {len(jobs)}")

        for job in jobs:
            try:
                win32print.SetJob(printer, job['JobId'], 0, None, win32print.JOB_CONTROL_DELETE)
            except Exception as e:
                print(f"Не удалось удалить задание {job['JobId']}: {e}")

        win32print.ClosePrinter(printer)

    except Exception as e:
        print(f"Ошибка при очистке очереди: {e}")


def print_text(text, config):
    try:
        printer = config['printer']['default']

        # --- ОЧИСТКА ОЧЕРЕДИ ПЕРЕД ПЕЧАТЬЮ ---
        clear_printer_queue(printer)

        # Создаем контекст принтера
        printer_dc = win32ui.CreateDC()
        printer_dc.CreatePrinterDC(printer)

        horz_res = int(config["paper"]["width"]) * 8
        vert_res = int(config["paper"]["height"]) * 8

        text = f"{text}."
        max_char_width = 80
        max_chars = int(horz_res / max_char_width)
        text_length = len(text)

        if text_length <= max_chars:
            height = vert_res
        else:
            scale = max_chars / text_length
            height = int(vert_res * scale)

        FONT = {
            "name": "Arial",
            "height": height,
        }

        font = win32ui.CreateFont(FONT)
        printer_dc.SelectObject(font)

        text_width, text_height = printer_dc.GetTextExtent(text)

        x = (horz_res - text_width) // 2
        y = (vert_res - text_height) // 2

        print(f"Отправил на распечатку: '{text}'")

        printer_dc.StartDoc(f"Ячейка {text}")
        printer_dc.StartPage()
        printer_dc.TextOut(x, y, text)
        printer_dc.EndPage()
        printer_dc.EndDoc()
        printer_dc.DeleteDC()

    except Exception as e:
        print('Ошибка при печати:', e)
