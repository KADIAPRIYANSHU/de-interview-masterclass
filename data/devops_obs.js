window.devopsObsLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: DevOps & Automation",
    "module": "Version Control",
    "title": "GitFlow & Environments",
    "subtitle": "Branching strategies for data engineering.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Branching Strategies in DE</h3>\n            <p>Data Engineering requires strict environment separation (Dev, QA, Prod). Code changes should flow through branches mapping to these environments.</p>\n            <ul>\n                <li><strong>Feature Branches:</strong> Where developers write code and test against the Dev database.</li>\n                <li><strong>Main/Master Branch:</strong> Represents the Production environment. Never push directly here.</li>\n            </ul>\n            <h3>The CI/CD Bridge</h3>\n            <p>When a Pull Request (PR) is merged from a feature branch to main, the CI/CD pipeline triggers, running tests and deploying the SQL/Python code to the production database.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle schema changes across environments in GitFlow?",
            "answer": "Schema changes (DDL) should be version-controlled using tools like Flyway, Liquibase, or dbt. A PR merge to the main branch triggers the CI/CD pipeline to execute the DDL scripts sequentially against the production environment before running any ETL jobs."
        },
        {
            "question": "Why is it dangerous to test data pipelines against production data in a Dev environment?",
            "answer": "It risks PII data exposure, violates compliance (GDPR/HIPAA), and can accidentally overwrite production state if connection strings are misconfigured. Dev should use mocked, masked, or zero-copy cloned data."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: DevOps & Automation",
    "module": "CI/CD",
    "title": "CI/CD for Data Pipelines",
    "subtitle": "Automating testing and deployment.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Continuous Integration (CI)</h3>\n            <p>CI in data engineering means automatically testing code when a Pull Request is opened. This includes SQL linting (e.g., SQLFluff), Python unit testing (pytest), and running dbt build against a temporary CI schema.</p>\n            <h3>Continuous Deployment (CD)</h3>\n            <p>CD is the automated rollout to Production after a merge. It replaces manual deployment steps with pipeline scripts (GitHub Actions, GitLab CI, Azure DevOps).</p>\n            <ul>\n                <li><strong>Blue/Green Deployments:</strong> Deploying the new data models alongside the old ones, swapping a pointer (like a view), and dropping the old models if successful. Ensures zero downtime.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is SQL linting and why include it in a CI pipeline?",
            "answer": "SQL linting (using tools like SQLFluff) enforces code style, formatting, and best practices automatically. Including it in CI prevents messy, unreadable, or non-performant SQL from being merged into the codebase."
        },
        {
            "question": "How do you implement zero-downtime deployments in a data warehouse?",
            "answer": "By using Blue/Green deployments. You build the new tables in a separate schema (Green). Once validation passes, you use a fast metadata operation (like swapping a View definition or renaming a database) to point production traffic to the new schema, resulting in zero query downtime."
        },
        {
            "question": "How does dbt help with Continuous Integration?",
            "answer": "dbt has a 'defer' state feature. In CI, dbt can build only the modified models and their downstream dependencies in a temporary schema, deferring unchanged models to the production state. This drastically reduces CI run times and compute costs."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: DevOps & Automation",
    "module": "Infrastructure",
    "title": "IaC (Terraform) in DE",
    "subtitle": "Managing Snowflake and Cloud resources via code.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Infrastructure as Code (IaC)</h3>\n            <p>IaC replaces clicking through cloud provider UIs with declarative code files. Terraform is the industry standard for this.</p>\n            <h3>Managing Snowflake with Terraform</h3>\n            <p>You can manage Snowflake Warehouses, Databases, Roles, and Users using the Snowflake Terraform provider. This ensures your infrastructure is version-controlled, auditable, and reproducible across environments.</p>\n            <h3>State Management</h3>\n            <p>Terraform uses a \"state file\" to track the real-world resources it manages. This state file must be stored securely (e.g., in an S3 bucket with state locking via DynamoDB) to prevent concurrent modification by multiple engineers.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why use Terraform to manage Snowflake roles instead of running GRANT statements manually?",
            "answer": "Manual GRANTs lead to configuration drift, where the actual state diverges from what is expected, causing security vulnerabilities. Terraform ensures the role hierarchy and privileges are codified, peer-reviewed, and consistently enforced across Dev/QA/Prod."
        },
        {
            "question": "What happens if someone manually modifies a resource that is managed by Terraform?",
            "answer": "The next time Terraform runs, it detects the configuration drift by comparing the real-world state against the state file and code. Terraform will automatically revert the manual changes to match the declared code, ensuring the code remains the source of truth."
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Observability & Monitoring",
    "module": "Logging",
    "title": "Structured Logging",
    "subtitle": "JSON logging for automated analysis.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>The Problem with Plain Text</h3>\n            <p>Logging <code>\"Pipeline failed for customer 123\"</code> is easy for humans to read, but terrible for machines to parse. If you need to alert when failures spike above 10%, plain text requires brittle regex parsing.</p>\n            <h3>Structured Logging (JSON)</h3>\n            <p>Structured logging outputs logs as JSON objects. This allows log aggregators (Datadog, Splunk, ELK) to instantly index keys and create dashboards.</p>\n            <pre><code>{\"timestamp\": \"2023-10-01T12:00:00Z\", \"level\": \"ERROR\", \"pipeline\": \"sales_etl\", \"customer_id\": 123, \"error_code\": \"API_TIMEOUT\"}</code></pre>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why is JSON logging preferred in modern data platforms over plain text logging?",
            "answer": "JSON logging allows log management systems to parse and index fields automatically without complex regex. This enables engineers to easily filter logs, aggregate metrics (e.g., count of ERRORs grouped by pipeline_name), and trigger automated alerts."
        },
        {
            "question": "What metadata should you always include in a structured log for an ETL pipeline?",
            "answer": "Essential metadata includes a unique run_id (for tracing), timestamp, severity level, pipeline/model name, task name, environment (dev/prod), and any relevant entity IDs (like batch_id or customer_id)."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Observability & Monitoring",
    "module": "Data Quality",
    "title": "SLA, SLO, and SLI",
    "subtitle": "Measuring data reliability.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Defining Reliability</h3>\n            <ul>\n                <li><strong>SLI (Service Level Indicator):</strong> A direct measurement of reality. Example: \"98.5% of daily pipeline runs finished before 8 AM.\"</li>\n                <li><strong>SLO (Service Level Objective):</strong> The internal target you want to hit. Example: \"We aim for 99% of pipelines to finish before 8 AM.\"</li>\n                <li><strong>SLA (Service Level Agreement):</strong> The external business contract that states what happens if you miss the SLO (e.g., refunding customers). Data engineering teams usually focus on SLOs, not SLAs.</li>\n            </ul>\n            <h3>Data Freshness vs Data Quality</h3>\n            <p>Observability isn't just about pipelines running successfully. A pipeline can succeed while loading 100% NULL values. True SLOs must measure Data Freshness (time since last update), Data Volume (row counts), and Data Quality (anomaly detection).</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between an SLI and an SLO?",
            "answer": "An SLI is the actual metric measured over a period of time (e.g., 99.2% success rate). An SLO is the target objective set by the team (e.g., 99.0%). If the SLI drops below the SLO, the team must prioritize stability over new features."
        },
        {
            "question": "How do you detect data volume anomalies in a daily batch pipeline?",
            "answer": "By implementing Data Observability checks. You track the row counts inserted each day. If today's row count deviates significantly from the historical rolling average (e.g., a drop of >20%), you trigger an alert for anomalous data volume."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Observability & Monitoring",
    "module": "Governance",
    "title": "Data Lineage & Governance",
    "subtitle": "Tracking data from source to dashboard.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Data Lineage</h3>\n            <p>Lineage tracks how data flows from source systems (APIs, databases), through transformation layers, into final BI dashboards. It forms a visual graph of dependencies.</p>\n            <h3>Why Lineage Matters</h3>\n            <ul>\n                <li><strong>Root Cause Analysis:</strong> If a dashboard is broken, lineage shows exactly which upstream ETL job failed.</li>\n                <li><strong>Impact Analysis:</strong> If you drop a column in a source table, lineage shows exactly which downstream ML models will break.</li>\n            </ul>\n            <h3>OpenLineage</h3>\n            <p>An open standard for data lineage collection. Tools like Airflow, dbt, and Spark can emit OpenLineage events to platforms like Marquez or DataHub, creating a centralized map of the entire data ecosystem.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the primary benefit of column-level lineage compared to table-level lineage?",
            "answer": "Column-level lineage tracks exactly how individual fields are propagated. If PII (like SSN) is loaded into a raw table, column-level lineage allows the governance team to see exactly which downstream views and dashboards expose that specific column, ensuring compliance across the warehouse."
        },
        {
            "question": "How does dbt natively support data lineage?",
            "answer": "dbt generates a DAG (Directed Acyclic Graph) based on the ref() and source() functions used in models. This automatically builds table-level lineage, which is visualized in dbt Docs to show upstream dependencies and downstream consumers (exposures)."
        }
    ]
}
};
