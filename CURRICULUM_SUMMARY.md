# Data Engineering Masterclass — Complete Project Summary

> **Live URL:** [https://de-interview-masterclass.vercel.app](https://de-interview-masterclass.vercel.app)
> **Local Dev:** `http://localhost:8003`
> **Workspace:** `d:\Snowflake Learning`
> **Last Updated:** July 2026

---

## 🛠️ Platform & Application Features

### Core Architecture
| File | Purpose |
|------|---------|
| `index.html` | Single-page HTML shell — all UI structure, sidebar, modals, action buttons |
| `style.css` | Full design system — dark/light themes, glassmorphism, CSS custom properties |
| `app.js` | SPA router & LMS engine — tech switcher, sidebar rendering, lesson loading, all LMS event bindings |
| `data/snowflake.js` | 18-module Snowflake curriculum dataset |
| `data/adf.js` | 15-module Azure Data Factory curriculum dataset |
| `data/dbt.js` | 15-module dbt curriculum dataset |
| `data/sql.js` | 10-module SQL Masterclass curriculum dataset |
| `data/python.js` | 10-module Python curriculum dataset |
| `data/fundamentals.js` | 10-module Data Engineering Fundamentals dataset |
| `data/devops_obs.js` | 8-module DevOps & Observability curriculum dataset |
| `data/aide.js` | 8-module AI for Data Engineering curriculum dataset |
| `vercel.json` | Vercel static deployment config |
| `.gitignore` | Git ignore for OS/editor/Vercel artifacts |

### 🎮 Interactive LMS Features (all persisted to `localStorage`)

| Feature | How It Works |
|---------|-------------|
| **8-Domain Tech Switcher** | One-click tabs switch between Snowflake / ADF / dbt / SQL / Python / Fundamentals / DevOps / AI in DE — sidebar and content reload instantly |
| **Dynamic Data-Driven Sidebar** | Built by `renderSidebar()` from JS data objects — groups topics by Stage, filters live on search/bookmark toggle |
| **Collapsible Q&A Accordion** | Senior interview questions rendered as click-to-expand panels with `aria-expanded` accessibility |
| **Progress Bar** | Tracks completed modules across **all 8 domains** — shows `X%` with animated fill bar |
| **Mark Completed** | Toggle ✅/⬜ per topic per domain — sidebar shows `✓` indicator next to completed topics |
| **Bookmark / Favorite** | Toggle ★/☆ per topic per domain — sidebar shows `★` indicator next to bookmarked topics |
| **Show Bookmarks Only** | Checkbox filter that hides all non-bookmarked topics from the sidebar |
| **Live Search** | Real-time text filter on sidebar — matches topic title, ID, subtitle, or theory content |
| **Notes Textarea** | Per-topic auto-saving text editor — keyed as `notes_{tech}_{lessonId}` in localStorage |
| **Recently Viewed** | Tracks last 5 topics across all domains with clickable navigation links at sidebar bottom |
| **Copy Code Buttons** | Injected dynamically into every `<pre>` block — shows "Copied!" confirmation for 2 seconds |
| **Download Code Examples** | Extracts all code blocks from current topic into a `.sql` or `.py` file download |
| **Light / Dark Theme** | Toggle persisted to localStorage — dark default with full `body.light-theme` CSS overrides |
| **Responsive Mobile Layout** | Sliding sidebar drawer for viewports under 992px |
| **Comparison Tables** | Auto-rendered HTML tables from `tableData` objects in lesson data |

### 🚀 Deployment
- **Platform:** Vercel (Free tier)
- **Account:** `kadiapriyanshu-7517s-projects` (GitHub: `kadiapriyanshu@gmail.com`)
- **Production URL:** `https://de-interview-masterclass.vercel.app`
- **Deploy command:** `npx vercel --prod` from `d:\Snowflake Learning`
- **Git:** Initialized at `d:\Snowflake Learning\.git` (branch: `master`)

---

## ❄️ 1. Snowflake Curriculum — 18 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Architecture Basics** | 3-layer architecture, virtual warehouses, micro-partitions, result/metadata/warehouse cache |
| 1.2 | **Warehouse Scaling** | Vertical scale-up vs. horizontal multi-cluster, concurrency queuing, Query Acceleration Service (QAS) |
| 1.3 | **Performance Optimization** | Query Profile, local SSD cache vs. remote disk spill, pruning efficiency |
| 1.4 | **Clustering Internals** | Automatic re-clustering, `SYSTEM$CLUSTERING_INFORMATION`, DML & reclustering interaction |
| 1.5 | **Query Optimization** | Explain plans, Predicate/Projection Pushdown, Hash vs. Broadcast Joins |
| 1.6 | **Security & Governance** | RBAC hierarchies, Dynamic Data Masking, Row Access Policies, Future Grants |
| 1.7 | **Advanced SQL Operations** | QUALIFY deduplication, MERGE upserts, Recursive CTEs, Stored Procedures |
| 1.8 | **Zero-Copy Cloning** ⭐ | DB/Schema/Table clone, Clone vs. CTAS, Time Travel clones, storage billing |
| 1.9 | **Time Travel Deep Dive** ⭐ | `AT(timestamp)`, `BEFORE(statement)`, `UNDROP`, retention by edition |
| 1.10 | **Fail-safe Architecture** | Internal disaster recovery, lifecycle vs. Time Travel, what customers cannot recover |
| 1.11 | **Semi-Structured Parsing** | VARIANT compression, dot-notation, `LATERAL FLATTEN` array unwrapping |
| 1.12 | **File Formats** | CSV/JSON/Parquet/Avro/ORC, NULL overrides, compression formats |
| 1.13 | **External Stages** | S3/Azure/ADLS/GCS configs, Storage Integrations, IAM trust roles |
| 1.14 | **Internal Stages** | User/Table/Named Stages, PUT, GET, LIST, REMOVE via SnowSQL |
| 1.15 | **Data Ingestion** | COPY INTO, Snowpipe serverless vs. Snowpipe Streaming, validation modes |
| 1.16 | **Account Usage & Metadata** | `ACCOUNT_USAGE` vs. `INFORMATION_SCHEMA` latency, query history billing audits |
| 1.17 | **CLI & Connectors** | SnowSQL, Kafka/Spark/Python connectors, JDBC/ODBC, SQLAlchemy |
| 1.18 | **Replication & Ecosystem** | DB Replication, Failover Groups, Native Apps, Data Sharing, Clean Rooms |

---

## ☁️ 2. Azure Data Factory Curriculum — 15 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Integration Runtimes** | Azure IR serverless, Self-Hosted IR HA active-active failover, hub-spoke sharing |
| 1.2 | **SHIR Performance** | Node concurrent job limits (max 96), CPU/memory bottlenecks, VPN links |
| 1.3 | **Network Isolation** | Managed VNet, Private Endpoints, locking ADLS Gen2 from public access |
| 1.4 | **Credential Security** | Linked Services, Key Vault secrets, Managed Identity dynamic retrieval |
| 1.5 | **Dataset Parameters** | Parameterized datasets, dynamic directory paths, dynamic filenames |
| 1.6 | **Parameters vs. Variables** | Read-only pipeline params vs. writable internal state variables |
| 1.7 | **Control Flow Activities** | Get Metadata, Lookup (5,000 row cap), ForEach loops, conditional execution |
| 1.8 | **REST API Integration** | Web/WebHook activities, OAuth2 bearer tokens, headers, API pagination |
| 1.9 | **Copy Activity Optimizations** | Parallel copies, compression, Staged copies, fault tolerance (skip corrupt rows) |
| 2.1 | **Mapping Data Flows** | Code-free transformations, Broadcast Join optimization, Schema Drift handling |
| 2.2 | **Incremental Ingestion** | Watermark tables, Change Data Capture (CDC), tracking hard deletes |
| 2.3 | **Custom Logging Framework** | Pipeline duration, execution IDs, row counts logged to custom SQL audit tables |
| 2.4 | **Trigger Types** | Schedule, Tumbling Window (dependencies & backfills), event triggers, manual |
| 2.5 | **Error Recovery** | Retry limits, retry intervals, dead-letter storage, failed-activity reruns |
| 2.6 | **DevOps & Fabric** | Git integrations, ARM parameter overrides, Bicep/Terraform IaC, ADF vs. Fabric |

---

## 📊 3. dbt Curriculum — 15 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Compilation Engine** | CLI compile, profiles.yml, target paths, manifest.json dependency schemas |
| 1.2 | **Model Materializations** | Views, Tables, Ephemeral CTEs, custom materializations, `generate_schema_name` |
| 1.3 | **Sources & Freshness** | Source mapping, warning/error freshness thresholds, dynamic freshness checks |
| 1.4 | **Incremental Strategies** | Append, merge, delete+insert, insert_overwrite strategies |
| 1.5 | **Snapshots (SCD Type 2)** | Historical tracking via timestamp or check-hash column comparisons |
| 1.6 | **Seeds & Analyses** | Loading lookup CSVs (`dbt seed`), compiling standalone analytical queries |
| 2.1 | **Testing Framework** | Generic tests (not_null, unique, accepted_values), singular tests, `dbt test` |
| 2.2 | **Jinja & Macros** | DRY compilation, custom macros, schema overrides, `run_query` functions |
| 2.3 | **Lifecycle Hooks** | Pre/post hooks, `on-run-start`, `on-run-end` scripts |
| 2.4 | **Model Contracts** | Enforced schema contracts, column data type checking, preventing drift |
| 2.5 | **Unit Testing** | Mock fixture data, expected output validation, `dbt test --select` |
| 3.1 | **dbt Packages** | dbt Hub imports (dbt_utils, dbt_expectations, codegen, audit_helper) |
| 3.2 | **Python Models** | Python model blocks, Snowpark DataFrame integration, mixed SQL/Python DAGs |
| 3.3 | **Metrics & Semantic Layer** | MetricFlow, measure/entity/dimension definitions, centralized KPIs |
| 3.4 | **State & Tuning** | `run_results.json`, `--state` selection, thread concurrency, Airflow/Dagster orchestration |

---

## 🔑 4. SQL Masterclass — 10 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Logical Execution Order** | FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT |
| 1.2 | **Joins & NULL Handling** | INNER/OUTER/CROSS/SELF joins, three-valued logic, `IS NULL` vs `= NULL` |
| 1.3 | **Grouping Sets & Cubes** | `GROUPING SETS`, `ROLLUP` hierarchies, `CUBE` multidimensional aggregations |
| 1.4 | **Window Functions** | `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD` analytics |
| 1.5 | **CTEs & Subqueries** | Recursive CTE org-chart traversals vs. correlated subquery bottlenecks |
| 1.6 | **Tuning & Indexing** | B-Tree vs. Clustered indices, Index Scan vs. Seek, `EXPLAIN` plan analysis |
| 1.7 | **Set Optimizations** | `UNION` vs `UNION ALL` overhead, `INTERSECT`, `EXCEPT`, `EXISTS` vs `IN` semi-joins |
| 1.8 | **DML & Transactions** | `DELETE` row logging vs. `TRUNCATE` deallocation, ACID isolation anomalies (dirty reads) |
| 1.9 | **Sliding Window Frames** | `ROWS` vs `RANGE` frame bounds, `UNBOUNDED PRECEDING`, current row positions |
| 1.10 | **UDFs vs. Stored Procedures** | Return types, `SELECT` block limitations, DML writes, `CALL` statements |

---

## 🐍 5. Python Prep — 10 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Core Data Structures** | Lists vs. Tuples vs. Sets, dict hash maps, list comprehensions |
| 1.2 | **OOP & Functional** | Classes, inheritance, lambdas, `yield` generators, decorators/wrappers |
| 1.3 | **File I/O Handlers** | `with open` context managers, CSV, JSON, PyArrow Parquet formats |
| 1.4 | **Logging & Exceptions** | `try/except` specifics, custom error objects, `logging` module structured setup |
| 1.5 | **REST API Integrations** | `requests` library, OAuth2 headers, timeouts, exponential backoff retries |
| 1.6 | **pandas DataFrames** | Series vs. DataFrame, null counting, `.loc`/`.iloc` indexing |
| 1.7 | **pandas Advanced** | `groupby` aggregations, `merge`, category dtype memory optimization |
| 1.8 | **PySpark Core** | Driver vs. Executor orchestration, RDD pipelines, Lazy Evaluation triggers |
| 1.9 | **PySpark Transformations** | Spark aggregate APIs, partitioned window bounds, Broadcast Join shuffle avoidance |
| 1.10 | **Testing & pytest** | Reusable `fixtures`, mocking DB/API connections with `unittest.mock` |

---

## 📚 6. Data Engineering Fundamentals — 10 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Warehousing Paradigms** | Lakehouse vs. Lake vs. Warehouse, Medallion (Bronze/Silver/Gold), Kimball vs. Inmon |
| 1.2 | **Dimensional Modeling** | Fact vs. Dimension tables, Star Schema vs. Snowflake Schema |
| 1.3 | **SCD Deep Dive** | SCD Types 0, 1, 2, 3, 4, and 6 with real-world examples |
| 1.4 | **Special Dimensions** | Degenerate, Junk, Factless Fact tables, Late Arriving Dimensions |
| 1.5 | **Data Vault 2.0** | Hubs (keys), Links (relationships), Satellites (context), hash keys |
| 1.6 | **Normalization Rules** | OLTP 1NF/2NF/3NF vs. OLAP denormalization, table grain, cardinality |
| 1.7 | **Keys & Relationships** | Surrogate vs. Natural vs. Composite keys, hash-based key generation |
| 1.8 | **Data Quality Frameworks** | Ingestion assertions, Great Expectations, target reconciliation audits |
| 1.9 | **Performance Engineering** | Partitioning, clustering, predicate pushdown, shuffle, Spark data skew |
| 1.10 | **Security Architecture** | RBAC vs. ABAC, Customer Managed Keys, secret rotation strategies |

---

## ⚙️ 7. DevOps & Observability — 8 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Git & Branching** | Feature branches, GitFlow, PR approval policies |
| 1.2 | **CI/CD Automation** | GitHub Actions, Azure DevOps release tasks, linters, unit test runners |
| 1.3 | **Infrastructure as Code** | Terraform providers, Azure Bicep templates, environment deployments |
| 1.4 | **Structured Audit Logs** | JSON logging schema, execution GUID tracing, log aggregation |
| 1.5 | **Observability Telemetry** | Query statistics monitoring, pipeline duration tracking, performance dashboards |
| 1.6 | **Alerting Frameworks** | SLA/SLO thresholds, Teams/Slack/PagerDuty webhook integrations |
| 1.7 | **Data Lineage** | Downstream dependency tracing, column-level lineage, impact analysis |
| 1.8 | **Governance Catalogs** | Azure Purview metadata indexing, business glossary, PII classification tagging |

---

## 🤖 8. AI for Data Engineering — 8 Modules

| ID | Module | Topics Covered |
|----|--------|---------------|
| 1.1 | **Cortex AI & COMPLETE** | LLMs inside SQL, `SNOWFLAKE.CORTEX.COMPLETE`, prompt configs, token costs |
| 1.2 | **Cortex Search Indexes** | Text ingestion, keyword query indices, search service architecture |
| 1.3 | **Vector Embeddings** | `EMBED_TEXT` generation, `VECTOR_COSINE_SIMILARITY` distance calculations |
| 1.4 | **RAG Architecture** | Retrieval-Augmented Generation, unstructured file stages, similarity retrieval |
| 1.5 | **AI SQL Generation** | Natural language → warehouse SQL query translation |
| 1.6 | **Model Context Protocol** | Connecting AI agents to remote warehouse catalogs and schemas (MCP) |
| 1.7 | **AI-Assisted ETL** | Schema drift mapping, unstructured syslog parsing, SQL template generation |
| 1.8 | **External AI Services** | OpenAI API integration, Snowflake network rules, secrets management |

---

## 📁 Project File Structure

```
d:\Snowflake Learning\
├── index.html              # SPA shell — all UI elements
├── style.css               # Full design system (dark/light themes)
├── app.js                  # Router, LMS engine, all event listeners
├── vercel.json             # Vercel static deployment config
├── .gitignore              # Git ignore
├── CURRICULUM_SUMMARY.md   # This document
└── data/
    ├── snowflake.js        # 18 Snowflake modules
    ├── adf.js              # 15 ADF modules
    ├── dbt.js              # 15 dbt modules
    ├── sql.js              # 10 SQL modules
    ├── python.js           # 10 Python modules
    ├── fundamentals.js     # 10 Fundamentals modules
    ├── devops_obs.js       # 8 DevOps & Obs modules
    └── aide.js             # 8 AI in DE modules
```

**Total Curriculum:** 94 detailed learning modules across 8 technology domains.

---

## 🔧 How to Redeploy After Changes

```powershell
# Stage and commit changes
cd "d:\Snowflake Learning"
git add .
git commit -m "your change description"

# Push to Vercel production
npx vercel --prod
```

> The Vercel account is `kadiapriyanshu@gmail.com`. Auth token is cached locally via the Vercel CLI.
