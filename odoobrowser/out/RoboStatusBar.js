"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoboStatusBar = void 0;
const vscode = require("vscode");
class RoboStatusBar {
    static register(context) {
        // Create a status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = "$(zap) RobotEnv!"; // $(zap) is an icon
        statusBarItem.tooltip = "Click to toggle the Snippet Mode for Robo Tests";
        statusBarItem.command = "odoobrowser.toggleRoboSnippetMode";
        statusBarItem.show();
        this.updateStatusBarItem(statusBarItem);
        // Register a command that runs when the status bar is clicked
        context.subscriptions.push(vscode.commands.registerCommand("odoobrowser.toggleRoboSnippetMode", () => {
            this.toggleConfigValue("robotcode.robot", "env", "SNIPPET_MODE");
            this.updateStatusBarItem(statusBarItem);
            // vscode.window.showInformationMessage("Hello1 from your VS Code extension!");
        }));
        // Add to context to dispose when extension is deactivated
        context.subscriptions.push(statusBarItem);
    }
    static updateStatusBarItem(item) {
        const snippetMode = this.getSectionInfo("robotcode.robot", "env", "SNIPPET_MODE");
        item.text = "SNIPPETMODE: " + snippetMode;
    }
    static async setConfigValue(section1, section2, key, value) {
        const cfg = vscode.workspace.getConfiguration(section1);
        // read whole env object (or empty object if missing)
        const env = cfg.get(section2, {});
        env[key] = value;
        // choose the same scope where the setting currently lives
        const inspect = cfg.inspect(section2);
        const target = inspect?.workspaceFolderValue !== undefined
            ? vscode.ConfigurationTarget.WorkspaceFolder
            : inspect?.workspaceValue !== undefined
                ? vscode.ConfigurationTarget.Workspace
                : vscode.ConfigurationTarget.Global;
        await cfg.update(section2, env, target);
        vscode.window.showInformationMessage(`${key} set to ${value}`);
    }
    static async toggleConfigValue(section1, section2, key) {
        const cfg = vscode.workspace.getConfiguration(section1);
        const env = cfg.get(section2, {});
        const current = env[key] ?? "0";
        await this.setConfigValue(section1, section2, key, current === "1" ? "0" : "1");
    }
    static getSectionInfo(section1, section2, key) {
        const cfg = vscode.workspace.getConfiguration(section1);
        const env = cfg.get(section2, {});
        const current = env[key] ?? "0";
        return current;
    }
}
exports.RoboStatusBar = RoboStatusBar;
//# sourceMappingURL=RoboStatusBar.js.map