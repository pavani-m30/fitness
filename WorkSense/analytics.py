import pandas as pd
import numpy as np

# ---------------------------------------------------------
# 1. PRODUCTIVITY SCORE
# ---------------------------------------------------------
def calculate_productivity_score(df):
    if df.empty:
        return 0

    completed = df[df["status"] == "Completed"]
    total_tasks = len(df)
    completed_tasks = len(completed)

    # Scoring weights
    completion_score = (completed_tasks / total_tasks) * 50 if total_tasks else 0

    avg_time = df["time_spent"].mean()
    time_score = min((avg_time / 60) * 30, 30)  # normalized to max 30

    consistency = df["time_spent"].std() if completed_tasks > 1 else 0
    consistency_score = max(20 - consistency, 0)  # higher consistency → higher score

    total = completion_score + time_score + consistency_score
    return round(total, 2)


# ---------------------------------------------------------
# 2. KPI SUMMARIES
# ---------------------------------------------------------
def generate_kpis(df):
    if df.empty:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "avg_time": 0,
            "category_count": 0
        }

    total_tasks = len(df)
    completed = len(df[df["status"] == "Completed"])
    avg_time = df["time_spent"].mean()
    category_count = df["category"].nunique()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed,
        "avg_time": round(avg_time, 2),
        "category_count": category_count
    }


# ---------------------------------------------------------
# 3. DAILY TREND
# ---------------------------------------------------------
def get_daily_trend(df):
    if df.empty:
        return pd.DataFrame()

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    trend = df.groupby("date")["task_id"].count().reset_index()
    trend.columns = ["date", "tasks_completed"]
    return trend


# ---------------------------------------------------------
# 4. CATEGORY DISTRIBUTION
# ---------------------------------------------------------
def get_category_distribution(df):
    if df.empty:
        return pd.DataFrame()

    grouped = df.groupby("category")["task_id"].count().reset_index()
    return grouped


# ---------------------------------------------------------
# 5. TIME SPENT TREND
# ---------------------------------------------------------
def get_time_spent_trend(df):
    if df.empty:
        return pd.DataFrame()

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])

    trend = df.groupby("date")["time_spent"].sum().reset_index()
    trend.columns = ["date", "time_spent"]
    return trend


# ---------------------------------------------------------
# 6. TEAM PRODUCTIVITY (MANAGER)
# ---------------------------------------------------------
def get_team_productivity(df):
    if df.empty:
        return pd.DataFrame()

    grouped = df.groupby("username")["time_spent"].sum().reset_index()
    grouped.columns = ["username", "total_time_spent"]
    return grouped


# ---------------------------------------------------------
# 7. USER TASK COUNTS (MANAGER)
# ---------------------------------------------------------
def get_user_task_count(df):
    if df.empty:
        return pd.DataFrame()

    grouped = df.groupby("username")["task_id"].count().reset_index()
    grouped.columns = ["username", "tasks_completed"]
    return grouped
# ---------------------------------------------------------
# 8. WEEKLY SUMMARY METRICS
# ---------------------------------------------------------
def get_weekly_summary(df):
    if df.empty:
        return {
            "week_tasks": 0,
            "week_completed": 0,
            "week_avg_time": 0,
            "week_total_time": 0,
            "week_score": 0,
            "df": pd.DataFrame()
        }

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["week"] = df["date"].dt.isocalendar().week

    current_week = df["week"].max()
    week_df = df[df["week"] == current_week]

    # Metrics
    week_tasks = len(week_df)
    week_completed = len(week_df[week_df["status"] == "Completed"])
    week_avg_time = round(week_df["time_spent"].mean(), 2)
    week_total_time = week_df["time_spent"].sum()

    # Weekly productivity score (normalized 0–100)
    week_score = round((week_completed / week_tasks) * 100, 2) if week_tasks else 0

    return {
        "week_tasks": week_tasks,
        "week_completed": week_completed,
        "week_avg_time": week_avg_time,
        "week_total_time": week_total_time,
        "week_score": week_score,
        "df": week_df
    }
# ---------------------------------------------------------
# 9. MONTHLY SUMMARY METRICS
# ---------------------------------------------------------
def get_monthly_summary(df):
    if df.empty:
        return {
            "month_tasks": 0,
            "month_completed": 0,
            "month_avg_time": 0,
            "month_total_time": 0,
            "trend_df": pd.DataFrame(),
            "previous_month_tasks": 0,
            "insight": "No monthly insights available."
        }

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    current_month = df["month"].max()
    month_df = df[df["month"] == current_month]

    # Metrics
    month_tasks = len(month_df)
    month_completed = len(month_df[month_df["status"] == "Completed"])
    month_avg_time = round(month_df["time_spent"].mean(), 2)
    month_total_time = month_df["time_spent"].sum()

    # Trend Data
    trend_df = month_df.groupby("date")["task_id"].count().reset_index()

    # Previous month comparison
    previous_month = current_month - 1
    previous_month_df = df[df["month"] == previous_month]
    previous_month_tasks = len(previous_month_df)

    # Insight logic
    if previous_month_tasks == 0:
        insight = "Not enough data to compare with previous month."
    else:
        change = month_tasks - previous_month_tasks
        percent_change = round((change / previous_month_tasks) * 100, 1)

        if percent_change > 0:
            insight = f"Productivity improved by {percent_change}% compared to last month."
        elif percent_change < 0:
            insight = f"Productivity decreased by {abs(percent_change)}% compared to last month."
        else:
            insight = "Your productivity is the same as last month."

    return {
        "month_tasks": month_tasks,
        "month_completed": month_completed,
        "month_avg_time": month_avg_time,
        "month_total_time": month_total_time,
        "trend_df": trend_df,
        "previous_month_tasks": previous_month_tasks,
        "insight": insight
    }
# ---------------------------------------------------------
# 10. CALENDAR HEATMAP DATA
# ---------------------------------------------------------
def get_calendar_data(df):
    if df.empty:
        return pd.DataFrame()

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["count"] = 1  # each task counts once

    # Group by date for heatmap
    cal_df = df.groupby("date")["count"].sum()
    return cal_df
# ---------------------------------------------------------
# 11. CATEGORY VS STATUS STACKED DATA
# ---------------------------------------------------------
def get_category_status_stack(df):
    if df.empty:
        return pd.DataFrame()

    pivot = df.pivot_table(
        index="category",
        columns="status",
        values="task_id",
        aggfunc="count",
        fill_value=0
    )
    return pivot


# ---------------------------------------------------------
# 12. DAY OF WEEK PRODUCTIVITY
# ---------------------------------------------------------
def get_day_of_week_pattern(df):
    if df.empty:
        return pd.DataFrame()

    df["date"] = pd.to_datetime(df["date"])
    df["day"] = df["date"].dt.day_name()
    pattern = df.groupby("day")["task_id"].count().reset_index()
    return pattern


# ---------------------------------------------------------
# 13. HOURLY PRODUCTIVITY (if time available)
# ---------------------------------------------------------
def get_hourly_pattern(df):
    if "hour" not in df.columns:
        return pd.DataFrame()   # if user did not add hour data

    pattern = df.groupby("hour")["task_id"].count().reset_index()
    return pattern