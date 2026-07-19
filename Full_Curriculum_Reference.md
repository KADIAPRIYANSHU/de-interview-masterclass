# Full Data Engineering Curriculum Reference

This document contains all details, theory, and interview questions for all 108 modules across the 8 domains.

---

# Domain: Snowflake Prep

## Stage 1: Core Architecture & Cost

### [1.1] Snowflake Architecture
*Master the 3-layer architecture, micro-partitions, and caching mechanisms.*

**Duration:** 🕒 15 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>The 3-Layer Architecture</h3>
            <ul>
                <li><strong>Cloud Services Layer:</strong> The brain. Handles authentication, infrastructure management, metadata, query parsing, optimization, transaction management (ACID), and access control.</li>
                <li><strong>Compute Layer (Virtual Warehouses):</strong> Massive parallel processing (MPP) compute clusters. They execute the queries. They don't store data permanently, but they cache data locally on SSDs while running.</li>
                <li><strong>Storage Layer:</strong> The central repository for persisted data (S3, Azure Blob, GCS). Data is stored in Snowflake's proprietary <strong>columnar</strong> format and split into <strong>micro-partitions</strong> (50MB-500MB).</li>
            </ul>
            <h3>Why are Indexes Unnecessary?</h3>
            <p>Snowflake doesn't use traditional B-Tree indexes. Instead, the Cloud Services layer stores <strong>Metadata</strong> for every micro-partition (like MIN, MAX, and NULL counts). When you query <code>WHERE date = '2026-07-17'</code>, Snowflake prunes (ignores) 99% of the micro-partitions because it knows from the metadata that those files don't contain this date. This is called <strong>Query Pruning</strong>.</p>

#### Interview Questions
**Q: What happens internally when SELECT is executed?**

> A: 1. Cloud Services authenticates and checks the Result Cache.<br>2. Optimizer uses metadata to prune unnecessary micro-partitions.<br>3. Virtual Warehouse compute nodes are assigned the query.<br>4. Compute nodes check their local SSD cache for the required micro-partitions.<br>5. If not found, they fetch from remote storage.<br>6. Data is processed and returned.

**Q: Why is Snowflake faster than traditional databases?**

> A: Because of its Separation of Compute and Storage (eliminating contention), automatic micro-partitioning (columnar compression), and aggressive metadata-based query pruning without maintaining heavy indexes.

**Q: How does compute separate from storage?**

> A: Data lives in scalable cloud object storage (S3/Azure Blob). Virtual Warehouses are independent EC2/VM clusters. You can have multiple warehouses reading the exact same central storage simultaneously without competing for CPU/RAM.

**Q: Why are indexes unnecessary in Snowflake?**

> A: Snowflake uses <strong>Metadata Pruning</strong>. It automatically stores the MIN and MAX values for every column inside every micro-partition. The query optimizer skips reading files that don't match the WHERE clause, functioning like a sparse index without the maintenance overhead.


<br/>

### [1.2] Warehouse Internals & Scaling
*Scaling Up vs. Scaling Out, statement queueing, and Query Acceleration Service.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Scaling Up vs. Scaling Out</h3>
            <ul>
                <li><strong>Scaling UP (Vertical):</strong> Increasing the size of a single warehouse (e.g., from Small to Medium, which doubles CPU/RAM per node). Best for improving the speed of complex, resource-heavy queries.</li>
                <li><strong>Scaling OUT (Horizontal):</strong> Adding more clusters to a Multi-cluster warehouse (e.g., Min 1, Max 5). Best for handling high user concurrency, preventing queries from queueing when 100 users run reports at the same time.</li>
            </ul>
            <h3>Statement Queueing & Concurrency</h3>
            <p>If a warehouse cluster receives more queries than it can run concurrently, extra queries enter **Statement Queueing**. In a multi-cluster setup, Snowflake automatically spins up a new cluster to absorb the queued queries (concurrency scaling).</p>
            <h3>Query Acceleration Service (QAS)</h3>
            <p>QAS is an account-level feature that dynamically delegates parts of massive table scans to serverless compute resources outside your warehouse. It acts like a temporary burst of CPU to accelerate outliers without needing to scale up the warehouse permanently.</p>

#### Interview Questions
**Q: What is the difference between Scaling Up and Scaling Out?**

> A: Scaling Up changes the warehouse size (adding CPU/RAM to a single cluster) to optimize slow queries. Scaling Out adds independent clusters to a warehouse dynamically to handle many users querying at the same time without queuing.

**Q: When does statement queuing happen?**

> A: Statement queuing occurs when a virtual warehouse has reached its maximum concurrency limit (all query execution slots are full) and new queries must wait in line for resource availability.

**Q: What is Query Acceleration Service (QAS)?**

> A: QAS is a serverless query acceleration feature that dynamically handles parts of a large query (like scan and filter operations) using external resources, accelerating query run times without requiring a larger virtual warehouse size.


<br/>

### [1.3] Performance Optimization
*Master the Query Profile, caching layers, and disk spilling.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>The Caches & Performance</h3>
            <p>Optimizing performance requires understanding where the bottleneck is. The **Query Profile** is the primary tool to view physical execution details:</p>
            <ul>
                <li><strong>Result Cache:</strong> Returns identical queries in milliseconds at 0 compute cost (retained 24h).</li>
                <li><strong>Spilling to Local Disk:</strong> Occurs when warehouse RAM is full and temporary data is written to the warehouse local SSD. Fix by scaling up.</li>
                <li><strong>Spilling to Remote Disk:</strong> Occurs when even the local SSD is full and the warehouse writes temporary data back to slow cloud storage (S3/ADLS). High performance penalty.</li>
            </ul>

#### Interview Questions
**Q: What does 'Spilling to remote storage' mean in the Query Profile?**

> A: It means the virtual warehouse did not have enough RAM or local SSD cache to process the query, forcing it to read/write temporary data to remote cloud storage. This is extremely slow and is resolved by scaling UP the warehouse.

**Q: How do you identify a query bottleneck using the Query Profile?**

> A: Look at the operator tree. Find nodes with the highest execution percentage. Check if the query is bottlenecked by 'Table Scan' (needs better pruning), 'Join' (check join keys), or 'Disk Spilling' (needs larger warehouse).


<br/>

### [1.4] Clustering & Partition Depth
*Understanding natural order, clustering depth, and re-clustering costs.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Clustering Internals</h3>
            <p>Snowflake naturally clusters data as it is inserted (usually sorted by insertion time/date). On tables of several Terabytes, natural sorting may decay as updates occur, increasing **Clustering Depth** (the average number of overlapping micro-partitions for a query filter). A higher depth means query pruning is less effective.</p>
            <p><strong>Automatic Clustering:</strong> A serverless background service that re-aligns micro-partitions to match your explicit <code>CLUSTERING KEY</code> (e.g., date, region). Re-clustering consumes credits in the background.</p>
            <h3>When NOT to Cluster</h3>
            <p>Never cluster tables smaller than 1-2 TB. The background re-clustering compute credits will exceed the performance cost of scanning a slightly larger partition space. Also, avoid clustering columns with high cardinality (like timestamp or UUID) as it causes constant partition reorganization.</p>

#### Interview Questions
**Q: How do you evaluate if a table needs explicit clustering?**

> A: Run <code>SELECT SYSTEM$CLUSTERING_INFORMATION('table_name', '(col1)');</code>. It returns a JSON showing the average overlap depth. If the overlap is high and queries filtering on that column are slow, configuring a clustering key is recommended.

**Q: What is Clustering Depth?**

> A: Clustering Depth is a metric indicating the number of micro-partitions that overlap in values for a specific column. A lower depth means values are grouped in fewer partitions, enabling fast query pruning.

**Q: Why is it an anti-pattern to cluster small tables?**

> A: Small tables (under 1 TB) do not benefit enough from query pruning to justify the background compute credits consumed by Snowflake's Automatic Clustering service to keep them sorted.


<br/>

### [1.5] Query Optimization Deep Dive
*EXPLAIN, execution graphs, joins, and pushdowns.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>Join Operations</h3>
            <ul>
                <li><strong>Hash Join:</strong> The default join where Snowflake builds a hash table of the smaller table in memory and scans the larger table against it.</li>
                <li><strong>Broadcast Join:</strong> Copies the smaller table to all active warehouse nodes to run joins locally, skipping network data shuffling. Best when joining a small dimension table to a massive fact table.</li>
            </ul>
            <h3>Pushdown Optimizations</h3>
            <p><strong>Predicate Pushdown:</strong> Filters are evaluated as early as possible in the execution graph, reducing the number of rows passed to joins or aggregations.</p>
            <p><strong>Projection Pushdown:</strong> Columns not referenced in the SELECT/JOIN statements are dropped immediately during file scanning, saving memory and IO.</p>

#### Interview Questions
**Q: What is the difference between a Broadcast Join and a Shuffle Join?**

> A: A Broadcast Join replicates a small table to all warehouse nodes to join locally without moving the large table. A Shuffle Join distributes partitions of both tables across nodes using a hash key, which is resource-intensive due to network transit.

**Q: What is Late Materialization?**

> A: Late Materialization is an optimization where Snowflake delays reading column data for columns not involved in filters or joins until the very end, fetching only matching row values, minimizing memory footprint.


<br/>

## Stage 2: Security, SQL & Modeling

### [2.1] Snowflake Security & Governance
*Master RBAC, Dynamic Data Masking, and Network Policies.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Role-Based Access Control (RBAC) Hierarchy</h3>
            <ul>
                <li><strong>SYSADMIN:</strong> Owns all tables, schemas, and databases. Custom roles should always roll up (grant) to SYSADMIN.</li>
                <li><strong>SECURITYADMIN:</strong> Manages users and roles.</li>
                <li><strong>ACCOUNTADMIN:</strong> The top-level superuser. Only used for billing and account-level configs.</li>
            </ul>
            <h3>Dynamic Data Masking</h3>
            <p>A column-level security feature. You create a <code>MASKING POLICY</code> that evaluates the <code>CURRENT_ROLE()</code>. If the role is 'HR', it shows the real value. Otherwise, it shows '***' or 0. This policy is attached directly to the table column.</p>

#### Interview Questions
**Q: Enterprise Scenario: Different departments should only access their own data in a shared table. How do you implement this?**

> A: Implement a <strong>Row Access Policy</strong>. The policy checks a mapping table or uses <code>CURRENT_ROLE()</code> to filter rows dynamically at execution time. For example, if <code>CURRENT_ROLE() = 'SALES_EAST'</code>, the query only returns rows where <code>region = 'EAST'</code>, without modifying the underlying query or creating separate views.

**Q: What is a Future Grant?**

> A: A Future Grant automatically applies privileges to objects created in the future. For example, if you grant SELECT on future tables in a schema to an analyst role, any table created tomorrow will instantly be readable by them, eliminating manual permission management.


<br/>

### [2.2] Advanced Snowflake SQL
*Beyond SELECT: QUALIFY, MERGE, and dynamic execution.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Essential Snowflake SQL Constructs</h3>
            <ul>
                <li><strong>MERGE (Upsert):</strong> Combines INSERT, UPDATE, and DELETE into a single statement. Crucial for loading CDC (Change Data Capture) data.</li>
                <li><strong>QUALIFY:</strong> A Snowflake-specific clause that filters the results of Window Functions without needing a subquery or CTE.</li>
                <li><strong>PIVOT / UNPIVOT:</strong> Converts rows to columns (PIVOT) or columns to rows (UNPIVOT).</li>
                <li><strong>Recursive CTEs:</strong> Used for hierarchical data (like a Manager/Employee org chart).</li>
            </ul>

#### Interview Questions
**Q: What is the QUALIFY clause?**

> A: QUALIFY acts like a HAVING clause, but specifically for Window Functions. It filters the results of analytical functions (like ROW_NUMBER or RANK) without forcing you to write ugly nested subqueries or CTEs.

**Q: How do you handle dynamic SQL in Snowflake?**

> A: You can execute Dynamic SQL inside a Snowflake Scripting Stored Procedure using the <code>EXECUTE IMMEDIATE</code> command. This allows you to construct SQL strings at runtime and execute them.


<br/>

### [2.3] Zero-Copy Cloning
*Database, schema, and table clones, CTAS differences, and storage rules.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
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

#### Interview Questions
**Q: How does Zero-Copy Cloning work under the hood?**

> A: It duplicates the metadata pointers to the physical micro-partitions in the cloud services layer. The source and target tables read the same files until modifications are made to either, causing write-on-write divergence.

**Q: If you drop the source table, does the cloned table lose its data?**

> A: No. Physical micro-partitions are not deleted until they are no longer referenced by any table. Dropping the source table only deletes its metadata pointers; the cloned table continues to point to and read the active partitions.

**Q: How is cloning used to support Sandbox/QA environments?**

> A: Production schemas can be cloned instantly to a QA database. Developers can run updates and load tests on the QA tables without affecting production data and without incurring massive storage duplication fees.


<br/>

### [2.4] Time Travel Deep Dive
*AT and BEFORE statements, restore objects, and UNDROP limits.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
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

#### Interview Questions
**Q: How do you query a table as it existed 10 minutes ago?**

> A: Use the AT parameter: <code>SELECT * FROM my_table AT(OFFSET => -600);</code> (where offset is in seconds).

**Q: What is the difference between AT and BEFORE in Time Travel?**

> A: AT includes changes made by the specified marker/query. BEFORE reads the database state immediately prior to the execution of the specified query, ignoring its changes.

**Q: If a database is dropped, how do you restore it?**

> A: Simply run <code>UNDROP DATABASE database_name;</code> within the Time Travel retention period.


<br/>

### [2.5] Fail-safe Architecture
*Internal recovery, customer access limits, and storage lifecycle.*

**Duration:** 🕒 10 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is Fail-safe?</h3>
            <p>Fail-safe is a mandatory 7-day data recovery window that starts immediately after the Time Travel retention period ends. It provides data protection against catastrophic losses.</p>
            <h3>Difference from Time Travel</h3>
            <ul>
                <li><strong>Time Travel:</strong> User-accessible. You can query, clone, and undrop objects yourself using SQL.</li>
                <li><strong>Fail-safe:</strong> System-accessible only. Customers cannot query or recover data directly. You must open an Azure/AWS Snowflake Support ticket to restore data from Fail-safe.</li>
            </ul>

#### Interview Questions
**Q: Can a customer run a query on data inside Fail-safe?**

> A: No. Fail-safe is not queryable. It is exclusively for disaster recovery by Snowflake Support.

**Q: How long does data live in the Storage Lifecycle?**

> A: Active Data -> Time Travel (1-90 days) -> Fail-safe (7 days) -> Deleted. In total, a permanent table's modified rows can reside in storage for up to 97 days.


<br/>

## Stage 3: Enterprise Pipelines

### [3.1] Semi-Structured Data Processing
*VARIANT, FLATTEN, and JSON parsing natively.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Data Types</h3>
            <p>VARIANT is Snowflake's native data type that stores JSON, Avro, ORC, and Parquet natively while maintaining internal columnar compression.</p>
            <h3>The FLATTEN Function</h3>
            <p>FLATTEN is a table function that explodes an array (like a list of products in a single JSON cart) into multiple rows so you can join them against standard tables. <code>LATERAL FLATTEN</code> allows you to reference columns from the main table alongside the exploded rows.</p>

#### Interview Questions
**Q: How do you load JSON data into Snowflake?**

> A: Create a table with a single <code>VARIANT</code> column. Use <code>COPY INTO</code> (or Snowpipe) with the <code>FILE_FORMAT = (TYPE = 'JSON')</code> setting. Then, query the VARIANT column using dot notation <code>(col:key::type)</code>.

**Q: What is the difference between FLATTEN and LATERAL FLATTEN?**

> A: FLATTEN is a standalone table function that turns an array into rows. LATERAL FLATTEN acts like a JOIN, allowing you to correlate the exploded rows with the columns of the base table.


<br/>

### [3.2] File Formats & Schema Rules
*CSV, JSON, Parquet, Avro, ORC, compression, and delimiters.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>File Formats in Snowflake</h3>
            <p>A File Format is a database object that encapsulates formatting options (like delimiter characters, headers to skip, encoding, NULL overrides, and compression types) for loading or unloading data files.</p>
            <h3>Structured vs. Semi-Structured</h3>
            <ul>
                <li><strong>CSV / TSV:</strong> Requires schema definition. Parameters include <code>FIELD_DELIMITER</code>, <code>SKIP_HEADER</code>, and <code>NULL_IF</code>.</li>
                <li><strong>Parquet / Avro / ORC:</strong> Columnar/row binary formats that contain schemas internally.</li>
            </ul>

#### Interview Questions
**Q: What happens if you don't define a File Format when running a COPY command?**

> A: Snowflake will attempt to parse the file using default CSV settings (comma-separated, no headers skipped). If loading JSON or Parquet, the query will fail with formatting parsing errors.

**Q: How do you handle custom delimiters and enclosures in CSV loading?**

> A: Define a custom File Format setting: <code>FIELD_DELIMITER = '|'</code> and <code>FIELD_OPTIONALLY_ENCLOSED_BY = '"'</code> to handle text values containing pipelines or commas.


<br/>

### [3.3] External Stages & Storage Integrations
*Configuring secure stages on AWS S3, ADLS Gen2, and GCS.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Stages Overview</h3>
            <p>An External Stage points to cloud storage (S3, Azure Blob, GCS) where source files reside.</p>
            <h3>Storage Integration Objects</h3>
            <p>Instead of hardcoding AWS IAM access keys or SAS tokens inside stage SQL (security risk), you create a **Storage Integration** object. This establishes a secure trust relationship between your Snowflake account tenant and the cloud provider using IAM roles and trust policies.</p>

#### Interview Questions
**Q: Why should you use a Storage Integration instead of passing AWS credentials in the stage definition?**

> A: Storage Integrations delegate credential management to the cloud provider's IAM role model. It avoids exposing plaintext secret access keys in SQL scripts and allows credentials to be rotated easily.

**Q: How do you link a Snowflake Storage Integration to an AWS S3 bucket?**

> A: 1. Create the integration using <code>CREATE STORAGE INTEGRATION</code> defining the bucket ARN. 2. Describe the integration to fetch the AWS IAM User ARN and External ID. 3. Update the S3 bucket's IAM trust policy to allow access to that User ARN/External ID.


<br/>

### [3.4] Internal Stages & SnowSQL commands
*User, Table, and Named Stages, executing PUT and GET.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
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

#### Interview Questions
**Q: Can you run a PUT command inside the Snowflake Web Worksheet UI?**

> A: No. PUT and GET are system file operations and must be executed using the SnowSQL CLI client or the Snowflake Python/Node SDK.

**Q: What is the difference between a User Stage and a Table Stage?**

> A: A User Stage is private to a specific user. A Table Stage is bound to a table structure, meaning any user who has insert/query access to that table can use it to upload source CSVs.


<br/>

### [3.5] COPY INTO & Snowpipe
*Bulk load commands vs. continuous serverless ingestion.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Bulk vs. Continuous Loading</h3>
            <ul>
                <li><strong>COPY INTO:</strong> Bulk loading command. Requires a Virtual Warehouse to run. Best for structured, large batch loads.</li>
                <li><strong>Snowpipe:</strong> Serverless continuous ingestion. Detects files landing in a stage via cloud notifications and loads them instantly.</li>
            </ul>

#### Interview Questions
**Q: Does Snowpipe consume credits when no new files are uploaded?**

> A: No. Snowpipe is serverless. You are only charged for the actual processing compute seconds used when a file lands in the stage.

**Q: How does Snowpipe track which files have already been processed?**

> A: It maintains load history metadata for 14 days. If a file with the same filename is uploaded, it is ignored unless the pipe is forced to reload.


<br/>

## Stage 4: Ecosystem & Advanced

### [4.1] Account Metadata Auditing
*ACCOUNT_USAGE vs. INFORMATION_SCHEMA, query history, and login logs.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Metadata Access</h3>
            <ul>
                <li><strong>INFORMATION_SCHEMA:</strong> Real-time metadata view. Holds records up to 7-14 days. Fast queries but lacks deep historical logs.</li>
                <li><strong>ACCOUNT_USAGE:</strong> Shared database (SNOWFLAKE). Replicated view. Retains data up to 1 year (Query History, Login history, billing logs). Has latency (up to 45 mins to 2 hours lag).</li>
            </ul>

#### Interview Questions
**Q: How do you audit which user consumed the most warehouse credits last month?**

> A: Query the `SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY` view, aggregating credit consumption by warehouse and user over the previous month's date bounds.

**Q: What is the difference between INFORMATION_SCHEMA and ACCOUNT_USAGE?**

> A: INFORMATION_SCHEMA has 0 latency (real-time) but limited retention (14 days). ACCOUNT_USAGE has 1-year retention but latency/lag in data replication updates.


<br/>

### [4.2] CLI Clients & Native Connectors
*SnowSQL CLI, Spark, Python, JDBC, and ODBC driver integrations.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Client Connections</h3>
            <ul>
                <li><strong>SnowSQL:</strong> Command-line client for executing SQL queries, managing stages (PUT/GET), and running automation shell scripts.</li>
                <li><strong>Connectors:</strong> Official library packages (Python, JDBC, ODBC, Spark, SQLAlchemy) that enable third-party tools to connect and query Snowflake.</li>
            </ul>

#### Interview Questions
**Q: What is the Python Connector and how does it prevent SQL injection?**

> A: It is the official Python library. To prevent injection, use parameterized queries instead of string concatenation when passing user inputs to the cursor execution object.

**Q: How does the Spark Connector optimize data extraction?**

> A: It uses **Query Pushdown**. Instead of extracting a full table to Spark memory, filtering and aggregate logic is compiled to SQL and pushed down to execute inside Snowflake first, returning only the final delta records.


<br/>

### [4.3] Replication, Shares & Native Apps
*Multi-cloud replication, Native Apps, sharing, and marketplace.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Database Replication & Failover</h3>
            <p>For disaster recovery, you can replicate databases to different cloud regions and providers. A **Failover Group** automates the secondary database promotion to primary status if the source cloud suffers an outage.</p>
            <h3>Native Apps</h3>
            <p>The Snowflake Native App Framework allows companies to package application code (Python/Streamlit) and SQL schemas, publishing them on the Snowflake Marketplace. Consumers install the app directly inside their accounts, running it securely on their own compute nodes without exporting raw data.</p>

#### Interview Questions
**Q: How does Snowflake support cross-cloud disaster recovery?**

> A: Through Database Replication and Failover Groups. You replicate metadata and physical data to a different cloud region/provider (e.g. AWS to Azure). If AWS fails, you promote the Azure database replica to primary status.

**Q: What is the Snowflake Native App Framework?**

> A: It is a distribution model allowing developers to build applications that run directly inside the customer's Snowflake account boundary, securing proprietary source code while protecting consumer data.


<br/>

### [4.4] Streams & Tasks (CDC + Orchestration)
*Capture incremental changes and automate pipeline execution natively inside Snowflake.*

**Duration:** 🕒 18 min read | **Difficulty:** Advanced

#### Theory
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

#### Interview Questions
**Q: What is the difference between a Standard Stream and an Append-Only Stream?**

> A: A Standard Stream captures all DML changes — inserts, updates (represented as a DELETE+INSERT pair), and deletes. An Append-Only Stream captures only new INSERT rows, which is more efficient for append-only event or log tables where rows are never modified after ingestion.

**Q: Why must a Task be RESUMED before it executes?**

> A: Tasks are created in SUSPENDED state by default to prevent accidental execution on misconfigured pipelines. You must explicitly run ALTER TASK <name> RESUME after verifying the SQL and schedule are correct.

**Q: How does WHEN SYSTEM$STREAM_HAS_DATA work in a Task?**

> A: It is a conditional filter that prevents the Task from executing when the stream has no new records. Without it, the Task runs on every schedule tick even if there is nothing to process, wasting warehouse credits.

**Q: What is the advantage of Serverless Tasks over Warehouse-based Tasks?**

> A: Serverless Tasks use Snowflake-managed auto-scaling compute billed per second of actual execution. Warehouse Tasks keep a virtual warehouse running between task executions, incurring idle credits. For tasks that run infrequently or have variable compute needs, Serverless Tasks are significantly cheaper and simpler to manage.

**Q: What causes a Snowflake Stream to become stale, and how do you prevent it?**

> A: A stream becomes stale when it is not consumed within the source table's data retention period (default 1 day). Unconsumed changes older than the retention window are purged, making the stream unreadable. Prevent staleness by ensuring Tasks consuming the stream run at least once per day, or by extending the source table's DATA_RETENTION_TIME_IN_DAYS to match your processing frequency.


<br/>

### [4.5] Materialized Views
*Pre-compute and cache complex query results for instant response times.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
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

#### Interview Questions
**Q: When would you choose a Materialized View over a regular View?**

> A: Use a Materialized View when a complex aggregation or filter is queried frequently by BI tools and the base table changes infrequently. The MV pre-computes the result so BI queries get near-instant response times. Avoid MVs on high-churn tables where refresh costs exceed query savings.

**Q: What is query rewrite in the context of Materialized Views?**

> A: Query rewrite is when Snowflake's optimizer automatically redirects a query against the base table to the Materialized View if the MV can satisfy the query. The query author does not need to reference the MV explicitly — they query the base table and Snowflake handles the routing transparently.

**Q: When would you use a Dynamic Table instead of a Materialized View?**

> A: Use a Dynamic Table when your transformation requires JOINs, window functions, or complex multi-table logic that a Materialized View cannot support. Dynamic Tables accept any SQL including JOINs and window functions, and refresh incrementally based on a target lag setting. Use Materialized Views only for simple single-table aggregations where sub-second read latency is critical.


<br/>

### [4.6] Resource Monitors
*Set credit limits and automated alerts to control warehouse spend.*

**Duration:** 🕒 10 min read | **Difficulty:** Intermediate

#### Theory
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

#### Interview Questions
**Q: What is the difference between SUSPEND and SUSPEND_IMMEDIATE in a Resource Monitor?**

> A: SUSPEND waits for all currently running queries to finish before stopping the warehouse — in-flight work is not lost. SUSPEND_IMMEDIATE kills all running queries immediately and halts the warehouse — useful when runaway queries are burning credits beyond budget.

**Q: Can a Resource Monitor prevent all credit overruns?**

> A: Not completely. There is a small lag between credit consumption and monitoring detection. It is also possible for a warehouse to slightly exceed the quota between measurement intervals. Resource Monitors reduce overruns significantly but should be combined with warehouse auto-suspend policies for complete control.


<br/>

### [4.7] Snowflake Tags & Cost Allocation
*Label objects with metadata tags and trace credits back to business units.*

**Duration:** 🕒 10 min read | **Difficulty:** Intermediate

#### Theory
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

#### Interview Questions
**Q: How do Snowflake Tags support financial chargeback models?**

> A: By tagging warehouses with business unit identifiers (like cost_center = 'Marketing'), you can join WAREHOUSE_METERING_HISTORY with TAG_REFERENCES in ACCOUNT_USAGE to calculate exactly how many credits each department consumed. This enables accurate monthly chargeback billing to each business unit.

**Q: What is tag propagation and why is it useful for governance?**

> A: Tag propagation means that a tag applied to a source table column is automatically inherited by downstream views, masking policies, and cloned objects that reference that column. This ensures PII or sensitivity classifications flow through the entire data pipeline without requiring manual re-tagging of every derived object.


<br/>

---

# Domain: Azure Data Factory (ADF)

## Stage 1: Core Architecture & Cost

### [1.3] Network Isolation & Private Links
*Securing data pipelines inside private networks using Managed VNets.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Managed Virtual Network (Managed VNet)</h3>
            <p>By default, Azure Data Factory copies data using public network endpoints. To secure sensitive data, enterprises deploy ADF inside a **Managed VNet**. In this mode, ADF provisions isolated compute nodes inside an Azure VNet managed by Microsoft, meaning raw data transit occurs off the public internet.</p>

            <h3>Private Endpoints & Private Links</h3>
            <p>A **Private Endpoint** is a private IP address assigned from your virtual network to a specific Azure service resource (like Azure SQL Database, ADLS Gen2, or Azure Key Vault). By setting up Private Endpoints within ADF's Managed VNet, your pipelines communicate with databases and files securely over the Microsoft backbone network, bypassing firewall public IPs entirely.</p>

#### Interview Questions
**Q: What is a Managed VNet in Azure Data Factory and why should we use it?**

> A: A Managed VNet isolates the Integration Runtime compute nodes inside a secure network managed by Microsoft. It prevents the IR from using public IP addresses and allows you to create Private Endpoints to safely read/write data in private SQL databases or Azure Storage accounts.

**Q: If an Azure SQL Database has its public firewall completely disabled, how can ADF read from it?**

> A: You must run ADF inside a Managed VNet and set up a **Managed Private Endpoint** targeting the SQL Database resource. Microsoft will route the traffic over the internal network using a private IP, allowing ADF to read the database even with its public access blocked.


<br/>

## Stage 1: Core Concepts & IRs

### [1.1] Integration Runtimes (IR)
*Master Azure IR, Self-Hosted IR, High Availability, and sharing.*

**Duration:** 🕒 15 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>What is an Integration Runtime (IR)?</h3>
            <p>The Integration Runtime is the compute infrastructure used by Azure Data Factory to provide data integration capabilities across different network environments. It is the actual engine that executes copy activities, runs data flows, and dispatches pipelines.</p>
            
            <h3>Types of Integration Runtimes</h3>
            <ul>
                <li><strong>Azure IR:</strong> Fully managed, serverless compute in Azure. Used for copying data between cloud data stores and running Data Flows. It automatically scales compute nodes.</li>
                <li><strong>Self-Hosted IR (SHIR):</strong> Installed on-premises or on a virtual machine inside a private virtual network. It bridges cloud ADF services with secure on-prem databases (e.g., SQL Server, Oracle) or private VNets.</li>
                <li><strong>Azure-SSIS IR:</strong> A dedicated cluster of managed virtual machines used to deploy and run SQL Server Integration Services (SSIS) packages natively in Azure.</li>
            </ul>

            <h3>Self-Hosted IR: High Availability (HA) & Sharing</h3>
            <p>For enterprise systems, a single VM hosting a SHIR is a single point of failure (SPOF). ADF allows you to install SHIR on up to **4 physical/virtual machines (nodes)**. They register under the same Gateway key, establishing active-active High Availability. If Node 1 crashes, jobs automatically failover to Node 2.</p>
            <p><strong>SHIR Sharing:</strong> Instead of installing a new SHIR VM for every separate Data Factory in your organization, you can set up a central "Shared Self-Hosted IR" in a hub subscription. Other "Linked Data Factories" can consume it by routing their operations through it.</p>

#### Interview Questions
**Q: What is the role of an Integration Runtime (IR) in Azure Data Factory?**

> A: The Integration Runtime is the actual compute engine that performs the data copying, dispatches pipeline activities, and runs Mapping Data Flows. ADF itself is only an orchestration control-plane; the IR provides the physical CPU and RAM resources to execute the tasks.

**Q: How do you achieve High Availability (HA) and scalability with a Self-Hosted IR?**

> A: You can associate up to 4 virtual/physical machines (nodes) to a single Self-Hosted IR gateway. This sets up an active-active cluster. ADF load-balances jobs across all active nodes. If one node goes offline, the remaining nodes continue to process pipelines, avoiding downtime.

**Q: Can multiple Azure Data Factories share the same Self-Hosted IR? How?**

> A: Yes. You configure a single central 'Shared Self-Hosted IR' inside a Master Data Factory. Then, from other Linked Data Factories, you create a 'Linked Integration Runtime' that references the shared IR using resource ID links and permissions, avoiding VM overhead costs.


<br/>

### [1.2] Integration Runtime Performance Scaling
*SHIR sizing, concurrent jobs, CPU/Memory bottlenecks, and network parameters.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Sizing your Self-Hosted IR</h3>
            <p>Running many concurrent Copy activities on a Self-Hosted IR (SHIR) VM requires calculating CPU and memory metrics. By default, a SHIR node concurrency is set based on the machine's resources, but it is capped at a maximum of **96 concurrent jobs per node**.</p>
            <h3>Troubleshooting Bottlenecks</h3>
            <ul>
                <li><strong>CPU Bottleneck:</strong> Occurs during column parsing, file compression (GZIP, Snappy), or when converting binary JSON payloads. If CPU usage stays at 100%, reduce concurrent job limits or scale up the SHIR VM core count.</li>
                <li><strong>Memory Bottleneck:</strong> Copying massive files with large chunk settings. Can result in Out of Memory crashes.</li>
                <li><strong>Network Bottleneck:</strong> If data copy speeds are slow, check the network link between the SHIR VM and the target database. Setting up ExpressRoute or VPN gateways can resolve this.</li>
            </ul>

#### Interview Questions
**Q: What is the maximum number of concurrent jobs a single SHIR node can run?**

> A: By default, the limit is based on the VM size, but it can be configured up to a maximum cap of **96 concurrent jobs** per node in the Integration Runtime configurations panel.

**Q: How do you resolve CPU bottlenecks on a SHIR machine when running file compressions?**

> A: 1. Change the SHIR concurrent jobs limit to run fewer jobs at the same time. 2. Scale UP the SHIR VM size to add more physical cores. 3. Add another VM node (Scale OUT) to distribute the processing load across multiple machines.


<br/>

## Stage 2: Dynamic Orchestration

### [2.1] Linked Services & Key Vault Integration
*Secure connection configurations and zero-plaintext database parameters.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Linked Services Integration</h3>
            <p>Linked Services define connection properties to your databases or file systems. Instead of storing plaintext passwords inside these configurations, ADF allows integration with **Azure Key Vault (AKV)**.</p>
            <h3>Zero-Plaintext Pipelines</h3>
            <p>You grant the ADF Managed Identity access to the Key Vault. The Linked Service configuration points to the Key Vault dynamically and retrieves the secret at runtime. This allows secret rotation without breaking pipelines or updating parameters manually.</p>

#### Interview Questions
**Q: How do you dynamically fetch a connection string password from Key Vault in ADF?**

> A: 1. Grant ADF's Managed Identity get/list secret permissions on the Key Vault. 2. Create an AKV Linked Service in ADF. 3. Configure your database Linked Service to read its password from Key Vault, referencing the Secret Name.


<br/>

### [2.2] Dataset Parameterization & Dynamic Paths
*Configure parameterized datasets, dynamic directories, and filenames.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Parameterized Datasets</h3>
            <p>Instead of creating 100 separate Blob storage datasets for 100 different file schemas, you should create one single **Parameterized Dataset**. By defining parameters (e.g., <code>folderName</code> and <code>fileName</code>) inside the dataset settings, you pass values dynamically from the pipeline level during runtime.</p>
            <h3>Dynamic Path Configurations</h3>
            <p>You configure file paths in the connection settings using ADF Expression Language:</p>
            <p><code>@dataset().folderName</code></p>
            <p>This single dataset can then be used to read or write files to any S3/ADLS folder dynamically, reducing resource count in your project.</p>

#### Interview Questions
**Q: How do you write a file dynamically to a folder named after the current year and month?**

> A: 1. Parameterize the Dataset path. 2. Pass the value from the Copy activity using the date expression: <code>@concat(utcNow('yyyy'), '/', utcNow('MM'))</code>.

**Q: Why should you parameterize datasets in ADF?**

> A: To reduce project complexity. Instead of creating separate datasets for each database table or file path, you reuse a single generic dataset, passing directory and filename configurations dynamically as parameters.


<br/>

### [2.3] Parameters vs. Variables
*Understand static inputs vs. dynamic state variables.*

**Duration:** 🕒 12 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>Parameters vs. Variables</h3>
            <ul>
                <li><strong>Parameters:</strong> Defined at the pipeline level. They are **read-only** inputs passed from outside when starting the pipeline. They cannot be modified inside.</li>
                <li><strong>Variables:</strong> Internal state managers. You can initialize, update, and modify their values inside the pipeline using the <code>Set Variable</code> activity.</li>
            </ul>

#### Interview Questions
**Q: What is the difference between a Pipeline Parameter and a Pipeline Variable?**

> A: Parameters are external inputs set when the pipeline is triggered; they are static and read-only during run time. Variables are internal placeholders whose values can be modified inside the pipeline run using Set Variable or Append Variable activities.


<br/>

### [2.4] Control Flow & Activities
*Orchestrate processes with Lookup, Get Metadata, Web, and loops.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Key Control Flow Activities</h3>
            <ul>
                <li><strong>Lookup Activity:</strong> Reads a config table or runs a query and returns a JSON payload containing up to 5,000 rows.</li>
                <li><strong>Get Metadata Activity:</strong> Inspects files/folders in storage and returns properties like file size, list of child items (filenames), existence, and modified dates.</li>
                <li><strong>ForEach Loop:</strong> Iterates through arrays. <code>ForEach</code> can run iterations in parallel (default) or sequentially (sequential mode).</li>
            </ul>

#### Interview Questions
**Q: How do you check if a file exists in an Azure Blob Storage folder before copying it?**

> A: Use the **Get Metadata** activity. Add the `Exists` argument to the Field List. Then, use an **If Condition** activity to evaluate the outcome: <code>@activity('Get Metadata').output.exists</code>.


<br/>

### [2.5] REST API Integration & Web Activities
*API authentication, pagination limits, retries, and headers.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>REST Integration Challenges</h3>
            <p>When extracting data from external REST APIs using Copy or Web activities, data engineers face authentication and limits bottlenecks:</p>
            <ul>
                <li><strong>Authentication:</strong> OAuth2 flows requiring dynamic Bearer token requests via parent Web activities prior to copying.</li>
                <li><strong>Pagination:</strong> Fetching data in chunks (pages) using token links or offset indices. ADF Data Flows can handle pagination properties natively.</li>
                <li><strong>Rate Limits:</strong> APIs limit queries per minute. You must configure the Copy/Web activity **Retry** parameters to back off on 429 (Too Many Requests) errors.</li>
            </ul>

#### Interview Questions
**Q: How do you execute an OAuth2 pipeline in ADF?**

> A: 1. Use a **Web Activity** to make a POST request to the OAuth authorization server passing credentials, returning an access token. 2. Store the token in a variable. 3. Pass the token as a dynamic Header: <code>@concat('Bearer ', variables('accessToken'))</code> in the downstream Copy/Web activities.

**Q: How do you configure dynamic pagination in ADF Copy activity?**

> A: Within Copy activity REST source settings, select the **Pagination Rules**. You configure parameters (e.g. `QueryParameters.page` or header token links) using expressions to update query paths until the response is empty.


<br/>

## Stage 3: Advanced ETL & CDC

### [3.1] Copy Activity Deep Dive
*Parallel copies, data compression, staging, fault tolerance, and DIU tuning.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>Performance Parameters in Copy Activity</h3>
            <ul>
                <li><strong>Data Integration Units (DIUs):</strong> Defines the compute resource size allocated for copy tasks. Increasing DIUs (default is Auto, scales up to 256) improves CPU and network capacity during copy runs.</li>
                <li><strong>Parallel Copies (Degree of Parallelism):</strong> Tells ADF to partition files or query boundaries and copy them simultaneously.</li>
                <li><strong>Staged Copy:</strong> Copies source data to a temporary blob stage first, then loads it to the target (e.g. using PolyBase to Snowflake). Faster than direct copying for massive tables.</li>
                <li><strong>Fault Tolerance (Skip Rows):</strong> Skips corrupted or malformed rows rather than failing the entire copy job, logging rejected records in a dead-letter folder.</li>
            </ul>

#### Interview Questions
**Q: What is DIU in ADF and how do you configure it for optimal performance?**

> A: DIU stands for Data Integration Unit. It represents the scale of compute resources allocated to run a copy activity. For cloud-to-cloud copies, increasing DIUs from the default Auto value to a larger value (like 32) can accelerate data copying for large datasets.

**Q: What is a Staged Copy and when should you use it?**

> A: A Staged Copy writes data from the source to a temporary cloud storage bucket first, then loads it into the target warehouse (e.g., using Snowflake COPY commands or Synapse PolyBase). It is used to dramatically speed up loads to data warehouses compared to row-by-row inserts.

**Q: How do you configure fault tolerance to skip corrupted records during a copy?**

> A: In the Copy activity Settings, enable **Fault Tolerance**. Choose 'Skip incompatible rows' and configure a target storage path to write the log of rejected records, allowing the copy job to succeed while capturing bad rows.


<br/>

### [3.2] Mapping Data Flows
*Visual ETL pipelines, Spark scaling, and Schema Drift.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>What are Mapping Data Flows?</h3>
            <p>Mapping Data Flows are visually-designed data transformation pipelines executed on an auto-scaling Spark cluster.</p>
            <h3>Performance Optimization</h3>
            <ul>
                <li><strong>Broadcast Join:</strong> In the Join transformation settings, enable broadcasting if one table is small (under 10MB) to copy it to all nodes and avoid shuffles.</li>
                <li><strong>Partitioning:</strong> Set custom partitions on high-cardinality keys to distribute the compute load across worker nodes.</li>
            </ul>

#### Interview Questions
**Q: What is a Broadcast Join in Data Flows and how does it optimize joins?**

> A: A Broadcast Join sends the smaller dataset to all active Spark cluster nodes. This allows the join operation to execute locally on each node without shuffling the larger dataset across the network, reducing query execution time.


<br/>

### [3.3] Incremental Loading & CDC Ingestion
*Watermarks, CDC, hash comparison, and soft delete tracking.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Incremental Load Patterns</h3>
            <ul>
                <li><strong>High Watermark:</strong> Tracking a timestamp or ID in a control table and querying records newer than that value.</li>
                <li><strong>Hash Comparison:</strong> Calculating MD5 hashes of row columns to identify updates when no timestamp exists.</li>
                <li><strong>Soft Delete Ingestion:</strong> Ingesting deletions where status columns are set to active=false. Hard deletes must be tracked by checking the source database transaction logs via native CDC.</li>
            </ul>

#### Interview Questions
**Q: How do you capture deleted rows in a source database that doesn't use soft-delete flags?**

> A: You must configure **Change Data Capture (CDC)** natively at the database level (e.g. SQL Server CDC) or run a daily full outer join comparing the previous day's snapshot against today's database extract, identifying missing IDs.


<br/>

### [3.4] Custom Logging Framework
*Designing custom audit and execution logging frameworks.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Custom Logging Architecture</h3>
            <p>Relying solely on ADF's monitoring dashboard makes auditing difficult. A **Custom Logging Framework** logs metadata before and after every pipeline execution to a central SQL logging database:</p>
            <ul>
                <li><strong>Audit Table Columns:</strong> <code>execution_id</code> (GUID), <code>pipeline_name</code>, <code>status</code> (Running/Success/Failed), <code>start_time</code>, <code>end_time</code>, <code>duration_seconds</code>, <code>rows_read</code>, <code>rows_written</code>, and <code>error_message</code>.</li>
            <li><strong>Implementation:</strong> Place an INSERT activity at the start of the pipeline setting status to 'Running'. Place UPDATE activities on the Success and Failure paths of the pipeline to record execution duration and statistics.</li>
            </ul>

#### Interview Questions
**Q: How do you capture the number of rows copied in a Copy activity dynamically for logging?**

> A: Access the output metadata of the completed Copy activity using: <code>@activity('MyCopyActivity').output.rowsCopied</code> or <code>@activity('MyCopyActivity').output.dataRead</code>.

**Q: Why build a custom logging framework if Azure has built-in monitoring?**

> A: Built-in logs expire after 45 days. A custom framework keeps permanent audit history, allows for custom BI reporting on data volumes, and makes it easy to calculate pipeline execution SLA KPIs.


<br/>

## Stage 4: Operations & Alerts

### [4.1] Trigger Types & Dependencies
*Schedule, Tumbling Window, Event, and Dependency triggers.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>ADF Trigger Mechanisms</h3>
            <ul>
                <li><strong>Schedule Trigger:</strong> Triggers pipelines at exact intervals (e.g. every hour, every Sunday).</li>
                <li><strong>Tumbling Window Trigger:</strong> Fires at regular, non-overlapping intervals. Has unique capabilities: it can handle data backfills easily, manages self-dependencies (waiting for previous windows to finish), and retries on failure.</li>
                <li><strong>Event Trigger:</strong> Runs dynamically when files land in a Blob Storage stage (BlobCreated, BlobDeleted).</li>
                <li><strong>Dependency Trigger:</strong> A Tumbling Window trigger can depend on another Tumbling Window trigger in a different pipeline, ensuring sequential processing (e.g. waiting for staging pipeline before running data warehouse load).</li>
            </ul>

#### Interview Questions
**Q: What is the difference between a Schedule Trigger and a Tumbling Window Trigger?**

> A: A Schedule trigger runs concurrent instances at set intervals and cannot handle backfills. A Tumbling Window trigger executes non-overlapping windows sequentially, supports historical backfilling, and manages task dependencies (waiting for previous window runs).

**Q: How do you configure a pipeline to execute only when files are created in Azure Blob Storage?**

> A: Create an **Event Trigger**, select your storage account and container, configure a file path prefix/suffix (e.g. <code>.csv</code>), and register the subscription. When a file is uploaded, the trigger runs the pipeline dynamically.


<br/>

### [4.2] Error Handling & Recovery
*Resilient patterns, retry thresholds, and dead-letter pipelines.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Pipeline Resiliency</h3>
            <p>Pipelines should handle transient errors without developer intervention:</p>
            <ul>
                <li><strong>Retry logic:</strong> Configure Retry values to wait out temporary network dropouts.</li>
                <li><strong>Skip row tolerance:</strong> Capturing bad database rows in storage instead of aborting the copy task.</li>
                <li><strong>Restartability:</strong> If a pipeline with 10 activities fails at activity 6, you can restart the pipeline directly from activity 6 in the monitoring dashboard, preserving previous operations.</li>
            </ul>

#### Interview Questions
**Q: How do you recover a multi-step pipeline that failed halfway through without re-running completed steps?**

> A: Go to the monitoring dashboard, select the failed run, and click **Rerun from failed activity**. This executes only the failed activity and its downstream steps, bypassing the initial successful runs.


<br/>

### [4.3] IaC, CI/CD & Synapse/Fabric Pipelines
*Git, ARM/Bicep deployments, and comparing ADF with Fabric.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Infrastructure as Code (IaC)</h3>
            <p>ADF configurations are JSON documents. You deploy them across environments using Infrastructure as Code tools like Azure Resource Manager (ARM) templates, Azure Bicep, or Terraform providers.</p>

            <h3>ADF vs. Synapse vs. Microsoft Fabric</h3>
            <ul>
                <li><strong>ADF:</strong> Standalone orchestration service. Highly mature.</li>
                <li><strong>Synapse Pipelines:</strong> ADF capabilities built inside Azure Synapse Analytics workspace, tightly integrated with SQL pools.</li>
                <li><strong>Microsoft Fabric Data Factory:</strong> The next-generation SaaS model. Fully integrated with OneLake, lakehouses, and real-time analytics. Combines ADF and Data Flows in a unified cloud platform.</li>
            </ul>

#### Interview Questions
**Q: What is the difference between Azure Data Factory pipelines and Microsoft Fabric Pipelines?**

> A: ADF is a PaaS data integration service requiring linked service integrations. Fabric Pipelines are SaaS orchestration layers built directly into Microsoft Fabric, which automatically load and write data to Fabric OneLake without complex staging.

**Q: How do you parameterize ARM templates during ADF deployments?**

> A: You specify parameter definitions in `arm-template-parameters-definition.json` in the collaboration branch. When publishing, ADF creates an ARM template and a parameters file. The deployment release task overrides these parameters (like endpoint URLs) to match targets.


<br/>

### [4.4] Fabric Data Factory vs. Azure Data Factory
*Understand the architectural differences between ADF and its SaaS successor inside Microsoft Fabric.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is Microsoft Fabric Data Factory?</h3>
            <p>Fabric Data Factory is the next-generation data integration service built natively inside <strong>Microsoft Fabric</strong> (the unified SaaS analytics platform). It uses the same Copy Activity and pipeline metaphors as ADF but runs as a fully managed SaaS service with tighter integration to OneLake, Lakehouses, and Fabric compute.</p>
            <h3>Key Architectural Differences</h3>
            <ul>
                <li><strong>Storage target:</strong> Fabric pipelines write directly to <strong>OneLake</strong> (the unified Fabric storage layer) without needing Linked Services to ADLS Gen2. ADF requires explicit Linked Service configuration for every data store.</li>
                <li><strong>Compute model:</strong> Fabric pipelines use <strong>Fabric compute</strong> (serverless, managed by Microsoft). ADF uses Azure Integration Runtimes which you size and configure manually.</li>
                <li><strong>Authentication:</strong> Fabric uses Fabric workload identity automatically. ADF requires Managed Identity, Service Principal, or Key Vault integration to be wired up explicitly.</li>
                <li><strong>Metadata & lineage:</strong> Fabric pipelines automatically register lineage in the Fabric workspace. ADF lineage requires Azure Purview integration separately.</li>
                <li><strong>Git integration:</strong> Both support Git, but Fabric uses Fabric workspace Git sync (simpler) vs. ADF's full ARM template publish model.</li>
                <li><strong>Pricing:</strong> Fabric uses <strong>Fabric Capacity Units (CUs)</strong> pooled across all Fabric workloads. ADF bills per Activity Run, DIU-hour, and IR uptime separately.</li>
            </ul>
            <h3>When to Use Each</h3>
            <ul>
                <li>Use <strong>ADF</strong> when integrating with non-Microsoft systems (Snowflake, Salesforce, SAP), when you need Self-Hosted IR for on-premises sources, or when your organization isn't yet on Fabric.</li>
                <li>Use <strong>Fabric Data Factory</strong> for greenfield Fabric-native projects where all data lands in OneLake and simplicity and unified billing are priorities.</li>
            </ul>

#### Interview Questions
**Q: What is the biggest operational difference between ADF and Fabric Data Factory?**

> A: ADF is PaaS — you configure Linked Services, Integration Runtimes, and Key Vault integration manually. Fabric Data Factory is SaaS — compute is fully managed, and pipelines write directly to OneLake without any Linked Service configuration for Fabric-native stores. This dramatically reduces infrastructure overhead for Fabric-first architectures.

**Q: Can Fabric Data Factory replace ADF for on-premises data ingestion?**

> A: Not directly today. Fabric Data Factory does not support Self-Hosted Integration Runtime for on-premises sources behind firewalls. ADF with SHIR remains the recommended approach for hybrid on-premises to cloud ingestion scenarios until Fabric adds equivalent gateway support.


<br/>

### [4.5] Azure Function Activity in ADF
*Trigger serverless custom code as part of ADF pipeline control flow.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is the Azure Function Activity?</h3>
            <p>The <strong>Azure Function Activity</strong> allows ADF pipelines to call an <strong>Azure Function</strong> HTTP endpoint as a pipeline step. This enables running arbitrary custom code (Python, C#, Node.js) as part of a pipeline without leaving the ADF orchestration layer.</p>
            <h3>Configuration</h3>
            <ul>
                <li><strong>Azure Function Linked Service:</strong> Points to the Azure Function App URL and Function Key (or Managed Identity).</li>
                <li><strong>Method:</strong> Typically POST — the function receives a JSON payload from the pipeline.</li>
                <li><strong>Body:</strong> Pass pipeline parameters as JSON to the function for processing.</li>
                <li><strong>Return value:</strong> The function's HTTP response body is captured in the activity output and can be referenced downstream.</li>
            </ul>
            <pre><code>// Example Azure Function triggered by ADF
public static async Task Run(HttpRequest req) {
    string body = await new StreamReader(req.Body).ReadToEndAsync();
    var data = JsonConvert.DeserializeObject(body);
    // Custom processing logic here
    return new OkObjectResult(new { status = "success", rowsProcessed = 500 });
}</code></pre>
            <h3>Use Cases</h3>
            <ul>
                <li>Calling third-party APIs with custom retry logic beyond ADF's built-in Web Activity.</li>
                <li>Running complex data transformation logic in Python/C# mid-pipeline.</li>
                <li>Generating dynamic file manifests or metadata that downstream Copy Activities use.</li>
                <li>Sending custom formatted alerts to Slack/Teams with rich message payloads.</li>
            </ul>
            <h3>Azure Function vs. Web Activity</h3>
            <p>The <strong>Web Activity</strong> calls any HTTP endpoint with simple request/response. The <strong>Azure Function Activity</strong> is specifically optimized for Azure Functions — it handles Managed Identity auth automatically, has a dedicated Linked Service type, and surfaces Function-specific error codes cleanly in pipeline diagnostics.</p>

#### Interview Questions
**Q: When would you use an Azure Function Activity instead of a Web Activity in ADF?**

> A: Use Azure Function Activity when the endpoint is specifically an Azure Function and you want native Managed Identity authentication, easier Linked Service management, and cleaner error reporting from Function-specific HTTP error codes. Use Web Activity for generic third-party HTTP REST endpoints where you manage auth headers manually.

**Q: How do you pass pipeline parameters to an Azure Function Activity?**

> A: Set the Body field of the Azure Function Activity to a JSON object using dynamic content expressions, for example: @{pipeline().parameters.runDate}. The Azure Function receives this JSON in the request body and can parse it to drive processing logic.


<br/>

### [4.6] Lookup + ForEach Batching for Large Datasets
*Process more than 5,000 rows from Lookup using chunking and batch strategies.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>The 5,000 Row Lookup Limit</h3>
            <p>The ADF <strong>Lookup Activity</strong> has a hard limit of <strong>5,000 rows</strong> returned per execution. For control-table-driven pipelines that reference more than 5,000 entities (tables, files, partitions), you must implement a chunking strategy.</p>
            <h3>Strategy 1: Pagination-Based Chunking</h3>
            <p>Use a sequential ForEach loop over page numbers, each Lookup fetching a 5,000-row page using SQL OFFSET/FETCH.</p>
            <pre><code>-- Control table SQL with pagination
SELECT table_name, schema_name
FROM control.tables
ORDER BY table_name
OFFSET @{mul(pipeline().parameters.pageNumber, 5000)} ROWS
FETCH NEXT 5000 ROWS ONLY</code></pre>
            <h3>Strategy 2: Pre-Partition the Control Table</h3>
            <p>Add a <code>batch_id</code> column to the control table and assign each row to a batch of max 4,000 entities. A top-level pipeline iterates over distinct batch IDs and triggers a child pipeline per batch.</p>
            <pre><code>-- Assign batch IDs during control table load
UPDATE control.tables
SET batch_id = CEILING(ROW_NUMBER() OVER (ORDER BY table_name) / 4000.0)</code></pre>
            <h3>Strategy 3: ForEach Batch Count</h3>
            <p>ADF's ForEach Activity has a <strong>Batch Count</strong> setting (1-50) that controls how many iterations run in parallel. For large entity lists, set Batch Count to 20-50 to parallelize processing across 20-50 concurrent child pipelines.</p>
            <h3>Strategy 4: Meta-Driven Framework with Azure SQL</h3>
            <p>Store all pipeline metadata in an Azure SQL control table. Use a <strong>Script Activity</strong> to fetch a cursor-driven page rather than the Lookup Activity, bypassing the 5,000 row limit entirely by using server-side pagination in the SQL procedure.</p>
            <h3>Anti-Pattern to Avoid</h3>
            <p>Do not chain multiple Lookup Activities sequentially to build a large list — this adds latency and complexity. Pre-paginate in the data source using SQL or use a stored procedure that returns paginated results to a staging table consumed by Copy Activities.</p>

#### Interview Questions
**Q: What happens when a Lookup Activity returns more than 5,000 rows in ADF?**

> A: ADF silently truncates the result to 5,000 rows. No error is raised. This is a common silent bug in control-table-driven pipelines where developers assume all entities are returned. Always validate with COUNT(*) before relying on Lookup for large control tables.

**Q: How would you design a meta-driven ADF pipeline that processes 50,000 tables?**

> A: Partition the control table into batches of 4,000 rows using a batch_id column. A root pipeline does a Lookup for distinct batch_ids (well within 5,000), then a ForEach with Batch Count 50 triggers child pipelines — each child does its own Lookup for its batch_id slice. This processes all 50,000 tables with up to 50 pipelines running in parallel.


<br/>

---

# Domain: dbt Prep

## Stage 1: Core Architecture & Models

### [1.1] dbt Core & Compilation
*The compiler engine, target directory, profiles config, and the manifest.json.*

**Duration:** 🕒 15 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>What is dbt?</h3>
            <p>dbt compiles SQL files with Jinja expressions and sends them to your data warehouse (e.g., Snowflake) for execution. It manages the **T** (Transformation) of ETL/ELT pipelines.</p>

            <h3>How Compilation Works</h3>
            <p>dbt parses Jinja expressions and compiles raw SQL files inside the <code>target/compiled/</code> directory. The full project lineage, configurations, and metadata are saved in a single output JSON file called <code>manifest.json</code>.</p>

            <h3>Connecting with Profiles</h3>
            <p>Connection paths, targets (dev, prod, qa), database credentials, and roles are configured in your local <code>profiles.yml</code> file to keep access details out of version control repositories.</p>

#### Interview Questions
**Q: What is manifest.json and why is it important?**

> A: The `manifest.json` is a metadata file compiled by dbt containing details of every model, source, test, and relationship in the project DAG. It is used by CI/CD pipelines to compare state changes and only run modified code.


<br/>

### [1.2] Model Materializations
*Views, Tables, Ephemeral, and Custom configurations.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Materializations</h3>
            <p>Materializations dictate how a SQL model is built inside the target database:</p>
            <ul>
                <li><strong>View:</strong> Recreates standard views (Default). Fast compile, slow read.</li>
                <li><strong>Table:</strong> Rebuilds the model as a physical table using a CTAS query on every run.</li>
                <li><strong>Incremental:</strong> Inserts or merges only modified rows. Highly efficient.</li>
                <li><strong>Ephemeral:</strong> Embeds the model query as a Common Table Expression (CTE) directly inside downstream models.</li>
            </ul>

#### Interview Questions
**Q: What is the difference between Table and Incremental materializations?**

> A: Table drops and rebuilds the physical database object from scratch on every run. Incremental only processes new or updated records since the last dbt execution, saving database compute costs.


<br/>

### [1.3] Sources, Freshness & Data Lineage
*Configure freshness checks, dynamic loaded_at limits, and warning policies.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Source Freshness</h3>
            <p>To avoid processing stale or delayed data from raw sources, dbt allows you to configure **Freshness Checks** in your source YAML configurations. You specify a timestamp column to evaluate and define freshness limits:</p>
            <pre><code>sources:
  - name: raw_sales
    tables:
      - name: orders
        freshness:
          warn_after: {count: 6, period: hour}
          error_after: {count: 12, period: hour}
        loaded_at_field: order_date</code></pre>
            <p>Running <code>dbt source freshness</code> calculates the delta time since the newest timestamp in <code>loaded_at_field</code> and warns or errors if thresholds are exceeded.</p>

#### Interview Questions
**Q: How do you check if source data ingestion has stalled using dbt?**

> A: Define a <code>freshness</code> block inside the source table's schema YAML, configuring <code>loaded_at_field</code> to point to the ingestion timestamp, and run <code>dbt source freshness</code>. dbt will warning/error if the newest record age exceeds the thresholds.

**Q: What parameters are required for source freshness checks?**

> A: You need `loaded_at_field` (the timestamp column in the source table) and thresholds (like `warn_after` and `error_after` defining integer counts and time periods like hours or days).


<br/>

## Stage 2: Advanced Ingest & Custom Rules

### [2.1] Incremental Load Strategies
*Append, merge, delete+insert, insert+overwrite, and unique keys.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>Incremental Strategies</h3>
            <p> dbt uses different SQL strategies to load delta data:</p>
            <ul>
                <li><strong>merge:</strong> Default on Snowflake. Runs a SQL MERGE statement matching primary key parameters.</li>
                <li><strong>append:</strong> Appends incoming rows blindly (fast, but risks duplicate records).</li>
                <li><strong>delete+insert:</strong> Deletes existing records matching unique keys, then inserts new rows.</li>
                <li><strong>insert+overwrite:</strong> Overwrites specific partitions (highly cost-effective on BigQuery).</li>
            </ul>

#### Interview Questions
**Q: How do you handle duplicate rows in an incremental model run?**

> A: Configure a <code>unique_key</code> in your config block. dbt will use the merge or delete+insert strategy to update existing matching keys instead of creating duplicate records.


<br/>

### [2.2] dbt Snapshots (SCD Type 2)
*Track historical records changes over time automatically.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Snapshots</h3>
            <p> dbt Snapshots record the history of changes (SCD Type 2) on raw tables, adding columns like <code>dbt_valid_from</code>, <code>dbt_valid_to</code>, and <code>dbt_updated_at</code>.</p>

#### Interview Questions
**Q: What columns are added automatically to a Snapshot table by dbt?**

> A: dbt adds `dbt_scd_id`, `dbt_updated_at`, `dbt_valid_from`, and `dbt_valid_to` columns to track active and historical record time bounds.


<br/>

### [2.3] Seeds & Analyses
*Handle static reference lookups and test one-off SQL compiles.*

**Duration:** 🕒 12 min read | **Difficulty:** Beginner

#### Theory
<h3>Seeds & Analyses</h3>
            <p>Seeds are CSV files stored inside <code>seeds/</code> compiled into database tables. Analyses are compiled SQL files inside <code>analyses/</code> that do not create database objects.</p>

#### Interview Questions
**Q: When should you use dbt Seeds?**

> A: Only for small, static lookup datasets (like country code mappings) committed to version control Git. Do not use seeds for raw transaction tables.


<br/>

### [2.4] Model Contracts & DB Constraints
*Schema enforcement, column typing, and enforcing data constraints.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>dbt Model Contracts</h3>
            <p>A Model Contract is a new feature in dbt that enforces that your model's database outputs match an exact structure defined in your YAML file. If the compiled SQL does not match the contract (e.g. data types differ or column counts do not align), the build fails before writing to the database.</p>
            <pre><code>models:
  - name: my_model
    config:
      contract:
        enforced: true
    columns:
      - name: user_id
        data_type: integer
        constraints:
          - type: not_null
          - type: primary_key</code></pre>
            <h3>Database Constraints</h3>
            <p>Enforcing a contract lets dbt apply constraints directly on your target database tables (e.g. 'primary_key', 'foreign_key', 'not_null', and 'check').</p>

#### Interview Questions
**Q: What is a Model Contract and how does it prevent schema changes?**

> A: A Model Contract is a configuration where you explicitly define columns and data types in a schema YAML. If developer changes the SQL model and compiles a query with different columns or types, dbt aborts the run before the table is written, ensuring data schema safety.

**Q: Can dbt enforce primary keys on databases that don't support constraints (like Snowflake)?**

> A: Snowflake doesn't enforce primary key constraints (it permits duplicate values). However, defining constraints in dbt contracts helps downstream tools read table relationships and assists BI indexes.


<br/>

### [2.5] dbt Unit Testing
*Writing model unit tests using mock fixture data and expected outputs.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Unit Testing in dbt</h3>
            <p>Unit tests let you validate your SQL transformations using static, mock inputs (fixture data) before running the model against live warehouse tables. This ensures your math, logic, and data mappings function exactly as designed.</p>
            <p>You define mock values and expected output rows in a YAML file inside the 'tests/' directory:</p>
            <pre><code>unit_tests:
  - name: test_calculate_sales
    model: calculate_sales
    given:
      - input: ref('stg_orders')
        rows:
          - {order_id: 1, price: 10, discount: 2}
    expect:
      rows:
        - {order_id: 1, net_sales: 8}</code></pre>
            <p>dbt compiles the model, feeds it the mock inputs, and matches the outputs against the expected rows.</p>

#### Interview Questions
**Q: What is a dbt Unit Test and how does it differ from a standard dbt Data Test?**

> A: A standard Data Test checks the live tables in the warehouse for anomalies. A Unit Test validates the SQL query logic itself using static mock data rows inside a config file, checking if inputs translate to correct outputs without reading live database tables.

**Q: How do you set up mock data for unit tests?**

> A: Configure the test inside a YAML file, declaring inputs using the `given` property (referencing source tables or models) and inputting key-value rows matching column parameters.


<br/>

## Stage 3: Templating & Lifecycle

### [3.1] Jinja & Macros
*Write dynamic, reusable SQL operations and schema naming overrides.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Jinja & Macros</h3>
            <p>Jinja is a templating engine for writing loops and conditionals. Macros are reusable blocks of SQL functions configured in the <code>macros/</code> directory.</p>

#### Interview Questions
**Q: What is a Macro in dbt?**

> A: A Macro is a block of reusable SQL logic parameterized using Jinja. It acts like a function, letting you write DRY (Don't Repeat Yourself) code.


<br/>

### [3.2] Pre & Post Run Hooks
*Execute custom SQL commands during startup, finish, and run cycles.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>dbt Hooks</h3>
            <p>Hooks run SQL commands at specific model phases: <code>pre-hook</code> (before a model builds), <code>post-hook</code> (after a model builds), <code>on-run-start</code> (at the start of a run), and <code>on-run-end</code> (at the end of a run).</p>

#### Interview Questions
**Q: How do you configure a post-hook to grant SELECT access?**

> A: Add it globally in `dbt_project.yml`: <code>+post-hook: "grant select on {{ this }} to role analyst_role;"</code>.


<br/>

### [3.3] dbt Packages & Hub Manager
*Importing libraries: dbt-utils, dbt-expectations, codegen, and audit-helper.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Package Management</h3>
            <p>dbt allows importing external libraries from the dbt Hub Registry. You declare package dependencies in a <code>packages.yml</code> file:</p>
            <pre><code>packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.0
  - package: calogica/dbt_expectations
    version: 0.8.0</code></pre>
            <p>Running <code>dbt deps</code> downloads these packages to your project folder.</p>
            <h3>Popular Packages</h3>
            <ul>
                <li><strong>dbt_utils:</strong> Standard utility macros (like surrogate keys generating, pivoting, unioning).</li>
                <li><strong>dbt_expectations:</strong> Port of Python Great Expectations tests for advanced data testing.</li>
                <li><strong>codegen:</strong> Macros to automatically write staging model files and schemas, saving hours of manual coding.</li>
                <li><strong>audit_helper:</strong> Runs outer joins comparing development model tables with production tables to check migration issues.</li>
            </ul>

#### Interview Questions
**Q: What package would you use to check row values against standard data distributions or regex patterns?**

> A: The <code>dbt_expectations</code> package, which contains advanced assertions like regex matches and standard deviation threshold tests.

**Q: How do you install third-party packages in dbt?**

> A: List the packages and versions inside a <code>packages.yml</code> configuration file, then execute the command <code>dbt deps</code> in the terminal.


<br/>

### [3.4] dbt Python Models
*Mixed SQL/Python DAGs, DataFrame transformations, and Snowpark.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Python Models in dbt</h3>
            <p>Data science tasks or complex string cleanups can be difficult in SQL. dbt allows you to write models in **Python** (for Snowflake, Databricks, or BigQuery). Python models return a DataFrame which dbt materializes as a table/view:</p>
            <pre><code>def model(dbt, session):
    dbt.config(materialized="table")
    my_sql_model = dbt.ref("stg_orders")
    
    # Python DataFrame operations
    df = my_sql_model.filter(my_sql_model["price"] > 100)
    return df</code></pre>
            <p>This allows mixed pipelines where SQL models load staging layers, and Python models calculate statistical scores or train ML models.</p>

#### Interview Questions
**Q: How does a Python model execute in a Snowflake environment?**

> A: dbt compiles the Python function and executes it inside Snowflake using **Snowpark Python UDFs/Stored Procedures**, running on the virtual warehouse compute nodes without moving data.

**Q: Can Python models reference SQL models in dbt?**

> A: Yes. You import parent SQL models in Python using the standard <code>dbt.ref('model_name')</code> method, which dbt compiles into dataframes.


<br/>

## Stage 4: Enterprise Ops & CI/CD

### [4.1] dbt Semantic Layer & MetricFlow
*Defining measures, metrics, dimensions, and semantic access models.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>What is the Semantic Layer?</h3>
            <p>Previously, BI tools defined business metrics (like 'revenue' or 'churn') separately, causing calculation inconsistencies. The **dbt Semantic Layer** (using **MetricFlow**) lets you define metrics in dbt configuration files. BI tools query these metrics via APIs, ensuring everyone uses the same math.</p>
            <h3>Semantic Components</h3>
            <ul>
                <li><strong>Measure:</strong> Core numerical metrics (e.g. sum of order totals, count of customer IDs).</li>
                <li><strong>Dimension:</strong> Categorical attributes (e.g. order date, customer country).</li>
                <li><strong>Metric:</strong> The final calculated KPI, combining measures over dimensions (e.g., Average Order Value).</li>
            </ul>

#### Interview Questions
**Q: What is the purpose of the dbt Semantic Layer?**

> A: To centralize the definition of business metrics (like monthly recurring revenue) in dbt repository code, allowing BI dashboards to consume identical calculations dynamically.

**Q: What is the difference between a Measure and a Metric in MetricFlow?**

> A: A Measure is an aggregation input directly from database columns (like SUM of sales). A Metric is the final business KPI defined on top of one or more measures (like Gross Profit Margin).


<br/>

### [4.2] dbt State Artifacts & Slim CI
*Manifest, catalog, run_results, and sources metadata schemas.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>State Artifact Files</h3>
            <p>Every time you run or compile, dbt generates JSON artifacts inside target/:</p>
            <ul>
                <li><strong>manifest.json:</strong> The full DAG configuration metadata.</li>
                <li><strong>catalog.json:</strong> Database table schemas, sizes, and column metadata.</li>
                <li><strong>run_results.json:</strong> Statistics of the previous execution run (duration, query IDs).</li>
                <li><strong>sources.json:</strong> Freshness checks execution details.</li>
            </ul>
            <h3>Slim CI Implementation</h3>
            <p>Slim CI compares local feature branch changes against production's <code>manifest.json</code>. You run: </p>
            <p><code>dbt run --select state:modified+ --state path/to/prod</code></p>
            <p>This runs only the modified models, avoiding full database rebuilds during PR checks.</p>

#### Interview Questions
**Q: What artifacts are required to run a dbt Slim CI state check?**

> A: You need the <code>manifest.json</code> artifact from the previous successful production build. dbt uses it as a benchmark to identify code differences.


<br/>

### [4.3] Orchestration & Performance Tuning
*Thread tuning, partial parsing, Airflow, Dagster, and Prefect.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Performance Tuning dbt Runs</h3><ul><li><strong>Threads:</strong> Configure threads (concurrency) in 'profiles.yml' (e.g. threads=8). This dictates how many tables dbt can compile and build simultaneously in the warehouse.</li><li><strong>Partial Parsing:</strong> Enabling partial parsing compiles only changed files, skipping unchanged configurations, reducing local CPU start delays.</li></ul><h3>Orchestration Frameworks</h3><p>In production pipelines, dbt is triggered by orchestrators:</p><ul><li><strong>Airflow:</strong> Executes dbt CLI commands via bash tasks or Cosmos operators.</li><li><strong>Dagster:</strong> Native integration that reads the dbt manifest and schedules models as individual assets.</li></ul>

#### Interview Questions
**Q: How do you choose the correct thread count for a dbt project?**

> A: It depends on database size and concurrency limits. A standard range is 4-16 threads. If set too high, you run into query concurrency queueing in your data warehouse. If too low, compile times will increase.

**Q: Why is Dagster popular for orchestrating dbt compared to standard Airflow?**

> A: Dagster parses the 'manifest.json' file and treats each model as an independent, observable software asset, allowing metadata and test checks to be managed individually rather than running dbt as a single opaque block.


<br/>

### [4.4] dbt Exposures
*Document and track downstream consumers of your dbt models in dashboards and ML pipelines.*

**Duration:** 🕒 10 min read | **Difficulty:** Intermediate

#### Theory
<h3>What are Exposures?</h3>
            <p><strong>Exposures</strong> are dbt metadata objects that document the downstream consumers of your models — BI dashboards, ML models, APIs, and other data products. They create a complete lineage picture showing not just how raw data becomes models, but how models are consumed externally.</p>
            <pre><code>-- exposures.yml
exposures:
  - name: weekly_sales_dashboard
    type: dashboard
    maturity: high
    url: https://metabase.company.com/dashboard/12
    description: |
      Tracks weekly revenue by region.
      Used by the Sales leadership team every Monday.
    owner:
      name: Priyanshu Kadia
      email: priyanshu@company.com
    depends_on:
      - ref('fct_sales')
      - ref('dim_customers')</code></pre>
            <h3>Why Exposures Matter</h3>
            <ul>
                <li><strong>Impact analysis:</strong> When you modify a source model, dbt can show which downstream dashboards and ML pipelines depend on it, helping you assess risk before deploying.</li>
                <li><strong>Documentation:</strong> Exposures appear in dbt Docs as nodes in the DAG, showing the full data lineage from raw sources through models to business outputs.</li>
                <li><strong>Team ownership:</strong> Each exposure has an owner field, making it clear who to notify when upstream models change.</li>
                <li><strong>Freshness SLAs:</strong> You can specify a maturity level (low/medium/high) to indicate business criticality and set expectations for data freshness.</li>
            </ul>
            <h3>Exposure Types</h3>
            <p>dbt supports the following exposure types: <code>dashboard</code>, <code>notebook</code>, <code>analysis</code>, <code>ml</code>, <code>application</code>. The type is metadata-only and does not change dbt's build behavior.</p>

#### Interview Questions
**Q: What problem do dbt Exposures solve that model YAML alone cannot?**

> A: Model YAML documents the model itself but not its consumers. Exposures complete the lineage by documenting which dashboards, ML models, and applications depend on each dbt model. Without Exposures, you cannot perform impact analysis — you don't know which business outputs break when you modify a model.

**Q: How do you use Exposures for impact analysis in practice?**

> A: Run 'dbt ls --select +exposure:my_exposure_name' to list all models that the exposure depends on. If you are modifying 'fct_sales', run 'dbt ls --select fct_sales+' to see all downstream models and exposures that reference it, allowing you to assess blast radius before deploying.


<br/>

### [4.5] dbt Cloud vs. dbt Core
*Understand the key differences and when to use each deployment model.*

**Duration:** 🕒 12 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>dbt Core</h3>
            <p><strong>dbt Core</strong> is the open-source Python library installed via pip. It compiles and runs dbt projects from your local machine or CI/CD environment. It has no built-in UI, scheduler, or cloud state management.</p>
            <pre><code>pip install dbt-snowflake
dbt run --profiles-dir ~/.dbt
dbt test
dbt docs generate</code></pre>
            <h3>dbt Cloud</h3>
            <p><strong>dbt Cloud</strong> is the managed SaaS platform from dbt Labs that wraps dbt Core with a web IDE, job scheduler, environment management, audit logs, SSO, and the Semantic Layer API.</p>
            <h3>Key Differences</h3>
            <ul>
                <li><strong>Scheduler:</strong> dbt Core has none — you need Airflow, Dagster, or a cron job. dbt Cloud has a built-in job scheduler with cron support and run history.</li>
                <li><strong>IDE:</strong> dbt Core uses any text editor. dbt Cloud has a browser-based IDE with SQL preview, lineage explorer, and git integration.</li>
                <li><strong>Environments:</strong> dbt Core manages environments via profiles.yml manually. dbt Cloud manages development, staging, and production environments with isolated credentials.</li>
                <li><strong>CI/CD:</strong> dbt Core integrates with GitHub Actions / Azure DevOps manually. dbt Cloud has native Slim CI (runs only changed models using state comparison).</li>
                <li><strong>Semantic Layer:</strong> The dbt Semantic Layer (MetricFlow) API is only available in dbt Cloud paid tiers for external BI tool consumption.</li>
                <li><strong>Cost:</strong> dbt Core is free. dbt Cloud ranges from free (Developer tier, 1 seat) to Enterprise pricing.</li>
            </ul>

#### Interview Questions
**Q: When would you choose dbt Core over dbt Cloud in production?**

> A: Choose dbt Core when your organization uses Airflow or Dagster for orchestration (avoiding dual schedulers), when cost is a constraint on large teams, or when you need full control over environment configuration. dbt Cloud is better when you want a unified platform with a built-in scheduler, web IDE, and Slim CI without managing external orchestration infrastructure.

**Q: What is dbt Slim CI and how does it reduce build times?**

> A: Slim CI uses dbt's state comparison feature to run only models that have changed since the last successful production run. By comparing the current project against the production manifest.json artifact, dbt identifies modified models and their downstream dependencies, skipping unchanged models entirely. This can reduce CI runtime from 60 minutes to under 5 minutes for large projects.


<br/>

### [4.6] dbt Semantic Layer & Consumption Tools
*Define metrics once in dbt and query them from any BI or analytics tool.*

**Duration:** 🕒 12 min read | **Difficulty:** Advanced

#### Theory
<h3>The Semantic Layer Problem</h3>
            <p>Without a semantic layer, every BI tool, notebook, and API independently defines the same metric (e.g. 'revenue') with slightly different SQL logic, causing inconsistent numbers across reports. The <strong>dbt Semantic Layer</strong> solves this by defining metrics centrally in dbt and exposing them through a single querying API.</p>
            <h3>MetricFlow</h3>
            <p><strong>MetricFlow</strong> is the underlying engine powering the dbt Semantic Layer. You define metrics, measures, entities, and dimensions in YAML, and MetricFlow compiles them into optimized SQL at query time.</p>
            <pre><code>-- metrics.yml
metrics:
  - name: total_revenue
    label: Total Revenue
    description: Gross revenue before refunds
    type: simple
    type_params:
      measure: revenue_amount
    filter: |
      {{ Dimension('order__status') }} = 'completed'</code></pre>
            <h3>Consumption Interfaces</h3>
            <ul>
                <li><strong>dbt Cloud Semantic Layer API:</strong> GraphQL and JDBC endpoints that BI tools query directly.</li>
                <li><strong>Native BI integrations:</strong> Tableau, Looker, Power BI, and Hex can connect natively via the Semantic Layer API, fetching metrics without raw SQL.</li>
                <li><strong>Python SDK:</strong> Data scientists query metrics in Jupyter notebooks using the dbt-sl-sdk package.</li>
                <li><strong>dbt CLI:</strong> 'dbt sl query --metrics total_revenue --group-by metric_time__month' for ad-hoc metric queries.</li>
            </ul>
            <h3>Key Benefits</h3>
            <ul>
                <li>Single source of truth for metric definitions — change once in dbt, reflects everywhere.</li>
                <li>Business users query metrics without writing SQL — BI tools fetch pre-defined dimensions and measures.</li>
                <li>Governance: metric definitions are version-controlled in Git alongside the models that power them.</li>
            </ul>

#### Interview Questions
**Q: What is the core problem the dbt Semantic Layer solves?**

> A: It eliminates metric inconsistency caused by each BI tool defining the same business metric independently with different SQL logic. By centralizing metric definitions in dbt using MetricFlow, all downstream tools (Tableau, Looker, Python notebooks) query the same pre-defined metric logic through a single API, ensuring every report shows the same number.

**Q: What is the difference between a Measure and a Metric in dbt MetricFlow?**

> A: A Measure is a raw aggregation defined on a semantic model (e.g. SUM(revenue_amount)). A Metric is a higher-level business concept built on top of measures, optionally with filters, ratios, or cumulative windows applied. Multiple metrics can reference the same underlying measure with different filters or time grains.


<br/>

---

# Domain: SQL Masterclass

## Stage 1: Core SQL Mechanics

### [1.1] Logical Query Execution Order
*How database engines actually parse SQL queries vs. how they are written.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Written Order vs. Execution Order</h3>
            <p>We write SQL queries starting with <code>SELECT</code>, but database engines process SELECT nearly last. Understanding the execution order is the single most important skill for debugging and query optimization.</p>
            <h3>Logical Execution Sequence</h3>
            <ol>
                <li><strong>FROM:</strong> Identifies the source tables and gathers the initial dataset rows.</li>
                <li><strong>ON:</strong> Evaluates join conditions.</li>
                <li><strong>JOIN:</strong> Performs table joins (Left, Inner, etc.), creating a temporary joined set.</li>
                <li><strong>WHERE:</strong> Filters raw rows based on conditional checks. (Window functions are blocked here!).</li>
                <li><strong>GROUP BY:</strong> Groups rows sharing common values.</li>
                <li><strong>HAVING:</strong> Filters grouped categories (e.g. <code>HAVING SUM(sales) > 100</code>).</li>
                <li><strong>SELECT:</strong> Selects columns, evaluates expressions, and computes Window Functions.</li>
                <li><strong>DISTINCT:</strong> Deduplicates values.</li>
                <li><strong>ORDER BY:</strong> Sorts rows (high processing cost).</li>
                <li><strong>LIMIT / OFFSET:</strong> Restricts the number of output rows returned.</li>
            </ol>

#### Interview Questions
**Q: Why can't you reference an alias created in the SELECT clause inside the WHERE clause?**

> A: Because the <code>WHERE</code> clause is executed *before* the <code>SELECT</code> clause. When the engine filters rows in the WHERE step, the columns specified in SELECT (and their aliases) have not yet been evaluated or created.

**Q: Can you use window functions (like ROW_NUMBER()) inside a WHERE clause? Why or why not?**

> A: No. Window functions are evaluated in the <code>SELECT</code> step, which executes *after* the <code>WHERE</code> step. To filter based on a window function, you must wrap the query in a subquery or CTE, or use Snowflake's <code>QUALIFY</code> clause.


<br/>

### [1.2] Joins Internals & NULL Handling
*Inner, Outer, Cross, and Self Joins, and the danger of NULL comparisons.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Join Operations</h3>
            <ul>
                <li><strong>INNER JOIN:</strong> Returns rows when there is a match in both tables.</li>
                <li><strong>LEFT JOIN:</strong> Returns all rows from the left table, and matching rows from the right table. Unmatched right rows return NULL.</li>
                <li><strong>FULL OUTER JOIN:</strong> Returns all rows when there is a match in either table.</li>
                <li><strong>CROSS JOIN:</strong> Cartesian product (multiplies every row of table A by every row of table B).</li>
                <li><strong>SELF JOIN:</strong> Joining a table to itself (e.g., matching employees to managers).</li>
            </ul>
            <h3>The Danger of NULL comparisons</h3>
            <p>In SQL, <code>NULL</code> represents 'unknown value'. Comparing any value to NULL using standard operators (<code>=</code>, <code>!=</code>) always evaluates to **UNKNOWN** (effectively False). You must use <code>IS NULL</code> or <code>IS NOT NULL</code>.</p>

#### Interview Questions
**Q: What happens if you run a LEFT JOIN and place a filter on the right table inside the WHERE clause?**

> A: It implicitly converts the LEFT JOIN into an INNER JOIN. Because the WHERE clause runs after the JOIN, filtering for non-NULL values on the right table drops all unmatched rows that returned NULL.

**Q: Why does 'WHERE column = NULL' return 0 rows in SQL?**

> A: Because NULL represents an unknown state, not a value. Any direct comparison to NULL (using <code>=</code> or <code>!=</code>) yields UNKNOWN, which fails the filter check. You must write <code>WHERE column IS NULL</code>.


<br/>

### [1.3] Aggregations & Grouping Sets
*Master GROUPING SETS, CUBE, and ROLLUP for multidimensional analysis.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Multidimensional Grouping</h3>
            <p>In analytical SQL, summarizing metrics across varying dimension hierarchies usually requires multiple GROUP BY queries combined with UNION ALL. Advanced SQL provides three operators to execute this in a single query:</p>
            <ul>
                <li><strong>GROUPING SETS:</strong> Explicitly defines which group combinations to calculate (e.g. group by region, group by year, and overall).</li>
                <li><strong>ROLLUP:</strong> Calculates hierarchical aggregates (e.g. Grouping by Country, State, and City, rolling up totals at each level).</li>
                <li><strong>CUBE:</strong> Calculates every possible combination of selected dimensions (e.g. if grouping by 3 columns, it outputs 8 different aggregation sets).</li>
            </ul>

#### Interview Questions
**Q: What is the difference between ROLLUP and CUBE?**

> A: ROLLUP generates hierarchical, ordered groupings (e.g. Year -> Month -> Day). CUBE generates all possible mathematical permutations of the columns, calculating aggregates across all dimension angles.


<br/>

### [1.4] Window Functions & Analytics
*ROW_NUMBER, RANK, DENSE_RANK, LAG, and LEAD patterns.*

**Duration:** 🕒 18 min read | **Difficulty:** Intermediate

#### Theory
<h3>Window Functions</h3>
            <p>Window functions perform calculations across a set of table rows related to the current row, without collapsing the rows into a single output group (unlike GROUP BY).</p>
            <h3>Key Functions</h3>
            <ul>
                <li><code>ROW_NUMBER()</code>: Assigns a unique sequential integer starting at 1.</li>
                <li><code>RANK()</code>: Assigns sequential values, but duplicate values receive the same rank. Skips rank numbers after ties.</li>
                <li><code>DENSE_RANK()</code>: Same as RANK, but does not skip rank numbers after ties (e.g., 1, 2, 2, 3).</li>
                <li><code>LAG() / LEAD()</code>: Fetches column values from preceding (LAG) or succeeding (LEAD) rows in the partition.</li>
            </ul>

#### Interview Questions
**Q: Explain the difference between RANK() and DENSE_RANK() with an example.**

> A: RANK leaves gaps in the sequence if there are ties. For values [100, 100, 80], RANK returns [1, 1, 3]. DENSE_RANK does not leave gaps, returning [1, 1, 2].

**Q: How do you calculate month-over-month sales growth using window functions?**

> A: Use the **LAG()** function to fetch the previous month's sales: <code>SELECT sales - LAG(sales, 1) OVER (ORDER BY order_month) AS mom_growth FROM monthly_sales;</code>.


<br/>

### [1.5] CTEs, Subqueries & Recursion
*Correlated subqueries, Common Table Expressions, and recursive tree traversal.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>SQL Structures</h3>
            <ul>
                <li><strong>Subquery:</strong> A query nested inside another query (e.g., in WHERE or FROM).
                    <ul>
                        <li><em>Correlated:</em> References columns from the parent outer query. Runs once for every candidate row (can be slow).</li>
                    </ul>
                </li>
                <li><strong>CTE (Common Table Expression):</strong> Defined using the <code>WITH</code> statement. It improves query readability and serves as a temporary named view.</li>
            </ul>
            <h3>Recursive CTEs</h3>
            <p>Used to query hierarchical tree structures (like manager-employee org charts). It features an **Anchor Query** (the starting node) unioned with a **Recursive Query** that references the CTE itself until no more children are found.</p>

#### Interview Questions
**Q: What is a Correlated Subquery and why can it perform poorly?**

> A: A correlated subquery references columns from the outer query in its WHERE clause. The database engine must re-evaluate the subquery for every single candidate row processed by the outer query, causing high O(N^2) execution times.

**Q: Write the basic structure of a Recursive CTE to traverse an org hierarchy.**

> A: <code>WITH RECURSIVE org AS ( <br>&nbsp;&nbsp;SELECT emp_id, manager_id FROM employees WHERE manager_id IS NULL -- Anchor<br>&nbsp;&nbsp;UNION ALL<br>&nbsp;&nbsp;SELECT e.emp_id, e.manager_id FROM employees e JOIN org o ON e.manager_id = o.emp_id -- Recursion<br>) SELECT * FROM org;</code>


<br/>

## Stage 2: Advanced SQL Optimization

### [2.1] Query Tuning, Plans & Indexing
*B-Tree vs. Clustered indexes, scan vs. seek, and predicate pushdown.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>Database Indexing</h3>
            <p>Traditional transactional databases (like PostgreSQL, SQL Server) rely on physical indices to speed up queries:</p>
            <ul>
                <li><strong>Clustered Index:</strong> Dictates the physical sort order of the table rows on disk. Only one per table.</li>
                <li><strong>Non-Clustered Index:</strong> A separate index structure containing key-pointer pairs pointing back to the physical rows.</li>
            </ul>
            <h3>Execution Operators</h3>
            <ul>
                <li><strong>Index Seek:</strong> Directly navigates the index tree to locate matching keys (very fast, O(log N)).</li>
                <li><strong>Index Scan:</strong> Scans the entire index file because the query filter key is not selective enough (slower).</li>
                <li><strong>Table Scan:</strong> Scans every single row in the database table (slowest, O(N)).</li>
            </ul>

#### Interview Questions
**Q: What is the difference between an Index Scan and an Index Seek in an execution plan?**

> A: An Index Seek navigates the index B-Tree directly using search keys to find exact records. An Index Scan traverses the entire index leaf node space, which occurs when filters are missing or columns are not indexed selectively.

**Q: How do you identify why a query is slow using an EXPLAIN plan?**

> A: Inspect the execution path. Look for 'Table Scan' or 'Seq Scan' on large tables, check if the engine is using nested loop joins on large sets, and check for high cost estimate percentages.


<br/>

### [2.2] Set Operations & Subquery Filters
*UNION vs. UNION ALL, EXCEPT, and EXISTS vs. IN optimizations.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Set Operations</h3>
            <ul>
                <li><strong>UNION ALL:</strong> Concatenates two datasets. Very fast because it does not check for duplicate rows.</li>
                <li><strong>UNION:</strong> Concatenates datasets and removes duplicates. Slower because it triggers a sort/hash check to drop duplicates.</li>
                <li><strong>EXCEPT / MINUS:</strong> Returns rows from query A that are missing in query B.</li>
                <li><strong>INTERSECT:</strong> Returns rows common to both queries.</li>
            </ul>
            <h3>EXISTS vs. IN</h3>
            <p><strong>IN:</strong> Usually compiles to a join, but loads the subquery list in memory. Best for small static lists.</p>
            <p><strong>EXISTS:</strong> Evaluates boolean presence. The database stops evaluating the subquery the moment it finds the first matching row (semi-join optimization). Best for large tables.</p>

#### Interview Questions
**Q: Why should you prefer UNION ALL over UNION in production pipelines?**

> A: UNION triggers an implicit deduplication check that requires sorting and filtering data in memory, which is resource-intensive. If you know the datasets have no duplicates or if duplicates are acceptable, UNION ALL executes much faster.

**Q: When is EXISTS more performant than IN?**

> A: EXISTS is faster when checking presence in a large subquery table. The database engine uses a semi-join and stops scanning the subquery table the moment it encounters the first matching row, rather than evaluating all records.


<br/>

### [2.3] DML Operations & Isolation Levels
*DELETE vs. TRUNCATE, and ACID transaction isolation properties.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>DELETE vs. TRUNCATE</h3>
            <ul>
                <li><strong>DELETE:</strong> DML command. Deletes specific rows using a WHERE filter. Logs every deleted row in transaction logs, enabling rollback. (Slower).</li>
                <li><strong>TRUNCATE:</strong> DDL command. Drops the entire table space and metadata pointers. Cannot filter rows. Logs only the partition page deallocation (cannot be rolled back in most databases). (Instantaneous).</li>
            </ul>
            <h3>ACID Isolation Levels</h3>
            <p>Isolation prevents concurrent transactions from corrupting data. Standards include:</p>
            <ul>
                <li><strong>Read Committed:</strong> A transaction only reads committed changes. Prevents Dirty Reads, but allows Non-Repeatable Reads.</li>
                <li><strong>Serializable:</strong> Complete isolation. Transactions execute as if they ran sequentially. Prevents all anomalies but can cause high locks and rollback failures.</li>
            </ul>

#### Interview Questions
**Q: What is the difference between DELETE and TRUNCATE?**

> A: DELETE is a DML statement that removes rows conditionally, logging each row removal (slower, rollable). TRUNCATE is a DDL statement that deallocates the table's disk pages directly (instant, non-conditional, non-rollable in transactional logs).

**Q: What is a Dirty Read in database transactions?**

> A: A Dirty Read occurs when Transaction A reads data modified by Transaction B before Transaction B has committed those changes. If Transaction B rolls back, the data read by Transaction A is invalid.


<br/>

### [2.4] Sliding Window Frames
*Advanced partition frame options: ROWS vs. RANGE BETWEEN.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Window Frame Specifications</h3>
            <p>Within a partition, you can specify exactly which rows to include in the window calculation relative to the current row:</p>
            <ul>
                <li><strong>ROWS BETWEEN:</strong> Measures physical row offsets (e.g. <code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code>).</li>
                <li><strong>RANGE BETWEEN:</strong> Measures logical value offsets (e.g. date boundaries). If sorting by date, it aggregates rows matching a date range rather than physical row counts.</li>
            </ul>
            <p>Default frame is <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, which can cause performance overheads.</p>

#### Interview Questions
**Q: What is the difference between ROWS and RANGE in a window frame?**

> A: ROWS defines the frame based on physical offsets from the current row (e.g., 3 rows back). RANGE defines the frame logically based on values in the sorted column (e.g., values matching within 3 days).

**Q: Write a query to calculate a 7-day rolling average of sales.**

> A: <code>SELECT date, sales, AVG(sales) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_avg FROM daily_sales;</code>


<br/>

### [2.5] UDFs vs. Stored Procedures
*Differentiate return schemas, execution scope, and automation.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Database Programmatics</h3>
            <ul>
                <li><strong>User Defined Function (UDF):</strong> Designed to calculate and return values. Must return a value (scalar or table). Can be used directly inside SELECT statements. Cannot perform DML or database alterations.</li>
                <li><strong>Stored Procedure:</strong> Designed to execute administrative operations. Can run DML (inserts, drops, updates). Cannot be called inside a SELECT; must be executed using 'CALL' statements.</li>
            </ul>

#### Interview Questions
**Q: When should you write a Stored Procedure instead of a User Defined Function?**

> A: Use Stored Procedures when executing administrative tasks or multi-step DML pipelines (like dropping schemas, running copy operations, or executing dynamic SQL strings). Use UDFs for row-level transformations that must run inside SELECT statements.


<br/>

---

# Domain: Python Prep

## Stage 1: Core Python & Engineering

### [1.1] Python Data Structures & Memory
*Lists, Tuples, Sets, Dictionaries, and list comprehensions.*

**Duration:** 🕒 12 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>Built-in Data Structures</h3>
            <ul>
                <li><strong>List:</strong> Ordered, mutable, allows duplicate items. <code>[1, 2, 2]</code>.</li>
                <li><strong>Tuple:</strong> Ordered, immutable, allows duplicates. <code>(1, 2, 2)</code>. Used for read-only static configs (saves memory).</li>
                <li><strong>Set:</strong> Unordered, mutable, unique elements only. <code>{1, 2}</code>. Hash-table lookup (extremely fast lookup times, O(1)).</li>
                <li><strong>Dictionary:</strong> Key-value mapping. Keys must be immutable and hashable.</li>
            </ul>
            <h3>List Comprehensions</h3>
            <p>An elegant way to create lists from iterable objects in a single line. It executes faster than standard for-loops by utilizing optimized C-level iterations:</p>
            <p><code>squares = [x**2 for x in range(10) if x % 2 == 0]</code></p>

#### Interview Questions
**Q: Why is searching inside a Set faster than searching inside a List?**

> A: A Set is implemented as a hash table. Checking presence (<code>item in my_set</code>) takes constant O(1) time because the item's hash directly calculates its index. Lists require a linear scan of elements, taking O(N) time.

**Q: What is the difference between a List and a Tuple in Python?**

> A: Lists are mutable (you can append/edit values) and have a larger memory overhead. Tuples are immutable (cannot be changed after creation), making them memory-efficient and suitable for key-value dictionary keys.


<br/>

### [1.2] OOP, Generators & Decorators
*Classes, lambda maps, yield generators, and custom decorators.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Functional Python & Iterators</h3>
            <ul>
                <li><strong>Lambda Functions:</strong> Anonymous single-line functions: <code>add = lambda x, y: x + y</code>.</li>
                <li><strong>Generators (yield):</strong> Functions that return an iterator using the <code>yield</code> keyword instead of returning a list. They evaluate items one-by-one on demand, saving massive RAM when processing large files (Lazy Evaluation).</li>
                <li><strong>Decorators:</strong> Functions that wrap another function to modify its behavior (e.g. adding logging or execution time measurements) without changing its code.</li>
            </ul>

#### Interview Questions
**Q: What are Python Generators and when should you use them in data pipelines?**

> A: Generators are functions that produce items on the fly using the `yield` keyword. You should use them to stream and process massive data files line-by-line, avoiding loading gigabytes of data into RAM at once.

**Q: Write a custom decorator that prints the execution time of a function.**

> A: <code>import time<br>def time_it(func):<br>&nbsp;&nbsp;def wrapper(*args, **kwargs):<br>&nbsp;&nbsp;&nbsp;&nbsp;start = time.time()<br>&nbsp;&nbsp;&nbsp;&nbsp;result = func(*args, **kwargs)<br>&nbsp;&nbsp;&nbsp;&nbsp;print(f'Duration: {time.time() - start}')<br>&nbsp;&nbsp;&nbsp;&nbsp;return result<br>&nbsp;&nbsp;return wrapper</code>


<br/>

### [1.3] File Handling & Formats
*Read/write CSV, JSON, and Parquet formats efficiently.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>File I/O in Python</h3>
            <p>Always use the **Context Manager** (<code>with</code> statement) when opening files. This ensures the file stream is closed automatically when the block finishes, even if exceptions occur, preventing file system locks.</p>
            <h3>Handling Binary & Columns</h3>
            <ul>
                <li><strong>JSON / CSV:</strong> Row-based text formats. Standard libraries: <code>json</code>, <code>csv</code>.</li>
                <li><strong>Parquet:</strong> Columnar, compressed binary format. Parsed efficiently using <code>pyarrow</code> or <code>pandas</code>. Keeps column schemas internally.</li>
            </ul>

#### Interview Questions
**Q: Why is utilizing the 'with open()' syntax preferred when reading files?**

> A: The `with` statement acts as a Context Manager. It handles opening and guarantees the closing of the file stream immediately when the code block terminates, even if error events occur inside the block.


<br/>

### [1.4] Exception Handling & Logging
*Try-except blocks, custom exceptions, and structured logs.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Robust Error Handling</h3>
            <p>Avoid bare except catches. Catch specific exceptions (like <code>FileNotFoundError</code>, <code>ValueError</code>) so you don't mask bugs.</p>
            <h3>Structured Logging</h3>
            <p>In production pipelines, use Python's built-in <code>logging</code> library instead of simple print statements. Set the root logger configuration level (DEBUG, INFO, WARNING, ERROR) and output format containing dates and severity levels.</p>

#### Interview Questions
**Q: Why should you never write a bare 'except:' clause?**

> A: A bare `except:` catches all exceptions, including KeyboardInterrupt (Ctrl+C) and SystemExit, making it difficult to stop execution manually and hiding unintended coding errors.


<br/>

### [1.5] REST API Integration & requests
*Using requests, parsing JSON, and handling timeout parameters.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>API Integrations</h3>
            <p>Data engineers extract data from web endpoints using the <code>requests</code> package. When calling external APIs, always configure:
            <ul>
                <li><strong>Timeouts:</strong> Prevents pipelines from hanging indefinitely if an API server crashes (e.g. <code>requests.get(url, timeout=10)</code>).</li>
                <li><strong>HTTP Error Checks:</strong> Run <code>response.raise_for_status()</code> to raise exceptions on 4xx/5xx failures.</li>
            </ul>
            </p>

#### Interview Questions
**Q: How do you handle API retries when encountering 503 Service Unavailable errors?**

> A: Use the **urllib3.util.retry** class. Configure a HTTPAdapter with dynamic Retry parameters (like <code>backoff_factor=1</code>) and mount it to your requests Session, automating retries on select status codes.


<br/>

## Stage 2: Analytics & Scale (pandas/Spark)

### [2.1] pandas DataFrames Core
*DataFrames, Series, filtering, and checking null states.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>pandas Basics</h3>
            <ul>
                <li><strong>Series:</strong> A 1D labeled array capable of holding any data type.</li>
                <li><strong>DataFrame:</strong> A 2D labeled data structure with columns of potentially different types (similar to a SQL table).</li>
            </ul>
            <p>Use <code>df.isna().sum()</code> to count missing values across columns, and <code>df.loc[]</code> or <code>df.iloc[]</code> for row-level indexing and slicing operations.</p>

#### Interview Questions
**Q: What is the difference between loc and iloc in pandas?**

> A: <code>loc</code> performs selection based on label indexing (column/row names). <code>iloc</code> performs selection based on physical integer positions (0-indexed).


<br/>

### [2.2] pandas Aggregations & Memory Tuning
*GroupBy transformations, merging, and category type memory optimizations.*

**Duration:** 🕒 18 min read | **Difficulty:** Advanced

#### Theory
<h3>DataFrame Operations</h3>
            <ul>
                <li><strong>Aggregations:</strong> <code>df.groupby('col').agg({'val': 'sum'})</code></li>
                <li><strong>Joins:</strong> Use <code>pd.merge()</code> to run database-style joins (Inner, Left, etc.).</li>
            </ul>
            <h3>Memory Optimization</h3>
            <p>Standard pandas reads text columns as memory-heavy object strings. If a column has low cardinality (e.g. State, Category), convert it to <code>category</code> data type. This stores values as small integers internally, saving up to 80% RAM footprint.</p>

#### Interview Questions
**Q: How do you optimize memory consumption when loading large CSV datasets in pandas?**

> A: 1. Specify only required columns using the `usecols` parameter. 2. Define category types for string columns with low cardinality. 3. Downcast numerical integers using `pd.to_numeric()`.


<br/>

### [2.3] PySpark Core Architecture
*Driver vs. Worker nodes, lazy evaluation, and RDDs vs. DataFrames.*

**Duration:** 🕒 18 min read | **Difficulty:** Advanced

#### Theory
<h3>PySpark Architecture</h3>
            <p>Apache Spark is a distributed cluster computing framework. Key components:</p>
            <ul>
                <li><strong>Driver Node:</strong> The master node. Coordinates the execution, parses code, maintains the execution plan, and schedules tasks to executors.</li>
                <li><strong>Worker Nodes (Executors):</strong> The workhorse machines. They process task partitions assigned by the driver.</li>
            </ul>
            <h3>Lazy Evaluation</h3>
            <p>Spark does not execute transformations (like filtering or projections) immediately. It builds a **Logical Execution Graph (DAG)**. Operations are only compiled and executed when an **Action** (like <code>collect()</code>, <code>write()</code>, <code>count()</code>) is triggered, allowing the optimizer to plan efficiently.</p>

#### Interview Questions
**Q: What is Lazy Evaluation in Spark and how does it optimize queries?**

> A: Spark compiles operations (Transformations) into a logical DAG without executing them. Only when an Action is called does Spark evaluate the entire graph, optimizing join paths and pushing filters directly down to data scans, saving memory.

**Q: Describe Spark's Driver-Executor cluster structure.**

> A: The Driver acts as the orchestrator, managing resources, translating code into tasks, and planning execution. Executors are worker nodes that run the computational tasks on data partitions and report results back to the driver.


<br/>

### [2.4] PySpark Data Transformations
*Aggregations, analytical windowing, and broadcast joins in Spark.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>Spark Data Transformations</h3>
            <p>In PySpark, data operations are written using DataFrame APIs:</p>
            <ul>
                <li><strong>Groupings:</strong> <code>df.groupBy("region").agg(sum("sales").alias("total"))</code></li>
                <li><strong>Window Functions:</strong> Created using the <code>Window.partitionBy()</code> API wrapper.</li>
                <li><strong>Broadcast Joins:</strong> Replicates a small DataFrame to all executors, skipping network shuffles during join operations. Triggered using: <code>join(broadcast(small_df), "id")</code>.</li>
            </ul>

#### Interview Questions
**Q: How do you execute a Broadcast Join in PySpark and when is it useful?**

> A: Import the `broadcast` function: <code>df.join(broadcast(small_df), 'key')</code>. It is used when joining a large dataset with a small lookup table, saving network transfer costs by copying the small table to all nodes.


<br/>

### [2.5] Python Unit Testing & pytest
*Mocking external APIs, database handlers, and writing fixtures.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Unit Testing in Python</h3>
            <p>We validate python ETL jobs using testing frameworks like **pytest**.</p>
            <h3>Mocking & Fixtures</h3>
            <ul>
                <li><strong>Fixtures:</strong> Reusable setup functions that output test inputs (e.g. creating a temporary mock pandas DataFrame).</li>
                <li><strong>Mocking:</strong> Simulating external dependencies (like database handlers or HTTP client connections) using the <code>unittest.mock</code> library. This validates ETL logic without hitting live APIs or databases.</li>
            </ul>

#### Interview Questions
**Q: What is a Pytest Fixture and how is it used?**

> A: A Fixture is a decorator-annotated function that prepares a testing environment (e.g. launching a mock database container or mock dataframe) and feeds it to test cases as argument inputs, preventing redundant setup code.

**Q: Why should you mock database connections during unit tests?**

> A: Unit tests validate your code logic, not network performance. Mocking database handlers avoids making network calls, speeds up testing, and prevents test cases from modifying live database records.


<br/>

---

# Domain: Data Engineering Fundamentals

## Stage 1: Warehousing Design

### [1.1] Lakehouse, Data Lake & Warehouses
*Medallion Architecture (Bronze/Silver/Gold) and Kimball vs. Inmon design.*

**Duration:** 🕒 15 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>ETL / ELT Storage Architecture</h3>
            <ul>
                <li><strong>Data Lake:</strong> Storage repository holding raw, unstructured/semi-structured files. Highly scalable but lacks transaction controls.</li>
                <li><strong>Data Warehouse:</strong> Highly structured database optimized for fast SQL queries, requiring predefined schemas.</li>
                <li><strong>Lakehouse:</strong> Modern design merging the scalability of lakes with the ACID transactions and performance of warehouses (e.g. Delta Lake, Iceberg on S3).</li>
            </ul>
            <h3>The Medallion Architecture</h3>
            <ul>
                <li><strong>Bronze (Raw):</strong> Exact copy of raw source feeds. No cleanups.</li>
                <li><strong>Silver (Cleansed):</strong> Filtered, parsed, deduplicated, and conformed data.</li>
                <li><strong>Gold (Curated):</strong> Business-level dimensional models (Facts/Dims) ready for BI dashboards.</li>
            </ul>
            <h3>Kimball vs. Inmon</h3>
            <ul>
                <li><strong>Kimball (Bottom-Up):</strong> Denormalized Star Schema data marts built directly to support specific business processes. Faster to implement.</li>
                <li><strong>Inmon (Top-Down):</strong> Highly normalized (3NF) central enterprise data model. Data marts are built downstream from this warehouse. Highly structured but slow to build.</li>
            </ul>

#### Interview Questions
**Q: What is the Medallion Architecture and what is the goal of the Silver layer?**

> A: The Medallion Architecture is a data design pattern divided into Bronze (raw ingestion), Silver (cleansed/standardized data), and Gold (BI-ready facts/dimensions). The goal of Silver is to clean, deduplicate, and conform data so it acts as the clean integration layer.

**Q: Compare Kimball vs. Inmon warehousing design methodologies.**

> A: Kimball focuses on a bottom-up approach using denormalized Star Schemas (optimized for performance). Inmon uses a top-down, highly normalized 3NF central repository (optimized for data consistency and reducing duplicates) with downstream data marts.


<br/>

### [1.2] Star Schema vs. Snowflake Schema
*Fact tables, Dimension tables, and normalization trade-offs.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Dimensional Modeling Core</h3>
            <ul>
                <li><strong>Fact Tables:</strong> Contain the quantitative metrics/measures of a business process (e.g. <code>quantity_sold</code>, <code>amount</code>) and foreign keys linking to dimensions. Fact tables are tall and narrow.</li>
                <li><strong>Dimension Tables:</strong> Contain descriptive context of the business process (e.g. <code>customer_name</code>, <code>product_category</code>). Dimension tables are wide and short.</li>
            </ul>
            <h3>Schema Architectures</h3>
            <ul>
                <li><strong>Star Schema:</strong> Denormalized dimensions directly joined to the central fact table. Maximizes read performance by minimizing SQL JOINs.</li>
                <li><strong>Snowflake Schema:</strong> Normalized dimensions (dimensions join to secondary dimensions, e.g. Store joins to City which joins to State). Reduces data redundancy but increases SQL JOIN complexity.</li>
            </ul>

#### Interview Questions
**Q: Why do columnar databases (like Snowflake) prefer Star Schemas over Snowflake Schemas?**

> A: Star Schemas reduce the number of SQL JOINs required to execute queries. Columnar storage engines handle the redundant data in denormalized tables easily via compression algorithms, making normalization in dimension tables unnecessary.

**Q: What is the difference between a Fact table and a Dimension table?**

> A: Fact tables capture business transactions containing numerical measurements and keys. Dimension tables capture descriptive attributes (context) about the transaction (who, what, where, when).


<br/>

### [1.3] Slowly Changing Dimensions (SCD 0-6)
*Implement SCD Type 0, 1, 2, 3, 4, and 6 with real production examples.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>SCD Types Explained</h3>
            <p>Slowly Changing Dimensions handle historical updates on dimension attributes:</p>
            <ul>
                <li><strong>SCD Type 0 (Retain):</strong> Never updates. Values remain static (e.g., date of birth).</li>
                <li><strong>SCD Type 1 (Overwrite):</strong> Overwrites existing values. History is lost (e.g., correcting a typo in a name).</li>
                <li><strong>SCD Type 2 (Add Row):</strong> Adds a new row with validation dates (start_date, end_date, active_flag). Full history is preserved.</li>
                <li><strong>SCD Type 3 (Add Column):</strong> Adds a column to track current and previous value. Only tracks one level of history (e.g., <code>current_city</code> and <code>previous_city</code>).</li>
                <li><strong>SCD Type 4 (History Table):</strong> The dimension table is overwritten (Type 1), but changes are logged in a separate historical audit table.</li>
                <li><strong>SCD Type 6 (Hybrid):</strong> Combines Types 1, 2, and 3 (1 + 2 + 3 = 6). Adds rows to preserve history, but also adds a column to point to the current active value across all rows.</li>
            </ul>

#### Interview Questions
**Q: How do you implement an SCD Type 2 merge SQL statement?**

> A: Use a SQL MERGE statement that performs a union check. For modified source rows, it runs an UPDATE on the target table setting `is_active = FALSE` and `end_date = CURRENT_DATE()`, and an INSERT to write the new active row with `is_active = TRUE`.

**Q: What is SCD Type 6 and why would an enterprise use it?**

> A: SCD Type 6 is a hybrid approach. It inserts a new row to track history (Type 2) but adds a column to store the current active value (Type 3) on all historical rows. This lets users query historic stats easily without running date range joins.


<br/>

### [1.4] Special Dimensions & Bridge Tables
*Degenerate, Junk, Factless Facts, and Late Arriving Dimensions.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Advanced Dimensional Modeling</h3>
            <ul>
                <li><strong>Degenerate Dimension:</strong> A dimension attribute stored directly in the fact table without joining to a dimension table (e.g. invoice numbers, transaction IDs).</li>
                <li><strong>Junk Dimension:</strong> A single dimension table that groups multiple low-cardinality flags and indicators (like status = Y/N, payment_method = cash/credit) to keep the fact table narrow.</li>
                <li><strong>Factless Fact Table:</strong> A fact table that contains no numerical measurements, only foreign keys (e.g. student attendance tracking representing 'events' or relationships).</li>
                <li><strong>Bridge Table:</strong> Used to resolve many-to-many relationships between dimensions and facts (e.g. an order having multiple sales reps with split commissions).</li>
            </ul>

#### Interview Questions
**Q: What is a Late Arriving Dimension and how do you handle it?**

> A: A Late Arriving Dimension occurs when a transaction (Fact) arrives before the master detail record (Dimension). Handle this by inserting a placeholder dimension row with a dummy status and matching key. When the real master record arrives, update the dummy row using Type 1 rules.

**Q: What is a Junk Dimension and why is it used?**

> A: A Junk Dimension consolidates multiple small flags and indicator columns into a single lookup table. This prevents the fact table from holding dozens of separate flag keys, optimizing join paths and indexes.


<br/>

### [1.5] Data Vault 2.0
*Hubs, Links, and Satellites modeling architecture.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>What is Data Vault?</h3>
            <p>Data Vault 2.0 is a modeling design optimized for enterprise data warehouses running on massively parallel processors. Unlike Kimball, it separates business keys, relationships, and context columns into distinct objects.</p>
            <h3>Core Data Vault Entities</h3>
            <ul>
                <li><strong>Hubs:</strong> Core business keys (e.g. <code>customer_id</code>). Contains only the hash key, business key, load timestamp, and record source.</li>
                <li><strong>Links:</strong> Represent many-to-many associations or relationships between Hubs (e.g., an Order link connecting a Customer Hub and a Product Hub).</li>
                <li><strong>Satellites:</strong> Hold descriptive context and history over time for a Hub or Link (e.g. customer addresses, product pricing). All history is Type 2 by design.</li>
            </ul>

#### Interview Questions
**Q: What are the three core table types in Data Vault 2.0?**

> A: Hubs (store business keys), Links (store associations/relationships between keys), and Satellites (store the descriptive context and historical changes).

**Q: Why does Data Vault use Hash Keys instead of sequential primary keys?**

> A: Hash keys (like MD5 or SHA256 of the business key) can be calculated independently on each staging pipeline, allowing parallel loads to execute simultaneously without calling central sequence generators, optimizing load performance.


<br/>

## Stage 2: Advanced Modeling & Quality

### [2.1] Normalization vs. Denormalization
*1NF, 2NF, 3NF schema constraints, grains, and cardinality.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Database Normalization</h3>
            <p>Normalization structures relational databases to minimize redundancy:</p>
            <ul>
                <li><strong>1NF (First Normal Form):</strong> Atomic values per cell, no repeating groups.</li>
                <li><strong>2NF (Second Normal Form):</strong> Meets 1NF, and all non-key columns depend fully on the primary key (no partial dependencies).</li>
                <li><strong>3NF (Third Normal Form):</strong> Meets 2NF, and no non-key columns depend transitively on the primary key.</li>
            </ul>
            <h3>The Concept of Grain</h3>
            <p>The **Grain** of a table represents the level of detail captured by a single row (e.g. one row per transaction line item vs. one row per daily transaction summary). Defining the grain clearly is the first step in dimensional modeling.</p>

#### Interview Questions
**Q: Why do transactional databases (OLTP) use 3NF, while analytical databases (OLAP) use denormalized schemas?**

> A: OLTP systems optimize for fast write operations, so 3NF prevents anomalies and redundancy during inserts/updates. OLAP systems optimize for complex reads and scans; denormalization merges tables to avoid slow JOIN operations.


<br/>

### [2.2] Surrogate Keys vs. Natural Keys
*Manage composite keys, natural keys, and surrogate hash generation.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Database Keys</h3>
            <ul>
                <li><strong>Natural Key:</strong> A key that has logical business meaning (e.g. SSN, Email, Product SKU).</li>
                <li><strong>Surrogate Key:</strong> A database-generated identifier with no business meaning (e.g. autoincrementing integers, UUIDs, or MD5 hashes).</li>
                <li><strong>Composite Key:</strong> A primary key composed of multiple columns. Avoided in Fact tables due to high join complexity.</li>
            </ul>

#### Interview Questions
**Q: Why are Surrogate Keys preferred over Natural Keys inside a Data Warehouse?**

> A: Natural Keys can change in source databases (e.g. a customer changes their email). Surrogate keys isolate the data warehouse from source changes, enforce unique keys inside the warehouse, and optimize join sizes.


<br/>

### [2.3] Data Quality & Data Reconciliation
*Great Expectations, custom data assertions, and reconciliation audits.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Data Quality Frameworks</h3>
            <p>Data quality checks prevent bad data from polluting downstream dashboards. Standard checks include schema validations, completeness (NULL ratios), and value bounds checks.</p>
            <h3>Reconciliation Audits</h3>
            <p>A reconciliation process runs daily to audit that target tables match source totals (e.g., comparing <code>SUM(sales_amount)</code> on the raw source file against the warehouse Gold layer sales metrics).</p>

#### Interview Questions
**Q: How do you implement data reconciliation checks in production ETL?**

> A: Deploy a validation job at the end of the pipeline that queries source transaction counts and dollar sums, compares them against target row counts and database sums, and logs the variance. Fail the pipeline run if the variance is non-zero.


<br/>

### [2.4] Performance Engineering Concepts
*Partitioning, predicate pushdowns, broadcast joins, and data skew.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Performance Engineering</h3>
            <ul>
                <li><strong>Partitioning:</strong> Physically dividing tables by date or ID keys to minimize read scans.</li>
                <li><strong>Predicate Pushdown:</strong> Evaluating filtering expressions as early as possible during data scans.</li>
                <li><strong>Data Skew:</strong> An unequal distribution of keys across cluster nodes (e.g. 90% of sales match key 'NULL'). This causes one node to do 90% of the work, slowing down the entire cluster.</li>
            </ul>

#### Interview Questions
**Q: What is Data Skew and how do you resolve it in join operations?**

> A: Data Skew occurs when values are unevenly distributed, forcing a single cluster partition node to process a massive bottleneck. Resolve it by filtering out null keys before joining, or adding a random 'salt' value to the join key to distribute rows evenly.


<br/>

### [2.5] Enterprise Security Architecture
*RBAC vs. ABAC, encryption keys, and secrets rotation.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Access Control Models</h3>
            <ul>
                <li><strong>RBAC (Role-Based Access Control):</strong> Permissions granted to roles (e.g. 'sales_analyst') mapped to users.</li>
                <li><strong>ABAC (Attribute-Based Access Control):</strong> Permissions evaluated dynamically based on attributes (e.g. user department, IP address, access time).</li>
            </ul>
            <h3>Encryption & Keys</h3>
            <p>Data should be encrypted at rest and in transit. Customer-Managed Keys (CMK) allow enterprises to rotate and control their own encryption keys on cloud warehouses.</p>

#### Interview Questions
**Q: What is the difference between RBAC and ABAC?**

> A: RBAC grants permissions based on static role definitions. ABAC evaluates permissions dynamically using characteristics of the user, resource, and request context (e.g., location, time, department) to determine access.


<br/>

### [2.6] Data Contracts (Organizational Practice)
*Formal agreements between data producers and consumers that define schema, SLAs, and quality guarantees.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is a Data Contract?</h3>
            <p>A <strong>Data Contract</strong> is a formal, versioned agreement between a <strong>data producer</strong> (the team that owns and publishes a dataset) and its <strong>data consumers</strong> (analytics, data science, downstream teams). It defines the schema, semantics, quality rules, SLAs, and ownership of a dataset as a binding interface specification.</p>
            <h3>What a Data Contract Defines</h3>
            <ul>
                <li><strong>Schema:</strong> Field names, data types, nullability, and semantic descriptions (what each field means).</li>
                <li><strong>Quality rules:</strong> Freshness SLAs (data updated within N hours), completeness thresholds (no more than 0.1% nulls), uniqueness constraints, and referential integrity.</li>
                <li><strong>Versioning:</strong> Semantic versioning (major.minor.patch) — breaking changes (field removal, type changes) require a major version bump and consumer negotiation.</li>
                <li><strong>Ownership:</strong> Named producer team, consumer teams, escalation contacts, and on-call information.</li>
                <li><strong>SLAs:</strong> Delivery time commitments (e.g., data available by 08:00 UTC daily), error rate thresholds, and incident response expectations.</li>
            </ul>
            <pre><code># Example Data Contract (YAML)
apiVersion: v2
kind: DataContract
name: orders_v2
producer: payments-team
consumers: [analytics, data-science, finance]
schema:
  - name: order_id
    type: STRING
    nullable: false
    description: Globally unique order identifier
  - name: order_amount
    type: DECIMAL(10,2)
    nullable: false
sla:
  freshness_hours: 4
  availability_percent: 99.5
quality:
  - check: unique(order_id)
  - check: not_null(order_amount)</code></pre>
            <h3>Data Contracts vs. dbt Model Contracts</h3>
            <p>dbt Model Contracts enforce schema at <strong>build time</strong> within the dbt pipeline. Organizational Data Contracts are broader — they govern the data as a published <strong>interface between teams</strong>, covering SLAs, ownership, versioning policy, and consumer rights that go beyond what dbt enforces technically.</p>
            <h3>Tooling</h3>
            <p>Popular frameworks: <strong>Data Contract CLI</strong> (open-source), <strong>Soda Contracts</strong>, <strong>Great Expectations</strong>, and <strong>Atlan</strong>. Some organizations implement contracts as plain YAML files version-controlled in GitHub alongside the producer's data pipeline code.</p>

#### Interview Questions
**Q: What is the difference between a Data Contract and a dbt Model Contract?**

> A: A dbt Model Contract is a technical enforcement at build time — it validates that the compiled SQL produces the expected schema and aborts if types or columns don't match. An organizational Data Contract is a broader governance agreement between teams covering SLAs, ownership, quality thresholds, versioning policies, and consumer rights. dbt enforces the technical schema; the organizational contract governs the business relationship around data ownership.

**Q: How do you handle breaking schema changes under a Data Contract?**

> A: Breaking changes require a major version bump and a migration period. The producer publishes the new contract version (e.g., orders_v3) alongside the old one. Consumers migrate on their own timeline. The old version is deprecated with a sunset date communicated in advance. This prevents consumers from breaking silently when producers evolve their schemas.


<br/>

### [2.7] Idempotency in Data Pipelines
*Design pipelines that produce identical results regardless of how many times they run.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is Idempotency?</h3>
            <p>An <strong>idempotent pipeline</strong> produces the same result whether it runs once or ten times for the same input data. Running it multiple times does not duplicate rows, corrupt state, or create inconsistencies. This is essential for safe retries, backfills, and incident recovery.</p>
            <h3>Why Idempotency Breaks</h3>
            <ul>
                <li><strong>INSERT without deduplication:</strong> Re-running a pipeline inserts duplicate rows if INSERT INTO is used without a merge or delete-first strategy.</li>
                <li><strong>Stateful aggregations:</strong> If a pipeline appends to a running total without clearing previous results, re-runs double-count.</li>
                <li><strong>Non-deterministic functions:</strong> Using CURRENT_TIMESTAMP() or RANDOM() inside transformations produces different output on each run.</li>
            </ul>
            <h3>Idempotency Patterns</h3>
            <ul>
                <li><strong>Partition overwrite:</strong> Write to a date partition and use INSERT OVERWRITE (or TRUNCATE+INSERT) for that partition. Re-running rewrites the same partition rather than appending. Best for batch daily jobs.</li>
                <li><strong>MERGE (Upsert):</strong> Use MERGE statements that match on a natural key and update or insert. Re-running produces the same final state.</li>
                <li><strong>Delete + Insert:</strong> DELETE WHERE load_date = today, then INSERT fresh data. Simple and effective for daily batch loads.</li>
                <li><strong>Watermark + offset tracking:</strong> For streaming or incremental loads, track the last-processed offset/timestamp in a control table. Re-runs start from the same watermark, never reprocessing records already consumed.</li>
            </ul>
            <pre><code>-- Idempotent daily load pattern
DELETE FROM target_table WHERE load_date = '2026-07-19';

INSERT INTO target_table
SELECT *, '2026-07-19' AS load_date
FROM source_table
WHERE event_date = '2026-07-19';</code></pre>
            <h3>Testing Idempotency</h3>
            <p>Run your pipeline twice for the same date partition and compare row counts and checksums between both runs. They must be identical.</p>

#### Interview Questions
**Q: Why is idempotency critical for production data pipelines?**

> A: Data pipelines fail and get retried automatically by orchestrators (Airflow, ADF). Without idempotency, retries duplicate rows or corrupt running totals, producing wrong numbers in downstream reports. Idempotent pipelines can be safely retried any number of times without manual cleanup, making incident recovery trivial.

**Q: How would you make a daily aggregation pipeline idempotent?**

> A: Use partition overwrite: before inserting daily aggregates, DELETE WHERE load_date = target_date, then INSERT the freshly computed aggregates for that date. This ensures the pipeline can be re-run for any historical date without accumulating duplicate rows, and the final state is always correct regardless of how many times it ran.


<br/>

### [2.8] Backfill Strategies for Data Pipelines
*Efficiently reprocess historical data after schema changes, logic fixes, or new pipeline deployments.*

**Duration:** 🕒 12 min read | **Difficulty:** Advanced

#### Theory
<h3>What is a Backfill?</h3>
            <p>A <strong>backfill</strong> is the process of reprocessing historical data — typically after fixing a bug in transformation logic, deploying a new pipeline with historical coverage requirements, or recovering from a data quality incident.</p>
            <h3>Types of Backfills</h3>
            <ul>
                <li><strong>Full backfill:</strong> Reprocess the entire history of a dataset from the beginning. Used for major logic changes or new pipeline deployments. Expensive but complete.</li>
                <li><strong>Partial backfill:</strong> Reprocess a specific date range affected by a bug or incident. More targeted and faster.</li>
                <li><strong>Incremental backfill:</strong> Reprocess in rolling chunks (e.g., 30 days at a time) to avoid overwhelming source systems or compute quotas.</li>
            </ul>
            <h3>Backfill Strategy Patterns</h3>
            <ul>
                <li><strong>Catchup in Airflow:</strong> Set catchup=True and a start_date to trigger historical DAG runs for each missed execution interval. Each run processes one partition.</li>
                <li><strong>Parallel date-partitioned backfill:</strong> Generate a list of historical dates and trigger parallel pipeline runs for each date. Dramatically faster than sequential processing.</li>
                <li><strong>Shadow table approach:</strong> Write backfilled data to a shadow table (e.g., orders_v2_backfill) in parallel with production. Validate quality, then swap the table reference atomically.</li>
                <li><strong>dbt backfill:</strong> Run 'dbt run --select my_model --vars {"start_date": "2025-01-01", "end_date": "2026-01-01"}' with date variable logic in the model SQL to scope the reprocessing range.</li>
            </ul>
            <pre><code>-- Airflow parallel backfill DAG pattern
with DAG('backfill_orders', catchup=False) as dag:
    dates = pd.date_range('2025-01-01', '2026-01-01', freq='D')
    tasks = [
        SparkSubmitOperator(
            task_id=f'process_{d.date()}',
            application='process_orders.py',
            application_args=[str(d.date())]
        ) for d in dates
    ]</code></pre>
            <h3>Backfill Risks to Mitigate</h3>
            <ul>
                <li>Overloading source systems — throttle parallel backfill concurrency.</li>
                <li>Overwriting correct recent data — always scope the backfill date range tightly.</li>
                <li>Cost overruns — estimate compute cost before running full historical backfills on multi-year datasets.</li>
            </ul>

#### Interview Questions
**Q: How would you backfill 2 years of historical data for a new pipeline without impacting production?**

> A: Use the shadow table approach: deploy the new pipeline writing to a shadow table (orders_v2_backfill) running in parallel with the live pipeline. Run a parallel date-partitioned backfill job generating historical data for all 730 days with throttled concurrency (e.g., 10 dates in parallel). Validate row counts and quality checks against the old table. Once validated, swap the table reference atomically and decommission the old pipeline.

**Q: What is the difference between catchup in Airflow and a manual backfill script?**

> A: Airflow catchup generates one DAG run per missed schedule interval (e.g., one run per day since start_date), each processing its own logical date. This is built-in and respects dependencies. A manual backfill script is a custom program that iterates over date ranges and triggers runs explicitly — more flexible (can use custom parallelism or chunking) but requires manual implementation and monitoring.


<br/>

---

# Domain: DevOps & Observability

## Stage 1: DevOps & Automation

### [1.1] GitFlow & Collaboration Rules
*Version control branching, PR policies, and branch protection.*

**Duration:** 🕒 12 min read | **Difficulty:** Beginner to Intermediate

#### Theory
<h3>Version Control in Data Engineering</h3>
            <p>Data pipelines and transformations must be stored in Git repositories. The standard workflow is **GitFlow**:</p>
            <ul>
                <li><strong>Main/Production Branch:</strong> Holds compiled, production-tested pipelines. Direct commits are blocked.</li>
                <li><strong>Develop Branch:</strong> Integration branch for testing.</li>
                <li><strong>Feature Branches:</strong> Created by developers to add new features or bug fixes.</li>
            </ul>
            <h3>Branch Protection Rules</h3>
            <p>Production branches should require a **Pull Request (PR)**, at least 1-2 reviewer approvals, and successful automated CI testing runs before merging.</p>

#### Interview Questions
**Q: What is GitFlow and why is direct committing to main blocked in enterprise settings?**

> A: GitFlow is a branching model that isolates development from production. Blocking direct commits to main ensures all code is peer-reviewed via Pull Requests and passes automated test suites before deployment, preventing production outages.


<br/>

### [1.2] CI/CD Deployment Pipelines
*GitHub Actions, Azure DevOps, and automated pipeline validation.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>CI/CD Lifecycle</h3>
            <ul>
                <li><strong>Continuous Integration (CI):</strong> Triggered when a PR is opened. Automatically compiles code, runs SQL/dbt linters, checks formatting, and runs unit tests using mock datasets.</li>
                <li><strong>Continuous Deployment (CD):</strong> Triggered when code merges to main. Automatically packages compiled code, logs metadata, and deploys ARM templates or SQL objects to the target database.</li>
            </ul>

#### Interview Questions
**Q: Describe your typical CI/CD release pipeline for a dbt project.**

> A: 1. PR opens: Trigger CI runner. 2. Run dbt linting and code formatting checks. 3. Compile SQL and execute unit tests on a test target schema using Slim CI. 4. Code merges to main: Trigger CD. 5. Deploy compiled scripts to the production schema and update documentation.


<br/>

### [1.3] Infrastructure as Code (IaC)
*Terraform, Bicep, and automated resource provisioning.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>IaC in Data Engineering</h3>
            <p>Provisioning warehouses, databases, storage accounts, and pipelines manually leads to drift between Dev and Prod configurations. We use IaC to declare infrastructure in code files:</p>
            <ul>
                <li><strong>Terraform:</strong> Provider-agnostic engine that uses HCL (HashiCorp Configuration Language) and tracks resources using a State File.</li>
                <li><strong>Bicep / ARM:</strong> Azure-specific declarative infrastructure files.</li>
            </ul>

#### Interview Questions
**Q: Why use Terraform or Bicep instead of manually creating database resources?**

> A: IaC ensures environment consistency, eliminates resource drift between Dev and Prod, tracks infrastructure history in Git, and automates deployments through CI/CD release pipelines.


<br/>

## Stage 2: Observability & Monitoring

### [2.1] Structured Logging & Audit Logs
*Designing custom logs, execution IDs, and audit tables.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>Structured Logging</h3>
            <p>Pipelines should generate logs in structured formats (like JSON) containing standardized keys. This makes it easy for indexing tools (like Splunk or Log Analytics) to parse and query execution metrics.</p>
            <h3>Execution Tracing</h3>
            <p>Every pipeline run must be tagged with a unique **Execution GUID**. This ID is passed to all sub-pipelines and query tags, allowing developers to trace the logs of a single workflow run across multiple systems.</p>

#### Interview Questions
**Q: What is Structured Logging and why is it important in production pipelines?**

> A: Structured Logging writes logs in a machine-readable JSON format with standard key-value fields. This enables log analyzers to quickly filter, parse, and aggregate log metrics, speeding up troubleshooting.


<br/>

### [2.2] Observability & Dashboard Telemetry
*Query history logs, CPU/Memory health, and performance monitors.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Data Observability</h3>
            <p>Observability focuses on system health metrics: query history, resource consumption (credits, CPU, memory), and pipeline run status. Monitoring metrics let you create alerts before jobs fail (e.g., alert if pipeline runtime exceeds historical averages by 50%).</p>

#### Interview Questions
**Q: How do you detect if a pipeline is running longer than usual due to a system lock?**

> A: Monitor execution runtimes in your log database. Compare active running times against the rolling average duration of the previous 30 days. Trigger a warning alert if runtime exceeds the average by 2 standard deviations.


<br/>

### [2.3] SLA, SLO & Alerting Frameworks
*SLA/SLO metric parameters and Logic Apps / Slack integration alerts.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>SLA vs. SLO</h3>
            <ul>
                <li><strong>SLA (Service Level Agreement):</strong> The formal commitment to stakeholders (e.g. Sales dashboard must refresh by 6:00 AM daily).</li>
                <li><strong>SLO (Service Level Objective):</strong> The internal performance target (e.g. Sales pipeline must finish by 5:30 AM 99% of the time) to prevent SLA breaches.</li>
            </ul>

#### Interview Questions
**Q: How do you configure alerting to prevent SLA breaches?**

> A: Set up warning alerts targeting the SLO timeline (e.g. alert if job is not completed by 5:30 AM). Send alerts to Slack/Teams using Webhooks or trigger PagerDuty schedules for high-priority incidents.


<br/>

### [2.4] Data Lineage
*Column-level lineage, dependency mappings, and impact analysis.*

**Duration:** 🕒 12 min read | **Difficulty:** Intermediate

#### Theory
<h3>What is Data Lineage?</h3>
            <p>Data Lineage tracks data flow from source files down to intermediate transformations, final tables, and downstream BI reports. It answers the question: *'Where did this column value come from?'*</p>
            <p><strong>Impact Analysis:</strong> Checking data lineage before modifying a column schema to ensure we don't break downstream tables or dashboards.</p>

#### Interview Questions
**Q: How does Data Lineage help you perform an Impact Analysis?**

> A: Data Lineage maps column dependencies. If you need to drop or rename a column in a staging table, you consult the lineage map to identify all downstream models and reports that read that column, allowing you to update them first.


<br/>

### [2.5] Data Governance & Catalogs
*Azure Purview, Collibra, data classification, and metadata indexing.*

**Duration:** 🕒 15 min read | **Difficulty:** Intermediate

#### Theory
<h3>Data Governance</h3>
            <p>Data Governance manages security, compliance, and searchability of enterprise datasets. Tools like **Azure Purview** or **Collibra** index metadata, tag columns with business glossary terms, and classify sensitive information (e.g., tagging SSNs or Credit Card columns as PII).</p>

#### Interview Questions
**Q: What is the role of a Data Catalog in a modern data platform?**

> A: A Data Catalog indexes metadata from all databases and stages, acts as a searchable dictionary for business users, tracks data lineage, and classifies sensitive data (PII) to enforce security masking policies automatically.


<br/>

### [2.6] Blue/Green & Canary Deployments for Data Pipelines
*Deploy data pipeline changes safely with zero downtime and instant rollback capability.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Why Deployment Strategies Matter for Data</h3>
            <p>Unlike application deployments where a bug is quickly visible and reversible, data pipeline bugs silently corrupt datasets that downstream reports and ML models depend on. <strong>Blue/Green</strong> and <strong>Canary</strong> strategies reduce this risk by enabling parallel validation before production cutover.</p>
            <h3>Blue/Green Deployment</h3>
            <p>In a <strong>Blue/Green deployment</strong>, you maintain two identical pipeline environments: <strong>Blue</strong> (current production) and <strong>Green</strong> (new version). You deploy the new pipeline to Green, validate it against production data, then atomically switch all traffic/consumers to Green. Blue remains on standby for instant rollback.</p>
            <ul>
                <li><strong>Step 1:</strong> Deploy new pipeline version to Green environment writing to a <code>_green</code> target table or schema.</li>
                <li><strong>Step 2:</strong> Run Green for 1-7 days in parallel with Blue, comparing row counts, aggregates, and business KPIs between the two outputs.</li>
                <li><strong>Step 3:</strong> Swap the production alias/view to point to the Green table. Downstream consumers (BI tools, APIs) automatically read from Green without reconfiguration.</li>
                <li><strong>Step 4:</strong> Monitor Green for 24-48 hours. If issues arise, swap the alias back to Blue instantly — zero data loss.</li>
            </ul>
            <pre><code>-- Blue/Green swap using a view alias
-- Step 1: Both pipelines run in parallel
CREATE OR REPLACE VIEW prod.orders AS SELECT * FROM prod.orders_blue;  -- production
CREATE OR REPLACE VIEW prod.orders_green_view AS SELECT * FROM prod.orders_green;  -- validation

-- Step 2: Validate green output matches blue
SELECT COUNT(*) FROM prod.orders_blue;   -- expected: 10,000,000
SELECT COUNT(*) FROM prod.orders_green;  -- must match

-- Step 3: Atomic cutover
CREATE OR REPLACE VIEW prod.orders AS SELECT * FROM prod.orders_green;

-- Step 4: Rollback if needed (instant)
CREATE OR REPLACE VIEW prod.orders AS SELECT * FROM prod.orders_blue;</code></pre>
            <h3>Canary Deployment</h3>
            <p>A <strong>Canary deployment</strong> routes a small percentage of data through the new pipeline version to validate correctness before full rollout. This is useful for high-volume streaming pipelines where running two full copies in parallel is too expensive.</p>
            <ul>
                <li><strong>Routing strategy:</strong> Hash the primary key (e.g. customer_id) and route 5% of records to the new pipeline version.</li>
                <li><strong>Validation:</strong> Compare metrics from the canary output against the same cohort processed by the production pipeline.</li>
                <li><strong>Gradual rollout:</strong> Increase canary percentage from 5% → 20% → 50% → 100% as confidence grows.</li>
            </ul>
            <pre><code>-- Canary routing in Snowflake Streams + Tasks
-- Route 5% of orders to new pipeline by hash
INSERT INTO orders_new_pipeline
SELECT * FROM orders_stream
WHERE HASH(order_id) % 100 < 5;  -- 5% canary

INSERT INTO orders_prod_pipeline
SELECT * FROM orders_stream
WHERE HASH(order_id) % 100 >= 5;  -- 95% production</code></pre>
            <h3>Key Differences</h3>
            <ul>
                <li><strong>Blue/Green:</strong> Full parallel copy, instant atomic cutover. Higher cost but maximum safety. Best for batch pipelines and schema migrations.</li>
                <li><strong>Canary:</strong> Partial traffic split, gradual rollout. Lower cost. Best for high-volume streaming pipelines where full duplication is expensive.</li>
            </ul>

#### Interview Questions
**Q: How would you implement a Blue/Green deployment for a daily batch pipeline in Snowflake?**

> A: Run the new pipeline version writing to a _green schema in parallel with the production _blue schema for 3-7 days. Compare row counts, SUM aggregates on key metrics, and null rates between blue and green daily. Once validated, swap the production view alias to point to the green schema. If issues arise within 48 hours, flip the view alias back to blue for an instant zero-data-loss rollback.

**Q: When would you choose Canary over Blue/Green for a data pipeline?**

> A: Choose Canary when running two full pipeline copies is cost-prohibitive — typically high-volume streaming pipelines (millions of events per hour). By routing only 5-10% of traffic to the new version, you validate correctness with minimal extra compute. As confidence grows, gradually increase the canary percentage to 100% without a hard cutover.


<br/>

---

# Domain: AI in Data Engineering

## Stage 1: AI & Semantic Models

### [1.1] Snowflake Cortex LLMs & Agents
*Using COMPLETE, built-in agents, and model configurations.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Snowflake Cortex AI</h3>
            <p>Cortex is a fully managed service that provides secure LLM access directly inside Snowflake SQL. You execute state-of-the-art open-source LLMs (like Llama3 and Mistral) using built-in functions:</p>
            <p><code>SELECT SNOWFLAKE.CORTEX.COMPLETE('llama3-70b', 'Summarize this review: ...')</code></p>
            <h3>Cortex Agents</h3>
            <p>Cortex Agents are autonomous, managed SQL interfaces that combine LLMs with search indices to answer complex questions over unstructured tables, managing conversational state and orchestrating retrievals behind the scenes.</p>

#### Interview Questions
**Q: What is Snowflake Cortex COMPLETE and how is it billed?**

> A: Cortex COMPLETE is a SQL function that evaluates LLM prompts. It runs securely within the Snowflake boundary and is billed serverless-style based on the number of input and output tokens processed.


<br/>

### [1.2] Cortex Search & Semantic Indexing
*Building search indices, keyword match, and semantic relevance.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Cortex Search</h3>
            <p>Cortex Search enables low-latency keyword and semantic search over text datasets inside Snowflake. It automatically manages the extraction, embedding generation, and indexing of text columns.</p>
            <h3>Index Configuration</h3>
            <p>You create a search index by defining the target columns and refresh intervals:</p>
            <pre><code>CREATE OR REPLACE CORTEX SEARCH SERVICE my_search_index
  ON text_column
  ATTRIBUTES category
  WAREHOUSE = my_wh
  TARGET_LAG = '1 hour'
  AS SELECT text_column, category, id FROM raw_docs;</code></pre>

#### Interview Questions
**Q: What is a Cortex Search Service?**

> A: It is a managed search index that automatically generates embeddings and index profiles on text columns, allowing users to query data via vector similarity and keyword search concurrently using SQL APIs.


<br/>

### [1.3] Vector Embeddings & Cosine Similarity
*Using EMBED_TEXT and calculating vector distance parameters.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Vector Embeddings</h3>
            <p>Embeddings translate the semantic meaning of text into high-dimensional numerical vectors. In Snowflake, you generate embeddings using:</p>
            <p><code>SELECT SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', 'your text here')</code></p>
            <h3>Cosine Similarity</h3>
            <p>To find semantically similar documents, you store the output vectors in <code>VECTOR(FLOAT, 768)</code> columns and query them using similarity metrics: <code>VECTOR_COSINE_SIMILARITY(vector_col, query_vector)</code>. A score closer to 1 indicates high similarity.</p>

#### Interview Questions
**Q: How do you calculate semantic text similarity in Snowflake SQL?**

> A: Generate vector embeddings for your text using <code>CORTEX.EMBED_TEXT_768()</code>, store them in a <code>VECTOR</code> column type, and calculate distance using the <code>VECTOR_COSINE_SIMILARITY()</code> function.


<br/>

### [1.4] Retrieval-Augmented Generation (RAG)
*Build unstructured document pipelines in Snowflake stages.*

**Duration:** 🕒 20 min read | **Difficulty:** Advanced

#### Theory
<h3>RAG Ingestion Pipelines</h3>
            <p>RAG provides private company context to LLMs dynamically. In Snowflake, you construct a RAG pipeline by:</p>
            <ol>
                <li>Uploading PDF/txt manuals to an **Internal/External Stage**.</li>
                <li>Executing a Python UDF using **PyPDF** to extract and chunk the text.</li>
                <li>Calculating vector embeddings for each chunk and storing them in a table.</li>
                <li>Retrieving the top-k chunks matching user queries via vector search, and passing them to <code>CORTEX.COMPLETE()</code> as prompt context.</li>
            </ol>

#### Interview Questions
**Q: What is RAG and how do you implement it in Snowflake?**

> A: RAG retrieves relevant document chunks from your warehouse using vector search and inserts them into an LLM prompt as context. This allows the model to answer questions based on private files without needing fine-tuning.


<br/>

### [1.5] AI SQL Generation
*Natural language translation to Snowflake SQL using schemas.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>Natural Language to SQL (NL-to-SQL)</h3>
            <p>NL-to-SQL compilers allow business users to ask questions in plain English and automatically compile them into SQL. To make this accurate, the AI engine requires clear schema metadata definitions, primary/foreign key mappings, and table descriptions (Semantic Context) to generate valid queries.</p>

#### Interview Questions
**Q: What is the primary blocker for accurate NL-to-SQL generation and how do you resolve it?**

> A: Ambiguous table schemas and column names. Resolve this by defining clear primary/foreign key metadata, adding descriptions to tables and columns via COMMENT statements, and passing reference dictionaries to the compiler.


<br/>

## Stage 2: Enterprise Integrations

### [2.1] Model Context Protocol (MCP)
*How MCP dynamically links AI agents to data warehouse tables.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>What is Model Context Protocol (MCP)?</h3>
            <p>MCP is an open standard protocol that defines how client applications (like IDE coding agents) securely read context schemas, catalog structures, and execute tools on remote data platforms. It allows AI models to inspect and query data securely without custom, proprietary API mappings.</p>

#### Interview Questions
**Q: What is Model Context Protocol (MCP) and how is it used by developer AI agents?**

> A: MCP is a protocol that standardizes how AI agents fetch context and execute tools on data platforms. It enables the model to securely query databases, retrieve schema configurations, and execute SQL statements dynamically.


<br/>

### [2.2] AI-Assisted ETL & Data Prep
*Generate dynamic mappings, parse messy logs, and automate SQL builds.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>AI in ETL Ingestion</h3>
            <p>AI engines can automate tedious data transformation tasks:</p>
            <ul>
                <li><strong>Parsing Logs:</strong> Using LLMs to identify error patterns or extract attributes from raw, unstructured log files.</li>
                <li><strong>Schema Mapping:</strong> Automating the mapping of incoming Excel/CSV headers to standardized database columns.</li>
            </ul>

#### Interview Questions
**Q: How do you leverage LLMs to classify unstructured feedback rows in an ETL pipeline?**

> A: Run <code>CORTEX.COMPLETE()</code> inside your SQL query, prompting the LLM to output a single category string (e.g. 'Positive', 'Negative') based on the feedback column value, storing the result in a table.


<br/>

### [2.3] OpenAI External Integrations
*Setting up secure API connections and Snowflake Network Rules.*

**Duration:** 🕒 15 min read | **Difficulty:** Advanced

#### Theory
<h3>External Network Access</h3>
            <p>By default, Snowflake warehouses are blocked from connecting to external APIs. To call external models (like OpenAI or custom endpoints), you must configure three objects:</p>
            <ol>
                <li><strong>Network Rule:</strong> Restricts outgoing traffic to specified domains (e.g., api.openai.com).</li>
                <li><strong>External Access Integration:</strong> References the Network Rule and secures the connection endpoint.</li>
                <li><strong>UDF / Procedure:</strong> A Python function that calls the OpenAI API, passing credentials retrieved from a secure Snowflake Secret.</li>
            </ol>

#### Interview Questions
**Q: How do you call an external REST API (like OpenAI) securely from Snowflake?**

> A: 1. Create a Network Rule allowing outbound traffic to the API domain. 2. Create a Secret storing the API key. 3. Create an External Access Integration referencing the rule and secret. 4. Write a Python UDF referencing the integration to call the API.


<br/>

