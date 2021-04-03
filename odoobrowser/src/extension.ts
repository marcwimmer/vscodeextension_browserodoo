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
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'
import { exec } from 'child_process';
import * as lineReader from 'line-reader';
import { getVSCodeDownloadUrl } from 'vscode-test/out/util';

export function deactivate() {}

function getExtensionRootFolder() {
	return vscode.extensions.getExtension('marc-christianwimmer.odoobrowser')?.extensionPath ?? "";
}

function getPreviewScript() {
	return path.join(
		getExtensionRootFolder(),
		'src/preview_fzf.py'
	);
}

function getOdooFrameworkBin() {
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

function getModuleOfFilePath(relFilepath: string): string {

	if (relFilepath[0] != '/') {
		relFilepath = path.join(
			vscode.workspace.workspaceFolders[0].uri.path,
			relFilepath,
		);

	}
	let current = relFilepath;
	while (true) {
		current = path.dirname(current);
		if (fs.existsSync(current + "/__manifest__.py")) {
			return basename(current);
		}
		if (current === "/") {
			break;
		}
	}
	throw new Error("No module found.");
}

function getAbsoluteRootPath() {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage("No folder or workspace opened.");
		return "";
	}
	const folderUri = vscode.workspace?.workspaceFolders[0]?.uri;
	return folderUri.path;

}

function writeDebugFile(data: string) {
	const buffer = Buffer.from(data, 'utf8');
	const fileUri = vscode.Uri.parse(posix.join(getAbsoluteRootPath(), '.debug'));
	vscode.workspace.fs.writeFile(fileUri, buffer);
}

function getActiveRelativePath(filename: string=vscode.window.activeTextEditor.document.fileName): string {
	const folderUri = getAbsoluteRootPath();
	var relCurrentFilename = relative(folderUri, filename);
	return relCurrentFilename;

}

function getActiveLine(): number {
	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage("No folder or workspace opened.");
		return 0;
	}

	return vscode.window.activeTextEditor.selection.active.line;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "odoobrowser" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const cmdShowXmlIds = vscode.commands.registerCommand('odoobrowser.showXmlIds', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'catCoding',
			'Cat Coding',
			vscode.ViewColumn.One,
			{}
		);
	
		panel.title = "Odoo Browser";
		const url = "http://10.10.173.111:8620/xmlids";
		(async function () {
			var result = await WebRequest.get(url);
			panel.webview.html = result.content;
		})();
	
		// And schedule updates to the content every second
		vscode.window.showInformationMessage('Hello World from OdooBrowser!');
	});

	const cmdBye = vscode.commands.registerCommand('odoobrowser.byeWorld', () => {
		vscode.window.showInformationMessage('Good Bye from OdooBrowser!');
	});

	function readLines(path: string) {
		let result:string[] = [];
		const data = fs.readFileSync(path, 'UTF-8');
		const lines = data.split(/\r?\n/);
		return lines;
	}

	function _getPathOfSelectedFzf() {
		return path.join(
			vscode.workspace.workspaceFolders[0].uri.path,
			'.selected'
		);
	}

	const cmdGoto = vscode.commands.registerCommand('odoobrowser.Goto', () => {
		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		let astPath = path.join(rootPath, '.odoo.ast');

		if (!fs.existsSync(astPath)) {
			vscode.window.showErrorMessage("Please create an AST File before.");
			return;
		}

		const previewScript = getPreviewScript();

		const terminal = ensureTerminalExists('godoo');
		terminal.sendText("cat .odoo.ast | fzf --preview-window=up --preview=\"" + 
			"python " + previewScript + " {}\" > " + _getPathOfSelectedFzf() + "; exit 0");
		terminal.show(true);
		// onDidCloseTerminal catches the exit event
	});

	vscode.window.onDidCloseTerminal(term => {
		if (term.name === 'godoo') {
			if (!term.exitStatus.code) {
				console.log("Closed the godoo");
				const data = fs.readFileSync(_getPathOfSelectedFzf(), 'UTF-8').trim();
				const fileLocation = data.split(":::")[1];
				const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
				const filePath = path.join(rootPath, fileLocation.split(":")[0]);
				const lineNo = Number(data.split(":")[1]);
				editFile(filePath, lineNo);
			}
		}
	});

	function ensureTerminalExists(name: string): vscode.Terminal {

		let found:any = null;
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

	const cmdGotoInefficient = vscode.commands.registerCommand('odoobrowser.GotoOld', () => {

		let rootPath = vscode.workspace.workspaceFolders[0].uri.path;
		let astPath = path.join(rootPath, '.odoo.ast');

		if (!fs.existsSync(astPath)) {
			vscode.window.showErrorMessage("Please create an AST File before.");
			return;
		}

		let items: vscode.QuickPickItem[] = [];
		const myitems:string[] = readLines(astPath);

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

			editFile(absFilePath, lineNo);
		});

	});

	function editFile(path: string, lineNo: number) { 
		const uri = vscode.Uri.file(path);
		vscode.commands.executeCommand<vscode.TextDocumentShowOptions>("vscode.open", uri);

		const editor = vscode.window.activeTextEditor;
		const position = editor.selection.active;
		var newPosition = position.with(lineNo, 0);
		var newSelection = new vscode.Selection(newPosition, newPosition);
		editor.selection = newSelection;
		vscode.commands.executeCommand('revealLine', {
			lineNumber: lineNo,
			at: 'center',
		});
	}

	const cmdUpdateXmlIds = vscode.commands.registerCommand('odoobrowser.updateXmlIds', () => {
		(async function() {
			let ids = await getXmlIds();

			for (var x of ids) {
				console.log(x.name);
			}
		});
	});

	const cmdUpdateModule = vscode.commands.registerCommand("odoo_debugcommand.update_module", () => {
		const relCurrentFilename = getActiveRelativePath();
		const module = getModuleOfFilePath(relCurrentFilename);
		writeDebugFile("update_module:" + module);

	});

	const cmdRunUnittest = vscode.commands.registerCommand("odoo_debugcommand.run_unittest", () => {
		var relCurrentFilename = getActiveRelativePath();
		writeDebugFile("unit_test:" + relCurrentFilename);
	});

	const cmdUpdateView = vscode.commands.registerCommand("odoo_debugcommand.update_view", () => {
		var relCurrentFilename = getActiveRelativePath();
		let lineno = getActiveLine();
		writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
	});

	const cmdRestart = vscode.commands.registerCommand("odoo_debugcommand.restart", () => {
		var relCurrentFilename = getActiveRelativePath();
		writeDebugFile("restart");
	});

	function updateAst(filename:string) {

		const manifestFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, "MANIFEST");
		if (!fs.existsSync(manifestFilePath)) {
			return;
		}

		let odooBin = getOdooFrameworkBin();
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

	const cmdUpdateAstAll = vscode.commands.registerCommand("odoo_debugcommand.update_ast_all", () => {
		// var relCurrentFilename = getActiveRelativePath();
		var odooBin = getOdooFrameworkBin();
		updateAst(null);
	});

	const cmdUpdateAstFile = vscode.commands.registerCommand("odoo_debugcommand.update_ast_current_file", () => {
		var relCurrentFilename = getActiveRelativePath();
		updateAst(relCurrentFilename);
	});

	const cmdUpdateModuleFile = vscode.commands.registerCommand("odoo_debugcommand.updateModuleFile", () => {
		var relCurrentFilename = getActiveRelativePath();
		updateAst(relCurrentFilename);
		let odooBin = getOdooFrameworkBin();
		let module = getModuleOfFilePath(relCurrentFilename);
		if (!module || !module.length) {
			return;
		}
		let command = odooBin + " update-module-file " + module;
		exec(command, {cwd: vscode.workspace.workspaceFolders[0].uri.path}, (err: any, stdout: any, stderr: any) => {
			if (err) {
				vscode.window.showErrorMessage(err);
			} else {
				//vscode.window.showInformationMessage("Update odoo module file of " + module);
			}
		});
	});

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		// update ast on change
		const filename = getActiveRelativePath(document.fileName);
		updateAst(filename);
	});


	context.subscriptions.push(
		cmdShowXmlIds,
		cmdBye,
		cmdUpdateXmlIds,
		cmdUpdateModule,
		cmdRestart,
		cmdRunUnittest,
		cmdUpdateView,
		cmdUpdateAstAll,
		cmdUpdateAstFile,
		cmdGoto,
		cmdUpdateModuleFile,
	);

}

