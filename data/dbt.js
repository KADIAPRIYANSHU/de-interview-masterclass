window.dbtLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: Core Architecture & Models",
        module: "dbt Core & Manifest",
        title: "dbt Core & Compilation",
        subtitle: "The compiler engine, target directory, profiles config, and the manifest.json.",
        duration: "🕒 15 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
            <h3>What is dbt?</h3>
            <p>dbt compiles SQL files with Jinja expressions and sends them to your data warehouse (e.g., Snowflake) for execution. It manages the **T** (Transformation) of ETL/ELT pipelines.</p>

            <h3>How Compilation Works</h3>
            <p>dbt parses Jinja expressions and compiles raw SQL files inside the <code>target/compiled/</code> directory. The full project lineage, configurations, and metadata are saved in a single output JSON file called <code>manifest.json</code>.</p>

            <h3>Connecting with Profiles</h3>
            <p>Connection paths, targets (dev, prod, qa), database credentials, and roles are configured in your local <code>profiles.yml</code> file to keep access details out of version control repositories.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is manifest.json and why is it important?",
                answer: "The `manifest.json` is a metadata file compiled by dbt containing details of every model, source, test, and relationship in the project DAG. It is used by CI/CD pipelines to compare state changes and only run modified code."
            }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: Core Architecture & Models",
        module: "Model Materializations",
        title: "Model Materializations",
        subtitle: "Views, Tables, Ephemeral, and Custom configurations.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Materializations</h3>
            <p>Materializations dictate how a SQL model is built inside the target database:</p>
            <ul>
                <li><strong>View:</strong> Recreates standard views (Default). Fast compile, slow read.</li>
                <li><strong>Table:</strong> Rebuilds the model as a physical table using a CTAS query on every run.</li>
                <li><strong>Incremental:</strong> Inserts or merges only modified rows. Highly efficient.</li>
                <li><strong>Ephemeral:</strong> Embeds the model query as a Common Table Expression (CTE) directly inside downstream models.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Materialization Strategies",
            headers: ["Materialization", "Database Object Created", "Performance"],
            rows: [
                ["View", "VIEW", "Fast compile, slower downstream query"],
                ["Table", "TABLE (Full build)", "Slow compile, fast downstream query"],
                ["Incremental", "TABLE (Delta merge)", "Fast run time for massive tables"],
                ["Ephemeral", "NONE (CTE in compiler)", "Optimizes database resource count"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the difference between Table and Incremental materializations?",
                answer: "Table drops and rebuilds the physical database object from scratch on every run. Incremental only processes new or updated records since the last dbt execution, saving database compute costs."
            }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: Core Architecture & Models",
        module: "Sources Freshness",
        title: "Sources, Freshness & Data Lineage",
        subtitle: "Configure freshness checks, dynamic loaded_at limits, and warning policies.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you check if source data ingestion has stalled using dbt?",
                answer: "Define a <code>freshness</code> block inside the source table's schema YAML, configuring <code>loaded_at_field</code> to point to the ingestion timestamp, and run <code>dbt source freshness</code>. dbt will warning/error if the newest record age exceeds the thresholds."
            },
            {
                question: "What parameters are required for source freshness checks?",
                answer: "You need `loaded_at_field` (the timestamp column in the source table) and thresholds (like `warn_after` and `error_after` defining integer counts and time periods like hours or days)."
            }
        ]
    },
    "2.1": {
        id: "2.1",
        stage: "Stage 2: Advanced Ingest & Custom Rules",
        module: "Incremental Strategy",
        title: "Incremental Load Strategies",
        subtitle: "Append, merge, delete+insert, insert+overwrite, and unique keys.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Incremental Strategies</h3>
            <p> dbt uses different SQL strategies to load delta data:</p>
            <ul>
                <li><strong>merge:</strong> Default on Snowflake. Runs a SQL MERGE statement matching primary key parameters.</li>
                <li><strong>append:</strong> Appends incoming rows blindly (fast, but risks duplicate records).</li>
                <li><strong>delete+insert:</strong> Deletes existing records matching unique keys, then inserts new rows.</li>
                <li><strong>insert+overwrite:</strong> Overwrites specific partitions (highly cost-effective on BigQuery).</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you handle duplicate rows in an incremental model run?",
                answer: "Configure a <code>unique_key</code> in your config block. dbt will use the merge or delete+insert strategy to update existing matching keys instead of creating duplicate records."
            }
        ]
    },
    "2.2": {
        id: "2.2",
        stage: "Stage 2: Advanced Ingest & Custom Rules",
        module: "Snapshots",
        title: "dbt Snapshots (SCD Type 2)",
        subtitle: "Track historical records changes over time automatically.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Snapshots</h3>
            <p> dbt Snapshots record the history of changes (SCD Type 2) on raw tables, adding columns like <code>dbt_valid_from</code>, <code>dbt_valid_to</code>, and <code>dbt_updated_at</code>.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What columns are added automatically to a Snapshot table by dbt?",
                answer: "dbt adds `dbt_scd_id`, `dbt_updated_at`, `dbt_valid_from`, and `dbt_valid_to` columns to track active and historical record time bounds."
            }
        ]
    },
    "2.3": {
        id: "2.3",
        stage: "Stage 2: Advanced Ingest & Custom Rules",
        module: "Seeds & Analyses",
        title: "Seeds & Analyses",
        subtitle: "Handle static reference lookups and test one-off SQL compiles.",
        duration: "🕒 12 min read",
        difficulty: "Beginner",
        theory: `
            <h3>Seeds & Analyses</h3>
            <p>Seeds are CSV files stored inside <code>seeds/</code> compiled into database tables. Analyses are compiled SQL files inside <code>analyses/</code> that do not create database objects.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "When should you use dbt Seeds?",
                answer: "Only for small, static lookup datasets (like country code mappings) committed to version control Git. Do not use seeds for raw transaction tables."
            }
        ]
    },
    "2.4": {
        id: "2.4",
        stage: "Stage 2: Advanced Ingest & Custom Rules",
        module: "Contracts & Constraints",
        title: "Model Contracts & DB Constraints",
        subtitle: "Schema enforcement, column typing, and enforcing data constraints.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is a Model Contract and how does it prevent schema changes?",
                answer: "A Model Contract is a configuration where you explicitly define columns and data types in a schema YAML. If developer changes the SQL model and compiles a query with different columns or types, dbt aborts the run before the table is written, ensuring data schema safety."
            },
            {
                question: "Can dbt enforce primary keys on databases that don't support constraints (like Snowflake)?",
                answer: "Snowflake doesn't enforce primary key constraints (it permits duplicate values). However, defining constraints in dbt contracts helps downstream tools read table relationships and assists BI indexes."
            }
        ]
    },
    "2.5": {
        id: "2.5",
        stage: "Stage 2: Advanced Ingest & Custom Rules",
        module: "Unit Testing",
        title: "dbt Unit Testing",
        subtitle: "Writing model unit tests using mock fixture data and expected outputs.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is a dbt Unit Test and how does it differ from a standard dbt Data Test?",
                answer: "A standard Data Test checks the live tables in the warehouse for anomalies. A Unit Test validates the SQL query logic itself using static mock data rows inside a config file, checking if inputs translate to correct outputs without reading live database tables."
            },
            {
                question: "How do you set up mock data for unit tests?",
                answer: "Configure the test inside a YAML file, declaring inputs using the `given` property (referencing source tables or models) and inputting key-value rows matching column parameters."
            }
        ]
    },
    "3.1": {
        id: "3.1",
        stage: "Stage 3: Templating & Lifecycle",
        module: "Jinja & Macros",
        title: "Jinja & Macros",
        subtitle: "Write dynamic, reusable SQL operations and schema naming overrides.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Jinja & Macros</h3>
            <p>Jinja is a templating engine for writing loops and conditionals. Macros are reusable blocks of SQL functions configured in the <code>macros/</code> directory.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is a Macro in dbt?",
                answer: "A Macro is a block of reusable SQL logic parameterized using Jinja. It acts like a function, letting you write DRY (Don't Repeat Yourself) code."
            }
        ]
    },
    "3.2": {
        id: "3.2",
        stage: "Stage 3: Templating & Lifecycle",
        module: "Hooks",
        title: "Pre & Post Run Hooks",
        subtitle: "Execute custom SQL commands during startup, finish, and run cycles.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>dbt Hooks</h3>
            <p>Hooks run SQL commands at specific model phases: <code>pre-hook</code> (before a model builds), <code>post-hook</code> (after a model builds), <code>on-run-start</code> (at the start of a run), and <code>on-run-end</code> (at the end of a run).</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you configure a post-hook to grant SELECT access?",
                answer: "Add it globally in `dbt_project.yml`: <code>+post-hook: \"grant select on {{ this }} to role analyst_role;\"</code>."
            }
        ]
    },
    "3.3": {
        id: "3.3",
        stage: "Stage 3: Templating & Lifecycle",
        module: "dbt Packages",
        title: "dbt Packages & Hub Manager",
        subtitle: "Importing libraries: dbt-utils, dbt-expectations, codegen, and audit-helper.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What package would you use to check row values against standard data distributions or regex patterns?",
                answer: "The <code>dbt_expectations</code> package, which contains advanced assertions like regex matches and standard deviation threshold tests."
            },
            {
                question: "How do you install third-party packages in dbt?",
                answer: "List the packages and versions inside a <code>packages.yml</code> configuration file, then execute the command <code>dbt deps</code> in the terminal."
            }
        ]
    },
    "3.4": {
        id: "3.4",
        stage: "Stage 3: Templating & Lifecycle",
        module: "Python Models",
        title: "dbt Python Models",
        subtitle: "Mixed SQL/Python DAGs, DataFrame transformations, and Snowpark.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Python Models in dbt</h3>
            <p>Data science tasks or complex string cleanups can be difficult in SQL. dbt allows you to write models in **Python** (for Snowflake, Databricks, or BigQuery). Python models return a DataFrame which dbt materializes as a table/view:</p>
            <pre><code>def model(dbt, session):
    dbt.config(materialized="table")
    my_sql_model = dbt.ref("stg_orders")
    
    # Python DataFrame operations
    df = my_sql_model.filter(my_sql_model["price"] > 100)
    return df</code></pre>
            <p>This allows mixed pipelines where SQL models load staging layers, and Python models calculate statistical scores or train ML models.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How does a Python model execute in a Snowflake environment?",
                answer: "dbt compiles the Python function and executes it inside Snowflake using **Snowpark Python UDFs/Stored Procedures**, running on the virtual warehouse compute nodes without moving data."
            },
            {
                question: "Can Python models reference SQL models in dbt?",
                answer: "Yes. You import parent SQL models in Python using the standard <code>dbt.ref('model_name')</code> method, which dbt compiles into dataframes."
            }
        ]
    },
    "4.1": {
        id: "4.1",
        stage: "Stage 4: Enterprise Ops & CI/CD",
        module: "Metrics & Semantic Layer",
        title: "dbt Semantic Layer & MetricFlow",
        subtitle: "Defining measures, metrics, dimensions, and semantic access models.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>What is the Semantic Layer?</h3>
            <p>Previously, BI tools defined business metrics (like 'revenue' or 'churn') separately, causing calculation inconsistencies. The **dbt Semantic Layer** (using **MetricFlow**) lets you define metrics in dbt configuration files. BI tools query these metrics via APIs, ensuring everyone uses the same math.</p>
            <h3>Semantic Components</h3>
            <ul>
                <li><strong>Measure:</strong> Core numerical metrics (e.g. sum of order totals, count of customer IDs).</li>
                <li><strong>Dimension:</strong> Categorical attributes (e.g. order date, customer country).</li>
                <li><strong>Metric:</strong> The final calculated KPI, combining measures over dimensions (e.g., Average Order Value).</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is the purpose of the dbt Semantic Layer?",
                answer: "To centralize the definition of business metrics (like monthly recurring revenue) in dbt repository code, allowing BI dashboards to consume identical calculations dynamically."
            },
            {
                question: "What is the difference between a Measure and a Metric in MetricFlow?",
                answer: "A Measure is an aggregation input directly from database columns (like SUM of sales). A Metric is the final business KPI defined on top of one or more measures (like Gross Profit Margin)."
            }
        ]
    },
    "4.2": {
        id: "4.2",
        stage: "Stage 4: Enterprise Ops & CI/CD",
        module: "State Artifacts",
        title: "dbt State Artifacts & Slim CI",
        subtitle: "Manifest, catalog, run_results, and sources metadata schemas.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What artifacts are required to run a dbt Slim CI state check?",
                answer: "You need the <code>manifest.json</code> artifact from the previous successful production build. dbt uses it as a benchmark to identify code differences."
            }
        ]
    },
    "4.3": {
        id: "4.3",
        stage: "Stage 4: Enterprise Ops & CI/CD",
        module: "Orchestration & Tuning",
        title: "Orchestration & Performance Tuning",
        subtitle: "Thread tuning, partial parsing, Airflow, Dagster, and Prefect.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: '<h3>Performance Tuning dbt Runs</h3><ul><li><strong>Threads:</strong> Configure threads (concurrency) in \'profiles.yml\' (e.g. threads=8). This dictates how many tables dbt can compile and build simultaneously in the warehouse.</li><li><strong>Partial Parsing:</strong> Enabling partial parsing compiles only changed files, skipping unchanged configurations, reducing local CPU start delays.</li></ul><h3>Orchestration Frameworks</h3><p>In production pipelines, dbt is triggered by orchestrators:</p><ul><li><strong>Airflow:</strong> Executes dbt CLI commands via bash tasks or Cosmos operators.</li><li><strong>Dagster:</strong> Native integration that reads the dbt manifest and schedules models as individual assets.</li></ul>',
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you choose the correct thread count for a dbt project?",
                answer: "It depends on database size and concurrency limits. A standard range is 4-16 threads. If set too high, you run into query concurrency queueing in your data warehouse. If too low, compile times will increase."
            },
            {
                question: "Why is Dagster popular for orchestrating dbt compared to standard Airflow?",
                answer: "Dagster parses the 'manifest.json' file and treats each model as an independent, observable software asset, allowing metadata and test checks to be managed individually rather than running dbt as a single opaque block."
            }
        ]
    }
};

