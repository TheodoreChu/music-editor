# Music Editor for Standard Notes

<div align="center">

[![Release](https://img.shields.io/github/release/theodorechu/music-editor.svg)](https://github.com/theodorechu/music-editor/releases)
[![License](https://img.shields.io/github/license/theodorechu/music-editor?color=blue)](https://github.com/theodorechu/music-editor/blob/main/LICENSE)
[![Status](https://img.shields.io/badge/status-ready%20for%20use-brightgreen.svg)](https://musiceditor.net/#installation)
[![Cost](https://img.shields.io/badge/cost-free-darkgreen.svg)](https://musiceditor.net/#installation)
[![GitHub issues](https://img.shields.io/github/issues/theodorechu/music-editor.svg)](https://github.com/theodorechu/music-editor/issues/)
[![Slack](https://img.shields.io/badge/slack-standardnotes-CC2B5E.svg?style=flat&logo=slack)](https://standardnotes.org/slack)
[![Downloads](https://img.shields.io/github/downloads/theodorechu/music-editor/total.svg?style=flat)](https://github.com/theodorechu/music-editor/releases)
[![GitHub Stars](https://img.shields.io/github/stars/theodorechu/music-editor?style=social)](https://github.com/theodorechu/music-editor)

</div>

## Introduction

The Music Editor is an **unofficial** [editor](https://standardnotes.org/help/77/what-are-editors) for [Standard Notes](https://standardnotes.org), a free, [open-source](https://standardnotes.org/knowledge/5/what-is-free-and-open-source-software), and [end-to-end encrypted](https://standardnotes.org/knowledge/2/what-is-end-to-end-encryption) notes app.

Try the demo at [demo.musiceditor.net](https://demo.musiceditor.net) or learn more at [musiceditor.net](https://musiceditor.net).

The Music Editor is used to write music and guitar tablature using [VexTab](https://vexflow.com/vextab/tutorial.html).

For a full tutorial on how to use VexTab, please see the [official tutorial](https://vexflow.com/vextab/tutorial.html).

The Music Editor is built with React, TypeScript, Sass, [VexTab](https://github.com/0xfe/vextab), and [VexFlow](https://github.com/0xfe/vexflow).

## Features

- Write music and guitar tablature using [VexTab](https://vexflow.com/vextab/tutorial.html).
- Three modes: Edit, Split, and View.
- Save as PDF using Microsoft Edge or Chrome.

## Installation

1. Register for an account at Standard Notes using the [Desktop App](https://standardnotes.org/download) or [Web app](https://app.standardnotes.org). Remember to use a strong and memorable password.
2. In the bottom left corner of the app, click **Extensions**.
3. Click **Import Extension**.
4. Paste this into the input box:
   ```
   https://notes.theochu.com/p/Sfq1jJV0X2
   ```
   or paste this into the input box on **desktop**:
   ```
   https://raw.githubusercontent.com/TheodoreChu/music-editor/main/public/demo.ext.json
   ```
5. Press Enter or Return on your keyboard.
6. Click **Install**.
7. At the top of your note, click **Editor**, then click **Music Editor**.
8. When prompted to activate the extension, click **Continue**.

After you have installed the editor on the web or desktop app, it will automatically sync to your [mobile app](https://standardnotes.org/download) after you sign in.

## Development

**Prerequisites:** Install [Node.js](https://nodejs.org/en/), [Yarn](https://classic.yarnpkg.com/en/docs/install/), and [Git](https://github.com/git-guides/install-git) on your computer.

The general instructions setting up an environment to develop Standard Notes extensions can be found [here](https://docs.standardnotes.org/extensions/local-setup). You can also follow these instructions:

1. Fork the [repository](https://github.com/theodorechu/music-editor) on GitHub.
2. [Clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) your fork of the repository.
3. Run `cd music-editor` to enter the `music-editor` directory.
4. Run `yarn install` to install the dependencies on your machine as they are described in `yarn.lock`.

### Testing in the browser

1. To run the app in development mode, run `yarn start` and visit http://localhost:3001. Press `ctrl/cmd + C` to exit development mode.

### Testing in the Standard Notes app

1.  Create an `ext.json` in the `public` directory. You have three options:
    1.  Use `sample.ext.json`.
    2.  Create `ext.json` as a copy of `sample.ext.json`.
    3.  Follow the instructions [here](https://docs.standardnotes.org/extensions/local-setup) with `url: "http://localhost:3000/index.html"`.
2.  Install http-server using `sudo npm install -g http-server` then run `yarn server` to serve the `./build` directory at http://localhost:3000.
3.  To build the app, run `yarn build`.
4.  Install the editor into the [web](https://app.standardnotes.org) or [desktop](https://standardnotes.org/download) app with `http://localhost:3000/sample.ext.json` or with your custom `ext.json`. Press `ctrl/cmd + C` to shut down the server.

### Deployment

1. To make the source code prettier, run `yarn pretty`.
2. To the deploy the build into the `gh-pages` branch of your repository on GitHub, run `yarn deploy-stable`.
3. To deploy the build into to the `dev` branch for testing, run `yarn deploy-dev`.
4. To deploy the built into the `build` branch for distributing, run `yarn deploy-build` for distributing builds.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

#### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## License

Copyright (c) Theodore Chu. All Rights Reserved. Licensed under [AGPL-3.0](https://github.com/TheodoreChu/music-editor/blob/main/LICENSE) or later.

## Acknowledgements

Early stages of this editor were based heavily on the Standard Notes [Markdown Basic Editor](https://github.com/standardnotes/markdown-basic). The Markdown Basic Editor is licensed under AGPL-3.0 and is available for use through [Standard Notes Extended](https://standardnotes.org/extensions).

## Further Resources

- [GitHub](https://github.com/TheodoreChu/music-editor) for the source code of the Music Editor
- [GitHub Issues](https://github.com/TheodoreChu/music-editor/issues) for reporting issues concerning the Music Editor
- [Docs](https://docs.theochu.com/music-editor) for how to use the Music Editor
- [Contact](https://theochu.com/contact) for how to contact the developer of the Music Editor
- [Music Editor To do List](https://github.com/TheodoreChu/music-editor/projects/1) for the roadmap of the Music Editor
- [Standard Notes Slack](https://standardnotes.org/slack) for connecting with the Standard Notes Community
- [Standard Notes Help](https://standardnotes.org/help) for help with issues related to Standard Notes but unrelated to this editor
