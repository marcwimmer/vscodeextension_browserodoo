"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.deactivate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// https://github.com/jtanx/ctagsx/blob/master/extension.js
const vscode = require("vscode");
const WebRequest = require("web-request");
const browse_files_for_xmlids_1 = require("./browse_files_for_xmlids");
const path_1 = require("path");
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
const { exec } = require('child_process');
function deactivate() { }
exports.deactivate = deactivate;
function getOdooFrameworkBin() {
    const candidates = [
        "~/odoo/odoo",
        "/opt/odoo/odoo"
    ];
    for (let candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    vscode.window.showErrorMessage("Odoo framework not found: " + candidates);
    throw new Error("Odoo framework not found.");
}
function getModuleOfFilePath(relFilepath) {
    let current = relFilepath;
    while (true) {
        current = path.dirname(current);
        if (fs.existsSync(current + "/__manifest__.py")) {
            return path_1.basename(current);
        }
        if (current === "/") {
            break;
        }
    }
    throw new Error("No module found.");
}
function getAbsoluteRootPath() {
    var _a, _b;
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showInformationMessage("No folder or workspace opened.");
        return "";
    }
    const folderUri = (_b = (_a = vscode.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders[0]) === null || _b === void 0 ? void 0 : _b.uri;
    return folderUri.path;
}
function writeDebugFile(data) {
    const buffer = Buffer.from(data, 'utf8');
    const fileUri = vscode.Uri.parse(path_1.posix.join(getAbsoluteRootPath(), '.debug'));
    vscode.workspace.fs.writeFile(fileUri, buffer);
}
function getActiveRelativePath() {
    const currentFilename = vscode.window.activeTextEditor.document.fileName;
    const folderUri = getAbsoluteRootPath();
    var relCurrentFilename = path_1.relative(folderUri, currentFilename);
    return relCurrentFilename;
}
function getActiveLine() {
    if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage("No folder or workspace opened.");
        return 0;
    }
    return vscode.window.activeTextEditor.selection.active.line;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "odoobrowser" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const cmdShowXmlIds = vscode.commands.registerCommand('odoobrowser.showXmlIds', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const panel = vscode.window.createWebviewPanel('catCoding', 'Cat Coding', vscode.ViewColumn.One, {});
        panel.title = "Odoo Browser";
        const url = "http://10.10.173.111:8620/xmlids";
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                var result = yield WebRequest.get(url);
                panel.webview.html = result.content;
            });
        })();
        // And schedule updates to the content every second
        vscode.window.showInformationMessage('Hello World from OdooBrowser!');
    });
    const cmdBye = vscode.commands.registerCommand('odoobrowser.byeWorld', () => {
        vscode.window.showInformationMessage('Good Bye from OdooBrowser!');
    });
    const cmd2 = vscode.commands.registerCommand('odoobrowser.command2', () => {
        let items = [];
        let myitems = [];
        myitems.push("Marc");
        myitems.push("Marc1");
        myitems.push("Marc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("Andrea");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("PeterMarc");
        myitems.push("Marc");
        myitems.push("Marc");
        myitems.push("Marc");
        myitems.push("Marc");
        myitems.push("Marc");
        myitems.push("Marc");
        myitems.push("Marc");
        for (let index = 0; index < myitems.length; index++) {
            let item = myitems[index];
            items.push({
                label: item,
                description: item
            });
        }
        vscode.window.showQuickPick(items).then(selection => {
            // the user canceled the selection
            if (!selection) {
                return;
            }
            // the user selected some item. You could use `selection.name` too
            switch (selection.description) {
                case "onItem":
                    //doSomething();
                    break;
                case "anotherItem":
                    //doSomethingElse();
                    break;
                //.....
                default:
                    break;
            }
        });
    });
    const cmdUpdateXmlIds = vscode.commands.registerCommand('odoobrowser.updateXmlIds', () => {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                let ids = yield browse_files_for_xmlids_1.getXmlIds();
                for (var x of ids) {
                    console.log(x.name);
                }
            });
        });
    });
    const cmdUpdateModule = vscode.commands.registerCommand("odoo_debugcommand.update_module", () => {
        const relCurrentFilename = getActiveRelativePath();
        const module = getModuleOfFilePath(relCurrentFilename);
        writeDebugFile("update_module:" + module);
    });
    const cmdRunUnittest = vscode.commands.registerCommand("odoo_debugcommand.run_unittest", () => {
        var relCurrentFilename = getActiveRelativePath();
        writeDebugFile("unit_test:" + relCurrentFilename);
    });
    const cmdUpdateView = vscode.commands.registerCommand("odoo_debugcommand.update_view", () => {
        var relCurrentFilename = getActiveRelativePath();
        let lineno = getActiveLine();
        writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
    });
    const cmdRestart = vscode.commands.registerCommand("odoo_debugcommand.restart", () => {
        var relCurrentFilename = getActiveRelativePath();
        writeDebugFile("restart");
    });
    const cmdUpdateAstAll = vscode.commands.registerCommand("odoo_debugcommand.update_ast_all", () => {
        // var relCurrentFilename = getActiveRelativePath();
        var odooBin = getOdooFrameworkBin();
        exec(odooBin + ' update-ast', { cwd: vscode.workspace.workspaceFolders[0].uri.path }, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(err);
            }
            else {
                vscode.window.showInformationMessage("Finished updating AST.");
            }
        });
    });
    const cmdUpdateAstFile = vscode.commands.registerCommand("odoo_debugcommand.update_ast_current_file", () => {
        var relCurrentFilename = getActiveRelativePath();
    });
    context.subscriptions.push(cmdShowXmlIds, cmdBye, cmd2, cmdUpdateXmlIds, cmdUpdateModule, cmdRestart, cmdRunUnittest, cmdUpdateView, cmdUpdateAstAll, cmdUpdateAstFile);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map