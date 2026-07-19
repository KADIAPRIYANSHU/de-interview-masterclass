const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));

// Domain mapping
const fileToDomain = {
    'snowflake.js': 'Snowflake Prep',
    'adf.js': 'Azure Data Factory (ADF)',
    'dbt.js': 'dbt Prep',
    'sql.js': 'SQL Masterclass',
    'python.js': 'Python Prep',
    'fundamentals.js': 'Data Engineering Fundamentals',
    'devops_obs.js': 'DevOps & Observability',
    'aide.js': 'AI in Data Engineering'
};

// We want a specific order of domains
const domainOrder = [
    'snowflake.js', 'adf.js', 'dbt.js', 'sql.js', 'python.js', 
    'fundamentals.js', 'devops_obs.js', 'aide.js'
];

let md = '# Full Data Engineering Curriculum Reference\n\n';
md += 'This document contains all details, theory, and interview questions for all 108 modules across the 8 domains.\n\n';

domainOrder.forEach(file => {
    if (!files.includes(file)) return;
    
    const domainName = fileToDomain[file] || file;
    md += `---\n\n# Domain: ${domainName}\n\n`;

    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const mockWindow = {};
    const scriptFunc = new Function('window', content);
    scriptFunc(mockWindow);

    const varName = Object.keys(mockWindow)[0];
    const dataObj = mockWindow[varName];
    
    // Group by stage
    const stages = {};
    Object.keys(dataObj).sort().forEach(id => {
        const mod = dataObj[id];
        if (!stages[mod.stage]) stages[mod.stage] = [];
        stages[mod.stage].push(mod);
    });

    const sortedStages = Object.keys(stages).sort();
    
    sortedStages.forEach(stage => {
        md += `## ${stage}\n\n`;
        
        stages[stage].forEach(mod => {
            md += `### [${mod.id}] ${mod.title}\n`;
            md += `*${mod.subtitle}*\n\n`;
            md += `**Duration:** ${mod.duration} | **Difficulty:** ${mod.difficulty}\n\n`;
            
            md += `#### Theory\n`;
            // Clean up the HTML a bit for nicer markdown reading if desired, but markdown supports HTML.
            // Let's just output the HTML theory block directly.
            md += `${mod.theory.trim()}\n\n`;
            
            if (mod.interviewQuestions && mod.interviewQuestions.length > 0) {
                md += `#### Interview Questions\n`;
                mod.interviewQuestions.forEach(q => {
                    md += `**Q: ${q.question}**\n\n`;
                    md += `> A: ${q.answer}\n\n`;
                });
            }
            md += `\n<br/>\n\n`;
        });
    });
});

const outputPath = path.join(__dirname, 'Full_Curriculum_Reference.md');
fs.writeFileSync(outputPath, md);
console.log('Successfully generated Full_Curriculum_Reference.md');
