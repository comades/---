import fs from 'fs';
import path from 'path';

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.next', 'public', 'locales'];
const EXCLUDE_FILES = ['extract_chinese.ts', 'populate_translations.ts', 'extracted_strings.json'];

// Regex to match Traditional Chinese characters
const CHINESE_REGEX = /[\u4E00-\u9FFF]/;

function extractStringsFromFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const strings: Set<string> = new Set();

    // 1. Match standard quotes and backticks
    const quoteMatches = content.matchAll(/(["'`])([\s\S]*?)\1/g);
    for (const match of quoteMatches) {
        const str = match[2].trim();
        if (str && CHINESE_REGEX.test(str) && str.length < 500) {
            strings.add(str);
        }
    }

    // 2. Match JSX text content
    const jsxMatches = content.matchAll(/>([\s\S]*?)</g);
    for (const match of jsxMatches) {
        const str = match[1].trim();
        // Filter out strings that are just whitespace or don't contain Chinese
        if (str && CHINESE_REGEX.test(str) && !str.startsWith('{') && !str.endsWith('}') && str.length < 500) {
            // Clean up JSX text (remove extra whitespace/newlines)
            const cleanStr = str.replace(/\s+/g, ' ').trim();
            if (cleanStr && CHINESE_REGEX.test(cleanStr)) {
                strings.add(cleanStr);
            }
        }
    }

    return Array.from(strings);
}

function walkDir(dir: string, allStrings: Set<string>) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                walkDir(fullPath, allStrings);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext) && !EXCLUDE_FILES.includes(file)) {
                const strings = extractStringsFromFile(fullPath);
                strings.forEach(s => allStrings.add(s));
            }
        }
    }
}

const allExtractedStrings: Set<string> = new Set();
console.log('Starting extraction of Traditional Chinese strings...');
walkDir(process.cwd(), allExtractedStrings);

const result = Array.from(allExtractedStrings).sort();
fs.writeFileSync('extracted_strings.json', JSON.stringify(result, null, 2));

console.log(`Extraction complete! Found ${result.length} unique Traditional Chinese strings.`);
console.log('Results saved to extracted_strings.json');
