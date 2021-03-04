'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile } from "child_process";

export function GetCurrentRootPath():string
{
    if (vscode.workspace.workspaceFolders.length === 1) {
        return '"'+vscode.workspace.workspaceFolders[0].uri.fsPath+'\\.."';
    }
    if (vscode.window.activeTextEditor===undefined) {
        return '"'+vscode.workspace.workspaceFolders[0].uri.fsPath+'\\.."';
    }
    const fileUri = vscode.window.activeTextEditor.document.uri;
    const workspace = vscode.workspace.getWorkspaceFolder(fileUri);
    console.log(`Navertical: current workspace folder is: ${workspace.uri.fsPath}`);
    return '"'+workspace.uri.fsPath+'\\.."';
}

export function IsRemoteDocker():boolean
{
    //const remoteHost = vscode.workspace.getConfiguration().get('navertical.DockerHost').toString();
    //return (remoteHost.toLowerCase()!=='localhost');
    return false;
}

export function GetRemoteDockerName():string
{
    //const remoteHost = vscode.workspace.getConfiguration().get('navertical.DockerHost').toString();
    //return remoteHost;
    return '';
}

export function GetRemoteDockerSSL():boolean
{
    //const remoteHostSSL = <boolean>vscode.workspace.getConfiguration().get('navertical.DockerHostUseSSL');
    //return remoteHostSSL;
    return false;
}

export function GetRemoteMapping():string
{
    const remoteHostMapping = vscode.workspace.getConfiguration().get('navertical.DockerHostFolderMap').toString();
    return remoteHostMapping;
}

export function GetJSONConfigPath():string
{
    const JSONConfig = vscode.workspace.getConfiguration().get('navertical.JSONConfigFile').toString();
    return JSONConfig;
}

export function GetJSONConfigProfile():string
{
    const JSONConfigProfile = vscode.workspace.getConfiguration().get('navertical.JSONConfigProfile').toString();
    return JSONConfigProfile;
}

export function GetConfigCommand(remote:boolean):string
{
    const currentRoot = GetCurrentRootPath();
    if (!remote || !IsRemoteDocker()) {
        return `Read-ALConfiguration -Path ${currentRoot} -SettingsFileName '${GetJSONConfigPath()}' -Profile '${GetJSONConfigProfile()}'`
    } else {
        return `Read-ALConfiguration -Path ${currentRoot} -SettingsFileName '${GetJSONConfigPath()}' -Profile '${GetJSONConfigProfile()}' -DockerHost ${GetRemoteDockerName()} -DockerHostSSL $${GetRemoteDockerSSL()} -PathMapString '${GetRemoteMapping()}'`
    }
}

export function GetAzureDevOpsUsername(): string {
    return vscode.workspace.getConfiguration().get('navertical.AzureDevOpsUsername').toString();
}

export function GetDevOpsPAT(): string {
    return vscode.workspace.getConfiguration().get('navertical.AzureDevOpsPAT').toString();
}

export function GetAzureCompanyName(): string {
    return vscode.workspace.getConfiguration().get('navertical.AzureCompanyName').toString();
}

export function GetAzureArtifactFeedID(): string {
    return vscode.workspace.getConfiguration().get('navertical.AzureArtifactFeedID').toString();
}