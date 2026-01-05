---
title: "Query Planner Nodes"
description: "Memahami execution plan query SQL dan cara mengoptimalkannya"
pubDate: 2025-12-10
featuredImage: ""
draft: false
lang: "id"
slug: "query-planner-nodes"
translationKey: "query-planner-nodes"
---

## 🚨 Operasi yang Buruk

### 1. **Full Table Scan / Seq Scan**

```
Seq Scan on users  (cost=0.00..10000.00 rows=100000)
```

**Masalah:** Membaca setiap baris dalam tabel
**Solusi:** Tambahkan index pada kolom WHERE/JOIN

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Sesudah:**

```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=64)
  Index Cond: (email = 'john@example.com')
```

Cost turun dari 10000 menjadi ~8, dan kita hanya memeriksa 1 baris dari 100k baris.

---

### 2. **Filesort / Sort (dengan jumlah baris besar)**

```
Sort  (cost=5000.00..5500.00 rows=200000)
  Sort Key: created_date DESC
```

**Masalah:** Sorting di memory/disk alih-alih menggunakan urutan index
**Solusi:** Tambahkan index dengan arah ORDER BY yang sesuai

```sql
CREATE INDEX idx_created ON orders(created_date DESC);
```

**Sesudah:**

```
Index Scan using idx_created on orders  (cost=0.42..6500.00 rows=200000 width=40)
```

Tidak ada lagi node Sort—index mengembalikan baris yang sudah terurut. Tidak ada disk spill.

---

### 3. **Using temporary / Using filesort**

```
Using temporary; Using filesort
```

**Masalah:** Membuat temp table lalu sorting (penalti ganda)
**Solusi:** Buat composite index yang mencakup GROUP BY dan ORDER BY

```sql
-- Untuk: GROUP BY category ORDER BY count DESC
CREATE INDEX idx_category ON products(category);
```

**Sesudah:**

```
GroupAggregate  (cost=0.42..12000.00 rows=1000 width=44)
  Group Key: category
  ->  Index Scan using idx_category on products  (cost=0.42..10000.00 rows=200000 width=36)
```

Node Sort dihilangkan—index menyediakan akses terurut. Tidak perlu temp table.

---

### 4. **Nested Loop dengan outer table besar**

```
Nested Loop  (cost=0.00..1000000.00 rows=1000000)
  -> Seq Scan on orders  (rows=100000)
  -> Index Scan on customers  (rows=10)
```

**Masalah:** Untuk setiap 100k orders, mencari customer (mahal)
**Solusi:** Tambahkan index pada kolom join

```sql
CREATE INDEX idx_orders_customer ON orders(customer_id);
```

**Sesudah (planner mungkin memilih Hash Join):**

```
Hash Join  (cost=3000.00..12000.00 rows=100000 width=100)
  Hash Cond: (orders.customer_id = customers.id)
  ->  Seq Scan on orders  (cost=0.00..5000.00 rows=100000 width=50)
  ->  Hash  (cost=2000.00..2000.00 rows=50000 width=50)
        ->  Seq Scan on customers  (cost=0.00..2000.00 rows=50000 width=50)
```

Atau jika memfilter customer terlebih dahulu:

```
Nested Loop  (cost=0.85..8500.00 rows=100 width=100)
  ->  Index Scan using customers_pkey on customers  (cost=0.42..8.44 rows=1 width=50)
        Index Cond: (id = 123)
  ->  Index Scan using idx_orders_customer on orders  (cost=0.42..8000.00 rows=100 width=50)
        Index Cond: (customer_id = 123)
```

Cost turun drastis saat memfilter; index memungkinkan lookup efisien dari kedua arah.

---

### 5. **Index Scan backward / Index Full Scan**

```
Index Scan Backward using idx_date on orders
```

**Masalah:** Index ada tapi arahnya salah
**Solusi:** Sesuaikan arah index dengan query

```sql
-- Query menggunakan: ORDER BY created_date DESC
CREATE INDEX idx_date ON orders(created_date DESC);  -- bukan ASC
```

**Sesudah:**

```
Index Scan using idx_date on orders  (cost=0.42..45000.00 rows=100000 width=40)
  Index Cond: (created_date > '2024-01-01')
```

"Backward" hilang—index sekarang selaras dengan arah query. Cost sedikit lebih rendah dan cache utilization lebih baik.

---

### 6. **Using where (setelah index scan)**

```
Index Scan on users using idx_status
  Filter: created_date > '2024-01-01'  -- memfilter 90% baris!
```

**Masalah:** Index hanya membantu sebagian; masih memfilter banyak baris
**Solusi:** Buat composite index

```sql
CREATE INDEX idx_status_date ON users(status, created_date);
```

**Sesudah:**

```
Index Scan using idx_status_date on users  (cost=0.42..5000.00 rows=10000 width=64)
  Index Cond: ((status = 'active') AND (created_date > '2024-01-01'))
```

Tidak ada lagi baris Filter—kedua kondisi ditangani oleh index. Cost berkurang ~80%.

---

### 7. **"rows examined" vs "rows returned" tinggi**

```
rows=1000000 filtered=1.00%  -- memeriksa 1M untuk mengembalikan 10K!
```

**Masalah:** Selektivitas buruk, membaca terlalu banyak data
**Solusi:** Susun ulang kolom index (yang paling selektif di depan)

**Sesudah:**

```
Index Scan using idx_status_region_date on orders  (cost=0.42..8000.00 rows=10000 width=40)
  Index Cond: ((status = 'completed') AND (region = 'US') AND (created_date > '2020-01-01'))
```

Rows examined sekarang sesuai dengan rows returned. Cost berkurang 90%.

---

### 8. **Type: ALL**

```
type: ALL  -- paling buruk
```

**Masalah:** Full table scan
**Solusi:** Tambahkan index yang sesuai

---

## ✅ Yang Ingin Anda Lihat

### Operasi yang baik:

* **`type: ref`** atau **`type: eq_ref`** - Menggunakan index untuk lookup
* **`type: range`** - Menggunakan index untuk range scan
* **`Using index`** - Covering index (tidak menyentuh data tabel)
* **`Using index condition`** - Index digunakan untuk filtering
* **Cost rendah** - Angka lebih rendah lebih baik
* **Rows examined ≈ Rows returned** - Tidak membuang-buang pembacaan

### Contoh eksekusi yang baik:

```
Index Scan using idx_user_created on orders
  Index Cond: (user_id = 123 AND created_at > '2024-01-01')
  Rows: 50 (actual rows: 48)
  Using index  -- covering index, sangat cepat!
```

---

## Pohon Keputusan Cepat

```
Full table scan? → Tambahkan index pada kolom WHERE
Filesort? → Tambahkan index dengan kolom ORDER BY (arah yang sesuai)
Using temporary? → Index kolom GROUP BY
Rows examined tinggi? → Composite index dengan urutan kolom yang lebih baik
Nested loop lambat? → Index kolom JOIN
Filter setelah index? → Perluas composite index
```

**Tips:** Fokus pada query dengan `actual time` dan `rows` tinggi terlebih dahulu - ini memberikan peningkatan performa terbesar!
