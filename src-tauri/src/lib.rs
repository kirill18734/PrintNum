use tauri::Manager;
use tauri_plugin_shell::ShellExt;

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
    let mut builder = tauri::Builder::default();
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
    //запуск backend
    .setup(|app| {
        let handle = app.handle().clone();
        tauri::async_runtime::spawn(async move {
        handle
            .shell()
            .command("powershell.exe")
            .args(["Stop-Process -Name backend -Force -ErrorAction SilentlyContinue; if ((Split-Path -Leaf (Get-Location)) -eq 'src-tauri') { Start-Process -FilePath '../backend/output/backend/backend.exe' -WindowStyle Hidden } else { Start-Process -FilePath './backend/backend.exe' -WindowStyle Hidden }"])
            .spawn()
            .expect("Failed to spawn scargo");

        });
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![get_version])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
