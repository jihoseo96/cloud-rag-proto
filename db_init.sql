CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS document (
  id UUID PRIMARY KEY,
  workspace TEXT NOT NULL,
  s3_key_raw TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chunk (
  id BIGSERIAL PRIMARY KEY,
  document_id UUID REFERENCES document(id) ON DELETE CASCADE,
  page INT,
  text TEXT NOT NULL,
  embedding VECTOR(1536)
);

CREATE INDEX IF NOT EXISTS idx_chunk_text_trgm ON chunk USING gin (text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_chunk_embedding_ivfflat
ON chunk USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
