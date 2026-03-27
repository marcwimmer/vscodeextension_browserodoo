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
        this.updateStatusBarItem(statusBarItem, null);
        // Register a command that runs when the status bar is clicked
        context.subscriptions.push(vscode.commands.registerCommand("odoobrowser.toggleRoboSnippetMode", async () => {
            const newValue = await this.toggleConfigValue("robotcode.robot", "env", "SNIPPET_MODE");
            this.updateStatusBarItem(statusBarItem, newValue);
        }));
        // Add to context to dispose when extension is deactivated
        context.subscriptions.push(statusBarItem);
    }
    static updateStatusBarItem(item, value) {
        try {
            // Normalize to "0" | "1"
            const resolved = (value ?? this.getSectionInfo("robotcode.robot", "env", "SNIPPET_MODE"));
            item.text = `SNIPPETMODE: ${resolved}`;
            // In case it was never shown or got hidden elsewhere:
            if (!item._visible) {
                item.show?.();
            }
            return resolved;
        }
        catch (err) {
            console.error("[RoboStatusBar] Failed to update status bar item:", err);
            vscode.window.showErrorMessage(`Failed to update status bar item: ${err?.message ?? String(err)}`);
            // Give the caller something predictable
            return value ?? "0";
        }
    }
    static async setConfigValue(section1, // "robotcode.robot"
    section2, // "env"
    key, // "SNIPPET_MODE"
    value) {
        try {
            const fullKey = `${section1}.${section2}`;
            // Pick a resource so WorkspaceFolder writes know *which* folder.
            const resource = vscode.window.activeTextEditor?.document.uri ??
                vscode.workspace.workspaceFolders?.[0]?.uri;
            // Use resource-aware configuration
            const cfg = vscode.workspace.getConfiguration(section1, resource);
            // read current object
            const env = (cfg.get(section2) ?? {});
            env[key] = value;
            // Inspect where it currently lives
            const insp = vscode.workspace.getConfiguration(undefined, resource)
                .inspect(fullKey);
            // Decide a target, then sanitize it given current window state
            const hasWorkspace = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
            let target = !insp
                ? vscode.ConfigurationTarget.Global
                : insp.workspaceFolderValue !== undefined
                    ? vscode.ConfigurationTarget.WorkspaceFolder
                    : insp.workspaceValue !== undefined
                        ? vscode.ConfigurationTarget.Workspace
                        : vscode.ConfigurationTarget.Global;
            // Downgrade target if it isn't valid in current context
            if (target === vscode.ConfigurationTarget.WorkspaceFolder && !resource) {
                // no folder resource -> cannot write WorkspaceFolder; try Workspace/Global
                target = hasWorkspace ? vscode.ConfigurationTarget.Workspace
                    : vscode.ConfigurationTarget.Global;
            }
            if (target === vscode.ConfigurationTarget.Workspace && !hasWorkspace) {
                // no workspace open -> must write Global
                target = vscode.ConfigurationTarget.Global;
            }
            // Update
            await cfg.update(section2, env, target);
            console.log(`[RoboStatusBar] Updated ${fullKey}.${key}=${value} at target=${target}`);
            vscode.window.showInformationMessage(`SNIPPET_MODE set to ${value}`);
        }
        catch (err) {
            console.error("[RoboStatusBar] Failed to update config:", err);
            vscode.window.showErrorMessage(`Failed to update config ${section1}.${section2}.${key}: ${err?.message ?? String(err)}`);
            throw err; // keep behavior observable to caller
        }
    }
    static async toggleConfigValue(section1, section2, key) {
        const cfg = vscode.workspace.getConfiguration(section1);
        const env = cfg.get(section2, {});
        const current = env[key] ?? "0";
        const newValue = current === "1" ? "0" : "1";
        await this.setConfigValue(section1, section2, key, newValue);
        return newValue;
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