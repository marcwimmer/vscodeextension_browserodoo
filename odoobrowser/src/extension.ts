import * as vscode from 'vscode';
import { OdooBrowser } from './OdooBrowsing';
import { OdooDebugging } from './OdooDebugging';
import { RoboStatusBar } from './RoboStatusBar';
import { error } from 'console';

export function deactivate() {}

export function activate(context: vscode.ExtensionContext) {

	OdooBrowser.register(context);
	OdooDebugging.register(context);
	RoboStatusBar.register(context);

}

