const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

const checks = {
    'snowflake.js': [
        'Zero-Copy Cloning', 'Clone Database', 'Clone Schema', 'Clone Table',
        'Materialized Views', 'Dynamic Table',
        'External Tables', 'Auto Refresh',
        'Query Acceleration Service', 'QAS',
        'Warehouse Scaling', 'Auto Resume', 'Scaling Out',
        'Secure Views',
        'Secure UDFs', 'External Functions',
        'Data Retention', 'Time Travel', 'Fail-safe',
        'Monitoring', 'ACCOUNT_USAGE', 'INFORMATION_SCHEMA', 'LOGIN_HISTORY'
    ],
    'adf.js': [
        'Execute Pipeline Activity', 'Until Activity', 'Switch Activity', 'Filter Activity',
        'Validation Activity', 'Dependency Conditions', 'Pipeline Parameters vs Variables',
        'Schedule Trigger', 'Tumbling Window', 'Event Trigger', 'Pipeline Runs'
    ],
    'dbt.js': [
        'Source Freshness', 'Contracts', 'Model Contracts', 'Packages', 'dbt_utils',
        'Environment Variables', 'env_var', 'dbt ls', 'dbt build', 'dbt clone',
        'Project Structure', 'packages.yml'
    ],
    'sql.js': [
        'Execution Order', 'FROM', 'QUALIFY', 'Isolation Levels', 'Serializable',
        'Shared Lock', 'Deadlocks', 'Execution Plan', 'Index Scan'
    ],
    'python.js': [
        'Context Managers', 'Decorators', 'Generators', 'Virtual Environment', 'venv', 'logging'
    ],
    'fundamentals.js': [
        'Data Quality Dimensions', 'Timeliness', 'Data Lifecycle', 'Batch vs Micro Batch', 'Idempotency'
    ],
    'devops_obs.js': [
        'SLA vs SLO vs SLI', 'Lineage Tools', 'OpenLineage', 'Root Cause Analysis'
    ],
    'aide.js': [
        'Prompt Engineering', 'Few-shot', 'Embeddings', 'Chunking'
    ]
};

let output = '';

for (const [file, topics] of Object.entries(checks)) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        output += `\n--- ${file} ---\n`;
        for (const topic of topics) {
            if (content.toLowerCase().includes(topic.toLowerCase())) {
                output += `[FOUND] ${topic}\n`;
            } else {
                output += `[MISSING] ${topic}\n`;
            }
        }
    } else {
        output += `\n--- ${file} NOT FOUND ---\n`;
    }
}

console.log(output);
