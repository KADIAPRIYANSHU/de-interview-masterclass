window.fundamentalsLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: Warehousing Design",
        module: "Architecture Concepts",
        title: "Lakehouse, Data Lake & Warehouses",
        subtitle: "Medallion Architecture (Bronze/Silver/Gold) and Kimball vs. Inmon design.",
        duration: "🕒 15 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Architecture Comparison",
            headers: ["Metric", "Kimball Paradigm", "Inmon Paradigm"],
            rows: [
                ["Design Model", "De-normalized Star Schemas", "Normalized 3NF Entity-Relation"],
                ["Primary Goal", "Optimized for user query speed", "Single source of truth integrity"],
                ["Data Marts", "DWH is the union of data marts", "Data marts sourced from the DWH"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the Medallion Architecture and what is the goal of the Silver layer?",
                answer: "The Medallion Architecture is a data design pattern divided into Bronze (raw ingestion), Silver (cleansed/standardized data), and Gold (BI-ready facts/dimensions). The goal of Silver is to clean, deduplicate, and conform data so it acts as the clean integration layer."
            },
            {
                question: "Compare Kimball vs. Inmon warehousing design methodologies.",
                answer: "Kimball focuses on a bottom-up approach using denormalized Star Schemas (optimized for performance). Inmon uses a top-down, highly normalized 3NF central repository (optimized for data consistency and reducing duplicates) with downstream data marts."
            }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: Warehousing Design",
        module: "Dimensional Modeling",
        title: "Star Schema vs. Snowflake Schema",
        subtitle: "Fact tables, Dimension tables, and normalization trade-offs.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Why do columnar databases (like Snowflake) prefer Star Schemas over Snowflake Schemas?",
                answer: "Star Schemas reduce the number of SQL JOINs required to execute queries. Columnar storage engines handle the redundant data in denormalized tables easily via compression algorithms, making normalization in dimension tables unnecessary."
            },
            {
                question: "What is the difference between a Fact table and a Dimension table?",
                answer: "Fact tables capture business transactions containing numerical measurements and keys. Dimension tables capture descriptive attributes (context) about the transaction (who, what, where, when)."
            }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: Warehousing Design",
        module: "SCD Types",
        title: "Slowly Changing Dimensions (SCD 0-6)",
        subtitle: "Implement SCD Type 0, 1, 2, 3, 4, and 6 with real production examples.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "SCD Strategy Summary",
            headers: ["SCD Type", "Storage Action", "History Kept", "Query Complexity"],
            rows: [
                ["Type 0", "Ignore changes", "Original state only", "Lowest"],
                ["Type 1", "Overwrite row", "No history", "Lowest"],
                ["Type 2", "Insert new row", "Full history", "Medium (Requires date filter)"],
                ["Type 3", "Add new column", "Partial history (2 versions)", "Low"],
                ["Type 4", "Write audit table", "Full history (Audit log)", "High (Requires outer joins)"],
                ["Type 6", "Insert row + current col", "Full history + easy lookup", "High"]
            ]
        },
        interviewQuestions: [
            {
                question: "How do you implement an SCD Type 2 merge SQL statement?",
                answer: "Use a SQL MERGE statement that performs a union check. For modified source rows, it runs an UPDATE on the target table setting `is_active = FALSE` and `end_date = CURRENT_DATE()`, and an INSERT to write the new active row with `is_active = TRUE`."
            },
            {
                question: "What is SCD Type 6 and why would an enterprise use it?",
                answer: "SCD Type 6 is a hybrid approach. It inserts a new row to track history (Type 2) but adds a column to store the current active value (Type 3) on all historical rows. This lets users query historic stats easily without running date range joins."
            }
        ]
    },
    "1.4": {
        id: "1.4",
        stage: "Stage 1: Warehousing Design",
        module: "Special Dimensions",
        title: "Special Dimensions & Bridge Tables",
        subtitle: "Degenerate, Junk, Factless Facts, and Late Arriving Dimensions.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Advanced Dimensional Modeling</h3>
            <ul>
                <li><strong>Degenerate Dimension:</strong> A dimension attribute stored directly in the fact table without joining to a dimension table (e.g. invoice numbers, transaction IDs).</li>
                <li><strong>Junk Dimension:</strong> A single dimension table that groups multiple low-cardinality flags and indicators (like status = Y/N, payment_method = cash/credit) to keep the fact table narrow.</li>
                <li><strong>Factless Fact Table:</strong> A fact table that contains no numerical measurements, only foreign keys (e.g. student attendance tracking representing 'events' or relationships).</li>
                <li><strong>Bridge Table:</strong> Used to resolve many-to-many relationships between dimensions and facts (e.g. an order having multiple sales reps with split commissions).</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is a Late Arriving Dimension and how do you handle it?",
                answer: "A Late Arriving Dimension occurs when a transaction (Fact) arrives before the master detail record (Dimension). Handle this by inserting a placeholder dimension row with a dummy status and matching key. When the real master record arrives, update the dummy row using Type 1 rules."
            },
            {
                question: "What is a Junk Dimension and why is it used?",
                answer: "A Junk Dimension consolidates multiple small flags and indicator columns into a single lookup table. This prevents the fact table from holding dozens of separate flag keys, optimizing join paths and indexes."
            }
        ]
    },
    "1.5": {
        id: "1.5",
        stage: "Stage 1: Warehousing Design",
        module: "Data Vault",
        title: "Data Vault 2.0",
        subtitle: "Hubs, Links, and Satellites modeling architecture.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>What is Data Vault?</h3>
            <p>Data Vault 2.0 is a modeling design optimized for enterprise data warehouses running on massively parallel processors. Unlike Kimball, it separates business keys, relationships, and context columns into distinct objects.</p>
            <h3>Core Data Vault Entities</h3>
            <ul>
                <li><strong>Hubs:</strong> Core business keys (e.g. <code>customer_id</code>). Contains only the hash key, business key, load timestamp, and record source.</li>
                <li><strong>Links:</strong> Represent many-to-many associations or relationships between Hubs (e.g., an Order link connecting a Customer Hub and a Product Hub).</li>
                <li><strong>Satellites:</strong> Hold descriptive context and history over time for a Hub or Link (e.g. customer addresses, product pricing). All history is Type 2 by design.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What are the three core table types in Data Vault 2.0?",
                answer: "Hubs (store business keys), Links (store associations/relationships between keys), and Satellites (store the descriptive context and historical changes)."
            },
            {
                question: "Why does Data Vault use Hash Keys instead of sequential primary keys?",
                answer: "Hash keys (like MD5 or SHA256 of the business key) can be calculated independently on each staging pipeline, allowing parallel loads to execute simultaneously without calling central sequence generators, optimizing load performance."
            }
        ]
    },
    "2.1": {
        id: "2.1",
        stage: "Stage 2: Advanced Modeling & Quality",
        module: "Normalization Grains",
        title: "Normalization vs. Denormalization",
        subtitle: "1NF, 2NF, 3NF schema constraints, grains, and cardinality.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Database Normalization</h3>
            <p>Normalization structures relational databases to minimize redundancy:</p>
            <ul>
                <li><strong>1NF (First Normal Form):</strong> Atomic values per cell, no repeating groups.</li>
                <li><strong>2NF (Second Normal Form):</strong> Meets 1NF, and all non-key columns depend fully on the primary key (no partial dependencies).</li>
                <li><strong>3NF (Third Normal Form):</strong> Meets 2NF, and no non-key columns depend transitively on the primary key.</li>
            </ul>
            <h3>The Concept of Grain</h3>
            <p>The **Grain** of a table represents the level of detail captured by a single row (e.g. one row per transaction line item vs. one row per daily transaction summary). Defining the grain clearly is the first step in dimensional modeling.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Why do transactional databases (OLTP) use 3NF, while analytical databases (OLAP) use denormalized schemas?",
                answer: "OLTP systems optimize for fast write operations, so 3NF prevents anomalies and redundancy during inserts/updates. OLAP systems optimize for complex reads and scans; denormalization merges tables to avoid slow JOIN operations."
            }
        ]
    },
    "2.2": {
        id: "2.2",
        stage: "Stage 2: Advanced Modeling & Quality",
        module: "Database Keys",
        title: "Surrogate Keys vs. Natural Keys",
        subtitle: "Manage composite keys, natural keys, and surrogate hash generation.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Database Keys</h3>
            <ul>
                <li><strong>Natural Key:</strong> A key that has logical business meaning (e.g. SSN, Email, Product SKU).</li>
                <li><strong>Surrogate Key:</strong> A database-generated identifier with no business meaning (e.g. autoincrementing integers, UUIDs, or MD5 hashes).</li>
                <li><strong>Composite Key:</strong> A primary key composed of multiple columns. Avoided in Fact tables due to high join complexity.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Why are Surrogate Keys preferred over Natural Keys inside a Data Warehouse?",
                answer: "Natural Keys can change in source databases (e.g. a customer changes their email). Surrogate keys isolate the data warehouse from source changes, enforce unique keys inside the warehouse, and optimize join sizes."
            }
        ]
    },
    "2.3": {
        id: "2.3",
        stage: "Stage 2: Advanced Modeling & Quality",
        module: "Data Quality",
        title: "Data Quality & Data Reconciliation",
        subtitle: "Great Expectations, custom data assertions, and reconciliation audits.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Data Quality Frameworks</h3>
            <p>Data quality checks prevent bad data from polluting downstream dashboards. Standard checks include schema validations, completeness (NULL ratios), and value bounds checks.</p>
            <h3>Reconciliation Audits</h3>
            <p>A reconciliation process runs daily to audit that target tables match source totals (e.g., comparing <code>SUM(sales_amount)</code> on the raw source file against the warehouse Gold layer sales metrics).</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you implement data reconciliation checks in production ETL?",
                answer: "Deploy a validation job at the end of the pipeline that queries source transaction counts and dollar sums, compares them against target row counts and database sums, and logs the variance. Fail the pipeline run if the variance is non-zero."
            }
        ]
    },
    "2.4": {
        id: "2.4",
        stage: "Stage 2: Advanced Modeling & Quality",
        module: "Performance Concepts",
        title: "Performance Engineering Concepts",
        subtitle: "Partitioning, predicate pushdowns, broadcast joins, and data skew.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Performance Engineering</h3>
            <ul>
                <li><strong>Partitioning:</strong> Physically dividing tables by date or ID keys to minimize read scans.</li>
                <li><strong>Predicate Pushdown:</strong> Evaluating filtering expressions as early as possible during data scans.</li>
                <li><strong>Data Skew:</strong> An unequal distribution of keys across cluster nodes (e.g. 90% of sales match key 'NULL'). This causes one node to do 90% of the work, slowing down the entire cluster.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is Data Skew and how do you resolve it in join operations?",
                answer: "Data Skew occurs when values are unevenly distributed, forcing a single cluster partition node to process a massive bottleneck. Resolve it by filtering out null keys before joining, or adding a random 'salt' value to the join key to distribute rows evenly."
            }
        ]
    },
    "2.5": {
        id: "2.5",
        stage: "Stage 2: Advanced Modeling & Quality",
        module: "Security Architecture",
        title: "Enterprise Security Architecture",
        subtitle: "RBAC vs. ABAC, encryption keys, and secrets rotation.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Access Control Models</h3>
            <ul>
                <li><strong>RBAC (Role-Based Access Control):</strong> Permissions granted to roles (e.g. 'sales_analyst') mapped to users.</li>
                <li><strong>ABAC (Attribute-Based Access Control):</strong> Permissions evaluated dynamically based on attributes (e.g. user department, IP address, access time).</li>
            </ul>
            <h3>Encryption & Keys</h3>
            <p>Data should be encrypted at rest and in transit. Customer-Managed Keys (CMK) allow enterprises to rotate and control their own encryption keys on cloud warehouses.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is the difference between RBAC and ABAC?",
                answer: "RBAC grants permissions based on static role definitions. ABAC evaluates permissions dynamically using characteristics of the user, resource, and request context (e.g., location, time, department) to determine access."
            }
        ]
    }
};

