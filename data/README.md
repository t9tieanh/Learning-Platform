# Dataset Preparation for Learning Platform

This directory contains the dataset preparation pipeline for the Learning Platform system. The goal is to process raw course data into a structured, clean, and normalized format suitable for the application's database, search engine, and recommendation systems.

## Directory Structure

The `data/` directory is organized as follows:

```
data/
├── data/                  # Storage for data at various stages
│   ├── raw/               # Original, immutable data downloaded from sources
│   ├── cleaned/           # Data after initial cleaning (selecting columns, renaming)
│   └── normalized/        # Data after normalization (standardizing formats, types)
├── scripts/               # Python scripts for data processing
│   └── clean/             # Scripts for cleaning raw data
├── notebooks/             # Jupyter notebooks for data exploration and prototyping
├── requirements.txt       # Python dependencies
└── README.md              # This documentation
```

## Environment Setup

To prepare the environment for running the scripts:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Data Processing Pipeline

The data flows through the following stages:

### 1. Download (Raw Data)
Raw data is collected from various sources (e.g., CSV dumps).
*   **Source:** `data/raw/online-courses/Online_Courses.csv`

### 2. Clean
Selects relevant columns, parses ratings, adds default values (prices, thumbnails, video URLs), and renames columns.
*   **Script:** `scripts/clean/clean_online_courses.py`
*   **Output:** `data/cleaned/cleaned_courses.csv`
*   **Note:** Set `DEEPL_API_KEY` (or `DEEPL_AUTH_KEY`) in `.env` to enable automatic Vietnamese title translation via Deepl.

### 3. Normalize
Splits the cleaned data into relational entities, generates UUIDs, and creates mock data (users, chapters, lessons).

a. **Categories**: Extracts unique categories.
   *   **Script:** `scripts/normalize/normalize_categories.py`
   *   **Output:** `data/normalized/categories.csv` & updates `courses.csv`

b. **Users (Instructors)**: Extracts instructors and generates user profiles (email, password, etc.).
   *   **Script:** `scripts/normalize/normalize_users.py`
   *   **Output:** `data/normalized/users.csv` & updates `courses.csv`

c. **Tags, Outcomes, Chapters & Lessons**: Extracts tags and generates related content (outcomes, requirements, chapters, lessons) based on those tags.
   *   **Script:** `scripts/normalize/normalize_tags.py`
   *   **Outputs:** 
       *   `data/normalized/tags.csv`
       *   `data/normalized/course_tag.csv`
       *   `data/normalized/course_outcomes.csv`
       *   `data/normalized/course_requirements.csv`
       *   `data/normalized/chapters.csv`
       *   `data/normalized/lessons.csv`
       *   Updates `courses.csv` (removes tags column, adds final IDs)

d. **Blogs**: Generates blog entries from courses.
   *   **Script:** `scripts/normalize/normalize_blogs.py`
   *   **Output:** `data/normalized/blogs.csv`

e. **Feedbacks**: Reuses generated course users and creates random course reviews and ratings.
   *   **Script:** `scripts/normalize/normalize_feedbacks.py`
   *   **Output:** `data/normalized/feedbacks.csv` & appends 10 review users to `users.csv`

### 4. Database Config & Import
Imports the normalized CSV files into the MySQL databases (`user_service` and `course_service`) and MongoDB (`blog-service`, `notification-service`).
*   **Scripts:** 
    *   `scripts/import-data/import_to_mysql.py`
    *   `scripts/import-data/import_blogs.py`
    *   `scripts/import-data/import_feedbacks.py`
*   **Requirements:** 
    *   MySQL running on localhost:3306 (or configured via `.env`).
    *   MongoDB running (or configured via `.env`).
    *   `pip install pymongo` for the MongoDB import script.

## Usage

### 1. Setup Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install pymongo
```

### 2. Configure Database
Create a `.env` file in the `data/` directory based on `.env.example`:
```env
# MySQL Config
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306

# MongoDB Config
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=blog-service

# Deepl Translation (used in clean_online_courses)
DEEPL_API_KEY=your_deepl_api_key
# or alternatively
# DEEPL_AUTH_KEY=your_deepl_api_key
```

### 3. Run Full Pipeline
Run the scripts in the following order to clean, normalize, and import data:

```bash
# 1. Clean Data
python scripts/clean/clean_online_courses.py

# 2. Normalize Data (Order matters!)
python scripts/normalize/normalize_categories.py
python scripts/normalize/normalize_users.py
python scripts/normalize/normalize_tags.py
python scripts/normalize/normalize_blogs.py
python scripts/normalize/normalize_feedbacks.py

# 3. Import to MySQL & MongoDB
python scripts/import-data/import_to_mysql.py
python scripts/import-data/import_blogs.py
python scripts/import-data/import_feedbacks.py
```

### One-Liner Command
```bash
python scripts/clean/clean_online_courses.py && \
python scripts/normalize/normalize_categories.py && \
python scripts/normalize/normalize_users.py && \
python scripts/normalize/normalize_tags.py && \
python scripts/normalize/normalize_blogs.py && \
python scripts/normalize/normalize_feedbacks.py && \
python scripts/import-data/import_to_mysql.py && \
python scripts/import-data/import_blogs.py && \
python scripts/import-data/import_feedbacks.py
```
