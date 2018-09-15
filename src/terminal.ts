'use strict';
import * as vscode from "vscode";
export var PSTerminal = vscode.window.createTerminal(`NaverticAl`);

export function ImportModules() {

    SendPSText(`Import-Module NVRAppDevOps -DisableNameChecking`);
    SendPSText(`Import-Module navcontainerhelper -DisableNameChecking`);

}

export function TerminalClosed(terminal: vscode.Terminal)
{
    if (terminal.name === 'NaverticAl') {
        PSTerminal = vscode.window.createTerminal(`NaverticAl`);
        ImportModules();
    }
}

export function SendPSText(text: string)
{
    //if (!PSTerminal) {
    //    PSTerminal = vscode.window.createTerminal(`NaverticAl`);
    //}
    PSTerminal.sendText(text);
}
