const fs = require('fs');

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
        // Global replace using split/join to avoid regex escaping issues
        content = content.split(r.find).join(r.replace);
    }
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
}

replaceAll('data/snowflake.js', [
    { find: '"1.19": {', replace: '"4.4": {' },
    { find: 'id: "1.19",', replace: 'id: "4.4",' },
    { find: '"1.20": {', replace: '"4.5": {' },
    { find: 'id: "1.20",', replace: 'id: "4.5",' },
    { find: '"1.21": {', replace: '"4.6": {' },
    { find: 'id: "1.21",', replace: 'id: "4.6",' },
    { find: '"1.22": {', replace: '"4.7": {' },
    { find: 'id: "1.22",', replace: 'id: "4.7",' },
    { find: 'stage: "Stage 4: Automation & Cost",', replace: 'stage: "Stage 4: Ecosystem & Advanced",' }
]);

replaceAll('data/adf.js', [
    { find: '"2.7": {', replace: '"4.4": {' },
    { find: 'id: "2.7",', replace: 'id: "4.4",' },
    { find: '"2.8": {', replace: '"4.5": {' },
    { find: 'id: "2.8",', replace: 'id: "4.5",' },
    { find: '"2.9": {', replace: '"4.6": {' },
    { find: 'id: "2.9",', replace: 'id: "4.6",' },
    { find: 'stage: "Stage 3: Microsoft Fabric & Advanced Patterns",', replace: 'stage: "Stage 4: Operations & Alerts",' }
]);

replaceAll('data/dbt.js', [
    { find: '"3.5": {', replace: '"4.4": {' },
    { find: 'id: "3.5",', replace: 'id: "4.4",' },
    { find: '"3.6": {', replace: '"4.5": {' },
    { find: 'id: "3.6",', replace: 'id: "4.5",' },
    { find: '"3.7": {', replace: '"4.6": {' },
    { find: 'id: "3.7",', replace: 'id: "4.6",' },
    { find: 'stage: "Stage 3: Governance & Ecosystem",', replace: 'stage: "Stage 4: Enterprise Ops & CI/CD",' }
]);

replaceAll('data/devops_obs.js', [
    { find: '"1.9": {', replace: '"2.6": {' },
    { find: 'id: "1.9",', replace: 'id: "2.6",' },
    { find: 'stage: "Stage 2: Advanced Deployment Patterns",', replace: 'stage: "Stage 2: Observability & Monitoring",' }
]);

replaceAll('data/fundamentals.js', [
    { find: '"1.11": {', replace: '"2.6": {' },
    { find: 'id: "1.11",', replace: 'id: "2.6",' },
    { find: '"1.12": {', replace: '"2.7": {' },
    { find: 'id: "1.12",', replace: 'id: "2.7",' },
    { find: '"1.13": {', replace: '"2.8": {' },
    { find: 'id: "1.13",', replace: 'id: "2.8",' },
    { find: 'stage: "Stage 2: Production Engineering",', replace: 'stage: "Stage 2: Advanced Modeling & Quality",' }
]);
