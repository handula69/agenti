# Sledování příjmů a výdajů s cashflow analýzou

Python + SQLite aplikace pro import a analýzu finančních dat z CSV/XLSX souborů.

## Instalace

```bash
pip install -r requirements.txt
```

## Použití

### 1. Inicializace databáze

```bash
python main.py init
```

Vytvoří `finance.db` s výchozími oblastmi (Jídlo, Bydlení, Doprava, Plat, ...).

### 2. Import souboru

```bash
# Interaktivní – aplikace se zeptá na mapování sloupců
python main.py import vybery_leden.csv

# Automatické mapování (podle názvů sloupců)
python main.py import vybery_leden.xlsx --auto
```

**Podporované formáty sloupců:**

| Interní pole   | Alternativní názvy sloupců                          |
|----------------|------------------------------------------------------|
| `date`         | datum, date, dat, den                                |
| `amount`       | částka, amount, suma, hodnota, credit, debit         |
| `description`  | popis, description, poznámka, zpráva                 |
| `counterparty` | protistrana, příjemce, plátce, merchant              |
| `type`         | typ, type, druh                                      |
| `currency`     | měna, currency                                       |

### 3. Reporty

```bash
# Cashflow po měsících
python main.py cashflow
python main.py cashflow --year 2025
python main.py cashflow --year 2025 --month 3

# Cashflow podle oblastí
python main.py area-cashflow
python main.py area-cashflow --year 2025

# Přehled oblastí
python main.py areas

# Výpis transakcí
python main.py transactions
python main.py transactions --area jídlo --year 2025
python main.py transactions --type expense --limit 100

# Trend cashflow (posledních 12 měsíců)
python main.py trend
python main.py trend --months 6
```

### 4. Správa oblastí

```bash
# Přidat vlastní oblast
python main.py add-area "Investice" income --description "ETF, akcie, dluhopisy"
python main.py add-area "Dovolená" expense --description "Cestování a ubytování"
```

## Struktura databáze

| Tabulka           | Popis                                          |
|-------------------|------------------------------------------------|
| `areas`           | Definované oblasti (Jídlo, Bydlení, ...)       |
| `area_keywords`   | Klíčová slova pro automatické přiřazení oblasti|
| `transactions`    | Jednotlivé příjmy a výdaje                     |
| `imports`         | Log importovaných souborů (ochrana před duplik.)|

### Pohledy (views)

- `v_cashflow_monthly` – cashflow po měsících a oblastech
- `v_cashflow_summary` – celkový cashflow po měsících

## Výchozí oblasti

| Oblast            | Typ     |
|-------------------|---------|
| Plat / mzda       | income  |
| Ostatní příjmy    | income  |
| Bydlení           | expense |
| Jídlo             | expense |
| Doprava           | expense |
| Zdraví            | expense |
| Zábava            | expense |
| Oblečení          | expense |
| Ostatní výdaje    | expense |
