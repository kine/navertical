'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile } from "child_process";

export async function InitNewAppFolder() {
    const newPath = await GetNewAppPath();
    const newAppName = await GetNewAppName();
    const newRepo = vscode.workspace.getConfiguration().get('navertical.NewProjectRepository').toString();
    CheckAndCreateFolder(newPath);
    var params=['clone','--dissociate',newRepo,newPath]; //,'--depth','1'
    console.log('Running git clone...');
    execFile('git',params,(error,stdout,stderr)=>{
        if (error) {
            console.error('stderr',stderr);
            throw error;
        }
        console.log('stdout',stdout)
        UpdateAppTemplate(newPath,newAppName);
        OpenNewWorkspace(newPath,newAppName);
    });
}

function OpenNewWorkspace(newPath:string,newAppName:string)
{
    var workspaceUri = vscode.Uri.file(path.join(newPath,`${newAppName}.code-workspace`));
    vscode.commands.executeCommand("vscode.openFolder",workspaceUri,false);
}

function UpdateAppTemplate(newPath: string,newAppName: string)
{
    RenameWorkspace(newPath,newAppName);
    const appGuid=UpdateMainAppJson(newPath,newAppName);
    UpdateTestAppJson(newPath,newAppName,appGuid);
}

function UpdateMainAppJson(newPath:string,newAppName:string)
{
    const newGuid = guid.createGuid();
    const appJsonPath = path.join(newPath,'MainApp\\app.json');
    var fs = require('fs');
    var appJson = JSON.parse(fs.readFileSync(appJsonPath,(error) => {console.log(`Cannot read file ${appJsonPath}`);}).toString());
    appJson.id = newGuid;
    appJson.name = newAppName;
    appJson.brief = newAppName;
    fs.writeFile(appJsonPath,JSON.stringify(appJson,null,2),(error) => {console.log(`Cannot write file ${appJsonPath}`);});
    return newGuid;
}

function UpdateTestAppJson(newPath:string,newAppName:string,appGuid:string)
{
    const newGuid = guid.createGuid();
    const appJsonPath = path.join(newPath,'\\TestApp\\app.json');
    var fs = require('fs');
    var appJson = JSON.parse(fs.readFileSync(appJsonPath,(error) => {console.log(`Cannot read file ${appJsonPath}`);}).toString());
    appJson.id = newGuid;
    appJson.name = `${newAppName}.Test`;
    appJson.brief = `${newAppName}.Test`;
    appJson.dependencies[0].appId = appGuid;
    appJson.dependencies[0].name = newAppName;
    fs.writeFile(appJsonPath,JSON.stringify(appJson,null,2),(error) => {console.log(`Cannot write file ${appJsonPath}`);});
    return newGuid;
}

function RenameWorkspace(newPath: string,newAppName: string)
{
    var fs= require('fs');
    const oldWorkspaceFile = path.join(newPath,'\\MSDyn365BC_Base.code-workspace');
    const newWorkspaceFile = path.join(newPath,`\\${newAppName}.code-workspace`);
    fs.rename(oldWorkspaceFile,newWorkspaceFile);
}

function CheckAndCreateFolder(newPath: string) {
    var fs = require('fs');
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
    }
}

async function GetNewAppPath() {
    const newPath = await vscode.window.showInputBox({
            placeHolder: '<path for new App project>',
            prompt: "Please, choose a path to a new empty folder (Press 'Enter' to confirm or 'Escape' to cancel)"
        });
    return newPath;
}

async function GetNewAppName() {
    const newAppName = await vscode.window.showInputBox({
        placeHolder: '<Name of the App>',
        prompt: "Please, enter the name of the new App (Press 'Enter' to confirm or 'Escape' to cancel)",
        value: `ALApp1`
    });
    return newAppName;
}
