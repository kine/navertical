'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile } from "child_process";

function GetCurrentRootPath():string
{
    if (vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath+'\\..';
    }
    if (vscode.window.activeTextEditor===undefined) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath+'\\..';
    }
    const fileUri = vscode.window.activeTextEditor.document.uri;
    const workspace = vscode.workspace.getWorkspaceFolder(fileUri);
    console.log(`Navertical: current workspace folder is: ${workspace.uri.fsPath}`);
    return workspace.uri.fsPath+'\\..';
}

export function CompileTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Download-ALSystemPackages -AlPackagesPath ${currentRoot} -UseDefaultCred $True -Password 'something'`);
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Compile-ALProjectTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot}`);

}

export function InstallTree() {

}

export function UninstallTree() {

}

export function PublishTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();
    var skipVerification = 'false';
    if (vscode.workspace.getConfiguration().get('navertical.IgnoreVerification')) {
        skipVerification = 'true';
    }
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Publish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot} -SkipVerification ${skipVerification}`);

}

export function UnpublishTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();

    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Unpublish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot})`);

}

export function GetConfiguration() {
    terminal.PSTerminal.show(true);
    const currentRoot = GetCurrentRootPath();

    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot}`);

}

export function CreatePackage() {


}

export function CreateEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Init-ALEnvironment`);

}

export function RemoveEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Remove-ALEnvironment`);

}
export function StartEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Start-ALEnvironment`);

}

export function StopEnvironment() {
    const currentRoot = GetCurrentRootPath();
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`Read-ALConfiguration -Path ${currentRoot} | Stop-ALEnvironment`);

}

