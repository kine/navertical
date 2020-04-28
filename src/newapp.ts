'use strict';
import * as vscode from "vscode";
import Uri from 'vscode-uri'
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';
import 'pure-uuid';
import * as os from 'os';
import * as fse from 'fs-extra';

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile, execFileSync, spawnSync } from "child_process";
import { Stream } from "stream";
import { homedir } from "os";
import { format } from "util";
import UUID from "pure-uuid";

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

    const selectedBranch = await SelectBranch(templateRepo);
    if (!selectedBranch) {
        console.error('No branch selected');
        return;
    }

    console.log('InitNewAppFolder:Running git clone');
    console.log('Running git clone...');
    ExecGitCommand(['clone', '--dissociate' , '-b', selectedBranch, '--single-branch', templateRepo, newPath]);
    UpdateAppTemplate(newPath,newAppName);
    const ReInitRepoEnabled = vscode.workspace.getConfiguration().get('navertical.ReInitRepo');
    try {
        if (ReInitRepoEnabled) {
            ReInitRepo(newPath, newRepoName);
        } else {
            RenameRepo(newPath, newRepoName)
        }
        AddRemote(newPath, newRepoName, selectedBranch);
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

function ReInitRepo(newPath: string, newRepoName: string) {
    console.log('Re-Init Repo:')
    ClearGit(newPath);
    ExecGitCommand(['init'], newPath);
    ExecGitCommand(['add', '--all'], newPath);
    ExecGitCommand(['commit', '-m', '"Initial commit"'], newPath)
}

function ClearGit(newPath: string) {
    var gitPath = path.join(newPath, '\\.git\\');
    console.log(`Trying to remove the git folder : ${gitPath}`)
    try {
        fse.removeSync(gitPath);
        console.log(`Folder ${gitPath} deleted`);
    } catch (err) {
        console.error(err);
    }
}

function DisconnectBranch(newPath: string) {
    console.log('DisconnectBranch:Running git branch --unset-upstream');
    ExecGitCommand(['branch','--unset-upstream'],newPath);
}

function ReconnectBranch(newPath: string)
{
    console.log('ReconnectBranch:Running git push -u origin');
    //ExecGitCommand(['branch','--set-upstream-to','origin'],newPath);
    ExecGitCommand(['push','--set-upstream','origin','master'],newPath);
}

function CheckoutAsMaster(newPath: string)
{
    console.log('CheckoutAsMaster:Running git checkout -b master');
    //ExecGitCommand(['branch','--set-upstream-to','origin'],newPath);
    ExecGitCommand(['checkout','-b','master'],newPath);
}

function AddRemote(newPath: string,newRepoName: string, selectedBranch: string)
{
    if (newRepoName) {
        console.log('AddRemote:Running git add');
        ExecGitCommand(['remote','add','origin',newRepoName],newPath);
        if (selectedBranch === 'master') {
            DisconnectBranch(newPath);
        } else {
            CheckoutAsMaster(newPath);
        }
        ReconnectBranch(newPath);
    } else {
        if (selectedBranch === 'master') {
            DisconnectBranch(newPath);
        } else {
            CheckoutAsMaster(newPath);
        }
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
    var semver = require('semver');
    var appJson = JSON.parse(fs.readFileSync(appJsonPath,(error) => {console.log(`Cannot read file ${appJsonPath}`);}).toString());
    appJson.id = newGuid;
    appJson.name = `${newAppName}.Test`;
    appJson.brief = `${newAppName}.Test`;
    if (appJson.runtime && semver.gte(semver.coerce(appJson.runtime), semver.coerce('4.1')))  {
        appJson.dependencies[0].id = appGuid;
    } else {
        appJson.dependencies[0].appId = appGuid;
    }
    appJson.dependencies[0].name = newAppName;
    fs.writeFileSync(appJsonPath,JSON.stringify(appJson,null,2),(error) => {console.log(`Cannot write file ${appJsonPath}`);});
    return newGuid;
}

function RenameWorkspace(newPath: string,newAppName: string)
{
    var fs= require('fs');
    //const oldWorkspaceFile = path.join(newPath,'\\MSDyn365BC_Base.code-workspace');
    const oldWorkspaceFile = FindFile(newPath,'.code-workspace');
    const newWorkspaceFile = path.join(newPath,`\\${newAppName}.code-workspace`);
    fs.renameSync(oldWorkspaceFile,newWorkspaceFile);
}

function FindFile(inPath: string, extension: string)
{
    var files=fs.readdirSync(inPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(inPath,files[i]);
        if (filename.indexOf(extension)>=0) {
            return filename;
        };
    };
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

async function GetBranches(path: string) {
    const folderPath = await CreateTempFolder();
    const BRANCH_PREFIX = 'NVRTEMPLATE';

    ExecGitCommand(['init'], folderPath);
    ExecGitCommand(['remote', 'add', BRANCH_PREFIX, path], folderPath);
    ExecGitCommand(['fetch', '--depth=1', BRANCH_PREFIX], folderPath); 
    
    let branches = ExecGitCommand(['branch', '-r', '--list', `${BRANCH_PREFIX}/*`], folderPath)
        .stdout
        .toString()
        .split('\n'); // listing branches

    ExecGitCommand(['remote', 'rm', BRANCH_PREFIX], folderPath); // removing remote

    branches = branches.filter(branch => branch.length > 0);

    for (let i = 0; i < branches.length; i++) {
        branches[i] = branches[i].replace(`${BRANCH_PREFIX}/`, '').trim();
    }

    RemoveTempFolder(folderPath).then(() => console.log('Branches listed'));

    return branches;
}

async function SelectBranch(path: string) {
    const branches = await GetBranches(path);

    if (branches.length === 1) {
        return branches[0];
    }

    const result = await vscode.window.showQuickPick(branches, {
        placeHolder: 'Choose Branch',
        ignoreFocusOut: true,
        onDidSelectItem: item => item
    });

    if (!result) {
        return null;
    }
    return result;
}

async function CreateTempFolder() {
    const id = new UUID(4).format();
    const directory = path.join(os.tmpdir(), `Navertica\\NaverticAL\\${id}`);
    
    await fse.mkdirs(directory).then(() => {
        console.log(`Created directory: ${directory}`);
    });

    return directory;
}

async function RemoveTempFolder(path: string) {
    await fse.remove(path).then(() => {
        console.log(`Folder ${path} deleted`);
    }).catch(err => {
        console.error(err);
    });
}