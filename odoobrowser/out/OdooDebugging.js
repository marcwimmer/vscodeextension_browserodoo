"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooDebugging = void 0;
const vscode = require("vscode");
const tools_1 = require("./tools");
const fs = require("fs"); // In NodeJS: 'const fs = require('fs')'
class OdooDebugging {
    static register(context) {
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.setupLaunchJSON", OdooDebugging.setupLaunchJSON));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.restart", OdooDebugging.restart));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.runInConsole", OdooDebugging.runInConsole));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.updateModule", OdooDebugging.updateModule));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.updateView", OdooDebugging.updateView));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.runUnittest", OdooDebugging.runUnittest));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.runLastUnittest", OdooDebugging.runLastUnittest));
        context.subscriptions.push(vscode.commands.registerCommand("odoo_debugcommand.exportI18n", OdooDebugging.exportI18n));
    }
    static updateModule() {
        const relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        const module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        tools_1.Tools.writeDebugFile("update_module:" + module);
    }
    static restart() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        tools_1.Tools.writeDebugFile("restart");
    }
    static exportI18n() {
        const relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        const module = tools_1.Tools.getModuleOfFilePath(relCurrentFilename);
        tools_1.Tools.writeDebugFile("export_i18n:de_DE:" + module);
    }
    static runUnittest() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        tools_1.Tools.writeDebugFile("unit_test:" + relCurrentFilename);
    }
    static runLastUnittest() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        tools_1.Tools.writeDebugFile("last_unit_test");
    }
    static updateView() {
        var relCurrentFilename = tools_1.VSCodeTools.getActiveRelativePath();
        let lineno = tools_1.VSCodeTools.getActiveLine();
        tools_1.Tools.writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
    }
    static runInConsole() {
        const content = tools_1.VSCodeTools.getActiveFileContent();
        let odooBin = tools_1.Tools.getOdooFrameworkBin();
        let command = "echo '" + content + "' | " + odooBin + " shell";
        const terminal = tools_1.VSCodeTools.ensureTerminalExists('console');
        terminal.sendText(command, true);
        terminal.show(true);
    }
    static setupLaunchJSON() {
        let root = vscode.workspace.workspaceFolders[0].uri.path;
        var vscodePath = root + "/.vscode";
        var launchJson = vscodePath + "/launch.json";
        if (!fs.existsSync(vscodePath)) {
            fs.mkdirSync(vscodePath);
        }
        if (!fs.existsSync(launchJson)) {
            fs.writeFileSync(launchJson, `
            {
"version": "0.2.0",
"configurations": [
{
    "name": "Python: Attach remotely",
    "type": "python",
    "request": "attach",
    "connect": {"host": "127.0.0.1", "port": 5678},
    "pathMappings": [
        {
            "localRoot": "\${workspaceFolder}",
            "remoteRoot": "/opt/src"
        }
        ]
},
]
}
`);
        }
    }
}
exports.OdooDebugging = OdooDebugging;
//# sourceMappingURL=OdooDebugging.js.map