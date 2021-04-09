"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodeTools = exports.Tools = void 0;
const child_process_1 = require("child_process");
const vscode = require("vscode");
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const path_1 = require("path");
class Tools {
    static getExtensionRootFolder() {
        var _a, _b;
        return (_b = (_a = vscode.extensions.getExtension('marc-christianwimmer.odoobrowser')) === null || _a === void 0 ? void 0 : _a.extensionPath) !== null && _b !== void 0 ? _b : "";
    }
    static execCommand(cmd, msgOk) {
        child_process_1.exec(cmd, { cwd: vscode.workspace.workspaceFolders[0].uri.path }, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            }
            else {
                if (msgOk && msgOk.length) {
                    vscode.window.showInformationMessage(msgOk);
                }
            }
        });
    }
    static getPreviewScript() {
        return path.join(Tools.getExtensionRootFolder(), 'out/preview_fzf.py');
    }
    static getOdooFrameworkBin() {
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
    static getModuleOfFilePath(relFilepath, returnPath = false) {
        if (relFilepath[0] !== '/') {
            relFilepath = path.join(vscode.workspace.workspaceFolders[0].uri.path, relFilepath);
        }
        let current = relFilepath;
        while (true) {
            current = path.dirname(current);
            if (fs.existsSync(current + "/__manifest__.py")) {
                if (returnPath) {
                    return current;
                }
                else {
                    return path_1.basename(current);
                }
            }
            if (current === "/") {
                break;
            }
        }
        throw new Error("No module found.");
    }
    static writeDebugFile(data) {
        const buffer = Buffer.from(data, 'utf8');
        const fileUri = vscode.Uri.parse(path_1.posix.join(VSCodeTools.getAbsoluteRootPath(), '.debug'));
        vscode.workspace.fs.writeFile(fileUri, buffer);
    }
    static readLines(path) {
        const data = fs.readFileSync(path, 'UTF-8');
        const lines = data.split(/\r?\n/);
        return lines;
    }
    static _getPathOfSelectedFzf() {
        return path.join(vscode.workspace.workspaceFolders[0].uri.path, '.selected');
    }
    static hasOdooManifest() {
        const manifestFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, "MANIFEST");
        if (!fs.existsSync(manifestFilePath)) {
            return false;
        }
        return true;
    }
}
exports.Tools = Tools;
class VSCodeTools {
    static getActiveRelativePath(filename = vscode.window.activeTextEditor.document.fileName) {
        const folderUri = VSCodeTools.getAbsoluteRootPath();
        var relCurrentFilename = path_1.relative(folderUri, filename);
        return relCurrentFilename;
    }
    static ensureTerminalExists(name) {
        let found = null;
        for (let terminal of vscode.window.terminals) {
            if (terminal.name === name) {
                found = terminal;
            }
        }
        if (found) {
            return found;
        }
        return vscode.window.createTerminal(name);
    }
    static getActiveFileContent() {
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        return document.getText().trim();
    }
    static editFile(path, lineNo) {
        const uri = vscode.Uri.file(path);
        vscode.commands.executeCommand("vscode.open", uri);
        const editor = vscode.window.activeTextEditor;
        const position = editor.selection.active;
        var newPosition = position.with(lineNo, 0);
        var newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
        vscode.commands.executeCommand('editor.action.goToLocations', uri, editor.selection.start, [
            new vscode.Range(newPosition, newPosition)
        ], 'goto', "Not found");
    }
    static getActiveLine() {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("No folder or workspace opened.");
            return 0;
        }
        return vscode.window.activeTextEditor.selection.active.line;
    }
    static getAbsoluteRootPath() {
        var _a, _b;
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage("No folder or workspace opened.");
            return "";
        }
        const folderUri = (_b = (_a = vscode.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders[0]) === null || _b === void 0 ? void 0 : _b.uri;
        return folderUri.path;
    }
}
exports.VSCodeTools = VSCodeTools;
//# sourceMappingURL=tools.js.map