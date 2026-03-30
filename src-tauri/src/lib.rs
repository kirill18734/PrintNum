use tauri::Manager;

#[tauri::command]
fn get_version(app_handle: tauri::AppHandle) -> String {
    app_handle
        .config()
        .version
        .clone()
        .unwrap_or_else(|| "".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().plugin(
        tauri_plugin_log::Builder::new()      
            .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
            .level(log::LevelFilter::Trace)
            .max_file_size(10_485_760)
            .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepOne)
            .build(),
    );
    // проверка на существующий запущенный экземпляр приложения
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
    // обновление
    .plugin(tauri_plugin_updater::Builder::new()
    .default_version_comparator(|current, update| {
    update.version != current
    }).build())
    .invoke_handler(tauri::generate_handler![get_version])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}