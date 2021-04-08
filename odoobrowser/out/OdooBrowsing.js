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
exports.OdooBrowser = void 0;
const vscode = require("vscode");
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
const tools_1 = require("./tools");
const child_process_1 = require("child_process");
class OdooBrowser {
    static register(context) {
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.gotoMANIFEST', OdooBrowser.gotoMANIFEST));
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.gotoManifest', OdooBrowser.gotoManifest));
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.newModule', OdooBrowser.newModule));
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.goto', OdooBrowser.goto));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateAstAll', OdooBrowser.updateAstAll));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateAstCurrentFile', OdooBrowser.updateAstFile));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateModuleFile', OdooBrowser.updateModuleFile));
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.gotoInherited', OdooBrowser.gotoInherited));
        OdooBrowser.registerFzfGodo();
        OdooBrowser.registerDidSaveDocument();
    }
    static registerFzfGodo() {
        vscode.window.onDidCloseTerminal(term => {
            if (term.name === 'godoo') {
                if (!term.exitStatus.code) {
                    console.log("Closed the godoo");
                    const data = fs.readFileSync(tools_1.Tools._getPathOfSelectedFzf(), 'UTF-8').trim();
                    fs.unlinkSync(tools_1.Tools._getPathOfSelectedFzf());
                    const fileLocation = data.split(":::")[1];
                    const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
                    const filePath = path.join(rootPath, fileLocation.split(":")[0]);
                    const lineNo = Number(fileLocation.split(":")[1]);
                    tools_1.VSCodeTools.editFile(filePath, lineNo);
                }
            }
        });
    }
    static registerDidSaveDocument() {
        vscode.workspace.onDidSaveTextDocument((document) => {
            // update ast on change
            if (!tools_1.Tools.hasOdooManifest()) {
                return;
            }
            let filename = tools_1.VSCodeTools.getActiveRelativePath(document.fileName);
            if (!filename) {
                return;
            }
            if (filename.indexOf('/') === 0 || filename.startsWith('../')) {
                // absolute path from somewhere else
                return;
            }
            filename = filename.replace(/ /g, '\\ ');
            OdooBrowser._updateAst(filename);
            if (filename.indexOf('/i18n/') >= 0) {
                tools_1.Tools.writeDebugFile("import_i18n:de_DE:" + filename);
            }
        });
    }
    static _updateAst(filename) {
        if (!tools_1.Tools.hasOdooManifest()) {
            return;
        }
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let command = odooBin + " update-ast ";
        if (filename && filename.length > 0) {
            command += ' --filename ' + filename;
        }
        let msg = "Finished updating AST";
        if (filename && filename.length) {
            msg = "";
        }
        tools_1.Tools.execCommand(command, msg);
    }
    static gotoInherited() {
        const lineNo = tools_1.VSCodeTools.getActiveLine();
        const odooBin = tools_1.Tools.getOdooFrameworkBin();
        let command = odooBin + " goto-inherited ";
        let filename = tools_1.VSCodeTools.getActiveRelativePath();
        filename = filename.replace(/ /g, '\\ ');
        command += ' --filepath ' + filename;
        command += ' --lineno ' + lineNo;
        child_process_1.exec(command, { cwd: vscode.workspace.workspaceFolders[0].uri.path }, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            }
            else {
                const result = stdout.trim().split("\n");
                const lastLine = result[result.length - 1];
                if (lastLine.indexOf("FILEPATH") < 0) {
                    return;
                }
                const filepath = lastLine.split(":")[1];
                const lineNo = Number(lastLine.split(":")[2]);
                tools_1.VSCodeTools.editFile(filepath, lineNo);
            }
        });
    }
    static updateAstAll() {
        // var relCurrentFilename = getActiveRelativePath();
        var odooBin = tools_1.Tools.getOdooFrameworkBin();
        OdooBrowser._updateAst(null);
    }
    static updateAstFile() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        OdooBrowser._updateAst(relCurrentFilename);
    }
    static goto() {
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
        terminal.show(false);
        // onDidCloseTerminal catches the exit event
    }
    static updateModuleFile() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        if (!module || !module.length) {
            return;
        }
        let command = odooBin + " update-module-file " + module;
        tools_1.Tools.execCommand(command, "Update odoo module file of " + module);
    }
    static gotoManifest() {
        const currentFile = tools_1.VSCodeTools.getActiveRelativePath();
        const manifestPath = path.join(tools_1.Tools.getModuleOfFilePath(currentFile, true), "__manifest__.py");
        if (fs.existsSync(manifestPath)) {
            tools_1.VSCodeTools.editFile(manifestPath, 0);
        }
    }
    static gotoMANIFEST() {
        const manifestPath = path.join(tools_1.VSCodeTools.getAbsoluteRootPath(), 'MANIFEST');
        if (fs.existsSync(manifestPath)) {
            tools_1.VSCodeTools.editFile(manifestPath, 0);
        }
    }
    static newModule() {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('copyFilePath');
            let folder = yield vscode.env.clipboard.readText(); // returns a string
            if (!folder || !folder.length) {
                return;
            }
            if (!tools_1.Tools.hasOdooManifest()) {
                vscode.window.showErrorMessage("No MANIFEST file found.");
                return;
            }
            const moduleName = yield vscode.window.showInputBox({
                'ignoreFocusOut': true,
                'prompt': "Please enter a module name"
            });
            if (!moduleName) {
                return;
            }
            console.log(folder);
            let odooBin = tools_1.Tools.getOdooFrameworkBin();
            let command = odooBin + " make-module  --name " + moduleName + " -p " + folder;
            tools_1.Tools.execCommand(command, "Make new module: " + moduleName);
            // get current version
        }))();
    }
}
exports.OdooBrowser = OdooBrowser;
//# sourceMappingURL=OdooBrowsing.js.map