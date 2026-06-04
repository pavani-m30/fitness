import pandas as pd

# ---------------------------------------------------------
# Utility
# ---------------------------------------------------------
def safe_mean(series):
    return round(series.mean(), 2) if len(series) > 0 else 0


# ---------------------------------------------------------
# MAIN SMART RECOMMENDATION ENGINE
# ---------------------------------------------------------
def generate_recommendations(df, anomalies=[]):

    suggestions = []

    if df.empty:
        return ["No activity yet. Add tasks to begin analysis."]

    # ---------------------------------------------
    # TIME‑BASED OBSERVATIONS
    # ---------------------------------------------
    avg_time = safe_mean(df["time_spent"])

    if avg_time > 60:
        suggestions.append("You are spending too long on each task. Consider breaking tasks into smaller chunks.")
    elif avg_time < 15:
        suggestions.append("Your tasks are very short. Consider grouping similar tasks together for better focus.")
    else:
        suggestions.append(f"Your average task time ({avg_time} mins) is balanced.")

    # ---------------------------------------------
    # CATEGORY DISTRIBUTION
    # ---------------------------------------------
    cat_dist = df["category"].value_counts(normalize=True)
    if not cat_dist.empty:
        top_cat = cat_dist.index[0]
        pct = round(cat_dist.iloc[0] * 100, 1)

        if pct > 60:
            suggestions.append(f"Most of your work this period is '{top_cat}'. Try diversifying categories.")
        else:
            suggestions.append("Your task categories are well balanced.")

    # ---------------------------------------------
    # TASK STATUS
    # ---------------------------------------------
    pending = len(df[df["status"] == "Pending"])
    completed = len(df[df["status"] == "Completed"])

    if pending > completed:
        suggestions.append(f"You have many pending tasks ({pending}). Try finishing high‑priority ones first.")
    else:
        suggestions.append("Great balance between pending and completed tasks.")

    # ---------------------------------------------
    # DAILY TREND CHECK
    # ---------------------------------------------
    df["date"] = pd.to_datetime(df["date"])
    trend = df.groupby("date")["task_id"].count()

    if len(trend) >= 2:
        if trend.iloc[-1] < trend.iloc[-2]:
            suggestions.append("Your productivity dropped today. Review priorities to get back on track.")
        else:
            suggestions.append("Good improvement in today's productivity!")

    # ---------------------------------------------
    # ANOMALIES
    # ---------------------------------------------
    if anomalies:
        suggestions.append("⚠ Based on system anomaly detection:")
        for a in anomalies:
            suggestions.append(f"- {a}")
    else:
        suggestions.append("No anomalies detected. Your workflow looks stable.")

    # ---------------------------------------------
    # GENERAL PRODUCTIVITY ADVICE
    # ---------------------------------------------
    suggestions.append("Try scheduling your most important tasks in your most productive hours.")
    suggestions.append("Group meetings together to reduce context switching.")
    suggestions.append("Review your week's progress every Friday to plan ahead.")
    suggestions.append("Take short breaks to maintain efficiency and avoid burnout.")

    return suggestions