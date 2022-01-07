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
        var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
        child_process_1.exec(cmd, { cwd: workspaceFolder }, (err, stdout, stderr) => {
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
    static getBinFromPath(binName) {
        var paths = process.env['PATH'].split(":");
        for (var i = 0; i < paths.length; i += 1) {
            var searchPath = paths[i];
            var odooBin = searchPath + path.sep + 'odoo';
            if (fs.existsSync(odooBin)) {
                return odooBin;
            }
        }
        return null;
    }
    static getOdooFrameworkBin() {
        const candidates = [
            "~/odoo/odoo",
            "/opt/odoo/odoo"
        ];
        // search search path otherwise
        var bin = Tools.getBinFromPath('odoo');
        if (bin) {
            return bin;
        }
        for (let candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
        // search search path otherwise
        for (var searchpath in process.env['PATH'].split(":")) {
            var odooBin = searchpath + path.sep + 'odoo';
            if (fs.existsSync(odooBin)) {
                return odooBin;
            }
        }
        vscode.window.showErrorMessage("Odoo framework not found: " + candidates);
        throw new Error("Odoo framework not found.");
    }
    static getModuleOfFilePath(relFilepath, returnPath = false) {
        if (relFilepath[0] !== '/') {
            var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
            relFilepath = path.join(workspaceFolder, relFilepath);
        }
        let current = relFilepath;
        while (true) {
            current = path.dirname(current);
            if (fs.existsSync(current + "/__manifest__.py") || fs.existsSync(current + "/__openerp__.py")) {
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
        var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
        return path.join(workspaceFolder, '.selected');
    }
    static hasOdooManifest(workspaceFolder) {
        const manifestFilePath = path.join(workspaceFolder, "MANIFEST");
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
    static getCurrentWorkspaceFolder() {
        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        var check = vscode.window.activeTextEditor.document.uri.path;
        while (!fs.existsSync(path_1.posix.join(check, 'MANIFEST'))) {
            check = path_1.dirname(check);
            if (check === '/') {
                return null;
            }
        }
        return check;
    }
    static getAbsoluteRootPath() {
        var workspaceFolder = this.getCurrentWorkspaceFolder();
        if (workspaceFolder === null) {
            vscode.window.showInformationMessage("No workspace folder selected.");
            return "";
        }
        return workspaceFolder;
    }
}
exports.VSCodeTools = VSCodeTools;
//# sourceMappingURL=tools.js.map