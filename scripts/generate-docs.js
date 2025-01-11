import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SUPPORTED_PACKAGES = {
    '@fabric-msft/fabric-web': '2.0.0-beta.4',
    '@fluentui/web-components': '3.0.0-beta.76',
    '@microsoft/fast-element': '2.0.0-beta.26'
};
function generateFluentDocs() {
    const docs = [];
    Object.entries(SUPPORTED_PACKAGES).forEach(([pkg, version]) => {
        const packagePath = join(process.cwd(), 'node_modules', pkg);
        if (!existsSync(packagePath)) {
            console.warn(`Package ${pkg} not found in node_modules`);
            return;
        }
        const definitionFiles = findDefinitionFiles(packagePath);
        definitionFiles.forEach(file => {
            const componentDocs = parseComponentFile(file, pkg, version);
            docs.push(...componentDocs);
        });
    });
    generateMarkdown(docs);
}
function findDefinitionFiles(packagePath) {
    const program = ts.createProgram([packagePath], {});
    const files = [];
    program.getSourceFiles().forEach(sourceFile => {
        if (sourceFile.fileName.endsWith('.d.ts') && (sourceFile.text.includes('customElement') ||
            sourceFile.text.includes('@customElement') ||
            sourceFile.text.includes('FASTElement'))) {
            files.push(sourceFile.fileName);
        }
    });
    return files;
}
function parseComponentFile(filePath, packageName, version) {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);
    const docs = [];
    if (!sourceFile)
        return docs;
    ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node)) {
            const doc = {
                name: node.name?.text || 'Unknown',
                description: getDescription(node),
                package: packageName,
                version: version,
                props: getProps(node),
                events: getEvents(node),
                slots: getSlots(node),
                cssProperties: getCssProperties(node)
            };
            docs.push(doc);
        }
    });
    return docs;
}
function getDescription(node) {
    const jsDoc = ts.getJSDocTags(node);
    const comment = jsDoc[0]?.getFullText() || '';
    return comment.replace(/\/\*\*|\*\/|\*/g, '').trim();
}
function getProps(node) {
    const props = [];
    node.members.forEach(member => {
        if (ts.isPropertyDeclaration(member)) {
            const jsDoc = ts.getJSDocTags(member);
            const attr = jsDoc.find(tag => tag.tagName.escapedText === 'attr');
            const prop = jsDoc.find(tag => tag.tagName.escapedText === 'prop');
            if (attr || prop) {
                props.push({
                    name: member.name.text,
                    type: member.type?.getText() || 'any',
                    description: getDescription(member),
                    required: !member.questionToken
                });
            }
        }
    });
    return props;
}
function getEvents(node) {
    const events = [];
    node.members.forEach(member => {
        if (ts.isMethodDeclaration(member)) {
            const jsDoc = ts.getJSDocTags(member);
            if (jsDoc.some(tag => tag.tagName.escapedText === 'event')) {
                events.push({
                    name: member.name.text,
                    description: getDescription(member)
                });
            }
        }
    });
    return events;
}
function getSlots(node) {
    const slots = [];
    const jsDoc = ts.getJSDocTags(node);
    jsDoc.forEach(tag => {
        if (tag.tagName.escapedText === 'slot') {
            const comment = tag.getFullText();
            const slotName = comment.match(/@slot\s+(\{[^}]+\}|\S+)/)?.[1] || '';
            if (slotName)
                slots.push(slotName);
        }
    });
    return slots.length > 0 ? slots : undefined;
}
function getCssProperties(node) {
    const cssProps = [];
    const jsDoc = ts.getJSDocTags(node);
    jsDoc.forEach(tag => {
        if (tag.tagName.escapedText === 'cssProperty') {
            const comment = tag.getFullText();
            const matches = comment.match(/@cssProperty\s+(\{[^}]+\}|\S+)\s+(.+)/);
            if (matches) {
                cssProps.push({
                    name: matches[1].replace(/[{}]/g, ''),
                    description: matches[2].trim(),
                    default: comment.match(/default:\s*([^,\n]+)/)?.[1]
                });
            }
        }
    });
    return cssProps.length > 0 ? cssProps : undefined;
}
function generateMarkdown(docs) {
    let markdown = '# Fluent UI Components Documentation\n\n';
    // Group components by package
    const packageGroups = docs.reduce((groups, doc) => {
        const group = groups[doc.package] || [];
        group.push(doc);
        groups[doc.package] = group;
        return groups;
    }, {});
    Object.entries(packageGroups).forEach(([pkg, components]) => {
        markdown += `## Package: ${pkg} (v${components[0].version})\n\n`;
        components.forEach(doc => {
            markdown += `### ${doc.name}\n\n`;
            markdown += `${doc.description}\n\n`;
            if (doc.slots?.length) {
                markdown += '#### Slots\n\n';
                markdown += '| Slot | Description |\n';
                markdown += '|------|-------------|\n';
                doc.slots.forEach(slot => {
                    markdown += `| ${slot} | - |\n`;
                });
                markdown += '\n';
            }
            if (doc.props.length) {
                markdown += '#### Properties\n\n';
                markdown += '| Name | Type | Required | Description |\n';
                markdown += '|------|------|----------|-------------|\n';
                doc.props.forEach(prop => {
                    markdown += `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | ${prop.description} |\n`;
                });
                markdown += '\n';
            }
            if (doc.events.length) {
                markdown += '#### Events\n\n';
                markdown += '| Event | Description |\n';
                markdown += '|-------|-------------|\n';
                doc.events.forEach(event => {
                    markdown += `| ${event.name} | ${event.description} |\n`;
                });
                markdown += '\n';
            }
            if (doc.cssProperties?.length) {
                markdown += '#### CSS Custom Properties\n\n';
                markdown += '| Property | Default | Description |\n';
                markdown += '|----------|---------|-------------|\n';
                doc.cssProperties.forEach(prop => {
                    markdown += `| ${prop.name} | ${prop.default || '-'} | ${prop.description} |\n`;
                });
                markdown += '\n';
            }
        });
    });
    writeFileSync(join(process.cwd(), 'docs', 'fluent-components.md'), markdown);
}
generateFluentDocs();
