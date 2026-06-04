import pandas as pd
import datetime


# --------------------------------------------------------
# VALIDATE TASK DATA BEFORE SAVING
# --------------------------------------------------------
def validate_task_data(task_name, time_spent):
    if not task_name or len(task_name.strip()) == 0:
        return False
    if time_spent is None or time_spent <= 0:
        return False
    return True


# --------------------------------------------------------
# ENSURE DATE FIELD IS PROPERLY HANDLED
# --------------------------------------------------------
def convert_to_date(date_value):
    if isinstance(date_value, datetime.date):
        return date_value
    try:
        return pd.to_datetime(date_value).date()
    except:
        return None


# --------------------------------------------------------
# CLEAN CATEGORY NAME
# --------------------------------------------------------
def normalize_category(cat):
    if not isinstance(cat, str):
        return "Other"
    cat = cat.strip().title()
    if cat == "":
        return "Other"
    return cat


# --------------------------------------------------------
# CLEAN WHOLE TASK DATAFRAME
# --------------------------------------------------------
def clean_task_df(df):
    if df.empty:
        return df

    # Standardize column names
    df.columns = df.columns.str.lower()

    # Fix category values
    if "category" in df.columns:
        df["category"] = df["category"].apply(normalize_category)

    # Fix dates
    if "date" in df.columns:
        df["date"] = df["date"].apply(convert_to_date)

    return df


# --------------------------------------------------------
# FORMAT TIME (MINS → HH:MM)
# --------------------------------------------------------
def format_minutes(value):
    try:
        hours = value // 60
        mins = value % 60
        return f"{hours}h {mins}m"
    except:
        return "0h 0m"