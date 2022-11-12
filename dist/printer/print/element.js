'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.printElement = void 0;
const prettier_1 = require("prettier");
const utils_1 = require("../../printer/utils");
const tag_1 = require("../../printer/print/tag");
const children_1 = require("../../printer/print/children");
const types_1 = require("../../types");
const { builders: { breakParent, dedentToRoot, group, indent, line, softline }, } = prettier_1.doc;
const { replaceTextEndOfLine } = prettier_1.doc.utils;
function printElement(path, options, print) {
    const node = path.getValue();
    const attrGroupId = Symbol('element-attr-group-id');
    const elementGroupId = Symbol('element-group-id');
    if ((0, utils_1.hasNoCloseMarker)(node)) {
        return [
            group((0, tag_1.printOpeningTag)(path, options, print, attrGroupId), {
                id: attrGroupId,
            }),
            ...(0, tag_1.printClosingTag)(node, options),
            (0, tag_1.printClosingTagSuffix)(node, options),
        ];
    }
    if ((0, utils_1.shouldPreserveContent)(node, options) ||
        node.type === types_1.NodeTypes.HtmlRawNode) {
        return [
            (0, tag_1.printOpeningTagPrefix)(node, options),
            group((0, tag_1.printOpeningTag)(path, options, print, attrGroupId), {
                id: attrGroupId,
            }),
            ...replaceTextEndOfLine((0, tag_1.getNodeContent)(node, options)),
            ...(0, tag_1.printClosingTag)(node, options),
            (0, tag_1.printClosingTagSuffix)(node, options),
        ];
    }
    const printTag = (doc) => group([
        group((0, tag_1.printOpeningTag)(path, options, print, attrGroupId), {
            id: attrGroupId,
        }),
        doc,
        (0, tag_1.printClosingTag)(node, options),
    ], { id: elementGroupId });
    const printLineBeforeChildren = () => {
        if (node.firstChild.hasLeadingWhitespace &&
            node.firstChild.isLeadingWhitespaceSensitive) {
            return line;
        }
        if (node.firstChild.type === types_1.NodeTypes.TextNode &&
            node.isWhitespaceSensitive &&
            node.isIndentationSensitive) {
            return dedentToRoot(softline);
        }
        return softline;
    };
    const printLineAfterChildren = () => {
        const needsToBorrow = node.next
            ? (0, tag_1.needsToBorrowPrevClosingTagEndMarker)(node.next)
            : (0, tag_1.needsToBorrowLastChildClosingTagEndMarker)(node.parentNode);
        if (needsToBorrow) {
            if (node.lastChild.hasTrailingWhitespace &&
                node.lastChild.isTrailingWhitespaceSensitive) {
                return ' ';
            }
            return '';
        }
        if (node.lastChild.hasTrailingWhitespace &&
            node.lastChild.isTrailingWhitespaceSensitive) {
            return line;
        }
        return softline;
    };
    if (node.children.length === 0) {
        return printTag(node.hasDanglingWhitespace && node.isDanglingWhitespaceSensitive
            ? line
            : '');
    }
    return printTag([
        (0, utils_1.forceBreakContent)(node) ? breakParent : '',
        indent([
            printLineBeforeChildren(),
            (0, children_1.printChildren)(path, options, print, {
                leadingSpaceGroupId: elementGroupId,
                trailingSpaceGroupId: elementGroupId,
            }),
        ]),
        printLineAfterChildren(),
    ]);
}
exports.printElement = printElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcmludGVyL3ByaW50L2VsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix1Q0FBNkM7QUFDN0MsMkNBSXlCO0FBQ3pCLDZDQVE2QjtBQUM3Qix1REFBeUQ7QUFDekQsbUNBTWlCO0FBRWpCLE1BQU0sRUFDSixRQUFRLEVBQUUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUN2RSxHQUFHLGNBQUcsQ0FBQztBQUNSLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLGNBQUcsQ0FBQyxLQUFZLENBQUM7QUFFbEQsU0FBZ0IsWUFBWSxDQUMxQixJQUE2QyxFQUM3QyxPQUE0QixFQUM1QixLQUFvQjtJQUVwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDcEQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFFbEQsSUFBSSxJQUFBLHdCQUFnQixFQUFDLElBQUksQ0FBQyxFQUFFO1FBRTFCLE9BQU87WUFDTCxLQUFLLENBQUMsSUFBQSxxQkFBZSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUN4RCxFQUFFLEVBQUUsV0FBVzthQUNoQixDQUFDO1lBQ0YsR0FBRyxJQUFBLHFCQUFlLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztZQUNqQyxJQUFBLDJCQUFxQixFQUFDLElBQUksRUFBRSxPQUFPLENBQUM7U0FDckMsQ0FBQztLQUNIO0lBRUQsSUFDRSxJQUFBLDZCQUFxQixFQUFDLElBQUksRUFBRSxPQUFPLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUks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