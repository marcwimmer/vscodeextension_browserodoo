import * as vscode from 'vscode';
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'
import { VSCodeTools, Tools } from './tools';
import { exec } from 'child_process';

export class OdooBrowser {

    public static register(context: any) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoobrowser.goto',
                OdooBrowser.goto,
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoo_debugcommand.updateAstAll',
                OdooBrowser.updateAstAll,
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoo_debugcommand.updateAstCurrentFile',
                OdooBrowser.updateAstFile,
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoo_debugcommand.updateModuleFile',
                OdooBrowser.updateModuleFile,
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoobrowser.gotoInherited',
                OdooBrowser.gotoInherited,
            )
        );
        OdooBrowser.registerFzfGodo();
        OdooBrowser.registerDidSaveDocument();
    }

    private static registerFzfGodo() {
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
    }

    private static registerDidSaveDocument() {
        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            // update ast on change
            const filename = Tools.getActiveRelativePath(document.fileName);
            OdooBrowser._updateAst(filename);

            if (filename.indexOf('/i18n/') >= 0) {
                Tools.writeDebugFile("import_i18n:de_DE:" + filename);
            }
        });
    }

	private static _updateAst(filename: string) {

		const manifestFilePath = path.join(
            vscode.workspace.workspaceFolders[0].uri.path,
            "MANIFEST"
            );

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

    private static gotoInherited() {
        const lineNo = VSCodeTools.getActiveLine();
        const odooBin = Tools.getOdooFrameworkBin();
		let command = odooBin + " goto-inherited ";
        const filename =  Tools.getActiveRelativePath();
        command +=  ' --filepath ' + filename;
        command +=  ' --lineno ' + lineNo;

		exec(command, {cwd: vscode.workspace.workspaceFolders[0].uri.path}, (err: any, stdout: any, stderr: any) => {
			if (err) {
				vscode.window.showErrorMessage(err);
			} else {
                const result = stdout.trim().split("\n");
                const lastLine = result[result.length - 1];
                if (lastLine.indexOf("FILEPATH") < 0) {
                    return;
                }
                const filepath = lastLine.split(":")[1];
                const lineNo = Number(lastLine.split(":")[2]);

                VSCodeTools.editFile(filepath, lineNo);
			}
		});
    }

	private static updateAstAll() {
        // var relCurrentFilename = getActiveRelativePath();
        var odooBin = Tools.getOdooFrameworkBin();
        OdooBrowser._updateAst(null);
    }

	private static updateAstFile() {
        var relCurrentFilename = Tools.getActiveRelativePath();
        OdooBrowser._updateAst(relCurrentFilename);
    }

    private static goto() { 
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
    }

    private static  updateModuleFile() {
        var relCurrentFilename = Tools.getActiveRelativePath();
        let odooBin = Tools.getOdooFrameworkBin();
        let module = Tools.getModuleOfFilePath(relCurrentFilename);
        if (!module || !module.length) {
            return;
        }
        let command = odooBin + " update-module-file " + module;
        Tools.execCommand(command, "Update odoo module file of " + module);
    }
}