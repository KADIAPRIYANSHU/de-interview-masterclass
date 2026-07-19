# Goal Description
Expand the existing curriculum modules to explicitly include the granular sub-bullets and keywords requested by the user, ensuring 100% coverage of the provided syllabus.

## Proposed Changes

We will execute a targeted Node.js script to dynamically inject the missing granular topics into the `theory` blocks of the existing modules.

### Snowflake Enhancements (`data/snowflake.js`)
- **Warehouse Scaling:** Inject `Auto-Suspend`, `Auto-Resume`, and `Warehouse Sizes` (X-Small to 6X-Large).
- **Time Travel:** Inject explicit mentions of `Restore Database/Schema/Table` and `Data Retention limits`.
- **SQL Functions:** Inject `RESULT_SCAN()` and `TABLE Functions`.
- **Semi-Structured Data:** Inject `OBJECT_CONSTRUCT()`, `ARRAY_CONSTRUCT()`, and `ARRAY_APPEND()`.
- **Connectors:** Inject `Kafka Connector` and `Snowpipe Streaming`.
- **Security:** Inject `OAuth`, `External OAuth`, and `Key Pair Authentication`.

### ADF Enhancements (`data/adf.js`)
- **Trigger Types:** Inject explicit definitions for `Schedule`, `Event`, `Tumbling Window`, and `Manual`.
- **REST APIs:** Inject `Pagination`, `OAuth Authentication`, and `Retry`.
- **Parameters:** Inject explicit differences between `Pipeline Parameter`, `Variable`, and `Dataset Parameter`.

### dbt Enhancements (`data/dbt.js`)
- **Packages:** Create/Inject coverage for `dbt-utils`, `dbt-expectations`, and `audit-helper`.
- **Source Freshness:** Inject `loaded_at_field`, `warn_after`, and `error_after`.
- **Artifacts:** Inject coverage of `run_results.json`, `catalog.json`, and `sources.json`.
- **Environment Management:** Inject `dev`, `qa`, and `prod` isolation patterns.

## Verification Plan
1. Run the expansion script.
2. Run `validate.js` to ensure JSON syntax remains valid and HTML is not broken.
3. Re-generate `Full_Curriculum_Reference.md` so the user can verify the exact keywords are present.
4. Deploy to Vercel.
