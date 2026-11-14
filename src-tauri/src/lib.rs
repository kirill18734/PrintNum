use std::fs;
use std::path::Path;

use tauri::Manager;

#[tauri::command]
fn get_version(app_handle: tauri::AppHandle) -> String {
    app_handle
        .config()
        .version
        .clone()
        .unwrap_or_else(|| "".into())
}

/// Копирует только отсутствующие файлы. Существующие пользовательские ресурсы
/// не перезаписываются и не удаляются при запуске или обновлении приложения.
fn copy_missing_files(source: &Path, destination: &Path) -> std::io::Result<()> {
    if !source.exists() {
        return Ok(());
    }

    fs::create_dir_all(destination)?;

    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let source_path = entry.path();
        let destination_path = destination.join(entry.file_name());

        if source_path.is_dir() {
            copy_missing_files(&source_path, &destination_path)?;
        } else if source_path.is_file() && !destination_path.exists() {
            fs::copy(&source_path, &destination_path)?;
        }
    }

    Ok(())
}

/// Подготавливает каталоги ресурсов в AppData при каждом запуске.
/// Копирование идемпотентно: добавляются только отсутствующие файлы.
fn install_app_resources(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    let resource_dir = app.path().resource_dir()?;

    // При запуске из исходников Tauri resource_dir может ещё не содержать
    // упакованные ресурсы. В режиме разработки читаем папки проекта.
    let source_root = if resource_dir.join("fonts").exists()
        || resource_dir.join("backgrounds").exists()
    {
        resource_dir
    } else {
        Path::new(env!("CARGO_MANIFEST_DIR")).join("../resources")
    };

    copy_missing_files(&source_root.join("backgrounds"), &app_data_dir.join("backgrounds"))?;
    copy_missing_files(&source_root.join("fonts"), &app_data_dir.join("fonts"))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .level(log::LevelFilter::Trace)
                .max_file_size(10_485_760)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepOne)
                .build(),
        );

    // Проверка на существующий запущенный экземпляр приложения.
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }

    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_prevent_default::debug())
        // Обновление.
        .plugin(
            tauri_plugin_updater::Builder::new()
                .default_version_comparator(|current, update| update.version != current)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![get_version])
        .setup(|app| {
            if let Err(error) = install_app_resources(app.handle()) {
                log::error!("Не удалось подготовить ресурсы AppData: {error}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
