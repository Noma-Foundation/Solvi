import sys
from typing import List


def _enum_screens_win32() -> List:
    """Return one WebviewScreen per monitor, with DPI-correct scale."""
    import ctypes
    from ctypes import wintypes

    from webview.screen import Screen as WebviewScreen

    user32 = ctypes.WinDLL("user32", use_last_error=True)
    shcore = ctypes.WinDLL("shcore", use_last_error=True)

    class MONITORINFOEXW(ctypes.Structure):
        _fields_ = [
            ("cbSize", wintypes.DWORD),
            ("rcMonitor", wintypes.RECT),
            ("rcWork", wintypes.RECT),
            ("dwFlags", wintypes.DWORD),
            ("szDevice", ctypes.c_wchar * 32),
        ]

    Callback = ctypes.WINFUNCTYPE(
        ctypes.c_bool, wintypes.HMONITOR, wintypes.HDC,
        ctypes.POINTER(wintypes.RECT), wintypes.LPARAM,
    )

    screens: List[WebviewScreen] = []
    handles = []

    def _collect(hmonitor, _hdc, _lprect, _lparam):
        info = MONITORINFOEXW()
        info.cbSize = ctypes.sizeof(MONITORINFOEXW)
        if user32.GetMonitorInfoW(hmonitor, ctypes.byref(info)):
            rect = info.rcMonitor
            screens.append(WebviewScreen(
                x=rect.left, y=rect.top,
                width=rect.right - rect.left,
                height=rect.bottom - rect.top,
                frame=info.rcWork,
                scale=1.0,
            ))
            handles.append(hmonitor)
        return True

    user32.EnumDisplayMonitors(None, None, Callback(_collect), 0)

    for screen, hmonitor in zip(screens, handles):
        dpi_x, dpi_y = wintypes.UINT(0), wintypes.UINT(0)
        if shcore.GetDpiForMonitor(hmonitor, 0, ctypes.byref(dpi_x), ctypes.byref(dpi_y)):
            screen.scale = (dpi_x.value or 96) / 96.0

    return screens


def patch_get_screens() -> None:
    if sys.platform != "win32":
        return
    import webview.platforms.winforms as _winforms
    _winforms.get_screens = _enum_screens_win32
