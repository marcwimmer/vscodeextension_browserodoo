import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import { dirname, posix, relative, basename } from 'path';

export class Tools {

    public static getExtensionRootFolder() {
        return vscode.extensions.getExtension('marc-christianwimmer.odoobrowser')?.extensionPath ?? "";
    }

    public static execCommand(cmd: string, msgOk: string) {
        var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
        exec(cmd, {cwd: workspaceFolder}, (err: any, stdout: any, stderr: any) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
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
            'out/preview_fzf.py'
        );
    }

    public static getBinFromPath(binName: string) {
        var paths = process.env['PATH'].split(":");
        for (var i = 0; i < paths.length; i += 1) {
            var searchPath = paths[i];
            var odooBin = searchPath + path.sep + 'odoo';
            if (fs.existsSync(odooBin)) {
                return odooBin;
            }

        }
        return null;
    }

    public static getOdooFrameworkBin() {
        const candidates = [
            "~/odoo/odoo",
            "/opt/odoo/odoo"
        ];
        
        // search search path otherwise
        var bin = Tools.getBinFromPath('odoo');
        if (bin) {
            return bin;
        }
        for (let candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        // search search path otherwise
        for (var searchpath in process.env['PATH'].split(":")) {
            var odooBin = searchpath + path.sep + 'odoo';
            if (fs.existsSync(odooBin)) {
                return odooBin;
            }
        }

        vscode.window.showErrorMessage("Odoo framework not found: " + candidates);
        throw new Error("Odoo framework not found.");
    }

    public static getModuleOfFilePath(relFilepath: string, returnPath: boolean=false): string {

        if (relFilepath[0] !== '/') {
            var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
            relFilepath = path.join(
                workspaceFolder,
                relFilepath,
            );

        }
        let current = relFilepath;
        while (true) {
            current = path.dirname(current);
            if (fs.existsSync(current + "/__manifest__.py") || fs.existsSync(current + "/__openerp__.py")) {
                if (returnPath) {
                    return current;
                }
                else {
                    return basename(current);
                }
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
        var workspaceFolder = VSCodeTools.getCurrentWorkspaceFolder();
		return path.join(
			workspaceFolder,
			'.selected'
		);
	}

    public static hasOdooManifest(workspaceFolder: string): boolean {
		const manifestFilePath = path.join(
            workspaceFolder,
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

    public static getActiveFileContent() {
		const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        return document.getText().trim();
    }

	public static editFile(path: string, lineNo: number) { 
		const uri = vscode.Uri.file(path);
		vscode.commands.executeCommand<vscode.TextDocumentShowOptions>("vscode.open", uri);

		const editor = vscode.window.activeTextEditor;
		const position = editor.selection.active;
		var newPosition = position.with(lineNo, 0);
		var newSelection = new vscode.Selection(newPosition, newPosition);
		editor.selection = newSelection;
		vscode.commands.executeCommand(
            'editor.action.goToLocations',
            uri,
            editor.selection.start,
            [
                new vscode.Range(newPosition, newPosition)

            ],
            'goto',
            "Not found",
		);
	}

    public static getActiveLine(): number {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("No folder or workspace opened.");
            return 0;
        }

        return vscode.window.activeTextEditor.selection.active.line;
    }

    public static getCurrentWorkspaceFolder() {
        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        var check = vscode.window.activeTextEditor.document.uri.path;
        while (!fs.existsSync(posix.join(check, 'MANIFEST'))) {
            check = dirname(check);
            if (check === '/') {
                return null;
            }
        }
        return check;
    }

    public static getAbsoluteRootPath() {
        var workspaceFolder = this.getCurrentWorkspaceFolder();
        if (workspaceFolder === null) {
            vscode.window.showInformationMessage("No workspace folder selected.");
            return "";
        }
        return workspaceFolder;
    }

}