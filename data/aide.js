window.aideLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Cortex LLMs",
    "title": "Snowflake Cortex & LLMs",
    "subtitle": "Running AI models inside Snowflake.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>What is Snowflake Cortex?</h3>\n            <p>Cortex brings industry-leading LLMs (like Llama 3 and Mistral) directly into the Snowflake data boundary. This means you can run generative AI functions (summarization, translation, sentiment analysis) directly on your tables using simple SQL functions, without data ever leaving Snowflake.</p>\n            <h3>Security Advantage</h3>\n            <p>Because the LLMs run inside Snowflake, you bypass the massive security risks associated with extracting PII/PHI data to external APIs like OpenAI. It respects your existing RBAC.</p>\n            <pre><code>SELECT \n  review_text,\n  SNOWFLAKE.CORTEX.SENTIMENT(review_text) as sentiment_score\nFROM product_reviews;</code></pre>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the primary security benefit of using Snowflake Cortex for sentiment analysis instead of a Python UDF calling the OpenAI API?",
            "answer": "Calling external APIs requires network egress and sending potentially sensitive data outside the Snowflake perimeter. Cortex runs the models natively within Snowflake, meaning data never leaves the secure boundary and automatically inherits all existing RBAC and data masking policies."
        },
        {
            "question": "How do you handle rate limits and compute costs when running Cortex functions over a table with 10 million rows?",
            "answer": "Cortex functions consume compute credits just like virtual warehouses. You should avoid running them on massive datasets continuously. Instead, use an incremental strategy (like a Stream or Dynamic Table) to only process newly inserted rows, and scale up the warehouse if you need faster parallel execution for backfills."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "Embeddings & Vector",
    "title": "Embeddings & Vector Math",
    "subtitle": "Understanding how AI searches text.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>What is a Vector Embedding?</h3>\n            <p>An embedding is a way of converting words or sentences into an array of numbers (a vector). Models are trained so that words with similar meanings (like \"Dog\" and \"Puppy\") have vectors that are mathematically close to each other in high-dimensional space.</p>\n            <h3>Vector Search (Cosine Similarity)</h3>\n            <p>Once you convert a user's search query into a vector, you can find the most relevant documents in your database by calculating the \"Cosine Similarity\" (or Euclidean distance) between the query vector and the document vectors. This is the foundation of semantic search.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why is Cosine Similarity used for vector search instead of Euclidean distance?",
            "answer": "Cosine similarity measures the angle between two vectors, completely ignoring their magnitude (length). This means a short document and a long document about the exact same topic will have high cosine similarity, whereas Euclidean distance would penalize them for having different lengths."
        },
        {
            "question": "What is the primary performance challenge of vector search in a traditional relational database?",
            "answer": "Traditional databases use B-Trees optimized for exact matches or ranges. Vector search requires finding the 'nearest neighbors' in high-dimensional space, which requires specialized index types like HNSW (Hierarchical Navigable Small World) to avoid doing a full table scan for every search."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: AI & Semantic Models",
    "module": "RAG",
    "title": "RAG Architecture",
    "subtitle": "Retrieval-Augmented Generation.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>What is RAG?</h3>\n            <p>LLMs are frozen in time and hallucinate when they lack context. RAG (Retrieval-Augmented Generation) solves this by retrieving relevant facts from your private database and feeding them into the LLM's prompt before it generates an answer.</p>\n            <h3>Chunking Strategies</h3>\n            <p>You cannot pass a 500-page PDF to an LLM. You must \"chunk\" it. Fixed-size chunking (e.g., 500 words) is easy but breaks context. Semantic chunking (splitting by paragraph or header) maintains meaning better but is harder to implement.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the role of the Vector Database in a RAG architecture?",
            "answer": "The Vector DB stores the chunked text and its vector embeddings. When a user asks a question, the Vector DB performs a similarity search to retrieve the top-K most relevant chunks, which are then injected into the context window of the LLM."
        },
        {
            "question": "Why would you implement a 'chunk overlap' strategy when preparing documents for RAG?",
            "answer": "If you split a document arbitrarily into chunks, a critical sentence might be split in half, losing its meaning. Chunk overlap (e.g., 500 token chunks with 50 token overlap) ensures that context at the boundaries is preserved across chunks."
        },
        {
            "question": "How does Snowflake Cortex Search simplify RAG?",
            "answer": "Cortex Search provides a fully managed vector search service directly on top of Snowflake tables. It eliminates the need to export data to an external Vector DB like Pinecone, managing the embedding generation, indexing, and retrieval natively via SQL."
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "NL to SQL",
    "title": "NL-to-SQL & Prompt Eng.",
    "subtitle": "Translating natural language to valid queries.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Natural Language to SQL</h3>\n            <p>Building chatbots that can query databases (Text-to-SQL) is difficult because LLMs hallucinate table names or misunderstand business logic (e.g., what defines 'Active Revenue').</p>\n            <h3>The Role of Semantic Layers</h3>\n            <p>Connecting an LLM to a Semantic Layer (like dbt MetricFlow) instead of raw tables dramatically improves accuracy. The LLM only needs to predict the metric name, not the complex underlying JOINs.</p>\n            <h3>Prompt Engineering</h3>\n            <p>Injecting the database DDL (schema) and sample rows into the system prompt is critical for accurate SQL generation.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why is Few-Shot prompting important for NL-to-SQL applications?",
            "answer": "Few-Shot prompting involves providing the LLM with a few examples of User Questions and their correct SQL translations in the prompt. This trains the LLM on your specific database dialects and business quirks (like formatting dates or handling nulls) far better than zero-shot prompting."
        },
        {
            "question": "How do you prevent SQL Injection when building an NL-to-SQL agent?",
            "answer": "The generated SQL should never be executed blindly. It must be run using a read-only database role with strict object-level privileges. Additionally, the application layer should parse the generated AST (Abstract Syntax Tree) to verify it is only a SELECT statement before execution."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "MCP",
    "title": "Model Context Protocol",
    "subtitle": "Connecting AI agents to data sources securely.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>The Integration Problem</h3>\n            <p>AI agents need to query databases, read Github, and check Slack. Historically, this required writing custom API integrations for every tool.</p>\n            <h3>What is MCP?</h3>\n            <p>The Model Context Protocol (MCP) is an open standard that allows AI agents to securely connect to data sources. Instead of the LLM knowing how to query Snowflake, you run an MCP Server connected to Snowflake. The LLM simply asks the MCP Server to execute the query.</p>\n            <h3>Security Model</h3>\n            <p>MCP runs locally or in a trusted VPC. The AI agent (which may be a cloud service like Claude) requests data, but the MCP server decides whether to approve or deny the request based on local permissions, keeping the keys out of the cloud.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How does MCP improve security compared to giving an LLM direct database credentials?",
            "answer": "With MCP, the LLM never sees the database credentials. The credentials stay securely on the host running the MCP Server. The LLM only sends semantic requests over the protocol, and the MCP server executes them locally, enforcing strict read-only boundaries and logging."
        },
        {
            "question": "What are the three main capabilities an MCP server can expose to an LLM?",
            "answer": "Resources (static data like file contents), Prompts (parameterized templates), and Tools (executable functions like running a SQL query or calling an API)."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Enterprise Integrations",
    "module": "AI ETL",
    "title": "AI-Assisted ETL",
    "subtitle": "Using AI for data cleaning and extraction.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Unstructured Data Extraction</h3>\n            <p>Historically, extracting invoice amounts from PDFs or sentiment from support tickets required complex Regex or custom NLP models. Now, you can use LLMs as a transformation step in your ETL pipeline.</p>\n            <h3>JSON Enforcement</h3>\n            <p>To use an LLM in a data pipeline, it must return structured data. You can force modern LLMs (using OpenAI structured outputs or JSON mode) to strictly adhere to a JSON schema, ensuring the pipeline doesn't break.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the biggest risk of using an LLM to parse unstructured data in an automated ETL pipeline?",
            "answer": "Hallucinations and output instability. The LLM might output a string when an integer was expected, breaking downstream tables, or it might invent data that wasn't in the source text. You must use strict JSON schema enforcement and robust error-handling queues for failed parses."
        },
        {
            "question": "How can you minimize latency when running AI extraction on a stream of millions of events?",
            "answer": "LLM calls are slow. You should only route unstructured fields to the LLM (bypassing structured fields), use smaller/faster models (like Llama 3 8B instead of GPT-4) for simple extraction tasks, and aggressively cache previous inputs/outputs."
        }
    ]
}
};
