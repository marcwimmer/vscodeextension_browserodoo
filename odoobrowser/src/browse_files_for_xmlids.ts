import * as vscode from 'vscode';
import { promises as fs } from "fs";
import * as xpath from 'xpath';
import { DOMParser } from 'xmldom';


class XmlId {
    name: string;
    filePath: string;
    lineNumber: number;
    constructor (name: string, filePath: string, lineNumber: number) {
        this.name = name;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
    }

}
type XmlIdArray = Array<XmlId>;

export async function getXmlIds(): Promise<XmlIdArray> {
    //let workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(document.uri);
    const files = await vscode.workspace.findFiles("**/*.xml", null, 100);

    let result = [];

    for (let index in files) {
        const file = files[index];
        const datas = [];
        const content = await fs.readFile(file.path, 'utf8');
        const doc = new DOMParser().parseFromString(content);
        const nodes = xpath.select("//template | //record", doc);
        for (const i in nodes) {
            const node = nodes[i];
            result.push(new XmlId(
                node.toString(),
                vscode.workspace.asRelativePath(file.fsPath),
                1
            ));            
        }
    }

    return result;
}