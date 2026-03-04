const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/components');

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory()) {
            processDir(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            const original = content;

            // Replace fetch("/something")
            content = content.replace(/fetch\(\s*\"(\/[^\"]+)\"/g, 'fetch(`${import.meta.env.VITE_API_URL}$1`');

            // Replace fetch(`/something`)
            content = content.replace(/fetch\(\s*\`(\/[^\`]+)\`/g, 'fetch(`${import.meta.env.VITE_API_URL}$1`');

            // Replace fetch('/something')
            content = content.replace(/fetch\(\s*'(\/[^']+)'/g, 'fetch(`${import.meta.env.VITE_API_URL}$1`');

            if (content !== original) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log('Fixed relative fetches in ' + file);
            }
        }
    }
}

processDir(dir);
