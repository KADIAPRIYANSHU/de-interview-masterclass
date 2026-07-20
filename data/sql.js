window.sqlLessons = {
    "1.1": {
    "id": "1.1",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Execution Order",
    "title": "Logical Query Execution Order",
    "subtitle": "How database engines actually parse SQL queries vs. how they are written.",
    "duration": "🕒 12 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Written Order vs. Execution Order</h3>\n            <p>We write SQL queries starting with <code>SELECT</code>, but database engines process SELECT nearly last. Understanding the execution order is the single most important skill for debugging and query optimization.</p>\n            <h3>Logical Execution Sequence</h3>\n            <ol>\n                <li><strong>FROM:</strong> Identifies the source tables and gathers the initial dataset rows.</li>\n                <li><strong>ON:</strong> Evaluates join conditions.</li>\n                <li><strong>JOIN:</strong> Performs table joins (Left, Inner, etc.), creating a temporary joined set.</li>\n                <li><strong>WHERE:</strong> Filters raw rows based on conditional checks. (Window functions are blocked here!).</li>\n                <li><strong>GROUP BY:</strong> Groups rows sharing common values.</li>\n                <li><strong>HAVING:</strong> Filters grouped categories (e.g. <code>HAVING SUM(sales) > 100</code>).</li>\n                <li><strong>SELECT:</strong> Selects columns, evaluates expressions, and computes Window Functions.</li>\n                <li><strong>DISTINCT:</strong> Deduplicates values.</li>\n                <li><strong>ORDER BY:</strong> Sorts rows (high processing cost).</li>\n                <li><strong>LIMIT / OFFSET:</strong> Restricts the number of output rows returned.</li>\n            </ol>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why can't you reference an alias created in the SELECT clause inside the WHERE clause?",
            "answer": "Because the <code>WHERE</code> clause is executed *before* the <code>SELECT</code> clause. When the engine filters rows in the WHERE step, the columns specified in SELECT (and their aliases) have not yet been evaluated or created."
        },
        {
            "question": "Can you use window functions (like ROW_NUMBER()) inside a WHERE clause? Why or why not?",
            "answer": "No. Window functions are evaluated in the <code>SELECT</code> step, which executes *after* the <code>WHERE</code> step. To filter based on a window function, you must wrap the query in a subquery or CTE, or use Snowflake's <code>QUALIFY</code> clause."
        }
    ]
},
    "1.2": {
    "id": "1.2",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Joins & Nulls",
    "title": "Joins Internals & NULL Handling",
    "subtitle": "Inner, Outer, Cross, and Self Joins, and the danger of NULL comparisons.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Join Operations</h3>\n            <ul>\n                <li><strong>INNER JOIN:</strong> Returns rows when there is a match in both tables.</li>\n                <li><strong>LEFT JOIN:</strong> Returns all rows from the left table, and matching rows from the right table. Unmatched right rows return NULL.</li>\n                <li><strong>FULL OUTER JOIN:</strong> Returns all rows when there is a match in either table.</li>\n                <li><strong>CROSS JOIN:</strong> Cartesian product (multiplies every row of table A by every row of table B).</li>\n                <li><strong>SELF JOIN:</strong> Joining a table to itself (e.g., matching employees to managers).</li>\n            </ul>\n            <h3>The Danger of NULL comparisons</h3>\n            <p>In SQL, <code>NULL</code> represents 'unknown value'. Comparing any value to NULL using standard operators (<code>=</code>, <code>!=</code>) always evaluates to <strong>UNKNOWN</strong> (effectively False). You must use <code>IS NULL</code> or <code>IS NOT NULL</code>.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What happens if you run a LEFT JOIN and place a filter on the right table inside the WHERE clause?",
            "answer": "It implicitly converts the LEFT JOIN into an INNER JOIN. Because the WHERE clause runs after the JOIN, filtering for non-NULL values on the right table drops all unmatched rows that returned NULL."
        },
        {
            "question": "Why does 'WHERE column = NULL' return 0 rows in SQL?",
            "answer": "Because NULL represents an unknown state, not a value. Any direct comparison to NULL (using <code>=</code> or <code>!=</code>) yields UNKNOWN, which fails the filter check. You must write <code>WHERE column IS NULL</code>."
        }
    ]
},
    "1.3": {
    "id": "1.3",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Aggregations",
    "title": "Aggregations & Grouping Sets",
    "subtitle": "Master GROUPING SETS, CUBE, and ROLLUP for multidimensional analysis.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Multidimensional Grouping</h3>\n            <p>In analytical SQL, summarizing metrics across varying dimension hierarchies usually requires multiple GROUP BY queries combined with UNION ALL. Advanced SQL provides three operators to execute this in a single query:</p>\n            <ul>\n                <li><strong>GROUPING SETS:</strong> Explicitly defines which group combinations to calculate (e.g. group by region, group by year, and overall).</li>\n                <li><strong>ROLLUP:</strong> Calculates hierarchical aggregates (e.g. Grouping by Country, State, and City, rolling up totals at each level).</li>\n                <li><strong>CUBE:</strong> Calculates every possible combination of selected dimensions (e.g. if grouping by 3 columns, it outputs 8 different aggregation sets).</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between ROLLUP and CUBE?",
            "answer": "ROLLUP generates hierarchical, ordered groupings (e.g. Year -> Month -> Day). CUBE generates all possible mathematical permutations of the columns, calculating aggregates across all dimension angles."
        }
    ]
},
    "1.4": {
    "id": "1.4",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Window Functions",
    "title": "Window Functions & Analytics",
    "subtitle": "ROW_NUMBER, RANK, DENSE_RANK, LAG, and LEAD patterns.",
    "duration": "🕒 18 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Window Functions</h3>\n            <p>Window functions perform calculations across a set of table rows related to the current row, without collapsing the rows into a single output group (unlike GROUP BY).</p>\n            <h3>Key Functions</h3>\n            <ul>\n                <li><code>ROW_NUMBER()</code>: Assigns a unique sequential integer starting at 1.</li>\n                <li><code>RANK()</code>: Assigns sequential values, but duplicate values receive the same rank. Skips rank numbers after ties.</li>\n                <li><code>DENSE_RANK()</code>: Same as RANK, but does not skip rank numbers after ties (e.g., 1, 2, 2, 3).</li>\n                <li><code>LAG() / LEAD()</code>: Fetches column values from preceding (LAG) or succeeding (LEAD) rows in the partition.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "title": "Row numbering methods",
        "headers": [
            "Value",
            "ROW_NUMBER()",
            "RANK()",
            "DENSE_RANK()"
        ],
        "rows": [
            [
                "100",
                "1",
                "1",
                "1"
            ],
            [
                "100",
                "2",
                "1",
                "1"
            ],
            [
                "80",
                "3",
                "3",
                "2"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "Explain the difference between RANK() and DENSE_RANK() with an example.",
            "answer": "RANK leaves gaps in the sequence if there are ties. For values [100, 100, 80], RANK returns [1, 1, 3]. DENSE_RANK does not leave gaps, returning [1, 1, 2]."
        },
        {
            "question": "How do you calculate month-over-month sales growth using window functions?",
            "answer": "Use the **LAG()** function to fetch the previous month's sales: <code>SELECT sales - LAG(sales, 1) OVER (ORDER BY order_month) AS mom_growth FROM monthly_sales;</code>."
        }
    ]
},
    "1.5": {
    "id": "1.5",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "CTEs & Subqueries",
    "title": "CTEs, Subqueries & Recursion",
    "subtitle": "Correlated subqueries, Common Table Expressions, and recursive tree traversal.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>SQL Structures</h3>\n            <ul>\n                <li><strong>Subquery:</strong> A query nested inside another query (e.g., in WHERE or FROM).\n                    <ul>\n                        <li><em>Correlated:</em> References columns from the parent outer query. Runs once for every candidate row (can be slow).</li>\n                    </ul>\n                </li>\n                <li><strong>CTE (Common Table Expression):</strong> Defined using the <code>WITH</code> statement. It improves query readability and serves as a temporary named view.</li>\n            </ul>\n            <h3>Recursive CTEs</h3>\n            <p>Used to query hierarchical tree structures (like manager-employee org charts). It features an <strong>Anchor Query</strong> (the starting node) unioned with a <strong>Recursive Query</strong> that references the CTE itself until no more children are found.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is a Correlated Subquery and why can it perform poorly?",
            "answer": "A correlated subquery references columns from the outer query in its WHERE clause. The database engine must re-evaluate the subquery for every single candidate row processed by the outer query, causing high O(N^2) execution times."
        },
        {
            "question": "Write the basic structure of a Recursive CTE to traverse an org hierarchy.",
            "answer": "<code>WITH RECURSIVE org AS ( <br>&nbsp;&nbsp;SELECT emp_id, manager_id FROM employees WHERE manager_id IS NULL -- Anchor<br>&nbsp;&nbsp;UNION ALL<br>&nbsp;&nbsp;SELECT e.emp_id, e.manager_id FROM employees e JOIN org o ON e.manager_id = o.emp_id -- Recursion<br>) SELECT * FROM org;</code>"
        }
    ]
},
    "2.1": {
    "id": "2.1",
    "stage": "Stage 2: Advanced SQL Optimization",
    "module": "Tuning Internals",
    "title": "Query Tuning, Plans & Indexing",
    "subtitle": "B-Tree vs. Clustered indexes, scan vs. seek, and predicate pushdown.",
    "duration": "🕒 20 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Database Indexing</h3>\n            <p>Traditional transactional databases (like PostgreSQL, SQL Server) rely on physical indices to speed up queries:</p>\n            <ul>\n                <li><strong>Clustered Index:</strong> Dictates the physical sort order of the table rows on disk. Only one per table.</li>\n                <li><strong>Non-Clustered Index:</strong> A separate index structure containing key-pointer pairs pointing back to the physical rows.</li>\n            </ul>\n            <h3>Execution Operators</h3>\n            <ul>\n                <li><strong>Index Seek:</strong> Directly navigates the index tree to locate matching keys (very fast, O(log N)).</li>\n                <li><strong>Index Scan:</strong> Scans the entire index file because the query filter key is not selective enough (slower).</li>\n                <li><strong>Table Scan:</strong> Scans every single row in the database table (slowest, O(N)).</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between an Index Scan and an Index Seek in an execution plan?",
            "answer": "An Index Seek navigates the index B-Tree directly using search keys to find exact records. An Index Scan traverses the entire index leaf node space, which occurs when filters are missing or columns are not indexed selectively."
        },
        {
            "question": "How do you identify why a query is slow using an EXPLAIN plan?",
            "answer": "Inspect the execution path. Look for 'Table Scan' or 'Seq Scan' on large tables, check if the engine is using nested loop joins on large sets, and check for high cost estimate percentages."
        }
    ]
},
    "2.2": {
    "id": "2.2",
    "stage": "Stage 2: Advanced SQL Optimization",
    "module": "Set Operations",
    "title": "Set Operations & Subquery Filters",
    "subtitle": "UNION vs. UNION ALL, EXCEPT, and EXISTS vs. IN optimizations.",
    "duration": "🕒 12 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Set Operations</h3>\n            <ul>\n                <li><strong>UNION ALL:</strong> Concatenates two datasets. Very fast because it does not check for duplicate rows.</li>\n                <li><strong>UNION:</strong> Concatenates datasets and removes duplicates. Slower because it triggers a sort/hash check to drop duplicates.</li>\n                <li><strong>EXCEPT / MINUS:</strong> Returns rows from query A that are missing in query B.</li>\n                <li><strong>INTERSECT:</strong> Returns rows common to both queries.</li>\n            </ul>\n            <h3>EXISTS vs. IN</h3>\n            <p><strong>IN:</strong> Usually compiles to a join, but loads the subquery list in memory. Best for small static lists.</p>\n            <p><strong>EXISTS:</strong> Evaluates boolean presence. The database stops evaluating the subquery the moment it finds the first matching row (semi-join optimization). Best for large tables.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "Why should you prefer UNION ALL over UNION in production pipelines?",
            "answer": "UNION triggers an implicit deduplication check that requires sorting and filtering data in memory, which is resource-intensive. If you know the datasets have no duplicates or if duplicates are acceptable, UNION ALL executes much faster."
        },
        {
            "question": "When is EXISTS more performant than IN?",
            "answer": "EXISTS is faster when checking presence in a large subquery table. The database engine uses a semi-join and stops scanning the subquery table the moment it encounters the first matching row, rather than evaluating all records."
        }
    ]
},
    "2.3": {
    "id": "2.3",
    "stage": "Stage 2: Advanced SQL Optimization",
    "module": "DML & Transactions",
    "title": "DML Operations & Isolation Levels",
    "subtitle": "DELETE vs. TRUNCATE, and ACID transaction isolation properties.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>DELETE vs. TRUNCATE</h3>\n            <ul>\n                <li><strong>DELETE:</strong> DML command. Deletes specific rows using a WHERE filter. Logs every deleted row in transaction logs, enabling rollback. (Slower).</li>\n                <li><strong>TRUNCATE:</strong> DDL command. Drops the entire table space and metadata pointers. Cannot filter rows. Logs only the partition page deallocation (cannot be rolled back in most databases). (Instantaneous).</li>\n            </ul>\n            <h3>ACID Isolation Levels</h3>\n            <p>Isolation prevents concurrent transactions from corrupting data. Standards include:</p>\n            <ul>\n                <li><strong>Read Committed:</strong> A transaction only reads committed changes. Prevents Dirty Reads, but allows Non-Repeatable Reads.</li>\n                <li><strong>Serializable:</strong> Complete isolation. Transactions execute as if they ran sequentially. Prevents all anomalies but can cause high locks and rollback failures.</li>\n            </ul>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between DELETE and TRUNCATE?",
            "answer": "DELETE is a DML statement that removes rows conditionally, logging each row removal (slower, rollable). TRUNCATE is a DDL statement that deallocates the table's disk pages directly (instant, non-conditional, non-rollable in transactional logs)."
        },
        {
            "question": "What is a Dirty Read in database transactions?",
            "answer": "A Dirty Read occurs when Transaction A reads data modified by Transaction B before Transaction B has committed those changes. If Transaction B rolls back, the data read by Transaction A is invalid."
        }
    ]
},
    "2.4": {
    "id": "2.4",
    "stage": "Stage 2: Advanced SQL Optimization",
    "module": "Sliding Frames",
    "title": "Sliding Window Frames",
    "subtitle": "Advanced partition frame options: ROWS vs. RANGE BETWEEN.",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "\n            <h3>Window Frame Specifications</h3>\n            <p>Within a partition, you can specify exactly which rows to include in the window calculation relative to the current row:</p>\n            <ul>\n                <li><strong>ROWS BETWEEN:</strong> Measures physical row offsets (e.g. <code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code>).</li>\n                <li><strong>RANGE BETWEEN:</strong> Measures logical value offsets (e.g. date boundaries). If sorting by date, it aggregates rows matching a date range rather than physical row counts.</li>\n            </ul>\n            <p>Default frame is <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, which can cause performance overheads.</p>\n        ",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": [
        {
            "question": "What is the difference between ROWS and RANGE in a window frame?",
            "answer": "ROWS defines the frame based on physical offsets from the current row (e.g., 3 rows back). RANGE defines the frame logically based on values in the sorted column (e.g., values matching within 3 days)."
        },
        {
            "question": "Write a query to calculate a 7-day rolling average of sales.",
            "answer": "<code>SELECT date, sales, AVG(sales) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_avg FROM daily_sales;</code>"
        }
    ]
},
    "2.5": {
    "id": "2.5",
    "stage": "Stage 2: Advanced SQL Optimization",
    "module": "UDFs & Procedures",
    "title": "UDFs vs. Stored Procedures",
    "subtitle": "Differentiate return schemas, execution scope, and automation.",
    "duration": "🕒 15 min read",
    "difficulty": "Intermediate",
    "theory": "\n            <h3>Stored Procedures</h3>\n            <p>Stored Procedures are used to execute complex business logic that requires multiple DDL/DML statements. They can perform inserts, updates, deletes, manage transactions, and even execute dynamic SQL. They usually do not return a single value directly for use in a query, but rather return a status or output variables.</p>\n            <h3>User Defined Functions (UDFs)</h3>\n            <p>UDFs are designed to compute and return a value (scalar) or a set of rows (table function). They must be deterministic (or declared otherwise), cannot perform DML (inserts/updates), and are heavily optimized to be called directly within a SELECT statement.</p>\n            <h3>Execution Context</h3>\n            <p>Stored Procedures often execute with Caller's Rights (running with the permissions of the user calling them) or Owner's Rights (running with the permissions of the creator, allowing users to safely perform actions they normally couldn't).</p>\n        ",
    "hasDiagram": false,
    "hasTable": true,
    "tableData": {
        "title": "UDF vs. Stored Procedure",
        "headers": [
            "Property",
            "UDF",
            "Stored Procedure"
        ],
        "rows": [
            [
                "Usage in SELECT",
                "Allowed",
                "Blocked (Requires CALL)"
            ],
            [
                "DML Alterations",
                "Blocked (Read-only)",
                "Allowed"
            ],
            [
                "Returns",
                "Mandatory value/table",
                "Optional status code / None"
            ]
        ]
    },
    "interviewQuestions": [
        {
            "question": "When should you write a Stored Procedure instead of a User Defined Function?",
            "answer": "Use Stored Procedures when executing administrative tasks or multi-step DML pipelines (like dropping schemas, running copy operations, or executing dynamic SQL strings). Use UDFs for row-level transformations that must run inside SELECT statements."
        },
        {
            "question": "Can I write an INSERT statement inside a User Defined Function (UDF)?",
            "answer": "No. UDFs are restricted from performing DML operations (INSERT, UPDATE, DELETE) and DDL operations. If you need to modify data state, you must use a Stored Procedure."
        },
        {
            "question": "What is the difference between Caller's Rights and Owner's Rights in a Stored Procedure?",
            "answer": "Caller's Rights execute the procedure using the privileges of the person running it. Owner's Rights execute the procedure using the privileges of the person who created it. Owner's Rights are often used to let low-privileged users execute specific administrative tasks securely."
        }
    ]
},
    "1.11": {
    "id": "1.11",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Execution Order",
    "title": "Execution Order",
    "subtitle": "FROM, WHERE, GROUP BY...",
    "duration": "🕒 10 min read",
    "difficulty": "Beginner",
    "theory": "<p>Logical order of execution: 1. FROM/JOIN, 2. WHERE, 3. GROUP BY, 4. HAVING, 5. WINDOW functions, 6. QUALIFY, 7. SELECT, 8. ORDER BY, 9. LIMIT.</p>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.12": {
    "id": "1.12",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "ACID",
    "title": "Isolation Levels & Locks",
    "subtitle": "Read Committed vs Serializable",
    "duration": "🕒 15 min read",
    "difficulty": "Advanced",
    "theory": "<h3>Isolation Levels</h3><ul><li><strong>Read Uncommitted:</strong> Dirty reads.</li><li><strong>Read Committed:</strong> Default in most databases.</li><li><strong>Repeatable Read:</strong> Prevents phantom reads.</li><li><strong>Serializable:</strong> Strictest.</li></ul><h3>Locking</h3><ul><li><strong>Shared Lock:</strong> For reads.</li><li><strong>Exclusive Lock:</strong> For writes.</li><li><strong>Deadlocks:</strong> Circular wait for locks.</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
},
    "1.13": {
    "id": "1.13",
    "stage": "Stage 1: Core SQL Mechanics",
    "module": "Optimization",
    "title": "Query Optimization",
    "subtitle": "Execution Plan, Index Scan, Seek",
    "duration": "🕒 10 min read",
    "difficulty": "Advanced",
    "theory": "<ul><li><strong>Execution Plan:</strong> Visual roadmap of query execution.</li><li><strong>Statistics:</strong> Used by optimizer to choose paths.</li><li><strong>Index Scan:</strong> Scanning entire index (slow).</li><li><strong>Index Seek:</strong> Navigating b-tree to exact row (fast).</li></ul>",
    "hasDiagram": false,
    "hasTable": false,
    "interviewQuestions": []
}
};
