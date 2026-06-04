import pandas as pd
import datetime

# ---------------------------------------------------------
# Validate task input
# ---------------------------------------------------------
def validate_task_data(task_name, time_spent):
    if not task_name or task_name.strip() == "":
        return False
    if time_spent is None or time_spent <= 0:
        return False
    return True


# ---------------------------------------------------------
# Convert to date safely
# ---------------------------------------------------------
def convert_to_date(value):
    try:
        return pd.to_datetime(value).date()
    except:
        if isinstance(value, datetime.date):
            return value
        return None


# ---------------------------------------------------------
# Normalize category names
# ---------------------------------------------------------
def normalize_category(cat):
    if not isinstance(cat, str):
        return "Other"
    cat = cat.strip().title()
    return cat if cat != "" else "Other"


# ---------------------------------------------------------
# Clean uploaded CSV/Excel data
# ---------------------------------------------------------
def clean_uploaded_df(df):
    df.columns = df.columns.str.lower().str.replace(" ", "_")

    rename_map = {
        "task": "task_name",
        "title": "task_name",
        "minutes": "time_spent",
        "duration": "time_spent",
        "time": "time_spent",
        "day": "date",
        "task_date": "date",
        "categorytype": "category"
    }

    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    required = ["task_name", "category", "time_spent", "status", "date"]

    for col in required:
        if col not in df.columns:
            df[col] = None

    df["category"] = df["category"].apply(normalize_category)
    df["date"] = df["date"].apply(convert_to_date)

    df["time_spent"] = pd.to_numeric(df["time_spent"], errors="coerce").fillna(0).astype(int)

    return df


# ---------------------------------------------------------
# Format minutes as "Xh Ym"
# ---------------------------------------------------------
def format_minutes(mins):
    try:
        hours = mins // 60
        minutes = mins % 60
        return f"{hours}h {minutes}m"
    except:
        return "0h 0m"