use tauri::{Manager};
use tauri_plugin_shell::ShellExt;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    // проверка на существующий запущенный экземпляр приложения
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main")
                       .expect("no main window")
                       .set_focus();
        }));
    }
    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}