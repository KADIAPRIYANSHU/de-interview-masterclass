const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));

let totalModules = 0;
let totalErrors = 0;
let totalWarnings = 0;

console.log('--- STARTING DEEP CHECK ---\n');

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for weird duration strings like the dY ' 10 min read we saw earlier
    const durationMatch = content.match(/duration:\s*["']([^"']+)["']/g);
    if (durationMatch) {
        durationMatch.forEach(d => {
            if (!d.includes('🕒') && !d.includes('min read')) {
                console.log(`[WARNING] ${file}: Weird duration format found: ${d}`);
                totalWarnings++;
            }
        });
    }

    // Mock window to eval the file safely
    const mockWindow = {};
    try {
        const scriptFunc = new Function('window', content);
        scriptFunc(mockWindow);
    } catch (e) {
        console.log(`[CRITICAL ERROR] ${file}: JS Evaluation failed - ${e.message}`);
        totalErrors++;
        return; // Skip further checks for this file
    }

    // Find the object attached to window
    const keys = Object.keys(mockWindow);
    if (keys.length === 0) {
        console.log(`[ERROR] ${file}: Did not attach anything to window object.`);
        totalErrors++;
        return;
    }

    const varName = keys[0];
    const dataObj = mockWindow[varName];
    
    if (typeof dataObj !== 'object') {
        console.log(`[ERROR] ${file}: window.${varName} is not an object.`);
        totalErrors++;
        return;
    }

    const moduleKeys = Object.keys(dataObj);
    console.log(`Checking ${file} (${moduleKeys.length} modules attached to window.${varName})...`);

    moduleKeys.forEach(key => {
        totalModules++;
        const mod = dataObj[key];
        
        // Check ID matching
        if (key !== mod.id) {
            console.log(`[ERROR] ${file} -> Key "${key}": ID mismatch (mod.id = "${mod.id}")`);
            totalErrors++;
        }

        // Check required fields
        const required = ['id', 'stage', 'module', 'title', 'subtitle', 'duration', 'difficulty', 'theory', 'hasDiagram', 'hasTable', 'interviewQuestions'];
        required.forEach(req => {
            if (mod[req] === undefined) {
                console.log(`[ERROR] ${file} -> Module ${key}: Missing required field "${req}"`);
                totalErrors++;
            }
        });

        // Check theory HTML basic sanity (unclosed tags)
        if (mod.theory) {
            const h3Open = (mod.theory.match(/<h3>/g) || []).length;
            const h3Close = (mod.theory.match(/<\/h3>/g) || []).length;
            if (h3Open !== h3Close) {
                console.log(`[ERROR] ${file} -> Module ${key}: Mismatched <h3> tags in theory.`);
                totalErrors++;
            }
            
            const pOpen = (mod.theory.match(/<p>/g) || []).length;
            const pClose = (mod.theory.match(/<\/p>/g) || []).length;
            if (pOpen !== pClose) {
                console.log(`[WARNING] ${file} -> Module ${key}: Mismatched <p> tags in theory (Open: ${pOpen}, Close: ${pClose}).`);
                totalWarnings++;
            }
            
            const ulOpen = (mod.theory.match(/<ul>/g) || []).length;
            const ulClose = (mod.theory.match(/<\/ul>/g) || []).length;
            if (ulOpen !== ulClose) {
                console.log(`[ERROR] ${file} -> Module ${key}: Mismatched <ul> tags in theory.`);
                totalErrors++;
            }
        }

        // Check tables
        if (mod.hasTable) {
            if (!mod.tableData || !mod.tableData.headers || !mod.tableData.rows) {
                console.log(`[ERROR] ${file} -> Module ${key}: hasTable is true, but tableData is malformed or missing.`);
                totalErrors++;
            } else if (mod.tableData.rows.some(row => row.length !== mod.tableData.headers.length)) {
                console.log(`[ERROR] ${file} -> Module ${key}: tableData row length does not match header length.`);
                totalErrors++;
            }
        }

        // Check interview questions
        if (Array.isArray(mod.interviewQuestions)) {
            if (mod.interviewQuestions.length === 0) {
                console.log(`[WARNING] ${file} -> Module ${key}: Empty interview questions array.`);
                totalWarnings++;
            }
            mod.interviewQuestions.forEach((q, i) => {
                if (!q.question || !q.answer) {
                    console.log(`[ERROR] ${file} -> Module ${key}: Question index ${i} is missing 'question' or 'answer' field.`);
                    totalErrors++;
                }
            });
        }
    });
});

console.log('\n--- AUDIT COMPLETE ---');
console.log(`Total Modules Checked: ${totalModules}`);
console.log(`Total Errors Found: ${totalErrors}`);
console.log(`Total Warnings Found: ${totalWarnings}`);
