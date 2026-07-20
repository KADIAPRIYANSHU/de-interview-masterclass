const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

function replaceInFile(filename, replacements) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const r of replacements) {
        if (!content.includes(r.search)) {
            console.log(`[WARN] Search string not found in ${filename}:\n${r.search.substring(0, 50)}...`);
        } else {
            content = content.replace(r.search, r.replace);
            console.log(`[OK] Replaced in ${filename}`);
        }
    }
    fs.writeFileSync(filePath, content);
}

// 1. SNOWFLAKE
replaceInFile('snowflake.js', [
    {
        search: `            <h3>The Approach</h3>
            <ul>
                <li><strong>Monitor Usage:</strong> Query metadata tables (e.g., <code>ACCOUNT_USAGE.QUERY_HISTORY</code>) to find the most expensive or longest-running queries.</li>`,
        replace: `            <h3>The Approach</h3>
            <ul>
                <li><strong>Monitor Usage:</strong> Query metadata tables (e.g., <code>ACCOUNT_USAGE.QUERY_HISTORY</code>, <code>ACCOUNT_USAGE.LOGIN_HISTORY</code>, <code>ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY</code>) to find the most expensive queries or track login/billing spikes. Note: <code>INFORMATION_SCHEMA</code> is real-time but only holds 7-14 days of data depending on the view, while <code>ACCOUNT_USAGE</code> holds 1 year of data with up to a 2-hour latency.</li>`
    },
    {
        search: `        module: "Account Usage & Metadata",
        title: "Metadata & Billing Audits",
        subtitle: "Using ACCOUNT_USAGE and INFORMATION_SCHEMA.",`,
        replace: `        module: "Monitoring & Metadata",
        title: "Monitoring, Metadata & Billing",
        subtitle: "Using ACCOUNT_USAGE, INFORMATION_SCHEMA, LOGIN_HISTORY, WAREHOUSE_METERING_HISTORY.",`
    },
    {
        search: `    "1.8": {
        id: "1.8",
        stage: "Stage 2: Advanced SQL & Optimization",
        module: "Zero-Copy Cloning",
        title: "Zero-Copy Cloning",
        subtitle: "Creating instant logical copies of databases, schemas, and tables.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: \`
            <h3>What is Zero-Copy Cloning?</h3>
            <p>Cloning allows you to create an instant copy of a database, schema, or table without physically copying the underlying data files. It's a metadata-only operation.</p>
            <ul>
                <li><strong>Instantaneous:</strong> Takes seconds regardless of data size.</li>
                <li><strong>No Extra Storage Cost:</strong> Initially consumes 0 extra bytes. You are only billed for the delta (changes) made to the clone.</li>
                <li><strong>Independent:</strong> Changes made to the clone do not affect the original object.</li>
            </ul>
        \`,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How does Zero-Copy Cloning work under the hood?", answer: "It duplicates the metadata pointers to the physical micro-partitions in the cloud services layer. The source and target tables read the same files until modifications are made to either, causing write-on-write divergence." }
        ]
    },`,
        replace: `    "1.8": {
        id: "1.8",
        stage: "Stage 2: Advanced SQL & Optimization",
        module: "Zero-Copy Cloning",
        title: "Zero-Copy Cloning",
        subtitle: "Creating instant logical copies of databases, schemas, and tables.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: \`
            <h3>What is Zero-Copy Cloning?</h3>
            <p>Cloning allows you to create an instant copy of a database, schema, or table without physically copying the underlying data files. It's a metadata-only operation.</p>
            <ul>
                <li><strong>Clone Database / Schema / Table:</strong> You can clone at any of these levels (e.g., <code>CREATE TABLE clone_tbl CLONE orig_tbl;</code>).</li>
                <li><strong>Instantaneous & Metadata-Only:</strong> Takes seconds regardless of data size because it only duplicates pointers in the Cloud Services layer.</li>
                <li><strong>Storage Implications:</strong> Initially consumes 0 extra bytes. You are only billed for the delta (changes) made to the clone (write-on-write divergence).</li>
                <li><strong>Dev/Test Use Cases:</strong> Extremely popular for creating sandbox environments for developers or QA using production data instantly and at zero initial cost.</li>
            </ul>
        \`,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How does Zero-Copy Cloning work under the hood?", answer: "It duplicates the metadata pointers to the physical micro-partitions in the cloud services layer. The source and target tables read the same files until modifications are made to either." },
            { question: "If I clone a 10TB table and delete 1TB from the clone, how much storage am I billed for?", answer: "You will be billed for the original 10TB plus any new micro-partitions created by the delete operation (which writes new micro-partitions excluding the deleted rows). The clone doesn't 'free up' storage from the original." }
        ]
    },`
    }
]);

// 2. ADF
replaceInFile('adf.js', [
    {
        search: `    "1.7": {
        id: "1.7",
        stage: "Stage 2: Pipeline Design & Control Flow",
        module: "Control Flow Activities",
        title: "Loops, Lookups & Conditionals",`,
        replace: `    "1.7": {
        id: "1.7",
        stage: "Stage 2: Pipeline Design & Control Flow",
        module: "Control Flow Activities",
        title: "Execute Pipeline, Loops, Lookups & Conditionals",`
    },
    {
        search: `            <h3>Key Activities</h3>
            <ul>
                <li><strong>Lookup Activity:</strong> Reads data from a dataset (e.g., a SQL table, a JSON file) and returns it as a JSON payload. Maximum limit is 5,000 rows/2MB. Used heavily to read configurations.</li>
                <li><strong>Get Metadata Activity:</strong> Retrieves metadata about a dataset (e.g., file size, exists, column names, last modified date).</li>
                <li><strong>ForEach Activity:</strong> Iterates over a collection (array). By default, it runs in parallel (up to 50 batches), but can be set to sequential. Cannot be nested inside another ForEach.</li>
                <li><strong>If Condition Activity:</strong> Executes different inner activities based on a boolean expression evaluation.</li>
            </ul>`,
        replace: `            <h3>Key Activities</h3>
            <ul>
                <li><strong>Execute Pipeline Activity:</strong> Extremely common. Triggers another pipeline, allowing modularization (parent-child pipelines) and bypassing limits (e.g., nesting ForEach).</li>
                <li><strong>Until Activity:</strong> Executes inner activities in a loop until a condition evaluates to true (unlike ForEach which iterates over a fixed array). Great for polling APIs or waiting for a file.</li>
                <li><strong>Switch Activity:</strong> Evaluates an expression and executes one of multiple paths (cases). Cleaner than nested If Conditions.</li>
                <li><strong>Filter Activity:</strong> Filters an input array based on a condition and outputs a smaller array. Very common before ForEach.</li>
                <li><strong>Validation Activity:</strong> Pauses the pipeline execution until a dataset exists, meets a size criteria, or times out. Often used after a file arrival.</li>
                <li><strong>Dependency Conditions:</strong> You can chain activities on four conditions: Success (green), Failure (red), Completion (blue - success or failure), and Skip (grey).</li>
            </ul>
            <h3>Parameters vs Variables</h3>
            <ul>
                <li><strong>Parameters:</strong> External values passed into a pipeline at runtime. They are read-only during execution.</li>
                <li><strong>Variables:</strong> Internal state values that can be set and updated during pipeline execution using the Set Variable or Append Variable activities.</li>
            </ul>`
    }
]);

// 3. DBT
replaceInFile('dbt.js', [
    {
        search: `    "1.6": {
        id: "1.6",
        stage: "Stage 2: Testing & Documentation",
        module: "dbt Tests",
        title: "Generic & Singular Tests",`,
        replace: `    "1.6": {
        id: "1.6",
        stage: "Stage 2: Testing & Documentation",
        module: "dbt Tests & Source Freshness",
        title: "Generic/Singular Tests & Freshness",`
    },
    {
        search: `            <h3>Generic Tests</h3>
            <p>Built-in tests defined in <code>schema.yml</code> files:</p>
            <ul>
                <li><code>unique</code>: Checks if all values in a column are unique.</li>
                <li><code>not_null</code>: Checks for NULL values.</li>
                <li><code>accepted_values</code>: Checks if values fall within a predefined list (e.g., 'active', 'pending').</li>
                <li><code>relationships</code>: Checks referential integrity against another table (Foreign Key constraint).</li>
            </ul>`,
        replace: `            <h3>Generic Tests</h3>
            <p>Built-in tests defined in <code>schema.yml</code> files:</p>
            <ul>
                <li><code>unique</code>, <code>not_null</code>, <code>accepted_values</code>, <code>relationships</code>.</li>
            </ul>
            <h3>Source Freshness</h3>
            <p>Defined using the <code>freshness:</code> block in source YAML files. It checks if the source data is arriving on time by comparing the maximum loaded timestamp against current time (warn after X hours, error after Y hours).</p>
            <h3>Contracts</h3>
            <p><strong>Model Contracts:</strong> Enforces the exact schema (column names and data types) output by the model. If the SQL produces a different schema, dbt throws a compile error, preventing downstream breakages.</p>`
    }
]);
