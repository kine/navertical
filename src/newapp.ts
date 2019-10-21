'use strict';
import * as vscode from "vscode";
import Uri from 'vscode-uri'
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile, execFileSync, spawnSync } from "child_process";
import { Stream } from "stream";
import { homedir } from "os";

function ExecGitCommand(params:string[],newPath:string='')
{
    if (!newPath) {
        newPath = process.env['HOMEPATH'];
    }
    var result = spawnSync('git.exe',params,{cwd:newPath,env:process.env});//,{stdio:['ignore',outstr,errstr]}
    if (result.error) {
       console.error('Error:',result.stderr);
       vscode.window.showErrorMessage(`Error when running git ${params[0]}: ${result.error.message}. \nMay be git was not found? (if  spawn git ENOENT)`);
       throw result.error;
    }
    console.log(`${result.stdout.toString()}`);
    console.log(`${result.stderr.toString()}`);
    return result;
}

export async function InitNewAppFolder() {
    console.log('InitNewAppFolder:Start');
    console.log('InitNewAppFolder:GettingPath');
    const newPath = await GetNewAppPath();
    if (!newPath) {
        console.warn('No path entered');
        return;
    }
    CheckIfEmpty(newPath);
    const newAppName = await GetNewAppName(newPath);
    if (!newAppName) {
        console.warn('No app name entered');
        return;
    }
    const newRepoName = await GetNewRepoName();
    console.log('InitNewAppFolder:GettingConfiguration');
    const templateRepo = vscode.workspace.getConfiguration().get('navertical.NewProjectRepository').toString();
    console.log('InitNewAppFolder:CreatingFolder');
    CheckAndCreateFolder(newPath);

    const selectedBranch = await SelectBranch(templateRepo).then(result => result);

    console.log('InitNewAppFolder:Running git clone');
    console.log('Running git clone...');
    ExecGitCommand(['clone', '-b', selectedBranch, '--single-branch', templateRepo,newPath]);
    UpdateAppTemplate(newPath,newAppName);
    try {
        RenameRepo(newPath,newRepoName)
        AddRemote(newPath,newRepoName);
    } catch {

    }
    OpenNewWorkspace(newPath,newAppName);
    //});
}

function CheckIfEmpty(newPath:string) 
{
    var content = fs.readdirSync(newPath);
    if (content.length) {
        vscode.window.showErrorMessage(`Folder ${newPath} is not empty!`);
        throw new Error('Fodler not empty');
    }
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

function RenameRepo(newPath: string,newRepoName: string)
{
    console.log('ReconnectRepo:Running git rename');
    ExecGitCommand(['remote','rename','origin','template'],newPath);
}

function DisconnectBranch(newPath: string)
{
    console.log('DisconnectBranch:Running git branch --unset-upstream');
    ExecGitCommand(['branch','--unset-upstream'],newPath);
}

function ReconnectBranch(newPath: string)
{
    console.log('ReconnectBranch:Running git push -u origin');
    //ExecGitCommand(['branch','--set-upstream-to','origin'],newPath);
    ExecGitCommand(['push','--set-upstream','origin','master'],newPath);
}

function AddRemote(newPath: string,newRepoName: string)
{
    if (newRepoName) {
        console.log('AddRemote:Running git add');
        ExecGitCommand(['remote','add','origin',newRepoName],newPath);
        DisconnectBranch(newPath);
        ReconnectBranch(newPath);
    } else {
        DisconnectBranch(newPath);
    }
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
    fs.writeFileSync(appJsonPath,JSON.stringify(appJson,null,2),(error) => {console.log(`Cannot write file ${appJsonPath}`);});
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
    fs.writeFileSync(appJsonPath,JSON.stringify(appJson,null,2),(error) => {console.log(`Cannot write file ${appJsonPath}`);});
    return newGuid;
}

function RenameWorkspace(newPath: string,newAppName: string)
{
    var fs= require('fs');
    const oldWorkspaceFile = path.join(newPath,'\\MSDyn365BC_Base.code-workspace');
    const newWorkspaceFile = path.join(newPath,`\\${newAppName}.code-workspace`);
    fs.renameSync(oldWorkspaceFile,newWorkspaceFile);
}

function CheckAndCreateFolder(newPath: string) {
    var fs = require('fs');
    console.log('CheckAndCreateFolder:Checking path {0}',newPath);
    if (!fs.existsSync(newPath)) {
        console.log('CheckAndCreateFolder:Creating path {0}',newPath);
        fs.mkdirSync(newPath);
    }
}

async function GetNewAppPath() {
    const uri = vscode.Uri.file(process.env['USERPROFILE']);
    const options: vscode.OpenDialogOptions = {
        openLabel: `Select folder`,
        canSelectFolders: true,
        canSelectFiles: false,
        defaultUri: uri,
        canSelectMany: false,
        filters: {
           'All files': ['*']
       }
    };
    const newPath = await vscode.window.showOpenDialog(options);
    return newPath[0].fsPath;
}

async function GetNewAppName(newPath:string) {
    const suggestedName = path.basename(newPath);
    const newAppName = await vscode.window.showInputBox({
        placeHolder: '<Name of the App>',
        prompt: "Please, enter the name of the new App (Press 'Enter' to confirm or 'Escape' to cancel)",
        value: suggestedName,
        ignoreFocusOut: true
    });
    return newAppName;
}

async function GetNewRepoName() {
    const newRepoName = await vscode.window.showInputBox({
        placeHolder: '<https:///dev.azure.com/account/project/_git/repo>',
        prompt: "Please, enter URL of your target GIT repository (ESC or empty to skip)",
        ignoreFocusOut: true
    });
    return newRepoName;
}

function GetBranches(path: string) {
    const branchPrefix = 'NVRTEMPLATE';
    spawnSync('git', ['remote', 'add', branchPrefix, path], { env:process.env }); // addind remote
    spawnSync('git', ['fetch', branchPrefix], { env:process.env });
    
    let branches = spawnSync('git', ['branch', '-r', '-l', `${branchPrefix}/*`], { env:process.env })
        .stdout
        .toString()
        .split('\n'); // listing branches

    spawnSync('git', ['remote', 'rm', branchPrefix]); // removing remote
   
    branches = branches.filter(branch => branch.length > 0);

    for (let i = 0; i < branches.length; i++) {
        branches[i] = branches[i].replace(`${branchPrefix}/`, '').trim();
    }

    return branches;
}

async function SelectBranch(path: string) {
    const branches = GetBranches(path);
    const result = await vscode.window.showQuickPick(branches, {
        placeHolder: 'Choose Branch',
        onDidSelectItem: item => item
    });

    if (!result) {
        return branches[0];
    }
    return result;
}