window.pythonLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "Data Structures",
    "title": "Python Data Structures & Memory",
    "subtitle": "Lists, Tuples, Sets, Dictionaries, and list comprehensions.",
    "duration": "🕒 12 min read",
    "difficulty": "Beginner to Intermediate",
    "theory": "\n            <h3>Built-in Data Structures</h3>\n            <ul>\n                <li><strong>List:</strong> Ordered, mutable, allows duplicate items. <code>[1, 2, 2]</code>.</li>\n                <li><strong>Tuple:</strong> Ordered, immutable, allows duplicates. <code>(1, 2, 2)</code>. Used for read-only static configs (saves memory).</li>\n                <li><strong>Set:</strong> Unordered, mutable, unique elements only. <code>{1, 2}</code>. Hash-table lookup (extremely fast lookup times, O(1)).</li>\n                <li><strong>Dictionary:</strong> Key-value mapping. Keys must be immutable and hashable.</li>\n            </ul>\n            <h3>List Comprehensions</h3>\n            <p>An elegant way to create lists from iterable objects in a single line. It executes faster than standard for-loops by utilizing optimized C-level iterations:</p>\n            <p><code>squares = [x**2 for x in range(10) if x % 2 == 0]</code></p>\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "title": "Data Structure Complexity",
        "headers": [
            "Structure",
            "Ordered",
            "Mutable",
            "Search Complexity"
        ],
        "rows": [
            [
                "List",
                "Yes",
                "Yes",
                "O(N) (linear search)"
            ],
            [
                "Tuple",
                "Yes",
                "No",
                "O(N)"
            ],
            [
                "Set",
                "No",
                "Yes",
                "O(1) (instant hash lookup)"
            ],
            [
                "Dictionary",
                "Yes (3.7+)",
                "Yes",
                "O(1)"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "Why is searching inside a Set faster than searching inside a List?",
            "answer": "A Set is implemented as a hash table. Checking presence (<code>item in my_set</code>) takes constant O(1) time because the item's hash directly calculates its index. Lists require a linear scan of elements, taking O(N) time."
        },
        {
            "question": "What is the difference between a List and a Tuple in Python?",
            "answer": "Lists are mutable (you can append/edit values) and have a larger memory overhead. Tuples are immutable (cannot be changed after creation), making them memory-efficient and suitable for key-value dictionary keys."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "Functional Python",
    "title": "OOP, Generators & Decorators",
    "subtitle": "Classes, lambda maps, yield generators, and custom decorators.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Functional Python & Iterators</h3>\n            <ul>\n                <li><strong>Lambda Functions:</strong> Anonymous single-line functions: <code>add = lambda x, y: x + y</code>.</li>\n                <li><strong>Generators (yield):</strong> Functions that return an iterator using the <code>yield</code> keyword instead of returning a list. They evaluate items one-by-one on demand, saving massive RAM when processing large files (Lazy Evaluation).</li>\n                <li><strong>Decorators:</strong> Functions that wrap another function to modify its behavior (e.g. adding logging or execution time measurements) without changing its code.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What are Python Generators and when should you use them in data pipelines?",
            "answer": "Generators are functions that produce items on the fly using the `yield` keyword. You should use them to stream and process massive data files line-by-line, avoiding loading gigabytes of data into RAM at once."
        },
        {
            "question": "Write a custom decorator that prints the execution time of a function.",
            "answer": "<code>import time<br>def time_it(func):<br>&nbsp;&nbsp;def wrapper(*args, **kwargs):<br>&nbsp;&nbsp;&nbsp;&nbsp;start = time.time()<br>&nbsp;&nbsp;&nbsp;&nbsp;result = func(*args, **kwargs)<br>&nbsp;&nbsp;&nbsp;&nbsp;print(f'Duration: {time.time() - start}')<br>&nbsp;&nbsp;&nbsp;&nbsp;return result<br>&nbsp;&nbsp;return wrapper</code>"
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "File Handling",
    "title": "File Handling & Formats",
    "subtitle": "Read/write CSV, JSON, and Parquet formats efficiently.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Data Formats in Data Engineering</h3>\n            <p>Choosing the right file format is critical for performance and cost. <strong>CSV</strong> and <strong>JSON</strong> are row-based, human-readable, but highly inefficient for querying large datasets.</p>\n            <h3>Parquet & Avro</h3>\n            <ul>\n                <li><strong>Parquet:</strong> A columnar storage format. It is highly optimized for analytical (OLAP) queries. If you only select 2 columns out of 100, Parquet only reads those 2 columns from disk, saving massive I/O.</li>\n                <li><strong>Avro:</strong> A row-based format heavily used in streaming architectures (like Kafka). It embeds the schema within the file, making it excellent for schema evolution.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why is utilizing the 'with open()' syntax preferred when reading files?",
            "answer": "The `with` statement acts as a Context Manager. It handles opening and guarantees the closing of the file stream immediately when the code block terminates, even if error events occur inside the block."
        },
        {
            "question": "Why is Parquet preferred over CSV for data warehousing?",
            "answer": "Parquet is columnar, meaning queries that only select a few columns scan exponentially less disk space than CSV. It also supports advanced dictionary encoding and compression, resulting in much smaller file sizes and faster I/O."
        }
    ]
},
    "1.4": {
    "id": "1.4",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "Logging & Errors",
    "title": "Exception Handling & Logging",
    "subtitle": "Try-except blocks, custom exceptions, and structured logs.",
    "duration": "🕒 12 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Exception Handling in Pipelines</h3>\n            <p>Data pipelines will fail. Network timeouts occur, schemas change, and API limits are hit. Robust exception handling prevents silent failures and data corruption.</p>\n            <pre><code>try:\n    data = fetch_api_data()\nexcept requests.exceptions.Timeout:\n    logger.error(\"API timeout. Retrying...\")\n    retry_fetch()\nexcept ValueError as e:\n    logger.critical(f\"Schema mismatch: {e}\")\n    raise # Fail the pipeline</code></pre>\n            <h3>Structured Logging</h3>\n            <p>Using basic <code>print()</code> statements is an anti-pattern in production. Use Python's <code>logging</code> module to capture timestamps, severity levels (INFO, WARN, ERROR), and output logs in JSON format for easy ingestion by monitoring tools (like Datadog or ELK).</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why should you never write a bare 'except:' clause?",
            "answer": "A bare `except:` catches all exceptions, including KeyboardInterrupt (Ctrl+C) and SystemExit, making it difficult to stop execution manually and hiding unintended coding errors."
        },
        {
            "question": "What is the difference between raising an exception and handling it?",
            "answer": "Handling an exception (using try/except) allows the program to recover, log the error, and continue running. Raising an exception deliberately crashes the program or propagates the error up the call stack, which is often necessary when continuing would corrupt data."
        }
    ]
},
    "1.5": {
    "id": "1.5",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "APIs & Web",
    "title": "REST API Integration & requests",
    "subtitle": "Using requests, parsing JSON, and handling timeout parameters.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>API Integrations</h3>\n            <p>Data engineers extract data from web endpoints using the <code>requests</code> package. When calling external APIs, always configure:\n            <ul>\n                <li><strong>Timeouts:</strong> Prevents pipelines from hanging indefinitely if an API server crashes (e.g. <code>requests.get(url, timeout=10)</code>).</li>\n                <li><strong>HTTP Error Checks:</strong> Run <code>response.raise_for_status()</code> to raise exceptions on 4xx/5xx failures.</li>\n            </ul>\n            </p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you handle API retries when encountering 503 Service Unavailable errors?",
            "answer": "Use the **urllib3.util.retry** class. Configure a HTTPAdapter with dynamic Retry parameters (like <code>backoff_factor=1</code>) and mount it to your requests Session, automating retries on select status codes."
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Analytics & Scale (pandas/Spark)",
    "module": "pandas Basics",
    "title": "pandas DataFrames Core",
    "subtitle": "DataFrames, Series, filtering, and checking null states.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>pandas DataFrames</h3>\n            <p>A pandas DataFrame is a 2-dimensional labeled data structure, conceptually similar to a SQL table. It is the workhorse of Python data manipulation.</p>\n            <h3>Memory Limitations</h3>\n            <p>pandas operates strictly <strong>in-memory</strong>. If you try to load a 50GB CSV into pandas on a machine with 16GB of RAM, it will crash with an OutOfMemory error. To handle larger-than-memory datasets, you must either chunk the data (using <code>chunksize</code> in <code>read_csv</code>) or switch to distributed frameworks like PySpark or Polars.</p>\n            <h3>Vectorization vs Iteration</h3>\n            <p>Never use <code>iterrows()</code> or for-loops on a DataFrame unless absolutely necessary. Instead, use vectorized operations (e.g., <code>df['c'] = df['a'] + df['b']</code>) which are executed in highly optimized C code, making them orders of magnitude faster.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between loc and iloc in pandas?",
            "answer": "<code>loc</code> performs selection based on label indexing (column/row names). <code>iloc</code> performs selection based on physical integer positions (0-indexed)."
        },
        {
            "question": "Your pandas pipeline fails with an OutOfMemory error. How do you fix it without upgrading hardware?",
            "answer": "You can process the file in chunks using pandas' chunksize parameter, drop unnecessary columns during load using usecols, or specify lighter data types (like categoricals or int32 instead of int64) using the dtype parameter."
        },
        {
            "question": "Why is iterrows() considered an anti-pattern in pandas?",
            "answer": "Iterrows forces Python to process each row individually at the interpreter level, which is incredibly slow. Vectorized operations bypass the Python loop entirely and execute operations across entire arrays simultaneously in C."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Analytics & Scale (pandas/Spark)",
    "module": "pandas Advanced",
    "title": "pandas Aggregations & Memory Tuning",
    "subtitle": "GroupBy transformations, merging, and category type memory optimizations.",
    "duration": "🕒 18 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>DataFrame Operations</h3>\n            <ul>\n                <li><strong>Aggregations:</strong> <code>df.groupby('col').agg({'val': 'sum'})</code></li>\n                <li><strong>Joins:</strong> Use <code>pd.merge()</code> to run database-style joins (Inner, Left, etc.).</li>\n            </ul>\n            <h3>Memory Optimization</h3>\n            <p>Standard pandas reads text columns as memory-heavy object strings. If a column has low cardinality (e.g. State, Category), convert it to <code>category</code> data type. This stores values as small integers internally, saving up to 80% RAM footprint.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you optimize memory consumption when loading large CSV datasets in pandas?",
            "answer": "1. Specify only required columns using the `usecols` parameter. 2. Define category types for string columns with low cardinality. 3. Downcast numerical integers using `pd.to_numeric()`."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Analytics & Scale (pandas/Spark)",
    "module": "PySpark Core",
    "title": "PySpark Core Architecture",
    "subtitle": "Driver vs. Worker nodes, lazy evaluation, and RDDs vs. DataFrames.",
    "duration": "🕒 18 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>PySpark Architecture</h3>\n            <p>Apache Spark is a distributed cluster computing framework. Key components:</p>\n            <ul>\n                <li><strong>Driver Node:</strong> The master node. Coordinates the execution, parses code, maintains the execution plan, and schedules tasks to executors.</li>\n                <li><strong>Worker Nodes (Executors):</strong> The workhorse machines. They process task partitions assigned by the driver.</li>\n            </ul>\n            <h3>Lazy Evaluation</h3>\n            <p>Spark does not execute transformations (like filtering or projections) immediately. It builds a <strong>Logical Execution Graph (DAG)</strong>. Operations are only compiled and executed when an <strong>Action</strong> (like <code>collect()</code>, <code>write()</code>, <code>count()</code>) is triggered, allowing the optimizer to plan efficiently.</p>\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "title": "Spark Operations",
        "headers": [
            "Operation Type",
            "Examples",
            "Does it trigger computation?"
        ],
        "rows": [
            [
                "Transformation",
                "filter(), select(), join(), groupBy()",
                "No (only builds execution plan)"
            ],
            [
                "Action",
                "show(), collect(), count(), write()",
                "Yes (compiles and executes the DAG)"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "What is Lazy Evaluation in Spark and how does it optimize queries?",
            "answer": "Spark compiles operations (Transformations) into a logical DAG without executing them. Only when an Action is called does Spark evaluate the entire graph, optimizing join paths and pushing filters directly down to data scans, saving memory."
        },
        {
            "question": "Describe Spark's Driver-Executor cluster structure.",
            "answer": "The Driver acts as the orchestrator, managing resources, translating code into tasks, and planning execution. Executors are worker nodes that run the computational tasks on data partitions and report results back to the driver."
        }
    ]
},
    "2.4": {
    "id": "2.4",
    "stage": "Stage 2: Analytics & Scale (pandas/Spark)",
    "module": "PySpark Transforms",
    "title": "PySpark Data Transformations",
    "subtitle": "Aggregations, analytical windowing, and broadcast joins in Spark.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Spark Data Transformations</h3>\n            <p>In PySpark, data operations are written using DataFrame APIs:</p>\n            <ul>\n                <li><strong>Groupings:</strong> <code>df.groupBy(\"region\").agg(sum(\"sales\").alias(\"total\"))</code></li>\n                <li><strong>Window Functions:</strong> Created using the <code>Window.partitionBy()</code> API wrapper.</li>\n                <li><strong>Broadcast Joins:</strong> Replicates a small DataFrame to all executors, skipping network shuffles during join operations. Triggered using: <code>join(broadcast(small_df), \"id\")</code>.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "How do you execute a Broadcast Join in PySpark and when is it useful?",
            "answer": "Import the `broadcast` function: <code>df.join(broadcast(small_df), 'key')</code>. It is used when joining a large dataset with a small lookup table, saving network transfer costs by copying the small table to all nodes."
        }
    ]
},
    "2.5": {
    "id": "2.5",
    "stage": "Stage 2: Analytics & Scale (pandas/Spark)",
    "module": "Unit Testing Python",
    "title": "Python Unit Testing & pytest",
    "subtitle": "Mocking external APIs, database handlers, and writing fixtures.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Unit Testing in Python</h3>\n            <p>We validate python ETL jobs using testing frameworks like <strong>pytest</strong>.</p>\n            <h3>Mocking & Fixtures</h3>\n            <ul>\n                <li><strong>Fixtures:</strong> Reusable setup functions that output test inputs (e.g. creating a temporary mock pandas DataFrame).</li>\n                <li><strong>Mocking:</strong> Simulating external dependencies (like database handlers or HTTP client connections) using the <code>unittest.mock</code> library. This validates ETL logic without hitting live APIs or databases.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a Pytest Fixture and how is it used?",
            "answer": "A Fixture is a decorator-annotated function that prepares a testing environment (e.g. launching a mock database container or mock dataframe) and feeds it to test cases as argument inputs, preventing redundant setup code."
        },
        {
            "question": "Why should you mock database connections during unit tests?",
            "answer": "Unit tests validate your code logic, not network performance. Mocking database handlers avoids making network calls, speeds up testing, and prevents test cases from modifying live database records."
        }
    ]
},
    "1.11": {
    "id": "1.11",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "Advanced Syntax",
    "title": "Context Managers, Decorators, Generators",
    "subtitle": "with open(), yield",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "<ul><li><strong>Context Managers:</strong> <code>with open()</code> ensures resources are cleaned up.</li><li><strong>Decorators:</strong> Wrappers to modify function behavior.</li><li><strong>Generators:</strong> <code>yield</code> keyword for lazy evaluation, saving memory.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.12": {
    "id": "1.12",
    "stage": "Stage 1: Core Python & Engineering",
    "module": "Environment",
    "title": "Virtual Environments & Logging",
    "subtitle": "venv, pip, logging",
    "duration": "🕒 10 min read",
    "difficulty": "Beginner",
    "theory": "<ul><li><strong>Virtual Environment (venv):</strong> Isolated dependency spaces. Managed by <code>requirements.txt</code> and <code>pip</code>.</li><li><strong>Logging Module:</strong> Built-in <code>logging</code> for warning/error tracking instead of <code>print()</code>.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
}
};
