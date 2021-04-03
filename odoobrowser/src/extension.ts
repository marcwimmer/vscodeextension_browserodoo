// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// https://github.com/jtanx/ctagsx/blob/master/extension.js
// const offset = vscode.workspace.getConfiguration('scrollToCursor').get<number>('offset')!;
// https://github.com/tatosjb/vscode-fuzzy-search/blob/master/src/fuzzy-search.ts

import * as vscode from 'vscode';
import {PythonShell} from 'python-shell';
import * as WebRequest from 'web-request';
import { getXmlIds } from './browse_files_for_xmlids';
import { posix, relative, basename } from 'path';
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import { exec } from 'child_process';
import * as lineReader from 'line-reader';
import { getVSCodeDownloadUrl } from 'vscode-test/out/util';
import { VSCodeTools, Tools } from './tools';
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'

export function deactivate() {}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const cmdGoto = vscode.commands.registerCommand('odoobrowser.goto', () => {
		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		let astPath = path.join(rootPath, '.odoo.ast');

		if (!fs.existsSync(astPath)) {
			vscode.window.showErrorMessage("Please create an AST File before.");
			return;
		}

		const previewScript = Tools.getPreviewScript();

		const terminal = VSCodeTools.ensureTerminalExists('godoo');
		terminal.sendText("cat .odoo.ast | fzf --preview-window=up --preview=\"" + 
			"python " + previewScript + " {}\" > " + Tools._getPathOfSelectedFzf() + "; exit 0");
		terminal.show(true);
		// onDidCloseTerminal catches the exit event
	});

	vscode.window.onDidCloseTerminal(term => {
		if (term.name === 'godoo') {
			if (!term.exitStatus.code) {
				console.log("Closed the godoo");
				const data = fs.readFileSync(Tools._getPathOfSelectedFzf(), 'UTF-8').trim();
				const fileLocation = data.split(":::")[1];
				const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
				const filePath = path.join(rootPath, fileLocation.split(":")[0]);
				const lineNo = Number(data.split(":")[1]);
				VSCodeTools.editFile(filePath, lineNo);
			}
		}
	});

	const cmdGotoInefficient = vscode.commands.registerCommand('odoobrowser.GotoOld', () => {

		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		let astPath = path.join(rootPath, '.odoo.ast');

		if (!fs.existsSync(astPath)) {
			vscode.window.showErrorMessage("Please create an AST File before.");
			return;
		}

		let items: vscode.QuickPickItem[] = [];
		const myitems:string[] = Tools.readLines(astPath);

		for (let index = 0; index < myitems.length; index++) {
			let item = myitems[index];
			const label = item.split(":::")[0];
			items.push({ 
				label: label, 
				description: item
			});
		}
		vscode.window.showQuickPick(items).then(selection => {
			// the user canceled the selection
			if (!selection) {
				return;
			}

			const fileInfo = selection.description.split(":::")[1].split("::");
			const filePath = fileInfo[0];
			const lineNo = Number(fileInfo[1]) - 1;
			const absFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, filePath);

			VSCodeTools.editFile(absFilePath, lineNo);
		});

	});

	const cmdUpdateXmlIds = vscode.commands.registerCommand('odoobrowser.updateXmlIds', () => {
		(async function() {
			let ids = await getXmlIds();

			for (var x of ids) {
				console.log(x.name);
			}
		});
	});

	const cmdUpdateModule = vscode.commands.registerCommand("odoo_debugcommand.updateModule", () => {
		const relCurrentFilename = Tools.getActiveRelativePath();
		const module = Tools.getModuleOfFilePath(relCurrentFilename);
		Tools.writeDebugFile("update_module:" + module);

	});

	const cmdExportI18n = vscode.commands.registerCommand("odoo_debugcommand.updateModule", () => {
		const relCurrentFilename = Tools.getActiveRelativePath();
		const module = Tools.getModuleOfFilePath(relCurrentFilename);
		Tools.writeDebugFile("export_i18n:de_DE:" + module);

	});

	const cmdRunUnittest = vscode.commands.registerCommand("odoo_debugcommand.runUnittest", () => {
		var relCurrentFilename = Tools.getActiveRelativePath();
		Tools.writeDebugFile("unit_test:" + relCurrentFilename);
	});

	const cmdUpdateView = vscode.commands.registerCommand("odoo_debugcommand.updateVview", () => {
		var relCurrentFilename = Tools.getActiveRelativePath();
		let lineno = VSCodeTools.getActiveLine();
		Tools.writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
	});

	const cmdRestart = vscode.commands.registerCommand("odoo_debugcommand.restart", () => {
		var relCurrentFilename = Tools.getActiveRelativePath();
		Tools.writeDebugFile("restart");
	});

	function updateAst(filename:string) {

		const manifestFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, "MANIFEST");
		if (!fs.existsSync(manifestFilePath)) {
			return;
		}

		let odooBin = Tools.getOdooFrameworkBin();
		let command = odooBin + " update-ast ";
		if (filename && filename.length > 0) {
			command +=  ' --filename ' + filename;
		}
		exec(command, {cwd: vscode.workspace.workspaceFolders[0].uri.path}, (err: any, stdout: any, stderr: any) => {
			if (err) {
				vscode.window.showErrorMessage(err);
			} else {
				if (!filename || !filename.length) {
					vscode.window.showInformationMessage("Finished updating AST");
				}
			}
		});

	}

	const cmdUpdateAstAll = vscode.commands.registerCommand("odoo_debugcommand.updateAstAll", () => {
		// var relCurrentFilename = getActiveRelativePath();
		var odooBin = Tools.getOdooFrameworkBin();
		updateAst(null);
	});

	const cmdUpdateAstFile = vscode.commands.registerCommand("odoo_debugcommand.updateAstCurrentFile", () => {
		var relCurrentFilename = Tools.getActiveRelativePath();
		updateAst(relCurrentFilename);
	});

	const cmdUpdateModuleFile = vscode.commands.registerCommand("odoo_debugcommand.updateModuleFile", () => {
		var relCurrentFilename = Tools.getActiveRelativePath();
		let odooBin = Tools.getOdooFrameworkBin();
		let module = Tools.getModuleOfFilePath(relCurrentFilename);
		if (!module || !module.length) {
			return;
		}
		let command = odooBin + " update-module-file " + module;
		Tools.execCommand(command, "Update odoo module file of " + module);
	});
	
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		// update ast on change
		const filename = Tools.getActiveRelativePath(document.fileName);
		updateAst(filename);

		if (filename.indexOf('/i18n/') >= 0) {
			Tools.writeDebugFile("import_i18n:de_DE:" + filename);
		}
	});

	context.subscriptions.push(
		cmdUpdateXmlIds,
		cmdUpdateModule,
		cmdRestart,
		cmdRunUnittest,
		cmdUpdateView,
		cmdUpdateAstAll,
		cmdUpdateAstFile,
		cmdGoto,
		cmdUpdateModuleFile,
		cmdUpdateView,
		cmdExportI18n
	);

}

