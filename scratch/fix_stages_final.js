const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, '../data');

function modifyFile(filename, variableName, modifierFn) {
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Evaluate the JS file in a sandbox to get the object
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
    
    const obj = sandbox.window[variableName];
    if (!obj) {
        console.error(`Variable ${variableName} not found in ${filename}`);
        return;
    }

    // Apply modifications
    modifierFn(obj);

    // Write back
    const newContent = `window.${variableName} = ` + JSON.stringify(obj, null, 4) + ';\n';
    fs.writeFileSync(filePath, newContent);
    console.log(`[OK] Updated ${filename}`);
}

// 1. SNOWFLAKE
modifyFile('snowflake.js', 'snowflakeLessons', (obj) => {
    // 1.8 Zero-Copy Cloning
    if (obj['1.8']) {
        obj['1.8'].theory = `
            <h3>What is Zero-Copy Cloning?</h3>
            <p>Cloning allows you to create an instant copy of a database, schema, or table without physically copying the underlying data files. It's a metadata-only operation.</p>
            <ul>
                <li><strong>Clone Database / Schema / Table:</strong> You can clone at any of these levels.</li>
                <li><strong>Instantaneous & Metadata-Only:</strong> Takes seconds regardless of data size because it duplicates pointers in the Cloud Services layer.</li>
                <li><strong>Storage Implications:</strong> Initially consumes 0 extra bytes. You are billed for the delta (changes) made to the clone (write-on-write divergence).</li>
                <li><strong>Dev/Test Use Cases:</strong> Create sandbox environments for developers or QA using production data instantly and at zero initial cost.</li>
            </ul>
        `;
    }

    // 1.19 Materialized Views (NEW)
    obj['1.19'] = {
        id: "1.19",
        stage: "Stage 2: Advanced SQL & Optimization",
        module: "Materialized Views & Dynamic Tables",
        title: "Views, MVs & Dynamic Tables",
        subtitle: "When to use each for transformations.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Difference Between Views, MVs, and Dynamic Tables</h3>
            <ul>
                <li><strong>Standard View:</strong> Logical saved query. Executes the underlying query every time it's called. No storage cost, but compute cost on read.</li>
                <li><strong>Materialized View (MV):</strong> Pre-computed result set stored physically. Automatically maintained by Snowflake in the background. Best for predictable, repetitive aggregation queries. Limitations on complex joins.</li>
                <li><strong>Dynamic Table:</strong> Declarative data pipeline table. You specify a target "lag" (e.g., 1 hour). Snowflake uses a background warehouse to incrementally update it. Best for complex ETL/ELT streaming pipelines with joins.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: []
    };

    // 1.20 External Tables (NEW)
    obj['1.20'] = {
        id: "1.20",
        stage: "Stage 3: Data Ingestion & Integration",
        module: "External Tables",
        title: "External Tables",
        subtitle: "Querying data lake directly.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>External Tables</h3>
            <p>Allows querying data files (Parquet, ORC, CSV) directly from external stages (S3, ADLS, GCS) without loading them into Snowflake storage.</p>
            <ul>
                <li><strong>Reading Parquet/S3 directly:</strong> Great for schema-on-read Data Lake architectures.</li>
                <li><strong>Auto Refresh:</strong> Can be configured using cloud event notifications (SNS, Event Grid) to automatically refresh the metadata when new files land in the bucket.</li>
                <li><strong>Metadata Refresh:</strong> You can also manually refresh the metadata: <code>ALTER EXTERNAL TABLE my_table REFRESH;</code></li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: []
    };

    // 1.2 Warehouse Scaling
    if (obj['1.2']) {
        obj['1.2'].theory = `
            <h3>Scaling Up vs. Scaling Out</h3>
            <ul>
                <li><strong>Scaling UP (Vertical):</strong> Increasing the size (XS → 6XL). Best for improving the speed of complex, resource-heavy queries.</li>
                <li><strong>Scaling OUT (Horizontal):</strong> Adding clusters (Multi-cluster). Best for high user concurrency, preventing queries from queueing.</li>
            </ul>
            <h3>Auto Resume & Auto Suspend</h3>
            <p><strong>Auto Suspend:</strong> Stops the warehouse after X minutes of inactivity to save credits. <strong>Auto Resume:</strong> Instantly starts the warehouse when a new query arrives.</p>
            <h3>Query Acceleration Service (QAS)</h3>
            <p>Serverless compute that accelerates parts of massive table scans. Helps outlier queries without needing to scale up the whole warehouse. Cost is billed per second of serverless compute used.</p>
        `;
    }

    // 1.21 Secure Views (NEW)
    obj['1.21'] = {
        id: "1.21",
        stage: "Stage 4: Security & Governance",
        module: "Secure Views",
        title: "Secure Views",
        subtitle: "Protecting sensitive logic.",
        duration: "🕒 5 min read",
        difficulty: "Beginner",
        theory: `
            <h3>View vs Secure View</h3>
            <ul>
                <li><strong>Standard View:</strong> Users can run <code>GET_DDL</code> or look at the query profile to see the underlying SQL definition.</li>
                <li><strong>Secure View:</strong> Hides the underlying SQL definition and table structures from unauthorized users. Required for Data Sharing and hiding Row Access Policy logic. May impact query optimization slightly because the optimizer cannot bypass the view boundary.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: []
    };

    // 1.22 Secure UDFs & External Functions (NEW)
    obj['1.22'] = {
        id: "1.22",
        stage: "Stage 4: Security & Governance",
        module: "Advanced Functions",
        title: "Secure UDFs & External Functions",
        subtitle: "Extending Snowflake.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Secure UDFs</h3>
            <p>Similar to Secure Views, Secure UDFs hide the implementation logic of the function. Useful for masking proprietary algorithms.</p>
            <h3>External Functions</h3>
            <p>Allows Snowflake to call an external API (like an AWS API Gateway to a Lambda function) during query execution. Good for enterprise use cases like real-time fraud scoring, external tokenization, or calling 3rd party ML models.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: []
    };

    // 1.9 Data Retention
    if (obj['1.9']) {
        obj['1.9'].theory = `
            <h3>Time Travel vs Fail-safe</h3>
            <ul>
                <li><strong>Time Travel:</strong> Allows querying historical data, undropping tables, and cloning from the past. Retention Period: 0-1 days (Standard edition), up to 90 days (Enterprise).</li>
                <li><strong>Fail-safe:</strong> A non-configurable 7-day period that begins immediately after the Time Travel retention period ends. Used only for disaster recovery by Snowflake Support. Customers cannot query Fail-safe data.</li>
            </ul>
        `;
    }

    // 1.16 Monitoring
    if (obj['1.16']) {
        obj['1.16'].theory += `
            <h3>Useful System Views</h3>
            <ul>
                <li><code>QUERY_HISTORY</code>: Tracks executed queries, duration, and bytes scanned.</li>
                <li><code>LOGIN_HISTORY</code>: Audits user authentication and failed login attempts.</li>
                <li><code>WAREHOUSE_METERING_HISTORY</code>: Tracks credit consumption by warehouse by hour.</li>
            </ul>
        `;
    }
});
