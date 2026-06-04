import pandas as pd

def detect_productivity_drop(df):
    if df.empty:
        return None
    df["date"] = pd.to_datetime(df["date"])
    daily = df.groupby("date")["task_id"].count().reset_index()
    if len(daily) < 3:
        return None
    last_day = daily.iloc[-1, 1]
    previous_day = daily.iloc[-2, 1]
    if last_day < previous_day * 0.5:
        return f"Productivity dropped by more than 50% on {daily.iloc[-1,0].date()}"
    return None

def detect_time_spike(df):
    if df.empty:
        return None
    avg_time = df["time_spent"].mean()
    max_time = df["time_spent"].max()
    if max_time > avg_time * 2:
        return f"Unusually long task detected: {max_time} mins (avg: {round(avg_time, 2)} mins)"
    return None

def detect_pending_overload(df):
    if df.empty:
        return None
    pending = len(df[df["status"] == "Pending"])
    total = len(df)
    if total > 0 and pending / total > 0.6:
        return f"High pending load: {pending} pending out of {total}"
    return None

def detect_category_imbalance(df):
    if df.empty:
        return None
    cat = df["category"].value_counts(normalize=True)
    for cat_name, value in cat.items():
        if value > 0.5:
            return f"Category imbalance: '{cat_name}' accounts for {round(value*100,1)}% of work"
    return None

def detect_team_stress(all_tasks_df):
    if all_tasks_df.empty:
        return None
    avg_time = all_tasks_df["time_spent"].mean()
    if avg_time > 45:
        return f"Team stress indicator: Avg duration {round(avg_time,2)} mins"
    return None

def analyze_anomalies(df, is_manager=False, all_tasks_df=None):
    alerts = []

    drop = detect_productivity_drop(df)
    if drop:
        alerts.append(drop)

    spike = detect_time_spike(df)
    if spike:
        alerts.append(spike)

    pending = detect_pending_overload(df)
    if pending:
        alerts.append(pending)

    imbalance = detect_category_imbalance(df)
    if imbalance:
        alerts.append(imbalance)

    if is_manager and all_tasks_df is not None:
        stress = detect_team_stress(all_tasks_df)
        if stress:
            alerts.append(stress)

    return alerts