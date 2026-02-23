const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

walk('src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace hardcoded dark grays with Tailwind 'dark' variants (which we set to Royal Blue)
        content = content.replace(/gray-900/g, 'dark-900');
        content = content.replace(/gray-800/g, 'dark-800');
        content = content.replace(/gray-700/g, 'dark-700');

        // Replace light grays/whites with sand/cream variants to soften UI
        content = content.replace(/gray-50/g, 'sand-50');
        content = content.replace(/bg-white/g, 'bg-sand-50');
        // Note: leave text-white alone as it is needed on dark backgrounds


        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated colors in', filePath);
        }
    }
});
