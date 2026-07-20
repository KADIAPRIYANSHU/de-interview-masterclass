window.fundamentalsLessons = {
    "1.1": {
        "id": "1.1",
        "stage": "Stage 1: Warehousing Design",
        "module": "Architecture Concepts",
        "title": "Lakehouse, Data Lake & Warehouses",
        "subtitle": "Medallion Architecture (Bronze/Silver/Gold) and Kimball vs. Inmon design.",
        "duration": "🕒 15 min read",
        "difficulty": "Beginner to Intermediate",
        "theory": "\n            <h3>ETL / ELT Storage Architecture</h3>\n            <ul>\n                <li><strong>Data Lake:</strong> Storage repository holding raw, unstructured/semi-structured files. Highly scalable but lacks transaction controls.</li>\n                <li><strong>Data Warehouse:</strong> Highly structured database optimized for fast SQL queries, requiring predefined schemas.</li>\n                <li><strong>Lakehouse:</strong> Modern design merging the scalability of lakes with the ACID transactions and performance of warehouses (e.g. Delta Lake, Iceberg on S3).</li>\n            </ul>\n            <h3>The Medallion Architecture</h3>\n            <ul>\n                <li><strong>Bronze (Raw):</strong> Exact copy of raw source feeds. No cleanups.</li>\n                <li><strong>Silver (Cleansed):</strong> Filtered, parsed, deduplicated, and conformed data.</li>\n                <li><strong>Gold (Curated):</strong> Business-level dimensional models (Facts/Dims) ready for BI dashboards.</li>\n            </ul>\n            <h3>Kimball vs. Inmon</h3>\n            <ul>\n                <li><strong>Kimball (Bottom-Up):</strong> Denormalized Star Schema data marts built directly to support specific business processes. Faster to implement.</li>\n                <li><strong>Inmon (Top-Down):</strong> Highly normalized (3NF) central enterprise data model. Data marts are built downstream from this warehouse. Highly structured but slow to build.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": true,
        "tableData": {
            "title": "Architecture Comparison",
            "headers": [
                "Metric",
                "Kimball Paradigm",
                "Inmon Paradigm"
            ],
            "rows": [
                [
                    "Design Model",
                    "De-normalized Star Schemas",
                    "Normalized 3NF Entity-Relation"
                ],
                [
                    "Primary Goal",
                    "Optimized for user query speed",
                    "Single source of truth integrity"
                ],
                [
                    "Data Marts",
                    "DWH is the union of data marts",
                    "Data marts sourced from the DWH"
                ]
            ]
        },
        "interviewQuestions": [
            {
                "question": "What is the Medallion Architecture and what is the goal of the Silver layer?",
                "answer": "The Medallion Architecture is a data design pattern divided into Bronze (raw ingestion), Silver (cleansed/standardized data), and Gold (BI-ready facts/dimensions). The goal of Silver is to clean, deduplicate, and conform data so it acts as the clean integration layer."
            },
            {
                "question": "Compare Kimball vs. Inmon warehousing design methodologies.",
                "answer": "Kimball focuses on a bottom-up approach using denormalized Star Schemas (optimized for performance). Inmon uses a top-down, highly normalized 3NF central repository (optimized for data consistency and reducing duplicates) with downstream data marts."
            }
        ]
    },
    "1.2": {
        "id": "1.2",
        "stage": "Stage 1: Warehousing Design",
        "module": "Dimensional Modeling",
        "title": "Star Schema vs. Snowflake Schema",
        "subtitle": "Fact tables, Dimension tables, and normalization trade-offs.",
        "duration": "🕒 15 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>Dimensional Modeling Core</h3>\n            <ul>\n                <li><strong>Fact Tables:</strong> Contain the quantitative metrics/measures of a business process (e.g. <code>quantity_sold</code>, <code>amount</code>) and foreign keys linking to dimensions. Fact tables are tall and narrow.</li>\n                <li><strong>Dimension Tables:</strong> Contain descriptive context of the business process (e.g. <code>customer_name</code>, <code>product_category</code>). Dimension tables are wide and short.</li>\n            </ul>\n            <h3>Schema Architectures</h3>\n            <ul>\n                <li><strong>Star Schema:</strong> Denormalized dimensions directly joined to the central fact table. Maximizes read performance by minimizing SQL JOINs.</li>\n                <li><strong>Snowflake Schema:</strong> Normalized dimensions (dimensions join to secondary dimensions, e.g. Store joins to City which joins to State). Reduces data redundancy but increases SQL JOIN complexity.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "Why do columnar databases (like Snowflake) prefer Star Schemas over Snowflake Schemas?",
                "answer": "Star Schemas reduce the number of SQL JOINs required to execute queries. Columnar storage engines handle the redundant data in denormalized tables easily via compression algorithms, making normalization in dimension tables unnecessary."
            },
            {
                "question": "What is the difference between a Fact table and a Dimension table?",
                "answer": "Fact tables capture business transactions containing numerical measurements and keys. Dimension tables capture descriptive attributes (context) about the transaction (who, what, where, when)."
            }
        ]
    },
    "1.3": {
        "id": "1.3",
        "stage": "Stage 1: Warehousing Design",
        "module": "SCD Types",
        "title": "Slowly Changing Dimensions (SCD 0-6)",
        "subtitle": "Implement SCD Type 0, 1, 2, 3, 4, and 6 with real production examples.",
        "duration": "🕒 20 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>SCD Types Explained</h3>\n            <p>Slowly Changing Dimensions handle historical updates on dimension attributes:</p>\n            <ul>\n                <li><strong>SCD Type 0 (Retain):</strong> Never updates. Values remain static (e.g., date of birth).</li>\n                <li><strong>SCD Type 1 (Overwrite):</strong> Overwrites existing values. History is lost (e.g., correcting a typo in a name).</li>\n                <li><strong>SCD Type 2 (Add Row):</strong> Adds a new row with validation dates (start_date, end_date, active_flag). Full history is preserved.</li>\n                <li><strong>SCD Type 3 (Add Column):</strong> Adds a column to track current and previous value. Only tracks one level of history (e.g., <code>current_city</code> and <code>previous_city</code>).</li>\n                <li><strong>SCD Type 4 (History Table):</strong> The dimension table is overwritten (Type 1), but changes are logged in a separate historical audit table.</li>\n                <li><strong>SCD Type 6 (Hybrid):</strong> Combines Types 1, 2, and 3 (1 + 2 + 3 = 6). Adds rows to preserve history, but also adds a column to point to the current active value across all rows.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": true,
        "tableData": {
            "title": "SCD Strategy Summary",
            "headers": [
                "SCD Type",
                "Storage Action",
                "History Kept",
                "Query Complexity"
            ],
            "rows": [
                [
                    "Type 0",
                    "Ignore changes",
                    "Original state only",
                    "Lowest"
                ],
                [
                    "Type 1",
                    "Overwrite row",
                    "No history",
                    "Lowest"
                ],
                [
                    "Type 2",
                    "Insert new row",
                    "Full history",
                    "Medium (Requires date filter)"
                ],
                [
                    "Type 3",
                    "Add new column",
                    "Partial history (2 versions)",
                    "Low"
                ],
                [
                    "Type 4",
                    "Write audit table",
                    "Full history (Audit log)",
                    "High (Requires outer joins)"
                ],
                [
                    "Type 6",
                    "Insert row + current col",
                    "Full history + easy lookup",
                    "High"
                ]
            ]
        },
        "interviewQuestions": [
            {
                "question": "How do you implement an SCD Type 2 merge SQL statement?",
                "answer": "Use a SQL MERGE statement that performs a union check. For modified source rows, it runs an UPDATE on the target table setting `is_active = FALSE` and `end_date = CURRENT_DATE()`, and an INSERT to write the new active row with `is_active = TRUE`."
            },
            {
                "question": "What is SCD Type 6 and why would an enterprise use it?",
                "answer": "SCD Type 6 is a hybrid approach. It inserts a new row to track history (Type 2) but adds a column to store the current active value (Type 3) on all historical rows. This lets users query historic stats easily without running date range joins."
            }
        ]
    },
    "1.4": {
        "id": "1.4",
        "stage": "Stage 1: Warehousing Design",
        "module": "Special Dimensions",
        "title": "Special Dimensions & Bridge Tables",
        "subtitle": "Degenerate, Junk, Factless Facts, and Late Arriving Dimensions.",
        "duration": "🕒 15 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>Advanced Dimensional Modeling</h3>\n            <ul>\n                <li><strong>Degenerate Dimension:</strong> A dimension attribute stored directly in the fact table without joining to a dimension table (e.g. invoice numbers, transaction IDs).</li>\n                <li><strong>Junk Dimension:</strong> A single dimension table that groups multiple low-cardinality flags and indicators (like status = Y/N, payment_method = cash/credit) to keep the fact table narrow.</li>\n                <li><strong>Factless Fact Table:</strong> A fact table that contains no numerical measurements, only foreign keys (e.g. student attendance tracking representing 'events' or relationships).</li>\n                <li><strong>Bridge Table:</strong> Used to resolve many-to-many relationships between dimensions and facts (e.g. an order having multiple sales reps with split commissions).</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "What is a Late Arriving Dimension and how do you handle it?",
                "answer": "A Late Arriving Dimension occurs when a transaction (Fact) arrives before the master detail record (Dimension). Handle this by inserting a placeholder dimension row with a dummy status and matching key. When the real master record arrives, update the dummy row using Type 1 rules."
            },
            {
                "question": "What is a Junk Dimension and why is it used?",
                "answer": "A Junk Dimension consolidates multiple small flags and indicator columns into a single lookup table. This prevents the fact table from holding dozens of separate flag keys, optimizing join paths and indexes."
            }
        ]
    },
    "1.5": {
        "id": "1.5",
        "stage": "Stage 1: Warehousing Design",
        "module": "Data Vault",
        "title": "Data Vault 2.0",
        "subtitle": "Hubs, Links, and Satellites modeling architecture.",
        "duration": "🕒 15 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>What is Data Vault?</h3>\n            <p>Data Vault 2.0 is a modeling design optimized for enterprise data warehouses running on massively parallel processors. Unlike Kimball, it separates business keys, relationships, and context columns into distinct objects.</p>\n            <h3>Core Data Vault Entities</h3>\n            <ul>\n                <li><strong>Hubs:</strong> Core business keys (e.g. <code>customer_id</code>). Contains only the hash key, business key, load timestamp, and record source.</li>\n                <li><strong>Links:</strong> Represent many-to-many associations or relationships between Hubs (e.g., an Order link connecting a Customer Hub and a Product Hub).</li>\n                <li><strong>Satellites:</strong> Hold descriptive context and history over time for a Hub or Link (e.g. customer addresses, product pricing). All history is Type 2 by design.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "What are the three core table types in Data Vault 2.0?",
                "answer": "Hubs (store business keys), Links (store associations/relationships between keys), and Satellites (store the descriptive context and historical changes)."
            },
            {
                "question": "Why does Data Vault use Hash Keys instead of sequential primary keys?",
                "answer": "Hash keys (like MD5 or SHA256 of the business key) can be calculated independently on each staging pipeline, allowing parallel loads to execute simultaneously without calling central sequence generators, optimizing load performance."
            }
        ]
    },
    "2.1": {
        "id": "2.1",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Normalization Grains",
        "title": "Normalization vs. Denormalization",
        "subtitle": "1NF, 2NF, 3NF schema constraints, grains, and cardinality.",
        "duration": "🕒 15 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>Database Normalization</h3>\n            <p>Normalization structures relational databases to minimize redundancy:</p>\n            <ul>\n                <li><strong>1NF (First Normal Form):</strong> Atomic values per cell, no repeating groups.</li>\n                <li><strong>2NF (Second Normal Form):</strong> Meets 1NF, and all non-key columns depend fully on the primary key (no partial dependencies).</li>\n                <li><strong>3NF (Third Normal Form):</strong> Meets 2NF, and no non-key columns depend transitively on the primary key.</li>\n            </ul>\n            <h3>The Concept of Grain</h3>\n            <p>The **Grain** of a table represents the level of detail captured by a single row (e.g. one row per transaction line item vs. one row per daily transaction summary). Defining the grain clearly is the first step in dimensional modeling.</p>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "Why do transactional databases (OLTP) use 3NF, while analytical databases (OLAP) use denormalized schemas?",
                "answer": "OLTP systems optimize for fast write operations, so 3NF prevents anomalies and redundancy during inserts/updates. OLAP systems optimize for complex reads and scans; denormalization merges tables to avoid slow JOIN operations."
            }
        ]
    },
    "2.2": {
        "id": "2.2",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Database Keys",
        "title": "Surrogate Keys vs. Natural Keys",
        "subtitle": "Manage composite keys, natural keys, and surrogate hash generation.",
        "duration": "🕒 12 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>Database Keys</h3>\n            <ul>\n                <li><strong>Natural Key:</strong> A key that has logical business meaning (e.g. SSN, Email, Product SKU).</li>\n                <li><strong>Surrogate Key:</strong> A database-generated identifier with no business meaning (e.g. autoincrementing integers, UUIDs, or MD5 hashes).</li>\n                <li><strong>Composite Key:</strong> A primary key composed of multiple columns. Avoided in Fact tables due to high join complexity.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "Why are Surrogate Keys preferred over Natural Keys inside a Data Warehouse?",
                "answer": "Natural Keys can change in source databases (e.g. a customer changes their email). Surrogate keys isolate the data warehouse from source changes, enforce unique keys inside the warehouse, and optimize join sizes."
            }
        ]
    },
    "2.3": {
        "id": "2.3",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Data Quality",
        "title": "Data Quality & Data Reconciliation",
        "subtitle": "Great Expectations, custom data assertions, and reconciliation audits.",
        "duration": "🕒 15 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>Data Quality Frameworks</h3>\n            <p>Data quality checks prevent bad data from polluting downstream dashboards. Standard checks include schema validations, completeness (NULL ratios), and value bounds checks.</p>\n            <h3>Reconciliation Audits</h3>\n            <p>A reconciliation process runs daily to audit that target tables match source totals (e.g., comparing <code>SUM(sales_amount)</code> on the raw source file against the warehouse Gold layer sales metrics).</p>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "How do you implement data reconciliation checks in production ETL?",
                "answer": "Deploy a validation job at the end of the pipeline that queries source transaction counts and dollar sums, compares them against target row counts and database sums, and logs the variance. Fail the pipeline run if the variance is non-zero."
            }
        ]
    },
    "2.4": {
        "id": "2.4",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Performance Concepts",
        "title": "Performance Engineering Concepts",
        "subtitle": "Partitioning, predicate pushdowns, broadcast joins, and data skew.",
        "duration": "🕒 15 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>Performance Engineering</h3>\n            <ul>\n                <li><strong>Partitioning:</strong> Physically dividing tables by date or ID keys to minimize read scans.</li>\n                <li><strong>Predicate Pushdown:</strong> Evaluating filtering expressions as early as possible during data scans.</li>\n                <li><strong>Data Skew:</strong> An unequal distribution of keys across cluster nodes (e.g. 90% of sales match key 'NULL'). This causes one node to do 90% of the work, slowing down the entire cluster.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "What is Data Skew and how do you resolve it in join operations?",
                "answer": "Data Skew occurs when values are unevenly distributed, forcing a single cluster partition node to process a massive bottleneck. Resolve it by filtering out null keys before joining, or adding a random 'salt' value to the join key to distribute rows evenly."
            }
        ]
    },
    "2.5": {
        "id": "2.5",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Security Architecture",
        "title": "Enterprise Security Architecture",
        "subtitle": "RBAC vs. ABAC, encryption keys, and secrets rotation.",
        "duration": "🕒 15 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>Access Control Models</h3>\n            <ul>\n                <li><strong>RBAC (Role-Based Access Control):</strong> Permissions granted to roles (e.g. 'sales_analyst') mapped to users.</li>\n                <li><strong>ABAC (Attribute-Based Access Control):</strong> Permissions evaluated dynamically based on attributes (e.g. user department, IP address, access time).</li>\n            </ul>\n            <h3>Encryption & Keys</h3>\n            <p>Data should be encrypted at rest and in transit. Customer-Managed Keys (CMK) allow enterprises to rotate and control their own encryption keys on cloud warehouses.</p>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "What is the difference between RBAC and ABAC?",
                "answer": "RBAC grants permissions based on static role definitions. ABAC evaluates permissions dynamically using characteristics of the user, resource, and request context (e.g., location, time, department) to determine access."
            }
        ]
    },
    "2.6": {
        "id": "2.6",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Data Contracts",
        "title": "Data Contracts (Organizational Practice)",
        "subtitle": "Formal agreements between data producers and consumers that define schema, SLAs, and quality guarantees.",
        "duration": "🕒 15 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>What is a Data Contract?</h3>\n            <p>A <strong>Data Contract</strong> is a formal, versioned agreement between a <strong>data producer</strong> (the team that owns and publishes a dataset) and its <strong>data consumers</strong> (analytics, data science, downstream teams). It defines the schema, semantics, quality rules, SLAs, and ownership of a dataset as a binding interface specification.</p>\n            <h3>What a Data Contract Defines</h3>\n            <ul>\n                <li><strong>Schema:</strong> Field names, data types, nullability, and semantic descriptions (what each field means).</li>\n                <li><strong>Quality rules:</strong> Freshness SLAs (data updated within N hours), completeness thresholds (no more than 0.1% nulls), uniqueness constraints, and referential integrity.</li>\n                <li><strong>Versioning:</strong> Semantic versioning (major.minor.patch) — breaking changes (field removal, type changes) require a major version bump and consumer negotiation.</li>\n                <li><strong>Ownership:</strong> Named producer team, consumer teams, escalation contacts, and on-call information.</li>\n                <li><strong>SLAs:</strong> Delivery time commitments (e.g., data available by 08:00 UTC daily), error rate thresholds, and incident response expectations.</li>\n            </ul>\n            <pre><code># Example Data Contract (YAML)\napiVersion: v2\nkind: DataContract\nname: orders_v2\nproducer: payments-team\nconsumers: [analytics, data-science, finance]\nschema:\n  - name: order_id\n    type: STRING\n    nullable: false\n    description: Globally unique order identifier\n  - name: order_amount\n    type: DECIMAL(10,2)\n    nullable: false\nsla:\n  freshness_hours: 4\n  availability_percent: 99.5\nquality:\n  - check: unique(order_id)\n  - check: not_null(order_amount)</code></pre>\n            <h3>Data Contracts vs. dbt Model Contracts</h3>\n            <p>dbt Model Contracts enforce schema at <strong>build time</strong> within the dbt pipeline. Organizational Data Contracts are broader — they govern the data as a published <strong>interface between teams</strong>, covering SLAs, ownership, versioning policy, and consumer rights that go beyond what dbt enforces technically.</p>\n            <h3>Tooling</h3>\n            <p>Popular frameworks: <strong>Data Contract CLI</strong> (open-source), <strong>Soda Contracts</strong>, <strong>Great Expectations</strong>, and <strong>Atlan</strong>. Some organizations implement contracts as plain YAML files version-controlled in GitHub alongside the producer's data pipeline code.</p>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "What is the difference between a Data Contract and a dbt Model Contract?",
                "answer": "A dbt Model Contract is a technical enforcement at build time — it validates that the compiled SQL produces the expected schema and aborts if types or columns don't match. An organizational Data Contract is a broader governance agreement between teams covering SLAs, ownership, quality thresholds, versioning policies, and consumer rights. dbt enforces the technical schema; the organizational contract governs the business relationship around data ownership."
            },
            {
                "question": "How do you handle breaking schema changes under a Data Contract?",
                "answer": "Breaking changes require a major version bump and a migration period. The producer publishes the new contract version (e.g., orders_v3) alongside the old one. Consumers migrate on their own timeline. The old version is deprecated with a sunset date communicated in advance. This prevents consumers from breaking silently when producers evolve their schemas."
            }
        ]
    },
    "2.7": {
        "id": "2.7",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Idempotency Patterns",
        "title": "Idempotency in Data Pipelines",
        "subtitle": "Design pipelines that produce identical results regardless of how many times they run.",
        "duration": "🕒 12 min read",
        "difficulty": "Intermediate",
        "theory": "\n            <h3>What is Idempotency?</h3>\n            <p>An <strong>idempotent pipeline</strong> produces the same result whether it runs once or ten times for the same input data. Running it multiple times does not duplicate rows, corrupt state, or create inconsistencies. This is essential for safe retries, backfills, and incident recovery.</p>\n            <h3>Why Idempotency Breaks</h3>\n            <ul>\n                <li><strong>INSERT without deduplication:</strong> Re-running a pipeline inserts duplicate rows if INSERT INTO is used without a merge or delete-first strategy.</li>\n                <li><strong>Stateful aggregations:</strong> If a pipeline appends to a running total without clearing previous results, re-runs double-count.</li>\n                <li><strong>Non-deterministic functions:</strong> Using CURRENT_TIMESTAMP() or RANDOM() inside transformations produces different output on each run.</li>\n            </ul>\n            <h3>Idempotency Patterns</h3>\n            <ul>\n                <li><strong>Partition overwrite:</strong> Write to a date partition and use INSERT OVERWRITE (or TRUNCATE+INSERT) for that partition. Re-running rewrites the same partition rather than appending. Best for batch daily jobs.</li>\n                <li><strong>MERGE (Upsert):</strong> Use MERGE statements that match on a natural key and update or insert. Re-running produces the same final state.</li>\n                <li><strong>Delete + Insert:</strong> DELETE WHERE load_date = today, then INSERT fresh data. Simple and effective for daily batch loads.</li>\n                <li><strong>Watermark + offset tracking:</strong> For streaming or incremental loads, track the last-processed offset/timestamp in a control table. Re-runs start from the same watermark, never reprocessing records already consumed.</li>\n            </ul>\n            <pre><code>-- Idempotent daily load pattern\nDELETE FROM target_table WHERE load_date = '2026-07-19';\n\nINSERT INTO target_table\nSELECT *, '2026-07-19' AS load_date\nFROM source_table\nWHERE event_date = '2026-07-19';</code></pre>\n            <h3>Testing Idempotency</h3>\n            <p>Run your pipeline twice for the same date partition and compare row counts and checksums between both runs. They must be identical.</p>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "Why is idempotency critical for production data pipelines?",
                "answer": "Data pipelines fail and get retried automatically by orchestrators (Airflow, ADF). Without idempotency, retries duplicate rows or corrupt running totals, producing wrong numbers in downstream reports. Idempotent pipelines can be safely retried any number of times without manual cleanup, making incident recovery trivial."
            },
            {
                "question": "How would you make a daily aggregation pipeline idempotent?",
                "answer": "Use partition overwrite: before inserting daily aggregates, DELETE WHERE load_date = target_date, then INSERT the freshly computed aggregates for that date. This ensures the pipeline can be re-run for any historical date without accumulating duplicate rows, and the final state is always correct regardless of how many times it ran."
            }
        ]
    },
    "2.8": {
        "id": "2.8",
        "stage": "Stage 2: Advanced Modeling & Quality",
        "module": "Backfill Strategies",
        "title": "Backfill Strategies for Data Pipelines",
        "subtitle": "Efficiently reprocess historical data after schema changes, logic fixes, or new pipeline deployments.",
        "duration": "🕒 12 min read",
        "difficulty": "Advanced",
        "theory": "\n            <h3>What is a Backfill?</h3>\n            <p>A <strong>backfill</strong> is the process of reprocessing historical data — typically after fixing a bug in transformation logic, deploying a new pipeline with historical coverage requirements, or recovering from a data quality incident.</p>\n            <h3>Types of Backfills</h3>\n            <ul>\n                <li><strong>Full backfill:</strong> Reprocess the entire history of a dataset from the beginning. Used for major logic changes or new pipeline deployments. Expensive but complete.</li>\n                <li><strong>Partial backfill:</strong> Reprocess a specific date range affected by a bug or incident. More targeted and faster.</li>\n                <li><strong>Incremental backfill:</strong> Reprocess in rolling chunks (e.g., 30 days at a time) to avoid overwhelming source systems or compute quotas.</li>\n            </ul>\n            <h3>Backfill Strategy Patterns</h3>\n            <ul>\n                <li><strong>Catchup in Airflow:</strong> Set catchup=True and a start_date to trigger historical DAG runs for each missed execution interval. Each run processes one partition.</li>\n                <li><strong>Parallel date-partitioned backfill:</strong> Generate a list of historical dates and trigger parallel pipeline runs for each date. Dramatically faster than sequential processing.</li>\n                <li><strong>Shadow table approach:</strong> Write backfilled data to a shadow table (e.g., orders_v2_backfill) in parallel with production. Validate quality, then swap the table reference atomically.</li>\n                <li><strong>dbt backfill:</strong> Run 'dbt run --select my_model --vars {\"start_date\": \"2025-01-01\", \"end_date\": \"2026-01-01\"}' with date variable logic in the model SQL to scope the reprocessing range.</li>\n            </ul>\n            <pre><code>-- Airflow parallel backfill DAG pattern\nwith DAG('backfill_orders', catchup=False) as dag:\n    dates = pd.date_range('2025-01-01', '2026-01-01', freq='D')\n    tasks = [\n        SparkSubmitOperator(\n            task_id=f'process_{d.date()}',\n            application='process_orders.py',\n            application_args=[str(d.date())]\n        ) for d in dates\n    ]</code></pre>\n            <h3>Backfill Risks to Mitigate</h3>\n            <ul>\n                <li>Overloading source systems — throttle parallel backfill concurrency.</li>\n                <li>Overwriting correct recent data — always scope the backfill date range tightly.</li>\n                <li>Cost overruns — estimate compute cost before running full historical backfills on multi-year datasets.</li>\n            </ul>\n        ",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": [
            {
                "question": "How would you backfill 2 years of historical data for a new pipeline without impacting production?",
                "answer": "Use the shadow table approach: deploy the new pipeline writing to a shadow table (orders_v2_backfill) running in parallel with the live pipeline. Run a parallel date-partitioned backfill job generating historical data for all 730 days with throttled concurrency (e.g., 10 dates in parallel). Validate row counts and quality checks against the old table. Once validated, swap the table reference atomically and decommission the old pipeline."
            },
            {
                "question": "What is the difference between catchup in Airflow and a manual backfill script?",
                "answer": "Airflow catchup generates one DAG run per missed schedule interval (e.g., one run per day since start_date), each processing its own logical date. This is built-in and respects dependencies. A manual backfill script is a custom program that iterates over date ranges and triggers runs explicitly — more flexible (can use custom parallelism or chunking) but requires manual implementation and monitoring."
            }
        ]
    },
    "1.11": {
        "id": "1.11",
        "stage": "Stage 3: Concepts",
        "module": "Data Quality",
        "title": "Data Quality Dimensions",
        "subtitle": "Accuracy, Completeness...",
        "duration": "🕒 10 min read",
        "difficulty": "Beginner",
        "theory": "<ul><li>Accuracy, Completeness, Consistency, Validity, Timeliness, Uniqueness.</li></ul>",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": []
    },
    "1.12": {
        "id": "1.12",
        "stage": "Stage 3: Concepts",
        "module": "Lifecycle",
        "title": "Data Lifecycle & Idempotency",
        "subtitle": "Ingestion to Archiving",
        "duration": "🕒 10 min read",
        "difficulty": "Intermediate",
        "theory": "<p><strong>Lifecycle:</strong> Ingestion → Storage → Transformation → Serving → Archiving.</p><p><strong>Idempotency:</strong> Re-running a pipeline yields the same result without data duplication.</p>",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": []
    },
    "1.13": {
        "id": "1.13",
        "stage": "Stage 3: Concepts",
        "module": "Processing",
        "title": "Batch vs Micro Batch vs Streaming",
        "subtitle": "Choosing the paradigm",
        "duration": "🕒 10 min read",
        "difficulty": "Intermediate",
        "theory": "<ul><li><strong>Batch:</strong> High latency (daily), high throughput, low cost.</li><li><strong>Micro Batch:</strong> Medium latency (15 mins), e.g., Snowpipe.</li><li><strong>Streaming:</strong> Low latency (sub-second), high complexity (Kafka).</li></ul>",
        "hasDiagram": false,
        "hasTable": false,
        "interviewQuestions": []
    }
};
