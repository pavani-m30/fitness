import streamlit as st
import pandas as pd

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
from anomalies import analyze_anomalies
from recommendations import generate_recommendations
from styles import apply_page_style, section_header, divider


# ----------------------------------------------------------------
# INITIALIZATION
# ----------------------------------------------------------------
init_db()
init_session()
apply_page_style()

if "page" not in st.session_state:
    st.session_state.page = "login"


# ----------------------------------------------------------------
# LOGIN PAGE
# ----------------------------------------------------------------
def login_page():
    st.markdown("<h1 class='big-title'>WorkSense Login</h1>", unsafe_allow_html=True)
    login()

    if st.button("Create New Account"):
        st.session_state.page = "register"
        st.rerun()


# ----------------------------------------------------------------
# REGISTER PAGE
# ----------------------------------------------------------------
def register_page():
    st.markdown("<h1 class='big-title'>Create Your Account</h1>", unsafe_allow_html=True)
    register()

    if st.button("Back to Login"):
        st.session_state.page = "login"
        st.rerun()


# ----------------------------------------------------------------
# EMPLOYEE DASHBOARD
# ----------------------------------------------------------------
def employee_dashboard():
    st.sidebar.title(f"Welcome, {st.session_state.username}")
    if st.sidebar.button("Logout"):
        logout()

    section_header("📊 Your Productivity Dashboard")

    user_tasks = view_user_tasks(st.session_state.user_id)

    if user_tasks is not None and not user_tasks.empty:
        df = user_tasks

        # --------------------------------------------------
        # KPI METRICS
        # --------------------------------------------------
        kpis = generate_kpis(df)
        score = calculate_productivity_score(df)

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Tasks", kpis["total_tasks"])
        col2.metric("Completed", kpis["completed_tasks"])
        col3.metric("Avg Time", f"{kpis['avg_time']} mins")
        col4.metric("Score", score)

        divider()

        # --------------------------------------------------
        # DAILY TREND
        # --------------------------------------------------
        section_header("📈 Daily Task Trend")
        daily_trend = get_daily_trend(df)
        if not daily_trend.empty:
            st.line_chart(daily_trend.set_index("date"))

        # --------------------------------------------------
        # CATEGORY BREAKDOWN
        # --------------------------------------------------
        section_header("📊 Category Breakdown")
        category_df = get_category_distribution(df)
        if not category_df.empty:
            st.bar_chart(category_df.set_index("category"))

        # --------------------------------------------------
        # TIME SPENT TREND
        # --------------------------------------------------
        section_header("⏳ Time Spent Trend")
        time_trend = get_time_spent_trend(df)
        if not time_trend.empty:
            st.area_chart(time_trend.set_index("date"))

        divider()

        # --------------------------------------------------
        # PRODUCTIVITY CALENDAR
        # --------------------------------------------------
        section_header("📅 Productivity Calendar")

        try:
            import calplot
            cal_data = get_calendar_data(df)

            if not cal_data.empty:
                fig = calplot.calplot(cal_data, how="sum", cmap="Blues")
                st.pyplot(fig)

        except Exception:
            section_header("📅 Productivity Calendar (Fallback View)")
            st.info("Heatmap module not installed. Showing fallback grid.")

            cal_data = get_calendar_data(df)
            if not cal_data.empty:
                temp_df = cal_data.reset_index()
                temp_df["date"] = pd.to_datetime(temp_df["date"])
                temp_df["day"] = temp_df["date"].dt.day
                temp_df["month"] = temp_df["date"].dt.month

                pivot_df = temp_df.pivot(index="month", columns="day", values="count")
                st.dataframe(pivot_df)

        divider()

        # --------------------------------------------------
        # WEEKLY SUMMARY
        # --------------------------------------------------
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

        # --------------------------------------------------
        # MONTHLY SUMMARY
        # --------------------------------------------------
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

        # --------------------------------------------------
        # SMART RECOMMENDATIONS
        # --------------------------------------------------
        section_header("🧠 Smart Recommendations")

        anomalies = analyze_anomalies(df)
        recs = generate_recommendations(df, anomalies)

        for r in recs:
            st.success(r)

    # --------------------------------------------------
    # ADD NEW TASK
    # --------------------------------------------------
    section_header("➕ Add New Task")
    add_task_form(st.session_state.user_id)

    # --------------------------------------------------
    # BULK UPLOAD
    # --------------------------------------------------
    section_header("📤 Upload Tasks")
    upload_tasks_csv(st.session_state.user_id)


# ----------------------------------------------------------------
# MANAGER DASHBOARD
# ----------------------------------------------------------------
def manager_dashboard():
    st.sidebar.title(f"Manager: {st.session_state.username}")
    if st.sidebar.button("Logout"):
        logout()

    section_header("👥 Team Productivity Overview")

    all_tasks = manager_view_all_tasks()

    if all_tasks is not None and not all_tasks.empty:
        df = all_tasks

        team_df = get_team_productivity(df)
        task_count = get_user_task_count(df)

        col1, col2 = st.columns(2)
        col1.metric("Total Tasks", len(df))
        col2.metric("Team Members", len(df["username"].unique()))

        divider()

        section_header("User-wise Task Count")
        if not task_count.empty:
            st.bar_chart(task_count.set_index("username"))

        section_header("User-wise Time Spent")
        if not team_df.empty:
            st.bar_chart(team_df.set_index("username"))

        section_header("Team Alerts")
        team_anomalies = analyze_anomalies(df, is_manager=True, all_tasks_df=df)
        for a in team_anomalies:
            st.warning(a)

        section_header("Manager Recommendations")
        recs = generate_recommendations(df, team_anomalies)
        for r in recs:
            st.info(r)


# ----------------------------------------------------------------
# PAGE ROUTING
# ----------------------------------------------------------------
def load_page():
    if st.session_state.page == "login":
        login_page()
    elif st.session_state.page == "register":
        register_page()
    elif st.session_state.page == "employee":
        employee_dashboard()
    elif st.session_state.page == "manager":
        manager_dashboard()


# ----------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------
if st.session_state.logged_in:
    st.session_state.page = st.session_state.role

load_page()