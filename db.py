"""Správa SQLite databáze."""
import sqlite3
from pathlib import Path

DB_PATH = Path("finance.db")
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Inicializuje databázi – vytvoří tabulky a výchozí oblasti."""
    with get_connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        _seed_default_areas(conn)
    print(f"Databáze inicializována: {DB_PATH.resolve()}")


def _seed_default_areas(conn: sqlite3.Connection):
    default_areas = [
        ("Plat / mzda",    "income",  "Pravidelný příjem ze zaměstnání",   ["plat", "mzda", "výplata", "salary"]),
        ("Ostatní příjmy", "income",  "Příjmy z pronájmu, dividend, atd.", ["pronájem", "dividenda", "úrok", "refundace"]),
        ("Bydlení",        "expense", "Nájem, energie, internet",          ["nájem", "energie", "elektřina", "plyn", "internet", "voda"]),
        ("Jídlo",          "expense", "Potraviny a restaurace",            ["potraviny", "supermarket", "albert", "lidl", "kaufland", "restaurant", "restaurace", "jídlo"]),
        ("Doprava",        "expense", "MHD, auto, palivo",                 ["doprava", "benzín", "palivo", "bus", "metro", "vlak", "parkování", "uber"]),
        ("Zdraví",         "expense", "Léky, lékař, pojištění",            ["lékárna", "doktor", "pojištění", "zdraví", "nemocnice"]),
        ("Zábava",         "expense", "Kultura, sport, volný čas",         ["kino", "divadlo", "sport", "netflix", "spotify", "hobby"]),
        ("Oblečení",       "expense", "Oděvy a obuv",                      ["zara", "h&m", "obuv", "oblečení", "šatstvo"]),
        ("Ostatní výdaje", "expense", "Různé výdaje",                      []),
    ]
    for name, atype, desc, keywords in default_areas:
        cur = conn.execute(
            "INSERT OR IGNORE INTO areas (name, type, description) VALUES (?, ?, ?)",
            (name, atype, desc)
        )
        if cur.lastrowid:
            area_id = cur.lastrowid
            conn.executemany(
                "INSERT INTO area_keywords (area_id, keyword) VALUES (?, ?)",
                [(area_id, kw) for kw in keywords]
            )
