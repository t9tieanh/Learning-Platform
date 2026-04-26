---
name: replace-thumbnail-url
description: Update thumbnail_url for every row in a CSV by searching Google Images with the title field and writing the first valid image result. Use this when replacing placeholder thumbnails across a full dataset.
---

# Skill Instructions

## When to use
- Use this skill when the CSV contains both `title` and `thumbnail_url` columns.
- Use this skill when you want to process the entire file, not just a subset.
- Use this skill when thumbnail URLs are placeholders and need to be replaced with real image URLs.

## Default target
- Default target is the CSV file explicitly provided by the user (for example, via prompt or attachment).
- If no CSV path is provided by the user, fallback to: `data/data/cleaned/cleaned_courses.csv`.

## Required behavior
1. Load the CSV and locate the `title` and `thumbnail_url` columns by header name.
2. Process all data rows in the file.
3. For each row:
- Read `title` and use it as the Google Images search query.
- Get the first valid image result.
- Replace the current value in `thumbnail_url`.
4. Keep all other columns unchanged.
5. Preserve header order and row order.
6. Write the updated data back to the original CSV path.

## Google Images extraction strategy
Use browser automation instead of raw HTTP scraping to reduce anti-bot failures.

1. Open:
- `https://www.google.com/search?hl=en&udm=2&q=<encoded_title>`
2. Click the first image card to open the preview panel.
3. Extract candidate URLs from the preview panel.
4. Pick the first URL that is a valid image candidate.

## URL filtering rules
Accept only URLs that satisfy all conditions:
- Start with `https://`
- Are not known Google branding/icon assets

Reject URLs containing:
- `fonts.gstatic.com`
- `gstatic.com/images/branding`
- `googlelogo`
- `/faviconV2`

## Error handling
- If one row fails, continue processing the next row.
- Track failed rows and include them in the final report.
- Never stop the full run because of a single-row failure.

## Safety constraints
- Only modify the `thumbnail_url` field.
- Do not rename, remove, or reorder columns.
- Do not truncate long text fields.
- Use safe CSV parsing/writing to preserve quoting and commas.

## Validation checklist
After processing, report:
1. Total rows processed.
2. Number of successful thumbnail updates.
3. Number of failed or skipped rows.
4. A quick spot-check sample (a few rows) showing updated `thumbnail_url` values.
5. Confirmation that the run covered the entire CSV.

## Minimal invocation prompt
Use this short prompt to invoke the skill:

"Apply the skill in data/skills/SKILL.md to process the full CSV at <user-provided-csv-path>: search Google Images using title and replace thumbnail_url with the first valid image result for every row. If no path is provided, use the fallback default in the skill."
