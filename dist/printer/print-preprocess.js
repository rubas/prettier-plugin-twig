"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const AST = __importStar(require("../parser/ast"));
const preprocess_1 = require("../printer/preprocess");
function preprocess(ast, options) {
    const augmentationPipeline = preprocess_1.AUGMENTATION_PIPELINE.map((fn) => fn.bind(null, options));
    for (const augmentation of augmentationPipeline) {
        AST.walk(ast, augmentation);
    }
    return ast;
}
exports.preprocess = preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtcHJlcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmludGVyL3ByaW50LXByZXByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGtEQUFvQztBQUVwQyxxREFBNkQ7QUFJN0QsU0FBZ0IsVUFBVSxDQUN4QixHQUFxQixFQUNyQixPQUE0QjtJQUU1QixNQUFNLG9CQUFvQixHQUFHLGtDQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQzVELEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUN2QixDQUFDO0lBRUYsS0FBSyxNQUFNLFlBQVksSUFBSSxvQkFBb0IsRUFBRTtRQUMvQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxZQUFtQixDQUFDLENBQUM7S0FDcEM7SUFFRCxPQUFPLEdBQW1CLENBQUM7QUFDN0IsQ0FBQztBQWJELGdDQWFDIn0=