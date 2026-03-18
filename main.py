#!/usr/bin/env python3
"""
Aplikace pro sledování příjmů a výdajů s cashflow analýzou.

Použití:
  python main.py init                          # inicializace DB
  python main.py import <soubor.csv>           # import souboru
  python main.py import <soubor.xlsx> --auto   # import bez interaktivního mapování
  python main.py cashflow                      # souhrn cashflow
  python main.py cashflow --year 2025          # cashflow za rok
  python main.py cashflow --year 2025 --month 3
  python main.py areas                         # přehled oblastí
  python main.py area-cashflow                 # cashflow podle oblastí
  python main.py transactions                  # výpis transakcí
  python main.py transactions --area jídlo
  python main.py trend                         # trend posledních 12 měsíců
  python main.py add-area <název> <typ>        # přidat oblast (typ: income/expense/both)
"""

import argparse
import sys

import db
import importer
import reports


def cmd_init(_args):
    db.init_db()


def cmd_import(args):
    interactive = not args.auto
    importer.import_file(args.file, interactive=interactive)


def cmd_cashflow(args):
    reports.cashflow_summary(year=args.year, month=args.month)


def cmd_area_cashflow(args):
    reports.cashflow_by_area(year=args.year, month=args.month)


def cmd_areas(_args):
    reports.list_areas()


def cmd_transactions(args):
    reports.list_transactions(
        area_name=args.area,
        year=args.year,
        month=args.month,
        tx_type=args.type,
        limit=args.limit,
    )


def cmd_trend(args):
    reports.cashflow_trend(months=args.months)


def cmd_add_area(args):
    conn = db.get_connection()
    conn.execute(
        "INSERT OR IGNORE INTO areas (name, type, description) VALUES (?, ?, ?)",
        (args.name, args.type, args.description or "")
    )
    conn.commit()
    print(f"Oblast '{args.name}' ({args.type}) přidána.")


# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Sledování příjmů a výdajů s cashflow analýzou",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    sub.add_parser("init", help="Inicializovat databázi")

    # import
    p_import = sub.add_parser("import", help="Importovat CSV nebo XLSX soubor")
    p_import.add_argument("file", help="Cesta k souboru")
    p_import.add_argument("--auto", action="store_true", help="Automatické mapování bez interakce")

    # cashflow
    p_cf = sub.add_parser("cashflow", help="Souhrn cashflow po měsících")
    p_cf.add_argument("--year",  type=int, help="Filtr: rok")
    p_cf.add_argument("--month", type=int, help="Filtr: měsíc (1-12)")

    # area-cashflow
    p_acf = sub.add_parser("area-cashflow", help="Cashflow podle oblastí")
    p_acf.add_argument("--year",  type=int, help="Filtr: rok")
    p_acf.add_argument("--month", type=int, help="Filtr: měsíc (1-12)")

    # areas
    sub.add_parser("areas", help="Přehled definovaných oblastí")

    # transactions
    p_tx = sub.add_parser("transactions", help="Výpis transakcí")
    p_tx.add_argument("--area",  help="Filtr: název oblasti (částečná shoda)")
    p_tx.add_argument("--year",  type=int, help="Filtr: rok")
    p_tx.add_argument("--month", type=int, help="Filtr: měsíc (1-12)")
    p_tx.add_argument("--type",  choices=["income", "expense"], help="Filtr: typ")
    p_tx.add_argument("--limit", type=int, default=50, help="Max počet řádků (výchozí: 50)")

    # trend
    p_trend = sub.add_parser("trend", help="Trend cashflow")
    p_trend.add_argument("--months", type=int, default=12, help="Počet měsíců (výchozí: 12)")

    # add-area
    p_area = sub.add_parser("add-area", help="Přidat novou oblast")
    p_area.add_argument("name", help="Název oblasti")
    p_area.add_argument("type", choices=["income", "expense", "both"], help="Typ oblasti")
    p_area.add_argument("--description", help="Popis oblasti")

    args = parser.parse_args()

    commands = {
        "init":          cmd_init,
        "import":        cmd_import,
        "cashflow":      cmd_cashflow,
        "area-cashflow": cmd_area_cashflow,
        "areas":         cmd_areas,
        "transactions":  cmd_transactions,
        "trend":         cmd_trend,
        "add-area":      cmd_add_area,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
