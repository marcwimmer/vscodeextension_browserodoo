import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VSCodeTools, Tools } from './tools';
import { exec } from 'child_process';
import * as os from "os";
import { parse } from "jsonc-parser";

export class RoboStatusBar {

	public static register(context: any) {

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
	private static updateStatusBarItem(item: any) {
		const snippetMode = this.getSectionInfo("SNIPPET_MODE");
		item.text = "SNIPPETMODE: " + snippetMode;
	}
	private static getFilecontent(): any {
		// Read the settings.json file
		const settings = vscode.workspace.getConfiguration();
		return settings;
	}

	private static async setConfigValue(section1: string, section2: string, key: string, value: "0" | "1") {
		const cfg = vscode.workspace.getConfiguration(section1);

		// read whole env object (or empty object if missing)
		const env = cfg.get<Record<string, string>>(section2, {});
		env[key] = value;

		// choose the same scope where the setting currently lives
		const inspect = cfg.inspect<Record<string, string>>(section2);
		const target =
			inspect?.workspaceFolderValue !== undefined
				? vscode.ConfigurationTarget.WorkspaceFolder
				: inspect?.workspaceValue !== undefined
					? vscode.ConfigurationTarget.Workspace
					: vscode.ConfigurationTarget.Global;

		await cfg.update(section2, env, target);
		vscode.window.showInformationMessage(`${key} set to ${value}`);
	}

	private static async toggleConfigValue(section1: string, section2: string, key: string) {
		const cfg = vscode.workspace.getConfiguration(section1);
		const env = cfg.get<Record<string, string>>(section2, {});
		const current = env[key] ?? "0";
		await this.setConfigValue(section1, section2, key, current === "1" ? "0" : "1");
	}
	private static getSectionInfo(name: string): string {
		const settings = this.getFilecontent();
		// Check if "robotcode.robot.env" exists
		if (!settings["robotcode.robot.env"]) {
			return;
		}
		return settings['robotcode.robot.env']['SNIPPET_MODE'];
	}
}