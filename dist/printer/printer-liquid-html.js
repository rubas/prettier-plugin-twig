"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printerLiquidHtml = void 0;
const prettier_1 = require("prettier");
const types_1 = require("../types");
const utils_1 = require("../utils");
const print_preprocess_1 = require("../printer/print-preprocess");
const utils_2 = require("../printer/utils");
const element_1 = require("../printer/print/element");
const tag_1 = require("../printer/print/tag");
const liquid_1 = require("../printer/print/liquid");
const children_1 = require("../printer/print/children");
const embed_1 = require("../printer/embed");
const parser_1 = require("../parser");
const { builders } = prettier_1.doc;
const { fill, group, hardline, indent, join, line, softline } = builders;
function printAttributes(path, _options, print) {
    const node = path.getValue();
    if ((0, utils_2.isEmpty)(node.attributes))
        return '';
    return group([
        indent([
            line,
            join(line, path.map((p) => print(p), 'attributes')),
        ]),
        softline,
    ], {
        shouldBreak: (0, utils_2.hasLineBreakInRange)(node.source, node.blockStartPosition.start, node.blockStartPosition.end),
    });
}
const oppositeQuotes = {
    '"': "'",
    "'": '"',
};
function printAttribute(path, options, _print) {
    const node = path.getValue();
    const attrGroupId = Symbol('attr-group-id');
    const value = node.source.slice(node.attributePosition.start, node.attributePosition.end);
    const preferredQuote = options.singleQuote ? `'` : `"`;
    const attributeValueContainsQuote = !!node.value.find((valueNode) => (0, utils_2.isTextLikeNode)(valueNode) && valueNode.value.includes(preferredQuote));
    const quote = attributeValueContainsQuote
        ? oppositeQuotes[preferredQuote]
        : preferredQuote;
    return [
        node.name,
        '=',
        quote,
        (0, utils_2.hasLineBreakInRange)(node.source, node.attributePosition.start, node.attributePosition.end)
            ? group([
                indent([
                    softline,
                    join(hardline, (0, utils_2.reindent)((0, utils_2.bodyLines)(value), true)),
                ]),
                softline,
            ], { id: attrGroupId })
            : value,
        quote,
    ];
}
function isYamlFrontMatter(node) {
    return (node.parentNode &&
        node.parentNode.type === types_1.NodeTypes.Document &&
        !node.prev &&
        /^---\r?\n/.test(node.value));
}
function printTextNode(path, options, _print) {
    const node = path.getValue();
    if (isYamlFrontMatter(node))
        return node.value;
    if (node.value.match(/^\s*$/))
        return '';
    const text = node.value;
    const paragraphs = text
        .split(/(\r?\n){2,}/)
        .filter(Boolean)
        .map((curr) => {
        let doc = [];
        const words = curr.trim().split(/\s+/g);
        let isFirst = true;
        for (let j = 0; j < words.length; j++) {
            const word = words[j];
            if (isFirst) {
                isFirst = false;
            }
            else {
                doc.push(line);
            }
            doc.push(word);
        }
        return fill(doc);
    });
    return [
        (0, tag_1.printOpeningTagPrefix)(node, options),
        join(hardline, paragraphs),
        (0, tag_1.printClosingTagSuffix)(node, options),
    ];
}
function printNode(path, options, print, args = {}) {
    const node = path.getValue();
    switch (node.type) {
        case types_1.NodeTypes.Document: {
            return [
                (0, children_1.printChildren)(path, options, print, args),
                hardline,
            ];
        }
        case types_1.NodeTypes.HtmlElement: {
            return (0, element_1.printElement)(path, options, print);
        }
        case types_1.NodeTypes.HtmlVoidElement: {
            return (0, element_1.printElement)(path, options, print);
        }
        case types_1.NodeTypes.HtmlSelfClosingElement: {
            return (0, element_1.printElement)(path, options, print);
        }
        case types_1.NodeTypes.HtmlRawNode: {
            let body = [];
            const hasEmptyBody = node.body.value.trim() === '';
            const shouldIndentBody = node.body.kind !== parser_1.RawMarkupKinds.markdown;
            if (!hasEmptyBody) {
                if (shouldIndentBody) {
                    body = [indent([hardline, path.call(print, 'body')]), hardline];
                }
                else {
                    body = [
                        builders.dedentToRoot([hardline, path.call(print, 'body')]),
                        hardline,
                    ];
                }
            }
            return group([
                group([
                    '<',
                    node.name,
                    printAttributes(path, options, print),
                    '>',
                ]),
                ...body,
                ['</', node.name, '>'],
            ]);
        }
        case types_1.NodeTypes.RawMarkup: {
            const lines = (0, utils_2.bodyLines)(node.value);
            const shouldSkipFirstLine = !node.source[node.position.start].match(/\r|\n/);
            return lines.length > 0 && lines[0].trim() !== ''
                ? join(hardline, (0, utils_2.reindent)(lines, shouldSkipFirstLine))
                : softline;
        }
        case types_1.NodeTypes.LiquidDrop: {
            return (0, liquid_1.printLiquidDrop)(path, options, print, args);
        }
        case types_1.NodeTypes.LiquidRawTag: {
            return (0, liquid_1.printLiquidRawTag)(path, options, print, args);
        }
        case types_1.NodeTypes.LiquidTag: {
            return (0, liquid_1.printLiquidTag)(path, options, print, args);
        }
        case types_1.NodeTypes.LiquidBranch: {
            return (0, liquid_1.printLiquidBranch)(path, options, print, args);
        }
        case types_1.NodeTypes.AttrEmpty: {
            return node.name;
        }
        case types_1.NodeTypes.AttrUnquoted:
        case types_1.NodeTypes.AttrSingleQuoted:
        case types_1.NodeTypes.AttrDoubleQuoted: {
            return printAttribute(path, options, print);
        }
        case types_1.NodeTypes.HtmlDoctype: {
            if (!node.legacyDoctypeString)
                return '<!doctype html>';
            return node.source.slice(node.position.start, node.position.end);
        }
        case types_1.NodeTypes.HtmlComment: {
            return [
                '<!--',
                group([
                    indent([line, join(hardline, (0, utils_2.reindent)((0, utils_2.bodyLines)(node.body), true))]),
                    line,
                ]),
                '-->',
            ];
        }
        case types_1.NodeTypes.AssignMarkup: {
            return [node.name, ' = ', path.call(print, 'value')];
        }
        case types_1.NodeTypes.CycleMarkup: {
            const doc = [];
            if (node.groupName) {
                doc.push(path.call(print, 'groupName'), ':');
            }
            const whitespace = node.args.length > 1 ? line : ' ';
            doc.push(whitespace, join([',', whitespace], path.map((p) => print(p), 'args')));
            return doc;
        }
        case types_1.NodeTypes.ForMarkup: {
            const doc = [node.variableName, ' in ', path.call(print, 'collection')];
            if (node.reversed) {
                doc.push(line, 'reversed');
            }
            if (node.args.length > 0) {
                doc.push([
                    line,
                    join(line, path.map((p) => print(p), 'args')),
                ]);
            }
            return doc;
        }
        case types_1.NodeTypes.PaginateMarkup: {
            const doc = [
                path.call(print, 'collection'),
                line,
                'by ',
                path.call(print, 'pageSize'),
            ];
            if (node.args.length > 0) {
                doc.push([
                    ',',
                    line,
                    join([',', line], path.map((p) => print(p), 'args')),
                ]);
            }
            return doc;
        }
        case types_1.NodeTypes.RenderMarkup: {
            const snippet = path.call(print, 'snippet');
            const doc = [snippet];
            if (node.variable) {
                const whitespace = node.alias ? line : ' ';
                doc.push(whitespace, path.call(print, 'variable'));
            }
            if (node.alias) {
                doc.push(' ', 'as', ' ', node.alias);
            }
            if (node.args.length > 0) {
                doc.push(',', line, join([',', line], path.map((p) => print(p), 'args')));
            }
            return doc;
        }
        case types_1.NodeTypes.RenderVariableExpression: {
            return [node.kind, ' ', path.call(print, 'name')];
        }
        case types_1.NodeTypes.LogicalExpression: {
            return [
                path.call(print, 'left'),
                line,
                node.relation,
                ' ',
                path.call(print, 'right'),
            ];
        }
        case types_1.NodeTypes.Comparison: {
            return group([
                path.call(print, 'left'),
                indent([line, node.comparator, ' ', path.call(print, 'right')]),
            ]);
        }
        case types_1.NodeTypes.LiquidVariable: {
            const name = path.call(print, 'expression');
            let filters = '';
            if (node.filters.length > 0) {
                filters = [
                    line,
                    join(line, path.map((p) => print(p), 'filters')),
                ];
            }
            return [name, filters];
        }
        case types_1.NodeTypes.LiquidFilter: {
            let args = [];
            if (node.args.length > 0) {
                const printed = path.map((p) => print(p), 'args');
                const shouldPrintFirstArgumentSameLine = node.args[0].type !== types_1.NodeTypes.NamedArgument;
                if (shouldPrintFirstArgumentSameLine) {
                    const [firstDoc, ...rest] = printed;
                    const restDoc = (0, utils_2.isEmpty)(rest)
                        ? ''
                        : indent([',', line, join([',', line], rest)]);
                    args = [': ', firstDoc, restDoc];
                }
                else {
                    args = [':', indent([line, join([',', line], printed)])];
                }
            }
            return group(['| ', node.name, ...args]);
        }
        case types_1.NodeTypes.NamedArgument: {
            return [node.name, ': ', path.call(print, 'value')];
        }
        case types_1.NodeTypes.TextNode: {
            return printTextNode(path, options, print);
        }
        case types_1.NodeTypes.YAMLFrontmatter: {
            return ['---', hardline, node.body, '---'];
        }
        case types_1.NodeTypes.String: {
            const preferredQuote = options.liquidSingleQuote ? `'` : `"`;
            const valueHasQuotes = node.value.includes(preferredQuote);
            const quote = valueHasQuotes
                ? oppositeQuotes[preferredQuote]
                : preferredQuote;
            return [quote, node.value, quote];
        }
        case types_1.NodeTypes.Number: {
            if (args.truncate) {
                return node.value.replace(/\.\d+$/, '');
            }
            else {
                return node.value;
            }
        }
        case types_1.NodeTypes.Range: {
            return [
                '(',
                path.call((p) => print(p, { truncate: true }), 'start'),
                '..',
                path.call((p) => print(p, { truncate: true }), 'end'),
                ')',
            ];
        }
        case types_1.NodeTypes.LiquidLiteral: {
            if (node.keyword === 'nil') {
                return 'null';
            }
            return node.keyword;
        }
        case types_1.NodeTypes.VariableLookup: {
            const doc = [];
            if (node.name) {
                doc.push(node.name);
            }
            const lookups = path.map((lookupPath, index) => {
                const lookup = lookupPath.getValue();
                switch (lookup.type) {
                    case types_1.NodeTypes.String: {
                        const value = lookup.value;
                        const isGlobalStringLookup = index === 0 && !node.name;
                        if (!isGlobalStringLookup && /^[a-z0-9_]+\??$/i.test(value)) {
                            return ['.', value];
                        }
                        return ['[', print(lookupPath), ']'];
                    }
                    default: {
                        return ['[', print(lookupPath), ']'];
                    }
                }
            }, 'lookups');
            return [...doc, ...lookups];
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
const ignoredKeys = new Set([
    'prev',
    'parentNode',
    'next',
    'firstChild',
    'lastChild',
]);
exports.printerLiquidHtml = {
    print: printNode,
    embed: embed_1.embed,
    preprocess: print_preprocess_1.preprocess,
    getVisitorKeys(node, nonTraversableKeys) {
        return Object.keys(node).filter((key) => !nonTraversableKeys.has(key) && !ignoredKeys.has(key));
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnRlci1saXF1aWQtaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmludGVyL3ByaW50ZXItbGlxdWlkLWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXNEO0FBQ3RELG1DQXVCaUI7QUFDakIsbUNBQXNDO0FBRXRDLGlFQUF3RDtBQUN4RCwyQ0FNeUI7QUFDekIscURBQXVEO0FBQ3ZELDZDQUc2QjtBQUM3QixtREFLZ0M7QUFDaEMsdURBQXlEO0FBQ3pELDJDQUF3QztBQUN4QyxxQ0FBMEM7QUFFMUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLGNBQUcsQ0FBQztBQUN6QixNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsUUFBUSxDQUFDO0FBRXpFLFNBQVMsZUFBZSxDQUt0QixJQUFnQixFQUFFLFFBQTZCLEVBQUUsS0FBb0I7SUFDckUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLElBQUksSUFBQSxlQUFPLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3hDLE9BQU8sS0FBSyxDQUNWO1FBQ0UsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLElBQUksQ0FDRixJQUFJLEVBQ0osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUN4QztTQUNGLENBQUM7UUFDRixRQUFRO0tBQ1QsRUFDRDtRQUNFLFdBQVcsRUFBRSxJQUFBLDJCQUFtQixFQUM5QixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQzdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQzVCO0tBQ0Ys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