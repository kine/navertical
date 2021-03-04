import axios from 'axios';
import { readdirSync } from 'fs';
import { major, gte } from 'semver';
import { workspace, window } from 'vscode';

import { GetAzureDevOpsUsername, GetDevOpsPAT, GetAzureCompanyName, GetAzureArtifactFeedID } from './settings';

const getArtifacts = async(url) => {
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

const compareToLocalPackages = async(localPath: string) => {
    const artifacts = await getArtifacts(`_apis/packaging/feeds/${GetAzureArtifactFeedID()}/Packages?api-version=5.0-preview.1`);

    let fileNames = readdirSync(localPath + '/.alpackages');

    fileNames = fileNames.filter(file => !file.toLowerCase().includes('microsoft'));
    const packages = [];
    const outdatedPackages = [];

    const rx = /(\d+\.)(\d+\.)(\d)/g;
    for (let i = 0; i < fileNames.length; i++) {
        const file = fileNames[i];

        let packageName = file;
        packageName = packageName.replace('.app', '');
        packageName = packageName.replace(/(\d+\.)(\d+\.)(\d+\.)(\d)/g, '');
        packageName = packageName.replace(/ /g, '_');
        packageName = packageName.slice(0, packageName.length - 1);

        let version = file;
        version = rx.exec(version)[0];

        fileNames[i] = file;

        packages.push({
            local: {
                name: packageName,
                version: version
            },
            remote: {}
        });
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
        
        if (!remote.hasOwnProperty('versions')) {
            return;
        }

        if (gte(remote.matchedVersion, local.version)) {
            outdatedPackages.push(local);
        }
    });

    return outdatedPackages;
};

const runCheck = () => {
    // const outdatedPackages = await compareToLocalPackages(workspace.workspaceFolders[0].uri.fsPath);

    compareToLocalPackages(workspace.workspaceFolders[0].uri.fsPath)
        .then(outdatedPackages => {
            let message = 'Dependencies:\n';

            outdatedPackages.forEach(p => {
                message += `${p.name}\n`;
            });

            message += 'have update available';

            window.showErrorMessage(message);
        });

    // window.showInformationMessage('test', ...outdatedPackages);
};

export { runCheck as default };