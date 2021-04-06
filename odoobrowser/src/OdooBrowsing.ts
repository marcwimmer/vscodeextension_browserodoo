import * as vscode from 'vscode';
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'
import * as path from 'path'; // In NodeJS: 'const fs = require('fs')'
import { VSCodeTools, Tools } from './tools';
import { exec } from 'child_process';

export class OdooBrowser {

    public static register(context: any) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'odoobrowser.newModule',
                OdooBrowser.newModule,
            )
        );
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
                    fs.unlinkSync(Tools._getPathOfSelectedFzf());
                    const fileLocation = data.split(":::")[1];
                    const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
                    const filePath = path.join(rootPath, fileLocation.split(":")[0]);
                    const lineNo = Number(fileLocation.split(":")[1]);
                    VSCodeTools.editFile(filePath, lineNo);
                }
            }
        });
    }

    private static registerDidSaveDocument() {
        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            // update ast on change
            if (!Tools.hasOdooManifest()) {
                return;
            }
            let filename = VSCodeTools.getActiveRelativePath(document.fileName);
            if (!filename) {
                return ;
            }
            if (filename.indexOf('/') === 0 || filename.startsWith('../')) {
                // absolute path from somewhere else
                return;
            }
            filename = filename.replace(/ /g, '\\ ');
            OdooBrowser._updateAst(filename);

            if (filename.indexOf('/i18n/') >= 0) {
                Tools.writeDebugFile("import_i18n:de_DE:" + filename);
            }
        });
    }

	private static _updateAst(filename: string) {

        if (!Tools.hasOdooManifest()) {
            return;
        }

		let odooBin = Tools.getOdooFrameworkBin();
		let command = odooBin + " update-ast ";
		if (filename && filename.length > 0) {
			command +=  ' --filename ' + filename;
		}

        let msg = "Finished updating AST";
        if (filename && filename.length) {
            msg = "";
        }
        Tools.execCommand(command, msg);
	}

    private static gotoInherited() {
        const lineNo = VSCodeTools.getActiveLine();
        const odooBin = Tools.getOdooFrameworkBin();
		let command = odooBin + " goto-inherited ";
        let filename =  VSCodeTools.getActiveRelativePath();
        filename = filename.replace(/ /g, '\\ ');
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
        var relCurrentFilename = VSCodeTools.getActiveRelativePath();
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
        terminal.show(false);
        // onDidCloseTerminal catches the exit event
    }

    private static  updateModuleFile() {
        var relCurrentFilename = VSCodeTools.getActiveRelativePath();
        let odooBin = Tools.getOdooFrameworkBin();
        let module = Tools.getModuleOfFilePath(relCurrentFilename);
        if (!module || !module.length) {
            return;
        }
        let command = odooBin + " update-module-file " + module;
        Tools.execCommand(command, "Update odoo module file of " + module);
    }

    private static newModule() {
        (async() => {

            await vscode.commands.executeCommand('copyFilePath');
            let folder = await vscode.env.clipboard.readText();  // returns a string
            if (!folder || !folder.length) {
                return;
            }
            if (!Tools.hasOdooManifest()) {
                vscode.window.showErrorMessage("No MANIFEST file found.");
                return;
            }
            const moduleName = await vscode.window.showInputBox({
                'ignoreFocusOut': true,
                'prompt': "Please enter a module name"
            });
            if (!moduleName) {
                return;
            }
            console.log(folder);
            let odooBin = Tools.getOdooFrameworkBin();
            let command = odooBin + " make-module  --name " + moduleName + " -p " + folder;


            Tools.execCommand(command, "Make new module: " + moduleName);

            // get current version
        })();
    }
}