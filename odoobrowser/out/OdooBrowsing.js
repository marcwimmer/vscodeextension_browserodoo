"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooBrowser = void 0;
const vscode = require("vscode");
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
const tools_1 = require("./tools");
const child_process_1 = require("child_process");
class OdooBrowser {
    static register(context) {
        context.subscriptions.push(vscode.commands.registerCommand('odoobrowser.goto', OdooBrowser.goto));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateAstAll', OdooBrowser.updateAstAll));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateAstCurrentFile', OdooBrowser.updateAstFile));
        context.subscriptions.push(vscode.commands.registerCommand('odoo_debugcommand.updateModuleFile', OdooBrowser.updateModuleFile));
        OdooBrowser.registerFzfGodo();
        OdooBrowser.registerDidSaveDocument();
    }
    static registerFzfGodo() {
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
    }
    static registerDidSaveDocument() {
        vscode.workspace.onDidSaveTextDocument((document) => {
            // update ast on change
            const filename = tools_1.Tools.getActiveRelativePath(document.fileName);
            OdooBrowser._updateAst(filename);
            if (filename.indexOf('/i18n/') >= 0) {
                tools_1.Tools.writeDebugFile("import_i18n:de_DE:" + filename);
            }
        });
    }
    static _updateAst(filename) {
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
    static updateAstAll() {
        // var relCurrentFilename = getActiveRelativePath();
        var odooBin = tools_1.Tools.getOdooFrameworkBin();
        OdooBrowser._updateAst(null);
    }
    static updateAstFile() {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
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
        terminal.show(true);
        // onDidCloseTerminal catches the exit event
    }
    static updateModuleFile() {
        var relCurrentFilename = tools_1.Tools.getActiveRelativePath();
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        if (!module || !module.length) {
            return;
        }
        let command = odooBin + " update-module-file " + module;
        tools_1.Tools.execCommand(command, "Update odoo module file of " + module);
    }
}
exports.OdooBrowser = OdooBrowser;
//# sourceMappingURL=OdooBrowsing.js.map