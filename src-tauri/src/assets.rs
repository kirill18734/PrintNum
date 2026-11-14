use serde::Serialize;
use std::{
    fs,
    io,
    path::{Path, PathBuf},
    sync::Mutex,
    time::UNIX_EPOCH,
};
use tauri::{AppHandle, Manager, State};

const BACKGROUND_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp"];
const FONT_EXTENSIONS: &[&str] = &["ttf", "otf"];

/// Метаданные ресурса. Содержимое файла не читается и не передаётся в WebView.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetFile {
    pub id: String,
    pub name: String,
    pub path: String,
    pub extension: String,
    pub size: u64,
    pub modified_at: u128,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct AssetFingerprint {
    path: PathBuf,
    size: u64,
    modified_at: u128,
}

#[derive(Debug, Clone, PartialEq, Eq, Default)]
struct AssetSnapshot {
    backgrounds: Vec<AssetFingerprint>,
    fonts: Vec<AssetFingerprint>,
}

/// Хранит только последний снимок метаданных, без содержимого файлов.
#[derive(Default)]
pub struct AssetState {
    snapshot: Mutex<Option<AssetSnapshot>>,
}

struct AssetScan {
    backgrounds: Vec<AssetFile>,
    fonts: Vec<AssetFile>,
    snapshot: AssetSnapshot,
}

fn supported_extension(path: &Path, extensions: &[&str]) -> Option<String> {
    let extension = path.extension()?.to_str()?.to_ascii_lowercase();
    extensions
        .contains(&extension.as_str())
        .then_some(extension)
}

fn scan_directory(
    directory: &Path,
    extensions: &[&str],
) -> Result<(Vec<AssetFile>, Vec<AssetFingerprint>), String> {
    let entries = match fs::read_dir(directory) {
        Ok(entries) => entries,
        // Отсутствующая папка — нормальная ситуация: ничего не создаём.
        Err(error) if error.kind() == io::ErrorKind::NotFound => {
            return Ok((Vec::new(), Vec::new()));
        }
        Err(error) => {
            return Err(format!("Не удалось прочитать {}: {error}", directory.display()));
        }
    };

    let mut files = Vec::new();
    let mut fingerprints = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|error| {
            format!("Не удалось прочитать запись в {}: {error}", directory.display())
        })?;

        // Берём только обычные файлы непосредственно в каталоге.
        let file_type = entry.file_type().map_err(|error| {
            format!("Не удалось определить тип {}: {error}", entry.path().display())
        })?;
        if !file_type.is_file() {
            continue;
        }

        let path = entry.path();
        let Some(extension) = supported_extension(&path, extensions) else {
            continue;
        };

        let metadata = entry.metadata().map_err(|error| {
            format!("Не удалось получить метаданные {}: {error}", path.display())
        })?;
        let modified_at = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map_or(0, |duration| duration.as_nanos());

        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .to_owned();
        let name = path
            .file_stem()
            .and_then(|name| name.to_str())
            .filter(|name| !name.is_empty())
            .unwrap_or(&file_name)
            .to_owned();

        files.push(AssetFile {
            id: file_name,
            name,
            path: path.to_string_lossy().into_owned(),
            extension,
            size: metadata.len(),
            modified_at,
        });
        fingerprints.push(AssetFingerprint {
            path,
            size: metadata.len(),
            modified_at,
        });
    }

    files.sort_by(|left, right| {
        left.name
            .to_lowercase()
            .cmp(&right.name.to_lowercase())
            .then_with(|| left.id.cmp(&right.id))
    });
    fingerprints.sort_by(|left, right| left.path.cmp(&right.path));

    Ok((files, fingerprints))
}

fn scan_assets(app: &AppHandle) -> Result<AssetScan, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Не удалось определить AppData: {error}"))?;

    let (backgrounds, background_fingerprints) =
        scan_directory(&app_data.join("backgrounds"), BACKGROUND_EXTENSIONS)?;
    let (fonts, font_fingerprints) =
        scan_directory(&app_data.join("fonts"), FONT_EXTENSIONS)?;

    Ok(AssetScan {
        backgrounds,
        fonts,
        snapshot: AssetSnapshot {
            backgrounds: background_fingerprints,
            fonts: font_fingerprints,
        },
    })
}

fn update_snapshot(state: &AssetState, snapshot: AssetSnapshot) -> Result<(), String> {
    let mut current = state
        .snapshot
        .lock()
        .map_err(|_| "Не удалось получить блокировку снимка ресурсов".to_owned())?;
    *current = Some(snapshot);
    Ok(())
}

#[tauri::command]
pub fn get_backgrounds(
    app: AppHandle,
    state: State<'_, AssetState>,
) -> Result<Vec<AssetFile>, String> {
    let scan = scan_assets(&app)?;
    update_snapshot(&state, scan.snapshot)?;
    Ok(scan.backgrounds)
}

#[tauri::command]
pub fn get_fonts(
    app: AppHandle,
    state: State<'_, AssetState>,
) -> Result<Vec<AssetFile>, String> {
    let scan = scan_assets(&app)?;
    update_snapshot(&state, scan.snapshot)?;
    Ok(scan.fonts)
}

/// Сравнивает текущие метаданные с предыдущим снимком и обновляет его.
/// Первый вызов только создаёт исходный снимок и возвращает false.
#[tauri::command]
pub fn assets_changed(
    app: AppHandle,
    state: State<'_, AssetState>,
) -> Result<bool, String> {
    let scan = scan_assets(&app)?;
    let mut current = state
        .snapshot
        .lock()
        .map_err(|_| "Не удалось получить блокировку снимка ресурсов".to_owned())?;

    let changed = current
        .as_ref()
        .is_some_and(|previous| previous != &scan.snapshot);

    *current = Some(scan.snapshot);
    Ok(changed)
}
