import * as vscode from 'vscode';
import { OdooBrowser } from './OdooBrowsing';
import { OdooDebugging } from './OdooDebugging';

export function deactivate() {}

export function activate(context: vscode.ExtensionContext) {

	OdooBrowser.register(context);
	OdooDebugging.register(context);

}

