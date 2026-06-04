import pandas as pd

def safe_mean(series):
    return round(series.mean(), 2) if len(series) > 0 else 0


def generate_recommendations(df, anomalies=[]):
    suggestions = []

    if df.empty:
        return ["No activity yet. Add tasks to begin analysis."]

    # --------------------------------------------------------
    # TIME MANAGEMENT SUGGESTIONS
    # --------------------------------------------------------
    avg_time = safe_mean(df["time_spent"])

    if avg_time > 45:
        suggestions.append(f"Average time per task is high ({avg_time} mins). Try breaking work into smaller steps.")
    elif avg_time < 15:
        suggestions.append(f"Tasks seem too short (avg {avg_time} mins). Consider grouping similar tasks for focus.")
    else:
        suggestions.append(f"Your average task duration ({avg_time} mins) is balanced.")

    # --------------------------------------------------------
    # CATEGORY BALANCE
    # --------------------------------------------------------
    cat_count = df["category"].value_counts(normalize=True)

    if not cat_count.empty:
        top_cat = cat_count.index[0]
        top_pct = round(cat_count.iloc[0] * 100, 1)

        if top_pct > 60:
            suggestions.append(f"Too much focus on '{top_cat}' ({top_pct}%). Try balancing work categories.")
        else:
            suggestions.append("Your categories are evenly balanced — good distribution.")

    # --------------------------------------------------------
    # TASK COMPLETION BALANCE
    # --------------------------------------------------------
    pending = len(df[df["status"] == "Pending"])
    completed = len(df[df["status"] == "Completed"])

    if pending > completed:
        suggestions.append("High number of pending tasks. Prioritize unfinished tasks.")
    else:
        suggestions.append("Good completion rate on tasks.")

    # --------------------------------------------------------
    # DAILY TREND ANALYSIS
    # --------------------------------------------------------
    df["date"] = pd.to_datetime(df["date"])
    daily = df.groupby("date")["task_id"].count()

    if len(daily) >= 2:
        if daily.iloc[-1] < daily.iloc[-2]:
            suggestions.append("Productivity dropped today. Review task priorities.")
        else:
            suggestions.append("Good productivity improvement today!")

    # --------------------------------------------------------
    # ANOMALY BASED RECOMMENDATIONS
    # --------------------------------------------------------
    if anomalies:
        suggestions.append("⚠ Based on detected anomalies:")
        for a in anomalies:
            suggestions.append(a)
    else:
        suggestions.append("No major issues detected today.")

    # --------------------------------------------------------
    # GENERAL PRODUCTIVITY ADVICE
    # --------------------------------------------------------
    suggestions.append("Use mornings for high-focus tasks.")
    suggestions.append("Group similar tasks to reduce switching.")
    suggestions.append("Review your weekly trends to improve planning.")

    return suggestions