"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTrimmingInnerRight = exports.isTrimmingInnerLeft = exports.isTrimmingOuterLeft = exports.isTrimmingOuterRight = exports.isParentNode = exports.isHtmlNode = exports.augmentWithWhitespaceHelpers = void 0;
const types_1 = require("../../types");
const constants_evaluate_1 = require("../../constants.evaluate");
const parser_1 = require("../../parser");
const utils_1 = require("../../printer/utils");
const augmentWithWhitespaceHelpers = (_options, node) => {
    if (node.cssDisplay === 'should not be relevant') {
        return;
    }
    const augmentations = {
        isDanglingWhitespaceSensitive: isDanglingWhitespaceSensitiveNode(node),
        isIndentationSensitive: isIndentationSensitiveNode(node),
        isWhitespaceSensitive: isWhitespaceSensitiveNode(node),
        isLeadingWhitespaceSensitive: isLeadingWhitespaceSensitiveNode(node) &&
            (!node.prev || isTrailingWhitespaceSensitiveNode(node.prev)),
        isTrailingWhitespaceSensitive: isTrailingWhitespaceSensitiveNode(node) &&
            (!node.next || isLeadingWhitespaceSensitiveNode(node.next)),
        hasLeadingWhitespace: hasLeadingWhitespace(node),
        hasTrailingWhitespace: hasTrailingWhitespace(node),
        hasDanglingWhitespace: hasDanglingWhitespace(node),
    };
    Object.assign(node, augmentations);
};
exports.augmentWithWhitespaceHelpers = augmentWithWhitespaceHelpers;
function isDanglingWhitespaceSensitiveNode(node) {
    return (isDanglingSpaceSensitiveCssDisplay(node.cssDisplay) &&
        !(0, utils_1.isScriptLikeTag)(node) &&
        !isTrimmingInnerLeft(node) &&
        !isTrimmingInnerRight(node));
}
function isWhitespaceSensitiveNode(node) {
    return (isIndentationSensitiveNode(node));
}
function isIndentationSensitiveNode(node) {
    return getNodeCssStyleWhiteSpace(node).startsWith('pre');
}
function isLeadingWhitespaceSensitiveNode(node) {
    if (!node) {
        return false;
    }
    if (isTrimmingOuterLeft(node)) {
        return false;
    }
    if (node.prev && isTrimmingOuterRight(node.prev)) {
        return false;
    }
    if (!node.parentNode || node.parentNode.cssDisplay === 'none') {
        return false;
    }
    if ((0, utils_1.isPreLikeNode)(node.parentNode)) {
        return true;
    }
    if ((0, utils_1.isScriptLikeTag)(node)) {
        return false;
    }
    if (!node.prev && (node.parentNode.type === types_1.NodeTypes.Document
        || (0, utils_1.isPreLikeNode)(node)
        || (0, utils_1.isScriptLikeTag)(node.parentNode)
        || !isInnerLeftSpaceSensitiveCssDisplay(node.parentNode.cssDisplay)
        || isTrimmingInnerLeft(node.parentNode))) {
        return false;
    }
    if (node.prev &&
        !isOuterRightWhitespaceSensitiveCssDisplay(node.prev.cssDisplay)) {
        return false;
    }
    if (!isOuterLeftWhitespaceSensitiveCssDisplay(node.cssDisplay)) {
        return false;
    }
    return true;
}
function isTrailingWhitespaceSensitiveNode(node) {
    if (isTrimmingOuterRight(node)) {
        return false;
    }
    if (node.next && isTrimmingOuterLeft(node.next)) {
        return false;
    }
    if (!node.parentNode || node.parentNode.cssDisplay === 'none') {
        return false;
    }
    if ((0, utils_1.isPreLikeNode)(node.parentNode)) {
        return true;
    }
    if ((0, utils_1.isScriptLikeTag)(node)) {
        return false;
    }
    if (isHtmlNode(node) && typeof node.name === 'string' && node.name === 'br') {
        return false;
    }
    if (!node.next && (node.parentNode.type === types_1.NodeTypes.Document
        || (0, utils_1.isPreLikeNode)(node)
        || (0, utils_1.isScriptLikeTag)(node.parentNode)
        || !isInnerRightWhitespaceSensitiveCssDisplay(node.parentNode.cssDisplay)
        || isTrimmingInnerRight(node.parentNode)
        || (0, utils_1.isAttributeNode)(node))) {
        return false;
    }
    if (node.next &&
        !isOuterLeftWhitespaceSensitiveCssDisplay(node.next.cssDisplay)) {
        return false;
    }
    if (!isOuterRightWhitespaceSensitiveCssDisplay(node.cssDisplay)) {
        return false;
    }
    return true;
}
function hasDanglingWhitespace(node) {
    if (!isParentNode(node)) {
        return false;
    }
    else if (node.type === types_1.NodeTypes.Document) {
        return node.children.length === 0 && node.source.length > 0;
    }
    else if (!node.children) {
        return false;
    }
    else if (node.type === types_1.NodeTypes.LiquidTag &&
        (0, parser_1.isBranchedTag)(node) &&
        node.children.length === 1) {
        return hasDanglingWhitespace(node.firstChild);
    }
    else if (node.children.length > 0) {
        return false;
    }
    return (0, utils_1.isWhitespace)(node.source, node.blockStartPosition.end);
}
function hasLeadingWhitespace(node) {
    if (node.type === types_1.NodeTypes.LiquidBranch && !node.prev) {
        return node.firstChild
            ? hasLeadingWhitespace(node.firstChild)
            : hasDanglingWhitespace(node);
    }
    return (0, utils_1.isWhitespace)(node.source, node.position.start - 1);
}
function hasTrailingWhitespace(node) {
    if (node.type === types_1.NodeTypes.LiquidBranch) {
        return node.lastChild
            ? hasTrailingWhitespace(node.lastChild)
            : hasDanglingWhitespace(node);
    }
    return (0, utils_1.isWhitespace)(node.source, node.position.end);
}
function isHtmlNode(node) {
    return types_1.HtmlNodeTypes.includes(node.type);
}
exports.isHtmlNode = isHtmlNode;
function isParentNode(node) {
    return 'children' in node;
}
exports.isParentNode = isParentNode;
function isTrimmingOuterRight(node) {
    var _a;
    if (!node)
        return false;
    switch (node.type) {
        case types_1.NodeTypes.LiquidRawTag:
        case types_1.NodeTypes.LiquidTag:
            return ((_a = node.delimiterWhitespaceEnd) !== null && _a !== void 0 ? _a : node.whitespaceEnd) === '-';
        case types_1.NodeTypes.LiquidBranch:
            return false;
        case types_1.NodeTypes.LiquidDrop:
            return node.whitespaceEnd === '-';
        default:
            return false;
    }
}
exports.isTrimmingOuterRight = isTrimmingOuterRight;
function isTrimmingOuterLeft(node) {
    if (!node)
        return false;
    switch (node.type) {
        case types_1.NodeTypes.LiquidRawTag:
        case types_1.NodeTypes.LiquidTag:
        case types_1.NodeTypes.LiquidBranch:
        case types_1.NodeTypes.LiquidDrop:
            return node.whitespaceStart === '-';
        default:
            return false;
    }
}
exports.isTrimmingOuterLeft = isTrimmingOuterLeft;
function isTrimmingInnerLeft(node) {
    if (!node)
        return false;
    switch (node.type) {
        case types_1.NodeTypes.LiquidRawTag:
        case types_1.NodeTypes.LiquidTag:
            if (node.delimiterWhitespaceEnd === undefined)
                return false;
            return node.whitespaceEnd === '-';
        case types_1.NodeTypes.LiquidBranch:
            if (!node.parentNode || node.parentNode.type !== types_1.NodeTypes.LiquidTag) {
                return false;
            }
            if (!node.prev) {
                return isTrimmingInnerLeft(node.parentNode);
            }
            return node.whitespaceEnd === '-';
        case types_1.NodeTypes.LiquidDrop:
        default:
            return false;
    }
}
exports.isTrimmingInnerLeft = isTrimmingInnerLeft;
function isTrimmingInnerRight(node) {
    if (!node)
        return false;
    switch (node.type) {
        case types_1.NodeTypes.LiquidRawTag:
        case types_1.NodeTypes.LiquidTag:
            if (node.delimiterWhitespaceStart === undefined)
                return false;
            return node.delimiterWhitespaceStart === '-';
        case types_1.NodeTypes.LiquidBranch:
            if (!node.parentNode || node.parentNode.type !== types_1.NodeTypes.LiquidTag) {
                return false;
            }
            if (!node.next) {
                return isTrimmingInnerRight(node.parentNode);
            }
            return isTrimmingOuterLeft(node.next);
        case types_1.NodeTypes.LiquidDrop:
        default:
            return false;
    }
}
exports.isTrimmingInnerRight = isTrimmingInnerRight;
function isBlockLikeCssDisplay(cssDisplay) {
    return (cssDisplay === 'block' ||
        cssDisplay === 'list-item' ||
        cssDisplay.startsWith('table'));
}
function isInnerLeftSpaceSensitiveCssDisplay(cssDisplay) {
    return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== 'inline-block';
}
function isInnerRightWhitespaceSensitiveCssDisplay(cssDisplay) {
    return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== 'inline-block';
}
function isOuterLeftWhitespaceSensitiveCssDisplay(cssDisplay) {
    return !isBlockLikeCssDisplay(cssDisplay);
}
function isOuterRightWhitespaceSensitiveCssDisplay(cssDisplay) {
    return !isBlockLikeCssDisplay(cssDisplay);
}
function isDanglingSpaceSensitiveCssDisplay(cssDisplay) {
    return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== 'inline-block';
}
function getNodeCssStyleWhiteSpace(node) {
    return ((isHtmlNode(node) &&
        typeof node.name === 'string' &&
        constants_evaluate_1.CSS_WHITE_SPACE_TAGS[node.name]) ||
        constants_evaluate_1.CSS_WHITE_SPACE_DEFAULT);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVnbWVudC13aXRoLXdoaXRlc3BhY2UtaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcmludGVyL3ByZXByb2Nlc3MvYXVnbWVudC13aXRoLXdoaXRlc3BhY2UtaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBK0Q7QUFDL0QsNkRBRzhCO0FBUzlCLHFDQUF5QztBQUN6QywyQ0FLeUI7QUFRbEIsTUFBTSw0QkFBNEIsR0FBbUMsQ0FDMUUsUUFBUSxFQUNSLElBQUksRUFDSixFQUFFO0lBQ0YsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLHdCQUF3QixFQUFFO1FBQ2hELE9BQU87S0FDUjtJQUNELE1BQU0sYUFBYSxHQUEwQjtRQUMzQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQyxJQUFJLENBQUM7UUFDdEUsc0JBQXNCLEVBQUUsMEJBQTBCLENBQUMsSUFBSSxDQUFDO1FBQ3hELHFCQUFxQixFQUFFLHlCQUF5QixDQUFDLElBQUksQ0FBQztRQUV0RCw0QkFBNEIsRUFDMUIsZ0NBQWdDLENBQUMsSUFBSSxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5RCw2QkFBNkIsRUFDM0IsaUNBQWlDLENBQUMsSUFBSSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RCxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7UUFDaEQscUJBQXFCLEVBQUUscUJBQXFCLENBQUMsSUFBSSxDQUFDO1FBQ2xELHFCQUFxQixFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQztLQUNuRCxDQUFDO0lBRUYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDckMs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