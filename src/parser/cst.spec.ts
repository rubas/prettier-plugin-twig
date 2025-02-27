import { expect } from 'chai';
import { LiquidHtmlCST, toLiquidHtmlCST } from '~/parser/cst';
import { BLOCKS, VOID_ELEMENTS } from '~/parser/grammar';
import { NamedTags } from '~/types';
import { deepGet } from '~/utils';

describe('Unit: toLiquidHtmlCST(text)', () => {
  let cst: LiquidHtmlCST;

  describe('Case: HtmlDoctype', () => {
    it('should basically parse html doctypes', () => {
      [
        { text: '<!doctype html>', legacyDoctypeString: null },
        { text: '<!doctype html >', legacyDoctypeString: null },
        {
          text: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN"
           "http://www.w3.org/TR/html4/frameset.dtd">`,
          legacyDoctypeString: `PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN"
           "http://www.w3.org/TR/html4/frameset.dtd"`,
        },
      ].forEach(({ text, legacyDoctypeString }) => {
        cst = toLiquidHtmlCST(text);
        expectPath(cst, '0.type').to.equal('HtmlDoctype');
        expectPath(cst, '0.legacyDoctypeString').to.equal(legacyDoctypeString);
      });
    });
  });

  describe('Case: HtmlComment', () => {
    it('should basically parse html comments', () => {
      ['<!-- hello world -->'].forEach((text) => {
        cst = toLiquidHtmlCST(text);
        expectPath(cst, '0.type').to.equal('HtmlComment');
        expectPath(cst, '0.body').to.equal('hello world');
      });
    });
  });

  describe('Case: HtmlNode', () => {
    it('should basically parse open and close tags', () => {
      ['<div></div>', '<div ></div >'].forEach((text) => {
        cst = toLiquidHtmlCST(text);
        expectPath(cst, '0.type').to.equal('HtmlTagOpen');
        expectPath(cst, '0.name').to.equal('div');
        expectPath(cst, '1.type').to.equal('HtmlTagClose');
        expectPath(cst, '1.name').to.equal('div');
      });
    });

    it('should parse liquid drop tag names', () => {
      cst = toLiquidHtmlCST('<{{ node_type }}></{{ node_type }}>');
      expectPath(cst, '0.type').to.equal('HtmlTagOpen');
      expectPath(cst, '0.name.type').to.equal('LiquidDrop');
      expectPath(cst, '0.name.markup.type').to.equal('LiquidVariable');
      expectPath(cst, '0.name.markup.expression.type').to.equal('VariableLookup');
      expectPath(cst, '0.name.markup.expression.name').to.equal('node_type');
      expectPath(cst, '1.type').to.equal('HtmlTagClose');
      expectPath(cst, '1.name.type').to.equal('LiquidDrop');
      expectPath(cst, '1.name.markup.type').to.equal('LiquidVariable');
      expectPath(cst, '1.name.markup.expression.type').to.equal('VariableLookup');
      expectPath(cst, '1.name.markup.expression.name').to.equal('node_type');
    });

    it('should parse script and style tags as a dump', () => {
      cst = toLiquidHtmlCST(
        '<script>\nconst a = {{ product | json }}\n</script><style>\n#id {}\n</style>',
      );
      expectPath(cst, '0.type').to.eql('HtmlRawTag');
      expectPath(cst, '0.name').to.eql('script');
      expectPath(cst, '0.body').to.eql('\nconst a = {{ product | json }}\n');
      expectPath(cst, '1.type').to.eql('HtmlRawTag');
      expectPath(cst, '1.name').to.eql('style');
      expectPath(cst, '1.body').to.eql('\n#id {}\n');
    });

    it('should properly return block{Start,End}Loc{Start,End} locations of raw tags', () => {
      const source = '<script>const a = {{ product | json }}</script>';
      cst = toLiquidHtmlCST(source);
      expectPath(cst, '0.type').to.equal('HtmlRawTag');
      expectPath(cst, '0.blockStartLocStart').to.equal(0);
      expectPath(cst, '0.blockStartLocEnd').to.equal(source.indexOf('const'));
      expectPath(cst, '0.blockEndLocStart').to.equal(source.indexOf('</script>'));
      expectPath(cst, '0.blockEndLocEnd').to.equal(source.length);
    });

    it('should parse void elements', () => {
      VOID_ELEMENTS.forEach((voidElementName: any) => {
        cst = toLiquidHtmlCST(`<${voidElementName} disabled>`);
        expectPath(cst, '0.type').to.equal('HtmlVoidElement');
        expectPath(cst, '0.name').to.equal(voidElementName);
        expectPath(cst, '0.attrList.0.name').to.equal('disabled');
      });
    });

    it('should parse empty attributes', () => {
      ['<div empty>', '<div empty >', '<div\nempty\n>'].forEach((text) => {
        cst = toLiquidHtmlCST(text);
        expectPath(cst, '0.attrList.0.type').to.equal('AttrEmpty');
        expectPath(cst, '0.attrList.0.name').to.equal('empty');
        expectPath(cst, '0.name.attrList.0.value').to.be.undefined;
      });
    });

    [
      { type: 'AttrSingleQuoted', name: 'single', quote: "'" },
      { type: 'AttrDoubleQuoted', name: 'double', quote: '"' },
      { type: 'AttrUnquoted', name: 'unquoted', quote: '' },
    ].forEach((testConfig) => {
      it(`should parse ${testConfig.type} attributes`, () => {
        [
          `<div ${testConfig.name}=${testConfig.quote}${testConfig.name}${testConfig.quote}>`,
          `<div ${testConfig.name}=${testConfig.quote}${testConfig.name}${testConfig.quote} >`,
          `<div\n${testConfig.name}=${testConfig.quote}${testConfig.name}${testConfig.quote}\n>`,
        ].forEach((text) => {
          cst = toLiquidHtmlCST(text);
          expectPath(cst, '0.attrList.0.type').to.equal(testConfig.type);
          expectPath(cst, '0.attrList.0.name').to.equal(testConfig.name);
          expectPath(cst, '0.attrList.0.value.0.type').to.eql('TextNode');
          expectPath(cst, '0.attrList.0.value.0.value').to.eql(testConfig.name);
        });
      });

      if (testConfig.name != 'unquoted') {
        it(`should accept liquid nodes inside ${testConfig.type}`, () => {
          [
            `<div ${testConfig.name}=${testConfig.quote}https://{{ name }}${testConfig.quote}>`,
            `<div ${testConfig.name}=${testConfig.quote}https://{{ name }}${testConfig.quote} >`,
            `<div\n${testConfig.name}=${testConfig.quote}https://{{ name }}${testConfig.quote}\n>`,
          ].forEach((text) => {
            cst = toLiquidHtmlCST(text);
            expectPath(cst, '0.attrList.0.value.1.type').to.eql('LiquidDrop', text);
          });
        });
      }

      it(`should accept top level liquid nodes that contain ${testConfig.type}`, () => {
        [
          `<div {% if A %}${testConfig.name}=${testConfig.quote}https://name${testConfig.quote}{% endif %}>`,
          `<div {% if A %} ${testConfig.name}=${testConfig.quote}https://name${testConfig.quote} {% endif %}>`,
          `<div\n{% if A %}\n${testConfig.name}=${testConfig.quote}https://name${testConfig.quote}\n{% endif %}>`,
        ].forEach((text) => {
          cst = toLiquidHtmlCST(text);
          expectPath(cst, '0.attrList.0.type').to.eql('LiquidTagOpen', text);
          expectPath(cst, '0.attrList.1.type').to.eql(testConfig.type, text);
          expectPath(cst, '0.attrList.1.value.0.value').to.eql('https://name');
          expectPath(cst, '0.attrList.2.type').to.eql('LiquidTagClose', text);
        });
      });
    });
  });

  describe('Case: LiquidDrop', () => {
    it('should basically parse unparseables', () => {
      cst = toLiquidHtmlCST('{{ !-asdl }}{{- !-asdl -}}');
      expectPath(cst, '0.type').to.equal('LiquidDrop');
      expectPath(cst, '0.markup').to.equal('!-asdl');
      expectPath(cst, '0.whitespaceStart').to.equal(null);
      expectPath(cst, '0.whitespaceEnd').to.equal(null);
      expectPath(cst, '1.type').to.equal('LiquidDrop');
      expectPath(cst, '1.markup').to.equal('!-asdl');
      expectPath(cst, '1.whitespaceStart').to.equal('-');
      expectPath(cst, '1.whitespaceEnd').to.equal('-');
    });

    it('should parse strings', () => {
      [
        { expression: `"string o' string"`, value: `string o' string`, single: false },
        { expression: `'He said: "hi!"'`, value: `He said: "hi!"`, single: true },
      ].forEach(({ expression, value, single }) => {
        cst = toLiquidHtmlCST(`{{ ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable');
        expectPath(cst, '0.markup.rawSource').to.equal(expression);
        expectPath(cst, '0.markup.expression.type').to.equal('String');
        expectPath(cst, '0.markup.expression.value').to.equal(value);
        expectPath(cst, '0.markup.expression.single').to.equal(single);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });

    it('should parse numbers', () => {
      [
        { expression: `1`, value: '1' },
        { expression: `1.02`, value: '1.02' },
        { expression: `0`, value: '0' },
        { expression: `-0`, value: '-0' },
        { expression: `-0.0`, value: '-0.0' },
      ].forEach(({ expression, value }) => {
        cst = toLiquidHtmlCST(`{{ ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable');
        expectPath(cst, '0.markup.rawSource').to.equal(expression);
        expectPath(cst, '0.markup.expression.type').to.equal('Number');
        expectPath(cst, '0.markup.expression.value').to.equal(value);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });

    it('should parse Liquid literals', () => {
      [
        { expression: `nil`, value: null },
        { expression: `null`, value: null },
        { expression: `true`, value: true },
        { expression: `blank`, value: '' },
        { expression: `empty`, value: '' },
      ].forEach(({ expression, value }) => {
        cst = toLiquidHtmlCST(`{{ ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable', expression);
        expectPath(cst, '0.markup.rawSource').to.equal(expression);
        expectPath(cst, '0.markup.expression.type').to.equal('LiquidLiteral');
        expectPath(cst, '0.markup.expression.keyword').to.equal(expression);
        expectPath(cst, '0.markup.expression.value').to.equal(value);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });

    interface Lookup {
      type: 'VariableLookup';
      lookups: (string | number | Lookup)[];
      name: string | undefined;
    }

    it('should parse variable lookups', () => {
      const v = (name: string, lookups: (string | number | Lookup)[] = []): Lookup => ({
        type: 'VariableLookup',
        name,
        lookups,
      });
      [
        { expression: `x`, name: 'x', lookups: [] },
        { expression: `x.y`, name: 'x', lookups: ['y'] },
        { expression: `x["y"]`, name: 'x', lookups: ['y'] },
        { expression: `x['y']`, name: 'x', lookups: ['y'] },
        { expression: `x[1]`, name: 'x', lookups: [1] },
        { expression: `x.y.z`, name: 'x', lookups: ['y', 'z'] },
        { expression: `x["y"]["z"]`, name: 'x', lookups: ['y', 'z'] },
        { expression: `x["y"].z`, name: 'x', lookups: ['y', 'z'] },
        { expression: `["product"]`, name: null, lookups: ['product'] },
        { expression: `page.about-us`, name: 'page', lookups: ['about-us'] },
        { expression: `["x"].y`, name: null, lookups: ['x', 'y'] },
        { expression: `["x"]["y"]`, name: null, lookups: ['x', 'y'] },
        { expression: `x[y]`, name: 'x', lookups: [v('y')] },
        { expression: `x[y.z]`, name: 'x', lookups: [v('y', ['z'])] },
        { expression: `true_thing`, name: 'true_thing', lookups: [] },
        { expression: `null_thing`, name: 'null_thing', lookups: [] },
      ].forEach(({ expression, name, lookups }) => {
        cst = toLiquidHtmlCST(`{{ ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable', expression);
        expectPath(cst, '0.markup.rawSource').to.equal(expression);
        expectPath(cst, '0.markup.expression.type').to.equal('VariableLookup');
        expectPath(cst, '0.markup.expression.name').to.equal(name, expression);
        expectPath(cst, '0.markup.expression.lookups').to.be.an('array');

        lookups.forEach((lookup: string | number | Lookup, i: number) => {
          switch (typeof lookup) {
            case 'string': {
              expectPath(cst, `0.markup.expression.lookups.${i}.type`).to.equal('String');
              expectPath(cst, `0.markup.expression.lookups.${i}.value`).to.equal(lookup);
              break;
            }
            case 'number': {
              expectPath(cst, `0.markup.expression.lookups.${i}.type`).to.equal('Number');
              expectPath(cst, `0.markup.expression.lookups.${i}.value`).to.equal(lookup.toString());
              break;
            }
            default: {
              expectPath(cst, `0.markup.expression.lookups.${i}.type`).to.equal('VariableLookup');
              expectPath(cst, `0.markup.expression.lookups.${i}.name`).to.equal(lookup.name);
              lookup.lookups.forEach((val, j) => {
                // Being lazy here... Assuming string properties.
                expectPath(cst, `0.markup.expression.lookups.${i}.lookups.${j}.type`).to.equal(
                  'String',
                );
                expectPath(cst, `0.markup.expression.lookups.${i}.lookups.${j}.value`).to.equal(
                  val,
                );
              });
              break;
            }
          }
        });

        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });

    it('should parse ranges', () => {
      [
        {
          expression: `(0..5)`,
          start: { value: '0', type: 'Number' },
          end: { value: '5', type: 'Number' },
        },
        {
          expression: `( 0 .. 5 )`,
          start: { value: '0', type: 'Number' },
          end: { value: '5', type: 'Number' },
        },
        {
          expression: `(true..false)`,
          start: { value: true, type: 'LiquidLiteral' },
          end: { value: false, type: 'LiquidLiteral' },
        },
      ].forEach(({ expression, start, end }) => {
        cst = toLiquidHtmlCST(`{{ ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable', expression);
        expectPath(cst, '0.markup.rawSource').to.equal(expression);
        expectPath(cst, '0.markup.expression.type').to.equal('Range');
        expectPath(cst, '0.markup.expression.start.type').to.equal(start.type);
        expectPath(cst, '0.markup.expression.start.value').to.equal(start.value);
        expectPath(cst, '0.markup.expression.end.type').to.equal(end.type);
        expectPath(cst, '0.markup.expression.end.value').to.equal(end.value);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });

    it('should parse filters', () => {
      interface Filter {
        name: string;
        args: FilterArgument[];
      }
      type FilterArgument = any;

      const filter = (name: string, args: FilterArgument[] = []): Filter => ({ name, args });
      const arg = (type: string, value: string) => ({ type, value });
      const namedArg = (name: string, valueType: string) => ({
        type: 'NamedArgument',
        name,
        valueType,
      });
      [
        { expression: '', filters: [] },
        { expression: `| filter1`, filters: [filter('filter1')] },
        { expression: `| filter1 | filter2`, filters: [filter('filter1'), filter('filter2')] },
        {
          expression: `| filter1: 'hi', 'there'`,
          filters: [filter('filter1', [arg('String', 'hi'), arg('String', 'there')])],
        },
        {
          expression: `| filter1: key: value, kind: 'string'`,
          filters: [
            filter('filter1', [namedArg('key', 'VariableLookup'), namedArg('kind', 'String')]),
          ],
        },
        {
          expression: `| f1: 'hi', key: (0..1) | f2: key: value, kind: 'string'`,
          filters: [
            filter('f1', [arg('String', 'hi'), namedArg('key', 'Range')]),
            filter('f2', [namedArg('key', 'VariableLookup'), namedArg('kind', 'String')]),
          ],
        },
      ].forEach(({ expression, filters }) => {
        cst = toLiquidHtmlCST(`{{ 'hello' ${expression} }}`);
        expectPath(cst, '0.type').to.equal('LiquidDrop');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable');
        expectPath(cst, '0.markup.rawSource').to.equal((`'hello' ` + expression).trimEnd());
        expectPath(cst, '0.markup.filters').to.exist;
        expectPath(cst, '0.markup.filters').to.have.lengthOf(filters.length);
        filters.forEach((filter, i) => {
          expectPath(cst, `0.markup.filters.${i}`).to.exist;
          expectPath(cst, `0.markup.filters.${i}.type`).to.equal('LiquidFilter', expression);
          expectPath(cst, `0.markup.filters.${i}.name`).to.equal(filter.name);
          expectPath(cst, `0.markup.filters.${i}.args`).to.exist;
          expectPath(cst, `0.markup.filters.${i}.args`).to.have.lengthOf(
            filter.args.length,
            expression,
          );
          filter.args.forEach((arg: any, j) => {
            switch (arg.type) {
              case 'String': {
                expectPath(cst, `0.markup.filters.${i}.args.${j}.type`).to.equal('String');
                expectPath(cst, `0.markup.filters.${i}.args.${j}.value`).to.equal(arg.value);
                break;
              }
              case 'NamedArgument': {
                expectPath(cst, `0.markup.filters.${i}.args`).to.not.be.empty;
                expectPath(cst, `0.markup.filters.${i}.args.${j}.type`).to.equal('NamedArgument');
                expectPath(cst, `0.markup.filters.${i}.args.${j}.name`).to.equal(arg.name);
                expectPath(cst, `0.markup.filters.${i}.args.${j}.value.type`).to.equal(
                  arg.valueType,
                );
                break;
              }
            }
          });
        });
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal(null);
      });
    });
  });

  describe('Case: LiquidTag', () => {
    it('should parse the liquid liquid tag as a list of tags', () => {
      [
        [
          {
            expression: `echo "hi"`,
            type: 'LiquidTag',
            name: 'echo',
          },
          {
            expression: `
              comment
                hello there
                got you, eh?
              endcomment`,
            type: 'LiquidRawTag',
            name: 'comment',
          },
          {
            expression: `
              if cond
            `,
            type: 'LiquidTagOpen',
            name: 'if',
          },
          {
            expression: `
              endif
            `,
            type: 'LiquidTagClose',
            name: 'if',
          },
          {
            expression: `
              # this is an inline comment
            `,
            type: 'LiquidTag',
            name: '#',
          },
        ],
      ].forEach((expressions) => {
        cst = toLiquidHtmlCST(`{% liquid \n${expressions.map((x) => x.expression).join('\n')} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('liquid');
        expressions.forEach(({ type, name }, i) => {
          expectPath(cst, `0.markup.${i}.type`).to.equal(type);
          expectPath(cst, `0.markup.${i}.name`).to.equal(name);
        });
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });

    it('should support nested comments', () => {
      const commentBodyContainingNestedComment = `  hello
      comment tagMarkup
        nested comment body
      endcomment
      outer comment body`;
      const statementSep = '\n  ';
      const commentExpr = ['comment', commentBodyContainingNestedComment, 'endcomment'].join(
        statementSep,
      );
      const testStr = ['{% liquid', commentExpr, '%}'].join('\n');
      cst = toLiquidHtmlCST(testStr);
      expectPath(cst, '0.type').to.equal('LiquidTag');
      expectPath(cst, '0.name').to.equal('liquid');
      expectPath(cst, '0.markup.0.type').to.equal('LiquidRawTag');
      expectPath(cst, '0.markup.0.name').to.equal('comment');
      expectPath(cst, '0.markup.0.body').to.equal(
        // We don't want the newline but we do want the leading spaces
        // The reason we want that is because we want this to behave like LiquidRawTag
        statementSep.slice(1) + commentBodyContainingNestedComment + statementSep,
      );
      expectPath(cst, '0.markup.0.whitespaceStart').to.equal('');
      expectPath(cst, '0.markup.0.whitespaceEnd').to.equal('');
      expectPath(cst, '0.markup.0.delimiterWhitespaceStart').to.equal('');
      expectPath(cst, '0.markup.0.delimiterWhitespaceEnd').to.equal('');

      const liquidStatementOffset = '{% liquid\n'.length;
      expectPath(cst, '0.markup.0.blockStartLocStart').to.equal(liquidStatementOffset);
      expectPath(cst, '0.markup.0.blockStartLocEnd').to.equal(
        liquidStatementOffset + 'comment'.length,
      );
      expectPath(cst, '0.markup.0.blockEndLocStart').to.equal(
        testStr.length - 'endcomment\n%}'.length,
      );
      expectPath(cst, '0.markup.0.blockEndLocEnd').to.equal(testStr.length - '\n%}'.length);
    });

    it('should parse the echo tag as variables', () => {
      [
        { expression: `"hi"`, expressionType: 'String', expressionValue: 'hi', filters: [] },
        { expression: `x | f`, expressionType: 'VariableLookup', filters: ['f'] },
      ].forEach(({ expression, expressionType, expressionValue, filters }) => {
        cst = toLiquidHtmlCST(`{% echo ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('echo');
        expectPath(cst, '0.markup.type').to.equal('LiquidVariable');
        expectPath(cst, '0.markup.expression.type').to.equal(expressionType);
        if (expressionValue) {
          expectPath(cst, '0.markup.expression.value').to.equal(expressionValue);
        }
        expectPath(cst, '0.markup.filters').to.have.lengthOf(filters.length);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });

    it('should parse the assign tag as assign markup + liquid variable', () => {
      [
        {
          expression: `x = "hi"`,
          name: 'x',
          expressionType: 'String',
          expressionValue: 'hi',
          filters: [],
        },
        { expression: `z = y | f`, name: 'z', expressionType: 'VariableLookup', filters: ['f'] },
      ].forEach(({ expression, name, expressionType, expressionValue, filters }) => {
        cst = toLiquidHtmlCST(`{% assign ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('assign');
        expectPath(cst, '0.markup.type').to.equal('AssignMarkup');
        expectPath(cst, '0.markup.name').to.equal(name);
        expectPath(cst, '0.markup.value.expression.type').to.equal(expressionType);
        if (expressionValue) {
          expectPath(cst, '0.markup.value.expression.value').to.equal(expressionValue);
        }
        expectPath(cst, '0.markup.value.filters').to.have.lengthOf(filters.length);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });

    it('should parse the cycle tag as cycle markup', () => {
      [
        {
          expression: `a, "string", 10`,
          groupName: null,
          args: [{ type: 'VariableLookup' }, { type: 'String' }, { type: 'Number' }],
        },
        {
          expression: `var: a, "string", 10`,
          groupName: { type: 'VariableLookup' },
          args: [{ type: 'VariableLookup' }, { type: 'String' }, { type: 'Number' }],
        },
      ].forEach(({ expression, groupName, args }) => {
        cst = toLiquidHtmlCST(`{% cycle ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('cycle');
        expectPath(cst, '0.markup.type').to.equal('CycleMarkup');
        if (groupName) {
          expectPath(cst, '0.markup.groupName.type').to.equal(groupName.type);
        } else {
          expectPath(cst, '0.markup.groupName').to.equal(null);
        }
        expectPath(cst, '0.markup.args').to.have.lengthOf(args.length);
        args.forEach((arg, i) => {
          expectPath(cst, `0.markup.args.${i}.type`).to.equal(arg.type);
        });
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });

    it('should parse the render tag', () => {
      [
        {
          expression: `"snippet"`,
          snippetType: 'String',
          alias: null,
          renderVariableExpression: null,
          namedArguments: [],
        },
        {
          expression: `"snippet" as foo`,
          snippetType: 'String',
          alias: 'foo',
          renderVariableExpression: null,
          namedArguments: [],
        },
        {
          expression: `"snippet" with "string" as foo`,
          snippetType: 'String',
          alias: 'foo',
          renderVariableExpression: {
            kind: 'with',
            name: {
              type: 'String',
            },
          },
          namedArguments: [],
        },
        {
          expression: `"snippet" for products as product`,
          snippetType: 'String',
          alias: 'product',
          renderVariableExpression: {
            kind: 'for',
            name: {
              type: 'VariableLookup',
            },
          },
          namedArguments: [],
        },
        {
          expression: `variable with "string" as foo, key1: val1, key2: "hi"`,
          snippetType: 'VariableLookup',
          alias: 'foo',
          renderVariableExpression: {
            kind: 'with',
            name: {
              type: 'String',
            },
          },
          namedArguments: [
            { name: 'key1', valueType: 'VariableLookup' },
            { name: 'key2', valueType: 'String' },
          ],
        },
      ].forEach(({ expression, snippetType, renderVariableExpression, alias, namedArguments }) => {
        cst = toLiquidHtmlCST(`{% render ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('render');
        expectPath(cst, '0.markup.type').to.equal('RenderMarkup');
        expectPath(cst, '0.markup.snippet.type').to.equal(snippetType);
        if (renderVariableExpression) {
          expectPath(cst, '0.markup.variable.type').to.equal('RenderVariableExpression');
          expectPath(cst, '0.markup.variable.kind').to.equal(renderVariableExpression.kind);
          expectPath(cst, '0.markup.variable.name.type').to.equal(
            renderVariableExpression.name.type,
          );
        } else {
          expectPath(cst, '0.markup.variable').to.equal(null);
        }
        expectPath(cst, '0.markup.alias').to.equal(alias);
        expectPath(cst, '0.markup.args').to.have.lengthOf(namedArguments.length);
        namedArguments.forEach(({ name, valueType }, i) => {
          expectPath(cst, `0.markup.args.${i}.type`).to.equal('NamedArgument');
          expectPath(cst, `0.markup.args.${i}.name`).to.equal(name);
          expectPath(cst, `0.markup.args.${i}.value.type`).to.equal(valueType);
        });
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });
  });

  describe('Case: LiquidTagOpen', () => {
    it('should parse the form tag open markup as arguments', () => {
      [
        { expression: `product`, args: [{ type: 'VariableLookup' }] },
        { expression: `"product"`, args: [{ type: 'String' }] },
      ].forEach(({ expression, args }) => {
        cst = toLiquidHtmlCST(`{% form ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTagOpen');
        expectPath(cst, '0.name').to.equal('form');
        expectPath(cst, '0.markup').to.have.lengthOf(args.length, expression);
        args.forEach((arg, i) => {
          expectPath(cst, `0.markup.${i}.type`).to.equal(arg.type);
        });
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
      });
    });

    it('should parse the for and tablerow tags open markup as ForMarkup', () => {
      ['for', 'tablerow'].forEach((tagName) => {
        [
          {
            expression: `product in all_products`,
            variableName: 'product',
            collection: { type: 'VariableLookup' },
            reversed: null,
            args: [],
          },
          {
            expression: `i in (0..x)`,
            variableName: 'i',
            collection: { type: 'Range' },
            reversed: null,
            args: [],
          },
          {
            expression: `product in all_products reversed`,
            variableName: 'product',
            collection: { type: 'VariableLookup' },
            reversed: 'reversed',
            args: [],
          },
          {
            expression: `product in all_products limit: 10`,
            variableName: 'product',
            collection: { type: 'VariableLookup' },
            reversed: null,
            args: [{ type: 'NamedArgument', name: 'limit', value: { type: 'Number' } }],
          },
          {
            expression: `product in all_products reversed limit: 10 offset:var`,
            variableName: 'product',
            collection: { type: 'VariableLookup' },
            reversed: 'reversed',
            args: [
              { type: 'NamedArgument', name: 'limit', value: { type: 'Number' } },
              { type: 'NamedArgument', name: 'offset', value: { type: 'VariableLookup' } },
            ],
          },
        ].forEach(({ expression, variableName, collection, reversed, args }) => {
          cst = toLiquidHtmlCST(`{% ${tagName} ${expression} -%}`);
          expectPath(cst, '0.type').to.equal('LiquidTagOpen');
          expectPath(cst, '0.name').to.equal(tagName);
          expectPath(cst, '0.markup.type').to.equal('ForMarkup');
          expectPath(cst, '0.markup.variableName').to.equal(variableName);
          expectPath(cst, '0.markup.collection.type').to.equal(collection.type);
          expectPath(cst, '0.markup.reversed').to.equal(reversed);
          expectPath(cst, '0.markup.args').to.have.lengthOf(args.length);
          args.forEach((arg, i) => {
            expectPath(cst, `0.markup.args.${i}.type`).to.equal(arg.type);
            expectPath(cst, `0.markup.args.${i}.name`).to.equal(arg.name);
            expectPath(cst, `0.markup.args.${i}.value.type`).to.equal(arg.value.type);
          });
          expectPath(cst, '0.whitespaceEnd').to.equal('-');
        });
      });
    });

    it('should parse case arguments as a singular liquid expression', () => {
      [
        { expression: `"string"`, type: 'String' },
        { expression: `var.lookup`, type: 'VariableLookup' },
      ].forEach(({ expression, type }) => {
        cst = toLiquidHtmlCST(`{% case ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTagOpen');
        expectPath(cst, '0.name').to.equal('case');
        expectPath(cst, '0.markup.type').to.equal(type);
      });
    });

    it('should parse capture arguments as a singular liquid variable lookup', () => {
      [{ expression: `var`, type: 'VariableLookup' }].forEach(({ expression, type }) => {
        cst = toLiquidHtmlCST(`{% capture ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTagOpen');
        expectPath(cst, '0.name').to.equal('capture');
        expectPath(cst, '0.markup.type').to.equal(type);
      });
    });

    it('should parse when arguments as an array of liquid expressions', () => {
      [
        { expression: `"string"`, args: [{ type: 'String' }] },
        {
          expression: `"string", var.lookup`,
          args: [{ type: 'String' }, { type: 'VariableLookup' }],
        },
        {
          expression: `"string" or var.lookup`,
          args: [{ type: 'String' }, { type: 'VariableLookup' }],
        },
      ].forEach(({ expression, args }) => {
        cst = toLiquidHtmlCST(`{% when ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTag');
        expectPath(cst, '0.name').to.equal('when');
        expectPath(cst, '0.markup').to.have.lengthOf(args.length);
        args.forEach((arg, i) => {
          expectPath(cst, `0.markup.${i}.type`).to.equal(arg.type);
        });
      });
    });

    it('should parse the paginate tag open markup as arguments', () => {
      [
        {
          expression: `collection.products by 50`,
          collection: { type: 'VariableLookup' },
          pageSize: { type: 'Number' },
        },
        {
          expression: `collection.products by setting.value`,
          collection: { type: 'VariableLookup' },
          pageSize: { type: 'VariableLookup' },
        },
        {
          expression: `collection.products by setting.value window_size: 2`,
          collection: { type: 'VariableLookup' },
          pageSize: { type: 'VariableLookup' },
          args: [{ type: 'Number' }],
        },
        {
          expression: `collection.products by setting.value, window_size: 2`,
          collection: { type: 'VariableLookup' },
          pageSize: { type: 'VariableLookup' },
          args: [{ type: 'Number' }],
        },
      ].forEach(({ expression, collection, pageSize, args }) => {
        cst = toLiquidHtmlCST(`{% paginate ${expression} -%}`);
        expectPath(cst, '0.type').to.equal('LiquidTagOpen');
        expectPath(cst, '0.name').to.equal('paginate');
        expectPath(cst, '0.markup.type').to.equal('PaginateMarkup');
        expectPath(cst, '0.markup.collection.type').to.equal(collection.type);
        expectPath(cst, '0.markup.pageSize.type').to.equal(pageSize.type);
        if (args) {
          expectPath(cst, '0.markup.args').to.have.lengthOf(args.length);
          args.forEach((arg, i) => {
            expectPath(cst, `0.markup.args.${i}.type`).to.equal('NamedArgument');
            expectPath(cst, `0.markup.args.${i}.value.type`).to.equal(arg.type);
          });
        } else {
          expectPath(cst, '0.markup.args').to.have.lengthOf(0);
        }
      });
    });

    it('should parse the if, unless and elsif tag arguments as a list of conditions', () => {
      ['if', 'unless', 'elsif'].forEach((tagName) => {
        [
          {
            expression: 'a',
            conditions: [{ relation: null, conditional: { type: 'VariableLookup' } }],
          },
          {
            expression: 'a and "string"',
            conditions: [
              { relation: null, conditional: { type: 'VariableLookup' } },
              { relation: 'and', conditional: { type: 'String' } },
            ],
          },
          {
            expression: 'a and "string" or a<1',
            conditions: [
              { relation: null, conditional: { type: 'VariableLookup' } },
              { relation: 'and', conditional: { type: 'String' } },
              {
                relation: 'or',
                conditional: {
                  type: 'Comparison',
                  comparator: '<',
                  left: { type: 'VariableLookup' },
                  right: { type: 'Number' },
                },
              },
            ],
          },
        ].forEach(({ expression, conditions }) => {
          cst = toLiquidHtmlCST(`{% ${tagName} ${expression} -%}`);
          expectPath(cst, '0.type').to.equal(tagName === 'elsif' ? 'LiquidTag' : 'LiquidTagOpen');
          expectPath(cst, '0.name').to.equal(tagName);
          expectPath(cst, '0.markup').to.have.lengthOf(conditions.length);
          conditions.forEach(({ relation, conditional }, i) => {
            expectPath(cst, `0.markup.${i}.type`).to.equal('Condition');
            expectPath(cst, `0.markup.${i}.relation`).to.equal(relation);
            expectPath(cst, `0.markup.${i}.expression.type`).to.equal(conditional.type);
            if (conditional.type === 'Comparison') {
              expectPath(cst, `0.markup.${i}.expression.comparator`).to.equal(
                conditional.comparator,
              );
              expectPath(cst, `0.markup.${i}.expression.left.type`).to.equal(conditional.left.type);
              expectPath(cst, `0.markup.${i}.expression.right.type`).to.equal(
                conditional.right.type,
              );
            }
          });
        });
      });
    });
  });

  describe('Case: LiquidNode', () => {
    it('should parse raw tags', () => {
      ['style', 'raw'].forEach((raw) => {
        cst = toLiquidHtmlCST(`{% ${raw} -%}<div>{%- end${raw} %}`);
        expectPath(cst, '0.type').to.equal('LiquidRawTag');
        expectPath(cst, '0.body').to.equal('<div>');
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
        expectPath(cst, '0.delimiterWhitespaceStart').to.equal('-');
        expectPath(cst, '0.delimiterWhitespaceEnd').to.equal(null);
      });
    });

    it('should properly return block{Start,End}Loc{Start,End} locations of raw tags', () => {
      const source = '{% raw -%}<div>{%- endraw %}';
      cst = toLiquidHtmlCST(source);
      expectPath(cst, '0.type').to.equal('LiquidRawTag');
      expectPath(cst, '0.body').to.equal('<div>');
      expectPath(cst, '0.blockStartLocStart').to.equal(0);
      expectPath(cst, '0.blockStartLocEnd').to.equal(source.indexOf('<'));
      expectPath(cst, '0.blockEndLocStart').to.equal(source.indexOf('>') + 1);
      expectPath(cst, '0.blockEndLocEnd').to.equal(source.length);
      expectPath(cst, '0.delimiterWhitespaceStart').to.equal('-');
      expectPath(cst, '0.delimiterWhitespaceEnd').to.equal(null);
    });

    it('should basically parse liquid tags', () => {
      cst = toLiquidHtmlCST('{%   unknown x = 1 %}{% if hi -%}{%- endif %}');
      expectPath(cst, '0.type').to.equal('LiquidTag');
      expectPath(cst, '0.name').to.equal('unknown');
      expectPath(cst, '0.markup').to.equal('x = 1');
      expectPath(cst, '0.whitespaceStart').to.equal(null);
      expectPath(cst, '0.whitespaceEnd').to.equal(null);
      expectPath(cst, '1.type').to.equal('LiquidTagOpen');
      expectPath(cst, '1.name').to.equal('if');
      expectPath(cst, '1.whitespaceStart').to.equal(null);
      expectPath(cst, '1.whitespaceEnd').to.equal('-');
      expectPath(cst, '2.type').to.equal('LiquidTagClose');
      expectPath(cst, '2.name').to.equal('if');
      expectPath(cst, '2.whitespaceStart').to.equal('-');
      expectPath(cst, '2.whitespaceEnd').to.equal(null);
    });

    it('should support nested comments', () => {
      const testStr = '{% comment -%} ho {% comment %} ho {% endcomment %} ho {%- endcomment %}';
      cst = toLiquidHtmlCST(testStr);
      expectPath(cst, '0.type').to.equal('LiquidRawTag');
      expectPath(cst, '0.name').to.equal('comment');
      expectPath(cst, '0.body').to.equal(' ho {% comment %} ho {% endcomment %} ho ');
      expectPath(cst, '0.whitespaceStart').to.equal('');
      expectPath(cst, '0.whitespaceEnd').to.equal('-');
      expectPath(cst, '0.delimiterWhitespaceStart').to.equal('-');
      expectPath(cst, '0.delimiterWhitespaceEnd').to.equal('');
      expectPath(cst, '0.blockStartLocStart').to.equal(0);
      expectPath(cst, '0.blockStartLocEnd').to.equal(0 + '{% comment -%}'.length);
      expectPath(cst, '0.blockEndLocStart').to.equal(testStr.length - '{%- endcomment %}'.length);
      expectPath(cst, '0.blockEndLocEnd').to.equal(testStr.length);
    });

    it('should parse tag open / close', () => {
      BLOCKS.forEach((block: string) => {
        cst = toLiquidHtmlCST(`{% ${block} args -%}{%- end${block} %}`);
        expectPath(cst, '0.type').to.equal('LiquidTagOpen', block);
        expectPath(cst, '0.name').to.equal(block);
        expectPath(cst, '0.whitespaceStart').to.equal(null);
        expectPath(cst, '0.whitespaceEnd').to.equal('-');
        if (!NamedTags.hasOwnProperty(block)) {
          expectPath(cst, '0.markup').to.equal('args');
        }
        expectPath(cst, '1.type').to.equal('LiquidTagClose');
        expectPath(cst, '1.name').to.equal(block);
        expectPath(cst, '1.whitespaceStart').to.equal('-');
        expectPath(cst, '1.whitespaceEnd').to.equal(null);
      });
    });
  });

  describe('Case: TextNode', () => {
    it('should parse text nodes', () => {
      ['<div>hello</div>', '{% if condition %}hello{% endif %}'].forEach((text) => {
        cst = toLiquidHtmlCST(text);
        expectPath(cst, '1.type').to.equal('TextNode');
        expectPath(cst, '1.value').to.equal('hello');
      });
    });

    it('should trim whitespace left and right', () => {
      [
        {
          testCase: '<div>  \n hello  world  </div>',
          expected: 'hello  world',
        },
        { testCase: '<div>  \n bb  </div>', expected: 'bb' },
        { testCase: '<div>  \n b  </div>', expected: 'b' },
        {
          testCase: '{% if a %}  \n hello  world  {% endif %}',
          expected: 'hello  world',
        },
        { testCase: '{% if a %}  \n bb  {% endif %}', expected: 'bb' },
        { testCase: '{% if a %}  \n b  {% endif %}', expected: 'b' },
      ].forEach(({ testCase, expected }) => {
        cst = toLiquidHtmlCST(testCase);
        expectPath(cst, '1.type').to.equal('TextNode');
        expectPathStringified(cst, '1.value').to.equal(JSON.stringify(expected));
      });
    });
  });

  it('should throw when trying to parse unparseable code', () => {
    const testCases = ['{% 10293 %}', '<h=>', '{% if', '{{ n', '<div>{{ n{% if'];
    for (const testCase of testCases) {
      try {
        toLiquidHtmlCST(testCase);
        expect(true, `expected ${testCase} to throw LiquidHTMLCSTParsingError`).to.be.false;
      } catch (e) {
        expect(e.name).to.eql('LiquidHTMLParsingError');
        expect(e.loc, `expected ${e} to have location information`).not.to.be.undefined;
      }
    }
  });

  it('should parse inline comments', () => {
    cst = toLiquidHtmlCST('{% # hello world \n # hi %}');
    expectPath(cst, '0.type').to.eql('LiquidTag');
    expectPath(cst, '0.name').to.eql('#');
    expectPath(cst, '0.markup').to.eql('hello world \n # hi');
  });

  function expectPath(cst: LiquidHtmlCST, path: string) {
    return expect(deepGet(path.split('.'), cst));
  }

  function expectPathStringified(cst: LiquidHtmlCST, path: string) {
    return expect(JSON.stringify(deepGet(path.split('.'), cst)));
  }
});
