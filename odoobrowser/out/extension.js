"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// https://github.com/jtanx/ctagsx/blob/master/extension.js
// const offset = vscode.workspace.getConfiguration('scrollToCursor').get<number>('offset')!;
// https://github.com/tatosjb/vscode-fuzzy-search/blob/master/src/fuzzy-search.ts
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
const vscode = require("vscode");
const browse_files_for_xmlids_1 = require("./browse_files_for_xmlids");
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const child_process_1 = require("child_process");
const tools_1 = require("./tools");
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
function deactivate() { }
exports.deactivate = deactivate;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const cmdGoto = vscode.commands.registerCommand('odoobrowser.goto', () => {
        let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
        let astPath = path.join(rootPath, '.odoo.ast');
        if (!fs.existsSync(astPath)) {
            vscode.window.showErrorMessage("Please create an AST File before.");
            return;
        }
        const previewScript = tools_1.Tools.getPreviewScript();
        const terminal = tools_1.VSCodeTools.ensureTerminalExists('godoo');
        terminal.sendText("cat .odoo.ast | fzf --preview-window=up --preview=\"" +
            "python " + previewScript + " {}\" > " + tools_1.Tools._getPathOfSelectedFzf() + "; exit 0");
        terminal.show(true);
        // onDidCloseTerminal catches the exit event
    });
    vscode.window.onDidCloseTerminal(term => {
        if (term.name === 'godoo') {
            if (!term.exitStatus.code) {
                console.log("Closed the godoo");
                const data = fs.readFileSync(tools_1.Tools._getPathOfSelectedFzf(), 'UTF-8').trim();
                const fileLocation = data.split(":::")[1];
                const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
                const filePath = path.join(rootPath, fileLocation.split(":")[0]);
                const lineNo = Number(data.split(":")[1]);
                tools_1.VSCodeTools.editFile(filePath, lineNo);
            }
        }
    });
    const cmdGotoInefficient = vscode.commands.registerCommand('odoobrowser.GotoOld', () => {
        let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
        let astPath = path.join(rootPath, '.odoo.ast');
        if (!fs.existsSync(astPath)) {
            vscode.window.showErrorMessage("Please create an AST File before.");
            return;
        }
        let items = [];
        const myitems = tools_1.Tools.readLines(astPath);
        for (let index = 0; index < myitems.length; index++) {
            let item = myitems[index];
            const label = item.split(":::")[0];
            items.push({
                label: label,
                description: item
            });
        }
        vscode.window.showQuickPick(items).then(selection => {
            // the user canceled the selection
            if (!selection) {
                return;
            }
            const fileInfo = selection.description.split(":::")[1].split("::");
            const filePath = fileInfo[0];
            const lineNo = Number(fileInfo[1]) - 1;
            const absFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, filePath);
            tools_1.VSCodeTools.editFile(absFilePath, lineNo);
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
    const cmdUpdateModule = vscode.commands.registerCommand("odoo_debugcommand.updateModule", () => {
        const relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        const module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        tools_1.Tools.writeDebugFile("update_module:" + module);
    });
    const cmdExportI18n = vscode.commands.registerCommand("odoo_debugcommand.updateModule", () => {
        const relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        const module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        tools_1.Tools.writeDebugFile("export_i18n:de_DE:" + module);
    });
    const cmdRunUnittest = vscode.commands.registerCommand("odoo_debugcommand.runUnittest", () => {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        tools_1.Tools.writeDebugFile("unit_test:" + relCurrentFilename);
    });
    const cmdUpdateView = vscode.commands.registerCommand("odoo_debugcommand.updateVview", () => {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        let lineno = tools_1.VSCodeTools.getActiveLine();
        tools_1.Tools.writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
    });
    const cmdRestart = vscode.commands.registerCommand("odoo_debugcommand.restart", () => {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        tools_1.Tools.writeDebugFile("restart");
    });
    function updateAst(filename) {
        const manifestFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, "MANIFEST");
        if (!fs.existsSync(manifestFilePath)) {
            return;
        }
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let command = odooBin + " update-ast ";
        if (filename && filename.length > 0) {
            command += ' --filename ' + filename;
        }
        child_process_1.exec(command, { cwd: vscode.workspace.workspaceFolders[0].uri.path }, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(err);
            }
            else {
                if (!filename || !filename.length) {
                    vscode.window.showInformationMessage("Finished updating AST");
                }
            }
        });
    }
    const cmdUpdateAstAll = vscode.commands.registerCommand("odoo_debugcommand.updateAstAll", () => {
        // var relCurrentFilename = getActiveRelativePath();
        var odooBin = tools_1.Tools.getOdooFrameworkBin();
        updateAst(null);
    });
    const cmdUpdateAstFile = vscode.commands.registerCommand("odoo_debugcommand.updateAstCurrentFile", () => {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        updateAst(relCurrentFilename);
    });
    const cmdUpdateModuleFile = vscode.commands.registerCommand("odoo_debugcommand.updateModuleFile", () => {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        if (!module || !module.length) {
            return;
        }
        let command = odooBin + " update-module-file " + module;
        tools_1.Tools.execCommand(command, "Update odoo module file of " + module);
    });
    vscode.workspace.onDidSaveTextDocument((document) => {
        // update ast on change
        const filename = tools_1.Tools.getActiveRelativePath(document.fileName);
        updateAst(filename);
        if (filename.indexOf('/i18n/') >= 0) {
            tools_1.Tools.writeDebugFile("import_i18n:de_DE:" + filename);
        }
    });
    context.subscriptions.push(cmdUpdateXmlIds, cmdUpdateModule, cmdRestart, cmdRunUnittest, cmdUpdateView, cmdUpdateAstAll, cmdUpdateAstFile, cmdGoto, cmdUpdateModuleFile, cmdUpdateView, cmdExportI18n);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map