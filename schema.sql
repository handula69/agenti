-- Oblasti (kategorie) příjmů a výdajů
CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Klíčová slova pro automatické přiřazení oblasti
CREATE TABLE IF NOT EXISTS area_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL
);

-- Log importovaných souborů (ochrana před duplikací)
CREATE TABLE IF NOT EXISTS imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    file_hash TEXT NOT NULL UNIQUE,
    row_count INTEGER,
    imported_at TEXT DEFAULT (datetime('now'))
);

-- Transakce (příjmy i výdaje)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,               -- ISO 8601: YYYY-MM-DD
    amount REAL NOT NULL,             -- kladné = příjem, záporné = výdaj
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    area_id INTEGER REFERENCES areas(id),
    description TEXT,
    counterparty TEXT,                -- protistrana (obchod, plátce...)
    currency TEXT DEFAULT 'CZK',
    import_id INTEGER REFERENCES imports(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexy pro rychlé dotazy
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_area ON transactions(area_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Pohled: cashflow po měsících a oblastech
CREATE VIEW IF NOT EXISTS v_cashflow_monthly AS
SELECT
    strftime('%Y-%m', date) AS month,
    a.name AS area,
    a.type AS area_type,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END) AS total_expense,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -ABS(t.amount) END) AS net_cashflow,
    COUNT(*) AS transaction_count
FROM transactions t
LEFT JOIN areas a ON t.area_id = a.id
GROUP BY month, t.area_id;

-- Pohled: celkový cashflow po měsících
CREATE VIEW IF NOT EXISTS v_cashflow_summary AS
SELECT
    strftime('%Y-%m', date) AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) AS total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END) AS net_cashflow
FROM transactions
GROUP BY month
ORDER BY month;
