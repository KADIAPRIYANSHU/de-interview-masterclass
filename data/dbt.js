window.dbtLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "dbt Core & Manifest",
    "title": "dbt Core & Compilation",
    "subtitle": "The compiler engine, target directory, profiles config, and the manifest.json.",
    "duration": "🕒 15 min read",
    "difficulty": "Beginner to Intermediate",
    "theory": "\n            <h3>What is dbt?</h3>\n            <p>dbt compiles SQL files with Jinja expressions and sends them to your data warehouse (e.g., Snowflake) for execution. It manages the **T** (Transformation) of ETL/ELT pipelines.</p>\n\n            <h3>How Compilation Works</h3>\n            <p>dbt parses Jinja expressions and compiles raw SQL files inside the <code>target/compiled/</code> directory. The full project lineage, configurations, and metadata are saved in a single output JSON file called <code>manifest.json</code>.</p>\n\n            <h3>Connecting with Profiles</h3>\n            <p>Connection paths, targets (dev, prod, qa), database credentials, and roles are configured in your local <code>profiles.yml</code> file to keep access details out of version control repositories.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is manifest.json and why is it important?",
            "answer": "The `manifest.json` is a metadata file compiled by dbt containing details of every model, source, test, and relationship in the project DAG. It is used by CI/CD pipelines to compare state changes and only run modified code."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "Model Materializations",
    "title": "Model Materializations",
    "subtitle": "Views, Tables, Ephemeral, and Custom configurations.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Materializations</h3>\n            <p>Materializations dictate how a SQL model is built inside the target database:</p>\n            <ul>\n                <li><strong>View:</strong> Recreates standard views (Default). Fast compile, slow read.</li>\n                <li><strong>Table:</strong> Rebuilds the model as a physical table using a CTAS query on every run.</li>\n                <li><strong>Incremental:</strong> Inserts or merges only modified rows. Highly efficient.</li>\n                <li><strong>Ephemeral:</strong> Embeds the model query as a Common Table Expression (CTE) directly inside downstream models.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "title": "Materialization Strategies",
        "headers": [
            "Materialization",
            "Database Object Created",
            "Performance"
        ],
        "rows": [
            [
                "View",
                "VIEW",
                "Fast compile, slower downstream query"
            ],
            [
                "Table",
                "TABLE (Full build)",
                "Slow compile, fast downstream query"
            ],
            [
                "Incremental",
                "TABLE (Delta merge)",
                "Fast run time for massive tables"
            ],
            [
                "Ephemeral",
                "NONE (CTE in compiler)",
                "Optimizes database resource count"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "What is the difference between Table and Incremental materializations?",
            "answer": "Table drops and rebuilds the physical database object from scratch on every run. Incremental only processes new or updated records since the last dbt execution, saving database compute costs."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "Sources Freshness",
    "title": "Sources, Freshness & Data Lineage",
    "subtitle": "Configure freshness checks, dynamic loaded_at limits, and warning policies.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Source Freshness</h3>\n            <p>To avoid processing stale or delayed data from raw sources, dbt allows you to configure **Freshness Checks** in your source YAML configurations. You specify a timestamp column to evaluate and define freshness limits:</p>\n            <pre><code>sources:\n  - name: raw_sales\n    tables:\n      - name: orders\n        freshness:\n          warn_after: {count: 6, period: hour}\n          error_after: {count: 12, period: hour}\n        loaded_at_field: order_date</code></pre>\n            <p>Running <code>dbt source freshness</code> calculates the delta time since the newest timestamp in <code>loaded_at_field</code> and warns or errors if thresholds are exceeded.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you check if source data ingestion has stalled using dbt?",
            "answer": "Define a <code>freshness</code> block inside the source table's schema YAML, configuring <code>loaded_at_field</code> to point to the ingestion timestamp, and run <code>dbt source freshness</code>. dbt will warning/error if the newest record age exceeds the thresholds."
        },
        {
            "question": "What parameters are required for source freshness checks?",
            "answer": "You need `loaded_at_field` (the timestamp column in the source table) and thresholds (like `warn_after` and `error_after` defining integer counts and time periods like hours or days)."
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Advanced Ingest & Custom Rules",
    "module": "Incremental Strategy",
    "title": "Incremental Load Strategies",
    "subtitle": "Append, merge, delete+insert, insert+overwrite, and unique keys.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Incremental Strategies</h3>\n            <p> dbt uses different SQL strategies to load delta data:</p>\n            <ul>\n                <li><strong>merge:</strong> Default on Snowflake. Runs a SQL MERGE statement matching primary key parameters.</li>\n                <li><strong>append:</strong> Appends incoming rows blindly (fast, but risks duplicate records).</li>\n                <li><strong>delete+insert:</strong> Deletes existing records matching unique keys, then inserts new rows.</li>\n                <li><strong>insert+overwrite:</strong> Overwrites specific partitions (highly cost-effective on BigQuery).</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle duplicate rows in an incremental model run?",
            "answer": "Configure a <code>unique_key</code> in your config block. dbt will use the merge or delete+insert strategy to update existing matching keys instead of creating duplicate records."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Advanced Ingest & Custom Rules",
    "module": "Snapshots",
    "title": "dbt Snapshots (SCD Type 2)",
    "subtitle": "Track historical records changes over time automatically.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Snapshots</h3>\n            <p> dbt Snapshots record the history of changes (SCD Type 2) on raw tables, adding columns like <code>dbt_valid_from</code>, <code>dbt_valid_to</code>, and <code>dbt_updated_at</code>.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What columns are added automatically to a Snapshot table by dbt?",
            "answer": "dbt adds `dbt_scd_id`, `dbt_updated_at`, `dbt_valid_from`, and `dbt_valid_to` columns to track active and historical record time bounds."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Advanced Ingest & Custom Rules",
    "module": "Seeds & Analyses",
    "title": "Seeds & Analyses",
    "subtitle": "Handle static reference lookups and test one-off SQL compiles.",
    "duration": "🕒 12 min read",
    "difficulty": "Beginner",
    "theory": "\n            <h3>Seeds & Analyses</h3>\n            <p>Seeds are CSV files stored inside <code>seeds/</code> compiled into database tables. Analyses are compiled SQL files inside <code>analyses/</code> that do not create database objects.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "When should you use dbt Seeds?",
            "answer": "Only for small, static lookup datasets (like country code mappings) committed to version control Git. Do not use seeds for raw transaction tables."
        }
    ]
},
    "2.4": {
    "id": "2.4",
    "stage": "Stage 2: Advanced Ingest & Custom Rules",
    "module": "Contracts & Constraints",
    "title": "Model Contracts & DB Constraints",
    "subtitle": "Schema enforcement, column typing, and enforcing data constraints.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>dbt Model Contracts</h3>\n            <p>A Model Contract is a new feature in dbt that enforces that your model's database outputs match an exact structure defined in your YAML file. If the compiled SQL does not match the contract (e.g. data types differ or column counts do not align), the build fails before writing to the database.</p>\n            <pre><code>models:\n  - name: my_model\n    config:\n      contract:\n        enforced: true\n    columns:\n      - name: user_id\n        data_type: integer\n        constraints:\n          - type: not_null\n          - type: primary_key</code></pre>\n            <h3>Database Constraints</h3>\n            <p>Enforcing a contract lets dbt apply constraints directly on your target database tables (e.g. 'primary_key', 'foreign_key', 'not_null', and 'check').</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a Model Contract and how does it prevent schema changes?",
            "answer": "A Model Contract is a configuration where you explicitly define columns and data types in a schema YAML. If developer changes the SQL model and compiles a query with different columns or types, dbt aborts the run before the table is written, ensuring data schema safety."
        },
        {
            "question": "Can dbt enforce primary keys on databases that don't support constraints (like Snowflake)?",
            "answer": "Snowflake doesn't enforce primary key constraints (it permits duplicate values). However, defining constraints in dbt contracts helps downstream tools read table relationships and assists BI indexes."
        }
    ]
},
    "2.5": {
    "id": "2.5",
    "stage": "Stage 2: Advanced Ingest & Custom Rules",
    "module": "Unit Testing",
    "title": "dbt Unit Testing",
    "subtitle": "Writing model unit tests using mock fixture data and expected outputs.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Unit Testing in dbt</h3>\n            <p>Unit tests let you validate your SQL transformations using static, mock inputs (fixture data) before running the model against live warehouse tables. This ensures your math, logic, and data mappings function exactly as designed.</p>\n            <p>You define mock values and expected output rows in a YAML file inside the 'tests/' directory:</p>\n            <pre><code>unit_tests:\n  - name: test_calculate_sales\n    model: calculate_sales\n    given:\n      - input: ref('stg_orders')\n        rows:\n          - {order_id: 1, price: 10, discount: 2}\n    expect:\n      rows:\n        - {order_id: 1, net_sales: 8}</code></pre>\n            <p>dbt compiles the model, feeds it the mock inputs, and matches the outputs against the expected rows.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a dbt Unit Test and how does it differ from a standard dbt Data Test?",
            "answer": "A standard Data Test checks the live tables in the warehouse for anomalies. A Unit Test validates the SQL query logic itself using static mock data rows inside a config file, checking if inputs translate to correct outputs without reading live database tables."
        },
        {
            "question": "How do you set up mock data for unit tests?",
            "answer": "Configure the test inside a YAML file, declaring inputs using the `given` property (referencing source tables or models) and inputting key-value rows matching column parameters."
        }
    ]
},
    "3.1": {
    "id": "3.1",
    "stage": "Stage 3: Templating & Lifecycle",
    "module": "Jinja & Macros",
    "title": "Jinja & Macros",
    "subtitle": "Write dynamic, reusable SQL operations and schema naming overrides.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Jinja & Macros</h3>\n            <p>Jinja is a templating engine for writing loops and conditionals. Macros are reusable blocks of SQL functions configured in the <code>macros/</code> directory.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a Macro in dbt?",
            "answer": "A Macro is a block of reusable SQL logic parameterized using Jinja. It acts like a function, letting you write DRY (Don't Repeat Yourself) code."
        }
    ]
},
    "3.2": {
    "id": "3.2",
    "stage": "Stage 3: Templating & Lifecycle",
    "module": "Hooks",
    "title": "Pre & Post Run Hooks",
    "subtitle": "Execute custom SQL commands during startup, finish, and run cycles.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>dbt Hooks</h3>\n            <p>Hooks run SQL commands at specific model phases: <code>pre-hook</code> (before a model builds), <code>post-hook</code> (after a model builds), <code>on-run-start</code> (at the start of a run), and <code>on-run-end</code> (at the end of a run).</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you configure a post-hook to grant SELECT access?",
            "answer": "Add it globally in `dbt_project.yml`: <code>+post-hook: \"grant select on {{ this }} to role analyst_role;\"</code>."
        }
    ]
},
    "3.3": {
    "id": "3.3",
    "stage": "Stage 3: Templating & Lifecycle",
    "module": "dbt Packages",
    "title": "dbt Packages & Hub Manager",
    "subtitle": "Importing libraries: dbt-utils, dbt-expectations, codegen, and audit-helper.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Package Management</h3>\n            <p>dbt allows importing external libraries from the dbt Hub Registry. You declare package dependencies in a <code>packages.yml</code> file:</p>\n            <pre><code>packages:\n  - package: dbt-labs/dbt_utils\n    version: 1.1.0\n  - package: calogica/dbt_expectations\n    version: 0.8.0</code></pre>\n            <p>Running <code>dbt deps</code> downloads these packages to your project folder.</p>\n            <h3>Popular Packages</h3>\n            <ul>\n                <li><strong>dbt_utils:</strong> Standard utility macros (like surrogate keys generating, pivoting, unioning).</li>\n                <li><strong>dbt_expectations:</strong> Port of Python Great Expectations tests for advanced data testing.</li>\n                <li><strong>codegen:</strong> Macros to automatically write staging model files and schemas, saving hours of manual coding.</li>\n                <li><strong>audit_helper:</strong> Runs outer joins comparing development model tables with production tables to check migration issues.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What package would you use to check row values against standard data distributions or regex patterns?",
            "answer": "The <code>dbt_expectations</code> package, which contains advanced assertions like regex matches and standard deviation threshold tests."
        },
        {
            "question": "How do you install third-party packages in dbt?",
            "answer": "List the packages and versions inside a <code>packages.yml</code> configuration file, then execute the command <code>dbt deps</code> in the terminal."
        }
    ]
},
    "3.4": {
    "id": "3.4",
    "stage": "Stage 3: Templating & Lifecycle",
    "module": "Python Models",
    "title": "dbt Python Models",
    "subtitle": "Mixed SQL/Python DAGs, DataFrame transformations, and Snowpark.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Python Models in dbt</h3>\n            <p>Data science tasks or complex string cleanups can be difficult in SQL. dbt allows you to write models in **Python** (for Snowflake, Databricks, or BigQuery). Python models return a DataFrame which dbt materializes as a table/view:</p>\n            <pre><code>def model(dbt, session):\n    dbt.config(materialized=\"table\")\n    my_sql_model = dbt.ref(\"stg_orders\")\n    \n    # Python DataFrame operations\n    df = my_sql_model.filter(my_sql_model[\"price\"] > 100)\n    return df</code></pre>\n            <p>This allows mixed pipelines where SQL models load staging layers, and Python models calculate statistical scores or train ML models.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How does a Python model execute in a Snowflake environment?",
            "answer": "dbt compiles the Python function and executes it inside Snowflake using **Snowpark Python UDFs/Stored Procedures**, running on the virtual warehouse compute nodes without moving data."
        },
        {
            "question": "Can Python models reference SQL models in dbt?",
            "answer": "Yes. You import parent SQL models in Python using the standard <code>dbt.ref('model_name')</code> method, which dbt compiles into dataframes."
        }
    ]
},
    "4.1": {
    "id": "4.1",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "Metrics & Semantic Layer",
    "title": "dbt Semantic Layer & MetricFlow",
    "subtitle": "Defining measures, metrics, dimensions, and semantic access models.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>What is the Semantic Layer?</h3>\n            <p>Previously, BI tools defined business metrics (like 'revenue' or 'churn') separately, causing calculation inconsistencies. The **dbt Semantic Layer** (using **MetricFlow**) lets you define metrics in dbt configuration files. BI tools query these metrics via APIs, ensuring everyone uses the same math.</p>\n            <h3>Semantic Components</h3>\n            <ul>\n                <li><strong>Measure:</strong> Core numerical metrics (e.g. sum of order totals, count of customer IDs).</li>\n                <li><strong>Dimension:</strong> Categorical attributes (e.g. order date, customer country).</li>\n                <li><strong>Metric:</strong> The final calculated KPI, combining measures over dimensions (e.g., Average Order Value).</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the purpose of the dbt Semantic Layer?",
            "answer": "To centralize the definition of business metrics (like monthly recurring revenue) in dbt repository code, allowing BI dashboards to consume identical calculations dynamically."
        },
        {
            "question": "What is the difference between a Measure and a Metric in MetricFlow?",
            "answer": "A Measure is an aggregation input directly from database columns (like SUM of sales). A Metric is the final business KPI defined on top of one or more measures (like Gross Profit Margin)."
        }
    ]
},
    "4.2": {
    "id": "4.2",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "State Artifacts",
    "title": "dbt State Artifacts & Slim CI",
    "subtitle": "Manifest, catalog, run_results, and sources metadata schemas.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>State Artifact Files</h3>\n            <p>Every time you run or compile, dbt generates JSON artifacts inside target/:</p>\n            <ul>\n                <li><strong>manifest.json:</strong> The full DAG configuration metadata.</li>\n                <li><strong>catalog.json:</strong> Database table schemas, sizes, and column metadata.</li>\n                <li><strong>run_results.json:</strong> Statistics of the previous execution run (duration, query IDs).</li>\n                <li><strong>sources.json:</strong> Freshness checks execution details.</li>\n            </ul>\n            <h3>Slim CI Implementation</h3>\n            <p>Slim CI compares local feature branch changes against production's <code>manifest.json</code>. You run: </p>\n            <p><code>dbt run --select state:modified+ --state path/to/prod</code></p>\n            <p>This runs only the modified models, avoiding full database rebuilds during PR checks.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What artifacts are required to run a dbt Slim CI state check?",
            "answer": "You need the <code>manifest.json</code> artifact from the previous successful production build. dbt uses it as a benchmark to identify code differences."
        }
    ]
},
    "4.3": {
    "id": "4.3",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "Orchestration & Tuning",
    "title": "Orchestration & Performance Tuning",
    "subtitle": "Thread tuning, partial parsing, Airflow, Dagster, and Prefect.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "<h3>Performance Tuning dbt Runs</h3><ul><li><strong>Threads:</strong> Configure threads (concurrency) in 'profiles.yml' (e.g. threads=8). This dictates how many tables dbt can compile and build simultaneously in the warehouse.</li><li><strong>Partial Parsing:</strong> Enabling partial parsing compiles only changed files, skipping unchanged configurations, reducing local CPU start delays.</li></ul><h3>Orchestration Frameworks</h3><p>In production pipelines, dbt is triggered by orchestrators:</p><ul><li><strong>Airflow:</strong> Executes dbt CLI commands via bash tasks or Cosmos operators.</li><li><strong>Dagster:</strong> Native integration that reads the dbt manifest and schedules models as individual assets.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you choose the correct thread count for a dbt project?",
            "answer": "It depends on database size and concurrency limits. A standard range is 4-16 threads. If set too high, you run into query concurrency queueing in your data warehouse. If too low, compile times will increase."
        },
        {
            "question": "Why is Dagster popular for orchestrating dbt compared to standard Airflow?",
            "answer": "Dagster parses the 'manifest.json' file and treats each model as an independent, observable software asset, allowing metadata and test checks to be managed individually rather than running dbt as a single opaque block."
        }
    ]
},
    "4.4": {
    "id": "4.4",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "Exposures",
    "title": "dbt Exposures",
    "subtitle": "Document and track downstream consumers of your dbt models in dashboards and ML pipelines.",
    "duration": "🕒 10 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>What are Exposures?</h3>\n            <p><strong>Exposures</strong> are dbt metadata objects that document the downstream consumers of your models — BI dashboards, ML models, APIs, and other data products. They create a complete lineage picture showing not just how raw data becomes models, but how models are consumed externally.</p>\n            <pre><code>-- exposures.yml\nexposures:\n  - name: weekly_sales_dashboard\n    type: dashboard\n    maturity: high\n    url: https://metabase.company.com/dashboard/12\n    description: |\n      Tracks weekly revenue by region.\n      Used by the Sales leadership team every Monday.\n    owner:\n      name: Priyanshu Kadia\n      email: priyanshu@company.com\n    depends_on:\n      - ref('fct_sales')\n      - ref('dim_customers')</code></pre>\n            <h3>Why Exposures Matter</h3>\n            <ul>\n                <li><strong>Impact analysis:</strong> When you modify a source model, dbt can show which downstream dashboards and ML pipelines depend on it, helping you assess risk before deploying.</li>\n                <li><strong>Documentation:</strong> Exposures appear in dbt Docs as nodes in the DAG, showing the full data lineage from raw sources through models to business outputs.</li>\n                <li><strong>Team ownership:</strong> Each exposure has an owner field, making it clear who to notify when upstream models change.</li>\n                <li><strong>Freshness SLAs:</strong> You can specify a maturity level (low/medium/high) to indicate business criticality and set expectations for data freshness.</li>\n            </ul>\n            <h3>Exposure Types</h3>\n            <p>dbt supports the following exposure types: <code>dashboard</code>, <code>notebook</code>, <code>analysis</code>, <code>ml</code>, <code>application</code>. The type is metadata-only and does not change dbt's build behavior.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What problem do dbt Exposures solve that model YAML alone cannot?",
            "answer": "Model YAML documents the model itself but not its consumers. Exposures complete the lineage by documenting which dashboards, ML models, and applications depend on each dbt model. Without Exposures, you cannot perform impact analysis — you don't know which business outputs break when you modify a model."
        },
        {
            "question": "How do you use Exposures for impact analysis in practice?",
            "answer": "Run 'dbt ls --select +exposure:my_exposure_name' to list all models that the exposure depends on. If you are modifying 'fct_sales', run 'dbt ls --select fct_sales+' to see all downstream models and exposures that reference it, allowing you to assess blast radius before deploying."
        }
    ]
},
    "4.5": {
    "id": "4.5",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "dbt Cloud vs Core",
    "title": "dbt Cloud vs. dbt Core",
    "subtitle": "Understand the key differences and when to use each deployment model.",
    "duration": "🕒 12 min read",
    "difficulty": "Beginner to Intermediate",
    "theory": "\n            <h3>dbt Core</h3>\n            <p><strong>dbt Core</strong> is the open-source Python library installed via pip. It compiles and runs dbt projects from your local machine or CI/CD environment. It has no built-in UI, scheduler, or cloud state management.</p>\n            <pre><code>pip install dbt-snowflake\ndbt run --profiles-dir ~/.dbt\ndbt test\ndbt docs generate</code></pre>\n            <h3>dbt Cloud</h3>\n            <p><strong>dbt Cloud</strong> is the managed SaaS platform from dbt Labs that wraps dbt Core with a web IDE, job scheduler, environment management, audit logs, SSO, and the Semantic Layer API.</p>\n            <h3>Key Differences</h3>\n            <ul>\n                <li><strong>Scheduler:</strong> dbt Core has none — you need Airflow, Dagster, or a cron job. dbt Cloud has a built-in job scheduler with cron support and run history.</li>\n                <li><strong>IDE:</strong> dbt Core uses any text editor. dbt Cloud has a browser-based IDE with SQL preview, lineage explorer, and git integration.</li>\n                <li><strong>Environments:</strong> dbt Core manages environments via profiles.yml manually. dbt Cloud manages development, staging, and production environments with isolated credentials.</li>\n                <li><strong>CI/CD:</strong> dbt Core integrates with GitHub Actions / Azure DevOps manually. dbt Cloud has native Slim CI (runs only changed models using state comparison).</li>\n                <li><strong>Semantic Layer:</strong> The dbt Semantic Layer (MetricFlow) API is only available in dbt Cloud paid tiers for external BI tool consumption.</li>\n                <li><strong>Cost:</strong> dbt Core is free. dbt Cloud ranges from free (Developer tier, 1 seat) to Enterprise pricing.</li>\n            </ul>\n        \n\n            <h3>Environment Management</h3>\n            <p>Both Core and Cloud support strict environment isolation:</p>\n            <ul>\n                <li><strong>dev:</strong> Isolated developer schemas (e.g., <code>dbt_pkadia</code>).</li>\n                <li><strong>qa:</strong> Staging environment for CI/CD testing.</li>\n                <li><strong>prod:</strong> The official production environment.</li>\n            </ul>\n\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "headers": [
            "Feature",
            "dbt Core",
            "dbt Cloud"
        ],
        "rows": [
            [
                "Scheduler",
                "No (external tool needed)",
                "Yes (built-in)"
            ],
            [
                "Web IDE",
                "No",
                "Yes"
            ],
            [
                "Slim CI",
                "Manual setup",
                "Yes (native)"
            ],
            [
                "Semantic Layer API",
                "No",
                "Yes (paid tiers)"
            ],
            [
                "Cost",
                "Free (open source)",
                "Free tier + paid plans"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "When would you choose dbt Core over dbt Cloud in production?",
            "answer": "Choose dbt Core when your organization uses Airflow or Dagster for orchestration (avoiding dual schedulers), when cost is a constraint on large teams, or when you need full control over environment configuration. dbt Cloud is better when you want a unified platform with a built-in scheduler, web IDE, and Slim CI without managing external orchestration infrastructure."
        },
        {
            "question": "What is dbt Slim CI and how does it reduce build times?",
            "answer": "Slim CI uses dbt's state comparison feature to run only models that have changed since the last successful production run. By comparing the current project against the production manifest.json artifact, dbt identifies modified models and their downstream dependencies, skipping unchanged models entirely. This can reduce CI runtime from 60 minutes to under 5 minutes for large projects."
        }
    ]
},
    "4.6": {
    "id": "4.6",
    "stage": "Stage 4: Enterprise Ops & CI/CD",
    "module": "Semantic Layer Consumption",
    "title": "dbt Semantic Layer & Consumption Tools",
    "subtitle": "Define metrics once in dbt and query them from any BI or analytics tool.",
    "duration": "🕒 12 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Semantic Layer Problem</h3>\n            <p>Without a semantic layer, every BI tool, notebook, and API independently defines the same metric (e.g. 'revenue') with slightly different SQL logic, causing inconsistent numbers across reports. The <strong>dbt Semantic Layer</strong> solves this by defining metrics centrally in dbt and exposing them through a single querying API.</p>\n            <h3>MetricFlow</h3>\n            <p><strong>MetricFlow</strong> is the underlying engine powering the dbt Semantic Layer. You define metrics, measures, entities, and dimensions in YAML, and MetricFlow compiles them into optimized SQL at query time.</p>\n            <pre><code>-- metrics.yml\nmetrics:\n  - name: total_revenue\n    label: Total Revenue\n    description: Gross revenue before refunds\n    type: simple\n    type_params:\n      measure: revenue_amount\n    filter: |\n      {{ Dimension('order__status') }} = 'completed'</code></pre>\n            <h3>Consumption Interfaces</h3>\n            <ul>\n                <li><strong>dbt Cloud Semantic Layer API:</strong> GraphQL and JDBC endpoints that BI tools query directly.</li>\n                <li><strong>Native BI integrations:</strong> Tableau, Looker, Power BI, and Hex can connect natively via the Semantic Layer API, fetching metrics without raw SQL.</li>\n                <li><strong>Python SDK:</strong> Data scientists query metrics in Jupyter notebooks using the dbt-sl-sdk package.</li>\n                <li><strong>dbt CLI:</strong> 'dbt sl query --metrics total_revenue --group-by metric_time__month' for ad-hoc metric queries.</li>\n            </ul>\n            <h3>Key Benefits</h3>\n            <ul>\n                <li>Single source of truth for metric definitions — change once in dbt, reflects everywhere.</li>\n                <li>Business users query metrics without writing SQL — BI tools fetch pre-defined dimensions and measures.</li>\n                <li>Governance: metric definitions are version-controlled in Git alongside the models that power them.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the core problem the dbt Semantic Layer solves?",
            "answer": "It eliminates metric inconsistency caused by each BI tool defining the same business metric independently with different SQL logic. By centralizing metric definitions in dbt using MetricFlow, all downstream tools (Tableau, Looker, Python notebooks) query the same pre-defined metric logic through a single API, ensuring every report shows the same number."
        },
        {
            "question": "What is the difference between a Measure and a Metric in dbt MetricFlow?",
            "answer": "A Measure is a raw aggregation defined on a semantic model (e.g. SUM(revenue_amount)). A Metric is a higher-level business concept built on top of measures, optionally with filters, ratios, or cumulative windows applied. Multiple metrics can reference the same underlying measure with different filters or time grains."
        }
    ]
},
    "1.16": {
    "id": "1.16",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "Packages",
    "title": "dbt Packages",
    "subtitle": "dbt_utils, dbt_expectations, codegen",
    "duration": "🕒 5 min read",
    "difficulty": "Intermediate",
    "theory": "<p>Packages extend dbt functionality. Defined in <code>packages.yml</code>.</p><ul><li><strong>dbt_utils:</strong> Common macros (surrogate key, pivot).</li><li><strong>dbt_expectations:</strong> Great Expectations port for advanced testing.</li><li><strong>codegen:</strong> Auto-generates YAML files.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.17": {
    "id": "1.17",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "Environment",
    "title": "Environment Variables",
    "subtitle": "env_var()",
    "duration": "🕒 5 min read",
    "difficulty": "Intermediate",
    "theory": "<p>Use <code>{{ env_var('MY_VAR') }}</code> in <code>profiles.yml</code> or <code>dbt_project.yml</code> to securely pass credentials and dynamic configs.</p>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.18": {
    "id": "1.18",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "CLI",
    "title": "State Commands",
    "subtitle": "ls, build, clone",
    "duration": "🕒 5 min read",
    "difficulty": "Intermediate",
    "theory": "<ul><li><code>dbt ls</code>: Lists all resources (models, tests).</li><li><code>dbt build</code>: Runs models, tests, snapshots, and seeds in DAG order.</li><li><code>dbt clone</code>: Creates zero-copy clones in Snowflake.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.19": {
    "id": "1.19",
    "stage": "Stage 1: Core Architecture & Models",
    "module": "Project Structure",
    "title": "Project Structure",
    "subtitle": "Understanding folders.",
    "duration": "🕒 10 min read",
    "difficulty": "Beginner",
    "theory": "<ul><li><code>models/</code>: SQL files.</li><li><code>tests/</code>: Singular tests.</li><li><code>macros/</code>: Jinja functions.</li><li><code>snapshots/</code>: SCD Type 2 logic.</li><li><code>analyses/</code>: Ad-hoc SQL.</li><li><code>dbt_project.yml</code>: Main config.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
}
};
