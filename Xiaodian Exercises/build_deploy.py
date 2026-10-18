"""Build the drag-and-drop static deployment folder and zip archive."""
from __future__ import annotations

import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEPLOY = ROOT / "deploy"
ZIP_PATH = ROOT / "小点刷题-部署包.zip"

FILES = [
    "index.html",
    "styles.css",
    "manifest.webmanifest",
    "sw.js",
    "js/app.js",
    "js/xlsx-reader.js",
    "assets/favicon.svg",
    "assets/question-bank-template.xlsx",
    "assets/icons/app-icon.svg",
    "assets/icons/apple-touch-icon-180.png",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png",
    "assets/icons/icon-maskable-512.png",
]


def main() -> None:
    missing = [name for name in FILES if not (ROOT / name).is_file()]
    if missing:
        raise SystemExit("缺少部署文件：" + "、".join(missing))

    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    for item in manifest.get("icons", []):
        icon_path = ROOT / item["src"]
        if not icon_path.is_file():
            raise SystemExit(f"manifest 引用的图标不存在：{item['src']}")

    if DEPLOY.exists():
        shutil.rmtree(DEPLOY)
    DEPLOY.mkdir(parents=True)

    for name in FILES:
        source = ROOT / name
        target = DEPLOY / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    # Avoid Jekyll processing if this folder is published with GitHub Pages.
    (DEPLOY / ".nojekyll").write_bytes(b"")

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()

    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(DEPLOY.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(DEPLOY).as_posix())

    file_count = sum(1 for path in DEPLOY.rglob("*") if path.is_file())
    print(f"部署目录：{DEPLOY}")
    print(f"部署压缩包：{ZIP_PATH}")
    print(f"共 {file_count} 个文件，{ZIP_PATH.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
