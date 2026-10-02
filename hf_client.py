#!/usr/bin/env python3
"""Minimal Higgsfield API client for the LINSILK pipeline.

Free commands:   python hf_client.py upload FILE ...      python hf_client.py estimate [model]
Paid command:    python hf_client.py generate --prompt-file P --refs A B C --out OUT.png [--model M ...]
Paid calls are refused unless HF_ALLOW_PAID=1 is set in the environment.
Credentials: HIGGSFIELD_API_KEY (KEY_ID:KEY_SECRET) from the environment or .env. Never printed.
"""
import argparse, json, mimetypes, os, random, sys, time, uuid
from pathlib import Path
import requests

ROOT = Path(__file__).parent
API = "https://api.higgsfield.ai"
UPLOAD_HOSTS = ["https://api.higgsfield.ai", "https://platform.higgsfield.ai"]
DEFAULT_MODEL = "marketing-studio/image"
LOG = ROOT / "jobs.jsonl"
TERMINAL = {"completed", "failed", "nsfw", "canceled"}


def key():
    k = os.environ.get("HIGGSFIELD_API_KEY")
    env = ROOT / ".env"
    if not k and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("HIGGSFIELD_API_KEY="):
                k = line.split("=", 1)[1].strip()
    if not k or ":" not in k:
        sys.exit("HIGGSFIELD_API_KEY missing or not KEY_ID:KEY_SECRET")
    return k


def auth():
    return {"Authorization": f"Key {key()}"}


def log(rec):
    with LOG.open("a") as f:
        f.write(json.dumps(rec) + "\n")


def upload(path):
    """Upload a local image, return public_url. Upload URLs expire after 1h: call just before use."""
    ctype = mimetypes.guess_type(str(path))[0] or "image/jpeg"
    err = None
    for host in UPLOAD_HOSTS:
        r = requests.post(f"{host}/files/generate-upload-url", headers=auth(), json={"content_type": ctype}, timeout=30)
        if not r.ok:
            err = f"{host}: {r.status_code}"
            continue
        j = r.json()
        # presigned storage URL: send ONLY the returned headers, never API credentials
        put = requests.put(j["upload_url"], data=Path(path).read_bytes(), headers=j["upload_headers"], timeout=120)
        put.raise_for_status()
        return j["public_url"]
    sys.exit(f"upload URL request failed ({err})")


def estimate(model, body):
    r = requests.post(f"{API}/estimate/{model}", headers=auth(), json=body, timeout=30)
    return r.status_code, (r.json() if r.headers.get("content-type", "").startswith("application/json") else r.text)


def generate(model, body, out, tag=""):
    """Submit, poll, download. PAID."""
    if os.environ.get("HF_ALLOW_PAID") != "1":
        sys.exit("Refusing paid call: set HF_ALLOW_PAID=1 (only after the user has approved).")
    idem = str(uuid.uuid4())
    r = requests.post(f"{API}/{model}", headers={**auth(), "Idempotency-Key": idem}, json=body, timeout=60)
    if not r.ok:
        log({"tag": tag, "model": model, "http": r.status_code, "detail": r.text[:300]})
        sys.exit(f"submit failed {r.status_code}: {r.text[:300]}")
    h = r.json()
    rid = h["request_id"]
    log({"tag": tag, "model": model, "request_id": rid, "idem": idem, "out": str(out), "t": time.time()})
    delay = 2.0
    while True:
        s = requests.get(h["status_url"], headers=auth(), timeout=30)
        if s.status_code >= 500:
            time.sleep(delay)
            continue
        s.raise_for_status()
        res = s.json()
        if res["status"] in TERMINAL:
            break
        time.sleep(delay + random.uniform(0, 0.5))
        delay = min(delay * 1.5, 10.0)
    log({"request_id": rid, "status": res["status"]})
    if res["status"] != "completed":
        sys.exit(f"{rid}: {res['status']} {res.get('error', '')}")
    img = requests.get(res["images"][0]["url"], timeout=120)
    img.raise_for_status()
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_bytes(img.content)
    return rid


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    u = sub.add_parser("upload"); u.add_argument("files", nargs="+")
    e = sub.add_parser("estimate"); e.add_argument("--model", default=DEFAULT_MODEL)
    e.add_argument("--quality", default="high"); e.add_argument("--aspect", default="3:4")
    e.add_argument("--resolution", default="2k")
    g = sub.add_parser("generate")
    g.add_argument("--model", default=DEFAULT_MODEL); g.add_argument("--prompt-file", required=True)
    g.add_argument("--refs", nargs="*", default=[]); g.add_argument("--out", required=True)
    g.add_argument("--quality", default="high"); g.add_argument("--aspect", default="3:4")
    g.add_argument("--resolution", default="2k"); g.add_argument("--tag", default="")
    g.add_argument("--moderation", choices=["auto", "low"], help="Marketing Studio only")
    a = ap.parse_args()

    if a.cmd == "upload":
        for f in a.files:
            print(f, "->", upload(f))
    elif a.cmd == "estimate":
        body = {"prompt": "estimate", "quality": a.quality, "resolution": a.resolution, "aspect_ratio": a.aspect}
        if a.model == DEFAULT_MODEL:
            body["enhance_prompt"] = False
        print(estimate(a.model, body))
    else:
        body = {"prompt": Path(a.prompt_file).read_text().strip(), "quality": a.quality,
                "resolution": a.resolution, "aspect_ratio": a.aspect}
        if a.model == DEFAULT_MODEL:
            body["enhance_prompt"] = False
        if a.moderation and a.model == DEFAULT_MODEL:
            body["moderation"] = a.moderation
        if a.refs:
            body["image_urls"] = [upload(p) for p in a.refs]
        print("done:", generate(a.model, body, a.out, a.tag))


if __name__ == "__main__":
    main()
