"""Split a product name into a family name and a variant label by taking the size tokens out.

    "Pu Hose Fitting Elbow 6mm 1/2\\" M"  ->  ("Pu Hose Fitting Elbow", "6mm 1/2\\" M")
    "10mm Combination Spanner"            ->  ("Combination Spanner", "10mm")

Used for the supplier paths marked `sizes` in mapping.csv (SEO plan 3.2: one page per product family,
not per size). It only decides what is a size. Rows are grouped by the caller, and only when the
family names are identical, so a wrong guess here can at worst leave two rows ungrouped.
"""
import re

# A token is a size when it holds a digit and, once digits, separators and unit letters are removed,
# nothing is left: 6mm, 1/4", 3/8"m, 10mx25mm, 2.5x75, PH0X100mm, 0-16bar, M5, 14lb. Words with other letters
# (AT0025, SG-MP200, S62/T) are model codes and stay in the name. A bare number is never a size on its own.
_RESIDUE = re.compile(
    # Longer words come first: "pce" must be tried before "pcs?", or "1pce" leaves an "e" behind
    r"""\d+|[.,/xX*\-]|mm|cm|kg|lb|kpa|bar|psi|lt|ml|hp|rpm|pack|pce|pcs?|ph|pz|sl|"|″|”|’|'|m|g|l|w|v|f""",
    re.I,
)
_BARE_NUMBER = re.compile(r"[\d.,]+")
_MODEL_CODE = re.compile(r"[A-Za-z]{1,8}-?\d[\w.\-/]*")
_COUNT_WORDS = {"piece", "pieces", "pce", "pcs", "pack", "grit"}
_EDGE_WORDS = {"x", "-", "/", "&", "with", "w/", "per", "–"}


def _trim(token: str) -> str:
    return token.strip(".,;:")


def _is_size(token: str) -> bool:
    t = _trim(token)
    if not t or not re.search(r"\d", t) or _BARE_NUMBER.fullmatch(t):
        return False
    return _RESIDUE.sub("", t) == ""


def _is_size_group(token: str) -> bool:
    """A bracketed group that is a variant: (25.4mm), (100m Roll), (hec4010-04d), but not (White)."""
    inner = token[1:-1].strip()
    if _MODEL_CODE.fullmatch(inner):
        return True
    return any(_is_size(p) for p in inner.split())


def split_sized(name: str) -> tuple[str, str]:
    """Return (family name, variant label). Returns (name, "") when there is nothing safe to split."""
    tokens = re.findall(r"\([^)]*\)|\S+", name)
    n = len(tokens)
    flag = [(_is_size_group(t) if t.startswith("(") else _is_size(t)) for t in tokens]

    changed = True
    while changed:
        changed = False
        for i, t in enumerate(tokens):
            if flag[i]:
                continue
            low = _trim(t).lower()
            prev = flag[i - 1] if i > 0 else False
            nxt = flag[i + 1] if i + 1 < n else False
            hit = False
            if low in ("x", "*"):
                hit = prev or nxt
            elif re.fullmatch(r"[mf]/[mf]", low):
                hit = True  # M/m, F/f, M/f: thread gender pairs
            elif re.fullmatch(r"[mf]", low):
                hit = prev  # a single letter after a size: 1/2 F, 3/8 M
            elif low in ("bulk", "blister"):
                hit = True
            elif low in ("roll", "pack"):
                hit = prev
            elif low in _COUNT_WORDS:
                hit = prev or (i > 0 and _BARE_NUMBER.fullmatch(_trim(tokens[i - 1])) is not None)
            elif _BARE_NUMBER.fullmatch(low) and i + 1 < n:
                hit = _trim(tokens[i + 1]).lower() in _COUNT_WORDS  # "10 Piece", "12 Pack"
            if hit:
                flag[i] = True
                changed = True

    if not any(flag):
        return name, ""
    base = [t for t, f in zip(tokens, flag) if not f]
    label = [t for t, f in zip(tokens, flag) if f]
    while base and _trim(base[0]).lower() in _EDGE_WORDS:
        base.pop(0)
    while base and _trim(base[-1]).lower() in _EDGE_WORDS:
        base.pop()
    family = " ".join(base)
    # Nothing useful left ("12mm", "6 X 8mm"): leave the row alone. A one-word family name ("Hosetail") is fine,
    # because rows only ever merge inside one supplier, brand and category.
    if len(re.sub(r"[^A-Za-z]", "", family)) < 4:
        return name, ""
    return family, " ".join(label)
