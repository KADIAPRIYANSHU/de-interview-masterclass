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
    
    const map = {};
    Object.values(obj).forEach(l => {
        const prefix = l.id.split('.')[0];
        if (!map[prefix]) map[prefix] = new Set();
        map[prefix].add(l.stage);
    });
    
    console.log(`\n--- ${f} ---`);
    Object.keys(map).sort().forEach(k => {
        console.log(`  Prefix ${k}:`);
        map[k].forEach(s => console.log(`    - ${s}`));
    });
});
