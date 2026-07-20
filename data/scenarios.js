window.scenariosLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Performance & Scaling",
        title: "Handling Sudden Data Volume Spikes",
        subtitle: "How to manage unexpected surges in data ingestion.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>During a major sales event (like Black Friday), the incoming data volume increases by 500%. The current batch pipelines are taking too long, breaching SLAs.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Auto-Scaling Compute:</strong> Configure the data warehouse or Spark clusters to auto-scale horizontally to handle parallel processing.</li>
                <li><strong>Partitioning Strategy:</strong> Ensure data is properly partitioned by date or hour to optimize writes and subsequent reads.</li>
                <li><strong>Decoupling Ingestion from Transformation:</strong> Use message queues (like Kafka) or cloud storage (S3/ADLS) to buffer raw data, then process asynchronously.</li>
                <li><strong>Incremental Processing:</strong> Process only new or changed data using watermarks instead of full table scans.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you handle a pipeline failure when it's halfway through processing a massive spike in data?",
                answer: "Implement idempotent pipelines. Ensure that rerunning the pipeline does not create duplicates by using MERGE (UPSERT) operations or clearing the target partition before writing. Track processed files or offsets so you can resume exactly where it failed."
            }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: Real-Time Scenarios",
        module: "ETL Design",
        title: "SCD Type 2 on Billion-Row Tables",
        subtitle: "Implementing Slowly Changing Dimensions efficiently at scale.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>You need to track historical changes (SCD Type 2) for a customer dimension table with over 1 billion records. Standard MERGE statements are timing out or consuming too many resources.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Change Data Capture (CDC):</strong> Use CDC tools to only process changed records rather than comparing the entire source against the target.</li>
                <li><strong>Hashing for Comparison:</strong> Create a hash key of all non-key columns (e.g., MD5 or SHA256). Compare this hash to detect changes instead of comparing column-by-column.</li>
                <li><strong>Partitioning:</strong> Partition the target table by active status or date to make updates faster.</li>
                <li><strong>Separate Active/Inactive Tables:</strong> Sometimes keeping current active records in a smaller, fast table and historical records in a larger table improves performance.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "If a source system sends out-of-order updates, how do you handle SCD Type 2 logic?",
                answer: "You must order the incoming changes by a source timestamp before processing. If an older record arrives late, you have to recalculate the 'valid_from' and 'valid_to' dates for the affected chronological chain of records."
            }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Migration",
        title: "On-Prem to Cloud Migration Strategy",
        subtitle: "Migrating from Hadoop/Teradata to Snowflake/Databricks.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>The company is migrating a legacy 50TB Teradata data warehouse to Snowflake. You need to design the migration plan with minimal downtime.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Phased Migration:</strong> Migrate subject area by subject area (e.g., HR, then Sales) rather than a big bang approach.</li>
                <li><strong>Historical vs. Incremental:</strong> Do an initial bulk load of historical data, then set up incremental replication to keep the cloud DB in sync.</li>
                <li><strong>Dual Writing:</strong> Run legacy and new systems in parallel. Direct new writes to both systems and validate outputs before deprecating the legacy system.</li>
                <li><strong>Code Conversion:</strong> Refactor legacy procedural code (like stored procs) into modern ELT frameworks (like dbt) or PySpark.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you validate data integrity between the old and new systems?",
                answer: "Use automated data validation scripts to compare row counts, column checksums, MIN/MAX values, and sum of numeric columns between the source and target tables."
            }
        ]
    },
    "1.4": {
        id: "1.4",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Resilience",
        title: "Handling Schema Drift",
        subtitle: "What happens when source systems change their data structures unexpectedly.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>The Scenario</h3>
            <p>A downstream API or application changes its output format—adding columns, dropping columns, or changing data types—causing your ingestion pipelines to fail.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Schema-on-Read:</strong> Ingest raw data as semi-structured variants (JSON/Parquet) into a Data Lake. Apply structure later when reading.</li>
                <li><strong>Auto-Evolving Schemas:</strong> Use tools that support schema evolution (like Delta Lake's <code>mergeSchema</code> or ADF Data Flows' Schema Drift handling).</li>
                <li><strong>Alerting & Dead-Letter Queues:</strong> Catch schema validation errors, route bad records to a dead-letter queue, and alert the team without stopping the pipeline.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "If a source system changes an integer column to a string, how do you handle it without losing data?",
                answer: "The raw layer should ingest it as a string or variant. In the transformation layer, you attempt a safe cast to integer. If it fails, log the error row to a bad records table for investigation while processing the valid rows."
            }
        ]
    },
    "1.5": {
        id: "1.5",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Data Quality",
        title: "Duplicate & Missing Data",
        subtitle: "Ensuring high data quality in downstream analytics.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>The Scenario</h3>
            <p>Business users report that revenue dashboards are showing double the expected numbers, and some dates have no data at all.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Deduplication:</strong> Implement <code>QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY timestamp DESC) = 1</code> in SQL or drop duplicates in Spark before writing to the target.</li>
                <li><strong>Idempotency:</strong> Ensure pipelines don't append duplicate data on reruns. Use MERGE or overwrite specific partitions.</li>
                <li><strong>Data Quality Checks:</strong> Integrate tools like Great Expectations or dbt tests to enforce uniqueness, non-null constraints, and referential integrity before exposing data.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you backfill missing data for a specific date range?",
                answer: "Create parameterized pipelines where the start and end dates are inputs. Rerun the pipeline for the missing date range. Ensure the target tables are partitioned by date so you can overwrite just the affected partitions safely."
            }
        ]
    },
    "1.6": {
        id: "1.6",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Architecture",
        title: "Batch vs. Streaming Decisions",
        subtitle: "Choosing the right processing paradigm.",
        duration: "🕒 10 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>The Scenario</h3>
            <p>The business wants real-time dashboards for inventory management, but the current system uses nightly batch processing.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Requirement Analysis:</strong> Clarify if they truly need sub-second latency (Streaming) or if 15-minute freshness (Micro-batching) is sufficient.</li>
                <li><strong>Micro-Batching:</strong> Often, migrating from nightly to 15-minute micro-batches (e.g., using Snowpipe or Delta Live Tables) is easier and cheaper than full streaming.</li>
                <li><strong>Streaming Architecture:</strong> If true real-time is needed, implement Kafka/Event Hubs for ingestion and Spark Streaming / Flink for processing.</li>
                <li><strong>Lambda Architecture:</strong> Combine batch for historical accuracy and streaming for real-time speed.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What are the trade-offs of moving from batch to streaming?",
                answer: "Streaming provides low latency but is significantly more complex to build, monitor, and scale. It usually incurs higher infrastructure costs and requires dealing with late-arriving data and windowing."
            }
        ]
    },
    "1.7": {
        id: "1.7",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Cost Optimization",
        title: "Runaway Cloud Costs",
        subtitle: "Optimizing compute and storage in cloud platforms.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>Your Snowflake or Databricks monthly bill has spiked by 40%. You need to identify the cause and optimize it immediately.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Monitor Usage:</strong> Query metadata tables (e.g., <code>ACCOUNT_USAGE.QUERY_HISTORY</code>) to find the most expensive or longest-running queries.</li>
                <li><strong>Warehouse Sizing:</strong> Ensure you aren't using an XL warehouse for small jobs. Separate heavy ETL workloads from BI queries.</li>
                <li><strong>Query Tuning:</strong> Look for Cartesian joins (missing join conditions), full table scans (missing partitions/clustering), and unnecessary ORDER BY clauses.</li>
                <li><strong>Auto-Suspend:</strong> Ensure virtual warehouses auto-suspend quickly (e.g., 1 minute) when idle.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you optimize a query that is spilling to remote disk?",
                answer: "Spilling to remote disk means the compute node ran out of memory and local SSD space. I would scale up to a larger warehouse size (more memory per node), optimize the query to process less data (better filtering/pruning), or remove unnecessary columns and large aggregations."
            }
        ]
    },
    "1.8": {
        id: "1.8",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Orchestration",
        title: "Complex Dependency Management",
        subtitle: "Handling pipeline dependencies and failures.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>You have a DAG in Airflow with 50 tasks. Task 25 fails frequently due to an unstable external API, causing the entire downstream pipeline to stall.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Retry Logic:</strong> Implement automatic retries with exponential backoff on the specific task.</li>
                <li><strong>Timeouts and SLA Alerts:</strong> Set task timeouts so the task fails fast rather than hanging, and send alerts to Slack/Teams.</li>
                <li><strong>Decoupling:</strong> If the downstream tasks don't strictly require Task 25's output, use trigger rules (like <code>all_done</code> instead of <code>all_success</code>) to allow independent tasks to continue.</li>
                <li><strong>Circuit Breakers:</strong> If the API is down, fail gracefully and process the data in the next run.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you handle backfilling if a pipeline was paused for 3 days?",
                answer: "In Airflow, I would enable 'catchup' and configure the DAG to run sequentially or concurrently for the missed execution dates. The pipelines must be idempotent, relying on the 'execution_date' parameter to process only the data for that specific window."
            }
        ]
    },
    "1.9": {
        id: "1.9",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Security & Governance",
        title: "Handling PII & GDPR",
        subtitle: "Securing sensitive data in the lakehouse.",
        duration: "🕒 10 min read",
        difficulty: "Advanced",
        theory: `
            <h3>The Scenario</h3>
            <p>Legal requires that all Personally Identifiable Information (PII) like SSNs and emails be masked for analysts, but visible to HR. Also, a user requested their data be deleted (GDPR Right to be Forgotten).</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Dynamic Data Masking:</strong> Implement masking policies based on RBAC (Role-Based Access Control). If the role is HR, show plain text; otherwise, show '***'.</li>
                <li><strong>Tokenization:</strong> Replace sensitive data with tokens in the raw layer, keeping the mapping in a highly secure vault.</li>
                <li><strong>GDPR Deletes:</strong> Maintain a 'delete request' table. Modify pipelines to filter out these users, or run a periodic script to issue DELETE/UPDATE statements across all systems.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Deleting records from immutable data lakes (like raw Parquet files) is difficult. How do you handle GDPR deletes?",
                answer: "Instead of rewriting raw files immediately, we use Delta Lake/Iceberg which supports ACID deletes. Alternatively, for raw files, we maintain a 'suppression list' of deleted IDs and filter them out dynamically during the read/ELT process, doing physical file compaction/deletion periodically."
            }
        ]
    },
    "1.10": {
        id: "1.10",
        stage: "Stage 1: Real-Time Scenarios",
        module: "Optimization",
        title: "Solving Data Skew in Distributed Systems",
        subtitle: "Fixing performance bottlenecks in Spark or MPP databases.",
        duration: "🕒 15 min read",
        difficulty: "Expert",
        theory: `
            <h3>The Scenario</h3>
            <p>A Spark job or a distributed join in Snowflake is taking hours. Looking at the query profile, one node/task is doing 99% of the work while others are idle.</p>
            <h3>The Approach</h3>
            <ul>
                <li><strong>Identify the Skew:</strong> Usually caused by a join or aggregation on a key with a massive number of NULLs or a dominant value (e.g., 'country=US').</li>
                <li><strong>Filter NULLs:</strong> Filter out NULL values before the join, or process them separately.</li>
                <li><strong>Salting:</strong> Add a random number (salt) to the skew key to distribute the large partition across multiple nodes, then join on the salted key.</li>
                <li><strong>Broadcast Joins:</strong> If joining a large skewed table with a small table, broadcast the small table to all nodes to avoid shuffling the large table.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Can you explain 'Salting' in Spark?",
                answer: "Salting involves appending a random integer (e.g., 1 to 10) to a skewed join key in the large table, and replicating the small table 10 times with the corresponding salt values. This forces the shuffling algorithm to distribute the skewed key across 10 different tasks instead of just one."
            }
        ]
    }
};
