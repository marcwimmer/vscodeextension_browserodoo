// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PythonShell} from 'python-shell';
import * as WebRequest from 'web-request';
import { getXmlIds } from './browse_files_for_xmlids';


export function deactivate() {}


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

	const cmd2 = vscode.commands.registerCommand('odoobrowser.command2', () => {
		(async function () {
			var result = await WebRequest.get('http://www.google.com/');
			console.log(result.content);
		})();

	});

	const cmdUpdateXmlIds = vscode.commands.registerCommand('odoobrowser.updateXmlIds', () => {
		(async function() {
			let ids = await getXmlIds();

			for (var x of ids) {
				console.log(x.name);
			}
		});

	});
;


	context.subscriptions.push(cmdShowXmlIds, cmdBye, cmd2, cmdUpdateXmlIds);

}

