'use strict';
import * as vscode from "vscode";
import * as terminal from './terminal';
import * as path from "path";
import * as fs from "fs";
import * as guid from './guid';
import * as settings from "./settings"

import { workspace, WorkspaceEdit, ShellExecution } from 'vscode';
import { execFile } from "child_process";

export function SetupRemoteDockerFolder() 
{
    terminal.PSTerminal.show(true);
    const currentRoot = settings.GetCurrentRootPath();
    const hostPath = 'c:\\sources\\';
    const shareName = 'sources';
    const mapAs = 'S';
    terminal.SendPSText(`${settings.GetConfigCommand(true)} | Set-ALDockerHostFolder -HostPath ${hostPath} -ShareName ${shareName} -ShareMapAs ${mapAs}`);

}