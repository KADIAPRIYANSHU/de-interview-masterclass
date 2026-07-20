window.aiDeLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Cortex Agents",
    "title": "Snowflake Cortex LLMs & Agents",
    "subtitle": "Using COMPLETE, built-in agents, and model configurations.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Snowflake Cortex AI</h3>\n            <p>Cortex is a fully managed service that provides secure LLM access directly inside Snowflake SQL. You execute state-of-the-art open-source LLMs (like Llama3 and Mistral) using built-in functions:</p>\n            <p><code>SELECT SNOWFLAKE.CORTEX.COMPLETE('llama3-70b', 'Summarize this review: ...')</code></p>\n            <h3>Cortex Agents</h3>\n            <p>Cortex Agents are autonomous, managed SQL interfaces that combine LLMs with search indices to answer complex questions over unstructured tables, managing conversational state and orchestrating retrievals behind the scenes.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is Snowflake Cortex COMPLETE and how is it billed?",
            "answer": "Cortex COMPLETE is a SQL function that evaluates LLM prompts. It runs securely within the Snowflake boundary and is billed serverless-style based on the number of input and output tokens processed."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Cortex Search",
    "title": "Cortex Search & Semantic Indexing",
    "subtitle": "Building search indices, keyword match, and semantic relevance.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Cortex Search</h3>\n            <p>Cortex Search enables low-latency keyword and semantic search over text datasets inside Snowflake. It automatically manages the extraction, embedding generation, and indexing of text columns.</p>\n            <h3>Index Configuration</h3>\n            <p>You create a search index by defining the target columns and refresh intervals:</p>\n            <pre><code>CREATE OR REPLACE CORTEX SEARCH SERVICE my_search_index\n  ON text_column\n  ATTRIBUTES category\n  WAREHOUSE = my_wh\n  TARGET_LAG = '1 hour'\n  AS SELECT text_column, category, id FROM raw_docs;</code></pre>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a Cortex Search Service?",
            "answer": "It is a managed search index that automatically generates embeddings and index profiles on text columns, allowing users to query data via vector similarity and keyword search concurrently using SQL APIs."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Vector Embeddings",
    "title": "Vector Embeddings & Cosine Similarity",
    "subtitle": "Using EMBED_TEXT and calculating vector distance parameters.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Vector Embeddings</h3>\n            <p>Embeddings translate the semantic meaning of text into high-dimensional numerical vectors. In Snowflake, you generate embeddings using:</p>\n            <p><code>SELECT SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', 'your text here')</code></p>\n            <h3>Cosine Similarity</h3>\n            <p>To find semantically similar documents, you store the output vectors in <code>VECTOR(FLOAT, 768)</code> columns and query them using similarity metrics: <code>VECTOR_COSINE_SIMILARITY(vector_col, query_vector)</code>. A score closer to 1 indicates high similarity.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you calculate semantic text similarity in Snowflake SQL?",
            "answer": "Generate vector embeddings for your text using <code>CORTEX.EMBED_TEXT_768()</code>, store them in a <code>VECTOR</code> column type, and calculate distance using the <code>VECTOR_COSINE_SIMILARITY()</code> function."
        }
    ]
},
    "1.4": {
    "id": "1.4",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "RAG Architecture",
    "title": "Retrieval-Augmented Generation (RAG)",
    "subtitle": "Build unstructured document pipelines in Snowflake stages.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>RAG Ingestion Pipelines</h3>\n            <p>RAG provides private company context to LLMs dynamically. In Snowflake, you construct a RAG pipeline by:</p>\n            <ol>\n                <li>Uploading PDF/txt manuals to an **Internal/External Stage**.</li>\n                <li>Executing a Python UDF using **PyPDF** to extract and chunk the text.</li>\n                <li>Calculating vector embeddings for each chunk and storing them in a table.</li>\n                <li>Retrieving the top-k chunks matching user queries via vector search, and passing them to <code>CORTEX.COMPLETE()</code> as prompt context.</li>\n            </ol>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is RAG and how do you implement it in Snowflake?",
            "answer": "RAG retrieves relevant document chunks from your warehouse using vector search and inserts them into an LLM prompt as context. This allows the model to answer questions based on private files without needing fine-tuning."
        }
    ]
},
    "1.5": {
    "id": "1.5",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "AI SQL Gen",
    "title": "AI SQL Generation",
    "subtitle": "Natural language translation to Snowflake SQL using schemas.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Natural Language to SQL (NL-to-SQL)</h3>\n            <p>NL-to-SQL compilers allow business users to ask questions in plain English and automatically compile them into SQL. To make this accurate, the AI engine requires clear schema metadata definitions, primary/foreign key mappings, and table descriptions (Semantic Context) to generate valid queries.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the primary blocker for accurate NL-to-SQL generation and how do you resolve it?",
            "answer": "Ambiguous table schemas and column names. Resolve this by defining clear primary/foreign key metadata, adding descriptions to tables and columns via COMMENT statements, and passing reference dictionaries to the compiler."
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "MCP Protocol",
    "title": "Model Context Protocol (MCP)",
    "subtitle": "How MCP dynamically links AI agents to data warehouse tables.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>What is Model Context Protocol (MCP)?</h3>\n            <p>MCP is an open standard protocol that defines how client applications (like IDE coding agents) securely read context schemas, catalog structures, and execute tools on remote data platforms. It allows AI models to inspect and query data securely without custom, proprietary API mappings.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is Model Context Protocol (MCP) and how is it used by developer AI agents?",
            "answer": "MCP is a protocol that standardizes how AI agents fetch context and execute tools on data platforms. It enables the model to securely query databases, retrieve schema configurations, and execute SQL statements dynamically."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "AI-Assisted ETL",
    "title": "AI-Assisted ETL & Data Prep",
    "subtitle": "Generate dynamic mappings, parse messy logs, and automate SQL builds.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>AI in ETL Ingestion</h3>\n            <p>AI engines can automate tedious data transformation tasks:</p>\n            <ul>\n                <li><strong>Parsing Logs:</strong> Using LLMs to identify error patterns or extract attributes from raw, unstructured log files.</li>\n                <li><strong>Schema Mapping:</strong> Automating the mapping of incoming Excel/CSV headers to standardized database columns.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you leverage LLMs to classify unstructured feedback rows in an ETL pipeline?",
            "answer": "Run <code>CORTEX.COMPLETE()</code> inside your SQL query, prompting the LLM to output a single category string (e.g. 'Positive', 'Negative') based on the feedback column value, storing the result in a table."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "OpenAI + Snowflake",
    "title": "OpenAI External Integrations",
    "subtitle": "Setting up secure API connections and Snowflake Network Rules.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>External Network Access</h3>\n            <p>By default, Snowflake warehouses are blocked from connecting to external APIs. To call external models (like OpenAI or custom endpoints), you must configure three objects:</p>\n            <ol>\n                <li><strong>Network Rule:</strong> Restricts outgoing traffic to specified domains (e.g., api.openai.com).</li>\n                <li><strong>External Access Integration:</strong> References the Network Rule and secures the connection endpoint.</li>\n                <li><strong>UDF / Procedure:</strong> A Python function that calls the OpenAI API, passing credentials retrieved from a secure Snowflake Secret.</li>\n            </ol>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you call an external REST API (like OpenAI) securely from Snowflake?",
            "answer": "1. Create a Network Rule allowing outbound traffic to the API domain. 2. Create a Secret storing the API key. 3. Create an External Access Integration referencing the rule and secret. 4. Write a Python UDF referencing the integration to call the API."
        }
    ]
},
    "1.9": {
    "id": "1.9",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Prompt Engineering",
    "title": "Prompt Engineering",
    "subtitle": "Few-shot, Zero-shot, CoT",
    "duration": "🕒 10 min read",
    "difficulty": "Beginner",
    "theory": "<ul><li><strong>Zero-shot:</strong> No examples provided.</li><li><strong>Few-shot:</strong> Providing examples to guide output.</li><li><strong>Chain-of-Thought (CoT):</strong> Asking LLM to explain reasoning step-by-step.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.10": {
    "id": "1.10",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "RAG",
    "title": "Embeddings & Chunking",
    "subtitle": "Before Vector Search",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "<ul><li><strong>Embeddings:</strong> Converting text to mathematical vectors to measure semantic similarity.</li><li><strong>Chunking:</strong> Splitting large documents into smaller overlapping segments for efficient retrieval in RAG.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
}
};
