# Makefile for Learning Platform Data Processing

PYTHON_VENV = venv
PYTHON = $(PYTHON_VENV)/bin/python
PIP = $(PYTHON_VENV)/bin/pip

.PHONY: bootstrap clean-env pipeline clean-all normalize import sync help clean-supabase translate-description

help:
	@echo "Available commands:"
	@echo "  bootstrap         - Create virtual environment and install requirements"
	@echo "  clean-env         - Remove virtual environment"
	@echo "  pipeline          - Run the full data processing pipeline (Clean -> Normalize -> Import)"
	@echo "  clean-data        - Run initial data cleaning script"
	@echo "  normalize         - Run all normalization scripts"
	@echo "  import            - Import data to MySQL and MongoDB"
	@echo "  sync-supabase     - Sync lesson analysis to Supabase"
	@echo "  import-supabase   - Import normalized courses to Supabase embeddings table"
	@echo "  clean-supabase    - Clear all course data from Supabase"
	@echo "  translate-description - Translate course short descriptions using DeepL"

bootstrap:
	python3 -m venv $(PYTHON_VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "\n✅ Environment bootstrapped successfully. Use 'source venv/bin/activate' to activate."

clean-env:
	rm -rf $(PYTHON_VENV)

# --- Individual Pipeline Steps ---

clean-data:
	$(PYTHON) scripts/clean/clean_online_courses.py

translate-description:
	$(PYTHON) scripts/clean/translate_short_descriptions.py

normalize:
	$(PYTHON) scripts/normalize/normalize_categories.py
	$(PYTHON) scripts/normalize/normalize_users.py
	$(PYTHON) scripts/normalize/normalize_tags.py
	$(PYTHON) scripts/normalize/normalize_blogs.py
	$(PYTHON) scripts/normalize/normalize_feedbacks.py
	$(PYTHON) scripts/supabase/normalize_courses_for_supabase.py

import:
	$(PYTHON) scripts/import-data/import_to_mysql.py
	$(PYTHON) scripts/import-data/import_blogs.py
	$(PYTHON) scripts/import-data/import_feedbacks.py

sync-supabase:
	$(PYTHON) scripts/supabase/import-data/sync_assistant_to_supabase.py

import-supabase:
	$(PYTHON) scripts/supabase/import_to_supabase.py

clean-supabase:
	$(PYTHON) scripts/supabase/clean_supabase_courses.py

# --- Full Pipeline ---

pipeline: clean-data translate-description normalize import
	@echo "✅ Full pipeline completed."

all: bootstrap pipeline sync-supabase
