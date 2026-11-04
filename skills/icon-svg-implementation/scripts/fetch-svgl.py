#!/usr/bin/env python3
"""Search and fetch SVG assets from SVGL using only the Python standard library."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_BASE = "https://api.svgl.app"


def request_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "codex-icon-svg-implementation/1.0"})
    try:
        with urlopen(request, timeout=20) as response:
            return response.read().decode("utf-8")
    except HTTPError as exc:
        raise SystemExit(f"HTTP {exc.code} while requesting {url}") from exc
    except URLError as exc:
        raise SystemExit(f"Network error while requesting {url}: {exc.reason}") from exc


def search(term: str) -> list[dict[str, Any]]:
    payload = request_text(f"{API_BASE}?{urlencode({'search': term})}")
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"SVGL returned invalid JSON for search term {term!r}") from exc
    if not isinstance(data, list):
        raise SystemExit("SVGL search returned an unexpected response shape")
    return [entry for entry in data if isinstance(entry, dict)]


def route_value(value: Any, variant: str) -> str:
    if isinstance(value, str):
        return value
    if not isinstance(value, dict):
        raise SystemExit("Selected SVGL entry does not contain a usable SVG route")

    if variant == "auto":
        for key in ("light", "dark"):
            route = value.get(key)
            if isinstance(route, str):
                return route
        raise SystemExit("Selected SVGL entry has no light or dark route")

    route = value.get(variant)
    if isinstance(route, str):
        return route
    raise SystemExit(f"Selected SVGL entry does not provide a {variant!r} variant")


def pick_entry(entries: list[dict[str, Any]], term: str) -> dict[str, Any]:
    if not entries:
        raise SystemExit(f"No SVGL results found for {term!r}")

    normalized = term.casefold()
    for entry in entries:
        title = str(entry.get("title", ""))
        if title.casefold() == normalized:
            return entry
    return entries[0]


def print_results(entries: list[dict[str, Any]]) -> None:
    for entry in entries:
        title = entry.get("title", "")
        category = entry.get("category", "")
        route = entry.get("route")
        wordmark = entry.get("wordmark")
        url = entry.get("url", "")
        if isinstance(category, list):
            category = ", ".join(str(item) for item in category)
        route_shape = "variants" if isinstance(route, dict) else "single"
        wordmark_shape = "none"
        if isinstance(wordmark, dict):
            wordmark_shape = "variants"
        elif isinstance(wordmark, str):
            wordmark_shape = "single"
        print(f"{title}\t{category}\ticon:{route_shape}\twordmark:{wordmark_shape}\t{url}")


def fetch(args: argparse.Namespace) -> None:
    entry = pick_entry(search(args.term), args.term)
    asset = entry.get("wordmark") if args.kind == "wordmark" else entry.get("route")
    if asset is None:
        raise SystemExit(f"Selected entry {entry.get('title', args.term)!r} has no {args.kind}")

    svg_url = route_value(asset, args.variant)
    svg = request_text(svg_url)
    if "<svg" not in svg[:500].lower():
        raise SystemExit(f"Downloaded content from {svg_url} does not look like SVG")

    out_path = Path(args.out).expanduser()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(svg, encoding="utf-8")
    print(f"Wrote {entry.get('title', args.term)} {args.kind} SVG to {out_path}")
    print(f"Source: {svg_url}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Search and fetch SVG assets from SVGL.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    search_parser = subparsers.add_parser("search", help="Search SVGL by title")
    search_parser.add_argument("term", help="Search term, such as codex or stripe")

    fetch_parser = subparsers.add_parser("fetch", help="Fetch the best matching SVG")
    fetch_parser.add_argument("term", help="Search term, such as codex or stripe")
    fetch_parser.add_argument("--variant", choices=("light", "dark", "auto"), default="auto")
    fetch_parser.add_argument("--kind", choices=("icon", "wordmark"), default="icon")
    fetch_parser.add_argument("--out", required=True, help="Output SVG path")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "search":
        print_results(search(args.term))
        return
    if args.command == "fetch":
        fetch(args)
        return

    parser.error("unknown command")


if __name__ == "__main__":
    main()
