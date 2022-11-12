"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeContent = exports.printOpeningTagEndMarker = exports.printOpeningTagStartMarker = exports.printOpeningTagPrefix = exports.printOpeningTagStart = exports.printOpeningTag = exports.needsToBorrowParentOpeningTagEndMarker = exports.needsToBorrowNextOpeningTagStartMarker = exports.needsToBorrowParentClosingTagStartMarker = exports.needsToBorrowLastChildClosingTagEndMarker = exports.needsToBorrowPrevClosingTagEndMarker = exports.printClosingTagEndMarker = exports.printClosingTagStartMarker = exports.printClosingTagSuffix = exports.printClosingTagEnd = exports.printClosingTagStart = exports.printClosingTag = void 0;
const prettier_1 = require("prettier");
const types_1 = require("../../types");
const utils_1 = require("../../printer/utils");
const { builders: { breakParent, indent, join, line, softline, hardline }, } = prettier_1.doc;
const { replaceTextEndOfLine } = prettier_1.doc.utils;
function printClosingTag(node, options) {
    return [
        (0, utils_1.hasNoCloseMarker)(node) ? '' : printClosingTagStart(node, options),
        printClosingTagEnd(node, options),
    ];
}
exports.printClosingTag = printClosingTag;
function printClosingTagStart(node, options) {
    return node.lastChild &&
        needsToBorrowParentClosingTagStartMarker(node.lastChild)
        ? ''
        : [
            printClosingTagPrefix(node, options),
            printClosingTagStartMarker(node, options),
        ];
}
exports.printClosingTagStart = printClosingTagStart;
function printClosingTagEnd(node, options) {
    return (node.next
        ? needsToBorrowPrevClosingTagEndMarker(node.next)
        : needsToBorrowLastChildClosingTagEndMarker(node.parentNode))
        ? ''
        : [
            printClosingTagEndMarker(node, options),
            printClosingTagSuffix(node, options),
        ];
}
exports.printClosingTagEnd = printClosingTagEnd;
function printClosingTagPrefix(node, options) {
    return needsToBorrowLastChildClosingTagEndMarker(node)
        ? printClosingTagEndMarker(node.lastChild, options)
        : '';
}
function printClosingTagSuffix(node, options) {
    return needsToBorrowParentClosingTagStartMarker(node)
        ? printClosingTagStartMarker(node.parentNode, options)
        : needsToBorrowNextOpeningTagStartMarker(node)
            ? printOpeningTagStartMarker(node.next)
            : '';
}
exports.printClosingTagSuffix = printClosingTagSuffix;
function printClosingTagStartMarker(node, options) {
    if (!node)
        return '';
    if (shouldNotPrintClosingTag(node, options)) {
        return '';
    }
    switch (node.type) {
        case types_1.NodeTypes.HtmlElement:
        case types_1.NodeTypes.HtmlRawNode:
            if (typeof node.name === 'string') {
                return `</${node.name}`;
            }
            else if (typeof node.name.markup === 'string') {
                return `</{{ ${node.name.markup.trim()} }}`;
            }
            else {
                return `</{{ ${node.name.markup.rawSource} }}`;
            }
        default:
            return '';
    }
}
exports.printClosingTagStartMarker = printClosingTagStartMarker;
function printClosingTagEndMarker(node, options) {
    if (!node)
        return '';
    if (shouldNotPrintClosingTag(node, options)) {
        return '';
    }
    switch (node.type) {
        case types_1.NodeTypes.HtmlSelfClosingElement: {
            return '/>';
        }
        default:
            return '>';
    }
}
exports.printClosingTagEndMarker = printClosingTagEndMarker;
function shouldNotPrintClosingTag(node, options) {
    return (!(0, utils_1.hasNoCloseMarker)(node) &&
        !node.blockEndPosition &&
        ((0, utils_1.hasPrettierIgnore)(node) ||
            (0, utils_1.shouldPreserveContent)(node.parentNode, options)));
}
function needsToBorrowPrevClosingTagEndMarker(node) {
    return (!(0, utils_1.isLiquidNode)(node) &&
        node.prev &&
        (0, utils_1.isHtmlNode)(node.prev) &&
        (0, utils_1.hasMeaningfulLackOfLeadingWhitespace)(node));
}
exports.needsToBorrowPrevClosingTagEndMarker = needsToBorrowPrevClosingTagEndMarker;
function needsToBorrowLastChildClosingTagEndMarker(node) {
    return ((0, utils_1.isHtmlNode)(node) &&
        node.lastChild &&
        (0, utils_1.hasMeaningfulLackOfTrailingWhitespace)(node.lastChild) &&
        (0, utils_1.isHtmlNode)((0, utils_1.getLastDescendant)(node.lastChild)) &&
        !(0, utils_1.isPreLikeNode)(node));
}
exports.needsToBorrowLastChildClosingTagEndMarker = needsToBorrowLastChildClosingTagEndMarker;
function needsToBorrowParentClosingTagStartMarker(node) {
    return ((0, utils_1.isHtmlNode)(node.parentNode) &&
        !node.next &&
        (0, utils_1.hasMeaningfulLackOfTrailingWhitespace)(node) &&
        !(0, utils_1.isLiquidNode)(node) &&
        ((0, utils_1.isTextLikeNode)((0, utils_1.getLastDescendant)(node)) ||
            (0, utils_1.isLiquidNode)((0, utils_1.getLastDescendant)(node))));
}
exports.needsToBorrowParentClosingTagStartMarker = needsToBorrowParentClosingTagStartMarker;
function needsToBorrowNextOpeningTagStartMarker(node) {
    return (node.next &&
        (0, utils_1.isHtmlNode)(node.next) &&
        (0, utils_1.isTextLikeNode)(node) &&
        (0, utils_1.hasMeaningfulLackOfTrailingWhitespace)(node));
}
exports.needsToBorrowNextOpeningTagStartMarker = needsToBorrowNextOpeningTagStartMarker;
function getPrettierIgnoreAttributeCommentData(value) {
    const match = value.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/s);
    if (!match) {
        return false;
    }
    if (!match[1]) {
        return true;
    }
    return match[1].split(/\s+/);
}
function needsToBorrowParentOpeningTagEndMarker(node) {
    return ((0, utils_1.isHtmlNode)(node.parentNode) &&
        !node.prev &&
        (0, utils_1.hasMeaningfulLackOfLeadingWhitespace)(node) &&
        !(0, utils_1.isLiquidNode)(node));
}
exports.needsToBorrowParentOpeningTagEndMarker = needsToBorrowParentOpeningTagEndMarker;
function printAttributes(path, options, print, attrGroupId) {
    const node = path.getValue();
    const { locStart, locEnd } = options;
    if ((0, utils_1.isHtmlComment)(node))
        return '';
    if (!(0, utils_1.isNonEmptyArray)(node.attributes)) {
        return (0, utils_1.isSelfClosing)(node)
            ?
                ' '
            : '';
    }
    const ignoreAttributeData = node.prev &&
        node.prev.type === types_1.NodeTypes.HtmlComment &&
        getPrettierIgnoreAttributeCommentData(node.prev.body);
    const hasPrettierIgnoreAttribute = typeof ignoreAttributeData === 'boolean'
        ? () => ignoreAttributeData
        : Array.isArray(ignoreAttributeData)
            ? (attribute) => ignoreAttributeData.includes(attribute.rawName)
            : () => false;
    const printedAttributes = path.map((attributePath) => {
        const attribute = attributePath.getValue();
        return hasPrettierIgnoreAttribute(attribute)
            ? replaceTextEndOfLine(options.originalText.slice(locStart(attribute), locEnd(attribute)))
            : print(attributePath, { trailingSpaceGroupId: attrGroupId });
    }, 'attributes');
    const forceNotToBreakAttrContent = (options.singleLineLinkTags &&
        typeof node.name === 'string' &&
        node.name === 'link') ||
        (((0, utils_1.isSelfClosing)(node) ||
            (0, utils_1.isVoidElement)(node) ||
            ((0, utils_1.isHtmlElement)(node) && node.children.length > 0)) &&
            node.attributes &&
            node.attributes.length === 1 &&
            !(0, utils_1.isLiquidNode)(node.attributes[0]));
    const forceBreakAttrContent = node.source
        .slice(node.blockStartPosition.start, node.blockStartPosition.end)
        .indexOf('\n') !== -1;
    const attributeLine = forceNotToBreakAttrContent
        ? ' '
        : options.singleAttributePerLine && node.attributes.length > 1
            ? hardline
            : line;
    const parts = [
        indent([
            forceNotToBreakAttrContent ? ' ' : line,
            forceBreakAttrContent ? breakParent : '',
            join(attributeLine, printedAttributes),
        ]),
    ];
    if ((node.firstChild &&
        needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
        ((0, utils_1.hasNoCloseMarker)(node) &&
            needsToBorrowLastChildClosingTagEndMarker(node.parentNode)) ||
        forceNotToBreakAttrContent) {
        parts.push((0, utils_1.isSelfClosing)(node) ? ' ' : '');
    }
    else {
        parts.push(options.bracketSameLine
            ? (0, utils_1.isSelfClosing)(node)
                ? ' '
                : ''
            : (0, utils_1.isSelfClosing)(node)
                ? line
                : softline);
    }
    return parts;
}
function printOpeningTagEnd(node) {
    return node.firstChild &&
        needsToBorrowParentOpeningTagEndMarker(node.firstChild)
        ? ''
        : printOpeningTagEndMarker(node);
}
function printOpeningTag(path, options, print, attrGroupId) {
    const node = path.getValue();
    return [
        printOpeningTagStart(node, options),
        printAttributes(path, options, print, attrGroupId),
        (0, utils_1.hasNoCloseMarker)(node) ? '' : printOpeningTagEnd(node),
    ];
}
exports.printOpeningTag = printOpeningTag;
function printOpeningTagStart(node, options) {
    return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
        ? ''
        : [printOpeningTagPrefix(node, options), printOpeningTagStartMarker(node)];
}
exports.printOpeningTagStart = printOpeningTagStart;
function printOpeningTagPrefix(node, options) {
    return needsToBorrowParentOpeningTagEndMarker(node)
        ? printOpeningTagEndMarker(node.parentNode)
        : needsToBorrowPrevClosingTagEndMarker(node)
            ? printClosingTagEndMarker(node.prev, options)
            : '';
}
exports.printOpeningTagPrefix = printOpeningTagPrefix;
function printOpeningTagStartMarker(node) {
    if (!node)
        return '';
    switch (node.type) {
        case types_1.NodeTypes.HtmlComment:
            return '<!--';
        case types_1.NodeTypes.HtmlElement:
        case types_1.NodeTypes.HtmlSelfClosingElement:
        case types_1.NodeTypes.HtmlVoidElement:
        case types_1.NodeTypes.HtmlRawNode:
            if (typeof node.name === 'string') {
                return `<${node.name}`;
            }
            else if (typeof node.name.markup === 'string') {
                return `<{{ ${node.name.markup.trim()} }}`;
            }
            else {
                return `<{{ ${node.name.markup.rawSource} }}`;
            }
        default:
            return '';
    }
}
exports.printOpeningTagStartMarker = printOpeningTagStartMarker;
function printOpeningTagEndMarker(node) {
    if (!node)
        return '';
    switch (node.type) {
        case types_1.NodeTypes.HtmlComment:
            return '-->';
        case types_1.NodeTypes.HtmlSelfClosingElement:
        case types_1.NodeTypes.HtmlVoidElement:
            return '';
        case types_1.NodeTypes.HtmlElement:
        case types_1.NodeTypes.HtmlRawNode:
            return '>';
        default:
            return '>';
    }
}
exports.printOpeningTagEndMarker = printOpeningTagEndMarker;
function getNodeContent(node, options) {
    let start = node.blockStartPosition.end;
    if (node.firstChild &&
        needsToBorrowParentOpeningTagEndMarker(node.firstChild)) {
        start -= printOpeningTagEndMarker(node).length;
    }
    let end = node.blockEndPosition.start;
    if (node.lastChild &&
        needsToBorrowParentClosingTagStartMarker(node.lastChild)) {
        end += printClosingTagStartMarker(node, options).length;
    }
    else if (node.lastChild &&
        needsToBorrowLastChildClosingTagEndMarker(node)) {
        end -= printClosingTagEndMarker(node.lastChild, options).length;
    }
    return options.originalText.slice(start, end);
}
exports.getNodeContent = getNodeContent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3ByaW50ZXIvcHJpbnQvdGFnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUE2QztBQUM3QyxtQ0FTaUI7QUFDakIsMkNBaUJ5QjtBQUV6QixNQUFNLEVBQ0osUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FDbEUsR0FBRyxjQUFHLENBQUM7QUFDUixNQUFNLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxjQUFHLENBQUMsS0FBWSxDQUFDO0FBRWxELFNBQWdCLGVBQWUsQ0FDN0IsSUFBb0IsRUFDcEIsT0FBNEI7SUFFNUIsT0FBTztRQUNMLElBQUEsd0JBQWdCLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztRQUNqRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO0tBQ2xDLENBQUM7QUFDSixDQUFDO0FBUkQsMENBUUM7QUFFRCxTQUFnQixvQkFBb0IsQ0FDbEMsSUFBb0IsRUFDcEIsT0FBNEI7SUFFNUIsT0FBTyxJQUFJLENBQUMsU0FBUztRQUNuQix3Q0FBd0MsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxFQUFFO1FBQ0osQ0FBQyxDQUFDO1lBQ0UscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztZQUNwQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO1NBQzFDLENBQUM7QUFDUixDQUFDO0FBWEQsb0RBV0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsSUFBb0IsRUFDcEIsT0FBNEI7SUFFNUIsT0FBTyxDQUNMLElBQUksQ0FBQyxJQUFJO1FBQ1AsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FB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