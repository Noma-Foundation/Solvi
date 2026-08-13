Unicode True

!define APP_NAME "Solvi"
!define APP_VERSION "2.1.4"
!define APP_EXE "Solvi.exe"
!define INSTALL_DIR "$PROGRAMFILES\${APP_NAME}"

Name "${APP_NAME}"
Caption "${APP_NAME} - Instalação"
OutFile "Solvi-Setup-${APP_VERSION}.exe"
InstallDir "${INSTALL_DIR}"
InstallDirRegKey HKLM "Software\${APP_NAME}" "InstallDir"
RequestExecutionLevel admin

Icon "assets\solvi.ico"
UninstallIcon "assets\solvi.ico"

VIProductVersion "${APP_VERSION}.0"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "${APP_VERSION}"
VIAddVersionKey "CompanyName" "Solvi Software"
VIAddVersionKey "FileDescription" "${APP_NAME}"
VIAddVersionKey "LegalCopyright" "Solvi Software"

Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

Section "Install"

    SetOutPath "$INSTDIR"

    File "${APP_EXE}"

    SetOutPath "$INSTDIR\assets"
    File /r "assets\*"

    CreateDirectory "$INSTDIR\data"

    WriteUninstaller "$INSTDIR\Uninstall.exe"

    WriteRegStr HKLM "Software\${APP_NAME}" "InstallDir" "$INSTDIR"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
        "DisplayName" "${APP_NAME}"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
        "DisplayVersion" "${APP_VERSION}"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
        "Publisher" "Solvi Software"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
        "InstallLocation" "$INSTDIR"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
        "UninstallString" "$INSTDIR\Uninstall.exe"

    CreateDirectory "$SMPROGRAMS\${APP_NAME}"

    CreateShortcut \
        "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" \
        "$INSTDIR\${APP_EXE}" \
        "" \
        "$INSTDIR\${APP_EXE}" \
        0

    CreateShortcut \
        "$DESKTOP\${APP_NAME}.lnk" \
        "$INSTDIR\${APP_EXE}" \
        "" \
        "$INSTDIR\${APP_EXE}" \
        0

SectionEnd

Section "Uninstall"

    Delete "$DESKTOP\${APP_NAME}.lnk"

    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"

    RMDir "$SMPROGRAMS\${APP_NAME}"

    Delete "$INSTDIR\${APP_EXE}"
    Delete "$INSTDIR\Uninstall.exe"

    RMDir /r "$INSTDIR\assets"

    ; Não remove os dados do usuário.
    ; O app-data.json permanece após a desinstalação.

    RMDir "$INSTDIR\data"
    RMDir "$INSTDIR"

    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
    DeleteRegKey HKLM "Software\${APP_NAME}"

SectionEnd