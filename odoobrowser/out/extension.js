"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "odoobrowser" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const cmd_hello = vscode.commands.registerCommand('odoobrowser.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const panel = vscode.window.createWebviewPanel('catCoding', 'Cat Coding', vscode.ViewColumn.One, {});
        panel.title = "Odoo Browser";
        panel.webview.html = getWebviewContent("http://10.10.173.111:8620/xmlids");
        // And schedule updates to the content every second
        vscode.window.showInformationMessage('Hello World from OdooBrowser!');
    });
    const cmd_bye = vscode.commands.registerCommand('odoobrowser.byeWorld', () => {
        vscode.window.showInformationMessage('Good Bye from OdooBrowser!');
    });
    const cmd2 = vscode.commands.registerCommand('odoobrowser.command2', () => {
        vscode.window.showInformationMessage('cmd2');
    });
    context.subscriptions.push(cmd_hello, cmd_bye, cmd2);
}
exports.activate = activate;
function getWebviewContent(url) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
  </head>
  <script
  src="https://code.jquery.com/jquery-3.6.0.min.js"
  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
  crossorigin="anonymous"></script>
  <script>
  $(document).ready(function() {
	  $("span.test").test("HI");

  });
  })
  </script>
  <body>
	${url}
	<span class='test'></span>
  </body>
  </html>`;
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map