# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for Solvi desktop (windowed, no console)."""

from pathlib import Path

from PyInstaller.utils.hooks import collect_all, collect_dynamic_libs

block_cipher = None
project_root = Path(SPECPATH).resolve()

webview_datas, webview_binaries, webview_hiddenimports = collect_all("webview")
pythonnet_datas, pythonnet_binaries, pythonnet_hiddenimports = collect_all("pythonnet")
clr_datas, clr_binaries, clr_hiddenimports = collect_all("clr_loader")
psycopg2_binaries = collect_dynamic_libs("psycopg2")

datas = [
    (str(project_root / "frontend" / "dist"), "frontend/dist"),
    (str(project_root / "build" / "windows" / "icon.ico"), "build/windows"),
]
datas += webview_datas + pythonnet_datas + clr_datas

binaries = (
    webview_binaries
    + pythonnet_binaries
    + clr_binaries
    + psycopg2_binaries
)

hiddenimports = list(
    dict.fromkeys(
        [
            "webview",
            "webview.platforms.winforms",
            "webview.platforms.edgechromium",
            "clr",
            "pythonnet",
            "bottle",
            "proxy_tools",
            "psycopg2",
            "dotenv",
            "internal",
            "internal.api",
            "internal.config",
            "internal.database",
            "internal.database.db",
            "internal.utils",
            "internal.utils.paths",
            "internal.utils.server",
            "internal.utils.system",
            "app",
        ]
        + webview_hiddenimports
        + pythonnet_hiddenimports
        + clr_hiddenimports
    )
)

a = Analysis(
    [str(project_root / "main.py")],
    pathex=[str(project_root)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="Solvi",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # no terminal window behind the app
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(project_root / "build" / "windows" / "icon.ico"),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="Solvi",
)
