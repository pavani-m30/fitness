import pandas as pd

# ---------------------------------------------------------
# Detect sudden drop in productivity
# ---------------------------------------------------------
def detect_productivity_drop(df):
    if df.empty:
        return None

    df["date"] = pd.to_datetime(df["date"])
    daily = df.groupby("date")["task_id"].count()

    if len(daily) < 3:
        return None

    last_day = daily.iloc[-1]
    prev_avg = daily.iloc[:-1].mean()

    if last_day < prev_avg * 0.5:
        return f"Productivity dropped by over 50% today ({last_day} tasks vs avg {round(prev_avg,1)})."

    return None


# ---------------------------------------------------------
# Detect unusually long task durations
# ---------------------------------------------------------
def detect_time_spike(df):
    if df.empty:
        return None

    avg_time = df["time_spent"].mean()
    max_time = df["time_spent"].max()

    if max_time > avg_time * 2:
        return f"A task took unusually long ({max_time} mins vs avg {round(avg_time,1)})."

    return None


# ---------------------------------------------------------
# Detect too many pending tasks
# ---------------------------------------------------------
def detect_pending_overload(df):
    if df.empty:
        return None

    total = len(df)
    pending = len(df[df["status"] == "Pending"])

    if total > 0 and pending / total > 0.5:
        return f"More than half your tasks are pending ({pending}/{total}). Consider prioritizing."

    return None


# ---------------------------------------------------------
# Detect category imbalance
# ---------------------------------------------------------
def detect_category_imbalance(df):
    if df.empty:
        return None

    cat_dist = df["category"].value_counts(normalize=True)

    for category, ratio in cat_dist.items():
        if ratio > 0.6:
            return f"Your workload is dominated by '{category}' tasks ({round(ratio*100,1)}%). Consider balancing categories."

    return None


# ---------------------------------------------------------
# Team stress detection (Manager level)
# ---------------------------------------------------------
def detect_team_stress(df):
    if df.empty:
        return None

    avg_time = df["time_spent"].mean()

    if avg_time > 50:
        return f"Team stress alert: Avg time per task is very high ({round(avg_time,1)} mins)."

    return None


# ---------------------------------------------------------
# MAIN WRAPPER — COMPILE ALL ANOMALIES
# ---------------------------------------------------------
def analyze_anomalies(df, is_manager=False, all_tasks_df=None):
    alerts = []

    # Employee anomalies
    a1 = detect_productivity_drop(df)
    if a1: alerts.append(a1)

    a2 = detect_time_spike(df)
    if a2: alerts.append(a2)

    a3 = detect_pending_overload(df)
    if a3: alerts.append(a3)

    a4 = detect_category_imbalance(df)
    if a4: alerts.append(a4)

    # Manager-level anomalies
    if is_manager and all_tasks_df is not None:
        team_alert = detect_team_stress(all_tasks_df)
        if team_alert:
            alerts.append(team_alert)

    return alerts if alerts else ["No anomalies detected. You're doing great!"]