"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodeTools = exports.Tools = void 0;
const child_process_1 = require("child_process");
const vscode = require("vscode");
const path = require("path"); // In NodeJS: 'const fs = require('fs')'
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
const os = require("os"); // In NodeJS: 'const fs = require('fs')'
const path_1 = require("path");
class Tools {
    static getExtensionRootFolder() {
        return vscode.extensions.getExtension('Zebroo.zebroo')?.extensionPath ?? "";
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
    static resolveHome(filepath) {
        if (filepath[0] === '~') {
            let homedir = os.homedir();
            return path.join(homedir, filepath.slice(1));
        }
        return filepath;
    }
    static getBinFromPath(binName) {
        var paths = process.env['PATH'].split(":");
        for (var i = 0; i < paths.length; i += 1) {
            var searchPath = paths[i];
            searchPath = Tools.resolveHome(searchPath);
            var odooBin = searchPath + path.sep + binName;
            if (fs.existsSync(odooBin)) {
                return odooBin;
            }
        }
        return null;
    }
    static getOdooFrameworkBin() {
        const candidates = [
            "~/odoo/odoo",
            "/opt/odoo/odoo",
            "~/.local/sbin/odoo",
            "~/.local/bin/odoo",
        ];
        // search search path otherwise
        var bin = Tools.getBinFromPath('odoo');
        if (bin) {
            return bin;
        }
        for (let candidate of candidates) {
            candidate = Tools.resolveHome(candidate);
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
        // search search path otherwise
        for (var searchpath of (process.env['PATH'] ?? '').split(":")) {
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
        const debugPath = path.join(VSCodeTools.getAbsoluteRootPath(), '.debug');
        fs.writeFileSync(debugPath, data, 'utf8');
    }
    static isDebugLoopActive() {
        const debugPath = path.join(VSCodeTools.getAbsoluteRootPath(), '.debug');
        fs.writeFileSync(debugPath, 'debug_active?', 'utf8');
        return new Promise((resolve) => {
            const maxWait = 1500;
            const interval = 100;
            let elapsed = 0;
            const timer = setInterval(() => {
                elapsed += interval;
                if (!fs.existsSync(debugPath)) {
                    clearInterval(timer);
                    resolve(true);
                }
                else if (elapsed >= maxWait) {
                    clearInterval(timer);
                    // clean up unanswered probe
                    try {
                        fs.unlinkSync(debugPath);
                    }
                    catch { }
                    resolve(false);
                }
            }, interval);
        });
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
        if (workspaceFolder === null || workspaceFolder === undefined) {
            return false;
        }
        const manifestFilePath = path.join(workspaceFolder, "MANIFEST");
        if (!fs.existsSync(manifestFilePath)) {
            return false;
        }
        return true;
    }
}
exports.Tools = Tools;
class VSCodeTools {
    static getActiveRelativePath(filename) {
        if (!filename) {
            if (!vscode.window.activeTextEditor) {
                return '';
            }
            filename = vscode.window.activeTextEditor.document.fileName;
        }
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
    static async editFile(path, lineNo) {
        const uri = vscode.Uri.file(path);
        await vscode.commands.executeCommand("vscode.open", uri);
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var newPosition = new vscode.Position(lineNo, 0);
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
        var candidate = null;
        var MANIFEST_PATH = null;
        while (check !== '/') {
            MANIFEST_PATH = path_1.posix.join(check, "MANIFEST");
            if (fs.existsSync(MANIFEST_PATH)) {
                candidate = check;
            }
            check = path_1.dirname(check);
        }
        return candidate;
    }
    static getAbsoluteRootPath() {
        var workspaceFolder = this.getCurrentWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showInformationMessage("No workspace folder selected.");
            return "";
        }
        return workspaceFolder;
    }
}
exports.VSCodeTools = VSCodeTools;
//# sourceMappingURL=tools.js.map