"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastDescendant = exports.hasMeaningfulLackOfDanglingWhitespace = exports.hasMeaningfulLackOfTrailingWhitespace = exports.hasMeaningfulLackOfLeadingWhitespace = exports.preferHardlineAsTrailingSpaces = exports.preferHardlineAsLeadingSpaces = exports.preferHardlineAsSurroundingSpaces = exports.forceBreakChildren = exports.forceBreakContent = exports.forceNextEmptyLine = exports.hasPrettierIgnore = exports.isPrettierIgnoreNode = exports.isPrettierIgnoreLiquidNode = exports.isPrettierIgnoreHtmlNode = exports.shouldPreserveContent = exports.hasNonTextChild = exports.isAttributeNode = exports.isHtmlNode = exports.isMultilineLiquidTag = exports.isLiquidNode = exports.isTextLikeNode = exports.isHtmlElement = exports.isVoidElement = exports.isSelfClosing = exports.isHtmlComment = exports.hasNoCloseMarker = exports.isPreLikeNode = exports.isScriptLikeTag = void 0;
const types_1 = require("../../types");
const array_1 = require("../../printer/utils/array");
function isScriptLikeTag(node) {
    return node.type === types_1.NodeTypes.HtmlRawNode;
}
exports.isScriptLikeTag = isScriptLikeTag;
function isPreLikeNode(node) {
    return node.cssWhitespace.startsWith('pre');
}
exports.isPreLikeNode = isPreLikeNode;
function hasNoCloseMarker(node) {
    return isSelfClosing(node) || isVoidElement(node) || isHtmlComment(node);
}
exports.hasNoCloseMarker = hasNoCloseMarker;
function isHtmlComment(node) {
    return node.type === types_1.NodeTypes.HtmlComment;
}
exports.isHtmlComment = isHtmlComment;
function isSelfClosing(node) {
    return node.type === types_1.NodeTypes.HtmlSelfClosingElement;
}
exports.isSelfClosing = isSelfClosing;
function isVoidElement(node) {
    return node.type === types_1.NodeTypes.HtmlVoidElement;
}
exports.isVoidElement = isVoidElement;
function isHtmlElement(node) {
    return node.type === types_1.NodeTypes.HtmlElement;
}
exports.isHtmlElement = isHtmlElement;
function isTextLikeNode(node) {
    return !!node && node.type === types_1.NodeTypes.TextNode;
}
exports.isTextLikeNode = isTextLikeNode;
function isLiquidNode(node) {
    return !!node && types_1.LiquidNodeTypes.includes(node.type);
}
exports.isLiquidNode = isLiquidNode;
function isMultilineLiquidTag(node) {
    return (!!node &&
        node.type === types_1.NodeTypes.LiquidTag &&
        !!node.children &&
        !(0, array_1.isEmpty)(node.children));
}
exports.isMultilineLiquidTag = isMultilineLiquidTag;
function isHtmlNode(node) {
    return !!node && types_1.HtmlNodeTypes.includes(node.type);
}
exports.isHtmlNode = isHtmlNode;
function isAttributeNode(node) {
    return (isHtmlNode(node.parentNode) &&
        node.parentNode.attributes.indexOf(node) !== -1);
}
exports.isAttributeNode = isAttributeNode;
function hasNonTextChild(node) {
    return (node.children &&
        node.children.some((child) => child.type !== types_1.NodeTypes.TextNode));
}
exports.hasNonTextChild = hasNonTextChild;
function shouldPreserveContent(node, _options) {
    if (isPreLikeNode(node) &&
        node.children &&
        node.children.some((child) => !isTextLikeNode(child))) {
        return true;
    }
    return false;
}
exports.shouldPreserveContent = shouldPreserveContent;
function isPrettierIgnoreHtmlNode(node) {
    return (!!node &&
        node.type === types_1.NodeTypes.HtmlComment &&
        /^\s*prettier-ignore/m.test(node.body));
}
exports.isPrettierIgnoreHtmlNode = isPrettierIgnoreHtmlNode;
function isPrettierIgnoreLiquidNode(node) {
    return (!!node &&
        node.type === types_1.NodeTypes.LiquidTag &&
        node.name === '#' &&
        /^\s*prettier-ignore/m.test(node.markup));
}
exports.isPrettierIgnoreLiquidNode = isPrettierIgnoreLiquidNode;
function isPrettierIgnoreNode(node) {
    return isPrettierIgnoreLiquidNode(node) || isPrettierIgnoreHtmlNode(node);
}
exports.isPrettierIgnoreNode = isPrettierIgnoreNode;
function hasPrettierIgnore(node) {
    return isPrettierIgnoreNode(node) || isPrettierIgnoreNode(node.prev);
}
exports.hasPrettierIgnore = hasPrettierIgnore;
function forceNextEmptyLine(node) {
    if (!node)
        return false;
    if (!node.next)
        return false;
    const source = node.source;
    let tmp;
    tmp = source.indexOf('\n', node.position.end);
    if (tmp === -1)
        return false;
    tmp = source.indexOf('\n', tmp + 1);
    if (tmp === -1)
        return false;
    return tmp < node.next.position.start;
}
exports.forceNextEmptyLine = forceNextEmptyLine;
function forceBreakContent(node) {
    return (forceBreakChildren(node) ||
        (node.type === types_1.NodeTypes.HtmlElement &&
            node.children.length > 0 &&
            typeof node.name === 'string' &&
            (['body', 'script', 'style'].includes(node.name) ||
                node.children.some((child) => hasNonTextChild(child)))) ||
        (node.firstChild &&
            node.firstChild === node.lastChild &&
            node.firstChild.type !== types_1.NodeTypes.TextNode &&
            hasLeadingLineBreak(node.firstChild) &&
            (!node.lastChild.isTrailingWhitespaceSensitive ||
                hasTrailingLineBreak(node.lastChild))));
}
exports.forceBreakContent = forceBreakContent;
function forceBreakChildren(node) {
    return (node.type === types_1.NodeTypes.HtmlElement &&
        node.children.length > 0 &&
        typeof node.name === 'string' &&
        (['html', 'head', 'ul', 'ol', 'select'].includes(node.name) ||
            (node.cssDisplay.startsWith('table') && node.cssDisplay !== 'table-cell')));
}
exports.forceBreakChildren = forceBreakChildren;
function preferHardlineAsSurroundingSpaces(node) {
    switch (node.type) {
        case types_1.NodeTypes.HtmlComment:
            return true;
        case types_1.NodeTypes.HtmlElement:
            return (typeof node.name === 'string' &&
                ['script', 'select'].includes(node.name));
        case types_1.NodeTypes.LiquidTag:
            if ((node.prev && isTextLikeNode(node.prev)) ||
                (node.next && isTextLikeNode(node.next))) {
                return false;
            }
            return node.children && node.children.length > 0;
    }
    return false;
}
exports.preferHardlineAsSurroundingSpaces = preferHardlineAsSurroundingSpaces;
function preferHardlineAsLeadingSpaces(node) {
    return (preferHardlineAsSurroundingSpaces(node) ||
        (isLiquidNode(node) && node.prev && isLiquidNode(node.prev)) ||
        (node.prev && preferHardlineAsTrailingSpaces(node.prev)) ||
        hasSurroundingLineBreak(node));
}
exports.preferHardlineAsLeadingSpaces = preferHardlineAsLeadingSpaces;
function preferHardlineAsTrailingSpaces(node) {
    return (preferHardlineAsSurroundingSpaces(node) ||
        (isLiquidNode(node) &&
            node.next &&
            (isLiquidNode(node.next) || isHtmlNode(node.next))) ||
        (node.type === types_1.NodeTypes.HtmlElement && node.name === 'br') ||
        hasSurroundingLineBreak(node));
}
exports.preferHardlineAsTrailingSpaces = preferHardlineAsTrailingSpaces;
function hasMeaningfulLackOfLeadingWhitespace(node) {
    return node.isLeadingWhitespaceSensitive && !node.hasLeadingWhitespace;
}
exports.hasMeaningfulLackOfLeadingWhitespace = hasMeaningfulLackOfLeadingWhitespace;
function hasMeaningfulLackOfTrailingWhitespace(node) {
    return node.isTrailingWhitespaceSensitive && !node.hasTrailingWhitespace;
}
exports.hasMeaningfulLackOfTrailingWhitespace = hasMeaningfulLackOfTrailingWhitespace;
function hasMeaningfulLackOfDanglingWhitespace(node) {
    return node.isDanglingWhitespaceSensitive && !node.hasDanglingWhitespace;
}
exports.hasMeaningfulLackOfDanglingWhitespace = hasMeaningfulLackOfDanglingWhitespace;
function hasSurroundingLineBreak(node) {
    return hasLeadingLineBreak(node) && hasTrailingLineBreak(node);
}
function hasLeadingLineBreak(node) {
    if (node.type === types_1.NodeTypes.Document)
        return false;
    return (node.hasLeadingWhitespace &&
        hasLineBreakInRange(node.source, node.prev
            ? node.prev.position.end
            : node.parentNode.blockStartPosition
                ? node.parentNode.blockStartPosition.end
                : node.parentNode.position.start, node.position.start));
}
function hasTrailingLineBreak(node) {
    if (node.type === types_1.NodeTypes.Document)
        return false;
    return (node.hasTrailingWhitespace &&
        hasLineBreakInRange(node.source, node.position.end, node.next
            ? node.next.position.start
            : node.parentNode.blockEndPosition
                ? node.parentNode.blockEndPosition.start
                : node.parentNode.position.end));
}
function hasLineBreakInRange(source, start, end) {
    const index = source.indexOf('\n', start);
    return index !== -1 && index < end;
}
function getLastDescendant(node) {
    return node.lastChild ? getLastDescendant(node.lastChild) : node;
}
exports.getLastDescendant = getLastDescendant;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcmludGVyL3V0aWxzL25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBZWlCO0FBQ2pCLGlEQUFnRDtBQUVoRCxTQUFnQixlQUFlLENBQUMsSUFBeUI7SUFDdkQsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLGlCQUFTLENBQUMsV0FBVyxDQUFDO0FBQzdDLENBQUM7QUFGRCwwQ0FFQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUErQjtJQUMzRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFGRCxzQ0FFQztBQUlELFNBQWdCLGdCQUFnQixDQUM5QixJQUFvQjtJQUVwQixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFKRCw0Q0FJQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFvQjtJQUNoRCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxXQUFXLENBQUM7QUFDN0MsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUMzQixJQUFvQjtJQUVwQixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxzQkFBc0IsQ0FBQztBQUN4RCxDQUFDO0FBSkQsc0NBSUM7QUFFRCxTQUFnQixhQUFhLENBQUMsSUFBb0I7SUFDaEQsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLGlCQUFTLENBQUMsZUFBZSxDQUFDO0FBQ2pELENBQUM7QUFGRCxzQ0FFQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFvQjtJQUNoRCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxXQUFXLENBQUM7QUFDN0MsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsY0FBYyxDQUM1QixJQUFnQztJQUVoQyxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFFBQVEsQ0FBQztBQUNwRCxDQUFDO0FBSkQsd0NBSUM7QUFFRCxTQUFnQixZQUFZLENBQzFCLElBQWdDO0lBRWhDLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSx1QkFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBVyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUpELG9DQUlDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQ2xDLElBQWdDO0lBRWhDLE9BQU8sQ0FDTCxDQUFDLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxTQUFTO1FBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUTtRQUNmLENBQUMsSUFBQSxlQUFPLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUN4QixDQUFDO0FBQ0osQ0FBQztBQVRELG9EQVNDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQWdDO0lBQ3pELE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBVyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBZ0IsZUFBZSxDQUM3QixJQUFvQjtJQUVwQixPQUFPLENBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDakUsQ0FBQztBQUNKLENBQUM7QUFQRCwwQ0FPQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxJQUFvQjtJQUNsRCxPQUFPLENBQ0osSUFBWSxDQUFDLFFBQVE7UUFDckIsSUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ3pCLENBQUMsS0FBcUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFFBQVEsQ0FDN0QsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQVBELDBDQU9DO0FBRUQsU0FBZ0IscUJBQXFCLENBQ25DLElBQW9CLEVBQ3BCLFFBQTZCO0lBb0I3QixJQUNFLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUFDbEIsSUFBWSxDQUFDLFFBQVE7UUFDckIsSUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ25FO1FBQ0EsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQS9CRCxzREErQkM7QUFFRCxTQUFnQix3QkFBd0IsQ0FDdEMsSUFBZ0M7SUFFaEMsT0FBTyxDQUNMLENBQUMsQ0FBQyxJQUFJO1FBQ04sSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFdBQVc7UUFDbkMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDdkMsQ0FBQztBQUNKLENBQUM7QUFSRCw0REFRQztBQUVELFNBQWdCLDBCQUEwQixDQUN4QyxJQUFnQztJQUVoQyxPQUFPLENBQ0wsQ0FBQyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsSUFBSSxLQUFLLGlCQUFTLENBQUMsU0FBUztRQUNqQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUc7UUFDakIsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDekMsQ0FBQztBQUNKLENBQUM7QUFURCxnRUFTQztBQUVELFNBQWdCLG9CQUFvQixDQUNsQyxJQUFnQztJQUVoQyxPQUFPLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFKRCxvREFJQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQW9CO0lBQ3BELE9BQU8sb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFGRCw4Q0FFQztBQUVELFNBQWdCLGtCQUFrQixDQUFDLElBQWdDO0lBQ2pFLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUczQixJQUFJLEdBQVcsQ0FBQztJQUNoQixHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUM3QixHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzdCLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztBQUN4QyxDQUFDO0FBWkQsZ0RBWUM7QUFHRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFvQjtJQUNwRCxPQUFPLENBQ0wsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1FBQ3hCLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFdBQVc7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtZQUM3QixDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUNkLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLFNBQVM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxRQUFRO1lBQzNDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDcEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCO2dCQUM1QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUMzQyxDQUFDO0FBQ0osQ0FBQztBQWZELDhDQWVDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsSUFBb0I7SUFDckQsT0FBTyxDQUNMLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxXQUFXO1FBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVE7UUFDN0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN6RCxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FDN0UsQ0FBQztBQUNKLENBQUM7QUFSRCxnREFRQztBQUVELFNBQWdCLGlDQUFpQyxDQUFDLElBQW9CO0lBQ3BFLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUVqQixLQUFLLGlCQUFTLENBQUMsV0FBVztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNkLEtBQUssaUJBQVMsQ0FBQyxXQUFXO1lBQ3hCLE9BQU8sQ0FDTCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtnQkFDN0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQztRQUNKLEtBQUssaUJBQVMsQ0FBQyxTQUFTO1lBQ3RCLElBQ0UsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ3hDO2dCQUNBLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBckJELDhFQXFCQztBQUVELFNBQWdCLDZCQUE2QixDQUFDLElBQW9CO0lBQ2hFLE9BQU8sQ0FDTCxpQ0FBaUMsQ0FBQyxJQUFJLENBQUM7UUFDdkMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQzlCLENBQUM7QUFDSixDQUFDO0FBUEQsc0VBT0M7QUFFRCxTQUFnQiw4QkFBOEIsQ0FBQyxJQUFvQjtJQUNqRSxPQUFPLENBQ0wsaUNBQWlDLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSTtZQUNULENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGlCQUFTLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO1FBQzNELHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUM5QixDQUFDO0FBQ0osQ0FBQztBQVRELHdFQVNDO0FBRUQsU0FBZ0Isb0NBQW9DLENBQ2xELElBQW9CO0lBRXBCLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0FBQ3pFLENBQUM7QUFKRCxvRkFJQztBQUVELFNBQWdCLHFDQUFxQyxDQUNuRCxJQUFvQjtJQUVwQixPQUFPLElBQUksQ0FBQyw2QkFBNkIsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztBQUMzRSxDQUFDO0FBSkQsc0ZBSUM7QUFFRCxTQUFnQixxQ0FBcUMsQ0FDbkQsSUFBb0I7SUFFcEIsT0FBTyxJQUFJLENBQUMsNkJBQTZCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7QUFDM0UsQ0FBQztBQUpELHNGQUlDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxJQUFvQjtJQUNuRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLElBQW9CO0lBQy9DLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFFBQVE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUVuRCxPQUFPLENBQ0wsSUFBSSxDQUFDLG9CQUFvQjtRQUN6QixtQkFBbUIsQ0FDakIsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsSUFBSTtZQUNQLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lBQ3hCLENBQUMsQ0FBRSxJQUFJLENBQUMsVUFBa0IsQ0FBQyxrQkFBa0I7Z0JBQzdDLENBQUMsQ0FBRSxJQUFJLENBQUMsVUFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHO2dCQUNqRCxDQUFDLENBQUUsSUFBSSxDQUFDLFVBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3BCLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQW9CO0lBQ2hELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFFBQVE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUNuRCxPQUFPLENBQ0wsSUFBSSxDQUFDLHFCQUFxQjtRQUMxQixtQkFBbUIsQ0FDakIsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFDakIsSUFBSSxDQUFDLElBQUk7WUFDUCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztZQUMxQixDQUFDLENBQUUsSUFBSSxDQUFDLFVBQWtCLENBQUMsZ0JBQWdCO2dCQUMzQyxDQUFDLENBQUUsSUFBSSxDQUFDLFVBQWtCLENBQUMsZ0JBQWdCLENBQUMsS0FBSztnQkFDakQsQ0FBQyxDQUFFLElBQUksQ0FBQyxVQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQzFDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxLQUFhLEVBQUUsR0FBVztJQUNyRSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ3JDLENBQUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFvQjtJQUNwRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ25FLENBQUM7QUFGRCw4Q0FFQyJ9