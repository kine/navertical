'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';
import * as settings from "./settings"

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile } from "child_process";

export function CompileTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = settings.GetCurrentRootPath();
    terminal.SendPSText(`${settings.GetConfigCommand(false)} | Download-ALSystemPackages -AlPackagesPath ${currentRoot} -UseDefaultCred $True -Password 'something'`);
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Compile-ALProjectTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot}`);

}

export function ForceDownload() {
    terminal.PSTerminal.show(true);
    const currentRoot = settings.GetCurrentRootPath();
    terminal.SendPSText(`${settings.GetConfigCommand(false)} | Download-ALSystemPackages -AlPackagesPath ${currentRoot} -UseDefaultCred $True -Password 'something' -Force`);
    //terminal.SendPSText(`${settings.GetConfigCommand(false)} | Compile-ALProjectTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot}`);
}

export function InstallTree() {

}

export function UninstallTree() {

}

export function PublishTree() {
    terminal.PSTerminal.show(true);
    var skipVerification = 'false';
    if (vscode.workspace.getConfiguration().get('navertical.IgnoreVerification')) {
        skipVerification = 'true';
    }
    const currentRoot = settings.GetCurrentRootPath();
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Publish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot}) -PackagesPath ${currentRoot} -SkipVerification ${skipVerification}`);

}

export function UnpublishTree() {
    terminal.PSTerminal.show(true);
    const currentRoot = settings.GetCurrentRootPath();
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Unpublish-ALAppTree -OrderedApps (Get-ALAppOrder -Path ${currentRoot})`);

}

export function GetConfiguration() {
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`${settings.GetConfigCommand(true)}`);

}

export function CreatePackage() {


}

export function CreateEnvironment() {
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Init-ALEnvironment`);
}

export function RemoveEnvironment() {
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Remove-ALEnvironment`);
}

export function StartEnvironment() {
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Start-ALEnvironment`);
}

export function StopEnvironment() {
    terminal.PSTerminal.show(true);
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Stop-ALEnvironment`);
}

