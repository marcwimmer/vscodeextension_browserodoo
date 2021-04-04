import * as vscode from 'vscode';
import { VSCodeTools, Tools } from './tools';

export class OdooDebugging {
    public static register(context: any) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "odoo_debugcommand.restart", 
                OdooDebugging.restart
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "odoo_debugcommand.updateModule", 
                OdooDebugging.updateModule
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "odoo_debugcommand.updateView", 
                OdooDebugging.updateView
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "odoo_debugcommand.runUnittest", 
                OdooDebugging.runUnittest
            )
        );
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "odoo_debugcommand.exportI18n", 
                OdooDebugging.exportI18n
            )
        );
    }

	private static updateModule() {
        const relCurrentFilename = VSCodeTools.getActiveRelativePath();
        const module = Tools.getModuleOfFilePath(relCurrentFilename);
        Tools.writeDebugFile("update_module:" + module);
    }

    private static restart() {
        var relCurrentFilename = VSCodeTools.getActiveRelativePath();
        Tools.writeDebugFile("restart");
    }

	private static exportI18n() {
        const relCurrentFilename = VSCodeTools.getActiveRelativePath();
        const module = Tools.getModuleOfFilePath(relCurrentFilename);
        Tools.writeDebugFile("export_i18n:de_DE:" + module);
    }

	private static runUnittest() {
        var relCurrentFilename = VSCodeTools.getActiveRelativePath();
        Tools.writeDebugFile("unit_test:" + relCurrentFilename);
    }

	private static updateView() {
        var relCurrentFilename = VSCodeTools.getActiveRelativePath();
        let lineno = VSCodeTools.getActiveLine();
        Tools.writeDebugFile("update_view_in_db:" + relCurrentFilename + ":" + String(lineno));
    }
}