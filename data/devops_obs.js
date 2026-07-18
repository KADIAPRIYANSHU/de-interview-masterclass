window.devopsObsLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: DevOps & Automation",
        module: "Git & Branching",
        title: "GitFlow & Collaboration Rules",
        subtitle: "Version control branching, PR policies, and branch protection.",
        duration: "🕒 12 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
            <h3>Version Control in Data Engineering</h3>
            <p>Data pipelines and transformations must be stored in Git repositories. The standard workflow is **GitFlow**:</p>
            <ul>
                <li><strong>Main/Production Branch:</strong> Holds compiled, production-tested pipelines. Direct commits are blocked.</li>
                <li><strong>Develop Branch:</strong> Integration branch for testing.</li>
                <li><strong>Feature Branches:</strong> Created by developers to add new features or bug fixes.</li>
            </ul>
            <h3>Branch Protection Rules</h3>
            <p>Production branches should require a **Pull Request (PR)**, at least 1-2 reviewer approvals, and successful automated CI testing runs before merging.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is GitFlow and why is direct committing to main blocked in enterprise settings?",
                answer: "GitFlow is a branching model that isolates development from production. Blocking direct commits to main ensures all code is peer-reviewed via Pull Requests and passes automated test suites before deployment, preventing production outages."
            }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: DevOps & Automation",
        module: "CI/CD Pipelines",
        title: "CI/CD Deployment Pipelines",
        subtitle: "GitHub Actions, Azure DevOps, and automated pipeline validation.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>CI/CD Lifecycle</h3>
            <ul>
                <li><strong>Continuous Integration (CI):</strong> Triggered when a PR is opened. Automatically compiles code, runs SQL/dbt linters, checks formatting, and runs unit tests using mock datasets.</li>
                <li><strong>Continuous Deployment (CD):</strong> Triggered when code merges to main. Automatically packages compiled code, logs metadata, and deploys ARM templates or SQL objects to the target database.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Describe your typical CI/CD release pipeline for a dbt project.",
                answer: "1. PR opens: Trigger CI runner. 2. Run dbt linting and code formatting checks. 3. Compile SQL and execute unit tests on a test target schema using Slim CI. 4. Code merges to main: Trigger CD. 5. Deploy compiled scripts to the production schema and update documentation."
            }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: DevOps & Automation",
        module: "Infrastructure as Code",
        title: "Infrastructure as Code (IaC)",
        subtitle: "Terraform, Bicep, and automated resource provisioning.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>IaC in Data Engineering</h3>
            <p>Provisioning warehouses, databases, storage accounts, and pipelines manually leads to drift between Dev and Prod configurations. We use IaC to declare infrastructure in code files:</p>
            <ul>
                <li><strong>Terraform:</strong> Provider-agnostic engine that uses HCL (HashiCorp Configuration Language) and tracks resources using a State File.</li>
                <li><strong>Bicep / ARM:</strong> Azure-specific declarative infrastructure files.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "Why use Terraform or Bicep instead of manually creating database resources?",
                answer: "IaC ensures environment consistency, eliminates resource drift between Dev and Prod, tracks infrastructure history in Git, and automates deployments through CI/CD release pipelines."
            }
        ]
    },
    "2.1": {
        id: "2.1",
        stage: "Stage 2: Observability & Monitoring",
        module: "Structured Logging",
        title: "Structured Logging & Audit Logs",
        subtitle: "Designing custom logs, execution IDs, and audit tables.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Structured Logging</h3>
            <p>Pipelines should generate logs in structured formats (like JSON) containing standardized keys. This makes it easy for indexing tools (like Splunk or Log Analytics) to parse and query execution metrics.</p>
            <h3>Execution Tracing</h3>
            <p>Every pipeline run must be tagged with a unique **Execution GUID**. This ID is passed to all sub-pipelines and query tags, allowing developers to trace the logs of a single workflow run across multiple systems.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is Structured Logging and why is it important in production pipelines?",
                answer: "Structured Logging writes logs in a machine-readable JSON format with standard key-value fields. This enables log analyzers to quickly filter, parse, and aggregate log metrics, speeding up troubleshooting."
            }
        ]
    },
    "2.2": {
        id: "2.2",
        stage: "Stage 2: Observability & Monitoring",
        module: "Telemetry Monitoring",
        title: "Observability & Dashboard Telemetry",
        subtitle: "Query history logs, CPU/Memory health, and performance monitors.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Data Observability</h3>
            <p>Observability focuses on system health metrics: query history, resource consumption (credits, CPU, memory), and pipeline run status. Monitoring metrics let you create alerts before jobs fail (e.g., alert if pipeline runtime exceeds historical averages by 50%).</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you detect if a pipeline is running longer than usual due to a system lock?",
                answer: "Monitor execution runtimes in your log database. Compare active running times against the rolling average duration of the previous 30 days. Trigger a warning alert if runtime exceeds the average by 2 standard deviations."
            }
        ]
    },
    "2.3": {
        id: "2.3",
        stage: "Stage 2: Observability & Monitoring",
        module: "SLA Alerts",
        title: "SLA, SLO & Alerting Frameworks",
        subtitle: "SLA/SLO metric parameters and Logic Apps / Slack integration alerts.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>SLA vs. SLO</h3>
            <ul>
                <li><strong>SLA (Service Level Agreement):</strong> The formal commitment to stakeholders (e.g. Sales dashboard must refresh by 6:00 AM daily).</li>
                <li><strong>SLO (Service Level Objective):</strong> The internal performance target (e.g. Sales pipeline must finish by 5:30 AM 99% of the time) to prevent SLA breaches.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you configure alerting to prevent SLA breaches?",
                answer: "Set up warning alerts targeting the SLO timeline (e.g. alert if job is not completed by 5:30 AM). Send alerts to Slack/Teams using Webhooks or trigger PagerDuty schedules for high-priority incidents."
            }
        ]
    },
    "2.4": {
        id: "2.4",
        stage: "Stage 2: Observability & Monitoring",
        module: "Data Lineage",
        title: "Data Lineage",
        subtitle: "Column-level lineage, dependency mappings, and impact analysis.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>What is Data Lineage?</h3>
            <p>Data Lineage tracks data flow from source files down to intermediate transformations, final tables, and downstream BI reports. It answers the question: *'Where did this column value come from?'*</p>
            <p><strong>Impact Analysis:</strong> Checking data lineage before modifying a column schema to ensure we don't break downstream tables or dashboards.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How does Data Lineage help you perform an Impact Analysis?",
                answer: "Data Lineage maps column dependencies. If you need to drop or rename a column in a staging table, you consult the lineage map to identify all downstream models and reports that read that column, allowing you to update them first."
            }
        ]
    },
    "2.5": {
        id: "2.5",
        stage: "Stage 2: Observability & Monitoring",
        module: "Governance",
        title: "Data Governance & Catalogs",
        subtitle: "Azure Purview, Collibra, data classification, and metadata indexing.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Data Governance</h3>
            <p>Data Governance manages security, compliance, and searchability of enterprise datasets. Tools like **Azure Purview** or **Collibra** index metadata, tag columns with business glossary terms, and classify sensitive information (e.g., tagging SSNs or Credit Card columns as PII).</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is the role of a Data Catalog in a modern data platform?",
                answer: "A Data Catalog indexes metadata from all databases and stages, acts as a searchable dictionary for business users, tracks data lineage, and classifies sensitive data (PII) to enforce security masking policies automatically."
            }
        ]
    }
};

