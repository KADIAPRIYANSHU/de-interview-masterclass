const fs = require('fs');
let lines = fs.readFileSync('data/snowflake.js', 'utf8').split('\n');

// Find where "interviewQuestions: [" starts around line 600
let startIdx = lines.findIndex((l, i) => i > 600 && l.includes('interviewQuestions: ['));

let correctQuestions = [
'            { question: "When would you choose a Materialized View over a regular View?", answer: "Use a Materialized View when a complex aggregation or filter is queried frequently by BI tools and the base table changes infrequently. The MV pre-computes the result so BI queries get near-instant response times. Avoid MVs on high-churn tables where refresh costs exceed query savings." },',
'            { question: "What is query rewrite in the context of Materialized Views?", answer: "Query rewrite is when Snowflake\'s optimizer automatically redirects a query against the base table to the Materialized View if the MV can satisfy the query. The query author does not need to reference the MV explicitly — they query the base table and Snowflake handles the routing transparently." },',
'            { question: "When would you use a Dynamic Table instead of a Materialized View?", answer: "Use a Dynamic Table when your transformation requires JOINs, window functions, or complex multi-table logic that a Materialized View cannot support. Dynamic Tables accept any SQL including JOINs and window functions, and refresh incrementally based on a target lag setting. Use Materialized Views only for simple single-table aggregations where sub-second read latency is critical." }',
'        ]',
'    },',
'    "1.21": {'
];

// Find where "1.21": { starts
let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('"1.21": {'));

// Replace the slice
lines.splice(startIdx + 1, endIdx - startIdx, ...correctQuestions);

let newContent = lines.join('\n');
newContent = newContent.replace(/dY ' 10 min read/g, '🕒 10 min read');

fs.writeFileSync('data/snowflake.js', newContent);
console.log('Fixed file successfully');
