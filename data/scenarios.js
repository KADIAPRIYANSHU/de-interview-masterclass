window.scenariosLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Performance & Scaling",
    "title": "Handling Sudden Data Volume Spikes",
    "subtitle": "How to manage unexpected surges in data ingestion.",
    "duration": "🕒 10 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>During a major sales event (like Black Friday), the incoming data volume increases by 500%. The current batch pipelines are taking too long, breaching SLAs.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Auto-Scaling Compute:</strong> Configure the data warehouse or Spark clusters to auto-scale horizontally to handle parallel processing.</li>\n                <li><strong>Partitioning Strategy:</strong> Ensure data is properly partitioned by date or hour to optimize writes and subsequent reads.</li>\n                <li><strong>Decoupling Ingestion from Transformation:</strong> Use message queues (like Kafka) or cloud storage (S3/ADLS) to buffer raw data, then process asynchronously.</li>\n                <li><strong>Incremental Processing:</strong> Process only new or changed data using watermarks instead of full table scans.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle a pipeline failure when it's halfway through processing a massive spike in data?",
            "answer": "Implement idempotent pipelines. Ensure that rerunning the pipeline does not create duplicates by using MERGE (UPSERT) operations or clearing the target partition before writing. Track processed files or offsets so you can resume exactly where it failed."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "ETL Design",
    "title": "SCD Type 2 on Billion-Row Tables",
    "subtitle": "Implementing Slowly Changing Dimensions efficiently at scale.",
    "duration": "🕒 10 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>You need to track historical changes (SCD Type 2) for a customer dimension table with over 1 billion records. Standard MERGE statements are timing out or consuming too many resources.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Change Data Capture (CDC):</strong> Use CDC tools to only process changed records rather than comparing the entire source against the target.</li>\n                <li><strong>Hashing for Comparison:</strong> Create a hash key of all non-key columns (e.g., MD5 or SHA256). Compare this hash to detect changes instead of comparing column-by-column.</li>\n                <li><strong>Partitioning:</strong> Partition the target table by active status or date to make updates faster.</li>\n                <li><strong>Separate Active/Inactive Tables:</strong> Sometimes keeping current active records in a smaller, fast table and historical records in a larger table improves performance.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "If a source system sends out-of-order updates, how do you handle SCD Type 2 logic?",
            "answer": "You must order the incoming changes by a source timestamp before processing. If an older record arrives late, you have to recalculate the 'valid_from' and 'valid_to' dates for the affected chronological chain of records."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Migration",
    "title": "On-Prem to Cloud Migration Strategy",
    "subtitle": "Migrating from Hadoop/Teradata to Snowflake/Databricks.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>The company is migrating a legacy 50TB Teradata data warehouse to Snowflake. You need to design the migration plan with minimal downtime.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Phased Migration:</strong> Migrate subject area by subject area (e.g., HR, then Sales) rather than a big bang approach.</li>\n                <li><strong>Historical vs. Incremental:</strong> Do an initial bulk load of historical data, then set up incremental replication to keep the cloud DB in sync.</li>\n                <li><strong>Dual Writing:</strong> Run legacy and new systems in parallel. Direct new writes to both systems and validate outputs before deprecating the legacy system.</li>\n                <li><strong>Code Conversion:</strong> Refactor legacy procedural code (like stored procs) into modern ELT frameworks (like dbt) or PySpark.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you validate data integrity between the old and new systems?",
            "answer": "Use automated data validation scripts to compare row counts, column checksums, MIN/MAX values, and sum of numeric columns between the source and target tables."
        }
    ]
},
    "1.4": {
    "id": "1.4",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Resilience",
    "title": "Handling Schema Drift",
    "subtitle": "What happens when source systems change their data structures unexpectedly.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>A downstream API or application changes its output format—adding columns, dropping columns, or changing data types—causing your ingestion pipelines to fail.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Schema-on-Read:</strong> Ingest raw data as semi-structured variants (JSON/Parquet) into a Data Lake. Apply structure later when reading.</li>\n                <li><strong>Auto-Evolving Schemas:</strong> Use tools that support schema evolution (like Delta Lake's <code>mergeSchema</code> or ADF Data Flows' Schema Drift handling).</li>\n                <li><strong>Alerting & Dead-Letter Queues:</strong> Catch schema validation errors, route bad records to a dead-letter queue, and alert the team without stopping the pipeline.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "If a source system changes an integer column to a string, how do you handle it without losing data?",
            "answer": "The raw layer should ingest it as a string or variant. In the transformation layer, you attempt a safe cast to integer. If it fails, log the error row to a bad records table for investigation while processing the valid rows."
        }
    ]
},
    "1.5": {
    "id": "1.5",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Data Quality",
    "title": "Duplicate & Missing Data",
    "subtitle": "Ensuring high data quality in downstream analytics.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>Business users report that revenue dashboards are showing double the expected numbers, and some dates have no data at all.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Deduplication:</strong> Implement <code>QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY timestamp DESC) = 1</code> in SQL or drop duplicates in Spark before writing to the target.</li>\n                <li><strong>Idempotency:</strong> Ensure pipelines don't append duplicate data on reruns. Use MERGE or overwrite specific partitions.</li>\n                <li><strong>Data Quality Checks:</strong> Integrate tools like Great Expectations or dbt tests to enforce uniqueness, non-null constraints, and referential integrity before exposing data.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you backfill missing data for a specific date range?",
            "answer": "Create parameterized pipelines where the start and end dates are inputs. Rerun the pipeline for the missing date range. Ensure the target tables are partitioned by date so you can overwrite just the affected partitions safely."
        }
    ]
},
    "1.6": {
    "id": "1.6",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Architecture",
    "title": "Batch vs. Streaming Decisions",
    "subtitle": "Choosing the right processing paradigm.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>The business wants real-time dashboards for inventory management, but the current system uses nightly batch processing.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Requirement Analysis:</strong> Clarify if they truly need sub-second latency (Streaming) or if 15-minute freshness (Micro-batching) is sufficient.</li>\n                <li><strong>Micro-Batching:</strong> Often, migrating from nightly to 15-minute micro-batches (e.g., using Snowpipe or Delta Live Tables) is easier and cheaper than full streaming.</li>\n                <li><strong>Streaming Architecture:</strong> If true real-time is needed, implement Kafka/Event Hubs for ingestion and Spark Streaming / Flink for processing.</li>\n                <li><strong>Lambda Architecture:</strong> Combine batch for historical accuracy and streaming for real-time speed.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What are the trade-offs of moving from batch to streaming?",
            "answer": "Streaming provides low latency but is significantly more complex to build, monitor, and scale. It usually incurs higher infrastructure costs and requires dealing with late-arriving data and windowing."
        }
    ]
},
    "1.7": {
    "id": "1.7",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Cost Optimization",
    "title": "Runaway Cloud Costs",
    "subtitle": "Optimizing compute and storage in cloud platforms.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>Your Snowflake or Databricks monthly bill has spiked by 40%. You need to identify the cause and optimize it immediately.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Monitor Usage:</strong> Query metadata tables (e.g., <code>ACCOUNT_USAGE.QUERY_HISTORY</code>) to find the most expensive or longest-running queries.</li>\n                <li><strong>Warehouse Sizing:</strong> Ensure you aren't using an XL warehouse for small jobs. Separate heavy ETL workloads from BI queries.</li>\n                <li><strong>Query Tuning:</strong> Look for Cartesian joins (missing join conditions), full table scans (missing partitions/clustering), and unnecessary ORDER BY clauses.</li>\n                <li><strong>Auto-Suspend:</strong> Ensure virtual warehouses auto-suspend quickly (e.g., 1 minute) when idle.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you optimize a query that is spilling to remote disk?",
            "answer": "Spilling to remote disk means the compute node ran out of memory and local SSD space. I would scale up to a larger warehouse size (more memory per node), optimize the query to process less data (better filtering/pruning), or remove unnecessary columns and large aggregations."
        }
    ]
},
    "1.8": {
    "id": "1.8",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Orchestration",
    "title": "Complex Dependency Management",
    "subtitle": "Handling pipeline dependencies and failures.",
    "duration": "🕒 10 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>You have a DAG in Airflow with 50 tasks. Task 25 fails frequently due to an unstable external API, causing the entire downstream pipeline to stall.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Retry Logic:</strong> Implement automatic retries with exponential backoff on the specific task.</li>\n                <li><strong>Timeouts and SLA Alerts:</strong> Set task timeouts so the task fails fast rather than hanging, and send alerts to Slack/Teams.</li>\n                <li><strong>Decoupling:</strong> If the downstream tasks don't strictly require Task 25's output, use trigger rules (like <code>all_done</code> instead of <code>all_success</code>) to allow independent tasks to continue.</li>\n                <li><strong>Circuit Breakers:</strong> If the API is down, fail gracefully and process the data in the next run.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle backfilling if a pipeline was paused for 3 days?",
            "answer": "In Airflow, I would enable 'catchup' and configure the DAG to run sequentially or concurrently for the missed execution dates. The pipelines must be idempotent, relying on the 'execution_date' parameter to process only the data for that specific window."
        }
    ]
},
    "1.9": {
    "id": "1.9",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Security & Governance",
    "title": "Handling PII & GDPR",
    "subtitle": "Securing sensitive data in the lakehouse.",
    "duration": "🕒 10 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>Legal requires that all Personally Identifiable Information (PII) like SSNs and emails be masked for analysts, but visible to HR. Also, a user requested their data be deleted (GDPR Right to be Forgotten).</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Dynamic Data Masking:</strong> Implement masking policies based on RBAC (Role-Based Access Control). If the role is HR, show plain text; otherwise, show '***'.</li>\n                <li><strong>Tokenization:</strong> Replace sensitive data with tokens in the raw layer, keeping the mapping in a highly secure vault.</li>\n                <li><strong>GDPR Deletes:</strong> Maintain a 'delete request' table. Modify pipelines to filter out these users, or run a periodic script to issue DELETE/UPDATE statements across all systems.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Deleting records from immutable data lakes (like raw Parquet files) is difficult. How do you handle GDPR deletes?",
            "answer": "Instead of rewriting raw files immediately, we use Delta Lake/Iceberg which supports ACID deletes. Alternatively, for raw files, we maintain a 'suppression list' of deleted IDs and filter them out dynamically during the read/ELT process, doing physical file compaction/deletion periodically."
        }
    ]
},
    "1.10": {
    "id": "1.10",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Optimization",
    "title": "Solving Data Skew in Distributed Systems",
    "subtitle": "Fixing performance bottlenecks in Spark or MPP databases.",
    "duration": "🕒 15 min read",
    "difficulty": "Expert",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>A Spark job or a distributed join in Snowflake is taking hours. Looking at the query profile, one node/task is doing 99% of the work while others are idle.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Identify the Skew:</strong> Usually caused by a join or aggregation on a key with a massive number of NULLs or a dominant value (e.g., 'country=US').</li>\n                <li><strong>Filter NULLs:</strong> Filter out NULL values before the join, or process them separately.</li>\n                <li><strong>Salting:</strong> Add a random number (salt) to the skew key to distribute the large partition across multiple nodes, then join on the salted key.</li>\n                <li><strong>Broadcast Joins:</strong> If joining a large skewed table with a small table, broadcast the small table to all nodes to avoid shuffling the large table.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Can you explain 'Salting' in Spark?",
            "answer": "Salting involves appending a random integer (e.g., 1 to 10) to a skewed join key in the large table, and replicating the small table 10 times with the corresponding salt values. This forces the shuffling algorithm to distribute the skewed key across 10 different tasks instead of just one."
        }
    ]
},
    "1.11": {
    "id": "1.11",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Integration",
    "title": "Orchestrating Snowflake via ADF",
    "subtitle": "Using ADF to execute Snowflake Stored Procedures and Scripts.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>You need to trigger a complex Snowflake transformation process from an Azure Data Factory (ADF) pipeline that also orchestrates other Azure services.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Copy Activity / Script Activity:</strong> Use the ADF Script Activity (with a Snowflake linked service) to execute SQL commands like <code>CALL my_stored_proc()</code>.</li>\n                <li><strong>Lookup Activity:</strong> If you need to retrieve a value from Snowflake (e.g., a Watermark or row count) to use later in the pipeline, use the Lookup Activity.</li>\n                <li><strong>Authentication:</strong> Secure the Linked Service using Azure Key Vault to store the Snowflake user password or use a Key Pair auth method.</li>\n                <li><strong>Network Security:</strong> Ensure the Azure Integration Runtime IP is whitelisted in Snowflake's Network Policies.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle a long-running Snowflake stored procedure in ADF that times out?",
            "answer": "ADF activities have a default timeout. If the Snowflake procedure takes longer, I would optimize the Snowflake query first. If it's inherently long, I would redesign it to be asynchronous: start the task, and use an Until loop in ADF to poll a Snowflake status table until the job completes."
        }
    ]
},
    "1.12": {
    "id": "1.12",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Data Ingestion",
    "title": "ADLS to Snowflake via Snowpipe vs ADF",
    "subtitle": "Choosing between ADF Copy Activity and Snowpipe for ingestion.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>Files are landing in Azure Data Lake Storage (ADLS) Gen2 every 5 minutes. You need to load them into Snowflake quickly and cost-effectively.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>ADF Copy Activity:</strong> Good for batch loads, but has spin-up time overhead. Requires an ADF pipeline trigger. Better if complex pre-processing in Azure is required.</li>\n                <li><strong>Snowpipe (Auto-Ingest):</strong> Best for continuous loading. Configure an Azure Event Grid to trigger Snowpipe as soon as a blob lands in ADLS.</li>\n                <li><strong>Cost Implications:</strong> Snowpipe uses serverless compute (billed per second of compute used). ADF Copy Activity bills for DIUs (Data Integration Units) and execution time. Snowpipe is generally cheaper and faster for continuous micro-batch file ingestion.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you authenticate Snowpipe to read from an ADLS Gen2 private storage account?",
            "answer": "I would create an Azure AD App Registration (Service Principal). In Snowflake, create a STORAGE INTEGRATION using the Tenant ID and App ID. Then, grant the Snowflake App 'Storage Blob Data Contributor' RBAC role on the ADLS container."
        }
    ]
},
    "1.13": {
    "id": "1.13",
    "stage": "Stage 1: Real-Time Scenarios",
    "module": "Error Handling",
    "title": "Handling Failures in ADF-Snowflake Pipelines",
    "subtitle": "Building resilient pipelines between Azure and Snowflake.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Scenario</h3>\n            <p>An ADF pipeline loads data from an on-prem SQL server into Snowflake. Occasionally, the network drops or Snowflake hits concurrency limits, causing the pipeline to fail halfway.</p>\n            <h3>The Approach</h3>\n            <ul>\n                <li><strong>Retry Policies:</strong> Configure the ADF Activity with a retry count (e.g., 3) and retry interval (e.g., 30 seconds) to handle transient network/concurrency errors.</li>\n                <li><strong>Fault Tolerance (Skip Incompatible Rows):</strong> When using ADF Copy Activity to Snowflake, enable fault tolerance to skip and log incompatible rows to a blob storage account rather than failing the whole batch.</li>\n                <li><strong>Idempotent Operations:</strong> Ensure the Snowflake target tables use <code>MERGE</code> or <code>DELETE + INSERT</code> so that rerunning the ADF pipeline doesn't duplicate data.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "If a Copy Activity from ADLS to Snowflake fails, how do you alert the team?",
            "answer": "I would attach a Web Activity or an alert mechanism on the 'On Failure' path of the Copy Activity in ADF. This could trigger an Azure Logic App that sends an email or a Teams/Slack notification with the pipeline run ID and error message."
        }
    ]
}
};
