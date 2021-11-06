"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function getXmlIds() {
    return __awaiter(this, void 0, void 0, function* () {
        //let workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(document.uri);
        const files = yield vscode.workspace.findFiles("**/*.xml", null, 100);
        let result = [];
        for (let index in files) {
            const file = files[index];
            const datas = [];
            const content = yield fs_1.promises.readFile(file.path, 'utf8');
            const doc = new xmldom_1.DOMParser().parseFromString(content);
            const nodes = xpath.select("//template | //record", doc);
            for (const i in nodes) {
                const node = nodes[i];
                result.push(new XmlId(node.toString(), vscode.workspace.asRelativePath(file.fsPath), 1));
            }
        }
        return result;
    });
}
exports.getXmlIds = getXmlIds;
//# sourceMappingURL=browse_files_for_xmlids.js.map