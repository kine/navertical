'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';

function GetCurrentRootPath():string
{
    if (vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    const fileUri = vscode.window.activeTextEditor.document.uri;
    const workspace = vscode.workspace.getWorkspaceFolder(fileUri);
    console.log(`Navertical: current workspace folder is: ${workspace.uri.fsPath}`);
    return workspace.uri.fsPath+'\\..';
}

export function InstallModules() {

    terminal.PSTerminal.sendText(`install-module -Name NVRAppDevOps -Scope CurrentUser -Force -SkipPublisherCheck`);
    terminal.PSTerminal.sendText(`install-module -Name navcontainerhelper -Scope CurrentUser -Force -SkipPublisherCheck`);

}

export function CompileTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Download-ALSystemPackages -AlPackagesPath ${currentRoot}`);
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Compile-ALProjectTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot}`);

}

export function InstallTree() {

}

export function UninstallTree() {

}

export function PublishTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();
    var skipVerification = 'false';
    if (vscode.workspace.getConfiguration('navertical.IgnoreVerification')) {
        skipVerification = 'true';
    }
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Publish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot} -SkipVerification ${skipVerification}`);

}

export function UnpublishTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();

    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Unpublish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot})`);

}

export function CreatePackage() {


}

export function CreateEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Init-ALEnvironment`);

}

export function RemoveEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Remove-ALEnvironment`);

}
export function StartEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Start-ALEnvironment`);

}

export function StopEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.PSTerminal.sendText(`Read-ALConfiguration -Path ${currentRoot} | Stop-ALEnvironment`);

}


