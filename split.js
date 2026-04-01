const fs = require('fs');

const htmlPath = 'index.html';
const cssPath = 'style.css';
const jsPath = 'app.js';

let html = fs.readFileSync(htmlPath, 'utf8');

// Use regex to extract style tag
const styleRegex = /<style>([\s\S]*?)<\/style>/i;
const styleMatch = html.match(styleRegex);

if (styleMatch) {
    fs.writeFileSync(cssPath, styleMatch[1].trim());
    html = html.replace(styleRegex, '<link rel="stylesheet" href="style.css">');
    console.log('Extracted CSS to style.css');
}

// Ensure game logic or script logic is extracted.
// Note: there may be multiple script tags. Tailor for the main one.
// Let's get the script tag at the end of the body.
const scriptRegex = /<script>([\s\S]*?)<\/script>/i;
let match;
let scriptContent = '';

// There might be multiple scripts. The first one is typically tailwind, 
// let's specifically target the last large inline script.
const scripts = html.match(/<script>([\s\S]*?)<\/script>/gi);

if (scripts && scripts.length > 0) {
    // Find the longest script to extract (which is our main JS)
    let longestScriptIndex = 0;
    let longestScriptContent = '';
    
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].length > longestScriptContent.length) {
            longestScriptContent = scripts[i];
            longestScriptIndex = i;
        }
    }
    
    const contentToExtract = longestScriptContent.replace(/<script>|<\/script>/gi, '').trim();
    fs.writeFileSync(jsPath, contentToExtract);
    html = html.replace(longestScriptContent, '<script src="app.js"></script>');
    console.log('Extracted JS to app.js');
}

fs.writeFileSync(htmlPath, html);
console.log('Successfully updated index.html');
