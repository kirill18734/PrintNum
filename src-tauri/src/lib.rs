use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

use tauri::Manager;

#[tauri::command]
fn get_version(app_handle: tauri::AppHandle) -> String {
    app_handle
        .config()
        .version
        .clone()
        .unwrap_or_else(|| "".into())
}

/// Возвращает каталог встроенных ресурсов приложения.
fn resource_source_root(app: &tauri::AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let resource_dir = app.path().resource_dir()?;
    let source_root = if resource_dir.join("fonts").exists()
        || resource_dir.join("backgrounds").exists()
    {
        resource_dir
    } else {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../resources")
    };

    Ok(source_root)
}

/// Читает список удалённых встроенных ресурсов из config.json Tauri Store.
fn load_deleted_resources(app_config_dir: &Path) -> HashSet<String> {
    let config_path = app_config_dir.join("config.json");
    let Ok(content) = fs::read_to_string(config_path) else {
        return HashSet::new();
    };

    let Ok(config) = serde_json::from_str::<serde_json::Value>(&content) else {
        return HashSet::new();
    };

    config
        .get("deletedResources")
        .and_then(serde_json::Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(serde_json::Value::as_str)
        .map(str::to_owned)
        .collect()
}

/// Копирует только отсутствующие файлы и пропускает удалённые встроенные ресурсы.
fn copy_missing_files(
    source: &Path,
    destination: &Path,
    relative_root: &str,
    deleted: &HashSet<String>,
) -> std::io::Result<()> {
    if !source.exists() {
        return Ok(());
    }

    fs::create_dir_all(destination)?;

    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let source_path = entry.path();
        let destination_path = destination.join(entry.file_name());
        let relative_path = format!("{}/{}", relative_root, entry.file_name().to_string_lossy());

        if deleted.contains(&relative_path.replace('\\', "/")) {
            continue;
        }

        if source_path.is_dir() {
            copy_missing_files(&source_path, &destination_path, &relative_path, deleted)?;
        } else if source_path.is_file() && !destination_path.exists() {
            fs::copy(&source_path, &destination_path)?;
        }
    }

    Ok(())
}

/// Проверяет, входит ли файл в комплект встроенных ресурсов приложения.
#[tauri::command]
fn is_builtin_resource(app: tauri::AppHandle, kind: String, file_name: String) -> bool {
    let directory = match kind.as_str() {
        "font" => "fonts",
        "background" => "backgrounds",
        _ => return false,
    };

    if file_name.is_empty()
        || file_name == "."
        || file_name == ".."
        || file_name.contains('/')
        || file_name.contains('\\')
    {
        return false;
    }

    resource_source_root(&app)
        .map(|root| root.join(directory).join(file_name).is_file())
        .unwrap_or(false)
}

/// Подготавливает каталоги ресурсов в AppData при каждом запуске.
fn install_app_resources(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    let app_config_dir = app.path().app_config_dir()?;
    let source_root = resource_source_root(app)?;
    let deleted = load_deleted_resources(&app_config_dir);

    copy_missing_files(
        &source_root.join("backgrounds"),
        &app_data_dir.join("backgrounds"),
        "backgrounds",
        &deleted,
    )?;
    copy_missing_files(
        &source_root.join("fonts"),
        &app_data_dir.join("fonts"),
        "fonts",
        &deleted,
    )?;

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
        .plugin(
            tauri_plugin_updater::Builder::new()
                .default_version_comparator(|current, update| update.version != current)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![get_version, is_builtin_resource])
        .setup(|app| {
            if let Err(error) = install_app_resources(app.handle()) {
                log::error!("Не удалось подготовить ресурсы AppData: {error}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
