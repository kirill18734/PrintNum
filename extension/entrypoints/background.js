(async function () {
  try {
    // Собираем актуальные имена из новой структуры констант
    const namesBanners = banners.map((item) => item.name);
    const namesAutoscripts = autoscripts.map((item) => item.name);
    const namesQrCommands = qrCodes.map((item) => item.name);

    // Проверяем флаг первого запуска
    const isInitialized = await get_local_storage("isInitialized");

    // 1. ПЕРВЫЙ ЗАПУСК: Инициализируем хранилище дефолтными значениями
    if (!isInitialized) {
      await set_local_storage("isInitialized", true);

      await set_local_storage("banners", namesBanners);
      await set_local_storage("offBanners", []); // Баннеры по умолчанию включены

      await set_local_storage("autoscripts", namesAutoscripts);
      await set_local_storage("offAutoscripts", namesAutoscripts); // По умолчанию выключены

      await set_local_storage("qrCodes", namesQrCommands);
      await set_local_storage("offQrCodes", namesQrCommands); // По умолчанию выключены
      return;
    }

    // 2. НЕ ПЕРВЫЙ ЗАПУСК: Получаем текущее состояние
    const storageBanners = await get_local_storage("banners");
    const storageOffBanners = await get_local_storage("offBanners");
    const storageAutoscripts = await get_local_storage("autoscripts");
    const storageOffAutoscripts = await get_local_storage("offAutoscripts");
    const storageQrCodes = await get_local_storage("qrCodes");
    const storageOffQrCodes = await get_local_storage("offQrCodes");

    // Хелпер для основных списков: добавляет новые элементы, удаляет исчезнувшие из констант
    const syncArray = (current, targetNames) => {
      const currentArr = Array.isArray(current) ? current : [];
      const targetSet = new Set(targetNames);

      // Удаляем то, чего больше нет в константах
      const filtered = currentArr.filter((item) => targetSet.has(item));

      // Добавляем новые элементы, которых ещё нет в хранилище
      const filteredSet = new Set(filtered);
      for (const name of targetNames) {
        if (!filteredSet.has(name)) {
          filtered.push(name);
        }
      }
      return filtered;
    };

    // Хелпер для списков отключений: удаляет старое.
    // Если autoOff = true, то абсолютно новые элементы из констант ОН ТОЖЕ выключит (добавит в off список)
    const syncOffArraySmart = (
      currentOff,
      targetNames,
      mainStorage,
      autoOff = false,
    ) => {
      const currentOffArr = Array.isArray(currentOff) ? currentOff : [];
      const mainStorageArr = Array.isArray(mainStorage) ? mainStorage : [];

      const targetSet = new Set(targetNames);
      const mainStorageSet = new Set(mainStorageArr);

      // 1. Удаляем из списка отключённых то, чего вообще больше нет в константах
      const filtered = currentOffArr.filter((item) => targetSet.has(item));
      const filteredSet = new Set(filtered);

      // 2. Если включен autoOff: ищем новые элементы, которых никогда не было в основном хранилище,
      // и принудительно добавляем их в список отключённых (чтобы они были выключены по умолчанию)
      if (autoOff) {
        for (const name of targetNames) {
          if (!mainStorageSet.has(name) && !filteredSet.has(name)) {
            filtered.push(name);
          }
        }
      }
      return filtered;
    };

    // Хелпер проверки изменений (порядок элементов не важен, важен состав)
    const isChanged = (arr1, arr2) => {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) return true;
      if (arr1.length !== arr2.length) return true;
      const set1 = new Set(arr1);
      return arr2.some((item) => !set1.has(item));
    };

    // Вычисляем новые валидные массивы основных списков
    const nextBanners = syncArray(storageBanners, namesBanners);
    const nextAutoscripts = syncArray(storageAutoscripts, namesAutoscripts);
    const nextQrCodes = syncArray(storageQrCodes, namesQrCommands);

    // Вычисляем новые массивы отключений (с умным добавлением новинок)
    // Для баннеров autoOff = false (новые баннеры будут работать сразу)
    const nextOffBanners = syncOffArraySmart(
      storageOffBanners,
      namesBanners,
      storageBanners,
      false,
    );
    // Для скриптов и QR autoOff = true (новые скрипты добавятся в off-список)
    const nextOffAutoscripts = syncOffArraySmart(
      storageOffAutoscripts,
      namesAutoscripts,
      storageAutoscripts,
      true,
    );
    const nextOffQrCodes = syncOffArraySmart(
      storageOffQrCodes,
      namesQrCommands,
      storageQrCodes,
      true,
    );

    // Записываем обновления по отдельности и только при наличии изменений
    if (isChanged(storageBanners, nextBanners)) {
      await set_local_storage("banners", nextBanners);
    }
    if (isChanged(storageOffBanners, nextOffBanners)) {
      await set_local_storage("offBanners", nextOffBanners);
    }
    if (isChanged(storageAutoscripts, nextAutoscripts)) {
      await set_local_storage("autoscripts", nextAutoscripts);
    }
    if (isChanged(storageQrCodes, nextQrCodes)) {
      await set_local_storage("qrCodes", nextQrCodes);
    }
    if (isChanged(storageOffAutoscripts, nextOffAutoscripts)) {
      await set_local_storage("offAutoscripts", nextOffAutoscripts);
    }
    if (isChanged(storageOffQrCodes, nextOffQrCodes)) {
      await set_local_storage("offQrCodes", nextOffQrCodes);
    }
  } catch (err) {
    console.error(err);
  }
})();
