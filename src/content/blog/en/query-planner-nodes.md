---
title: "Query Planner Nodes"
description: "Understanding SQL query execution plans and how to optimize them"
pubDate: 2025-12-10
featuredImage: ""
draft: false
lang: "en"
slug: "query-planner-nodes"
translationKey: "query-planner-nodes"
---

## 🚨 Bad Operations

### 1. **Full Table Scan / Seq Scan**

```
Seq Scan on users  (cost=0.00..10000.00 rows=100000)
```

**Problem:** Reading every row in the table
**Fix:** Add an index on WHERE/JOIN columns

```sql
CREATE INDEX idx_users_email ON users(email);
```

**After:**

```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=64)
  Index Cond: (email = 'john@example.com')
```

The cost drops from 10000 to ~8, and we go from examining 100k rows to just 1.

---

### 2. **Filesort / Sort (with large row counts)**

```
Sort  (cost=5000.00..5500.00 rows=200000)
  Sort Key: created_date DESC
```

**Problem:** Sorting in memory/disk instead of using index order
**Fix:** Add index with matching ORDER BY direction

```sql
CREATE INDEX idx_created ON orders(created_date DESC);
```

**After:**

```
Index Scan using idx_created on orders  (cost=0.42..6500.00 rows=200000 width=40)
```

No more Sort node—the index returns rows pre-sorted. No disk spill.

---

### 3. **Using temporary / Using filesort**

```
Using temporary; Using filesort
```

**Problem:** Creating temp table then sorting (double penalty)
**Fix:** Create composite index covering GROUP BY and ORDER BY

```sql
-- For: GROUP BY category ORDER BY count DESC
CREATE INDEX idx_category ON products(category);
```

**After:**

```
GroupAggregate  (cost=0.42..12000.00 rows=1000 width=44)
  Group Key: category
  ->  Index Scan using idx_category on products  (cost=0.42..10000.00 rows=200000 width=36)
```

Sort node eliminated—index provides ordered access. No temp table needed.

---

### 4. **Nested Loop with large outer table**

```
Nested Loop  (cost=0.00..1000000.00 rows=1000000)
  -> Seq Scan on orders  (rows=100000)
  -> Index Scan on customers  (rows=10)
```

**Problem:** For each of 100k orders, looking up customer (expensive)
**Fix:** Add index on join columns

```sql
CREATE INDEX idx_orders_customer ON orders(customer_id);
```

**After (planner may choose Hash Join):**

```
Hash Join  (cost=3000.00..12000.00 rows=100000 width=100)
  Hash Cond: (orders.customer_id = customers.id)
  ->  Seq Scan on orders  (cost=0.00..5000.00 rows=100000 width=50)
  ->  Hash  (cost=2000.00..2000.00 rows=50000 width=50)
        ->  Seq Scan on customers  (cost=0.00..2000.00 rows=50000 width=50)
```

Or if filtering on customer first:

```
Nested Loop  (cost=0.85..8500.00 rows=100 width=100)
  ->  Index Scan using customers_pkey on customers  (cost=0.42..8.44 rows=1 width=50)
        Index Cond: (id = 123)
  ->  Index Scan using idx_orders_customer on orders  (cost=0.42..8000.00 rows=100 width=50)
        Index Cond: (customer_id = 123)
```

Cost drops dramatically when filtering; the index enables efficient lookups from either direction.

---

### 5. **Index Scan backward / Index Full Scan**

```
Index Scan Backward using idx_date on orders
```

**Problem:** Index exists but wrong direction
**Fix:** Match index direction to query

```sql
-- Query uses: ORDER BY created_date DESC
CREATE INDEX idx_date ON orders(created_date DESC);  -- not ASC
```

**After:**

```
Index Scan using idx_date on orders  (cost=0.42..45000.00 rows=100000 width=40)
  Index Cond: (created_date > '2024-01-01')
```

"Backward" disappears—index is now aligned with query direction. Slightly lower cost and better cache utilization.

---

### 6. **Using where (after index scan)**

```
Index Scan on users using idx_status
  Filter: created_date > '2024-01-01'  -- filtered 90% rows!
```

**Problem:** Index only partially helps; still filtering many rows
**Fix:** Create composite index

```sql
CREATE INDEX idx_status_date ON users(status, created_date);
```

**After:**

```
Index Scan using idx_status_date on users  (cost=0.42..5000.00 rows=10000 width=64)
  Index Cond: ((status = 'active') AND (created_date > '2024-01-01'))
```

No more Filter line—both conditions handled by index. Cost reduced by ~80%.

---

### 7. **High "rows examined" vs "rows returned"**

```
rows=1000000 filtered=1.00%  -- examining 1M to return 10K!
```

**Problem:** Poor selectivity, reading too much data
**Fix:** Reorder index columns (most selective first)

**After:**

```
Index Scan using idx_status_region_date on orders  (cost=0.42..8000.00 rows=10000 width=40)
  Index Cond: ((status = 'completed') AND (region = 'US') AND (created_date > '2020-01-01'))
```

Rows examined now matches rows returned. Cost reduced by 90%.

---

### 8. **Type: ALL**

```
type: ALL  -- worst possible
```

**Problem:** Full table scan
**Fix:** Add appropriate index

---

## ✅ What You Want to See

### Good operations:

* **`type: ref`** or **`type: eq_ref`** - Using index for lookups
* **`type: range`** - Using index for range scans
* **`Using index`** - Covering index (doesn't touch table data)
* **`Using index condition`** - Index used for filtering
* **Low cost** - Lower numbers are better
* **Rows examined ≈ Rows returned** - Not wasting reads

### Example of good execution:

```
Index Scan using idx_user_created on orders
  Index Cond: (user_id = 123 AND created_at > '2024-01-01')
  Rows: 50 (actual rows: 48)
  Using index  -- covering index, very fast!
```

---

## Quick Decision Tree

```
Full table scan? → Add index on WHERE columns
Filesort? → Add index with ORDER BY columns (matching direction)
Using temporary? → Index GROUP BY columns
High rows examined? → Composite index with better column order
Nested loop slow? → Index JOIN columns
Filter after index? → Expand composite index
```

**Pro tip:** Focus on queries with high `actual time` and `rows` first - these give you the biggest performance wins!
