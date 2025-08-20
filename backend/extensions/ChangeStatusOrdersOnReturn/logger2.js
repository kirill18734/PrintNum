let last_number = '';
let number_order = '';
let allTrs;
let trElement;
let processingReturn = false;

const commandToRun = '82634791520368417952631';
const bnt_return_check = 'Проверка';

function convertCyrillicToLatin(input) {
    const layout = {
        'ш': 'i',
    };
    return input.replace(/[а-яё]/gi, char => {
        const lower = char.toLowerCase();
        const isUpper = char !== lower;
        const latin = layout[lower] || char;
        return isUpper ? latin.toUpperCase() : latin;
    });
}

//эмуляция нажатие на стролки
function simulateKeyPress(element, key, keyCode) {
    const event = new KeyboardEvent('keydown', {
        key: key,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(event);
}
// автоматическое ожидание
function waitAndGet(selectorOrCallback, timeout = 3000, interval = 100) {
    return new Promise((resolve, reject) => {
        const isMatch = typeof selectorOrCallback === 'function'
             ? selectorOrCallback
             : () => document.querySelector(selectorOrCallback);

        const timer = setInterval(() => {
            const result = isMatch();
            if (result) {
                clearInterval(timer);
                clearTimeout(failTimer);
                resolve(result);
            }
        }, interval);

        const failTimer = setTimeout(() => {
            clearInterval(timer);
            reject(new Error(`Element not found within ${timeout}ms`));
        }, timeout);
    });
}

async function return_order() {
    //кнопка "проверка"
    const buttons = trElement.querySelectorAll('button');
    let checkButton;
    for (const btn of buttons) {
        if (btn.textContent.trim() === bnt_return_check) {
            checkButton = btn;
            break;
        }
    }
    // убираем галочку
    if (checkButton) {
        checkButton.click();
        setTimeout(function () {
            const checkbox = trElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.click();
            }
        }, 500)
    }
    // выбираем причину
    const wrapper = await waitAndGet(() => trElement.querySelector('._returnGroupReasonSelectWrapper_1v3qc_3'));
    const input = await waitAndGet(() => wrapper.querySelector('input.ozi__input__input__-VL68'));
    const rect = input.getBoundingClientRect();
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.x + 5,
        clientY: rect.y + 5
    });

    input.focus();
    input.dispatchEvent(clickEvent);
    // указываем причину
    await new Promise(resolve => setTimeout(resolve, 300));
    for (let i = 0; i < 2; i++) {
        simulateKeyPress(input, 'ArrowUp', 38);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`Нажатие стрелки вверх ${i + 1}/2`);
    }
    simulateKeyPress(input, 'Enter', 13);

    // асинхронная пауза 0 мс, чтобы дать время браузеру обработать Enter
    await new Promise(resolve => setTimeout(resolve, 100));

    const activeElement = document.activeElement;

    // создаем событие keydown для Shift + Tab
    const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        which: 9,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    });

    activeElement.dispatchEvent(shiftTabEvent);

    // переключаем фокус вручную на предыдущий элемент
    const focusableElements = Array.from(document.querySelectorAll('input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'))
        .filter(e => !e.disabled && e.offsetParent !== null);
    const index = focusableElements.indexOf(activeElement);
    if (index > 0) {
        focusableElements[index - 1].focus();
    }
}

document.addEventListener('keydown', async function (event) {
    if (!event.isTrusted)
        return; // игнорируем синтетические события

    if (event.key.length === 1) {
        // собираем символы в буфер
        last_number += event.key;
    } else if (event.key === 'Enter') {
        if (last_number.trim() != '') {
            if (last_number.length <= 15) {
                number_order = convertCyrillicToLatin(last_number);
                console.log('Получен штрих код', number_order);
                allTrs = document.querySelectorAll('tr[data-testid^="posting-"]');
                if (number_order.includes('ii')) {
                    for (const tr of allTrs) {
                        if (tr.textContent.includes(number_order)) {
                            trElement = tr;
                            console.log('Найден tr по textContent');
                            break;
                        }
                    }
                } else {
                    for (const tr of allTrs) {
                        const testId = tr.getAttribute('data-testid');
                        if (testId == `posting-${number_order}`) {
                            trElement = tr;
                            console.log('Найден tr по data-testid:', testId);
                            break;
                        }
                    }
                }

            } else if (last_number == commandToRun) {
                processingReturn = true; // блокируем повторный запуск
                await return_order();
                processingReturn = false; // снимаем блокировку
                console.log("Введен штрих код для оформления возврата");
            }
            last_number = '';
        }
    }
});
