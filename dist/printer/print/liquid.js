"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printLiquidBranch = exports.printLiquidRawTag = exports.printLiquidTag = exports.printLiquidBlockEnd = exports.printLiquidBlockStart = exports.printLiquidDrop = void 0;
const prettier_1 = require("prettier");
const types_1 = require("../../types");
const ast_1 = require("../../parser/ast");
const utils_1 = require("../../utils");
const utils_2 = require("../../printer/utils");
const children_1 = require("../../printer/print/children");
const LIQUID_TAGS_THAT_ALWAYS_BREAK = ['for', 'case'];
const { builders, utils } = prettier_1.doc;
const { group, hardline, ifBreak, indent, join, line, softline } = builders;
function printLiquidDrop(path, _options, print, { leadingSpaceGroupId, trailingSpaceGroupId }) {
    const node = path.getValue();
    const whitespaceStart = (0, utils_2.getWhitespaceTrim)(node.whitespaceStart, (0, utils_2.hasMeaningfulLackOfLeadingWhitespace)(node), leadingSpaceGroupId);
    const whitespaceEnd = (0, utils_2.getWhitespaceTrim)(node.whitespaceEnd, (0, utils_2.hasMeaningfulLackOfTrailingWhitespace)(node), trailingSpaceGroupId);
    if (typeof node.markup !== 'string') {
        const whitespace = node.markup.filters.length > 0 ? line : ' ';
        return group([
            '{{',
            whitespaceStart,
            indent([whitespace, path.call(print, 'markup')]),
            whitespace,
            whitespaceEnd,
            '}}',
        ]);
    }
    const lines = (0, utils_2.markupLines)(node.markup);
    if (lines.length > 1) {
        return group([
            '{{',
            whitespaceStart,
            indent([hardline, join(hardline, lines.map(utils_2.trim))]),
            hardline,
            whitespaceEnd,
            '}}',
        ]);
    }
    return group([
        '{{',
        whitespaceStart,
        ' ',
        node.markup,
        ' ',
        whitespaceEnd,
        '}}',
    ]);
}
exports.printLiquidDrop = printLiquidDrop;
function printNamedLiquidBlockStart(path, _options, print, args, whitespaceStart, whitespaceEnd) {
    const node = path.getValue();
    const { isLiquidStatement } = args;
    const { wrapper, prefix, suffix } = (() => {
        if (isLiquidStatement) {
            return {
                wrapper: utils.removeLines,
                prefix: '',
                suffix: () => '',
            };
        }
        else {
            return {
                wrapper: group,
                prefix: ['{%', whitespaceStart, ' '],
                suffix: (trailingWhitespace) => [
                    trailingWhitespace,
                    whitespaceEnd,
                    '%}',
                ],
            };
        }
    })();
    const tag = (trailingWhitespace) => wrapper([
        ...prefix,
        node.name,
        ' ',
        indent(path.call((p) => print(p, args), 'markup')),
        ...suffix(trailingWhitespace),
    ]);
    const tagWithArrayMarkup = (whitespace) => wrapper([
        ...prefix,
        node.name,
        ' ',
        indent([
            join([',', line], path.map((p) => print(p, args), 'markup')),
        ]),
        ...suffix(whitespace),
    ]);
    switch (node.name) {
        case types_1.NamedTags.echo: {
            const trailingWhitespace = node.markup.filters.length > 0 ? line : ' ';
            return tag(trailingWhitespace);
        }
        case types_1.NamedTags.assign: {
            const trailingWhitespace = node.markup.value.filters.length > 0 ? line : ' ';
            return tag(trailingWhitespace);
        }
        case types_1.NamedTags.cycle: {
            const whitespace = node.markup.args.length > 1 ? line : ' ';
            return wrapper([
                ...prefix,
                node.name,
                node.markup.groupName ? ' ' : '',
                indent(path.call((p) => print(p, args), 'markup')),
                ...suffix(whitespace),
            ]);
        }
        case types_1.NamedTags.include:
        case types_1.NamedTags.render: {
            const markup = node.markup;
            const trailingWhitespace = markup.args.length > 0 || (markup.variable && markup.alias)
                ? line
                : ' ';
            return tag(trailingWhitespace);
        }
        case types_1.NamedTags.capture:
        case types_1.NamedTags.increment:
        case types_1.NamedTags.decrement:
        case types_1.NamedTags.layout:
        case types_1.NamedTags.section: {
            return tag(' ');
        }
        case types_1.NamedTags.form: {
            const trailingWhitespace = node.markup.length > 1 ? line : ' ';
            return tagWithArrayMarkup(trailingWhitespace);
        }
        case types_1.NamedTags.tablerow:
        case types_1.NamedTags.for: {
            const trailingWhitespace = node.markup.reversed || node.markup.args.length > 0 ? line : ' ';
            return tag(trailingWhitespace);
        }
        case types_1.NamedTags.paginate: {
            return tag(line);
        }
        case types_1.NamedTags.if:
        case types_1.NamedTags.elsif:
        case types_1.NamedTags.unless: {
            const trailingWhitespace = [
                types_1.NodeTypes.Comparison,
                types_1.NodeTypes.LogicalExpression,
            ].includes(node.markup.type)
                ? line
                : ' ';
            return tag(trailingWhitespace);
        }
        case types_1.NamedTags.case: {
            return tag(' ');
        }
        case types_1.NamedTags.when: {
            const trailingWhitespace = node.markup.length > 1 ? line : ' ';
            return tagWithArrayMarkup(trailingWhitespace);
        }
        case types_1.NamedTags.liquid: {
            return group([
                ...prefix,
                node.name,
                indent([
                    hardline,
                    join(hardline, path.map((p) => {
                        const curr = p.getValue();
                        return [
                            getSpaceBetweenLines(curr.prev, curr),
                            print(p, Object.assign(Object.assign({}, args), { isLiquidStatement: true })),
                        ];
                    }, 'markup')),
                ]),
                ...suffix(hardline),
            ]);
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
function printLiquidStatement(path, _options, _print, _args) {
    const node = path.getValue();
    const shouldSkipLeadingSpace = node.markup.trim() === '' ||
        (node.name === '#' && node.markup.startsWith('#'));
    return prettier_1.doc.utils.removeLines([
        node.name,
        shouldSkipLeadingSpace ? '' : ' ',
        node.markup,
    ]);
}
function printLiquidBlockStart(path, options, print, args = {}) {
    const node = path.getValue();
    const { leadingSpaceGroupId, trailingSpaceGroupId } = args;
    if (!node.name)
        return '';
    const whitespaceStart = (0, utils_2.getWhitespaceTrim)(node.whitespaceStart, needsBlockStartLeadingWhitespaceStrippingOnBreak(node), leadingSpaceGroupId);
    const whitespaceEnd = (0, utils_2.getWhitespaceTrim)(node.whitespaceEnd, needsBlockStartTrailingWhitespaceStrippingOnBreak(node), trailingSpaceGroupId);
    if (typeof node.markup !== 'string') {
        return printNamedLiquidBlockStart(path, options, print, args, whitespaceStart, whitespaceEnd);
    }
    if (args.isLiquidStatement) {
        return printLiquidStatement(path, options, print, args);
    }
    const lines = (0, utils_2.markupLines)(node.markup);
    if (node.name === 'liquid') {
        return group([
            '{%',
            whitespaceStart,
            ' ',
            node.name,
            indent([hardline, join(hardline, (0, utils_2.reindent)(lines, true))]),
            hardline,
            whitespaceEnd,
            '%}',
        ]);
    }
    if (lines.length > 1) {
        return group([
            '{%',
            whitespaceStart,
            indent([hardline, node.name, ' ', join(hardline, lines.map(utils_2.trim))]),
            hardline,
            whitespaceEnd,
            '%}',
        ]);
    }
    const markup = node.markup;
    return group([
        '{%',
        whitespaceStart,
        ' ',
        node.name,
        markup ? ` ${markup}` : '',
        ' ',
        whitespaceEnd,
        '%}',
    ]);
}
exports.printLiquidBlockStart = printLiquidBlockStart;
function printLiquidBlockEnd(path, _options, _print, args = {}) {
    var _a, _b;
    const node = path.getValue();
    const { isLiquidStatement, leadingSpaceGroupId, trailingSpaceGroupId } = args;
    if (!node.children || !node.blockEndPosition)
        return '';
    if (isLiquidStatement) {
        return ['end', node.name];
    }
    const whitespaceStart = (0, utils_2.getWhitespaceTrim)((_a = node.delimiterWhitespaceStart) !== null && _a !== void 0 ? _a : '', needsBlockEndLeadingWhitespaceStrippingOnBreak(node), leadingSpaceGroupId);
    const whitespaceEnd = (0, utils_2.getWhitespaceTrim)((_b = node.delimiterWhitespaceEnd) !== null && _b !== void 0 ? _b : '', (0, utils_2.hasMeaningfulLackOfTrailingWhitespace)(node), trailingSpaceGroupId);
    return group([
        '{%',
        whitespaceStart,
        ` end${node.name} `,
        whitespaceEnd,
        '%}',
    ]);
}
exports.printLiquidBlockEnd = printLiquidBlockEnd;
function printLiquidTag(path, options, print, args) {
    const { leadingSpaceGroupId, trailingSpaceGroupId } = args;
    const node = path.getValue();
    if (!node.children || !node.blockEndPosition) {
        return printLiquidBlockStart(path, options, print, args);
    }
    const tagGroupId = Symbol('tag-group');
    const blockStart = printLiquidBlockStart(path, options, print, Object.assign(Object.assign({}, args), { leadingSpaceGroupId, trailingSpaceGroupId: tagGroupId }));
    const blockEnd = printLiquidBlockEnd(path, options, print, Object.assign(Object.assign({}, args), { leadingSpaceGroupId: tagGroupId, trailingSpaceGroupId }));
    let body = [];
    if ((0, ast_1.isBranchedTag)(node)) {
        body = cleanDoc(path.map((p) => print(p, Object.assign(Object.assign({}, args), { leadingSpaceGroupId: tagGroupId, trailingSpaceGroupId: tagGroupId })), 'children'));
        if (node.name === 'case')
            body = indent(body);
    }
    else if (node.children.length > 0) {
        body = indent([
            innerLeadingWhitespace(node),
            (0, children_1.printChildren)(path, options, print, Object.assign(Object.assign({}, args), { leadingSpaceGroupId: tagGroupId, trailingSpaceGroupId: tagGroupId })),
        ]);
    }
    return group([blockStart, body, innerTrailingWhitespace(node), blockEnd], {
        id: tagGroupId,
        shouldBreak: LIQUID_TAGS_THAT_ALWAYS_BREAK.includes(node.name) ||
            (0, utils_2.originallyHadLineBreaks)(path, options) ||
            (0, utils_2.isAttributeNode)(node) ||
            (0, utils_2.isDeeplyNested)(node),
    });
}
exports.printLiquidTag = printLiquidTag;
function printLiquidRawTag(path, options, print, { isLiquidStatement }) {
    let body = [];
    const node = path.getValue();
    const hasEmptyBody = node.body.value.trim() === '';
    const shouldNotIndentBody = node.name === 'schema' && !options.indentSchema;
    const shouldPrintAsIs = node.name === 'raw' ||
        !(0, utils_2.hasLineBreakInRange)(node.source, node.body.position.start, node.body.position.end);
    const blockStart = isLiquidStatement
        ? [node.name]
        : group([
            '{%',
            node.whitespaceStart,
            ' ',
            node.name,
            ' ',
            node.whitespaceEnd,
            '%}',
        ]);
    const blockEnd = isLiquidStatement
        ? ['end', node.name]
        : [
            '{%',
            node.whitespaceStart,
            ' ',
            'end',
            node.name,
            ' ',
            node.whitespaceEnd,
            '%}',
        ];
    if (shouldPrintAsIs) {
        body = [
            node.source.slice(node.blockStartPosition.end, node.blockEndPosition.start),
        ];
    }
    else if (hasEmptyBody) {
        body = [hardline];
    }
    else if (shouldNotIndentBody) {
        body = [hardline, path.call(print, 'body'), hardline];
    }
    else {
        body = [indent([hardline, path.call(print, 'body')]), hardline];
    }
    return [blockStart, ...body, blockEnd];
}
exports.printLiquidRawTag = printLiquidRawTag;
function innerLeadingWhitespace(node) {
    if (!node.firstChild) {
        if (node.isDanglingWhitespaceSensitive && node.hasDanglingWhitespace) {
            return line;
        }
        else {
            return '';
        }
    }
    if (node.firstChild.hasLeadingWhitespace &&
        node.firstChild.isLeadingWhitespaceSensitive) {
        return line;
    }
    return softline;
}
function innerTrailingWhitespace(node) {
    if (node.type === types_1.NodeTypes.LiquidBranch ||
        !node.blockEndPosition ||
        !node.lastChild) {
        return '';
    }
    if (node.lastChild.hasTrailingWhitespace &&
        node.lastChild.isTrailingWhitespaceSensitive) {
        return line;
    }
    return softline;
}
function printLiquidDefaultBranch(path, options, print, args) {
    const branch = path.getValue();
    const parentNode = path.getParentNode();
    const shouldCollapseSpace = (0, utils_2.isEmpty)(branch.children) && parentNode.children.length === 1;
    if (shouldCollapseSpace)
        return '';
    const isBranchEmptyWithoutSpace = (0, utils_2.isEmpty)(branch.children) && !branch.hasDanglingWhitespace;
    if (isBranchEmptyWithoutSpace)
        return '';
    if (branch.hasDanglingWhitespace) {
        return ifBreak('', ' ');
    }
    return indent([
        innerLeadingWhitespace(parentNode),
        (0, children_1.printChildren)(path, options, print, args),
    ]);
}
function printLiquidBranch(path, options, print, args) {
    const branch = path.getValue();
    const isDefaultBranch = !branch.name;
    if (isDefaultBranch) {
        return printLiquidDefaultBranch(path, options, print, args);
    }
    const leftSibling = branch.prev;
    const shouldCollapseSpace = leftSibling && (0, utils_2.isEmpty)(leftSibling.children);
    const outerLeadingWhitespace = branch.hasLeadingWhitespace && !shouldCollapseSpace ? line : softline;
    return [
        outerLeadingWhitespace,
        printLiquidBlockStart(path, options, print, args),
        indent([
            innerLeadingWhitespace(branch),
            (0, children_1.printChildren)(path, options, print, args),
        ]),
    ];
}
exports.printLiquidBranch = printLiquidBranch;
function needsBlockStartLeadingWhitespaceStrippingOnBreak(node) {
    switch (node.type) {
        case types_1.NodeTypes.LiquidTag: {
            return (!(0, utils_2.isAttributeNode)(node) && (0, utils_2.hasMeaningfulLackOfLeadingWhitespace)(node));
        }
        case types_1.NodeTypes.LiquidBranch: {
            return (!(0, utils_2.isAttributeNode)(node.parentNode) &&
                (0, utils_2.hasMeaningfulLackOfLeadingWhitespace)(node));
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
function needsBlockStartTrailingWhitespaceStrippingOnBreak(node) {
    switch (node.type) {
        case types_1.NodeTypes.LiquidTag: {
            if ((0, ast_1.isBranchedTag)(node)) {
                return needsBlockStartLeadingWhitespaceStrippingOnBreak(node.firstChild);
            }
            if (!node.children) {
                return (0, utils_2.hasMeaningfulLackOfTrailingWhitespace)(node);
            }
            return (0, utils_2.isEmpty)(node.children)
                ? (0, utils_2.hasMeaningfulLackOfDanglingWhitespace)(node)
                : (0, utils_2.hasMeaningfulLackOfLeadingWhitespace)(node.firstChild);
        }
        case types_1.NodeTypes.LiquidBranch: {
            if ((0, utils_2.isAttributeNode)(node.parentNode)) {
                return false;
            }
            return node.firstChild
                ? (0, utils_2.hasMeaningfulLackOfLeadingWhitespace)(node.firstChild)
                : (0, utils_2.hasMeaningfulLackOfDanglingWhitespace)(node);
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
function needsBlockEndLeadingWhitespaceStrippingOnBreak(node) {
    if (!node.children) {
        throw new Error('Should only call needsBlockEndLeadingWhitespaceStrippingOnBreak for tags that have closing tags');
    }
    else if ((0, utils_2.isAttributeNode)(node)) {
        return false;
    }
    else if ((0, ast_1.isBranchedTag)(node)) {
        return (0, utils_2.hasMeaningfulLackOfTrailingWhitespace)(node.lastChild);
    }
    else if ((0, utils_2.isEmpty)(node.children)) {
        return (0, utils_2.hasMeaningfulLackOfDanglingWhitespace)(node);
    }
    else {
        return (0, utils_2.hasMeaningfulLackOfTrailingWhitespace)(node.lastChild);
    }
}
function cleanDoc(doc) {
    return doc.filter((x) => x !== '');
}
function getSchema(contents, options) {
    try {
        return [JSON.stringify(JSON.parse(contents), null, options.tabWidth), true];
    }
    catch (e) {
        return [contents, false];
    }
}
function getSpaceBetweenLines(prev, curr) {
    if (!prev)
        return '';
    const source = curr.source;
    const whitespaceBetweenNodes = source.slice(prev.position.end, curr.position.start);
    const hasMoreThanOneNewLine = (whitespaceBetweenNodes.match(/\n/g) || []).length > 1;
    return hasMoreThanOneNewLine ? hardline : '';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxdWlkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3ByaW50ZXIvcHJpbnQvbGlxdWlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUE2QztBQUM3QyxtQ0FjaUI7QUFDakIsc0NBQTZDO0FBQzdDLG1DQUFzQztBQUV0QywyQ0FheUI7QUFFekIsdURBQXlEO0FBRXpELE1BQU0sNkJBQTZCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFdEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxjQUFHLENBQUM7QUFDaEMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLFFBQVEsQ0FBQztBQUU1RSxTQUFnQixlQUFlLENBQzdCLElBQW1CLEVBQ25CLFFBQTZCLEVBQzdCLEtBQW9CLEVBQ3BCLEVBQUUsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQXFCO0lBRWhFLE1BQU0sSUFBSSxHQUFlLElBQUksQ0FBQyxRQUFRLEVBQWdCLENBQUM7SUFDdkQsTUFBTSxlQUFlLEdBQUcsSUFBQSx5QkFBaUIsRUFDdkMsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBQSw0Q0FBb0MsRUFBQyxJQUFJLENBQUMsRUFDMUMsbUJBQW1CLENBQ3BCLENBQUM7SUFDRixNQUFNLGFBQWEsR0FBRyxJQUFBLHlCQUFpQixFQUNyQyxJQUFJLENBQUMsYUFBYSxFQUNsQixJQUFBLDZDQUFxQyxFQUFDLElBQUksQ0FBQyxFQUMzQyxvQkFBb0IsQ0FDckIsQ0FBQztJQUVGLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMs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