# Makefile for Learning Platform Data Processing

PYTHON_VENV = venv
PYTHON = $(PYTHON_VENV)/bin/python
PIP = $(PYTHON_VENV)/bin/pip

.PHONY: bootstrap clean-env pipeline clean-all normalize import sync help clean-supabase clean-courses translate-titles translate-descriptions import-feedback-json

help:
	@echo "Available commands:"
	@echo "  bootstrap         - Create virtual environment and install requirements"
	@echo "  clean-env         - Remove virtual environment"
	@echo "  pipeline          - Run full pipeline: Clean-All -> Normalize -> Import"
	@echo "  clean-all         - Run all cleaning & translation steps (Clean -> Title -> Desc)"
	@echo "  clean-courses     - Run pure data cleaning script"
	@echo "  translate-titles  - Translate course titles"
	@echo "  translate-descriptions - Translate course descriptions"
	@echo "  normalize         - Run all normalization scripts"
	@echo "  import            - Import data to MySQL and MongoDB"
	@echo "  import-feedback-json - Import feedbacks from JSON seed file via standalone shell script"
	@echo "  sync-supabase     - Sync lesson analysis to Supabase"
	@echo "  import-supabase   - Import normalized courses to Supabase embeddings table"
	@echo "  clean-supabase    - Clear all course data from Supabase"

bootstrap:
	python3 -m venv $(PYTHON_VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "\n✅ Environment bootstrapped successfully. Use 'source venv/bin/activate' to activate."

clean-env:
	rm -rf $(PYTHON_VENV)

# --- Individual Pipeline Steps ---

clean-courses:
	$(PYTHON) scripts/clean/clean_courses.py

translate-titles:
	$(PYTHON) scripts/clean/translate_titles.py

translate-descriptions:
	$(PYTHON) scripts/clean/translate_descriptions.py

normalize:
	$(PYTHON) scripts/normalize/normalize_categories.py
	$(PYTHON) scripts/normalize/normalize_users.py
	$(PYTHON) scripts/normalize/normalize_tags.py
	$(PYTHON) scripts/normalize/normalize_blogs.py
	$(PYTHON) scripts/normalize/normalize_feedbacks.py
	$(PYTHON) scripts/normalize/normalize_expertise.py
	$(PYTHON) scripts/supabase/normalize_courses_for_supabase.py

import:
	$(PYTHON) scripts/import-data/import_to_mysql.py
	$(PYTHON) scripts/import-data/import_blogs.py
	$(PYTHON) scripts/import-data/import_feedbacks.py

import-feedback-json:
	bash scripts/import-data/import_feedbacks_from_json.sh

sync-supabase:
	$(PYTHON) scripts/supabase/import-data/sync_assistant_to_supabase.py

import-supabase:
	$(PYTHON) scripts/supabase/import_to_supabase.py

clean-supabase:
	$(PYTHON) scripts/supabase/clean_supabase_courses.py

# --- Full Pipeline ---

# The full cleaning process is now modular: Clean -> Translate Titles -> Translate Descriptions
clean-all: clean-courses translate-titles translate-descriptions

pipeline: clean-all normalize import
	@echo "✅ Full pipeline completed."

all: bootstrap pipeline sync-supabase
