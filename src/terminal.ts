'use strict';
import * as vscode from "vscode";

export var PSTerminal = vscode.window.createTerminal(`NaverticAl`,`C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`);

export function ImportModules() {
    InstallModules();
    SendPSText(`Import-Module navcontainerhelper -DisableNameChecking`);
    SendPSText(`Import-Module NVRAppDevOps -DisableNameChecking`);
    SendPSText(`cls`);

}
export function InstallModules() {
    SendPSText(`if (-not (Get-Module -ListAvailable -Name navcontainerhelper)) {  write-host "Installing module";install-module -Name navcontainerhelper -Scope CurrentUser -Force -SkipPublisherCheck}`); // else {write-host "Updating module"; update-module -Name navcontainerhelper}
    SendPSText(`if (-not (Get-Module -ListAvailable -Name NVRAppDevOps)) { write-host "Installing module"; install-module -Name NVRAppDevOps -Scope CurrentUser -Force -SkipPublisherCheck}`); // else {write-host "Updating module"; update-module -Name NVRAppDevOps}
}

export function UpdateModules() {
    //SendPSText(`update-module -Name navcontainerhelper -Force`);
    SendPSText(`update-module -Name NVRAppDevOps -Force`);
}

export function TerminalClosed(terminal: vscode.Terminal)
{
    if (terminal.name === 'NaverticAl') {
        let optionRestart = <vscode.MessageItem> {
            title: "Restart"
        };
        let optionCancel = <vscode.MessageItem> {
            title: "Close"
        };
    
        vscode.window.showWarningMessage('NaverticAl terminal was closed.',optionRestart,optionCancel).then(
            option => {
                if (option===optionRestart) {
                    PSTerminal = vscode.window.createTerminal(`NaverticAl`);
                    ImportModules();
                }
            }
        )
    }
}

export function SendPSText(text: string)
{
    //if () {
    //    PSTerminal = vscode.window.createTerminal(`NaverticAl`);
    //}
    console.log(`NaverticAL PS: ${text}`);
    PSTerminal.sendText(text);
}
