# Supabase (PostgreSQL) Data Import Pipeline

> Transform cleaned course data into Supabase `course_embeddings` table

## Setup

### 1. Install Dependencies

```bash
pip install psycopg2-binary
# or
pip install psycopg2
```

Update your project's `requirements.txt`:
```bash
psycopg2-binary==2.9.9
```

### 2. Configure Database Connection

Create or update `.env` in the `data/` directory:

```env
# Supabase PostgreSQL Connection String
DB_CONNECTION_STRING=postgresql://postgres.{project-id}:{password}@{host}:{port}/{database}

# Example (from Supabase):
# DB_CONNECTION_STRING=postgresql://postgres.zvogipaimcihsarohvof:1942004@Tieanh19@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

**Where to find this:**
1. Supabase Dashboard → Project → Database → Connection Pooler
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your actual password

### 3. Verify Table Exists

Run this in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.course_embeddings (
  id character varying not null,
  name text not null,
  description text not null,
  tags text[] not null,
  created_at timestamp without time zone null default now(),
  link text null,
  content text null,
  metadata jsonb null,
  constraint course_embeddings_pkey primary key (id)
) TABLESPACE pg_default;

-- Optional: Create index on created_at for faster queries
CREATE INDEX idx_course_embeddings_created_at ON public.course_embeddings(created_at DESC);
```

## Usage

### Step 1: Normalize Data

```bash
python scripts/supabase/normalize_courses_for_supabase.py
```

**Output:** `data/normalized/courses_for_supabase.csv`

**What it does:**
- Maps `title` → `name`
- Maps `short_description` → `description`
- Converts tags (comma-separated string) → JSON array
- Creates metadata object (category, rating, instructors, prices)
- Generates UUIDs for `id`

### Step 2: Import to Supabase

```bash
python scripts/supabase/import_to_supabase.py
```

**What it does:**
- Reads normalized CSV
- Connects to Supabase via psycopg2
- Bulk inserts rows into `course_embeddings`
- Uses ON CONFLICT to handle duplicates

## Data Mapping

| Column | Source | Transformation |
|--------|--------|-----------------|
| id | Generate | UUID |
| name | title | As-is |
| description | short_description | As-is |
| tags | tags | Split by comma → JSON array |
| created_at | - | Defaults to `now()` on insert |
| link | thumbnail_url | Nullable |
| content | - | NULL (user fills later) |
| metadata | Multiple | JSON object: `{category, rating, instructors, final_price, original_price}` |

## Example Output (CSV)

```csv
id,name,description,tags,link,content,metadata
550e8400-e29b-41d4-a716-446655440000,Chuyên ngành Học máy,"Master Machine Learning...",["Decision Trees","Neural Networks","Gradient Descent"],https://picsum.photos/seed/course_0001/1280/720,,"{"category":"Data Science","rating":4.9,"instructors":"Andrew Ng","final_price":196000,"original_price":302000}"
```

## Troubleshooting

### Connection Error

```
psycopg2.OperationalError: could not connect to server
```

**Solution:**
- Verify `DB_CONNECTION_STRING` in `.env`
- Check Supabase project is active
- Ensure IP is whitelisted (Supabase allows all by default)

### Table Not Found

```
psycopg2.errors.UndefinedTable: relation "public.course_embeddings" does not exist
```

**Solution:**
- Run the table creation SQL in Supabase editor first
- Verify table name and schema match exactly

### Type Conversion Error

```
psycopg2.errors.InvalidTextRepresentation: array value must start with "{" or dimension information
```

**Solution:**
- Ensure tags are properly formatted as JSON arrays in CSV
- Check metadata is valid JSON

## Monitoring

Check the import status in Supabase:

```sql
SELECT COUNT(*) as total_courses FROM public.course_embeddings;
SELECT * FROM public.course_embeddings LIMIT 5;
```

View recently imported:
```sql
SELECT id, name, created_at FROM public.course_embeddings 
ORDER BY created_at DESC LIMIT 10;
```

## Performance Notes

- **Batch Size:** Insert ~1000 rows per batch (configurable in script)
- **Indexing:** Create indexes on frequently queried columns (tags, category in metadata)
- **Connection Pool:** Supabase uses pgBouncer, ideal for serverless architectures

## Next Steps (User's Plan)

- [ ] Run normalize script
- [ ] Run import script to Supabase
- [ ] Add vector embeddings to `embedding` column (user will handle)
- [ ] Add logic to populate `check` boolean (user will handle)
