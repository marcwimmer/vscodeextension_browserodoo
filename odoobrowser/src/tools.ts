import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import { posix, relative, basename } from 'path';

export class Tools {

    public static getExtensionRootFolder() {
        return vscode.extensions.getExtension('marc-christianwimmer.odoobrowser')?.extensionPath ?? "";
    }

    public static execCommand(cmd: string, msgOk: string) {
        exec(cmd, {cwd: vscode.workspace.workspaceFolders[0].uri.path}, (err: any, stdout: any, stderr: any) => {
            if (err) {
                vscode.window.showErrorMessage(err);
            } else {
                if (msgOk && msgOk.length) {
                    vscode.window.showInformationMessage(msgOk);
                }
            }
        });
    }

    public static getPreviewScript() {
        return path.join(
            Tools.getExtensionRootFolder(),
            'src/preview_fzf.py'
        );
    }

    public static getOdooFrameworkBin() {
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

    public static getModuleOfFilePath(relFilepath: string): string {

        if (relFilepath[0] !== '/') {
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

    public static writeDebugFile(data: string) {
        const buffer = Buffer.from(data, 'utf8');
        const fileUri = vscode.Uri.parse(posix.join(VSCodeTools.getAbsoluteRootPath(), '.debug'));
        vscode.workspace.fs.writeFile(fileUri, buffer);
    }

	public static readLines(path: string) {
		const data = fs.readFileSync(path, 'UTF-8');
		const lines = data.split(/\r?\n/);
		return lines;
	}

	public static _getPathOfSelectedFzf() {
		return path.join(
			vscode.workspace.workspaceFolders[0].uri.path,
			'.selected'
		);
	}

    public static hasOdooManifest(): boolean {
		const manifestFilePath = path.join(
            vscode.workspace.workspaceFolders[0].uri.path,
            "MANIFEST"
            );

		if (!fs.existsSync(manifestFilePath)) {
			return false;
		}

        return true;
    }

}

export class VSCodeTools {
    public static getActiveRelativePath(filename: string=vscode.window.activeTextEditor.document.fileName): string {
        const folderUri = VSCodeTools.getAbsoluteRootPath();
        var relCurrentFilename = relative(folderUri, filename);
        return relCurrentFilename;

    }

	public static ensureTerminalExists(name: string): vscode.Terminal {

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

	public static editFile(path: string, lineNo: number) { 
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

    public static getActiveLine(): number {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("No folder or workspace opened.");
            return 0;
        }

        return vscode.window.activeTextEditor.selection.active.line;
    }

    public static getAbsoluteRootPath() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage("No folder or workspace opened.");
            return "";
        }
        const folderUri = vscode.workspace?.workspaceFolders[0]?.uri;
        return folderUri.path;

    }

}