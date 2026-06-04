import requests
import streamlit as st

# ------------------------------------------------
# EMAILJS CONFIG
# ------------------------------------------------
EMAILJS_SERVICE_ID = "service_11jzc69"         # e.g., service_xk822
EMAILJS_TEMPLATE_ID = "template_hyn28nk"       # e.g., template_9uya12b
EMAILJS_PUBLIC_KEY = "lZPzOvd5z3joU_L1K"         # e.g., Lki38fEKw9hWd_njj

EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send"


# ------------------------------------------------
# GENERIC EMAIL SENDER
# ------------------------------------------------
def send_email(to_email, subject, message, to_name="User"):
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": {
            "to_name": to_name,
            "subject": subject,
            "message": message,
            "to_email": to_email,
            "from_name": "WorkSense AI Bot"
        }
    }

    response = requests.post(EMAILJS_URL, json=payload)

    if response.status_code == 200:
        st.success(f"📧 Email sent to {to_email}")
    else:
        st.error("❌ Error sending email")
        st.write(response.text)


# ------------------------------------------------
# WEEKLY SUMMARY EMAIL
# ------------------------------------------------
def send_weekly_email(to_email, user_name, weekly):
    subject = "Your Weekly Productivity Summary - WorkSense"

    body = f"""
Hello {user_name},

Here is your weekly performance summary from WorkSense:

• Tasks Completed: {weekly['week_completed']}
• Total Tasks: {weekly['week_tasks']}
• Average Time per Task: {weekly['week_avg_time']} mins
• Total Time Spent: {weekly['week_total_time']} mins
• Productivity Score: {weekly['week_score']}

Stay productive!

— WorkSense AI Assistant
"""
    send_email(to_email, subject, body, user_name)


# ------------------------------------------------
# MONTHLY SUMMARY EMAIL
# ------------------------------------------------
def send_monthly_email(to_email, user_name, monthly):
    subject = "Your Monthly Productivity Summary - WorkSense"

    body = f"""
Hello {user_name},

Here is your monthly performance summary:

• Tasks Completed: {monthly['month_completed']}
• Total Tasks: {monthly['month_tasks']}
• Avg Time per Task: {monthly['month_avg_time']} mins
• Total Time Spent: {monthly['month_total_time']} mins

Insight:
{monthly['insight']}

Great job this month — keep improving!

— WorkSense AI Assistant
"""
    send_email(to_email, subject, body, user_name)


# ------------------------------------------------
# MANAGER TEAM REPORT EMAIL
# ------------------------------------------------
def send_team_summary(to_email, user_name, df):
    total_tasks = len(df)
    members = len(df["username"].unique())

    subject = "Team Weekly Summary - WorkSense"

    message = f"""
Hello {user_name},

Team Summary Report:

• Total Tasks across team: {total_tasks}
• Active Team Members: {members}

Recommended Actions:
• Monitor workload balance
• Review pending tasks
• Plan next week's objectives

— WorkSense AI Assistant
"""
    send_email(to_email, subject, message, user_name)