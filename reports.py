"""Reporty a analýza cashflow."""
from typing import Optional
import db


def _divider(width: int = 70):
    print("─" * width)


def _header(title: str, width: int = 70):
    _divider(width)
    print(f"  {title}")
    _divider(width)


# ---------------------------------------------------------------------------
# Cashflow souhrn
# ---------------------------------------------------------------------------

def cashflow_summary(year: Optional[int] = None, month: Optional[int] = None):
    """Souhrnný cashflow – celkové příjmy, výdaje a saldo."""
    conn = db.get_connection()

    where = []
    params = []
    if year:
        where.append("strftime('%Y', date) = ?")
        params.append(str(year))
    if month:
        where.append("strftime('%m', date) = ?")
        params.append(f"{month:02d}")

    clause = ("WHERE " + " AND ".join(where)) if where else ""

    rows = conn.execute(f"""
        SELECT
            strftime('%Y-%m', date) AS month,
            SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
            SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net
        FROM transactions
        {clause}
        GROUP BY month
        ORDER BY month
    """, params).fetchall()

    if not rows:
        print("Žádná data.")
        return

    _header("CASHFLOW PO MĚSÍCÍCH")
    print(f"  {'Měsíc':<12} {'Příjmy':>14} {'Výdaje':>14} {'Saldo':>14}")
    _divider()

    total_income = total_expense = total_net = 0.0
    for r in rows:
        net_str = f"{r['net']:+,.2f}"
        print(f"  {r['month']:<12} {r['income']:>13,.2f} {r['expense']:>13,.2f} {net_str:>14}")
        total_income  += r["income"]
        total_expense += r["expense"]
        total_net     += r["net"]

    _divider()
    print(f"  {'CELKEM':<12} {total_income:>13,.2f} {total_expense:>13,.2f} {total_net:>+14,.2f}")
    _divider()


# ---------------------------------------------------------------------------
# Cashflow po oblastech
# ---------------------------------------------------------------------------

def cashflow_by_area(year: Optional[int] = None, month: Optional[int] = None):
    """Cashflow rozdělený podle oblastí."""
    conn = db.get_connection()

    where = ["1=1"]
    params = []
    if year:
        where.append("strftime('%Y', t.date) = ?")
        params.append(str(year))
    if month:
        where.append("strftime('%m', t.date) = ?")
        params.append(f"{month:02d}")

    clause = " AND ".join(where)

    rows = conn.execute(f"""
        SELECT
            COALESCE(a.name, '(bez oblasti)') AS area,
            a.type AS area_type,
            SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END) AS income,
            SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expense,
            SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE -t.amount END) AS net,
            COUNT(*) AS count
        FROM transactions t
        LEFT JOIN areas a ON t.area_id = a.id
        WHERE {clause}
        GROUP BY t.area_id
        ORDER BY expense DESC, income DESC
    """, params).fetchall()

    if not rows:
        print("Žádná data.")
        return

    period = ""
    if year and month:
        period = f" [{year}-{month:02d}]"
    elif year:
        period = f" [{year}]"

    _header(f"CASHFLOW PODLE OBLASTÍ{period}")
    print(f"  {'Oblast':<25} {'Příjmy':>12} {'Výdaje':>12} {'Saldo':>12} {'Počet':>6}")
    _divider()

    for r in rows:
        net_str = f"{r['net']:+,.2f}"
        print(f"  {r['area']:<25} {r['income']:>11,.2f} {r['expense']:>11,.2f} {net_str:>12} {r['count']:>6}")

    _divider()


# ---------------------------------------------------------------------------
# Výpis transakcí
# ---------------------------------------------------------------------------

def list_transactions(
    area_name: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    tx_type: Optional[str] = None,
    limit: int = 50,
):
    conn = db.get_connection()

    where = ["1=1"]
    params = []

    if area_name:
        where.append("LOWER(a.name) LIKE ?")
        params.append(f"%{area_name.lower()}%")
    if year:
        where.append("strftime('%Y', t.date) = ?")
        params.append(str(year))
    if month:
        where.append("strftime('%m', t.date) = ?")
        params.append(f"{month:02d}")
    if tx_type:
        where.append("t.type = ?")
        params.append(tx_type)

    clause = " AND ".join(where)

    rows = conn.execute(f"""
        SELECT t.date, t.type, t.amount, t.currency,
               COALESCE(a.name, '(bez oblasti)') AS area,
               t.description, t.counterparty
        FROM transactions t
        LEFT JOIN areas a ON t.area_id = a.id
        WHERE {clause}
        ORDER BY t.date DESC
        LIMIT ?
    """, params + [limit]).fetchall()

    if not rows:
        print("Žádné transakce.")
        return

    _header(f"TRANSAKCE (posledních {limit})")
    print(f"  {'Datum':<12} {'Typ':<8} {'Částka':>12} {'Oblast':<22} Popis")
    _divider()

    for r in rows:
        sign = "+" if r["type"] == "income" else "-"
        amount_str = f"{sign}{r['amount']:,.2f} {r['currency']}"
        desc = (r["description"] or r["counterparty"] or "")[:35]
        print(f"  {r['date']:<12} {r['type']:<8} {amount_str:>16} {r['area']:<22} {desc}")

    _divider()


# ---------------------------------------------------------------------------
# Přehled oblastí
# ---------------------------------------------------------------------------

def list_areas():
    conn = db.get_connection()
    rows = conn.execute("""
        SELECT a.id, a.name, a.type, a.description,
               COUNT(t.id) AS tx_count
        FROM areas a
        LEFT JOIN transactions t ON t.area_id = a.id
        GROUP BY a.id
        ORDER BY a.type, a.name
    """).fetchall()

    _header("DEFINOVANÉ OBLASTI")
    print(f"  {'ID':<5} {'Název':<28} {'Typ':<10} {'Transakcí':>10}  Popis")
    _divider()
    for r in rows:
        print(f"  {r['id']:<5} {r['name']:<28} {r['type']:<10} {r['tx_count']:>10}  {r['description'] or ''}")
    _divider()


# ---------------------------------------------------------------------------
# Trend cashflow (sparkline)
# ---------------------------------------------------------------------------

def cashflow_trend(months: int = 12):
    """Zobrazí trend cashflow za posledních N měsíců."""
    conn = db.get_connection()
    rows = conn.execute(f"""
        SELECT
            strftime('%Y-%m', date) AS month,
            SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net
        FROM transactions
        GROUP BY month
        ORDER BY month DESC
        LIMIT ?
    """, (months,)).fetchall()

    if not rows:
        print("Žádná data pro trend.")
        return

    rows = list(reversed(rows))
    nets = [r["net"] for r in rows]
    max_abs = max(abs(n) for n in nets) or 1

    _header(f"TREND CASHFLOW (posledních {len(rows)} měsíců)")
    bar_width = 40
    for r, net in zip(rows, nets):
        bar_len = int(abs(net) / max_abs * bar_width)
        bar = ("+" if net >= 0 else "-") * bar_len
        color_bar = f"[{'OK' if net >= 0 else '!!'}] {bar}"
        print(f"  {r['month']}  {net:>+12,.2f}  {color_bar}")
    _divider()
