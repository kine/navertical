'use strict';
import * as vscode from "vscode";
export const PSTerminal = vscode.window.createTerminal(`NaverticAl`);

export function ImportModules() {

    PSTerminal.sendText(`Import-Module NVRAppDevOps -DisableNameChecking`);
    PSTerminal.sendText(`Import-Module navcontainerhelper -DisableNameChecking`);

}

