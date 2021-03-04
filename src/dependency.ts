import axios from 'axios';
import { fstat, readdirSync, existsSync } from 'fs';
import { major, gte } from 'semver';
import { workspace, window } from 'vscode';

import { GetAzureDevOpsUsername, GetDevOpsPAT, GetAzureCompanyName, GetAzureArtifactFeedID } from './settings';

const getArtifacts = async (url) => {
    axios.defaults.baseURL = `https://feeds.dev.azure.com/${GetAzureCompanyName()}/`;

    const authString = 'Basic' + Buffer.from(GetAzureDevOpsUsername() + ':' + GetDevOpsPAT()).toString('base64');

    const result = await axios.get(url, {
        headers: {
            'Authorization': authString
        }
    });

    if (result.status !== 200) {
        console.error(result.statusText);
        return null;
    }

    return result.data.value;
};

const createPackageObject = (fileName: string) => {
    const rx = /(\d+\.)(\d+\.)(\d)/g;

    let packageName = fileName;
    packageName = packageName.replace('.app', '');
    packageName = packageName.replace(/(\d+\.)(\d+\.)(\d+\.)(\d)/g, '');
    packageName = packageName.replace(/ /g, '_');
    packageName = packageName.slice(0, packageName.length - 1);

    let version = fileName;
    version = rx.exec(version)[0];

    return {
        local: {
            name: packageName,
            version: version
        },
        remote: {}
    };
};

const compareToLocalPackages = async (localPath: string) => {

    if (!existsSync(localPath)) {
        return [];
    }

    const artifacts = await getArtifacts(`_apis/packaging/feeds/${GetAzureArtifactFeedID()}/Packages?api-version=5.0-preview.1`);

    let fileNames = readdirSync(localPath);

    fileNames = fileNames.filter(file => !file.toLowerCase().includes('microsoft'));
    const packages = [];
    const outdatedPackages = [];

    for (let i = 0; i < fileNames.length; i++) {
        packages.push(createPackageObject(fileNames[i]));
    }

    artifacts.forEach(a => {
        const index = packages.findIndex(p => p.local.name === a.name);

        if (index !== -1) {
            const localMajorVersion = major(packages[index].local.version);

            a.versions.forEach(v => {
                const remoteMajorVersion = major(v.version);

                if (remoteMajorVersion === localMajorVersion) {
                    a.matchedVersion = v.version;
                    packages[index].remote = a;

                    return;
                }
            });
        }
    });

    packages.forEach(p => {
        const { local, remote } = p;

        if (!remote.hasOwnProperty('matchedVersion')) {
            return;
        }

        if (gte(remote.matchedVersion, local.version)) {
            const outdatedPackage = {
                ...local,
                newVersion: remote.matchedVersion
            };
            outdatedPackages.push(outdatedPackage);
        }
    });

    return outdatedPackages;
};

const getWorkspaceFolderNames = () => {
    const { workspaceFolders } = workspace;
    const folders = [];

    for (let i = 0; i < workspaceFolders.length; i++) {
        const path = workspaceFolders[i].uri.fsPath.split('\\');
        const folderName = path[path.length - 1];
        const packageUri = `${workspaceFolders[i].uri.fsPath}\\.alpackages`;

        folders.push({
            name: folderName,
            path: packageUri
        });
    }

    return folders;
};

const printOutdatedPackages = (folder) => {
    compareToLocalPackages(folder.path)
        .then(outdatedPackages => {

            outdatedPackages.forEach(p => {
                const message = `${folder.name}: New version for package ${p.name} is available (${p.matchedVersion})`;

                window.showInformationMessage(message);
            });
        });
};

const runCheck = () => {
    // const outdatedPackages = await compareToLocalPackages(workspace.workspaceFolders[0].uri.fsPath);

    const folders = getWorkspaceFolderNames();

    folders.forEach(f => {
        printOutdatedPackages(f);
    });
};

export { runCheck as default };