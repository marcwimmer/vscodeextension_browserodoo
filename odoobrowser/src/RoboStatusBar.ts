import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VSCodeTools, Tools } from './tools';
import { exec } from 'child_process';
import * as os from "os";

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
			this.toggleSection("SNIPPET_MODE");
			this.updateStatusBarItem(statusBarItem);
			vscode.window.showInformationMessage("Hello from your VS Code extension!");
		}));

		// Add to context to dispose when extension is deactivated
		context.subscriptions.push(statusBarItem);

	}
	private static updateStatusBarItem(item: any) {
		const snippetMode = this.getSectionInfo("SNIPPET_MODE");
		item.text = "SNIPPETMODE: " + snippetMode;
	}
	private static getFilecontent(): any {
		const settingsPath = this.getUserSettingsPath();
		// Read the settings.json file
		const settingsData = fs.readFileSync(settingsPath, "utf-8");
		const settings = JSON.parse(settingsData);
		return settings;


	}
	private static toggleSection(section: string) {
		const settingsPath = this.getUserSettingsPath();
		try {
			const settings = this.getFilecontent();
			// Check if "robotcode.robot.env" exists
			if (!settings["robotcode.robot.env"]) {
				vscode.window.showErrorMessage("robotcode.robot.env section not found in settings.json!");
				return;
			}
			// Toggle values between "0" and "1"
			[section].forEach((key) => {
				if (settings["robotcode.robot.env"][key] !== undefined) {
					settings["robotcode.robot.env"][key] = settings["robotcode.robot.env"][key] === "0" ? "1" : "0";
				}
			});

			// Write back to settings.json
			fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), "utf-8");

			vscode.window.showInformationMessage("Toggled ROBO_NO_UI_HIGHLIGHTING and SNIPPET_MODE!");

		} catch (error) {
			vscode.window.showErrorMessage("Error processing settings.json: " + error);
		}
	}
	private static getSectionInfo(name: string): string {
		const settings = this.getFilecontent();
		// Check if "robotcode.robot.env" exists
		if (!settings["robotcode.robot.env"]) {
			return;
		}
		return settings['robotcode.robot.env']['SNIPPET_MODE'];
	}
	private static getUserSettingsPath(): string {
		let settingsPath: string;

		switch (process.platform) {
			case "win32":
				settingsPath = path.join(process.env.APPDATA || "", "Code", "User", "settings.json");
				break;
			case "darwin":
				settingsPath = path.join(os.homedir(), "Library", "Application Support", "Code", "User", "settings.json");
				break;
			case "linux":
				settingsPath = path.join(os.homedir(), ".config", "Code", "User", "settings.json");
				break;
			default:
				throw new Error("Unsupported platform");
		}
		if (!fs.existsSync(settingsPath)) {
			vscode.window.showErrorMessage("VS Code settings.json not found!");
			return;
		}

		return settingsPath;
	}
}