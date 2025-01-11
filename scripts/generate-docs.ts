import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ComponentDoc {
  name: string;
  description: string;
  package: string;
  version: string;
  props: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    values?: string[];
    default?: string;
  }[];
  events: {
    name: string;
    description: string;
  }[];
  slots?: string[];
  cssProperties?: {
    name: string;
    description: string;
    default?: string;
  }[];
  parts?: {
    name: string;
    description: string;
  }[];
  accessibility?: {
    role?: string;
    ariaAttrs?: { name: string; description: string; }[];
    keyboardInteraction?: string[];
  };
  examples?: string[];
  dependencies?: string[];
  states?: {
    name: string;
    description: string;
    trigger?: string;
  }[];
}

const SUPPORTED_PACKAGES = {
  '@fabric-msft/fabric-web': '2.0.0-beta.4',
  '@fluentui/web-components': '3.0.0-beta.76',
  '@microsoft/fast-element': '2.0.0-beta.26'
};

function findAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findAllTsFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.d.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function generateFluentDocs() {
  const docs: ComponentDoc[] = [];

  Object.entries(SUPPORTED_PACKAGES).forEach(([pkg, version]) => {
    const packagePath = join(process.cwd(), 'node_modules', pkg);
    if (!existsSync(packagePath)) {
      console.warn(`Package ${pkg} not found in node_modules`);
      return;
    }

    console.log(`Processing package: ${pkg}`);
    const files = findAllTsFiles(packagePath);
    console.log(`Found ${files.length} TypeScript files`);

    files.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8');
        if (content.includes('@customElement') ||
          content.includes('customElement(') ||
          content.includes('FASTElement') ||
          content.includes('@attr') ||
          content.includes('@prop') ||
          content.includes('defineComponent(') ||
          content.includes('FoundationElement') ||
          content.includes('extends FASTElement')) {
          console.log(`Processing file: ${file}`);
          const componentDocs = parseComponentFile(file, pkg, version);
          if (componentDocs.length > 0) {
            console.log(`Found ${componentDocs.length} components in ${file}`);
            docs.push(...componentDocs);
          }
        }
      } catch (error) {
        console.warn(`Error processing file ${file}:`, error);
      }
    });
  });

  if (docs.length === 0) {
    console.warn('No components found in any package');
    return;
  }

  console.log(`Found total of ${docs.length} components`);
  generateMarkdown(docs);
}

function isWebComponent(node: ts.ClassDeclaration, symbol: ts.Symbol): boolean {
  // Check for @customElement decorator
  const hasDecorator = !!(node as any).decorators?.some((d: ts.Decorator) => {
    if (!ts.isCallExpression(d.expression)) return false;
    if (!ts.isIdentifier(d.expression.expression)) return false;
    return d.expression.expression.text === 'customElement';
  });

  if (hasDecorator) return true;

  // Check for FASTElement inheritance
  const baseTypes = node.heritageClauses?.find(clause =>
    clause.token === ts.SyntaxKind.ExtendsKeyword
  )?.types;

  const extendsComponent = baseTypes?.some(type => {
    const text = type.getText();
    return text.includes('FASTElement') ||
      text.includes('FoundationElement') ||
      text.includes('BaseComponent');
  });

  if (extendsComponent) return true;

  // Check for component-related JSDoc tags
  const tags = symbol.getJsDocTags();
  return tags.some(tag =>
    tag.name === 'customElement' ||
    tag.name === 'component' ||
    tag.name === 'public'
  );
}

function parseComponentFile(filePath: string, packageName: string, version: string): ComponentDoc[] {
  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  const docs: ComponentDoc[] = [];

  if (!sourceFile) return docs;

  const checker = program.getTypeChecker();

  ts.forEachChild(sourceFile, node => {
    if (ts.isClassDeclaration(node) && node.name) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;

      const comments = ts.displayPartsToString(symbol.getDocumentationComment(checker));

      // Only include if it's a component
      if (!isWebComponent(node, symbol)) return;

      const doc: ComponentDoc = {
        name: node.name.text,
        description: comments || getDescriptionFromDecorator(node) || `${node.name.text} component`,
        package: packageName,
        version: version,
        props: getProps(node, checker),
        events: getEvents(node, checker),
        slots: getSlots(node, checker),
        cssProperties: getCssProperties(node, checker),
        parts: getParts(node, checker),
        accessibility: getAccessibilityInfo(node, checker),
        examples: getExamples(node, checker),
        states: getStates(node, checker),
        dependencies: getDependencies(sourceFile)
      };

      // Only add if we have meaningful documentation
      if (doc.props.length > 0 || doc.events.length > 0 || doc.slots?.length || doc.cssProperties?.length) {
        docs.push(doc);
      }
    }
  });

  return docs;
}

function getDescriptionFromDecorator(node: ts.ClassDeclaration): string | undefined {
  const decorators = (node as any).decorators;
  if (!decorators?.length) return undefined;

  const customElementDecorator = decorators.find((d: ts.Decorator) => {
    if (!ts.isCallExpression(d.expression)) return false;
    if (!ts.isIdentifier(d.expression.expression)) return false;
    return d.expression.expression.text === 'customElement';
  });

  if (customElementDecorator && ts.isCallExpression(customElementDecorator.expression)) {
    const args = customElementDecorator.expression.arguments;
    if (args.length > 1 && ts.isStringLiteral(args[1])) {
      return args[1].text;
    }
  }

  return undefined;
}

function getPropertyValues(type: ts.Type, checker: ts.TypeChecker): string[] | undefined {
  if (type.isUnion()) {
    return type.types.map(t => {
      if (t.isLiteral()) {
        return String(t.value);
      }
      if (t.isStringLiteral()) {
        return `"${t.value}"`;
      }
      return checker.typeToString(t);
    });
  }

  // Handle enum types
  if (type.flags & ts.TypeFlags.EnumLike) {
    const enumType = type as ts.UnionType;
    const values: string[] = [];

    enumType.types.forEach(t => {
      if (t.isLiteral()) {
        values.push(String(t.value));
      }
    });

    return values.length > 0 ? values : undefined;
  }

  return undefined;
}

function getProps(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['props'] {
  const props: ComponentDoc['props'] = [];
  const classType = checker.getTypeAtLocation(node);
  const baseTypes = classType.getBaseTypes() || [];

  // Get properties from base classes first
  baseTypes.forEach(baseType => {
    const baseProps = baseType.getProperties();
    baseProps.forEach(baseProp => {
      const tags = baseProp.getJsDocTags();
      const isAttr = tags.some(tag => tag.name === 'attr');
      const isProp = tags.some(tag => tag.name === 'prop');
      const isPublic = tags.some(tag => tag.name === 'public');

      if (isAttr || isProp || isPublic) {
        const propType = checker.getTypeOfSymbolAtLocation(baseProp, node);
        const values = getPropertyValues(propType, checker);
        props.push({
          name: baseProp.getName(),
          type: checker.typeToString(propType),
          description: ts.displayPartsToString(baseProp.getDocumentationComment(checker)) || `${baseProp.getName()} property`,
          required: (baseProp.flags & ts.SymbolFlags.Optional) === 0,
          values
        });
      }
    });
  });

  // Then get properties from the class itself
  node.members.forEach(member => {
    if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) {
      const symbol = checker.getSymbolAtLocation(member.name);
      if (!symbol) return;

      const comments = ts.displayPartsToString(symbol.getDocumentationComment(checker));
      const tags = symbol.getJsDocTags();

      // Check for various ways a property might be exposed
      const isAttr = tags.some(tag => tag.name === 'attr');
      const isProp = tags.some(tag => tag.name === 'prop');
      const isPublic = tags.some(tag => tag.name === 'public');
      const isReflected = member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.PublicKeyword);
      const hasDecorator = ts.isPropertyDeclaration(member) && (member as any).decorators?.some((d: ts.Decorator) => {
        if (!ts.isCallExpression(d.expression)) return false;
        const expr = d.expression.expression;
        return ts.isIdentifier(expr) && (
          expr.text === 'attr' ||
          expr.text === 'observable' ||
          expr.text === 'volatile'
        );
      });

      if (isAttr || isProp || isPublic || isReflected || hasDecorator) {
        const type = member.type
          ? checker.getTypeFromTypeNode(member.type)
          : checker.getTypeAtLocation(member);

        const values = getPropertyValues(type, checker);

        // Check if this property already exists from a base class
        const existingProp = props.find(p => p.name === symbol.getName());
        if (!existingProp) {
          const required = ts.isPropertyDeclaration(member)
            ? !member.questionToken && !member.initializer
            : !member.questionToken;

          props.push({
            name: symbol.getName(),
            type: checker.typeToString(type),
            description: comments || `${symbol.getName()} property`,
            required,
            values
          });
        }
      }
    }
  });

  return props;
}

function getEvents(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['events'] {
  const events: ComponentDoc['events'] = [];

  node.members.forEach(member => {
    if (ts.isMethodDeclaration(member)) {
      const symbol = checker.getSymbolAtLocation(member.name);
      if (!symbol) return;

      const tags = symbol.getJsDocTags();
      const eventTag = tags.find(tag => tag.name === 'event');

      if (eventTag) {
        events.push({
          name: symbol.getName(),
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)) || `${symbol.getName()} event`
        });
      }
    }
  });

  return events;
}

function getSlots(node: ts.ClassDeclaration, checker: ts.TypeChecker): string[] | undefined {
  const slots: string[] = [];
  const symbol = checker.getSymbolAtLocation(node.name!);

  if (symbol) {
    const tags = symbol.getJsDocTags();
    tags.forEach(tag => {
      if (tag.name === 'slot') {
        const text = tag.text?.[0].text.trim();
        if (text) slots.push(text);
      }
    });
  }

  return slots.length > 0 ? slots : undefined;
}

function getCssProperties(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['cssProperties'] | undefined {
  const cssProps: ComponentDoc['cssProperties'] = [];
  const symbol = checker.getSymbolAtLocation(node.name!);

  if (symbol) {
    const tags = symbol.getJsDocTags();
    tags.forEach(tag => {
      if (tag.name === 'cssProperty') {
        const text = tag.text?.[0].text.trim();
        if (text) {
          const [name, ...descParts] = text.split(' - ');
          const description = descParts.join(' - ');
          const defaultMatch = description.match(/default:\s*([^,\n]+)/);

          cssProps.push({
            name: name.trim(),
            description: description.replace(/default:\s*[^,\n]+/, '').trim(),
            default: defaultMatch ? defaultMatch[1].trim() : undefined
          });
        }
      }
    });
  }

  return cssProps.length > 0 ? cssProps : undefined;
}

function getExamples(node: ts.ClassDeclaration, checker: ts.TypeChecker): string[] | undefined {
  const examples: string[] = [];
  const symbol = checker.getSymbolAtLocation(node.name!);

  if (symbol) {
    const tags = symbol.getJsDocTags();
    tags.forEach(tag => {
      if (tag.name === 'example') {
        const text = tag.text?.[0].text.trim();
        if (text) examples.push(text);
      }
    });
  }

  return examples.length > 0 ? examples : undefined;
}

function getParts(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['parts'] | undefined {
  const parts: ComponentDoc['parts'] = [];
  const symbol = checker.getSymbolAtLocation(node.name!);

  if (symbol) {
    const tags = symbol.getJsDocTags();
    tags.forEach(tag => {
      if (tag.name === 'csspart') {
        const text = tag.text?.[0].text.trim();
        if (text) {
          const [name, ...descParts] = text.split(' - ');
          parts.push({
            name: name.trim(),
            description: descParts.join(' - ').trim()
          });
        }
      }
    });
  }

  return parts.length > 0 ? parts : undefined;
}

function getAccessibilityInfo(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['accessibility'] | undefined {
  const symbol = checker.getSymbolAtLocation(node.name!);
  if (!symbol) return undefined;

  const tags = symbol.getJsDocTags();
  const accessibilityInfo: ComponentDoc['accessibility'] = {};

  tags.forEach(tag => {
    if (tag.name === 'ariaRole') {
      accessibilityInfo.role = tag.text?.[0].text.trim();
    }
    if (tag.name === 'ariaAttr') {
      if (!accessibilityInfo.ariaAttrs) accessibilityInfo.ariaAttrs = [];
      const text = tag.text?.[0].text.trim();
      if (text) {
        const [name, ...descParts] = text.split(' - ');
        accessibilityInfo.ariaAttrs.push({
          name: name.trim(),
          description: descParts.join(' - ').trim()
        });
      }
    }
    if (tag.name === 'keyboard') {
      if (!accessibilityInfo.keyboardInteraction) accessibilityInfo.keyboardInteraction = [];
      const text = tag.text?.[0].text.trim();
      if (text) accessibilityInfo.keyboardInteraction.push(text);
    }
  });

  return Object.keys(accessibilityInfo).length > 0 ? accessibilityInfo : undefined;
}

function getStates(node: ts.ClassDeclaration, checker: ts.TypeChecker): ComponentDoc['states'] | undefined {
  const states: ComponentDoc['states'] = [];
  const symbol = checker.getSymbolAtLocation(node.name!);

  if (symbol) {
    const tags = symbol.getJsDocTags();
    tags.forEach(tag => {
      if (tag.name === 'state') {
        const text = tag.text?.[0].text.trim();
        if (text) {
          const [name, description, trigger] = text.split(' | ').map(s => s.trim());
          states.push({ name, description, trigger });
        }
      }
    });
  }

  return states.length > 0 ? states : undefined;
}

function getDependencies(sourceFile: ts.SourceFile): string[] {
  const dependencies: Set<string> = new Set();

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const importPath = moduleSpecifier.text;
        if (importPath.startsWith('@')) {
          dependencies.add(importPath.split('/')[0]);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return Array.from(dependencies);
}

function generateMarkdown(docs: ComponentDoc[]) {
  let markdown = '# Fluent UI Components Documentation\n\n';

  // Group components by package
  const packageGroups = docs.reduce((groups, doc) => {
    const group = groups[doc.package] || [];
    group.push(doc);
    groups[doc.package] = group;
    return groups;
  }, {} as Record<string, ComponentDoc[]>);

  Object.entries(packageGroups).forEach(([pkg, components]) => {
    markdown += `## Package: ${pkg} (v${components[0].version})\n\n`;

    components.forEach(doc => {
      markdown += `### ${doc.name}\n\n`;
      markdown += `${doc.description}\n\n`;

      if (doc.dependencies?.length) {
        markdown += '#### Dependencies\n\n';
        doc.dependencies.forEach(dep => {
          markdown += `- ${dep}\n`;
        });
        markdown += '\n';
      }

      if (doc.props.length) {
        markdown += '#### Properties & Attributes\n\n';
        markdown += '| Name | Type | Required | Default | Values | Description |\n';
        markdown += '|------|------|----------|---------|---------|-------------|\n';
        doc.props.forEach(prop => {
          const values = prop.values?.length
            ? `\`${prop.values.join('` \\| `')}\``
            : '-';
          const defaultValue = prop.default ? `\`${prop.default}\`` : '-';
          markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${defaultValue} | ${values} | ${prop.description} |\n`;
        });
        markdown += '\n';
      }

      if (doc.slots?.length) {
        markdown += '#### Slots\n\n';
        markdown += '| Slot | Description |\n';
        markdown += '|------|-------------|\n';
        doc.slots.forEach(slot => {
          markdown += `| \`${slot}\` | - |\n`;
        });
        markdown += '\n';
      }

      if (doc.parts?.length) {
        markdown += '#### CSS Parts\n\n';
        markdown += '| Part | Description |\n';
        markdown += '|------|-------------|\n';
        doc.parts.forEach(part => {
          markdown += `| \`${part.name}\` | ${part.description} |\n`;
        });
        markdown += '\n';
      }

      if (doc.accessibility) {
        markdown += '#### Accessibility\n\n';

        if (doc.accessibility.role) {
          markdown += `**ARIA Role:** \`${doc.accessibility.role}\`\n\n`;
        }

        if (doc.accessibility.ariaAttrs?.length) {
          markdown += '**ARIA Attributes:**\n\n';
          markdown += '| Attribute | Description |\n';
          markdown += '|-----------|-------------|\n';
          doc.accessibility.ariaAttrs.forEach(attr => {
            markdown += `| \`${attr.name}\` | ${attr.description} |\n`;
          });
          markdown += '\n';
        }

        if (doc.accessibility.keyboardInteraction?.length) {
          markdown += '**Keyboard Interactions:**\n\n';
          doc.accessibility.keyboardInteraction.forEach(interaction => {
            markdown += `- ${interaction}\n`;
          });
          markdown += '\n';
        }
      }

      if (doc.states?.length) {
        markdown += '#### States\n\n';
        markdown += '| State | Description | Trigger |\n';
        markdown += '|-------|-------------|---------|-------------|\n';
        doc.states.forEach(state => {
          markdown += `| \`${state.name}\` | ${state.description} | ${state.trigger || '-'} |\n`;
        });
        markdown += '\n';
      }

      if (doc.events.length) {
        markdown += '#### Events\n\n';
        markdown += '| Event | Description |\n';
        markdown += '|-------|-------------|\n';
        doc.events.forEach(event => {
          markdown += `| \`${event.name}\` | ${event.description} |\n`;
        });
        markdown += '\n';
      }

      if (doc.cssProperties?.length) {
        markdown += '#### CSS Custom Properties\n\n';
        markdown += '| Property | Default | Description |\n';
        markdown += '|----------|---------|-------------|\n';
        doc.cssProperties.forEach(prop => {
          markdown += `| \`${prop.name}\` | ${prop.default || '-'} | ${prop.description} |\n`;
        });
        markdown += '\n';
      }

      if (doc.examples?.length) {
        markdown += '#### Examples\n\n';
        doc.examples.forEach((example, index) => {
          markdown += `##### Example ${index + 1}\n\n`;
          markdown += '```html\n' + example + '\n```\n\n';
        });
      }
    });
  });

  writeFileSync(join(process.cwd(), 'docs', 'fluent-components.md'), markdown);
}

generateFluentDocs();
