"""Utilities for loading environment variables for data pipeline scripts."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable, List, Optional, Union

from dotenv import load_dotenv


def _discover_default_paths() -> List[Path]:
    """Return default .env locations to try (data/.env, repo/.env)."""
    current_file = Path(__file__).resolve()
    candidates = []

    data_dir = current_file.parents[2] if len(current_file.parents) > 2 else None
    repo_dir = current_file.parents[3] if len(current_file.parents) > 3 else None

    for base in (data_dir, repo_dir):
        if base:
            candidates.append(base / '.env')

    return candidates


def load_env(
    extra_paths: Optional[Iterable[Union[str, os.PathLike]]] = None,
    *,
    override: bool = False,
) -> List[Path]:
    """Load environment variables from discovered .env files.

    Args:
        extra_paths: Additional file paths to consider before defaults.
        override: Whether values from the .env files should override existing env vars.

    Returns:
        A list of Path objects for all .env files successfully loaded.
    """

    loaded_paths: List[Path] = []
    seen_paths = set()

    candidate_paths: List[Path] = []
    if extra_paths:
        for path in extra_paths:
            candidate_paths.append(Path(path).expanduser().resolve())

    candidate_paths.extend(_discover_default_paths())

    for env_path in candidate_paths:
        if env_path in seen_paths:
            continue
        seen_paths.add(env_path)

        if env_path.exists():
            load_dotenv(env_path, override=override)
            loaded_paths.append(env_path)

    return loaded_paths
