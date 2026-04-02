"""Export sample portfolio bundle to web/public/data/bundle.json for the Next.js dashboard."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from utils.risk_logic import calculate_health_score  # noqa: E402
from utils.sample_data_generator import generate_sample_data  # noqa: E402


def main() -> None:
    bundle = generate_sample_data(35)
    bundle["projects"] = calculate_health_score(bundle["projects"])
    out: dict = {}
    for name, df in bundle.items():
        out[name] = json.loads(df.to_json(orient="records", date_format="iso"))
    dest = ROOT / "web" / "data" / "bundle.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"Wrote {dest}")


if __name__ == "__main__":
    main()
