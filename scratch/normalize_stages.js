const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const filePath = path.join(dataDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
    
    const objName = Object.keys(sandbox.window)[0];
    const obj = sandbox.window[objName];
    
    // Find canonical stage name for each prefix
    const canonicalStages = {};
    Object.values(obj).forEach(l => {
        const prefix = l.id.split('.')[0];
        if (l.id === `${prefix}.1`) {
            canonicalStages[prefix] = l.stage;
        }
    });
    
    // Fallback if .1 doesn't exist
    Object.values(obj).forEach(l => {
        const prefix = l.id.split('.')[0];
        if (!canonicalStages[prefix]) {
            canonicalStages[prefix] = l.stage;
        }
    });
    
    // Replace all stage values with canonical ones
    Object.values(obj).forEach(l => {
        const prefix = l.id.split('.')[0];
        l.stage = canonicalStages[prefix];
    });
    
    // Serialize back to file, handling the multiline theory strings
    let newContent = `window.${objName} = {\n`;
    const entries = Object.entries(obj);
    
    entries.forEach(([key, val], idx) => {
        let valStr = JSON.stringify(val, null, 4);
        
        // Convert \n in strings back to actual newlines if we want to preserve backticks? 
        // Actually, JSON.stringify uses double quotes and escapes newlines as \n. 
        // That is perfectly valid JavaScript and won't break anything. 
        // But to keep it close to original, we can just replace theory's string representation.
        // It's safer to just write the JSON.stringify output. It works identically in JS.
        
        newContent += `    "${key}": ${valStr}`;
        if (idx < entries.length - 1) newContent += ",\n";
        else newContent += "\n";
    });
    newContent += "};\n";
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Normalized stages for ${f}`);
});
