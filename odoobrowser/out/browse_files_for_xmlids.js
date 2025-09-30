"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXmlIds = void 0;
const vscode = require("vscode");
const fs_1 = require("fs");
const xpath = require("xpath");
const xmldom_1 = require("xmldom");
class XmlId {
    constructor(name, filePath, lineNumber) {
        this.name = name;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
    }
}
async function getXmlIds() {
    //let workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(document.uri);
    const files = await vscode.workspace.findFiles("**/*.xml", null, 100);
    let result = [];
    for (let index in files) {
        const file = files[index];
        const datas = [];
        const content = await fs_1.promises.readFile(file.path, 'utf8');
        const doc = new xmldom_1.DOMParser().parseFromString(content);
        const nodes = xpath.select("//template | //record", doc);
        for (const i in nodes) {
            const node = nodes[i];
            result.push(new XmlId(node.toString(), vscode.workspace.asRelativePath(file.fsPath), 1));
        }
    }
    return result;
}
exports.getXmlIds = getXmlIds;
//# sourceMappingURL=browse_files_for_xmlids.js.map