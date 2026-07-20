const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const content = fs.readFileSync(path.join(dataDir, f), 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
    
    const objName = Object.keys(sandbox.window)[0];
    const obj = sandbox.window[objName];
    
    const stages = new Set();
    Object.values(obj).forEach(l => stages.add(l.stage));
    
    console.log(`\n--- ${f} ---`);
    stages.forEach(s => console.log('  ' + s));
});
