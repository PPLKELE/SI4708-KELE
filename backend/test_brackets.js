const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
let stack = [];
let line = 1;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') line++;
    if (content[i] === '{') stack.push(line);
    if (content[i] === '}') {
        if (stack.length > 0) stack.pop();
        else console.log(`Unmatched } at line ${line}`);
    }
}
console.log(`Unclosed { at lines: ${stack.join(', ')}`);
