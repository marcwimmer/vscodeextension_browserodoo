"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.deactivate = void 0;
const OdooBrowsing_1 = require("./OdooBrowsing");
const OdooDebugging_1 = require("./OdooDebugging");
function deactivate() { }
exports.deactivate = deactivate;
function activate(context) {
    OdooBrowsing_1.OdooBrowser.register(context);
    OdooDebugging_1.OdooDebugging.register(context);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map