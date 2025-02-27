"use strict";
const parser_1 = require("./parser");
const printer_1 = require("./printer");
const languages = [
    {
        name: 'LiquidHTML',
        parsers: [parser_1.liquidHtmlLanguageName],
        extensions: ['.liquid', '.twig'],
        vscodeLanguageIds: ['liquid', 'Liquid', 'twig', 'Twig'],
    },
];
const options = {
    liquidSingleQuote: {
        type: 'boolean',
        category: 'LIQUID',
        default: true,
        description: 'Use single quotes instead of double quotes in Liquid tags and objects.',
        since: '0.2.0',
    },
    embeddedSingleQuote: {
        type: 'boolean',
        category: 'LIQUID',
        default: true,
        description: 'Use single quotes instead of double quotes in embedded languages (JavaScript, CSS, TypeScript inside <script>, <style> or Liquid equivalent).',
        since: '0.4.0',
    },
    singleLineLinkTags: {
        type: 'boolean',
        category: 'HTML',
        default: false,
        description: 'Always print link tags on a single line to remove clutter',
        since: '0.1.0',
    },
    indentSchema: {
        type: 'boolean',
        category: 'LIQUID',
        default: false,
        description: 'Indent the contents of the {% schema %} tag',
        since: '0.1.0',
    },
};
const defaultOptions = {
    printWidth: 120,
};
const plugin = {
    languages,
    parsers: parser_1.parsers,
    printers: printer_1.printers,
    options,
    defaultOptions,
};
module.exports = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLHFDQUEyRDtBQUMzRCx1Q0FBcUM7QUFHckMsTUFBTSxTQUFTLEdBQXNCO0lBQ25DO1FBQ0UsSUFBSSxFQUFFLFlBQVk7UUFDbEIsT0FBTyxFQUFFLENBQUMsK0JBQXNCLENBQUM7UUFDakMsVUFBVSxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNoQyxpQkFBaUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztLQUN4RDtDQUNGLENBQUM7QUFFRixNQUFNLE9BQU8sR0FBbUI7SUFDOUIsaUJBQWlCLEVBQUU7UUFDakIsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsUUFBUTtRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLFdBQVcsRUFDVCx3RUFBd0U7UUFDMUUsS0FBSyxFQUFFLE9BQU87S0FDZjtJQUNELG1CQUFtQixFQUFFO1FBQ25CLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLFFBQVE7UUFDbEIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQ1QsK0lBQStJO1FBQ2pKLEtBQUssRUFBRSxPQUFPO0tBQ2Y7SUFDRCxrQkFBa0IsRUFBRTtRQUNsQixJQUFJLEVBQUUsU0FBUztRQUNmLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsV0FBVyxFQUFFLDJEQUEyRDtRQUN4RSxLQUFLLEVBQUUsT0FBTztLQUNmO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsUUFBUTtRQUNsQixPQUFPLEVBQUUsS0FBSztRQUNkLFdBQVcsRUFBRSw2Q0FBNkM7UUFDMUQsS0FBSyxFQUFFLE9BQU87S0FDZjtDQUNGLENBQUM7QUFFRixNQUFNLGNBQWMsR0FBNkI7SUFDL0MsVUFBVSxFQUFFLEdBQUc7Q0FDaEIsQ0FBQztBQUVGLE1BQU0sTUFBTSxHQUEyQjtJQUNyQyxTQUFTO0lBQ1QsT0FBTyxFQUFQLGdCQUFPO0lBQ1AsUUFBUSxFQUFSLGtCQUFRO0lBQ1IsT0FBTztJQUNQLGNBQWM7Q0FDZixDQUFDO0FBRUYsaUJBQVMsTUFBTSxDQUFDIn0=