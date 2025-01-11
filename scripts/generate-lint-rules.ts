import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

interface ComponentRule {
  attributes: {
    [key: string]: {
      type: string;
      values?: string[];
      required: boolean;
      default?: string;
    };
  };
  slots: {
    [key: string]: {
      description: string;
    };
  };
}

interface ComponentRules {
  [key: string]: ComponentRule;
}

function extractEnumValues(type: ts.Type, checker: ts.TypeChecker): string[] | undefined {
  if (type.isUnion()) {
    return type.types.map(t => {
      if (t.isLiteral()) {
        return String(t.value);
      }
      return checker.typeToString(t);
    });
  }
  return undefined;
}

function generateRules(): ComponentRules {
  const rules: ComponentRules = {};
  const program = ts.createProgram([/* Add paths to your component files */], {});
  const checker = program.getTypeChecker();

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node) && node.name) {
          const symbol = checker.getSymbolAtLocation(node.name);
          if (!symbol) return;

          // Check if it's a web component
          const customElementDecorator = (node as any).decorators?.find((d: ts.Decorator) => {
            if (!ts.isCallExpression(d.expression)) return false;
            if (!ts.isIdentifier(d.expression.expression)) return false;
            return d.expression.expression.text === 'customElement';
          });

          if (customElementDecorator && ts.isCallExpression(customElementDecorator.expression)) {
            const tagName = customElementDecorator.expression.arguments[0];
            if (ts.isStringLiteral(tagName)) {
              const componentName = tagName.text;
              rules[componentName] = {
                attributes: {},
                slots: {}
              };

              // Extract properties/attributes
              node.members.forEach(member => {
                if (ts.isPropertyDeclaration(member) && member.name) {
                  const propSymbol = checker.getSymbolAtLocation(member.name);
                  if (!propSymbol) return;

                  const propName = propSymbol.getName();
                  const propType = member.type
                    ? checker.getTypeFromTypeNode(member.type)
                    : checker.getTypeAtLocation(member);

                  const values = extractEnumValues(propType, checker);
                  const isRequired = !member.questionToken && !member.initializer;
                  const defaultValue = member.initializer
                    ? member.initializer.getText()
                    : undefined;

                  rules[componentName].attributes[propName] = {
                    type: values ? 'enum' : checker.typeToString(propType),
                    values,
                    required: isRequired,
                    default: defaultValue
                  };
                }
              });

              // Extract slots
              const tags = symbol.getJsDocTags();
              tags.forEach(tag => {
                if (tag.name === 'slot') {
                  const text = tag.text?.[0].text.trim();
                  if (text) {
                    const [name, description] = text.split(' - ');
                    rules[componentName].slots[name.trim()] = {
                      description: description?.trim() || ''
                    };
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  return rules;
}

function generateLintRuleFile(rules: ComponentRules) {
  const ruleContent = `
const COMPONENT_RULES = ${JSON.stringify(rules, null, 2)};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate Fluent UI component usage',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const tagName = node.name.name;
        if (!tagName || !COMPONENT_RULES[tagName]) return;

        const rules = COMPONENT_RULES[tagName];
        const attributes = node.attributes;

        // Check attributes
        attributes.forEach(attr => {
          if (attr.type !== 'JSXAttribute') return;

          const attrName = attr.name.name;
          const rule = rules.attributes[attrName];

          if (!rule) {
            context.report({
              node: attr,
              message: \`Unknown attribute '\${attrName}' for <\${tagName}>\`
            });
            return;
          }

          if (rule.type === 'enum' && attr.value.type === 'Literal') {
            const value = attr.value.value;
            if (!rule.values.includes(value)) {
              context.report({
                node: attr,
                message: \`Invalid value '\${value}' for \${attrName}. Expected one of: \${rule.values.join(', ')}\`,
                fix(fixer) {
                  if (rule.default) {
                    return fixer.replaceText(attr.value, \`"\${rule.default}"\`);
                  }
                }
              });
            }
          }

          if (rule.type === 'boolean' && attr.value?.type === 'Literal') {
            const value = attr.value.value;
            if (typeof value !== 'boolean') {
              context.report({
                node: attr,
                message: \`Attribute '\${attrName}' must be a boolean\`
              });
            }
          }
        });

        // Check required attributes
        Object.entries(rules.attributes).forEach(([name, rule]) => {
          if (rule.required && !attributes.some(attr =>
            attr.type === 'JSXAttribute' && attr.name.name === name
          )) {
            context.report({
              node,
              message: \`Missing required attribute '\${name}' for <\${tagName}>\`
            });
          }
        });

        // Check slots
        if (node.parent.children) {
          node.parent.children.forEach(child => {
            if (child.type === 'JSXElement' && child.openingElement.name.name === 'slot') {
              const slotName = child.openingElement.attributes.find(
                attr => attr.name.name === 'name'
              )?.value.value;

              if (slotName && !rules.slots[slotName]) {
                context.report({
                  node: child,
                  message: \`Unknown slot '\${slotName}' for <\${tagName}>\`
                });
              }
            }
          });
        }
      }
    };
  }
};`;

  writeFileSync(
    join(process.cwd(), 'scripts', 'eslint-rules', 'fluent-component-validator.js'),
    ruleContent
  );
}

// Generate and write the rules
const rules = generateRules();
generateLintRuleFile(rules);
