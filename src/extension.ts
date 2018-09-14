'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as terminal from './terminal';
import * as actions from './actions';
import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    terminal.ImportModules();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "NaverticAl" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let commandList = [
        vscode.commands.registerCommand('navertical.InstallModules',()=>{actions.InstallModules()}),
        vscode.commands.registerCommand('navertical.CreateEnvironment',()=>{actions.CreateEnvironment()}),
        vscode.commands.registerCommand('navertical.RemoveEnvironment',()=>{actions.RemoveEnvironment()}),
        vscode.commands.registerCommand('navertical.CompileTree',()=>{actions.CompileTree()}),
        vscode.commands.registerCommand('navertical.InstallTree',()=>{actions.InstallTree()}),
        vscode.commands.registerCommand('navertical.UninstallTree',()=>{actions.UninstallTree()}),
        vscode.commands.registerCommand('navertical.PublishTree',()=>{actions.PublishTree()}),
        vscode.commands.registerCommand('navertical.UnpublishTree',()=>{actions.UnpublishTree()}),
        vscode.commands.registerCommand('navertical.CreatePackage',()=>{actions.CreatePackage()})
    ];

    context.subscriptions.concat(commandList);
}

// this method is called when your extension is deactivated
export function deactivate() {
}