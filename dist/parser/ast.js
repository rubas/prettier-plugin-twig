"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walk = exports.cstToAst = exports.toLiquidHtmlAST = exports.isBranchedTag = exports.RawMarkupKinds = void 0;
const cst_1 = require("../parser/cst");
const types_1 = require("../types");
const utils_1 = require("../utils");
const errors_1 = require("../parser/errors");
const grammar_1 = require("../parser/grammar");
var RawMarkupKinds;
(function (RawMarkupKinds) {
    RawMarkupKinds["css"] = "css";
    RawMarkupKinds["html"] = "html";
    RawMarkupKinds["javascript"] = "javascript";
    RawMarkupKinds["json"] = "json";
    RawMarkupKinds["markdown"] = "markdown";
    RawMarkupKinds["typescript"] = "typescript";
    RawMarkupKinds["text"] = "text";
})(RawMarkupKinds = exports.RawMarkupKinds || (exports.RawMarkupKinds = {}));
function isBranchedTag(node) {
    return (node.type === types_1.NodeTypes.LiquidTag &&
        ['if', 'for', 'unless', 'case'].includes(node.name));
}
exports.isBranchedTag = isBranchedTag;
function isLiquidBranchDisguisedAsTag(node) {
    return (node.type === types_1.NodeTypes.LiquidTag &&
        ['else', 'elsif', 'when'].includes(node.name));
}
function toLiquidHtmlAST(text) {
    const cst = (0, cst_1.toLiquidHtmlCST)(text);
    const root = {
        type: types_1.NodeTypes.Document,
        source: text,
        children: cstToAst(cst, text),
        name: '#document',
        position: {
            start: 0,
            end: text.length,
        },
    };
    return root;
}
exports.toLiquidHtmlAST = toLiquidHtmlAST;
class ASTBuilder {
    constructor(source) {
        this.ast = [];
        this.cursor = [];
        this.source = source;
    }
    get current() {
        return (0, utils_1.deepGet)(this.cursor, this.ast);
    }
    get currentPosition() {
        return (this.current || []).length - 1;
    }
    get parent() {
        if (this.cursor.length == 0)
            return undefined;
        return (0, utils_1.deepGet)((0, utils_1.dropLast)(1, this.cursor), this.ast);
    }
    open(node) {
        this.current.push(node);
        this.cursor.push(this.currentPosition);
        this.cursor.push('children');
        if (isBranchedTag(node)) {
            this.open(toUnnamedLiquidBranch(node, this.source));
        }
    }
    push(node) {
        var _a;
        if (node.type === types_1.NodeTypes.LiquidTag &&
            isLiquidBranchDisguisedAsTag(node)) {
            this.cursor.pop();
            this.cursor.pop();
            this.open(toNamedLiquidBranchBaseCase(node, this.source));
        }
        else if (node.type === types_1.NodeTypes.LiquidBranch) {
            this.cursor.pop();
            this.cursor.pop();
            this.open(node);
        }
        else {
            if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.type) === types_1.NodeTypes.LiquidBranch) {
                this.parent.position.end = node.position.end;
            }
            this.current.push(node);
        }
    }
    close(node, nodeType) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.type) === types_1.NodeTypes.LiquidBranch) {
            this.parent.position.end = node.locStart;
            this.cursor.pop();
            this.cursor.pop();
        }
        if (getName(this.parent) !== getName(node) ||
            ((_b = this.parent) === null || _b === void 0 ? void 0 : _b.type) !== nodeType) {
            throw new errors_1.LiquidHTMLASTParsingError(`Attempting to close ${nodeType} '${node.name}' before ${(_c = this.parent) === null || _c === void 0 ? void 0 : _c.type} '${(_d = this.parent) === null || _d === void 0 ? void 0 : _d.name}' was closed`, this.source, ((_f = (_e = this.parent) === null || _e === void 0 ? void 0 : _e.position) === null || _f === void 0 ? void 0 : _f.start) || 0, node.locEnd);
        }
        this.parent.position.end = node.locEnd;
        this.parent.blockEndPosition = position(node);
        if (this.parent.type == types_1.NodeTypes.LiquidTag &&
            node.type == cst_1.ConcreteNodeTypes.LiquidTagClose) {
            this.parent.delimiterWhitespaceStart = (_g = node.whitespaceStart) !== null && _g !== void 0 ? _g : '';
            this.parent.delimiterWhitespaceEnd = (_h = node.whitespaceEnd) !== null && _h !== void 0 ? _h : '';
        }
        this.cursor.pop();
        this.cursor.pop();
    }
}
function getName(node) {
    if (!node)
        return null;
    switch (node.type) {
        case types_1.NodeTypes.HtmlElement:
        case cst_1.ConcreteNodeTypes.HtmlTagClose:
            if (typeof node.name === 'string') {
                return node.name;
            }
            else if (typeof node.name.markup === 'string') {
                return `{{${node.name.markup.trim()}}}`;
            }
            else {
                return `{{${node.name.markup.rawSource}}}`;
            }
        default:
            return node.name;
    }
}
function cstToAst(cst, source) {
    var _a, _b, _c, _d;
    const builder = new ASTBuilder(source);
    for (const node of cst) {
        switch (node.type) {
            case cst_1.ConcreteNodeTypes.TextNode: {
                builder.push({
                    type: types_1.NodeTypes.TextNode,
                    value: node.value,
                    position: position(node),
                    source,
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.LiquidDrop: {
                builder.push(toLiquidDrop(node, source));
                break;
            }
            case cst_1.ConcreteNodeTypes.LiquidTagOpen: {
                builder.open(toLiquidTag(node, source, { isBlockTag: true }));
                break;
            }
            case cst_1.ConcreteNodeTypes.LiquidTagClose: {
                builder.close(node, types_1.NodeTypes.LiquidTag);
                break;
            }
            case cst_1.ConcreteNodeTypes.LiquidTag: {
                builder.push(toLiquidTag(node, source));
                break;
            }
            case cst_1.ConcreteNodeTypes.LiquidRawTag: {
                builder.push({
                    type: types_1.NodeTypes.LiquidRawTag,
                    name: node.name,
                    body: toRawMarkup(node, source),
                    whitespaceStart: (_a = node.whitespaceStart) !== null && _a !== void 0 ? _a : '',
                    whitespaceEnd: (_b = node.whitespaceEnd) !== null && _b !== void 0 ? _b : '',
                    delimiterWhitespaceStart: (_c = node.delimiterWhitespaceStart) !== null && _c !== void 0 ? _c : '',
                    delimiterWhitespaceEnd: (_d = node.delimiterWhitespaceEnd) !== null && _d !== void 0 ? _d : '',
                    position: position(node),
                    blockStartPosition: {
                        start: node.blockStartLocStart,
                        end: node.blockStartLocEnd,
                    },
                    blockEndPosition: {
                        start: node.blockEndLocStart,
                        end: node.blockEndLocEnd,
                    },
                    source,
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlTagOpen: {
                builder.open(toHtmlElement(node, source));
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlTagClose: {
                builder.close(node, types_1.NodeTypes.HtmlElement);
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlVoidElement: {
                builder.push(toHtmlVoidElement(node, source));
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlSelfClosingElement: {
                builder.push(toHtmlSelfClosingElement(node, source));
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlDoctype: {
                builder.push({
                    type: types_1.NodeTypes.HtmlDoctype,
                    legacyDoctypeString: node.legacyDoctypeString,
                    position: position(node),
                    source,
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlComment: {
                builder.push({
                    type: types_1.NodeTypes.HtmlComment,
                    body: node.body,
                    position: position(node),
                    source,
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.HtmlRawTag: {
                builder.push({
                    type: types_1.NodeTypes.HtmlRawNode,
                    name: node.name,
                    body: toRawMarkup(node, source),
                    attributes: toAttributes(node.attrList || [], source),
                    position: position(node),
                    source,
                    blockStartPosition: {
                        start: node.blockStartLocStart,
                        end: node.blockStartLocEnd,
                    },
                    blockEndPosition: {
                        start: node.blockEndLocStart,
                        end: node.blockEndLocEnd,
                    },
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.AttrEmpty: {
                builder.push({
                    type: types_1.NodeTypes.AttrEmpty,
                    name: node.name,
                    position: position(node),
                    source,
                });
                break;
            }
            case cst_1.ConcreteNodeTypes.AttrSingleQuoted:
            case cst_1.ConcreteNodeTypes.AttrDoubleQuoted:
            case cst_1.ConcreteNodeTypes.AttrUnquoted: {
                const abstractNode = {
                    type: node.type,
                    name: node.name,
                    position: position(node),
                    source,
                    attributePosition: { start: -1, end: -1 },
                    value: [],
                };
                const value = toAttributeValue(node.value, source);
                abstractNode.value = value;
                abstractNode.attributePosition = toAttributePosition(node, value);
                builder.push(abstractNode);
                break;
            }
            case cst_1.ConcreteNodeTypes.YAMLFrontmatter: {
                builder.push({
                    type: types_1.NodeTypes.YAMLFrontmatter,
                    body: node.body,
                    position: position(node),
                    source,
                });
                break;
            }
            default: {
                (0, utils_1.assertNever)(node);
            }
        }
    }
    return builder.ast;
}
exports.cstToAst = cstToAst;
function toAttributePosition(node, value) {
    if (value.length === 0) {
        return {
            start: node.locStart + node.name.length + '='.length + '"'.length,
            end: node.locStart + node.name.length + '='.length + '"'.length,
        };
    }
    return {
        start: value[0].position.start,
        end: value[value.length - 1].position.end,
    };
}
function toAttributeValue(value, source) {
    return cstToAst(value, source);
}
function toAttributes(attrList, source) {
    return cstToAst(attrList, source);
}
function toName(name, source) {
    if (typeof name === 'string')
        return name;
    return toLiquidDrop(name, source);
}
function liquidTagBaseAttributes(node, source) {
    var _a, _b;
    return {
        type: types_1.NodeTypes.LiquidTag,
        position: position(node),
        whitespaceStart: (_a = node.whitespaceStart) !== null && _a !== void 0 ? _a : '',
        whitespaceEnd: (_b = node.whitespaceEnd) !== null && _b !== void 0 ? _b : '',
        blockStartPosition: position(node),
        source,
    };
}
function liquidBranchBaseAttributes(node, source) {
    var _a, _b;
    return {
        type: types_1.NodeTypes.LiquidBranch,
        children: [],
        position: position(node),
        whitespaceStart: (_a = node.whitespaceStart) !== null && _a !== void 0 ? _a : '',
        whitespaceEnd: (_b = node.whitespaceEnd) !== null && _b !== void 0 ? _b : '',
        blockStartPosition: position(node),
        source,
    };
}
function toLiquidTag(node, source, { isBlockTag } = { isBlockTag: false }) {
    if (typeof node.markup !== 'string') {
        return toNamedLiquidTag(node, source);
    }
    else if (isBlockTag) {
        return Object.assign({ name: node.name, markup: markup(node.name, node.markup), children: isBlockTag ? [] : undefined }, liquidTagBaseAttributes(node, source));
    }
    return Object.assign({ name: node.name, markup: markup(node.name, node.markup) }, liquidTagBaseAttributes(node, source));
}
function toNamedLiquidTag(node, source) {
    switch (node.name) {
        case types_1.NamedTags.echo: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: types_1.NamedTags.echo, markup: toLiquidVariable(node.markup, source) });
        }
        case types_1.NamedTags.assign: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: types_1.NamedTags.assign, markup: toAssignMarkup(node.markup, source) });
        }
        case types_1.NamedTags.cycle: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toCycleMarkup(node.markup, source) });
        }
        case types_1.NamedTags.increment:
        case types_1.NamedTags.decrement: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toExpression(node.markup, source) });
        }
        case types_1.NamedTags.capture: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toExpression(node.markup, source), children: [] });
        }
        case types_1.NamedTags.include:
        case types_1.NamedTags.render: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toRenderMarkup(node.markup, source) });
        }
        case types_1.NamedTags.layout:
        case types_1.NamedTags.section: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toExpression(node.markup, source) });
        }
        case types_1.NamedTags.form: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: node.markup.map((arg) => toLiquidArgument(arg, source)), children: [] });
        }
        case types_1.NamedTags.tablerow:
        case types_1.NamedTags.for: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toForMarkup(node.markup, source), children: [] });
        }
        case types_1.NamedTags.paginate: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toPaginateMarkup(node.markup, source), children: [] });
        }
        case types_1.NamedTags.if:
        case types_1.NamedTags.unless: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toConditionalExpression(node.markup, source), children: [] });
        }
        case types_1.NamedTags.elsif: {
            return Object.assign(Object.assign({}, liquidBranchBaseAttributes(node, source)), { name: node.name, markup: toConditionalExpression(node.markup, source) });
        }
        case types_1.NamedTags.case: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: toExpression(node.markup, source), children: [] });
        }
        case types_1.NamedTags.when: {
            return Object.assign(Object.assign({}, liquidBranchBaseAttributes(node, source)), { name: node.name, markup: node.markup.map((arg) => toExpression(arg, source)) });
        }
        case types_1.NamedTags.liquid: {
            return Object.assign(Object.assign({}, liquidTagBaseAttributes(node, source)), { name: node.name, markup: cstToAst(node.markup, source) });
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
function toNamedLiquidBranchBaseCase(node, source) {
    return {
        name: node.name,
        type: types_1.NodeTypes.LiquidBranch,
        markup: node.markup,
        position: Object.assign({}, node.position),
        children: [],
        blockStartPosition: Object.assign({}, node.position),
        whitespaceStart: node.whitespaceStart,
        whitespaceEnd: node.whitespaceEnd,
        source,
    };
}
function toUnnamedLiquidBranch(parentNode, source) {
    return {
        type: types_1.NodeTypes.LiquidBranch,
        name: null,
        markup: '',
        position: {
            start: parentNode.position.end,
            end: parentNode.position.end,
        },
        blockStartPosition: {
            start: parentNode.position.end,
            end: parentNode.position.end,
        },
        children: [],
        whitespaceStart: '',
        whitespaceEnd: '',
        source,
    };
}
function toAssignMarkup(node, source) {
    return {
        type: types_1.NodeTypes.AssignMarkup,
        name: node.name,
        value: toLiquidVariable(node.value, source),
        position: position(node),
        source,
    };
}
function toCycleMarkup(node, source) {
    return {
        type: types_1.NodeTypes.CycleMarkup,
        groupName: node.groupName ? toExpression(node.groupName, source) : null,
        args: node.args.map((arg) => toExpression(arg, source)),
        position: position(node),
        source,
    };
}
function toForMarkup(node, source) {
    return {
        type: types_1.NodeTypes.ForMarkup,
        variableName: node.variableName,
        collection: toExpression(node.collection, source),
        args: node.args.map((arg) => toNamedArgument(arg, source)),
        reversed: !!node.reversed,
        position: position(node),
        source,
    };
}
function toPaginateMarkup(node, source) {
    return {
        type: types_1.NodeTypes.PaginateMarkup,
        collection: toExpression(node.collection, source),
        pageSize: toExpression(node.pageSize, source),
        position: position(node),
        args: node.args ? node.args.map((arg) => toNamedArgument(arg, source)) : [],
        source,
    };
}
function toRawMarkup(node, source) {
    return {
        type: types_1.NodeTypes.RawMarkup,
        kind: toRawMarkupKind(node),
        value: node.body,
        position: {
            start: node.blockStartLocEnd,
            end: node.blockEndLocStart,
        },
        source,
    };
}
function toRawMarkupKind(node) {
    switch (node.type) {
        case cst_1.ConcreteNodeTypes.HtmlRawTag:
            return toRawMarkupKindFromHtmlNode(node);
        case cst_1.ConcreteNodeTypes.LiquidRawTag:
            return toRawMarkupKindFromLiquidNode(node);
        default:
            return (0, utils_1.assertNever)(node);
    }
}
const liquidToken = /(\{%|\{\{)-?/g;
function toRawMarkupKindFromHtmlNode(node) {
    var _a;
    switch (node.name) {
        case 'script': {
            const scriptAttr = (_a = node.attrList) === null || _a === void 0 ? void 0 : _a.find((attr) => 'name' in attr && attr.name === 'type');
            if (!scriptAttr ||
                !('value' in scriptAttr) ||
                scriptAttr.value.length === 0 ||
                scriptAttr.value[0].type !== cst_1.ConcreteNodeTypes.TextNode) {
                return RawMarkupKinds.javascript;
            }
            const type = scriptAttr.value[0].value;
            if (type === 'text/markdown') {
                return RawMarkupKinds.markdown;
            }
            if (type === 'application/x-typescript') {
                return RawMarkupKinds.typescript;
            }
            if (type === 'text/html') {
                return RawMarkupKinds.html;
            }
            if ((type && (type.endsWith('json') || type.endsWith('importmap'))) ||
                type === 'speculationrules') {
                return RawMarkupKinds.json;
            }
            return RawMarkupKinds.javascript;
        }
        case 'style':
            if (liquidToken.test(node.body)) {
                return RawMarkupKinds.text;
            }
            return RawMarkupKinds.css;
        default:
            return RawMarkupKinds.text;
    }
}
function toRawMarkupKindFromLiquidNode(node) {
    switch (node.name) {
        case 'javascript':
            return RawMarkupKinds.javascript;
        case 'style':
            if (liquidToken.test(node.body)) {
                return RawMarkupKinds.text;
            }
            return RawMarkupKinds.css;
        case 'schema':
            return RawMarkupKinds.json;
        default:
            return RawMarkupKinds.text;
    }
}
function toRenderMarkup(node, source) {
    return {
        type: types_1.NodeTypes.RenderMarkup,
        snippet: toExpression(node.snippet, source),
        alias: node.alias,
        variable: toRenderVariableExpression(node.variable, source),
        args: node.args.map((arg) => toNamedArgument(arg, source)),
        position: position(node),
        source,
    };
}
function toRenderVariableExpression(node, source) {
    if (!node)
        return null;
    return {
        type: types_1.NodeTypes.RenderVariableExpression,
        kind: node.kind,
        name: toExpression(node.name, source),
        position: position(node),
        source,
    };
}
function toConditionalExpression(nodes, source) {
    if (nodes.length === 1) {
        return toComparisonOrExpression(nodes[0], source);
    }
    const [first, second] = nodes;
    const [, ...rest] = nodes;
    return {
        type: types_1.NodeTypes.LogicalExpression,
        relation: second.relation,
        left: toComparisonOrExpression(first, source),
        right: toConditionalExpression(rest, source),
        position: {
            start: first.locStart,
            end: nodes[nodes.length - 1].locEnd,
        },
        source,
    };
}
function toComparisonOrExpression(node, source) {
    const expression = node.expression;
    switch (expression.type) {
        case cst_1.ConcreteNodeTypes.Comparison:
            return toComparison(expression, source);
        default:
            return toExpression(expression, source);
    }
}
function toComparison(node, source) {
    return {
        type: types_1.NodeTypes.Comparison,
        comparator: node.comparator,
        left: toExpression(node.left, source),
        right: toExpression(node.right, source),
        position: position(node),
        source,
    };
}
function toLiquidDrop(node, source) {
    var _a, _b;
    return {
        type: types_1.NodeTypes.LiquidDrop,
        markup: typeof node.markup === 'string'
            ? node.markup
            : toLiquidVariable(node.markup, source),
        whitespaceStart: (_a = node.whitespaceStart) !== null && _a !== void 0 ? _a : '',
        whitespaceEnd: (_b = node.whitespaceEnd) !== null && _b !== void 0 ? _b : '',
        position: position(node),
        source,
    };
}
function toLiquidVariable(node, source) {
    return {
        type: types_1.NodeTypes.LiquidVariable,
        expression: toExpression(node.expression, source),
        filters: node.filters.map((filter) => toFilter(filter, source)),
        position: position(node),
        rawSource: node.rawSource,
        source,
    };
}
function toExpression(node, source) {
    switch (node.type) {
        case cst_1.ConcreteNodeTypes.String: {
            return {
                type: types_1.NodeTypes.String,
                position: position(node),
                single: node.single,
                value: node.value,
                source,
            };
        }
        case cst_1.ConcreteNodeTypes.Number: {
            return {
                type: types_1.NodeTypes.Number,
                position: position(node),
                value: node.value,
                source,
            };
        }
        case cst_1.ConcreteNodeTypes.LiquidLiteral: {
            return {
                type: types_1.NodeTypes.LiquidLiteral,
                position: position(node),
                value: node.value,
                keyword: node.keyword,
                source,
            };
        }
        case cst_1.ConcreteNodeTypes.Range: {
            return {
                type: types_1.NodeTypes.Range,
                start: toExpression(node.start, source),
                end: toExpression(node.end, source),
                position: position(node),
                source,
            };
        }
        case cst_1.ConcreteNodeTypes.VariableLookup: {
            return {
                type: types_1.NodeTypes.VariableLookup,
                name: node.name,
                lookups: node.lookups.map((lookup) => toExpression(lookup, source)),
                position: position(node),
                source,
            };
        }
        default: {
            return (0, utils_1.assertNever)(node);
        }
    }
}
function toFilter(node, source) {
    return {
        type: types_1.NodeTypes.LiquidFilter,
        name: node.name,
        args: node.args.map((arg) => toLiquidArgument(arg, source)),
        position: position(node),
        source,
    };
}
function toLiquidArgument(node, source) {
    switch (node.type) {
        case cst_1.ConcreteNodeTypes.NamedArgument: {
            return toNamedArgument(node, source);
        }
        default: {
            return toExpression(node, source);
        }
    }
}
function toNamedArgument(node, source) {
    return {
        type: types_1.NodeTypes.NamedArgument,
        name: node.name,
        value: toExpression(node.value, source),
        position: position(node),
        source,
    };
}
function toHtmlElement(node, source) {
    return {
        type: types_1.NodeTypes.HtmlElement,
        name: toName(node.name, source),
        attributes: toAttributes(node.attrList || [], source),
        position: position(node),
        blockStartPosition: position(node),
        blockEndPosition: { start: -1, end: -1 },
        children: [],
        source,
    };
}
function toHtmlVoidElement(node, source) {
    return {
        type: types_1.NodeTypes.HtmlVoidElement,
        name: node.name,
        attributes: toAttributes(node.attrList || [], source),
        position: position(node),
        blockStartPosition: position(node),
        source,
    };
}
function toHtmlSelfClosingElement(node, source) {
    return {
        type: types_1.NodeTypes.HtmlSelfClosingElement,
        name: toName(node.name, source),
        attributes: toAttributes(node.attrList || [], source),
        position: position(node),
        blockStartPosition: position(node),
        source,
    };
}
function markup(name, markup) {
    if (grammar_1.TAGS_WITHOUT_MARKUP.includes(name))
        return '';
    return markup;
}
function position(node) {
    return {
        start: node.locStart,
        end: node.locEnd,
    };
}
function walk(ast, fn, parentNode) {
    for (const key of Object.keys(ast)) {
        if (['parentNode', 'prev', 'next', 'firstChild', 'lastChild'].includes(key)) {
            continue;
        }
        const value = ast[key];
        if (Array.isArray(value)) {
            value
                .filter(types_1.isLiquidHtmlNode)
                .forEach((node) => walk(node, fn, ast));
        }
        else if ((0, types_1.isLiquidHtmlNode)(value)) {
            walk(value, fn, ast);
        }
    }
    fn(ast, parentNode);
}
exports.walk = walk;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BhcnNlci9hc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBb0NzQjtBQUN0QixtQ0FNaUI7QUFDakIsbUNBQXlEO0FBQ3pELDRDQUE0RDtBQUM1RCw4Q0FBdUQ7QUE4VXZELElBQVksY0FRWDtBQVJELFdBQVksY0FBYztJQUN4Qiw2QkFBVyxDQUFBO0lBQ1gsK0JBQWEsQ0FBQTtJQUNiLDJDQUF5QixDQUFBO0lBQ3pCLCtCQUFhLENBQUE7SUFDYix1Q0FBcUIsQ0FBQTtJQUNyQiwyQ0FBeUIsQ0FBQTtJQUN6QiwrQkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQVJXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBUXpCO0FBMkRELFNBQWdCLGFBQWEsQ0FBQyxJQUFvQjtJQUNoRCxPQUFPLENBQ0wsSUFBSSxDQUFDLElBQUksS0FBSyxpQkFBUyxDQUFDLFNBQVM7UUFDakMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNwRCxDQUFDO0FBQ0osQ0FBQztBQUxELHNDQUtDO0FBR0QsU0FBUyw0QkFBNEIsQ0FDbkMsSUFBb0I7SUFFcEIsT0FBTyxDQUNMLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQVMsQ0FBQyxTQUFTO1FBQ2pDLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUM5QyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxJQUFZO0lBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUEscUJBQWUsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxNQUFNLElBQUksR0FBaUI7UUFDekIsSUFBSSxFQUFFLGlCQUFTLENBQUMsUUFBUTtRQUN4QixNQUFNLEVBQUUsSUFB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