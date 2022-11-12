"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLiquidHtmlCST = exports.LiquidLiteralValues = exports.ConcreteNodeTypes = void 0;
const extras_1 = require("ohm-js/extras");
const grammar_1 = require("../parser/grammar");
const errors_1 = require("../parser/errors");
const types_1 = require("../types");
var ConcreteNodeTypes;
(function (ConcreteNodeTypes) {
    ConcreteNodeTypes["HtmlDoctype"] = "HtmlDoctype";
    ConcreteNodeTypes["HtmlComment"] = "HtmlComment";
    ConcreteNodeTypes["HtmlRawTag"] = "HtmlRawTag";
    ConcreteNodeTypes["HtmlVoidElement"] = "HtmlVoidElement";
    ConcreteNodeTypes["HtmlSelfClosingElement"] = "HtmlSelfClosingElement";
    ConcreteNodeTypes["HtmlTagOpen"] = "HtmlTagOpen";
    ConcreteNodeTypes["HtmlTagClose"] = "HtmlTagClose";
    ConcreteNodeTypes["AttrSingleQuoted"] = "AttrSingleQuoted";
    ConcreteNodeTypes["AttrDoubleQuoted"] = "AttrDoubleQuoted";
    ConcreteNodeTypes["AttrUnquoted"] = "AttrUnquoted";
    ConcreteNodeTypes["AttrEmpty"] = "AttrEmpty";
    ConcreteNodeTypes["LiquidDrop"] = "LiquidDrop";
    ConcreteNodeTypes["LiquidRawTag"] = "LiquidRawTag";
    ConcreteNodeTypes["LiquidTag"] = "LiquidTag";
    ConcreteNodeTypes["LiquidTagOpen"] = "LiquidTagOpen";
    ConcreteNodeTypes["LiquidTagClose"] = "LiquidTagClose";
    ConcreteNodeTypes["TextNode"] = "TextNode";
    ConcreteNodeTypes["YAMLFrontmatter"] = "YAMLFrontmatter";
    ConcreteNodeTypes["LiquidVariable"] = "LiquidVariable";
    ConcreteNodeTypes["LiquidFilter"] = "LiquidFilter";
    ConcreteNodeTypes["NamedArgument"] = "NamedArgument";
    ConcreteNodeTypes["LiquidLiteral"] = "LiquidLiteral";
    ConcreteNodeTypes["VariableLookup"] = "VariableLookup";
    ConcreteNodeTypes["String"] = "String";
    ConcreteNodeTypes["Number"] = "Number";
    ConcreteNodeTypes["Range"] = "Range";
    ConcreteNodeTypes["Comparison"] = "Comparison";
    ConcreteNodeTypes["Condition"] = "Condition";
    ConcreteNodeTypes["AssignMarkup"] = "AssignMarkup";
    ConcreteNodeTypes["CycleMarkup"] = "CycleMarkup";
    ConcreteNodeTypes["ForMarkup"] = "ForMarkup";
    ConcreteNodeTypes["RenderMarkup"] = "RenderMarkup";
    ConcreteNodeTypes["PaginateMarkup"] = "PaginateMarkup";
    ConcreteNodeTypes["RenderVariableExpression"] = "RenderVariableExpression";
})(ConcreteNodeTypes = exports.ConcreteNodeTypes || (exports.ConcreteNodeTypes = {}));
exports.LiquidLiteralValues = {
    nil: null,
    null: null,
    true: true,
    false: false,
    blank: '',
    empty: '',
};
const markup = (i) => (tokens) => tokens[i].sourceString.trim();
const markupTrimEnd = (i) => (tokens) => tokens[i].sourceString.trimEnd();
function toLiquidHtmlCST(text) {
    let liquidStatementOffset = 0;
    const locStart = (tokens) => liquidStatementOffset + tokens[0].source.startIdx;
    const locEnd = (tokens) => liquidStatementOffset + tokens[tokens.length - 1].source.endIdx;
    const locEndSecondToLast = (tokens) => liquidStatementOffset + tokens[tokens.length - 2].source.endIdx;
    const textNode = {
        type: ConcreteNodeTypes.TextNode,
        value: function () {
            return this.sourceString;
        },
        locStart,
        locEnd,
    };
    const res = grammar_1.liquidHtmlGrammar.match(text, 'Node');
    if (res.failed()) {
        throw new errors_1.LiquidHTMLCSTParsingError(res);
    }
    const HelperMappings = {
        Node: 0,
        TextNode: textNode,
        orderedListOf: 0,
        listOf: 0,
        empty: () => null,
        emptyListOf: () => [],
        nonemptyListOf(first, _sep, rest) {
            const self = this;
            return [first.toAST(self.args.mapping)].concat(rest.toAST(self.args.mapping));
        },
        nonemptyOrderedListOf: 0,
        nonemptyOrderedListOfBoth(nonemptyListOfA, _sep, nonemptyListOfB) {
            const self = this;
            return nonemptyListOfA
                .toAST(self.args.mapping)
                .concat(nonemptyListOfB.toAST(self.args.mapping));
        },
    };
    const LiquidMappings = {
        liquidNode: 0,
        liquidRawTag: 0,
        liquidRawTagImpl: {
            type: ConcreteNodeTypes.LiquidRawTag,
            name: 3,
            body: 8,
            whitespaceStart: 1,
            whitespaceEnd: 6,
            delimiterWhitespaceStart: 10,
            delimiterWhitespaceEnd: 15,
            locStart,
            locEnd,
            blockStartLocStart: (tokens) => tokens[0].source.startIdx,
            blockStartLocEnd: (tokens) => tokens[7].source.endIdx,
            blockEndLocStart: (tokens) => tokens[9].source.startIdx,
            blockEndLocEnd: (tokens) => tokens[16].source.endIdx,
        },
        liquidBlockComment: {
            type: ConcreteNodeTypes.LiquidRawTag,
            name: 'comment',
            body: (tokens) => tokens[1].sourceString,
            whitespaceStart: (tokens) => tokens[0].children[1].sourceString,
            whitespaceEnd: (tokens) => tokens[0].children[6].sourceString,
            delimiterWhitespaceStart: (tokens) => tokens[2].children[1].sourceString,
            delimiterWhitespaceEnd: (tokens) => tokens[2].children[6].sourceString,
            locStart,
            locEnd,
            blockStartLocStart: (tokens) => tokens[0].source.startIdx,
            blockStartLocEnd: (tokens) => tokens[0].source.endIdx,
            blockEndLocStart: (tokens) => tokens[2].source.startIdx,
            blockEndLocEnd: (tokens) => tokens[2].source.endIdx,
        },
        liquidInlineComment: {
            type: ConcreteNodeTypes.LiquidTag,
            name: 3,
            markup: markupTrimEnd(5),
            whitespaceStart: 1,
            whitespaceEnd: 6,
            locStart,
            locEnd,
        },
        liquidTagOpen: 0,
        liquidTagOpenBaseCase: 0,
        liquidTagOpenRule: {
            type: ConcreteNodeTypes.LiquidTagOpen,
            name: 3,
            markup(nodes) {
                const markupNode = nodes[5];
                const nameNode = nodes[3];
                if (types_1.NamedTags.hasOwnProperty(nameNode.sourceString)) {
                    return markupNode.toAST(this.args.mapping);
                }
                return markupNode.sourceString.trim();
            },
            whitespaceStart: 1,
            whitespaceEnd: 6,
            locStart,
            locEnd,
        },
        liquidTagOpenCapture: 0,
        liquidTagOpenForm: 0,
        liquidTagOpenFormMarkup: 0,
        liquidTagOpenFor: 0,
        liquidTagOpenForMarkup: {
            type: ConcreteNodeTypes.ForMarkup,
            variableName: 0,
            collection: 4,
            reversed: 6,
            args: 8,
            locStart,
            locEnd,
        },
        liquidTagOpenTablerow: 0,
        liquidTagOpenPaginate: 0,
        liquidTagOpenPaginateMarkup: {
            type: ConcreteNodeTypes.PaginateMarkup,
            collection: 0,
            pageSize: 4,
            args: 6,
            locStart,
            locEnd,
        },
        liquidTagOpenCase: 0,
        liquidTagOpenCaseMarkup: 0,
        liquidTagWhen: 0,
        liquidTagWhenMarkup: 0,
        liquidTagOpenIf: 0,
        liquidTagOpenUnless: 0,
        liquidTagElsif: 0,
        liquidTagOpenConditionalMarkup: 0,
        condition: {
            type: ConcreteNodeTypes.Condition,
            relation: 0,
            expression: 2,
            locStart,
            locEnd,
        },
        comparison: {
            type: ConcreteNodeTypes.Comparison,
            comparator: 2,
            left: 0,
            right: 4,
            locStart,
            locEnd,
        },
        liquidTagClose: {
            type: ConcreteNodeTypes.LiquidTagClose,
            name: 4,
            whitespaceStart: 1,
            whitespaceEnd: 7,
            locStart,
            locEnd,
        },
        liquidTag: 0,
        liquidTagBaseCase: 0,
        liquidTagAssign: 0,
        liquidTagEcho: 0,
        liquidTagCycle: 0,
        liquidTagIncrement: 0,
        liquidTagDecrement: 0,
        liquidTagRender: 0,
        liquidTagInclude: 0,
        liquidTagSection: 0,
        liquidTagLayout: 0,
        liquidTagRule: {
            type: ConcreteNodeTypes.LiquidTag,
            name: 3,
            markup(nodes) {
                const markupNode = nodes[5];
                const nameNode = nodes[3];
                if (types_1.NamedTags.hasOwnProperty(nameNode.sourceString)) {
                    return markupNode.toAST(this.args.mapping);
                }
                return markupNode.sourceString.trim();
            },
            whitespaceStart: 1,
            whitespaceEnd: 6,
            locStart,
            locEnd,
        },
        liquidTagLiquid: 0,
        liquidTagLiquidMarkup(tagMarkup) {
            const res = grammar_1.liquidHtmlGrammars['LiquidStatement'].match(tagMarkup.sourceString, 'Node');
            if (res.failed()) {
                throw new errors_1.LiquidHTMLCSTParsingError(res);
            }
            liquidStatementOffset = tagMarkup.source.startIdx;
            const subCST = (0, extras_1.toAST)(res, Object.assign(Object.assign(Object.assign({}, HelperMappings), LiquidMappings), LiquidStatement));
            liquidStatementOffset = 0;
            return subCST;
        },
        liquidTagEchoMarkup: 0,
        liquidTagSectionMarkup: 0,
        liquidTagLayoutMarkup: 0,
        liquidTagAssignMarkup: {
            type: ConcreteNodeTypes.AssignMarkup,
            name: 0,
            value: 4,
            locStart,
            locEnd,
        },
        liquidTagCycleMarkup: {
            type: ConcreteNodeTypes.CycleMarkup,
            groupName: 0,
            args: 3,
            locStart,
            locEnd,
        },
        liquidTagRenderMarkup: {
            type: ConcreteNodeTypes.RenderMarkup,
            snippet: 0,
            variable: 1,
            alias: 2,
            args: 4,
            locStart,
            locEnd,
        },
        snippetExpression: 0,
        renderVariableExpression: {
            type: ConcreteNodeTypes.RenderVariableExpression,
            kind: 1,
            name: 3,
            locStart,
            locEnd,
        },
        renderAliasExpression: 3,
        liquidDrop: {
            type: ConcreteNodeTypes.LiquidDrop,
            markup: 3,
            whitespaceStart: 1,
            whitespaceEnd: 4,
            locStart,
            locEnd,
        },
        liquidDropCases: 0,
        liquidExpression: 0,
        liquidDropBaseCase: (sw) => sw.sourceString.trimEnd(),
        liquidVariable: {
            type: ConcreteNodeTypes.LiquidVariable,
            expression: 0,
            filters: 1,
            rawSource: (tokens) => text
                .slice(locStart(tokens), tokens[tokens.length - 2].source.endIdx)
                .trimEnd(),
            locStart,
            locEnd: (tokens) => tokens[tokens.length - 2].source.endIdx,
        },
        liquidFilter: {
            type: ConcreteNodeTypes.LiquidFilter,
            name: 3,
            locStart,
            locEnd,
            args(nodes) {
                if (nodes[7].sourceString === '') {
                    return [];
                }
                else {
                    return nodes[7].toAST(this.args.mapping);
                }
            },
        },
        arguments: 0,
        tagArguments: 0,
        positionalArgument: 0,
        namedArgument: {
            type: ConcreteNodeTypes.NamedArgument,
            name: 0,
            value: 4,
            locStart,
            locEnd,
        },
        liquidString: 0,
        liquidDoubleQuotedString: {
            type: ConcreteNodeTypes.String,
            single: () => false,
            value: 1,
            locStart,
            locEnd,
        },
        liquidSingleQuotedString: {
            type: ConcreteNodeTypes.String,
            single: () => true,
            value: 1,
            locStart,
            locEnd,
        },
        liquidNumber: {
            type: ConcreteNodeTypes.Number,
            value: 0,
            locStart,
            locEnd,
        },
        liquidLiteral: {
            type: ConcreteNodeTypes.LiquidLiteral,
            value: (tokens) => {
                const keyword = tokens[0]
                    .sourceString;
                return exports.LiquidLiteralValues[keyword];
            },
            keyword: 0,
            locStart,
            locEnd,
        },
        liquidRange: {
            type: ConcreteNodeTypes.Range,
            start: 2,
            end: 6,
            locStart,
            locEnd,
        },
        liquidVariableLookup: {
            type: ConcreteNodeTypes.VariableLookup,
            name: 0,
            lookups: 1,
            locStart,
            locEnd,
        },
        variableSegmentAsLookupMarkup: 0,
        variableSegmentAsLookup: {
            type: ConcreteNodeTypes.VariableLookup,
            name: 0,
            lookups: () => [],
            locStart,
            locEnd,
        },
        lookup: 0,
        indexLookup: 3,
        dotLookup: {
            type: ConcreteNodeTypes.String,
            value: 3,
            locStart: (nodes) => nodes[2].source.startIdx,
            locEnd: (nodes) => nodes[nodes.length - 1].source.endIdx,
        },
        tagMarkup: (n) => n.sourceString.trim(),
    };
    const LiquidStatement = {
        LiquidStatement: 0,
        liquidTagOpenRule: {
            type: ConcreteNodeTypes.LiquidTagOpen,
            name: 0,
            markup(nodes) {
                const markupNode = nodes[2];
                const nameNode = nodes[0];
                if (types_1.NamedTags.hasOwnProperty(nameNode.sourceString)) {
                    return markupNode.toAST(this.args.mapping);
                }
                return markupNode.sourceString.trim();
            },
            whitespaceStart: null,
            whitespaceEnd: null,
            locStart,
            locEnd: locEndSecondToLast,
        },
        liquidTagClose: {
            type: ConcreteNodeTypes.LiquidTagClose,
            name: 1,
            whitespaceStart: null,
            whitespaceEnd: null,
            locStart,
            locEnd: locEndSecondToLast,
        },
        liquidTagRule: {
            type: ConcreteNodeTypes.LiquidTag,
            name: 0,
            markup(nodes) {
                const markupNode = nodes[2];
                const nameNode = nodes[0];
                if (types_1.NamedTags.hasOwnProperty(nameNode.sourceString)) {
                    return markupNode.toAST(this.args.mapping);
                }
                return markupNode.sourceString.trim();
            },
            whitespaceStart: null,
            whitespaceEnd: null,
            locStart,
            locEnd: locEndSecondToLast,
        },
        liquidRawTagImpl: {
            type: ConcreteNodeTypes.LiquidRawTag,
            name: 0,
            body: 4,
            whitespaceStart: null,
            whitespaceEnd: null,
            delimiterWhitespaceStart: null,
            delimiterWhitespaceEnd: null,
            locStart,
            locEnd: locEndSecondToLast,
            blockStartLocStart: (tokens) => liquidStatementOffset + tokens[0].source.startIdx,
            blockStartLocEnd: (tokens) => liquidStatementOffset + tokens[2].source.endIdx,
            blockEndLocStart: (tokens) => liquidStatementOffset + tokens[5].source.startIdx,
            blockEndLocEnd: (tokens) => liquidStatementOffset + tokens[5].source.endIdx,
        },
        liquidBlockComment: {
            type: ConcreteNodeTypes.LiquidRawTag,
            name: 'comment',
            body: (tokens) => tokens[1].sourceString.slice(1) + tokens[2].sourceString,
            whitespaceStart: '',
            whitespaceEnd: '',
            delimiterWhitespaceStart: '',
            delimiterWhitespaceEnd: '',
            locStart,
            locEnd,
            blockStartLocStart: (tokens) => liquidStatementOffset + tokens[0].source.startIdx,
            blockStartLocEnd: (tokens) => liquidStatementOffset + tokens[0].source.endIdx,
            blockEndLocStart: (tokens) => liquidStatementOffset + tokens[4].source.startIdx,
            blockEndLocEnd: (tokens) => liquidStatementOffset + tokens[4].source.endIdx,
        },
        liquidInlineComment: {
            type: ConcreteNodeTypes.LiquidTag,
            name: 0,
            markup: markupTrimEnd(2),
            whitespaceStart: null,
            whitespaceEnd: null,
            locStart,
            locEnd: locEndSecondToLast,
        },
    };
    const LiquidHTMLMappings = {
        Node(frontmatter, nodes) {
            const self = this;
            const frontmatterNode = frontmatter.sourceString.length === 0
                ? []
                : [frontmatter.toAST(self.args.mapping)];
            return frontmatterNode.concat(nodes.toAST(self.args.mapping));
        },
        yamlFrontmatter: {
            type: ConcreteNodeTypes.YAMLFrontmatter,
            body: 2,
            locStart,
            locEnd,
        },
        HtmlDoctype: {
            type: ConcreteNodeTypes.HtmlDoctype,
            legacyDoctypeString: 4,
            locStart,
            locEnd,
        },
        HtmlComment: {
            type: ConcreteNodeTypes.HtmlComment,
            body: markup(1),
            locStart,
            locEnd,
        },
        HtmlRawTagImpl: {
            type: ConcreteNodeTypes.HtmlRawTag,
            name: 1,
            attrList: 2,
            body: 4,
            locStart,
            locEnd,
            blockStartLocStart: (tokens) => tokens[0].source.startIdx,
            blockStartLocEnd: (tokens) => tokens[3].source.endIdx,
            blockEndLocStart: (tokens) => tokens[5].source.startIdx,
            blockEndLocEnd: (tokens) => tokens[5].source.endIdx,
        },
        HtmlVoidElement: {
            type: ConcreteNodeTypes.HtmlVoidElement,
            name: 1,
            attrList: 3,
            locStart,
            locEnd,
        },
        HtmlSelfClosingElement: {
            type: ConcreteNodeTypes.HtmlSelfClosingElement,
            name: 1,
            attrList: 2,
            locStart,
            locEnd,
        },
        HtmlTagOpen: {
            type: ConcreteNodeTypes.HtmlTagOpen,
            name: 1,
            attrList: 2,
            locStart,
            locEnd,
        },
        HtmlTagClose: {
            type: ConcreteNodeTypes.HtmlTagClose,
            name: 1,
            locStart,
            locEnd,
        },
        tagNameOrLiquidDrop: 0,
        AttrUnquoted: {
            type: ConcreteNodeTypes.AttrUnquoted,
            name: 0,
            value: 2,
            locStart,
            locEnd,
        },
        AttrSingleQuoted: {
            type: ConcreteNodeTypes.AttrSingleQuoted,
            name: 0,
            value: 3,
            locStart,
            locEnd,
        },
        AttrDoubleQuoted: {
            type: ConcreteNodeTypes.AttrDoubleQuoted,
            name: 0,
            value: 3,
            locStart,
            locEnd,
        },
        attrEmpty: {
            type: ConcreteNodeTypes.AttrEmpty,
            name: 0,
            locStart,
            locEnd,
        },
        attrDoubleQuotedValue: 0,
        attrSingleQuotedValue: 0,
        attrUnquotedValue: 0,
        attrDoubleQuotedTextNode: textNode,
        attrSingleQuotedTextNode: textNode,
        attrUnquotedTextNode: textNode,
    };
    const ohmAST = (0, extras_1.toAST)(res, Object.assign(Object.assign(Object.assign({}, HelperMappings), LiquidMappings), LiquidHTMLMappings));
    return ohmAST;
}
exports.toLiquidHtmlCST = toLiquidHtmlCST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BhcnNlci9jc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsMENBQXNDO0FBQ3RDLDhDQUF5RTtBQUN6RSw0Q0FBNEQ7QUFDNUQsbUNBQWlEO0FBRWpELElBQVksaUJBcUNYO0FBckNELFdBQVksaUJBQWlCO0lBQzNCLGdEQUEyQixDQUFBO0lBQzNCLGdEQUEyQixDQUFBO0lBQzNCLDhDQUF5QixDQUFBO0lBQ3pCLHdEQUFtQyxDQUFBO0lBQ25DLHNFQUFpRCxDQUFBO0lBQ2pELGdEQUEyQixDQUFBO0lBQzNCLGtEQUE2QixDQUFBO0lBQzdCLDBEQUFxQyxDQUFBO0lBQ3JDLDBEQUFxQyxDQUFBO0lBQ3JDLGtEQUE2QixDQUFBO0lBQzdCLDRDQUF1QixDQUFBO0lBQ3ZCLDhDQUF5QixDQUFBO0lBQ3pCLGtEQUE2QixDQUFBO0lBQzdCLDRDQUF1QixDQUFBO0lBQ3ZCLG9EQUErQixDQUFBO0lBQy9CLHNEQUFpQyxDQUFBO0lBQ2pDLDBDQUFxQixDQUFBO0lBQ3JCLHdEQUFtQyxDQUFBO0lBRW5DLHNEQUFpQyxDQUFBO0lBQ2pDLGtEQUE2QixDQUFBO0lBQzdCLG9EQUErQixDQUFBO0lBQy9CLG9EQUErQixDQUFBO0lBQy9CLHNEQUFpQyxDQUFBO0lBQ2pDLHNDQUFpQixDQUFBO0lBQ2pCLHNDQUFpQixDQUFBO0lBQ2pCLG9DQUFlLENBQUE7SUFDZiw4Q0FBeUIsQ0FBQTtJQUN6Qiw0Q0FBdUIsQ0FBQTtJQUV2QixrREFBNkIsQ0FBQTtJQUM3QixnREFBMkIsQ0FBQTtJQUMzQiw0Q0FBdUIsQ0FBQTtJQUN2QixrREFBNkIsQ0FBQTtJQUM3QixzREFBaUMsQ0FBQTtJQUNqQywwRUFBcUQsQ0FBQTtBQUN2RCxDQUFDLEVBckNXLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBcUM1QjtBQUVZLFFBQUEsbUJBQW1CLEdBQUc7SUFDakMsR0FBRyxFQUFF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