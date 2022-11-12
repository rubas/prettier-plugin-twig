"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.augmentWithCSSProperties = void 0;
const constants_evaluate_1 = require("../../constants.evaluate");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
function getCssDisplay(node, options) {
    if (node.prev && node.prev.type === types_1.NodeTypes.HtmlComment) {
        const match = node.prev.body.match(/^\s*display:\s*([a-z]+)\s*$/);
        if (match) {
            return match[1];
        }
    }
    switch (node.type) {
        case types_1.NodeTypes.HtmlElement:
        case types_1.NodeTypes.HtmlVoidElement:
        case types_1.NodeTypes.HtmlSelfClosingElement:
        case types_1.NodeTypes.HtmlRawNode: {
            switch (options.htmlWhitespaceSensitivity) {
                case 'strict':
                    return 'inline';
                case 'ignore':
                    return 'block';
                default: {
                    return ((typeof node.name === 'string' && constants_evaluate_1.CSS_DISPLAY_TAGS[node.name]) ||
                        constants_evaluate_1.CSS_DISPLAY_DEFAULT);
                }
            }
        }
        case types_1.NodeTypes.RawMarkup:
        case types_1.NodeTypes.TextNode:
            return 'inline';
        case types_1.NodeTypes.LiquidTag:
        case types_1.NodeTypes.LiquidRawTag:
            switch (options.htmlWhitespaceSensitivity) {
                case 'strict':
                    return 'inline';
                case 'ignore':
                    return 'block';
                default: {
                    return (constants_evaluate_1.CSS_DISPLAY_LIQUID_TAGS[node.name] || constants_evaluate_1.CSS_DISPLAY_LIQUID_DEFAULT);
                }
            }
        case types_1.NodeTypes.LiquidBranch:
        case types_1.NodeTypes.LiquidDrop:
            return 'inline';
        case types_1.NodeTypes.AttrDoubleQuoted:
        case types_1.NodeTypes.AttrSingleQuoted:
        case types_1.NodeTypes.AttrUnquoted:
        case types_1.NodeTypes.AttrEmpty:
            return 'inline';
        case types_1.NodeTypes.HtmlDoctype:
        case types_1.NodeTypes.HtmlComment:
            return 'block';
        case types_1.NodeTypes.Document:
            return 'block';
        case types_1.NodeTypes.YAMLFrontmatter:
            return 'block';
        case types_1.NodeTypes.LiquidVariable:
        case types_1.NodeTypes.LiquidFilter:
        case types_1.NodeTypes.NamedArgument:
        case types_1.NodeTypes.LiquidLiteral:
        case types_1.NodeTypes.String:
        case types_1.NodeTypes.Number:
        case types_1.NodeTypes.Range:
        case types_1.NodeTypes.VariableLookup:
        case types_1.NodeTypes.AssignMarkup:
        case types_1.NodeTypes.CycleMarkup:
        case types_1.NodeTypes.ForMarkup:
        case types_1.NodeTypes.PaginateMarkup:
        case types_1.NodeTypes.RenderMarkup:
        case types_1.NodeTypes.RenderVariableExpression:
        case types_1.NodeTypes.LogicalExpression:
        case types_1.NodeTypes.Comparison:
            return 'should not be relevant';
        default:
            return (0, utils_1.assertNever)(node);
    }
}
function getNodeCssStyleWhiteSpace(node) {
    switch (node.type) {
        case types_1.NodeTypes.HtmlElement:
        case types_1.NodeTypes.HtmlVoidElement:
        case types_1.NodeTypes.HtmlSelfClosingElement:
        case types_1.NodeTypes.HtmlRawNode: {
            return ((typeof node.name === 'string' && constants_evaluate_1.CSS_WHITE_SPACE_TAGS[node.name]) ||
                constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT);
        }
        case types_1.NodeTypes.TextNode:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.RawMarkup:
        case types_1.NodeTypes.YAMLFrontmatter:
        case types_1.NodeTypes.LiquidRawTag:
            return 'pre';
        case types_1.NodeTypes.LiquidTag:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.LiquidBranch:
        case types_1.NodeTypes.LiquidDrop:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.AttrDoubleQuoted:
        case types_1.NodeTypes.AttrSingleQuoted:
        case types_1.NodeTypes.AttrUnquoted:
        case types_1.NodeTypes.AttrEmpty:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.HtmlDoctype:
        case types_1.NodeTypes.HtmlComment:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.Document:
            return constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT;
        case types_1.NodeTypes.LiquidVariable:
        case types_1.NodeTypes.LiquidFilter:
        case types_1.NodeTypes.NamedArgument:
        case types_1.NodeTypes.LiquidLiteral:
        case types_1.NodeTypes.String:
        case types_1.NodeTypes.Number:
        case types_1.NodeTypes.Range:
        case types_1.NodeTypes.VariableLookup:
        case types_1.NodeTypes.AssignMarkup:
        case types_1.NodeTypes.CycleMarkup:
        case types_1.NodeTypes.ForMarkup:
        case types_1.NodeTypes.PaginateMarkup:
        case types_1.NodeTypes.RenderMarkup:
        case types_1.NodeTypes.RenderVariableExpression:
        case types_1.NodeTypes.LogicalExpression:
        case types_1.NodeTypes.Comparison:
            return 'should not be relevant';
        default:
            return (0, utils_1.assertNever)(node);
    }
}
const augmentWithCSSProperties = (options, node) => {
    const augmentations = {
        cssDisplay: getCssDisplay(node, options),
        cssWhitespace: getNodeCssStyleWhiteSpace(node),
    };
    Object.assign(node, augmentations);
};
exports.augmentWithCSSProperties = augmentWithCSSProperties;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVnbWVudC13aXRoLWNzcy1wcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3ByaW50ZXIvcHJlcHJvY2Vzcy9hdWdtZW50LXdpdGgtY3NzLXByb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBTzhCO0FBQzlCLG1DQU9pQjtBQUNqQixtQ0FBc0M7QUFFdEMsU0FBUyxhQUFhLENBQ3BCLElBQWlDLEVBQ2pDLE9BQTRCO0lBRTVCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFdBQVcsRUFBRTtRQUV6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUNsRSxJQUFJLEtBQUssRUFBRTtZQUNULE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0tBQ0Y7SUFFRCxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDakIsS0FBSyxpQkFBUyxDQUFDLFdBQVcsQ0FBQztRQUMzQixLQUFLLGlCQUFTLENBQUMsZUFBZSxDQUFDO1FBQy9CLEtBQUssaUJBQVMsQ0FBQyxzQkFBc0IsQ0FBQztRQUN0QyxLQUFLLGlCQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUIsUUFBUSxPQUFPLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3pDLEtBQUssUUFBUTtvQkFDWCxPQUFPLFFBQVEsQ0FBQztnQkFDbEIsS0FBSyxRQUFRO29CQUNYLE9BQU8sT0FBTyxDQUFDO2dCQUNqQixPQUFPLENBQUMsQ0FBQztvQkFDUCxPQUFPLENBQ0wsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLHFDQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDOUQsd0NBQW1CLENBQ3BCLENBQUM7aUJBQ0g7YUFD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