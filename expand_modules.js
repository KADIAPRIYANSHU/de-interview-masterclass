const fs = require('fs');

// Helper to inject text before the closing tag of the theory block for a specific module ID
function injectIntoTheory(filePath, moduleTitleSubstring, htmlToInject) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the module by title substring
    const titleRegex = new RegExp(`title: ".*${moduleTitleSubstring}.*",\\s*subtitle:`, 'g');
    const match = titleRegex.exec(content);
    
    if (!match) {
        console.log(`[!] Could not find module matching title "${moduleTitleSubstring}" in ${filePath}`);
        return;
    }
    
    // Find the end of the theory block for this module
    const theoryStartIdx = content.indexOf('theory: `', match.index);
    if (theoryStartIdx === -1) return;
    
    const theoryEndIdx = content.indexOf('`,', theoryStartIdx);
    if (theoryEndIdx === -1) return;
    
    // Check if we already injected this (idempotent)
    const currentTheory = content.substring(theoryStartIdx, theoryEndIdx);
    if (currentTheory.includes(htmlToInject.substring(0, 20))) {
        console.log(`[-] Already injected into "${moduleTitleSubstring}"`);
        return;
    }
    
    // Inject
    const newContent = content.slice(0, theoryEndIdx) + "\n" + htmlToInject + "\n        " + content.slice(theoryEndIdx);
    fs.writeFileSync(filePath, newContent);
    console.log(`[+] Successfully expanded module: "${moduleTitleSubstring}"`);
}

// 1. SNOWFLAKE ENHANCEMENTS
const sf = 'data/snowflake.js';
injectIntoTheory(sf, 'Warehouse Internals & Scaling', `
            <h3>Warehouse Sizing & Lifecycle</h3>
            <ul>
                <li><strong>Warehouse Sizes:</strong> Range from X-Small (1 credit/hr, 1 server) up to 6X-Large (512 credits/hr, 512 servers). Scaling UP gives more memory for complex joins.</li>
                <li><strong>Auto-Suspend:</strong> Automatically shuts down the warehouse after N seconds of inactivity to save credits.</li>
                <li><strong>Auto-Resume:</strong> Automatically wakes the warehouse up when a new query arrives. (Note: there is a slight 1-3 second spin-up latency).</li>
            </ul>
`);
injectIntoTheory(sf, 'Time Travel Deep Dive', `
            <h3>Object Restoration & Retention Limits</h3>
            <ul>
                <li><strong>Restore Objects:</strong> You can completely <code>RESTORE DATABASE</code>, <code>RESTORE SCHEMA</code>, or <code>RESTORE TABLE</code> if they were dropped, instantly recovering all underlying data without using backups.</li>
                <li><strong>Data Retention Limits:</strong> Standard Edition is hard-limited to 1 day of Time Travel. Enterprise Edition allows configuring the retention period up to 90 days.</li>
            </ul>
`);
injectIntoTheory(sf, 'Advanced Snowflake SQL', `
            <h3>Additional Advanced SQL Constructs</h3>
            <ul>
                <li><strong>RESULT_SCAN():</strong> A table function that returns the result set of a previous command (like returning the output of a DESCRIBE or SHOW command as a queryable table).</li>
                <li><strong>TABLE Functions:</strong> Functions that return a set of rows instead of a single scalar value. Used extensively in Snowflake for flattening or querying metadata.</li>
            </ul>
`);
injectIntoTheory(sf, 'Semi-Structured Data Processing', `
            <h3>Advanced Object & Array Construction</h3>
            <ul>
                <li><strong>OBJECT_CONSTRUCT():</strong> Builds a Snowflake OBJECT from key-value pairs. Useful for converting relational columns into a single JSON blob.</li>
                <li><strong>ARRAY_CONSTRUCT():</strong> Builds a JSON array from a list of inputs.</li>
                <li><strong>ARRAY_APPEND():</strong> Appends a new element to the end of an existing array.</li>
            </ul>
`);
injectIntoTheory(sf, 'CLI Clients & Native Connectors', `
            <h3>Advanced Integrations</h3>
            <ul>
                <li><strong>Kafka Connector:</strong> The Snowflake Connector for Kafka natively streams data directly from Kafka topics into Snowflake tables (often using Snowpipe Streaming under the hood).</li>
            </ul>
`);
injectIntoTheory(sf, 'Snowflake Security & Governance', `
            <h3>Authentication Methods</h3>
            <ul>
                <li><strong>OAuth & External OAuth:</strong> Standard protocol for delegated authorization without sharing credentials. Supports integration with Okta, Azure AD, Ping, etc.</li>
                <li><strong>Key Pair Authentication:</strong> Uses a 2048-bit RSA key pair (public/private) for highly secure, password-less authentication (often used by service accounts and programmatic clients like Python).</li>
            </ul>
`);

// 2. ADF ENHANCEMENTS
const adf = 'data/adf.js';
injectIntoTheory(adf, 'Trigger Types & Dependencies', `
            <h3>Detailed Trigger Types</h3>
            <ul>
                <li><strong>Schedule Trigger:</strong> Runs pipelines on a wall-clock schedule (e.g., daily at 2 AM).</li>
                <li><strong>Event Trigger:</strong> Runs in response to a Storage Event (like Blob created/deleted).</li>
                <li><strong>Tumbling Window Trigger:</strong> Fires at a periodic interval and maintains state. If a run fails, it can automatically retry. It also supports passing the start/end window times directly into the pipeline.</li>
                <li><strong>Manual Trigger:</strong> Triggered on-demand via the UI or REST API.</li>
            </ul>
`);
injectIntoTheory(adf, 'REST API Integration & Web Activities', `
            <h3>Advanced REST API Capabilities</h3>
            <ul>
                <li><strong>Pagination:</strong> ADF supports absolute url, next page URL, and RFC 5988 header pagination out of the box to loop through paginated endpoints.</li>
                <li><strong>OAuth Authentication:</strong> Connect securely using OAuth2 client credentials flow directly in the Linked Service.</li>
                <li><strong>Retry:</strong> Web Activities support configurable retry logic for transient API failures.</li>
            </ul>
`);
injectIntoTheory(adf, 'Dataset Parameterization & Dynamic Paths', `
            <h3>Parameter Types Comparison</h3>
            <ul>
                <li><strong>Pipeline Parameter:</strong> Inputs passed to the pipeline at runtime. Static throughout the execution.</li>
                <li><strong>Variable:</strong> State holders within a pipeline that can be modified (Set Variable, Append Variable).</li>
                <li><strong>Dataset Parameter:</strong> Parameters passed from the Pipeline down into the Dataset to dynamically alter folder paths or table names on the fly.</li>
            </ul>
`);

// 3. DBT ENHANCEMENTS
const dbt = 'data/dbt.js';
injectIntoTheory(dbt, 'dbt Project Structure', `
            <h3>Essential dbt Packages</h3>
            <ul>
                <li><strong>dbt-utils:</strong> Macros for cross-database compatibility (like surrogate key generation and date math).</li>
                <li><strong>dbt-expectations:</strong> Port of Great Expectations for advanced data quality testing within dbt.</li>
                <li><strong>audit-helper:</strong> Macros to compare query results and validate data between old and new pipelines.</li>
            </ul>
`);
// Wait, I might not have 'dbt Project Structure' exactly, let's use a broader regex or find a good module. Let's use 'Testing & Documentation'.
injectIntoTheory(dbt, 'Testing & Documentation', `
            <h3>Source Freshness</h3>
            <p>dbt can check if raw source data is arriving on time using the <code>dbt source freshness</code> command. You configure this in <code>sources.yml</code> using:</p>
            <ul>
                <li><strong>loaded_at_field:</strong> The timestamp column indicating when the data landed.</li>
                <li><strong>warn_after:</strong> E.g., 12 hours.</li>
                <li><strong>error_after:</strong> E.g., 24 hours.</li>
            </ul>
`);
injectIntoTheory(dbt, 'Testing & Documentation', `
            <h3>Important dbt Artifacts</h3>
            <p>dbt produces metadata artifacts in the <code>target/</code> directory after runs:</p>
            <ul>
                <li><strong>run_results.json:</strong> Execution times, success/failure status of every node.</li>
                <li><strong>catalog.json:</strong> Database metadata, column types, and descriptions.</li>
                <li><strong>sources.json:</strong> Output of the source freshness checks.</li>
            </ul>
`);
injectIntoTheory(dbt, 'dbt Cloud vs. dbt Core', `
            <h3>Environment Management</h3>
            <p>Both Core and Cloud support strict environment isolation:</p>
            <ul>
                <li><strong>dev:</strong> Isolated developer schemas (e.g., \`dbt_pkadia\`).</li>
                <li><strong>qa:</strong> Staging environment for CI/CD testing.</li>
                <li><strong>prod:</strong> The official production environment.</li>
            </ul>
`);

console.log("Expansion complete.");
