'use strict';
import * as vscode from "vscode";

class RemoteHost
{
    public IsRemote():Boolean
    {
        const remoteHost = vscode.workspace.getConfiguration().get('navertical.DockerHost').toString();
        return (remoteHost.toLowerCase()!=='localhost');
    }

    /**
     * RemoteHost
     */
    public RemoteHostName():string {
        const remoteHost = vscode.workspace.getConfiguration().get('navertical.DockerHost').toString();
        return remoteHost;
    }

    /**
     * RemoteSharedFolder
     */
    public RemoteSharedFolder():string {
        const remoteFolder = vscode.workspace.getConfiguration().get('navertical.DockerHostSharedFolder').toString();
        return remoteFolder;
    }
}