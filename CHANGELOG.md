# Change Log

## [Unreleased]

## [0.5.4] - 2020-04-15

- Missing dependency added

## [0.5.3] - 2020-04-01

- Using id instead AppId in dependencies for runtime since v4.1 (thanks @duichwer)

## [0.5.2] - 2020-03-30

- Add new setting to reinit repo to remove history (thanks @duichwer)
- Remove fixed named workspace for GO! command

## [0.5.1] - 2019-11-06

- Add snippets tsummary... to create Summary comments for procedure (the /// comments)

## [0.2.0] - 2019-10-22

- Add selection of branch to clone in NaverticAL: GO!. This allows multiple template versions to exists (e.g. BC version or localization).

## [0.1.3] - 2019-01-29

- Fixed bug when repository have spaces in name

## [0.1.2] - 2018-11-29

- cleanup
- starting powershell console by default

## [0.0.10] - 2018-10-16

- Partial Support for containers hosted on another host added (Settings)
- Added `NaverticAL:Setup Remote Docker Folder` (fixed params for now)
- Added support for remote docker into Read-ALConfiguration calls
- Removed update of navcontainerhelper because it is updated with NVRAppDevOps automatically
- Fixed module order load to first work with navcontainerhelper
- Added `Force Download System Packages` command

## [0.0.9] - 2018-09-21

- Added connection to new repository in GO! if URL is known and initial Push is done
- Better git error handling

## [0.0.8] - 2018-09-21

- Changed the GO! flow - first select new empty folder for the app, app name will be suggested based on the name

## [0.0.7] - 2018-09-21

- Fixed Input box to stay when changed focus in GO! function
- Added Error message when git clone ends with error (e.g. when git is not installed)
- Added `Update modules` command and remove automatic update on console initialization

## [0.0.6] - 2018-09-20

- Fixed shallow clone problem when pushing the repo to new remote (Issue #3)

## [0.0.5] - 2018-09-18

- Removed banner color
- Updated color of icon

## [0.0.4] - 2018-09-18

- Added banner color

## [0.0.3] - 2018-09-17

- Added License
- Changed readme.md
- Changed dependency versions

## [0.0.2] - 2018-09-17

- Changed dependency versions
