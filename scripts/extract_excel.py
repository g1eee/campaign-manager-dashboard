#!/usr/bin/env python3
"""
Ekstrak data dari WORKFLOW STRATEGI PROMOSI KALOVA.xlsx menjadi file JSON
yang dipakai sebagai seed data untuk web app dashboard.
"""
import json
import math
import os
import re
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
XLSX = os.path.join(ROOT, "WORKFLOW STRATEGI PROMOSI KALOVA.xlsx")
OUT_DIR = os.path.join(ROOT, "data")
os.makedirs(OUT_DIR, exist_ok=True)


def clean(v):
    """Normalisasi nilai sel: NaN -> None, angka bulat float -> int."""
    if v is None:
        return None
    if isinstance(v, float):
        if math.isnan(v):
            return None
        if v.is_integer():
            return int(v)
        return round(v, 4)
    if isinstance(v, str):
        s = v.strip()
        return s if s else None
    return v


def slugify(s):
    s = str(s).strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def extract_products():
    """Sheet PRODUK -> list produk dengan kolom finansial."""
    raw = pd.read_excel(XLSX, sheet_name="PRODUK", header=None)
    # Baris 0 berisi header utama; data mulai baris 2 (baris 1 berisi rate fee).
    header = [clean(x) for x in raw.iloc[0].tolist()]
    products = []
    for i in range(2, len(raw)):
        row = raw.iloc[i].tolist()
        no = clean(row[0])
        nama = clean(row[1])
        if nama is None:
            continue
        products.append({
            "no": no,
            "nama": nama,
            "kategori": clean(row[2]),
            "hpp": clean(row[3]),
            "hargaJual": clean(row[4]),
            "adminFee": clean(row[5]),
            "shippingFee": clean(row[6]),
            "margin": clean(row[14]) if len(row) > 14 else None,
            "npm": clean(row[17]) if len(row) > 17 else None,
        })
    return {"columns": header, "items": products}


def extract_workflow_steps():
    """Sheet6 -> 13+ langkah workflow dashboard, dipetakan ke role + tipe input."""
    raw = pd.read_excel(XLSX, sheet_name="Sheet6", header=None)
    lines = [clean(x) for x in raw.iloc[:, 0].tolist() if clean(x)]
    # Buang judul "workflow dashboard otomatis"
    steps = []
    for line in lines:
        m = re.match(r"^(\d+)\.\s*(.*)$", line)
        if not m:
            continue
        num = int(m.group(1))
        text = m.group(2).strip()

        # Tentukan role berdasarkan kata kunci
        low = text.lower()
        if low.startswith("role spv"):
            role = "spv"
        elif low.startswith("role admin"):
            role = "admin"
        elif low.startswith("role desainer"):
            role = "desainer"
        elif low.startswith("role marketing"):
            role = "marketing"
        else:
            role = "spv"

        # Tentukan tipe interaksi
        if "(teks)" in low:
            input_type = "text"
        elif "slider" in low or "dropdown" in low:
            input_type = "dropdown"
        elif "check list" in low or "checklist" in low or "check list box" in low:
            input_type = "checklist"
        elif "spreadsheet" in low:
            input_type = "external"
        else:
            input_type = "checklist"

        steps.append({
            "step": num,
            "role": role,
            "inputType": input_type,
            "text": text,
        })
    return steps


def extract_campaign_entries():
    """Sheet TWINDATE/RABU XTRA/PAY DAY/SFD -> entri produk-promo per campaign."""
    sheet_map = {
        "TWINDATE": "twindate",
        "RABU XTRA": "rabu-xtra",
        "PAY DAY": "payday",
        "SFD": "sfd",
    }
    entries = []
    campaigns_meta = {}
    for sheet, cid in sheet_map.items():
        raw = pd.read_excel(XLSX, sheet_name=sheet, header=None)
        title = clean(raw.iloc[0, 0])
        rule = clean(raw.iloc[0, 1])
        campaigns_meta[cid] = {"id": cid, "title": title, "rule": rule, "sheet": sheet}
        # Header tabel ada di baris index 2, data mulai index 3
        for i in range(3, len(raw)):
            row = raw.iloc[i].tolist()
            id_produk = clean(row[3])
            nama = clean(row[4])
            if id_produk is None and nama is None:
                continue
            entries.append({
                "id": f"{cid}-{i}",
                "campaign": cid,
                "campaignLabel": clean(row[2]),
                "bulan": clean(row[1]),
                "idProduk": str(id_produk) if id_produk is not None else None,
                "namaProduk": nama,
                "skemaPromo": clean(row[5]),
                "promo": clean(row[6]),
                "klasifikasi": clean(row[7]),
                "checklist": {},
            })
    return campaigns_meta, entries


def extract_timeline():
    raw = pd.read_excel(XLSX, sheet_name="TIMELINE PROMOSI", header=None)
    out = []
    for i in range(3, len(raw)):
        periode = clean(raw.iloc[i, 1])
        kegiatan = clean(raw.iloc[i, 2])
        if periode is None and kegiatan is None:
            continue
        out.append({"periode": periode, "campaign": kegiatan})
    return out


def extract_workflow_matrix():
    """Sheet WORKFLOW -> matriks banner/prepare/timeline push per campaign."""
    raw = pd.read_excel(XLSX, sheet_name="WORKFLOW", header=None)
    rows = []
    current = None
    for i in range(3, len(raw)):
        row = raw.iloc[i].tolist()
        camp = clean(row[1])
        banner = clean(row[2])
        prepare = clean(row[3])
        ket = clean(row[4])
        push = clean(row[5])
        if camp:
            current = camp
        if banner is None and prepare is None:
            continue
        rows.append({
            "campaign": current,
            "banner": banner,
            "prepare": prepare,
            "keterangan": ket,
            "timelinePush": push,
        })
    return rows


def derive_options(entries):
    """Kumpulkan opsi unik untuk dropdown form."""
    def uniq(key):
        seen = []
        for e in entries:
            v = e.get(key)
            if v and v not in seen:
                seen.append(v)
        return seen
    return {
        "campaign": [
            {"value": "twindate", "label": "TWINDATE"},
            {"value": "rabu-xtra", "label": "RABU XTRA"},
            {"value": "payday", "label": "PAY DAY"},
            {"value": "sfd", "label": "SHOPEE FASHION DAY"},
        ],
        "skemaPromo": uniq("skemaPromo"),
        "jenisPromo": uniq("promo"),
        "klasifikasi": ["FAST MOVING", "MODERATE", "SLOW MOVING"],
    }


def main():
    products = extract_products()
    steps = extract_workflow_steps()
    campaigns_meta, entries = extract_campaign_entries()
    timeline = extract_timeline()
    matrix = extract_workflow_matrix()
    options = derive_options(entries)

    files = {
        "products.json": products,
        "workflow-steps.json": steps,
        "campaigns.json": list(campaigns_meta.values()),
        "entries.json": entries,
        "timeline.json": timeline,
        "workflow-matrix.json": matrix,
        "options.json": options,
    }
    for name, data in files.items():
        path = os.path.join(OUT_DIR, name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        count = len(data) if isinstance(data, list) else len(data.get("items", data))
        print(f"  {name:24s} -> {count} records")

    print("\nOpsi dropdown:")
    print("  campaign     :", [c["label"] for c in options["campaign"]])
    print("  skemaPromo   :", options["skemaPromo"])
    print("  jenisPromo   :", options["jenisPromo"])
    print("  klasifikasi  :", options["klasifikasi"])
    print(f"\nTotal produk : {len(products['items'])}")
    print(f"Total steps  : {len(steps)}")
    print(f"Total entries: {len(entries)}")


if __name__ == "__main__":
    main()
