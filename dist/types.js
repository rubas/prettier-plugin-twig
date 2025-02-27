"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidNodeTypes = exports.HtmlNodeTypes = exports.Comparators = exports.NamedTags = exports.isLiquidHtmlNode = exports.NodeTypes = void 0;
var NodeTypes;
(function (NodeTypes) {
    NodeTypes["Document"] = "Document";
    NodeTypes["LiquidRawTag"] = "LiquidRawTag";
    NodeTypes["LiquidTag"] = "LiquidTag";
    NodeTypes["LiquidBranch"] = "LiquidBranch";
    NodeTypes["LiquidDrop"] = "LiquidDrop";
    NodeTypes["HtmlSelfClosingElement"] = "HtmlSelfClosingElement";
    NodeTypes["HtmlVoidElement"] = "HtmlVoidElement";
    NodeTypes["HtmlDoctype"] = "HtmlDoctype";
    NodeTypes["HtmlComment"] = "HtmlComment";
    NodeTypes["HtmlElement"] = "HtmlElement";
    NodeTypes["HtmlRawNode"] = "HtmlRawNode";
    NodeTypes["AttrSingleQuoted"] = "AttrSingleQuoted";
    NodeTypes["AttrDoubleQuoted"] = "AttrDoubleQuoted";
    NodeTypes["AttrUnquoted"] = "AttrUnquoted";
    NodeTypes["AttrEmpty"] = "AttrEmpty";
    NodeTypes["TextNode"] = "TextNode";
    NodeTypes["YAMLFrontmatter"] = "YAMLFrontmatter";
    NodeTypes["LiquidVariable"] = "LiquidVariable";
    NodeTypes["LiquidFilter"] = "LiquidFilter";
    NodeTypes["NamedArgument"] = "NamedArgument";
    NodeTypes["LiquidLiteral"] = "LiquidLiteral";
    NodeTypes["String"] = "String";
    NodeTypes["Number"] = "Number";
    NodeTypes["Range"] = "Range";
    NodeTypes["VariableLookup"] = "VariableLookup";
    NodeTypes["Comparison"] = "Comparison";
    NodeTypes["LogicalExpression"] = "LogicalExpression";
    NodeTypes["AssignMarkup"] = "AssignMarkup";
    NodeTypes["CycleMarkup"] = "CycleMarkup";
    NodeTypes["ForMarkup"] = "ForMarkup";
    NodeTypes["PaginateMarkup"] = "PaginateMarkup";
    NodeTypes["RawMarkup"] = "RawMarkup";
    NodeTypes["RenderMarkup"] = "RenderMarkup";
    NodeTypes["RenderVariableExpression"] = "RenderVariableExpression";
})(NodeTypes = exports.NodeTypes || (exports.NodeTypes = {}));
function isLiquidHtmlNode(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        NodeTypes.hasOwnProperty(value.type));
}
exports.isLiquidHtmlNode = isLiquidHtmlNode;
var NamedTags;
(function (NamedTags) {
    NamedTags["assign"] = "assign";
    NamedTags["capture"] = "capture";
    NamedTags["case"] = "case";
    NamedTags["cycle"] = "cycle";
    NamedTags["decrement"] = "decrement";
    NamedTags["echo"] = "echo";
    NamedTags["elsif"] = "elsif";
    NamedTags["for"] = "for";
    NamedTags["form"] = "form";
    NamedTags["if"] = "if";
    NamedTags["include"] = "include";
    NamedTags["increment"] = "increment";
    NamedTags["layout"] = "layout";
    NamedTags["liquid"] = "liquid";
    NamedTags["paginate"] = "paginate";
    NamedTags["render"] = "render";
    NamedTags["section"] = "section";
    NamedTags["tablerow"] = "tablerow";
    NamedTags["unless"] = "unless";
    NamedTags["when"] = "when";
})(NamedTags = exports.NamedTags || (exports.NamedTags = {}));
var Comparators;
(function (Comparators) {
    Comparators["CONTAINS"] = "contains";
    Comparators["EQUAL"] = "==";
    Comparators["GREATER_THAN"] = ">";
    Comparators["GREATER_THAN_OR_EQUAL"] = ">=";
    Comparators["LESS_THAN"] = "<";
    Comparators["LESS_THAN_OR_EQUAL"] = "<=";
    Comparators["NOT_EQUAL"] = "!=";
})(Comparators = exports.Comparators || (exports.Comparators = {}));
exports.HtmlNodeTypes = [
    NodeTypes.HtmlElement,
    NodeTypes.HtmlRawNode,
    NodeTypes.HtmlVoidElement,
    NodeTypes.HtmlSelfClosingElement,
];
exports.LiquidNodeTypes = [
    NodeTypes.LiquidTag,
    NodeTypes.LiquidDrop,
    NodeTypes.LiquidBranch,
    NodeTypes.LiquidRawTag,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsSUFBWSxTQXFDWDtBQXJDRCxXQUFZLFNBQVM7SUFDbkIsa0NBQXFCLENBQUE7SUFDckIsMENBQTZCLENBQUE7SUFDN0Isb0NBQXVCLENBQUE7SUFDdkIsMENBQTZCLENBQUE7SUFDN0Isc0NBQXlCLENBQUE7SUFDekIsOERBQWlELENBQUE7SUFDakQsZ0RBQW1DLENBQUE7SUFDbkMsd0NBQTJCLENBQUE7SUFDM0Isd0NBQTJCLENBQUE7SUFDM0Isd0NBQTJCLENBQUE7SUFDM0Isd0NBQTJCLENBQUE7SUFDM0Isa0RBQXFDLENBQUE7SUFDckMsa0RBQXFDLENBQUE7SUFDckMsMENBQTZCLENBQUE7SUFDN0Isb0NBQXVCLENBQUE7SUFDdkIsa0NBQXFCLENBQUE7SUFDckIsZ0RBQW1DLENBQUE7SUFFbkMsOENBQWlDLENBQUE7SUFDakMsMENBQTZCLENBQUE7SUFDN0IsNENBQStCLENBQUE7SUFDL0IsNENBQStCLENBQUE7SUFDL0IsOEJBQWlCLENBQUE7SUFDakIsOEJBQWlCLENBQUE7SUFDakIsNEJBQWUsQ0FBQTtJQUNmLDhDQUFpQyxDQUFBO0lBQ2pDLHNDQUF5QixDQUFBO0lBQ3pCLG9EQUF1QyxDQUFBO0lBRXZDLDBDQUE2QixDQUFBO0lBQzdCLHdDQUEyQixDQUFBO0lBQzNCLG9DQUF1QixDQUFBO0lBQ3ZCLDhDQUFpQyxDQUFBO0lBQ2pDLG9DQUF1QixDQUFBO0lBQ3ZCLDBDQUE2QixDQUFBO0lBQzdCLGtFQUFxRCxDQUFBO0FBQ3ZELENBQUMsRUFyQ1csU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFxQ3BCO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBVTtJQUN6QyxPQUFPLENBQ0wsS0FBSyxLQUFLLElBQUk7UUFDZCxPQUFPLEtBQUssS0FBSyxRQUFRO1FBQ3pCLE1BQU0sSUFBSSxLQUFLO1FBQ2YsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQ3JDLENBQUM7QUFDSixDQUFDO0FBUEQsNENBT0M7QUFHRCxJQUFZLFNBcUJYO0FBckJELFdBQVksU0FBUztJQUNuQiw4QkFBaUIsQ0FBQTtJQUNqQixnQ0FBbUIsQ0FBQTtJQUNuQiwwQkFBYSxDQUFBO0lBQ2IsNEJBQWUsQ0FBQTtJQUNmLG9DQUF1QixDQUFBO0lBQ3ZCLDBCQUFhLENBQUE7SUFDYiw0QkFBZSxDQUFBO0lBQ2Ysd0JBQVcsQ0FBQTtJQUNYLDBCQUFhLENBQUE7SUFDYixzQkFBUyxDQUFBO0lBQ1QsZ0NBQW1CLENBQUE7SUFDbkIsb0NBQXVCLENBQUE7SUFDdkIsOEJBQWlCLENBQUE7SUFDakIsOEJBQWlCLENBQUE7SUFDakIsa0NBQXFCLENBQUE7SUFDckIsOEJBQWlCLENBQUE7SUFDakIsZ0NBQW1CLENBQUE7SUFDbkIsa0NBQXFCLENBQUE7SUFDckIsOEJBQWlCLENBQUE7SUFDakIsMEJBQWEsQ0FBQTtBQUNmLENBQUMsRUFyQlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFxQnBCO0FBRUQsSUFBWSxXQVFYO0FBUkQsV0FBWSxXQUFXO0lBQ3JCLG9DQUFxQixDQUFBO0lBQ3JCLDJCQUFZLENBQUE7SUFDWixpQ0FBa0IsQ0FBQTtJQUNsQiwyQ0FBNEIsQ0FBQTtJQUM1Qiw4QkFBZSxDQUFBO0lBQ2Ysd0NBQXlCLENBQUE7SUFDekIsK0JBQWdCLENBQUE7QUFDbEIsQ0FBQyxFQVJXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBUXRCO0FBRVksUUFBQSxhQUFhLEdBQUc7SUFDM0IsU0FBUyxDQUFDLFdBQVc7SUFDckIsU0FBUyxDQUFDLFdBQVc7SUFDckIsU0FBUyxDQUFDLGVBQWU7SUFDekIsU0FBUyxDQUFDLHNCQUFzQjtDQUN4QixDQUFDO0FBRUUsUUFBQSxlQUFlLEdBQUc7SUFDN0IsU0FBUyxDQUFDLFNBQVM7SUFDbkIsU0FBUyxDQUFDLFVBQVU7SUFDcEIsU0FBUyxDQUFDLFlBQVk7SUFDdEIsU0FBUyxDQUFDLFlBQVk7Q0FDZCxDQUFDIn0=