"""Import CSV a XLSX souborů do databáze."""
import hashlib
import csv
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

import db

# Pokus o import openpyxl (pro XLSX)
try:
    import openpyxl
    XLSX_AVAILABLE = True
except ImportError:
    XLSX_AVAILABLE = False


# ---------------------------------------------------------------------------
# Pomocné funkce
# ---------------------------------------------------------------------------

def _file_hash(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def _parse_date(value: str) -> Optional[str]:
    """Rozpozná různé formáty data a vrátí ISO 8601 (YYYY-MM-DD)."""
    value = str(value).strip()
    formats = [
        "%d.%m.%Y", "%d. %m. %Y",
        "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y",
        "%d-%m-%Y", "%Y%m%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def _parse_amount(value: str) -> Optional[float]:
    """Parsuje částku – odstraní mezery, symbol měny, normalizuje desetinný oddělovač."""
    value = re.sub(r"[^\d,.\-]", "", str(value).strip())
    value = value.replace(",", ".")
    # víc teček = tisícový oddělovač (1.234.56 → 1234.56)
    parts = value.split(".")
    if len(parts) > 2:
        value = "".join(parts[:-1]) + "." + parts[-1]
    try:
        return float(value)
    except ValueError:
        return None


def _detect_area(description: str, counterparty: str, conn) -> Optional[int]:
    """Vrátí area_id na základě klíčových slov v popisu nebo protistraně."""
    text = (description + " " + counterparty).lower()
    rows = conn.execute(
        "SELECT ak.area_id, ak.keyword FROM area_keywords ak"
    ).fetchall()
    for row in rows:
        if row["keyword"] and row["keyword"].lower() in text:
            return row["area_id"]
    return None


# ---------------------------------------------------------------------------
# Interaktivní mapování sloupců
# ---------------------------------------------------------------------------

KNOWN_COLUMN_ALIASES = {
    "date":         ["datum", "date", "dat", "den", "dátum"],
    "amount":       ["částka", "amount", "suma", "hodnota", "castka", "čiastka", "credit", "debit"],
    "description":  ["popis", "description", "poznámka", "poznamka", "zpráva", "zprava", "note"],
    "counterparty": ["protistrana", "counterparty", "příjemce", "plátce", "prijemce", "platce", "merchant"],
    "type":         ["typ", "type", "druh"],
    "currency":     ["měna", "mena", "currency"],
}


def _auto_map(headers: list[str]) -> dict:
    """Pokusí se automaticky namapovat sloupce CSV na interní pole."""
    mapping = {}
    for field, aliases in KNOWN_COLUMN_ALIASES.items():
        for i, h in enumerate(headers):
            if h.strip().lower() in aliases:
                mapping[field] = i
                break
    return mapping


def _prompt_mapping(headers: list[str]) -> dict:
    """Interaktivně se zeptá uživatele na mapování sloupců."""
    print("\nSloupce v souboru:")
    for i, h in enumerate(headers):
        print(f"  [{i}] {h}")

    auto = _auto_map(headers)
    print("\nAutomaticky rozpoznáno:", {k: headers[v] for k, v in auto.items()})

    mapping = dict(auto)
    required = ["date", "amount"]
    for field in required:
        if field not in mapping:
            val = input(f"  Index sloupce pro '{field}': ").strip()
            if val.isdigit():
                mapping[field] = int(val)

    for field in ["description", "counterparty", "type", "currency"]:
        if field not in mapping:
            val = input(f"  Index sloupce pro '{field}' (Enter = přeskočit): ").strip()
            if val.isdigit():
                mapping[field] = int(val)

    return mapping


# ---------------------------------------------------------------------------
# Načtení řádků ze souboru
# ---------------------------------------------------------------------------

def _read_csv(path: Path) -> tuple[list[str], list[list[str]]]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        # Detekce oddělovače
        sample = f.read(2048)
        f.seek(0)
        delimiter = ";" if sample.count(";") > sample.count(",") else ","
        reader = csv.reader(f, delimiter=delimiter)
        rows = list(reader)
    if not rows:
        return [], []
    return rows[0], rows[1:]


def _read_xlsx(path: Path) -> tuple[list[str], list[list]]:
    if not XLSX_AVAILABLE:
        raise ImportError("Knihovna openpyxl není nainstalována. Spusťte: pip install openpyxl")
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = [[cell.value for cell in row] for row in ws.iter_rows()]
    wb.close()
    if not rows:
        return [], []
    return [str(h) if h is not None else "" for h in rows[0]], rows[1:]


# ---------------------------------------------------------------------------
# Hlavní import funkce
# ---------------------------------------------------------------------------

def import_file(path: str, interactive: bool = True) -> int:
    """
    Importuje CSV nebo XLSX soubor do databáze.
    Vrátí počet importovaných transakcí.
    """
    fpath = Path(path)
    if not fpath.exists():
        raise FileNotFoundError(f"Soubor nenalezen: {path}")

    suffix = fpath.suffix.lower()
    if suffix == ".csv":
        headers, rows = _read_csv(fpath)
    elif suffix in (".xlsx", ".xls"):
        headers, rows = _read_xlsx(fpath)
    else:
        raise ValueError(f"Nepodporovaný formát: {suffix}")

    conn = db.get_connection()

    # Kontrola duplikátu
    file_hash = _file_hash(fpath)
    existing = conn.execute(
        "SELECT id, filename, imported_at FROM imports WHERE file_hash = ?",
        (file_hash,)
    ).fetchone()
    if existing:
        print(f"Soubor '{existing['filename']}' byl již importován {existing['imported_at']}. Přeskakuji.")
        return 0

    # Mapování sloupců
    if interactive:
        mapping = _prompt_mapping(headers)
    else:
        mapping = _auto_map(headers)

    if "date" not in mapping or "amount" not in mapping:
        raise ValueError("Nelze importovat: chybí mapování pro 'date' nebo 'amount'.")

    # Záznam importu
    import_cur = conn.execute(
        "INSERT INTO imports (filename, file_hash, row_count) VALUES (?, ?, ?)",
        (fpath.name, file_hash, len(rows))
    )
    import_id = import_cur.lastrowid

    # Výchozí oblasti pro příjmy/výdaje
    default_income_area = conn.execute(
        "SELECT id FROM areas WHERE name = 'Ostatní příjmy'"
    ).fetchone()
    default_expense_area = conn.execute(
        "SELECT id FROM areas WHERE name = 'Ostatní výdaje'"
    ).fetchone()
    default_income_id = default_income_area["id"] if default_income_area else None
    default_expense_id = default_expense_area["id"] if default_expense_area else None

    imported = 0
    skipped = 0

    for row in rows:
        try:
            raw_date = row[mapping["date"]] if mapping.get("date") is not None else ""
            raw_amount = row[mapping["amount"]] if mapping.get("amount") is not None else ""

            date = _parse_date(str(raw_date))
            amount = _parse_amount(str(raw_amount))

            if date is None or amount is None or amount == 0:
                skipped += 1
                continue

            description = str(row[mapping["description"]]) if "description" in mapping else ""
            counterparty = str(row[mapping["counterparty"]]) if "counterparty" in mapping else ""
            currency = str(row[mapping["currency"]]) if "currency" in mapping else "CZK"

            # Typ transakce
            if "type" in mapping:
                raw_type = str(row[mapping["type"]]).lower()
                if any(x in raw_type for x in ["příjem", "prijem", "income", "kredit", "credit", "+"]):
                    tx_type = "income"
                else:
                    tx_type = "expense"
            else:
                tx_type = "income" if amount > 0 else "expense"

            abs_amount = abs(amount)

            # Detekce oblasti
            area_id = _detect_area(description, counterparty, conn)
            if area_id is None:
                area_id = default_income_id if tx_type == "income" else default_expense_id

            conn.execute(
                """INSERT INTO transactions
                   (date, amount, type, area_id, description, counterparty, currency, import_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (date, abs_amount, tx_type, area_id, description, counterparty, currency, import_id)
            )
            imported += 1

        except (IndexError, TypeError):
            skipped += 1
            continue

    conn.commit()
    print(f"Import dokončen: {imported} transakcí importováno, {skipped} přeskočeno.")
    return imported
