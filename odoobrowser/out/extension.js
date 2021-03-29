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
const vscode = require("vscode");
const WebRequest = require("web-request");
const browse_files_for_xmlids_1 = require("./browse_files_for_xmlids");
function deactivate() { }
exports.deactivate = deactivate;
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
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                var result = yield WebRequest.get('http://www.google.com/');
                console.log(result.content);
            });
        })();
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
    ;
    context.subscriptions.push(cmdShowXmlIds, cmdBye, cmd2, cmdUpdateXmlIds);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map