"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsers = exports.liquidHtmlAstFormat = exports.liquidHtmlLanguageName = void 0;
const parser_1 = require("../parser/parser");
Object.defineProperty(exports, "liquidHtmlAstFormat", { enumerable: true, get: function () { return parser_1.liquidHtmlAstFormat; } });
Object.defineProperty(exports, "liquidHtmlLanguageName", { enumerable: true, get: function () { return parser_1.liquidHtmlLanguageName; } });
__exportStar(require("../parser/ast"), exports);
exports.parsers = {
    [parser_1.liquidHtmlLanguageName]: parser_1.liquidHtmlParser,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFyc2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FLeUI7QUFJUSxvR0FOL0IsNEJBQW1CLE9BTStCO0FBQTNDLHVHQUxQLCtCQUFzQixPQUtPO0FBRi9CLCtDQUE2QjtBQUloQixRQUFBLE9BQU8sR0FBWTtJQUM5QixDQUFDLCtCQUFzQixDQUFDLEVBQUUseUJBQWdCO0NBQzNDLENBQUMifQ==