window.adfLessons = {
    "1.1": {
        id: "1.1",
        stage: "Stage 1: Core Concepts & IRs",
        module: "Architecture Basics",
        title: "Integration Runtimes (IR)",
        subtitle: "Master Azure IR, Self-Hosted IR, High Availability, and sharing.",
        duration: "🕒 15 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Integration Runtime Types Comparison",
            headers: ["IR Type", "Data Location Support", "Compute Administration", "Use Case"],
            rows: [
                ["Azure IR", "Public Cloud to Public Cloud", "Serverless / Managed by Microsoft", "Standard cloud-to-cloud data copies & Data Flows"],
                ["Self-Hosted IR", "Private Network / On-Prem to Cloud", "Self-managed (Install VM, configure OS)", "Secure database ingestion (e.g., SAP, Oracle on-prem)"],
                ["Azure-SSIS IR", "Any (via packages)", "Managed VMs (Configurable node size)", "Migrating SQL Server SSIS packages to Cloud"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the role of an Integration Runtime (IR) in Azure Data Factory?",
                answer: "The Integration Runtime is the actual compute engine that performs the data copying, dispatches pipeline activities, and runs Mapping Data Flows. ADF itself is only an orchestration control-plane; the IR provides the physical CPU and RAM resources to execute the tasks."
            },
            {
                question: "How do you achieve High Availability (HA) and scalability with a Self-Hosted IR?",
                answer: "You can associate up to 4 virtual/physical machines (nodes) to a single Self-Hosted IR gateway. This sets up an active-active cluster. ADF load-balances jobs across all active nodes. If one node goes offline, the remaining nodes continue to process pipelines, avoiding downtime."
            },
            {
                question: "Can multiple Azure Data Factories share the same Self-Hosted IR? How?",
                answer: "Yes. You configure a single central 'Shared Self-Hosted IR' inside a Master Data Factory. Then, from other Linked Data Factories, you create a 'Linked Integration Runtime' that references the shared IR using resource ID links and permissions, avoiding VM overhead costs."
            }
        ]
    },
    "1.2": {
        id: "1.2",
        stage: "Stage 1: Core Concepts & IRs",
        module: "IR Performance",
        title: "Integration Runtime Performance Scaling",
        subtitle: "SHIR sizing, concurrent jobs, CPU/Memory bottlenecks, and network parameters.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Sizing your Self-Hosted IR</h3>
            <p>Running many concurrent Copy activities on a Self-Hosted IR (SHIR) VM requires calculating CPU and memory metrics. By default, a SHIR node concurrency is set based on the machine's resources, but it is capped at a maximum of **96 concurrent jobs per node**.</p>
            <h3>Troubleshooting Bottlenecks</h3>
            <ul>
                <li><strong>CPU Bottleneck:</strong> Occurs during column parsing, file compression (GZIP, Snappy), or when converting binary JSON payloads. If CPU usage stays at 100%, reduce concurrent job limits or scale up the SHIR VM core count.</li>
                <li><strong>Memory Bottleneck:</strong> Copying massive files with large chunk settings. Can result in Out of Memory crashes.</li>
                <li><strong>Network Bottleneck:</strong> If data copy speeds are slow, check the network link between the SHIR VM and the target database. Setting up ExpressRoute or VPN gateways can resolve this.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is the maximum number of concurrent jobs a single SHIR node can run?",
                answer: "By default, the limit is based on the VM size, but it can be configured up to a maximum cap of **96 concurrent jobs** per node in the Integration Runtime configurations panel."
            },
            {
                question: "How do you resolve CPU bottlenecks on a SHIR machine when running file compressions?",
                answer: "1. Change the SHIR concurrent jobs limit to run fewer jobs at the same time. 2. Scale UP the SHIR VM size to add more physical cores. 3. Add another VM node (Scale OUT) to distribute the processing load across multiple machines."
            }
        ]
    },
    "1.3": {
        id: "1.3",
        stage: "Stage 1: Core Architecture & Cost",
        module: "Security & Isolation",
        title: "Network Isolation & Private Links",
        subtitle: "Securing data pipelines inside private networks using Managed VNets.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Managed Virtual Network (Managed VNet)</h3>
            <p>By default, Azure Data Factory copies data using public network endpoints. To secure sensitive data, enterprises deploy ADF inside a **Managed VNet**. In this mode, ADF provisions isolated compute nodes inside an Azure VNet managed by Microsoft, meaning raw data transit occurs off the public internet.</p>

            <h3>Private Endpoints & Private Links</h3>
            <p>A **Private Endpoint** is a private IP address assigned from your virtual network to a specific Azure service resource (like Azure SQL Database, ADLS Gen2, or Azure Key Vault). By setting up Private Endpoints within ADF's Managed VNet, your pipelines communicate with databases and files securely over the Microsoft backbone network, bypassing firewall public IPs entirely.</p>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Public Endpoint vs. Private Link",
            headers: ["Security Dimension", "Public Endpoint Routing", "Managed VNet + Private Endpoint"],
            rows: [
                ["Network Path", "Public internet IP / Azure Edge network", "Microsoft Azure Backbone (Private IP)"],
                ["Firewall Config", "Must open service firewalls to 'Allow Azure Services'", "Completely block public IP; allow only Private Endpoint traffic"],
                ["Egress Security", "Higher vulnerability to data exfiltration", "Highly secure; locked to target resources"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is a Managed VNet in Azure Data Factory and why should we use it?",
                answer: "A Managed VNet isolates the Integration Runtime compute nodes inside a secure network managed by Microsoft. It prevents the IR from using public IP addresses and allows you to create Private Endpoints to safely read/write data in private SQL databases or Azure Storage accounts."
            },
            {
                question: "If an Azure SQL Database has its public firewall completely disabled, how can ADF read from it?",
                answer: "You must run ADF inside a Managed VNet and set up a **Managed Private Endpoint** targeting the SQL Database resource. Microsoft will route the traffic over the internal network using a private IP, allowing ADF to read the database even with its public access blocked."
            }
        ]
    },
    "2.1": {
        id: "2.1",
        stage: "Stage 2: Dynamic Orchestration",
        module: "Linked Services",
        title: "Linked Services & Key Vault Integration",
        subtitle: "Secure connection configurations and zero-plaintext database parameters.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Linked Services Integration</h3>
            <p>Linked Services define connection properties to your databases or file systems. Instead of storing plaintext passwords inside these configurations, ADF allows integration with **Azure Key Vault (AKV)**.</p>
            <h3>Zero-Plaintext Pipelines</h3>
            <p>You grant the ADF Managed Identity access to the Key Vault. The Linked Service configuration points to the Key Vault dynamically and retrieves the secret at runtime. This allows secret rotation without breaking pipelines or updating parameters manually.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you dynamically fetch a connection string password from Key Vault in ADF?",
                answer: "1. Grant ADF's Managed Identity get/list secret permissions on the Key Vault. 2. Create an AKV Linked Service in ADF. 3. Configure your database Linked Service to read its password from Key Vault, referencing the Secret Name."
            }
        ]
    },
    "2.2": {
        id: "2.2",
        stage: "Stage 2: Dynamic Orchestration",
        module: "Dataset Parameters",
        title: "Dataset Parameterization & Dynamic Paths",
        subtitle: "Configure parameterized datasets, dynamic directories, and filenames.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Parameterized Datasets</h3>
            <p>Instead of creating 100 separate Blob storage datasets for 100 different file schemas, you should create one single **Parameterized Dataset**. By defining parameters (e.g., <code>folderName</code> and <code>fileName</code>) inside the dataset settings, you pass values dynamically from the pipeline level during runtime.</p>
            <h3>Dynamic Path Configurations</h3>
            <p>You configure file paths in the connection settings using ADF Expression Language:</p>
            <p><code>@dataset().folderName</code></p>
            <p>This single dataset can then be used to read or write files to any S3/ADLS folder dynamically, reducing resource count in your project.</p>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you write a file dynamically to a folder named after the current year and month?",
                answer: "1. Parameterize the Dataset path. 2. Pass the value from the Copy activity using the date expression: <code>@concat(utcNow('yyyy'), '/', utcNow('MM'))</code>."
            },
            {
                question: "Why should you parameterize datasets in ADF?",
                answer: "To reduce project complexity. Instead of creating separate datasets for each database table or file path, you reuse a single generic dataset, passing directory and filename configurations dynamically as parameters."
            }
        ]
    },
    "2.3": {
        id: "2.3",
        stage: "Stage 2: Dynamic Orchestration",
        module: "Parameters vs Variables",
        title: "Parameters vs. Variables",
        subtitle: "Understand static inputs vs. dynamic state variables.",
        duration: "🕒 12 min read",
        difficulty: "Beginner to Intermediate",
        theory: `
            <h3>Parameters vs. Variables</h3>
            <ul>
                <li><strong>Parameters:</strong> Defined at the pipeline level. They are **read-only** inputs passed from outside when starting the pipeline. They cannot be modified inside.</li>
                <li><strong>Variables:</strong> Internal state managers. You can initialize, update, and modify their values inside the pipeline using the <code>Set Variable</code> activity.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Comparison",
            headers: ["Metric", "Pipeline Parameter", "Pipeline Variable"],
            rows: [
                ["Modifiability", "Read-only (static)", "Writable (Set/Append activities)"],
                ["Set By", "Triggers or manual input at start", "Expressions inside pipeline run"],
                ["Best For", "Environment settings, execution dates", "Counter tracking, dynamic values accumulator"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the difference between a Pipeline Parameter and a Pipeline Variable?",
                answer: "Parameters are external inputs set when the pipeline is triggered; they are static and read-only during run time. Variables are internal placeholders whose values can be modified inside the pipeline run using Set Variable or Append Variable activities."
            }
        ]
    },
    "2.4": {
        id: "2.4",
        stage: "Stage 2: Dynamic Orchestration",
        module: "Activities & Control Flow",
        title: "Control Flow & Activities",
        subtitle: "Orchestrate processes with Lookup, Get Metadata, Web, and loops.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Key Control Flow Activities</h3>
            <ul>
                <li><strong>Lookup Activity:</strong> Reads a config table or runs a query and returns a JSON payload containing up to 5,000 rows.</li>
                <li><strong>Get Metadata Activity:</strong> Inspects files/folders in storage and returns properties like file size, list of child items (filenames), existence, and modified dates.</li>
                <li><strong>ForEach Loop:</strong> Iterates through arrays. <code>ForEach</code> can run iterations in parallel (default) or sequentially (sequential mode).</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you check if a file exists in an Azure Blob Storage folder before copying it?",
                answer: "Use the **Get Metadata** activity. Add the `Exists` argument to the Field List. Then, use an **If Condition** activity to evaluate the outcome: <code>@activity('Get Metadata').output.exists</code>."
            }
        ]
    },
    "2.5": {
        id: "2.5",
        stage: "Stage 2: Dynamic Orchestration",
        module: "REST Integration",
        title: "REST API Integration & Web Activities",
        subtitle: "API authentication, pagination limits, retries, and headers.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>REST Integration Challenges</h3>
            <p>When extracting data from external REST APIs using Copy or Web activities, data engineers face authentication and limits bottlenecks:</p>
            <ul>
                <li><strong>Authentication:</strong> OAuth2 flows requiring dynamic Bearer token requests via parent Web activities prior to copying.</li>
                <li><strong>Pagination:</strong> Fetching data in chunks (pages) using token links or offset indices. ADF Data Flows can handle pagination properties natively.</li>
                <li><strong>Rate Limits:</strong> APIs limit queries per minute. You must configure the Copy/Web activity **Retry** parameters to back off on 429 (Too Many Requests) errors.</li>
            </ul>
        

            <h3>Advanced REST API Capabilities</h3>
            <ul>
                <li><strong>Pagination:</strong> ADF supports absolute url, next page URL, and RFC 5988 header pagination out of the box to loop through paginated endpoints.</li>
                <li><strong>OAuth Authentication:</strong> Connect securely using OAuth2 client credentials flow directly in the Linked Service.</li>
                <li><strong>Retry:</strong> Web Activities support configurable retry logic for transient API failures.</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you execute an OAuth2 pipeline in ADF?",
                answer: "1. Use a **Web Activity** to make a POST request to the OAuth authorization server passing credentials, returning an access token. 2. Store the token in a variable. 3. Pass the token as a dynamic Header: <code>@concat('Bearer ', variables('accessToken'))</code> in the downstream Copy/Web activities."
            },
            {
                question: "How do you configure dynamic pagination in ADF Copy activity?",
                answer: "Within Copy activity REST source settings, select the **Pagination Rules**. You configure parameters (e.g. `QueryParameters.page` or header token links) using expressions to update query paths until the response is empty."
            }
        ]
    },
    "3.1": {
        id: "3.1",
        stage: "Stage 3: Advanced ETL & CDC",
        module: "Copy Activity",
        title: "Copy Activity Deep Dive",
        subtitle: "Parallel copies, data compression, staging, fault tolerance, and DIU tuning.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Performance Parameters in Copy Activity</h3>
            <ul>
                <li><strong>Data Integration Units (DIUs):</strong> Defines the compute resource size allocated for copy tasks. Increasing DIUs (default is Auto, scales up to 256) improves CPU and network capacity during copy runs.</li>
                <li><strong>Parallel Copies (Degree of Parallelism):</strong> Tells ADF to partition files or query boundaries and copy them simultaneously.</li>
                <li><strong>Staged Copy:</strong> Copies source data to a temporary blob stage first, then loads it to the target (e.g. using PolyBase to Snowflake). Faster than direct copying for massive tables.</li>
                <li><strong>Fault Tolerance (Skip Rows):</strong> Skips corrupted or malformed rows rather than failing the entire copy job, logging rejected records in a dead-letter folder.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is DIU in ADF and how do you configure it for optimal performance?",
                answer: "DIU stands for Data Integration Unit. It represents the scale of compute resources allocated to run a copy activity. For cloud-to-cloud copies, increasing DIUs from the default Auto value to a larger value (like 32) can accelerate data copying for large datasets."
            },
            {
                question: "What is a Staged Copy and when should you use it?",
                answer: "A Staged Copy writes data from the source to a temporary cloud storage bucket first, then loads it into the target warehouse (e.g., using Snowflake COPY commands or Synapse PolyBase). It is used to dramatically speed up loads to data warehouses compared to row-by-row inserts."
            },
            {
                question: "How do you configure fault tolerance to skip corrupted records during a copy?",
                answer: "In the Copy activity Settings, enable **Fault Tolerance**. Choose 'Skip incompatible rows' and configure a target storage path to write the log of rejected records, allowing the copy job to succeed while capturing bad rows."
            }
        ]
    },
    "3.2": {
        id: "3.2",
        stage: "Stage 3: Advanced ETL & CDC",
        module: "Data Flows",
        title: "Mapping Data Flows",
        subtitle: "Visual ETL pipelines, Spark scaling, and Schema Drift.",
        duration: "🕒 20 min read",
        difficulty: "Advanced",
        theory: `
            <h3>What are Mapping Data Flows?</h3>
            <p>Mapping Data Flows are visually-designed data transformation pipelines executed on an auto-scaling Spark cluster.</p>
            <h3>Performance Optimization</h3>
            <ul>
                <li><strong>Broadcast Join:</strong> In the Join transformation settings, enable broadcasting if one table is small (under 10MB) to copy it to all nodes and avoid shuffles.</li>
                <li><strong>Partitioning:</strong> Set custom partitions on high-cardinality keys to distribute the compute load across worker nodes.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "What is a Broadcast Join in Data Flows and how does it optimize joins?",
                answer: "A Broadcast Join sends the smaller dataset to all active Spark cluster nodes. This allows the join operation to execute locally on each node without shuffling the larger dataset across the network, reducing query execution time."
            }
        ]
    },
    "3.3": {
        id: "3.3",
        stage: "Stage 3: Advanced ETL & CDC",
        module: "Incremental Loading",
        title: "Incremental Loading & CDC Ingestion",
        subtitle: "Watermarks, CDC, hash comparison, and soft delete tracking.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Incremental Load Patterns</h3>
            <ul>
                <li><strong>High Watermark:</strong> Tracking a timestamp or ID in a control table and querying records newer than that value.</li>
                <li><strong>Hash Comparison:</strong> Calculating MD5 hashes of row columns to identify updates when no timestamp exists.</li>
                <li><strong>Soft Delete Ingestion:</strong> Ingesting deletions where status columns are set to active=false. Hard deletes must be tracked by checking the source database transaction logs via native CDC.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you capture deleted rows in a source database that doesn't use soft-delete flags?",
                answer: "You must configure **Change Data Capture (CDC)** natively at the database level (e.g. SQL Server CDC) or run a daily full outer join comparing the previous day's snapshot against today's database extract, identifying missing IDs."
            }
        ]
    },
    "3.4": {
        id: "3.4",
        stage: "Stage 3: Advanced ETL & CDC",
        module: "Logging Framework",
        title: "Custom Logging Framework",
        subtitle: "Designing custom audit and execution logging frameworks.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Custom Logging Architecture</h3>
            <p>Relying solely on ADF's monitoring dashboard makes auditing difficult. A **Custom Logging Framework** logs metadata before and after every pipeline execution to a central SQL logging database:</p>
            <ul>
                <li><strong>Audit Table Columns:</strong> <code>execution_id</code> (GUID), <code>pipeline_name</code>, <code>status</code> (Running/Success/Failed), <code>start_time</code>, <code>end_time</code>, <code>duration_seconds</code>, <code>rows_read</code>, <code>rows_written</code>, and <code>error_message</code>.</li>
            <li><strong>Implementation:</strong> Place an INSERT activity at the start of the pipeline setting status to 'Running'. Place UPDATE activities on the Success and Failure paths of the pipeline to record execution duration and statistics.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you capture the number of rows copied in a Copy activity dynamically for logging?",
                answer: "Access the output metadata of the completed Copy activity using: <code>@activity('MyCopyActivity').output.rowsCopied</code> or <code>@activity('MyCopyActivity').output.dataRead</code>."
            },
            {
                question: "Why build a custom logging framework if Azure has built-in monitoring?",
                answer: "Built-in logs expire after 45 days. A custom framework keeps permanent audit history, allows for custom BI reporting on data volumes, and makes it easy to calculate pipeline execution SLA KPIs."
            }
        ]
    },
    "4.1": {
        id: "4.1",
        stage: "Stage 4: Operations & Alerts",
        module: "Trigger Types",
        title: "Trigger Types & Dependencies",
        subtitle: "Schedule, Tumbling Window, Event, and Dependency triggers.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>ADF Trigger Mechanisms</h3>
            <ul>
                <li><strong>Schedule Trigger:</strong> Triggers pipelines at exact intervals (e.g. every hour, every Sunday).</li>
                <li><strong>Tumbling Window Trigger:</strong> Fires at regular, non-overlapping intervals. Has unique capabilities: it can handle data backfills easily, manages self-dependencies (waiting for previous windows to finish), and retries on failure.</li>
                <li><strong>Event Trigger:</strong> Runs dynamically when files land in a Blob Storage stage (BlobCreated, BlobDeleted).</li>
                <li><strong>Dependency Trigger:</strong> A Tumbling Window trigger can depend on another Tumbling Window trigger in a different pipeline, ensuring sequential processing (e.g. waiting for staging pipeline before running data warehouse load).</li>
            </ul>
        

            <h3>Detailed Trigger Types</h3>
            <ul>
                <li><strong>Schedule Trigger:</strong> Runs pipelines on a wall-clock schedule (e.g., daily at 2 AM).</li>
                <li><strong>Event Trigger:</strong> Runs in response to a Storage Event (like Blob created/deleted).</li>
                <li><strong>Tumbling Window Trigger:</strong> Fires at a periodic interval and maintains state. If a run fails, it can automatically retry. It also supports passing the start/end window times directly into the pipeline.</li>
                <li><strong>Manual Trigger:</strong> Triggered on-demand via the UI or REST API.</li>
            </ul>

        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Triggers Feature Table",
            headers: ["Feature", "Schedule Trigger", "Tumbling Window Trigger", "Event Trigger"],
            rows: [
                ["Backfill Data", "No (only runs forward)", "Yes (can configure historical start date)", "No"],
                ["Self-Dependency", "No (runs concurrently)", "Yes (stops subsequent windows on fail)", "No"],
                ["Trigger Event", "Time-based", "Time-based", "File creation / deletion"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the difference between a Schedule Trigger and a Tumbling Window Trigger?",
                answer: "A Schedule trigger runs concurrent instances at set intervals and cannot handle backfills. A Tumbling Window trigger executes non-overlapping windows sequentially, supports historical backfilling, and manages task dependencies (waiting for previous window runs)."
            },
            {
                question: "How do you configure a pipeline to execute only when files are created in Azure Blob Storage?",
                answer: "Create an **Event Trigger**, select your storage account and container, configure a file path prefix/suffix (e.g. <code>.csv</code>), and register the subscription. When a file is uploaded, the trigger runs the pipeline dynamically."
            }
        ]
    },
    "4.2": {
        id: "4.2",
        stage: "Stage 4: Operations & Alerts",
        module: "Error Recovery",
        title: "Error Handling & Recovery",
        subtitle: "Resilient patterns, retry thresholds, and dead-letter pipelines.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
            <h3>Pipeline Resiliency</h3>
            <p>Pipelines should handle transient errors without developer intervention:</p>
            <ul>
                <li><strong>Retry logic:</strong> Configure Retry values to wait out temporary network dropouts.</li>
                <li><strong>Skip row tolerance:</strong> Capturing bad database rows in storage instead of aborting the copy task.</li>
                <li><strong>Restartability:</strong> If a pipeline with 10 activities fails at activity 6, you can restart the pipeline directly from activity 6 in the monitoring dashboard, preserving previous operations.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            {
                question: "How do you recover a multi-step pipeline that failed halfway through without re-running completed steps?",
                answer: "Go to the monitoring dashboard, select the failed run, and click **Rerun from failed activity**. This executes only the failed activity and its downstream steps, bypassing the initial successful runs."
            }
        ]
    },
    "4.3": {
        id: "4.3",
        stage: "Stage 4: Operations & Alerts",
        module: "CI/CD & Fabric",
        title: "IaC, CI/CD & Synapse/Fabric Pipelines",
        subtitle: "Git, ARM/Bicep deployments, and comparing ADF with Fabric.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
            <h3>Infrastructure as Code (IaC)</h3>
            <p>ADF configurations are JSON documents. You deploy them across environments using Infrastructure as Code tools like Azure Resource Manager (ARM) templates, Azure Bicep, or Terraform providers.</p>

            <h3>ADF vs. Synapse vs. Microsoft Fabric</h3>
            <ul>
                <li><strong>ADF:</strong> Standalone orchestration service. Highly mature.</li>
                <li><strong>Synapse Pipelines:</strong> ADF capabilities built inside Azure Synapse Analytics workspace, tightly integrated with SQL pools.</li>
                <li><strong>Microsoft Fabric Data Factory:</strong> The next-generation SaaS model. Fully integrated with OneLake, lakehouses, and real-time analytics. Combines ADF and Data Flows in a unified cloud platform.</li>
            </ul>
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            title: "Platform Comparisons",
            headers: ["Metric", "Azure Data Factory", "Microsoft Fabric Pipelines"],
            rows: [
                ["Hosting Model", "PaaS (Platform as a Service)", "SaaS (Software as a Service)"],
                ["Data Storage Link", "Must mount external stages", "Native link to OneLake storage"],
                ["Pricing Model", "Pay-per-execution (activities, IRs)", "Capacity-based subscription (F-SKUs)"]
            ]
        },
        interviewQuestions: [
            {
                question: "What is the difference between Azure Data Factory pipelines and Microsoft Fabric Pipelines?",
                answer: "ADF is a PaaS data integration service requiring linked service integrations. Fabric Pipelines are SaaS orchestration layers built directly into Microsoft Fabric, which automatically load and write data to Fabric OneLake without complex staging."
            },
            {
                question: "How do you parameterize ARM templates during ADF deployments?",
                answer: "You specify parameter definitions in `arm-template-parameters-definition.json` in the collaboration branch. When publishing, ADF creates an ARM template and a parameters file. The deployment release task overrides these parameters (like endpoint URLs) to match targets."
            }
        ]
    },
    "4.4": {
        id: "4.4",
        stage: "Stage 4: Operations & Alerts",
        module: "Fabric Data Factory",
        title: "Fabric Data Factory vs. Azure Data Factory",
        subtitle: "Understand the architectural differences between ADF and its SaaS successor inside Microsoft Fabric.",
        duration: "🕒 15 min read",
        difficulty: "Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: true,
        tableData: {
            headers: ["Dimension", "Azure Data Factory", "Fabric Data Factory"],
            rows: [
                ["Deployment model", "PaaS (you manage resources)", "SaaS (fully managed)"],
                ["Storage target", "Any (ADLS, SQL, Blob...)", "OneLake natively"],
                ["Integration Runtime", "Yes (configure Azure/SHIR)", "No (managed compute)"],
                ["Billing unit", "Activity Runs + DIU-hours", "Fabric CUs (shared pool)"],
                ["Lineage", "Requires Azure Purview", "Built-in to Fabric"]
            ]
        },
        interviewQuestions: [
            { question: "What is the biggest operational difference between ADF and Fabric Data Factory?", answer: "ADF is PaaS — you configure Linked Services, Integration Runtimes, and Key Vault integration manually. Fabric Data Factory is SaaS — compute is fully managed, and pipelines write directly to OneLake without any Linked Service configuration for Fabric-native stores. This dramatically reduces infrastructure overhead for Fabric-first architectures." },
            { question: "Can Fabric Data Factory replace ADF for on-premises data ingestion?", answer: "Not directly today. Fabric Data Factory does not support Self-Hosted Integration Runtime for on-premises sources behind firewalls. ADF with SHIR remains the recommended approach for hybrid on-premises to cloud ingestion scenarios until Fabric adds equivalent gateway support." }
        ]
    },
    "4.5": {
        id: "4.5",
        stage: "Stage 4: Operations & Alerts",
        module: "Azure Function Activity",
        title: "Azure Function Activity in ADF",
        subtitle: "Trigger serverless custom code as part of ADF pipeline control flow.",
        duration: "🕒 12 min read",
        difficulty: "Intermediate",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "When would you use an Azure Function Activity instead of a Web Activity in ADF?", answer: "Use Azure Function Activity when the endpoint is specifically an Azure Function and you want native Managed Identity authentication, easier Linked Service management, and cleaner error reporting from Function-specific HTTP error codes. Use Web Activity for generic third-party HTTP REST endpoints where you manage auth headers manually." },
            { question: "How do you pass pipeline parameters to an Azure Function Activity?", answer: "Set the Body field of the Azure Function Activity to a JSON object using dynamic content expressions, for example: @{pipeline().parameters.runDate}. The Azure Function receives this JSON in the request body and can parse it to drive processing logic." }
        ]
    },
    "4.6": {
        id: "4.6",
        stage: "Stage 4: Operations & Alerts",
        module: "Batching Patterns",
        title: "Lookup + ForEach Batching for Large Datasets",
        subtitle: "Process more than 5,000 rows from Lookup using chunking and batch strategies.",
        duration: "🕒 15 min read",
        difficulty: "Advanced",
        theory: `
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
        `,
        hasDiagram: false,
        hasTable: false,
        interviewQuestions: [
            { question: "What happens when a Lookup Activity returns more than 5,000 rows in ADF?", answer: "ADF silently truncates the result to 5,000 rows. No error is raised. This is a common silent bug in control-table-driven pipelines where developers assume all entities are returned. Always validate with COUNT(*) before relying on Lookup for large control tables." },
            { question: "How would you design a meta-driven ADF pipeline that processes 50,000 tables?", answer: "Partition the control table into batches of 4,000 rows using a batch_id column. A root pipeline does a Lookup for distinct batch_ids (well within 5,000), then a ForEach with Batch Count 50 triggers child pipelines — each child does its own Lookup for its batch_id slice. This processes all 50,000 tables with up to 50 pipelines running in parallel." }
        ]
    }
};

