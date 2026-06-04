import pandas as pd
import numpy as np

# ---------------------------------------------------------
# PRODUCTIVITY SCORE (0–100 scale)
# ---------------------------------------------------------
def calculate_productivity_score(df):
    if df.empty:
        return 0

    completed = len(df[df["status"] == "Completed"])
    total = len(df)

    completion_score = (completed / total) * 60 if total else 0

    avg_time = df["time_spent"].mean()
    time_score = min((avg_time / 60) * 20, 20)

    consistency = df["time_spent"].std() if total > 1 else 0
    consistency_score = max(20 - consistency, 0)

    return round(completion_score + time_score + consistency_score, 2)


# ---------------------------------------------------------
# BASIC KPIS
# ---------------------------------------------------------
def generate_kpis(df):
    if df.empty:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "avg_time": 0,
            "category_count": 0
        }

    total = len(df)
    completed = len(df[df["status"] == "Completed"])
    avg_time = round(df["time_spent"].mean(), 2)
    categories = df["category"].nunique()

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "avg_time": avg_time,
        "category_count": categories
    }


# ---------------------------------------------------------
# DAILY TREND (line chart)
# ---------------------------------------------------------
def get_daily_trend(df):
    if df.empty:
        return pd.DataFrame()

    df["date"] = pd.to_datetime(df["date"])
    trend = df.groupby("date")["task_id"].count().reset_index()
    trend.columns = ["date", "tasks_completed"]
    return trend


# ---------------------------------------------------------
# CATEGORY BREAKDOWN (bar chart)
# ---------------------------------------------------------
def get_category_distribution(df):
    if df.empty:
        return pd.DataFrame()

    return df.groupby("category")["task_id"].count().reset_index()


# ---------------------------------------------------------
# TIME SPENT TREND (area chart)
# ---------------------------------------------------------
def get_time_spent_trend(df):
    if df.empty:
        return pd.DataFrame()

    df["date"] = pd.to_datetime(df["date"])
    trend = df.groupby("date")["time_spent"].sum().reset_index()
    return trend


# ---------------------------------------------------------
# CALENDAR HEATMAP DATA
# ---------------------------------------------------------
def get_calendar_data(df):
    if df.empty:
        return pd.DataFrame()

    df["date"] = pd.to_datetime(df["date"])
    df["count"] = 1

    return df.groupby("date")["count"].sum()


# ---------------------------------------------------------
# WEEKLY SUMMARY
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

    week_tasks = len(week_df)
    week_completed = len(week_df[week_df["status"] == "Completed"])
    week_avg_time = round(week_df["time_spent"].mean(), 2) if week_tasks else 0
    week_total_time = week_df["time_spent"].sum()

    score = round((week_completed / week_tasks) * 100, 2) if week_tasks else 0

    return {
        "week_tasks": week_tasks,
        "week_completed": week_completed,
        "week_avg_time": week_avg_time,
        "week_total_time": week_total_time,
        "week_score": score,
        "df": week_df
    }


# ---------------------------------------------------------
# MONTHLY SUMMARY
# ---------------------------------------------------------
def get_monthly_summary(df):
    if df.empty:
        return {
            "month_tasks": 0,
            "month_completed": 0,
            "month_avg_time": 0,
            "month_total_time": 0,
            "trend_df": pd.DataFrame(),
            "insight": "No monthly data available."
        }

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    current_month = df["month"].max()
    month_df = df[df["month"] == current_month]

    month_tasks = len(month_df)
    month_completed = len(month_df[month_df["status"] == "Completed"])
    month_avg_time = round(month_df["time_spent"].mean(), 2) if month_tasks else 0
    month_total_time = month_df["time_spent"].sum()

    trend_df = month_df.groupby("date")["task_id"].count().reset_index()

    insight = "Good performance this month!"
    if month_avg_time > 60:
        insight = "Tasks took longer than usual — review workload."
    if month_completed < month_tasks / 2:
        insight = "High pending tasks this month — try prioritizing."

    return {
        "month_tasks": month_tasks,
        "month_completed": month_completed,
        "month_avg_time": month_avg_time,
        "month_total_time": month_total_time,
        "trend_df": trend_df,
        "insight": insight
    }


# ---------------------------------------------------------
# TEAM PRODUCTIVITY (Manager)
# ---------------------------------------------------------
def get_team_productivity(df):
    if df.empty:
        return pd.DataFrame()

    return df.groupby("username")["time_spent"].sum().reset_index()


# ---------------------------------------------------------
# TEAM TASK COUNT (Manager)
# ---------------------------------------------------------
def get_user_task_count(df):
    if df.empty:
        return pd.DataFrame()

    return df.groupby("username")["task_id"].count().reset_index()