window.snowflakeLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Architecture Basics",
        title: "Snowflake Architecture",
        subtitle: "Master the 3-layer architecture, micro-partitions, and caching mechanisms.",
        duration: "🕒 15 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
            <h3>The 3-Layer Architecture</h3>
            <ul>
                <li><strong>Cloud Services Layer:</strong> The brain. Handles authentication, infrastructure management, metadata, query parsing, optimization, transaction management (ACID), and access control.</li>
                <li><strong>Compute Layer (Virtual Warehouses):</strong> Massive parallel processing (MPP) compute clusters. They execute the queries. They don't store data permanently, but they cache data locally on SSDs while running.</li>
                <li><strong>Storage Layer:</strong> The central repository for persisted data (S3, Azure Blob, GCS). Data is stored in Snowflake's proprietary <strong>columnar</strong> format and split into <strong>micro-partitions</strong> (50MB-500MB).</li>
            </ul>
            <h3>Why are Indexes Unnecessary?</h3>
            <p>Snowflake doesn't use traditional B-Tree indexes. Instead, the Cloud Services layer stores <strong>Metadata</strong> for every micro-partition (like MIN, MAX, and NULL counts). When you query <code>WHERE date = '2026-07-17'</code>, Snowflake prunes (ignores) 99% of the micro-partitions because it knows from the metadata that those files don't contain this date. This is called <strong>Query Pruning</strong>.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What happens internally when SELECT is executed?", answer: "1. Cloud Services authenticates and checks the Result Cache.<br>2. Optimizer uses metadata to prune unnecessary micro-partitions.<br>3. Virtual Warehouse compute nodes are assigned the query.<br>4. Compute nodes check their local SSD cache for the required micro-partitions.<br>5. If not found, they fetch from remote storage.<br>6. Data is processed and returned." },
            { question: "Why is Snowflake faster than traditional databases?", answer: "Because of its Separation of Compute and Storage (eliminating contention), automatic micro-partitioning (columnar compression), and aggressive metadata-based query pruning without maintaining heavy indexes." },
            { question: "How does compute separate from storage?", answer: "Data lives in scalable cloud object storage (S3/Azure Blob). Virtual Warehouses are independent EC2/VM clusters. You can have multiple warehouses reading the exact same central storage simultaneously without competing for CPU/RAM." },
            { question: "Why are indexes unnecessary in Snowflake?", answer: "Snowflake uses <strong>Metadata Pruning</strong>. It automatically stores the MIN and MAX values for every column inside every micro-partition. The query optimizer skips reading files that don't match the WHERE clause, functioning like a sparse index without the maintenance overhead." }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Warehouse Internals",
        title: "Warehouse Internals & Scaling",
        subtitle: "Scaling Up vs. Scaling Out, statement queueing, and Query Acceleration Service.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Scaling Up vs. Scaling Out</h3>
            <ul>
                <li><strong>Scaling UP (Vertical):</strong> Increasing the size of a single warehouse (e.g., from Small to Medium, which doubles CPU/RAM per node). Best for improving the speed of complex, resource-heavy queries.</li>
                <li><strong>Scaling OUT (Horizontal):</strong> Adding more clusters to a Multi-cluster warehouse (e.g., Min 1, Max 5). Best for handling high user concurrency, preventing queries from queueing when 100 users run reports at the same time.</li>
            </ul>
            <h3>Statement Queueing & Concurrency</h3>
            <p>If a warehouse cluster receives more queries than it can run concurrently, extra queries enter **Statement Queueing**. In a multi-cluster setup, Snowflake automatically spins up a new cluster to absorb the queued queries (concurrency scaling).</p>
            <h3>Query Acceleration Service (QAS)</h3>
            <p>QAS is an account-level feature that dynamically delegates parts of massive table scans to serverless compute resources outside your warehouse. It acts like a temporary burst of CPU to accelerate outliers without needing to scale up the warehouse permanently.</p>
        

            <h3>Warehouse Sizing & Lifecycle</h3>
            <ul>
                <li><strong>Warehouse Sizes:</strong> Range from X-Small (1 credit/hr, 1 server) up to 6X-Large (512 credits/hr, 512 servers). Scaling UP gives more memory for complex joins.</li>
                <li><strong>Auto-Suspend:</strong> Automatically shuts down the warehouse after N seconds of inactivity to save credits.</li>
                <li><strong>Auto-Resume:</strong> Automatically wakes the warehouse up when a new query arrives. (Note: there is a slight 1-3 second spin-up latency).</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Scaling Tactics",
            headers: ["Scaling Type", "How to trigger", "Primary benefit"],
            rows: [
                ["Scale UP", "Alter warehouse size (e.g., S to M)", "Reduces execution time of a single large query"],
                ["Scale OUT", "Multi-cluster configuration (Auto-scale)", "Eliminates statement queuing for concurrent users"],
                ["QAS", "Enable QUERY_ACCELERATION = TRUE", "Speeds up massive table scans dynamically"]
            ]
        },
        interviewQuestions: [
            { question: "What is the difference between Scaling Up and Scaling Out?", answer: "Scaling Up changes the warehouse size (adding CPU/RAM to a single cluster) to optimize slow queries. Scaling Out adds independent clusters to a warehouse dynamically to handle many users querying at the same time without queuing." },
            { question: "When does statement queuing happen?", answer: "Statement queuing occurs when a virtual warehouse has reached its maximum concurrency limit (all query execution slots are full) and new queries must wait in line for resource availability." },
            { question: "What is Query Acceleration Service (QAS)?", answer: "QAS is a serverless query acceleration feature that dynamically handles parts of a large query (like scan and filter operations) using external resources, accelerating query run times without requiring a larger virtual warehouse size." }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Performance",
        title: "Performance Optimization",
        subtitle: "Master the Query Profile, caching layers, and disk spilling.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Caches & Performance</h3>
            <p>Optimizing performance requires understanding where the bottleneck is. The **Query Profile** is the primary tool to view physical execution details:</p>
            <ul>
                <li><strong>Result Cache:</strong> Returns identical queries in milliseconds at 0 compute cost (retained 24h).</li>
                <li><strong>Spilling to Local Disk:</strong> Occurs when warehouse RAM is full and temporary data is written to the warehouse local SSD. Fix by scaling up.</li>
                <li><strong>Spilling to Remote Disk:</strong> Occurs when even the local SSD is full and the warehouse writes temporary data back to slow cloud storage (S3/ADLS). High performance penalty.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What does 'Spilling to remote storage' mean in the Query Profile?", answer: "It means the virtual warehouse did not have enough RAM or local SSD cache to process the query, forcing it to read/write temporary data to remote cloud storage. This is extremely slow and is resolved by scaling UP the warehouse." },
            { question: "How do you identify a query bottleneck using the Query Profile?", answer: "Look at the operator tree. Find nodes with the highest execution percentage. Check if the query is bottlenecked by 'Table Scan' (needs better pruning), 'Join' (check join keys), or 'Disk Spilling' (needs larger warehouse)." }
        ]
    },
    "1.4": {
        id: "1.4",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Clustering Internals",
        title: "Clustering & Partition Depth",
        subtitle: "Understanding natural order, clustering depth, and re-clustering costs.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Clustering Internals</h3>
            <p>Snowflake naturally clusters data as it is inserted (usually sorted by insertion time/date). On tables of several Terabytes, natural sorting may decay as updates occur, increasing **Clustering Depth** (the average number of overlapping micro-partitions for a query filter). A higher depth means query pruning is less effective.</p>
            <p><strong>Automatic Clustering:</strong> A serverless background service that re-aligns micro-partitions to match your explicit <code>CLUSTERING KEY</code> (e.g., date, region). Re-clustering consumes credits in the background.</p>
            <h3>When NOT to Cluster</h3>
            <p>Never cluster tables smaller than 1-2 TB. The background re-clustering compute credits will exceed the performance cost of scanning a slightly larger partition space. Also, avoid clustering columns with high cardinality (like timestamp or UUID) as it causes constant partition reorganization.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How do you evaluate if a table needs explicit clustering?", answer: "Run <code>SELECT SYSTEM$CLUSTERING_INFORMATION('table_name', '(col1)');</code>. It returns a JSON showing the average overlap depth. If the overlap is high and queries filtering on that column are slow, configuring a clustering key is recommended." },
            { question: "What is Clustering Depth?", answer: "Clustering Depth is a metric indicating the number of micro-partitions that overlap in values for a specific column. A lower depth means values are grouped in fewer partitions, enabling fast query pruning." },
            { question: "Why is it an anti-pattern to cluster small tables?", answer: "Small tables (under 1 TB) do not benefit enough from query pruning to justify the background compute credits consumed by Snowflake's Automatic Clustering service to keep them sorted." }
        ]
    },
    "1.5": {
        id: "1.5",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Query Optimizations",
        title: "Query Optimization Deep Dive",
        subtitle: "EXPLAIN, execution graphs, joins, and pushdowns.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Join Operations</h3>
            <ul>
                <li><strong>Hash Join:</strong> The default join where Snowflake builds a hash table of the smaller table in memory and scans the larger table against it.</li>
                <li><strong>Broadcast Join:</strong> Copies the smaller table to all active warehouse nodes to run joins locally, skipping network data shuffling. Best when joining a small dimension table to a massive fact table.</li>
            </ul>
            <h3>Pushdown Optimizations</h3>
            <p><strong>Predicate Pushdown:</strong> Filters are evaluated as early as possible in the execution graph, reducing the number of rows passed to joins or aggregations.</p>
            <p><strong>Projection Pushdown:</strong> Columns not referenced in the SELECT/JOIN statements are dropped immediately during file scanning, saving memory and IO.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What is the difference between a Broadcast Join and a Shuffle Join?", answer: "A Broadcast Join replicates a small table to all warehouse nodes to join locally without moving the large table. A Shuffle Join distributes partitions of both tables across nodes using a hash key, which is resource-intensive due to network transit." },
            { question: "What is Late Materialization?", answer: "Late Materialization is an optimization where Snowflake delays reading column data for columns not involved in filters or joins until the very end, fetching only matching row values, minimizing memory footprint." }
        ]
    },
    "2.1": {
        id: "2.1",
        stage: "Stage 2: Security, SQL & Modeling",
        module: "Security",
        title: "Snowflake Security & Governance",
        subtitle: "Master RBAC, Dynamic Data Masking, and Network Policies.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Role-Based Access Control (RBAC) Hierarchy</h3>
            <ul>
                <li><strong>SYSADMIN:</strong> Owns all tables, schemas, and databases. Custom roles should always roll up (grant) to SYSADMIN.</li>
                <li><strong>SECURITYADMIN:</strong> Manages users and roles.</li>
                <li><strong>ACCOUNTADMIN:</strong> The top-level superuser. Only used for billing and account-level configs.</li>
            </ul>
            <h3>Dynamic Data Masking</h3>
            <p>A column-level security feature. You create a <code>MASKING POLICY</code> that evaluates the <code>CURRENT_ROLE()</code>. If the role is 'HR', it shows the real value. Otherwise, it shows '***' or 0. This policy is attached directly to the table column.</p>
        

            <h3>Authentication Methods</h3>
            <ul>
                <li><strong>OAuth & External OAuth:</strong> Standard protocol for delegated authorization without sharing credentials. Supports integration with Okta, Azure AD, Ping, etc.</li>
                <li><strong>Key Pair Authentication:</strong> Uses a 2048-bit RSA key pair (public/private) for highly secure, password-less authentication (often used by service accounts and programmatic clients like Python).</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "Enterprise Scenario: Different departments should only access their own data in a shared table. How do you implement this?", answer: "Implement a <strong>Row Access Policy</strong>. The policy checks a mapping table or uses <code>CURRENT_ROLE()</code> to filter rows dynamically at execution time. For example, if <code>CURRENT_ROLE() = 'SALES_EAST'</code>, the query only returns rows where <code>region = 'EAST'</code>, without modifying the underlying query or creating separate views." },
            { question: "What is a Future Grant?", answer: "A Future Grant automatically applies privileges to objects created in the future. For example, if you grant SELECT on future tables in a schema to an analyst role, any table created tomorrow will instantly be readable by them, eliminating manual permission management." }
        ]
    },
    "2.2": {
        id: "2.2",
        stage: "Stage 2: Security, SQL & Modeling",
        module: "SQL",
        title: "Advanced Snowflake SQL",
        subtitle: "Beyond SELECT: QUALIFY, MERGE, and dynamic execution.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Essential Snowflake SQL Constructs</h3>
            <ul>
                <li><strong>MERGE (Upsert):</strong> Combines INSERT, UPDATE, and DELETE into a single statement. Crucial for loading CDC (Change Data Capture) data.</li>
                <li><strong>QUALIFY:</strong> A Snowflake-specific clause that filters the results of Window Functions without needing a subquery or CTE.</li>
                <li><strong>PIVOT / UNPIVOT:</strong> Converts rows to columns (PIVOT) or columns to rows (UNPIVOT).</li>
                <li><strong>Recursive CTEs:</strong> Used for hierarchical data (like a Manager/Employee org chart).</li>
            </ul>
        

            <h3>Additional Advanced SQL Constructs</h3>
            <ul>
                <li><strong>RESULT_SCAN():</strong> A table function that returns the result set of a previous command (like returning the output of a DESCRIBE or SHOW command as a queryable table).</li>
                <li><strong>TABLE Functions:</strong> Functions that return a set of rows instead of a single scalar value. Used extensively in Snowflake for flattening or querying metadata.</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What is the QUALIFY clause?", answer: "QUALIFY acts like a HAVING clause, but specifically for Window Functions. It filters the results of analytical functions (like ROW_NUMBER or RANK) without forcing you to write ugly nested subqueries or CTEs." },
            { question: "How do you handle dynamic SQL in Snowflake?", answer: "You can execute Dynamic SQL inside a Snowflake Scripting Stored Procedure using the <code>EXECUTE IMMEDIATE</code> command. This allows you to construct SQL strings at runtime and execute them." }
        ]
    },
    "2.3": {
        id: "2.3",
        stage: "Stage 2: Security, SQL & Modeling",
        module: "Zero-Copy Cloning",
        title: "Zero-Copy Cloning",
        subtitle: "Database, schema, and table clones, CTAS differences, and storage rules.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>What is Zero-Copy Cloning?</h3>
            <p>Cloning in Snowflake creates a new metadata structure pointing to the exact same physical micro-partitions of the source object. No data is duplicated, making the operation instantaneous and costing 0 extra storage credits initially.</p>
            <p><code>CREATE TABLE target_table CLONE source_table;</code></p>
            <h3>Clone vs. CTAS</h3>
            <ul>
                <li><strong>CLONE:</strong> Metadata replication only. High performance (instant). Keeps the original table constraints, parameters, and historical metadata.</li>
                <li><strong>CTAS (Create Table As Select):</strong> Computes the query, writes brand new micro-partitions, consuming compute and duplicating storage costs.</li>
            </ul>
            <h3>Storage Implications</h3>
            <p>You are only billed for modified data. If you clone a 1 TB table, the storage cost is 0. If you UPDATE 100MB of rows in the cloned table, Snowflake writes new micro-partitions for the modified data, and you are billed for 1 TB + 100MB.</p>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Clone vs. CTAS",
            headers: ["Feature", "Clone", "CTAS"],
            rows: [
                ["Speed", "Instant (metadata copy)", "Depends on table size (computes & writes)"],
                ["Storage Cost", "0 credits initially", "Duplicates full storage instantly"],
                ["Table Metadata", "Inherits grants, policies, and constraints", "Only copies column structure and rows"]
            ]
        },
        interviewQuestions: [
            { question: "How does Zero-Copy Cloning work under the hood?", answer: "It duplicates the metadata pointers to the physical micro-partitions in the cloud services layer. The source and target tables read the same files until modifications are made to either, causing write-on-write divergence." },
            { question: "If you drop the source table, does the cloned table lose its data?", answer: "No. Physical micro-partitions are not deleted until they are no longer referenced by any table. Dropping the source table only deletes its metadata pointers; the cloned table continues to point to and read the active partitions." },
            { question: "How is cloning used to support Sandbox/QA environments?", answer: "Production schemas can be cloned instantly to a QA database. Developers can run updates and load tests on the QA tables without affecting production data and without incurring massive storage duplication fees." }
        ]
    },
    "2.4": {
        id: "2.4",
        stage: "Stage 2: Security, SQL & Modeling",
        module: "Time Travel",
        title: "Time Travel Deep Dive",
        subtitle: "AT and BEFORE statements, restore objects, and UNDROP limits.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Time Travel Features</h3>
            <p>Time Travel allows you to query and restore data that was modified or deleted. You can query data from a specific point in time using:</p>
            <ul>
                <li><code>AT(TIMESTAMP => ...)</code>: Specific date and time.</li>
                <li><code>BEFORE(STATEMENT => 'query_id')</code>: Status right before a query executed (e.g., before an accidental update).</li>
            </ul>
            <h3>UNDROP Command</h3>
            <p>If you drop a database, schema, or table by accident, you can recover it instantly using:</p>
            <p><code>UNDROP TABLE my_table;</code></p>
            <h3>Retention Periods</h3>
            <ul>
                <li>Standard Edition: Limit of 1 day maximum.</li>
                <li>Enterprise Edition: Up to 90 days configurable per object.</li>
            </ul>
        

            <h3>Object Restoration & Retention Limits</h3>
            <ul>
                <li><strong>Restore Objects:</strong> You can completely <code>RESTORE DATABASE</code>, <code>RESTORE SCHEMA</code>, or <code>RESTORE TABLE</code> if they were dropped, instantly recovering all underlying data without using backups.</li>
                <li><strong>Data Retention Limits:</strong> Standard Edition is hard-limited to 1 day of Time Travel. Enterprise Edition allows configuring the retention period up to 90 days.</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How do you query a table as it existed 10 minutes ago?", answer: "Use the AT parameter: <code>SELECT * FROM my_table AT(OFFSET => -600);</code> (where offset is in seconds)." },
            { question: "What is the difference between AT and BEFORE in Time Travel?", answer: "AT includes changes made by the specified marker/query. BEFORE reads the database state immediately prior to the execution of the specified query, ignoring its changes." },
            { question: "If a database is dropped, how do you restore it?", answer: "Simply run <code>UNDROP DATABASE database_name;</code> within the Time Travel retention period." }
        ]
    },
    "2.5": {
        id: "2.5",
        stage: "Stage 2: Security, SQL & Modeling",
        module: "Fail-safe",
        title: "Fail-safe Architecture",
        subtitle: "Internal recovery, customer access limits, and storage lifecycle.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>What is Fail-safe?</h3>
            <p>Fail-safe is a mandatory 7-day data recovery window that starts immediately after the Time Travel retention period ends. It provides data protection against catastrophic losses.</p>
            <h3>Difference from Time Travel</h3>
            <ul>
                <li><strong>Time Travel:</strong> User-accessible. You can query, clone, and undrop objects yourself using SQL.</li>
                <li><strong>Fail-safe:</strong> System-accessible only. Customers cannot query or recover data directly. You must open an Azure/AWS Snowflake Support ticket to restore data from Fail-safe.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "Can a customer run a query on data inside Fail-safe?", answer: "No. Fail-safe is not queryable. It is exclusively for disaster recovery by Snowflake Support." },
            { question: "How long does data live in the Storage Lifecycle?", answer: "Active Data -> Time Travel (1-90 days) -> Fail-safe (7 days) -> Deleted. In total, a permanent table's modified rows can reside in storage for up to 97 days." }
        ]
    },
    "3.1": {
        id: "3.1",
        stage: "Stage 3: Enterprise Pipelines",
        module: "Semi-Structured",
        title: "Semi-Structured Data Processing",
        subtitle: "VARIANT, FLATTEN, and JSON parsing natively.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Data Types</h3>
            <p>VARIANT is Snowflake's native data type that stores JSON, Avro, ORC, and Parquet natively while maintaining internal columnar compression.</p>
            <h3>The FLATTEN Function</h3>
            <p>FLATTEN is a table function that explodes an array (like a list of products in a single JSON cart) into multiple rows so you can join them against standard tables. <code>LATERAL FLATTEN</code> allows you to reference columns from the main table alongside the exploded rows.</p>
        

            <h3>Advanced Object & Array Construction</h3>
            <ul>
                <li><strong>OBJECT_CONSTRUCT():</strong> Builds a Snowflake OBJECT from key-value pairs. Useful for converting relational columns into a single JSON blob.</li>
                <li><strong>ARRAY_CONSTRUCT():</strong> Builds a JSON array from a list of inputs.</li>
                <li><strong>ARRAY_APPEND():</strong> Appends a new element to the end of an existing array.</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How do you load JSON data into Snowflake?", answer: "Create a table with a single <code>VARIANT</code> column. Use <code>COPY INTO</code> (or Snowpipe) with the <code>FILE_FORMAT = (TYPE = 'JSON')</code> setting. Then, query the VARIANT column using dot notation <code>(col:key::type)</code>." },
            { question: "What is the difference between FLATTEN and LATERAL FLATTEN?", answer: "FLATTEN is a standalone table function that turns an array into rows. LATERAL FLATTEN acts like a JOIN, allowing you to correlate the exploded rows with the columns of the base table." }
        ]
    },
    "3.2": {
        id: "3.2",
        stage: "Stage 3: Enterprise Pipelines",
        module: "File Formats",
        title: "File Formats & Schema Rules",
        subtitle: "CSV, JSON, Parquet, Avro, ORC, compression, and delimiters.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>File Formats in Snowflake</h3>
            <p>A File Format is a database object that encapsulates formatting options (like delimiter characters, headers to skip, encoding, NULL overrides, and compression types) for loading or unloading data files.</p>
            <h3>Structured vs. Semi-Structured</h3>
            <ul>
                <li><strong>CSV / TSV:</strong> Requires schema definition. Parameters include <code>FIELD_DELIMITER</code>, <code>SKIP_HEADER</code>, and <code>NULL_IF</code>.</li>
                <li><strong>Parquet / Avro / ORC:</strong> Columnar/row binary formats that contain schemas internally.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What happens if you don't define a File Format when running a COPY command?", answer: "Snowflake will attempt to parse the file using default CSV settings (comma-separated, no headers skipped). If loading JSON or Parquet, the query will fail with formatting parsing errors." },
            { question: "How do you handle custom delimiters and enclosures in CSV loading?", answer: "Define a custom File Format setting: <code>FIELD_DELIMITER = '|'</code> and <code>FIELD_OPTIONALLY_ENCLOSED_BY = '\"'</code> to handle text values containing pipelines or commas." }
        ]
    },
    "3.3": {
        id: "3.3",
        stage: "Stage 3: Enterprise Pipelines",
        module: "External Stages",
        title: "External Stages & Storage Integrations",
        subtitle: "Configuring secure stages on AWS S3, ADLS Gen2, and GCS.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Stages Overview</h3>
            <p>An External Stage points to cloud storage (S3, Azure Blob, GCS) where source files reside.</p>
            <h3>Storage Integration Objects</h3>
            <p>Instead of hardcoding AWS IAM access keys or SAS tokens inside stage SQL (security risk), you create a **Storage Integration** object. This establishes a secure trust relationship between your Snowflake account tenant and the cloud provider using IAM roles and trust policies.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "Why should you use a Storage Integration instead of passing AWS credentials in the stage definition?", answer: "Storage Integrations delegate credential management to the cloud provider's IAM role model. It avoids exposing plaintext secret access keys in SQL scripts and allows credentials to be rotated easily." },
            { question: "How do you link a Snowflake Storage Integration to an AWS S3 bucket?", answer: "1. Create the integration using <code>CREATE STORAGE INTEGRATION</code> defining the bucket ARN. 2. Describe the integration to fetch the AWS IAM User ARN and External ID. 3. Update the S3 bucket's IAM trust policy to allow access to that User ARN/External ID." }
        ]
    },
    "3.4": {
        id: "3.4",
        stage: "Stage 3: Enterprise Pipelines",
        module: "Internal Stages",
        title: "Internal Stages & SnowSQL commands",
        subtitle: "User, Table, and Named Stages, executing PUT and GET.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Internal Stages</h3>
            <p>If you don't have external cloud storage, you can store files directly inside Snowflake's managed storage:</p>
            <ul>
                <li><strong>User Stage (<code>@~</code>):</strong> Created automatically for each user. Private and cannot be shared.</li>
                <li><strong>Table Stage (<code>@%table</code>):</strong> Created automatically for each table. Accessible by anyone with write access to the table.</li>
                <li><strong>Named Stage (<code>@stage_name</code>):</strong> Created manually. Shareable across multiple tables.</li>
            </ul>
            <h3>PUT and GET Commands</h3>
            <ul>
                <li><code>PUT</code>: Uploads a local file from your system to an internal stage. (Only runs in SnowSQL CLI).</li>
                <li><code>GET</code>: Downloads files from an internal stage back to your local drive.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "Can you run a PUT command inside the Snowflake Web Worksheet UI?", answer: "No. PUT and GET are system file operations and must be executed using the SnowSQL CLI client or the Snowflake Python/Node SDK." },
            { question: "What is the difference between a User Stage and a Table Stage?", answer: "A User Stage is private to a specific user. A Table Stage is bound to a table structure, meaning any user who has insert/query access to that table can use it to upload source CSVs." }
        ]
    },
    "3.5": {
        id: "3.5",
        stage: "Stage 3: Enterprise Pipelines",
        module: "Ingestion Core",
        title: "COPY INTO & Snowpipe",
        subtitle: "Bulk load commands vs. continuous serverless ingestion.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Bulk vs. Continuous Loading</h3>
            <ul>
                <li><strong>COPY INTO:</strong> Bulk loading command. Requires a Virtual Warehouse to run. Best for structured, large batch loads.</li>
                <li><strong>Snowpipe:</strong> Serverless continuous ingestion. Detects files landing in a stage via cloud notifications and loads them instantly.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "Does Snowpipe consume credits when no new files are uploaded?", answer: "No. Snowpipe is serverless. You are only charged for the actual processing compute seconds used when a file lands in the stage." },
            { question: "How does Snowpipe track which files have already been processed?", answer: "It maintains load history metadata for 14 days. If a file with the same filename is uploaded, it is ignored unless the pipe is forced to reload." }
        ]
    },
    "4.1": {
        id: "4.1",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Account Usage Schema",
        title: "Account Metadata Auditing",
        subtitle: "ACCOUNT_USAGE vs. INFORMATION_SCHEMA, query history, and login logs.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Metadata Access</h3>
            <ul>
                <li><strong>INFORMATION_SCHEMA:</strong> Real-time metadata view. Holds records up to 7-14 days. Fast queries but lacks deep historical logs.</li>
                <li><strong>ACCOUNT_USAGE:</strong> Shared database (SNOWFLAKE). Replicated view. Retains data up to 1 year (Query History, Login history, billing logs). Has latency (up to 45 mins to 2 hours lag).</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Metadata Sources",
            headers: ["Metric", "INFORMATION_SCHEMA", "ACCOUNT_USAGE"],
            rows: [
                ["Retention", "Up to 14 days", "Up to 365 days"],
                ["Latency", "Real-time (0 lag)", "Delayed (45 mins - 2 hours)"],
                ["Deleted Objects", "Shows only active objects", "Shows deleted object history record entries"]
            ]
        },
        interviewQuestions: [
            { question: "How do you audit which user consumed the most warehouse credits last month?", answer: "Query the `SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY` view, aggregating credit consumption by warehouse and user over the previous month's date bounds." },
            { question: "What is the difference between INFORMATION_SCHEMA and ACCOUNT_USAGE?", answer: "INFORMATION_SCHEMA has 0 latency (real-time) but limited retention (14 days). ACCOUNT_USAGE has 1-year retention but latency/lag in data replication updates." }
        ]
    },
    "4.2": {
        id: "4.2",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "CLI & Connectors",
        title: "CLI Clients & Native Connectors",
        subtitle: "SnowSQL CLI, Spark, Python, JDBC, and ODBC driver integrations.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Client Connections</h3>
            <ul>
                <li><strong>SnowSQL:</strong> Command-line client for executing SQL queries, managing stages (PUT/GET), and running automation shell scripts.</li>
                <li><strong>Connectors:</strong> Official library packages (Python, JDBC, ODBC, Spark, SQLAlchemy) that enable third-party tools to connect and query Snowflake.</li>
            </ul>
        

            <h3>Advanced Integrations</h3>
            <ul>
                <li><strong>Kafka Connector:</strong> The Snowflake Connector for Kafka natively streams data directly from Kafka topics into Snowflake tables (often using Snowpipe Streaming under the hood).</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What is the Python Connector and how does it prevent SQL injection?", answer: "It is the official Python library. To prevent injection, use parameterized queries instead of string concatenation when passing user inputs to the cursor execution object." },
            { question: "How does the Spark Connector optimize data extraction?", answer: "It uses **Query Pushdown**. Instead of extracting a full table to Spark memory, filtering and aggregate logic is compiled to SQL and pushed down to execute inside Snowflake first, returning only the final delta records." }
        ]
    },
    "4.3": {
        id: "4.3",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Sharing & Replication",
        title: "Replication, Shares & Native Apps",
        subtitle: "Multi-cloud replication, Native Apps, sharing, and marketplace.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Database Replication & Failover</h3>
            <p>For disaster recovery, you can replicate databases to different cloud regions and providers. A **Failover Group** automates the secondary database promotion to primary status if the source cloud suffers an outage.</p>
            <h3>Native Apps</h3>
            <p>The Snowflake Native App Framework allows companies to package application code (Python/Streamlit) and SQL schemas, publishing them on the Snowflake Marketplace. Consumers install the app directly inside their accounts, running it securely on their own compute nodes without exporting raw data.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How does Snowflake support cross-cloud disaster recovery?", answer: "Through Database Replication and Failover Groups. You replicate metadata and physical data to a different cloud region/provider (e.g. AWS to Azure). If AWS fails, you promote the Azure database replica to primary status." },
            { question: "What is the Snowflake Native App Framework?", answer: "It is a distribution model allowing developers to build applications that run directly inside the customer's Snowflake account boundary, securing proprietary source code while protecting consumer data." }
        ]
    },
    "4.4": {
        id: "4.4",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Streams & Tasks",
        title: "Streams & Tasks (CDC + Orchestration)",
        subtitle: "Capture incremental changes and automate pipeline execution natively inside Snowflake.",
        duration: "🕒 18 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Snowflake Streams</h3>
            <p>A <strong>Stream</strong> is a change data capture (CDC) object that records DML changes (INSERT, UPDATE, DELETE) made to a source table. It acts like a watermark — consuming the stream advances the offset, and only new changes appear on the next read.</p>
            <pre><code>-- Create a stream on a source table
CREATE OR REPLACE STREAM orders_stream ON TABLE raw_orders;

-- Query the stream (shows only new changes since last consumption)
SELECT * FROM orders_stream;</code></pre>
            <p>Key stream metadata columns: <code>METADATA$ACTION</code> (INSERT/DELETE), <code>METADATA$ISUPDATE</code> (true for UPDATE rows), <code>METADATA$ROW_ID</code> (stable hash of the row).</p>
            <h3>Stream Types</h3>
            <ul>
                <li><strong>Standard Stream:</strong> Tracks all DML changes — inserts, updates (as delete+insert pairs), and deletes.</li>
                <li><strong>Append-Only Stream:</strong> Captures only INSERT operations — best for logging or event tables where rows are never updated.</li>
                <li><strong>Insert-Only Stream:</strong> For external tables — tracks newly added files from an external stage.</li>
            </ul>
            <h3>Snowflake Tasks</h3>
            <p>A <strong>Task</strong> is a scheduled SQL or Stored Procedure execution unit — the native scheduler for Snowflake pipelines. Tasks use cron or minute-based schedules.</p>
            <pre><code>-- Create a task that runs every 5 minutes
CREATE OR REPLACE TASK load_orders_task
  WAREHOUSE = COMPUTE_WH
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')
AS
  INSERT INTO processed_orders
  SELECT order_id, customer_id, CURRENT_TIMESTAMP()
  FROM orders_stream
  WHERE METADATA$ACTION = 'INSERT';

-- Resume the task (tasks start SUSPENDED by default)
ALTER TASK load_orders_task RESUME;</code></pre>
            <h3>Task DAGs (Directed Acyclic Graphs)</h3>
            <p>Tasks can be chained into dependency trees — a root task triggers child tasks on completion. This replaces external orchestrators for simple Snowflake-native pipelines.</p>
            <pre><code>-- Child task depends on root task
CREATE TASK child_task
  AFTER load_orders_task
AS
  CALL aggregate_daily_sales();</code></pre>
            <h3>Serverless Tasks</h3>
            <p>Instead of a warehouse, Tasks can use <strong>Serverless compute</strong> — Snowflake manages and auto-scales compute automatically. You pay per-second of actual compute used, avoiding idle warehouse billing between task runs. This is the recommended default for most task workloads.</p>
            <pre><code>-- Serverless Task (no WAREHOUSE clause — Snowflake manages compute)
CREATE OR REPLACE TASK serverless_load_task
  USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE = 'SMALL'
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')
AS
  INSERT INTO processed_orders
  SELECT order_id, customer_id, CURRENT_TIMESTAMP()
  FROM orders_stream
  WHERE METADATA$ACTION = 'INSERT';</code></pre>
            <h3>Stream Staleness</h3>
            <p>A stream becomes <strong>stale</strong> if it is not consumed within the source table's <strong>data retention period</strong> (default 1 day, up to 90 days on Enterprise). Once stale, the stream must be recreated — all unread change data is lost. Monitor stream health using <code>SHOW STREAMS</code> and the <code>STALE</code> column.</p>
            <pre><code>-- Check if a stream is stale
SHOW STREAMS LIKE 'orders_stream';
-- Look at STALE column: TRUE = stream has become stale

-- View task execution history and errors
SELECT *
FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(
  TASK_NAME => 'LOAD_ORDERS_TASK',
  SCHEDULED_TIME_RANGE_START => DATEADD(HOUR, -24, CURRENT_TIMESTAMP())
))
ORDER BY SCHEDULED_TIME DESC;</code></pre>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What is the difference between a Standard Stream and an Append-Only Stream?", answer: "A Standard Stream captures all DML changes — inserts, updates (represented as a DELETE+INSERT pair), and deletes. An Append-Only Stream captures only new INSERT rows, which is more efficient for append-only event or log tables where rows are never modified after ingestion." },
            { question: "Why must a Task be RESUMED before it executes?", answer: "Tasks are created in SUSPENDED state by default to prevent accidental execution on misconfigured pipelines. You must explicitly run ALTER TASK <name> RESUME after verifying the SQL and schedule are correct." },
            { question: "How does WHEN SYSTEM$STREAM_HAS_DATA work in a Task?", answer: "It is a conditional filter that prevents the Task from executing when the stream has no new records. Without it, the Task runs on every schedule tick even if there is nothing to process, wasting warehouse credits." },
            { question: "What is the advantage of Serverless Tasks over Warehouse-based Tasks?", answer: "Serverless Tasks use Snowflake-managed auto-scaling compute billed per second of actual execution. Warehouse Tasks keep a virtual warehouse running between task executions, incurring idle credits. For tasks that run infrequently or have variable compute needs, Serverless Tasks are significantly cheaper and simpler to manage." },
            { question: "What causes a Snowflake Stream to become stale, and how do you prevent it?", answer: "A stream becomes stale when it is not consumed within the source table's data retention period (default 1 day). Unconsumed changes older than the retention window are purged, making the stream unreadable. Prevent staleness by ensuring Tasks consuming the stream run at least once per day, or by extending the source table's DATA_RETENTION_TIME_IN_DAYS to match your processing frequency." }
        ]
    },
    "4.5": {
        id: "4.5",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Materialized Views",
        title: "Materialized Views",
        subtitle: "Pre-compute and cache complex query results for instant response times.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>What is a Materialized View?</h3>
            <p>A <strong>Materialized View (MV)</strong> is a pre-computed result set stored as a physical micro-partitioned table. Unlike a regular view (which re-executes the query on every read), an MV stores the output and is <strong>automatically refreshed</strong> by Snowflake in the background when the base table changes.</p>
            <pre><code>CREATE OR REPLACE MATERIALIZED VIEW mv_daily_sales AS
SELECT
    sale_date,
    product_id,
    SUM(amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM raw_sales
GROUP BY sale_date, product_id;</code></pre>
            <h3>Key Characteristics</h3>
            <ul>
                <li><strong>Automatic refresh:</strong> Snowflake uses a background serverless service to incrementally update the MV when base table DML occurs — no manual scheduling needed.</li>
                <li><strong>Query rewrite:</strong> Snowflake's optimizer can automatically route queries against the base table to the MV if the MV can satisfy the query — transparent to the query author.</li>
                <li><strong>Clustering support:</strong> MVs can be clustered on columns, further accelerating pruning on repeated BI queries.</li>
            </ul>
            <h3>Limitations</h3>
            <ul>
                <li>Cannot contain JOINs, non-deterministic functions (e.g. CURRENT_TIMESTAMP), subqueries, or window funct                 <li>Refresh credit is billed to the account — MVs on high-churn base tables can become expensive.</li>
            </ul>
            <h3>Dynamic Tables (Modern Alternative)</h3>
            <p><strong>Dynamic Tables</strong> are a newer Snowflake feature that address MV limitations. Unlike MVs, Dynamic Tables support JOINs, window functions, and complex transformations. They use a <strong>target lag</strong> to define how fresh the data must be (e.g., 1 minute, 1 hour), and Snowflake automatically triggers incremental refreshes to meet the lag target.</p>
            <pre><code>-- Dynamic Table with JOIN support (not possible in MV)
CREATE OR REPLACE DYNAMIC TABLE dt_enriched_orders
  TARGET_LAG = '1 hour'
  WAREHOUSE = COMPUTE_WH
AS
SELECT
    o.order_id,
    o.amount,
    c.customer_name,
    c.region
FROM raw_orders o
JOIN dim_customers c ON o.customer_id = c.customer_id;</code></pre>
            <p>Use <strong>MVs</strong> for simple aggregations on single tables with sub-second read latency requirements. Use <strong>Dynamic Tables</strong> for complex transformations with JOINs where you can tolerate a small lag (minutes).</p>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            headers: ["Feature", "Regular View", "Materialized View", "Dynamic Table"],
            rows: [
                ["Storage Cost", "None", "Yes", "Yes"],
                ["Query Speed", "Slow (re-executes)", "Fast (pre-computed)", "Fast (pre-computed)"],
                ["Supports JOINs", "Yes", "No", "Yes"],
                ["Auto Refresh", "No", "Yes (on DML)", "Yes (target lag)"],
                ["Window Functions", "Yes", "No", "Yes"],
                ["Edition Required", "All", "Enterprise+", "Enterprise+"]
            ]
        },
        interviewQuestions: [
            { question: "When would you choose a Materialized View over a regular View?", answer: "Use a Materialized View when a complex aggregation or filter is queried frequently by BI tools and the base table changes infrequently. The MV pre-computes the result so BI queries get near-instant response times. Avoid MVs on high-churn tables where refresh costs exceed query savings." },
            { question: "What is query rewrite in the context of Materialized Views?", answer: "Query rewrite is when Snowflake's optimizer automatically redirects a query against the base table to the Materialized View if the MV can satisfy the query. The query author does not need to reference the MV explicitly — they query the base table and Snowflake handles the routing transparently." },
            { question: "When would you use a Dynamic Table instead of a Materialized View?", answer: "Use a Dynamic Table when your transformation requires JOINs, window functions, or complex multi-table logic that a Materialized View cannot support. Dynamic Tables accept any SQL including JOINs and window functions, and refresh incrementally based on a target lag setting. Use Materialized Views only for simple single-table aggregations where sub-second read latency is critical." }
        ]
    },
    "4.6": {
        id: "4.6",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Resource Monitors",
        title: "Resource Monitors",
        subtitle: "Set credit limits and automated alerts to control warehouse spend.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>What is a Resource Monitor?</h3>
            <p>A <strong>Resource Monitor</strong> is a Snowflake object that tracks credit consumption for one or more virtual warehouses. When consumption reaches defined thresholds, the monitor triggers <strong>notifications</strong> and optionally <strong>suspends or kills</strong> the warehouse.</p>
            <pre><code>-- Create a resource monitor with a 1000 credit monthly limit
CREATE OR REPLACE RESOURCE MONITOR monthly_budget
    WITH CREDIT_QUOTA = 1000
    FREQUENCY = MONTHLY
    START_TIMESTAMP = IMMEDIATELY
    TRIGGERS
        ON 75 PERCENT DO NOTIFY
        ON 90 PERCENT DO NOTIFY
        ON 100 PERCENT DO SUSPEND
        ON 110 PERCENT DO SUSPEND_IMMEDIATE;

-- Assign it to a warehouse
ALTER WAREHOUSE COMPUTE_WH SET RESOURCE_MONITOR = monthly_budget;</code></pre>
            <h3>Trigger Actions</h3>
            <ul>
                <li><strong>NOTIFY:</strong> Sends an email alert to account administrators.</li>
                <li><strong>SUSPEND:</strong> Stops the warehouse from starting new queries after the current ones complete.</li>
                <li><strong>SUSPEND_IMMEDIATE:</strong> Kills all running queries and suspends the warehouse instantly.</li>
            </ul>
            <h3>Scope Options</h3>
            <ul>
                <li><strong>Account-level monitor:</strong> Tracks all credit usage across the entire account.</li>
                <li><strong>Warehouse-level monitor:</strong> Scoped to specific warehouses — used for team-level cost accountability.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What is the difference between SUSPEND and SUSPEND_IMMEDIATE in a Resource Monitor?", answer: "SUSPEND waits for all currently running queries to finish before stopping the warehouse — in-flight work is not lost. SUSPEND_IMMEDIATE kills all running queries immediately and halts the warehouse — useful when runaway queries are burning credits beyond budget." },
            { question: "Can a Resource Monitor prevent all credit overruns?", answer: "Not completely. There is a small lag between credit consumption and monitoring detection. It is also possible for a warehouse to slightly exceed the quota between measurement intervals. Resource Monitors reduce overruns significantly but should be combined with warehouse auto-suspend policies for complete control." }
        ]
    },
    "4.7": {
        id: "4.7",
        stage: "Stage 4: Ecosystem & Advanced",
        module: "Tags for Cost Allocation",
        title: "Snowflake Tags & Cost Allocation",
        subtitle: "Label objects with metadata tags and trace credits back to business units.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Snowflake Object Tags</h3>
            <p><strong>Tags</strong> are schema-level objects that assign key-value metadata to Snowflake objects (tables, columns, warehouses, users). They enable governance, data classification, and financial chargeback models.</p>
            <pre><code>-- Create a tag
CREATE OR REPLACE TAG cost_center;
CREATE OR REPLACE TAG data_classification ALLOWED_VALUES 'PII', 'SENSITIVE', 'PUBLIC';

-- Apply tag to a warehouse (cost allocation)
ALTER WAREHOUSE analytics_wh SET TAG cost_center = 'Marketing';

-- Apply tag to a table column (data governance)
ALTER TABLE customers MODIFY COLUMN email SET TAG data_classification = 'PII';</code></pre>
            <h3>Cost Allocation via Tags</h3>
            <p>By tagging warehouses with business unit identifiers, you can query <code>SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY</code> joined with tag references to produce departmental cost reports.</p>
            <pre><code>-- Query warehouse credits by cost center tag
SELECT
    TAG_VALUE AS cost_center,
    SUM(credits_used) AS total_credits
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY wm
JOIN SNOWFLAKE.ACCOUNT_USAGE.TAG_REFERENCES tr
    ON tr.OBJECT_NAME = wm.WAREHOUSE_NAME
    AND tr.TAG_NAME = 'COST_CENTER'
GROUP BY cost_center
ORDER BY total_credits DESC;</code></pre>
            <h3>Tag Lineage & Propagation</h3>
            <p>Tags applied to a table column automatically propagate to downstream views and masking policies that reference that column, enabling consistent governance without re-tagging derived objects.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "How do Snowflake Tags support financial chargeback models?", answer: "By tagging warehouses with business unit identifiers (like cost_center = 'Marketing'), you can join WAREHOUSE_METERING_HISTORY with TAG_REFERENCES in ACCOUNT_USAGE to calculate exactly how many credits each department consumed. This enables accurate monthly chargeback billing to each business unit." },
            { question: "What is tag propagation and why is it useful for governance?", answer: "Tag propagation means that a tag applied to a source table column is automatically inherited by downstream views, masking policies, and cloned objects that reference that column. This ensures PII or sensitivity classifications flow through the entire data pipeline without requiring manual re-tagging of every derived object." }
        ]
    }
};

