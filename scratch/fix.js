const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, '../data');

function modifyFile(filename, variableName, modifierFn) {
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(content, sandbox);
    const obj = sandbox.window[variableName];
    if (!obj) return;
    modifierFn(obj);
    const newContent = `window.${variableName} = ` + JSON.stringify(obj, null, 4) + ';\n';
    fs.writeFileSync(filePath, newContent);
    console.log(`[OK] Updated ${filename}`);
}

// 2. ADF
modifyFile('adf.js', 'adfLessons', (obj) => {
    obj['1.15'] = {
        id: "1.15", stage: "Stage 4: Advanced ADF", module: "Core Activities", title: "Key ADF Activities",
        subtitle: "Execute Pipeline, Until, Switch, Filter, Validation.", duration: "🕒 10 min read", difficulty: "Intermediate",
        theory: "<h3>Important Activities</h3><ul><li><strong>Execute Pipeline:</strong> Triggers another pipeline (parent-child).</li><li><strong>Until:</strong> Loops until a condition is true.</li><li><strong>Switch:</strong> Evaluates an expression and executes one of multiple paths.</li><li><strong>Filter:</strong> Filters an input array.</li><li><strong>Validation:</strong> Pauses execution until a dataset exists/meets criteria.</li></ul><h3>Dependency Conditions</h3><p>Success (green), Failure (red), Completion (blue), Skip (grey).</p>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.16'] = {
        id: "1.16", stage: "Stage 4: Advanced ADF", module: "Parameters", title: "Parameters vs Variables",
        subtitle: "State management in ADF.", duration: "🕒 5 min read", difficulty: "Beginner",
        theory: "<ul><li><strong>Parameters:</strong> External read-only values passed at runtime.</li><li><strong>Variables:</strong> Internal state values updated via Set Variable / Append Variable.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.17'] = {
        id: "1.17", stage: "Stage 4: Advanced ADF", module: "Triggers & Monitoring", title: "Triggers & Runs",
        subtitle: "Scheduling and Auditing.", duration: "🕒 10 min read", difficulty: "Intermediate",
        theory: "<h3>Trigger Types</h3><ul><li><strong>Schedule:</strong> Wall-clock time.</li><li><strong>Tumbling Window:</strong> Fixed time slices, handles backfilling and dependencies.</li><li><strong>Event:</strong> Storage blob creation/deletion.</li><li><strong>Manual:</strong> Trigger Now.</li></ul><h3>Monitoring</h3><p>ADF exposes <strong>Pipeline Runs</strong>, <strong>Trigger Runs</strong>, and <strong>Activity Runs</strong> for debugging.</p>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 3. DBT
modifyFile('dbt.js', 'dbtLessons', (obj) => {
    if(obj['1.6']) {
        obj['1.6'].theory += "<h3>Source Freshness</h3><p><code>freshness:</code> block checks if source data arrives on time.</p><h3>Model Contracts</h3><p>Enforces exact schema output, preventing downstream breaks.</p>";
    }
    obj['1.16'] = {
        id: "1.16", stage: "Stage 4: Advanced dbt", module: "Packages", title: "dbt Packages",
        subtitle: "dbt_utils, dbt_expectations, codegen", duration: "🕒 5 min read", difficulty: "Intermediate",
        theory: "<p>Packages extend dbt functionality. Defined in <code>packages.yml</code>.</p><ul><li><strong>dbt_utils:</strong> Common macros (surrogate key, pivot).</li><li><strong>dbt_expectations:</strong> Great Expectations port for advanced testing.</li><li><strong>codegen:</strong> Auto-generates YAML files.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.17'] = {
        id: "1.17", stage: "Stage 4: Advanced dbt", module: "Environment", title: "Environment Variables",
        subtitle: "env_var()", duration: "🕒 5 min read", difficulty: "Intermediate",
        theory: "<p>Use <code>{{ env_var('MY_VAR') }}</code> in <code>profiles.yml</code> or <code>dbt_project.yml</code> to securely pass credentials and dynamic configs.</p>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.18'] = {
        id: "1.18", stage: "Stage 4: Advanced dbt", module: "CLI", title: "State Commands",
        subtitle: "ls, build, clone", duration: "🕒 5 min read", difficulty: "Intermediate",
        theory: "<ul><li><code>dbt ls</code>: Lists all resources (models, tests).</li><li><code>dbt build</code>: Runs models, tests, snapshots, and seeds in DAG order.</li><li><code>dbt clone</code>: Creates zero-copy clones in Snowflake.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.19'] = {
        id: "1.19", stage: "Stage 4: Advanced dbt", module: "Project Structure", title: "Project Structure",
        subtitle: "Understanding folders.", duration: "🕒 10 min read", difficulty: "Beginner",
        theory: "<ul><li><code>models/</code>: SQL files.</li><li><code>tests/</code>: Singular tests.</li><li><code>macros/</code>: Jinja functions.</li><li><code>snapshots/</code>: SCD Type 2 logic.</li><li><code>analyses/</code>: Ad-hoc SQL.</li><li><code>dbt_project.yml</code>: Main config.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 4. SQL
modifyFile('sql.js', 'sqlLessons', (obj) => {
    obj['1.11'] = {
        id: "1.11", stage: "Stage 3: SQL Internals", module: "Execution Order", title: "Execution Order",
        subtitle: "FROM, WHERE, GROUP BY...", duration: "🕒 10 min read", difficulty: "Beginner",
        theory: "<p>Logical order of execution: 1. FROM/JOIN, 2. WHERE, 3. GROUP BY, 4. HAVING, 5. WINDOW functions, 6. QUALIFY, 7. SELECT, 8. ORDER BY, 9. LIMIT.</p>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.12'] = {
        id: "1.12", stage: "Stage 3: SQL Internals", module: "ACID", title: "Isolation Levels & Locks",
        subtitle: "Read Committed vs Serializable", duration: "🕒 15 min read", difficulty: "Advanced",
        theory: "<h3>Isolation Levels</h3><ul><li><strong>Read Uncommitted:</strong> Dirty reads.</li><li><strong>Read Committed:</strong> Default in most databases.</li><li><strong>Repeatable Read:</strong> Prevents phantom reads.</li><li><strong>Serializable:</strong> Strictest.</li></ul><h3>Locking</h3><ul><li><strong>Shared Lock:</strong> For reads.</li><li><strong>Exclusive Lock:</strong> For writes.</li><li><strong>Deadlocks:</strong> Circular wait for locks.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.13'] = {
        id: "1.13", stage: "Stage 3: SQL Internals", module: "Optimization", title: "Query Optimization",
        subtitle: "Execution Plan, Index Scan, Seek", duration: "🕒 10 min read", difficulty: "Advanced",
        theory: "<ul><li><strong>Execution Plan:</strong> Visual roadmap of query execution.</li><li><strong>Statistics:</strong> Used by optimizer to choose paths.</li><li><strong>Index Scan:</strong> Scanning entire index (slow).</li><li><strong>Index Seek:</strong> Navigating b-tree to exact row (fast).</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 5. PYTHON
modifyFile('python.js', 'pythonLessons', (obj) => {
    obj['1.11'] = {
        id: "1.11", stage: "Stage 3: Python Concepts", module: "Advanced Syntax", title: "Context Managers, Decorators, Generators",
        subtitle: "with open(), yield", duration: "🕒 15 min read", difficulty: "Intermediate",
        theory: "<ul><li><strong>Context Managers:</strong> <code>with open()</code> ensures resources are cleaned up.</li><li><strong>Decorators:</strong> Wrappers to modify function behavior.</li><li><strong>Generators:</strong> <code>yield</code> keyword for lazy evaluation, saving memory.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.12'] = {
        id: "1.12", stage: "Stage 3: Python Concepts", module: "Environment", title: "Virtual Environments & Logging",
        subtitle: "venv, pip, logging", duration: "🕒 10 min read", difficulty: "Beginner",
        theory: "<ul><li><strong>Virtual Environment (venv):</strong> Isolated dependency spaces. Managed by <code>requirements.txt</code> and <code>pip</code>.</li><li><strong>Logging Module:</strong> Built-in <code>logging</code> for warning/error tracking instead of <code>print()</code>.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 6. FUNDAMENTALS
modifyFile('fundamentals.js', 'fundamentalsLessons', (obj) => {
    obj['1.11'] = {
        id: "1.11", stage: "Stage 3: Concepts", module: "Data Quality", title: "Data Quality Dimensions",
        subtitle: "Accuracy, Completeness...", duration: "🕒 10 min read", difficulty: "Beginner",
        theory: "<ul><li>Accuracy, Completeness, Consistency, Validity, Timeliness, Uniqueness.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.12'] = {
        id: "1.12", stage: "Stage 3: Concepts", module: "Lifecycle", title: "Data Lifecycle & Idempotency",
        subtitle: "Ingestion to Archiving", duration: "🕒 10 min read", difficulty: "Intermediate",
        theory: "<p><strong>Lifecycle:</strong> Ingestion → Storage → Transformation → Serving → Archiving.</p><p><strong>Idempotency:</strong> Re-running a pipeline yields the same result without data duplication.</p>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.13'] = {
        id: "1.13", stage: "Stage 3: Concepts", module: "Processing", title: "Batch vs Micro Batch vs Streaming",
        subtitle: "Choosing the paradigm", duration: "🕒 10 min read", difficulty: "Intermediate",
        theory: "<ul><li><strong>Batch:</strong> High latency (daily), high throughput, low cost.</li><li><strong>Micro Batch:</strong> Medium latency (15 mins), e.g., Snowpipe.</li><li><strong>Streaming:</strong> Low latency (sub-second), high complexity (Kafka).</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 7. DEVOPS
modifyFile('devops_obs.js', 'devopsObsLessons', (obj) => {
    obj['1.9'] = {
        id: "1.9", stage: "Stage 2: Observability", module: "SLAs", title: "SLA vs SLO vs SLI",
        subtitle: "Service Level Metrics", duration: "🕒 10 min read", difficulty: "Intermediate",
        theory: "<ul><li><strong>SLA (Agreement):</strong> Business contract (99.9% uptime).</li><li><strong>SLO (Objective):</strong> Internal team goal (99.95%).</li><li><strong>SLI (Indicator):</strong> Actual measured performance (99.98%).</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.10'] = {
        id: "1.10", stage: "Stage 2: Observability", module: "Lineage", title: "Lineage & Root Cause Analysis",
        subtitle: "OpenLineage, Purview", duration: "🕒 10 min read", difficulty: "Advanced",
        theory: "<ul><li><strong>Lineage Tools:</strong> OpenLineage, Microsoft Purview, dbt Docs map data dependencies.</li><li><strong>Root Cause Analysis:</strong> Tracing pipeline failures using lineage and logs.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});

// 8. AIDE
modifyFile('aide.js', 'aiDeLessons', (obj) => {
    obj['1.9'] = {
        id: "1.9", stage: "Stage 2: LLMs in DE", module: "Prompt Engineering", title: "Prompt Engineering",
        subtitle: "Few-shot, Zero-shot, CoT", duration: "🕒 10 min read", difficulty: "Beginner",
        theory: "<ul><li><strong>Zero-shot:</strong> No examples provided.</li><li><strong>Few-shot:</strong> Providing examples to guide output.</li><li><strong>Chain-of-Thought (CoT):</strong> Asking LLM to explain reasoning step-by-step.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
    obj['1.10'] = {
        id: "1.10", stage: "Stage 2: LLMs in DE", module: "RAG", title: "Embeddings & Chunking",
        subtitle: "Before Vector Search", duration: "🕒 15 min read", difficulty: "Advanced",
        theory: "<ul><li><strong>Embeddings:</strong> Converting text to mathematical vectors to measure semantic similarity.</li><li><strong>Chunking:</strong> Splitting large documents into smaller overlapping segments for efficient retrieval in RAG.</li></ul>",
        hasDiagram: false, hasTable: false, interviewQuestions: []
    };
});
