# NaverticAl

NaverticAl is extension for every Microsoft Dynamics 365 Busines Central developer.

## Features

* Create new AL App folder from template by using "Navertical:Go!" command.
* Create/Remove docker environment
* Compile AL App with dependencies
* Install AL Apps with dependencies
* Uninstall AL Apps with dependencies

## How to use

1. Create new AL App folder by using `navertical:Go!`
    This command will:
    * Clone template repository without history (only last commit)
    * Update the app.json with new id and app name (including dependency of TestApp)
    * Rename Workspace file based on App name
    * Open the Workspace
2. Create Docker environment by using `navertical:Create environment`
    This command will:
    * Create new docker container with name and image based on the settings in Settings.ps1
    * Make alc.exe compiler available from outside the container to allow compilation of the apps (may be will be changed later to compile inside container)
    * Import Test objects in the container to allow run App Tests
3. Add dependency Apps into Dependencies folder as GIT Submodules (preffered) or directly
4. Compile the Apps with `navertical:Compile App Tree`
    This command will:
    * Download system application app packages
    * Download App packages for dependencies when source code is not found in the App folder tree (MISSING FUNCTIONALITY)
    * Compile Apps in order to fullfill dependencies
    * Sign the Apps with CodeSigning certificate if `navertical.CertPath` is set
5. Publish the Apps with `navertical:Publish App Tree`
    This command will:
    * Install the Apps in order to fullfill the dependencies
    * Publish the Apps
6. To unpublish the Apps you can use `navertical:Unpublish App Tree`
7. To remove environment you can use `navertical:Remove Environment`

## Azure Pipeline

If you want to have CI pipeline created in your Azure DevOps, just push the App repository to your Azure Repository. If the Pipeline is not created automaticaly, go to your Azure Build Pipelines, click New, and select the repo. The Pipeline will be created automatically for you. If you want to change something in the pipeline, edit the  `.vsts-ci.yml` file accordingly. By pushing new version to the Azure Repo, new definition of the pipeline will be automatically used.

## Requirements

All needed powershell scripts are installed by the extension.

## Extension Settings

This extension contributes the following settings:

* `navertical.CertPath`: set to path to CodeSigning certificate
* `navertical.IgnoreVerification`: set to false to enable signature verification when installing the apps
* `navertical.NewProjectRepository`: URL of the git repository to use when creating new App folder

## Known Issues

Missing possibility to pull missing dependencies from package server.

## Release Notes

### 0.0.2

Updated dependencies

### 0.0.1

Initial public release of the extension

