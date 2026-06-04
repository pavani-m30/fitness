import streamlit as st
import pandas as pd
import datetime

from auth import login, register, logout, init_session
from database import init_db
from task_manager import add_task_form, view_user_tasks, upload_tasks_csv, manager_view_all_tasks
from analytics import (
    calculate_productivity_score, generate_kpis,
    get_daily_trend, get_category_distribution,
    get_time_spent_trend, get_team_productivity,
    get_user_task_count, get_calendar_data,
    get_weekly_summary, get_monthly_summary
)
from email_service import (
    send_weekly_email,
    send_monthly_email,
    send_team_summary
)
from anomalies import analyze_anomalies
from recommendations import generate_recommendations
from styles import apply_page_style, section_header, divider


# ----------------------------------------------------------
# INITIAL SETUP
# ----------------------------------------------------------
init_db()
init_session()
apply_page_style()

if "page" not in st.session_state:
    st.session_state.page = "login"


# ----------------------------------------------------------
# LOGIN PAGE
# ----------------------------------------------------------
def login_page():
    st.markdown("<h1 class='big-title'>WorkSense Login</h1>", unsafe_allow_html=True)
    login()

    if st.button("Create New Account", key="create_acc"):
        st.session_state.page = "register"
        st.rerun()


# ----------------------------------------------------------
# REGISTER PAGE
# ----------------------------------------------------------
def register_page():
    st.markdown("<h1 class='big-title'>Create Your Account</h1>", unsafe_allow_html=True)
    register()

    if st.button("Back to Login", key="back_to_login"):
        st.session_state.page = "login"
        st.rerun()


# ----------------------------------------------------------
# EMPLOYEE DASHBOARD
# ----------------------------------------------------------
def employee_dashboard():

    st.sidebar.title(f"Welcome, {st.session_state.username}")

    if st.sidebar.button("Logout", key="logout_emp"):
        logout()

    section_header("📊 Your Productivity Dashboard")

    user_tasks = view_user_tasks(st.session_state.user_id)

    if user_tasks is not None and not user_tasks.empty:
        df = user_tasks

        # ------------------------------------------------------
        # AUTO EMAIL TRIGGERS
        # ------------------------------------------------------
        today = datetime.date.today()

        # Weekly auto email - Monday
        if today.weekday() == 0:
            if st.session_state.last_weekly_sent != today:
                weekly = get_weekly_summary(df)
                send_weekly_email(st.session_state.email, st.session_state.username, weekly)
                st.session_state.last_weekly_sent = today

        # Monthly auto email - 1st day
        if today.day == 1:
            if st.session_state.last_monthly_sent != today:
                monthly = get_monthly_summary(df)
                send_monthly_email(st.session_state.email, st.session_state.username, monthly)
                st.session_state.last_monthly_sent = today

        # ------------------------------------------------------
        # KPIs
        # ------------------------------------------------------
        kpis = generate_kpis(df)
        score = calculate_productivity_score(df)

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Tasks", kpis["total_tasks"])
        c2.metric("Completed", kpis["completed_tasks"])
        c3.metric("Avg Time", f"{kpis['avg_time']} mins")
        c4.metric("Score", score)

        divider()

        # ------------------------------------------------------
        # DAILY TREND
        # ------------------------------------------------------
        section_header("📈 Daily Task Trend")
        daily = get_daily_trend(df)
        if not daily.empty:
            st.line_chart(daily.set_index("date"))

        # ------------------------------------------------------
        # CATEGORY BREAKDOWN
        # ------------------------------------------------------
        section_header("📊 Category Breakdown")
        cat = get_category_distribution(df)
        if not cat.empty:
            st.bar_chart(cat.set_index("category"))

        # ------------------------------------------------------
        # TIME SPENT TREND
        # ------------------------------------------------------
        section_header("⏳ Time Spent Trend")
        ts = get_time_spent_trend(df)
        if not ts.empty:
            st.area_chart(ts.set_index("date"))

        divider()

        # ------------------------------------------------------
        # CALENDAR HEATMAP
        # ------------------------------------------------------
        section_header("📅 Productivity Calendar")
        try:
            import calplot
            cal_data = get_calendar_data(df)
            fig = calplot.calplot(cal_data, how="sum", cmap="Blues")
            st.pyplot(fig)

        except Exception:
            section_header("📅 Calendar (Fallback)")
            cal_data = get_calendar_data(df)

            if not cal_data.empty:
                temp = cal_data.reset_index()
                temp["date"] = pd.to_datetime(temp["date"])
                temp["day"] = temp["date"].dt.day
                temp["month"] = temp["date"].dt.month

                pivot = temp.pivot(index="month", columns="day", values="count")
                st.dataframe(pivot)

        divider()

        # ------------------------------------------------------
        # WEEKLY SUMMARY
        # ------------------------------------------------------
        section_header("📆 Weekly Summary")
        weekly = get_weekly_summary(df)

        w1, w2, w3, w4, w5 = st.columns(5)
        w1.metric("Tasks", weekly["week_tasks"])
        w2.metric("Completed", weekly["week_completed"])
        w3.metric("Avg Time", f"{weekly['week_avg_time']} mins")
        w4.metric("Total Time", f"{weekly['week_total_time']} mins")
        w5.metric("Week Score", weekly["week_score"])

        if not weekly["df"].empty:
            st.line_chart(weekly["df"].set_index("date")["time_spent"])

        divider()

        # ------------------------------------------------------
        # MONTHLY SUMMARY
        # ------------------------------------------------------
        section_header("📅 Monthly Insights")
        monthly = get_monthly_summary(df)

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Tasks", monthly["month_tasks"])
        m2.metric("Completed", monthly["month_completed"])
        m3.metric("Avg Time", f"{monthly['month_avg_time']} mins")
        m4.metric("Total Time", f"{monthly['month_total_time']} mins")

        if not monthly["trend_df"].empty:
            st.line_chart(monthly["trend_df"].set_index("date"))

        st.info(monthly["insight"])

        divider()

        # ------------------------------------------------------
        # RECOMMENDATIONS
        # ------------------------------------------------------
        section_header("🧠 Smart Recommendations")
        anomalies = analyze_anomalies(df)
        recs = generate_recommendations(df, anomalies)

        for r in recs:
            st.success(r)

        # ------------------------------------------------------
        # MANUAL EMAIL BUTTONS
        # ------------------------------------------------------
        section_header("📧 Email Reports")

        cA, cB = st.columns(2)

        if cA.button("Send Weekly Email", key="email_week"):
            send_weekly_email(st.session_state.email, st.session_state.username, weekly)

        if cB.button("Send Monthly Email", key="email_month"):
            send_monthly_email(st.session_state.email, st.session_state.username, monthly)

    # ------------------------------------------------------
    # Add Tasks
    # ------------------------------------------------------
    section_header("➕ Add New Task")
    add_task_form(st.session_state.user_id)

    section_header("📤 Upload Tasks")
    upload_tasks_csv(st.session_state.user_id)



# ----------------------------------------------------------
# MANAGER DASHBOARD
# ----------------------------------------------------------
def manager_dashboard():

    st.sidebar.title(f"Manager: {st.session_state.username}")

    if st.sidebar.button("Logout", key="logout_mgr"):
        logout()

    section_header("👥 Team Productivity Overview")

    all_tasks = manager_view_all_tasks()

    if all_tasks is None or all_tasks.empty:
        return

    df = all_tasks

    # ------------------------------------------------------
    # AUTO WEEKLY TEAM EMAIL
    # ------------------------------------------------------
    today = datetime.date.today()
    if today.weekday() == 0:
        if st.session_state.last_weekly_sent != today:
            send_team_summary(st.session_state.email, st.session_state.username, df)
            st.session_state.last_weekly_sent = today

    # ------------------------------------------------------
    # MANUAL SEND BUTTON
    # ------------------------------------------------------
    section_header("📧 Team Email Reports")
    if st.button("Send Team Summary Email", key="send_team"):
        send_team_summary(st.session_state.email, st.session_state.username, df)

    # ------------------------------------------------------
    # TEAM KPIs
    # ------------------------------------------------------
    team_prod = get_team_productivity(df)
    task_count = get_user_task_count(df)

    c1, c2 = st.columns(2)
    c1.metric("Total Tasks", len(df))
    c2.metric("Team Members", len(df["username"].unique()))

    divider()

    # ------------------------------------------------------
    # CHARTS
    # ------------------------------------------------------
    section_header("User-wise Task Count")
    if not task_count.empty:
        st.bar_chart(task_count.set_index("username"))

    section_header("User-wise Time Spent")
    if not team_prod.empty:
        st.bar_chart(team_prod.set_index("username"))

    divider()

    # ------------------------------------------------------
    # ALERTS
    # ------------------------------------------------------
    section_header("⚠ Team Alerts")
    team_alerts = analyze_anomalies(df, is_manager=True, all_tasks_df=df)
    for a in team_alerts:
        st.warning(a)

    divider()

    # ------------------------------------------------------
    # MANAGER RECOMMENDATIONS
    # ------------------------------------------------------
    section_header("🧠 Manager Recommendations")
    recs = generate_recommendations(df, team_alerts)

    for r in recs:
        st.info(r)



# ----------------------------------------------------------
# ROUTER
# ----------------------------------------------------------
def load_page():
    if st.session_state.page == "login":
        login_page()

    elif st.session_state.page == "register":
        register_page()

    elif st.session_state.page == "employee":
        employee_dashboard()

    elif st.session_state.page == "manager":
        manager_dashboard()



# ----------------------------------------------------------
# RUN APPLICATION
# ----------------------------------------------------------
if st.session_state.logged_in:
    st.session_state.page = st.session_state.role

load_page()