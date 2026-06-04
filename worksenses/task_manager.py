import streamlit as st
import pandas as pd
from database import add_task, get_user_tasks, get_all_tasks, delete_task, update_task
from utils import validate_task_data, clean_uploaded_df
import datetime


# ---------------------------------------------------------
# ADD NEW TASK
# ---------------------------------------------------------
def add_task_form(user_id):
    st.subheader("➕ Add New Task")

    task_name = st.text_input("Task Name")
    category = st.selectbox("Category", 
                            ["Coding", "Meeting", "Documentation", "Email", "Support", "Other"])
    time_spent = st.number_input("Time Spent (minutes)", min_value=1, step=1)
    status = st.selectbox("Status", ["Completed", "Pending"])
    date = st.date_input("Date", datetime.date.today())

    if st.button("Add Task"):
        if validate_task_data(task_name, time_spent):
            add_task(user_id, task_name, category, time_spent, status, str(date))
            st.success("Task added successfully!")
            st.rerun()
        else:
            st.error("Invalid task data. Please check your inputs.")


# ---------------------------------------------------------
# EDIT TASK (stable version with unique keys)
# ---------------------------------------------------------
def edit_task_form(task_row):
    task_id = task_row["task_id"]

    with st.expander(f"✏️ Edit Task {task_id}", expanded=False):
        new_name = st.text_input("Task Name", value=task_row["task_name"], key=f"name_{task_id}")

        categories = ["Coding", "Meeting", "Documentation", "Email", "Support", "Other"]
        try:
            cat_idx = categories.index(task_row["category"])
        except:
            cat_idx = 5

        new_cat = st.selectbox("Category", categories, index=cat_idx, key=f"cat_{task_id}")

        new_time = st.number_input("Time Spent (minutes)",
                                   value=int(task_row["time_spent"]),
                                   min_value=1, key=f"time_{task_id}")

        new_status = st.selectbox("Status", ["Completed", "Pending"],
                                  index=0 if task_row["status"] == "Completed" else 1,
                                  key=f"status_{task_id}")

        new_date = st.date_input("Date",
                                 value=pd.to_datetime(task_row["date"]).date(),
                                 key=f"date_{task_id}")

        if st.button(f"Save Changes for Task {task_id}", key=f"save_{task_id}"):
            update_task(task_id, new_name, new_cat, int(new_time), new_status, str(new_date))
            st.success("Task updated successfully!")
            st.rerun()


# ---------------------------------------------------------
# DELETE TASK
# ---------------------------------------------------------
def delete_task_button(task_row):
    task_id = task_row["task_id"]

    if st.button(f"🗑 Delete Task {task_id}", key=f"del_{task_id}"):
        delete_task(task_id)
        st.success(f"Task {task_id} deleted successfully!")
        st.rerun()


# ---------------------------------------------------------
# VIEW USER TASKS + FILTERS + EDIT + DELETE
# ---------------------------------------------------------
def view_user_tasks(user_id):

    tasks = get_user_tasks(user_id)
    if not tasks:
        st.info("No tasks found.")
        return None

    df = pd.DataFrame(tasks, columns=[
        "task_id", "user_id", "task_name", "category",
        "time_spent", "status", "date"
    ])

    # -----------------------------------------
    # FILTERS
    # -----------------------------------------
    st.subheader("🔎 Filter Tasks")

    col1, col2, col3, col4 = st.columns(4)

    # Date Filter
    dates = sorted(df["date"].unique())
    date_filter = col1.selectbox("Filter by Date", ["All"] + dates)

    # Category Filter
    categories = sorted(df["category"].unique())
    category_filter = col2.selectbox("Category", ["All"] + categories)

    # Status Filter
    status_filter = col3.selectbox("Status", ["All", "Completed", "Pending"])

    # Keyword Search
    keyword = col4.text_input("Search Task Name")

    filtered_df = df.copy()

    if date_filter != "All":
        filtered_df = filtered_df[filtered_df["date"] == date_filter]

    if category_filter != "All":
        filtered_df = filtered_df[filtered_df["category"] == category_filter]

    if status_filter != "All":
        filtered_df = filtered_df[filtered_df["status"] == status_filter]

    if keyword.strip():
        filtered_df = filtered_df[filtered_df["task_name"].str.contains(keyword, case=False)]

    st.dataframe(filtered_df)

    # -----------------------------------------
    # EDIT + DELETE ONLY FOR FILTERED ROW
    # -----------------------------------------
    st.subheader("✏️ Edit / Delete Task")

    # Select a task to edit/delete
    task_list = filtered_df["task_id"].tolist()
    if len(task_list) == 0:
        st.info("No matching tasks.")
        return df

    selected_id = st.selectbox("Choose Task ID", task_list, key="select_task")

    row = filtered_df[filtered_df["task_id"] == selected_id].iloc[0]

    # Edit form
    edit_task_form(row)

    # Delete button
    delete_task_button(row)

    return df


# ---------------------------------------------------------
# BULK UPLOAD (CSV / EXCEL)
# ---------------------------------------------------------
def upload_tasks_csv(user_id):
    st.subheader("📤 Upload Tasks (CSV / Excel)")

    file = st.file_uploader("Upload file", type=["csv", "xlsx"])

    if file:
        try:
            if file.name.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            df = clean_uploaded_df(df)

            required = ["task_name", "category", "time_spent", "status", "date"]

            if not set(required).issubset(df.columns):
                st.error("Missing required columns.")
                st.write("Present columns:", df.columns.tolist())
                return

            for _, row in df.iterrows():
                add_task(user_id,
                         row["task_name"],
                         row["category"],
                         int(row["time_spent"]),
                         row["status"],
                         str(row["date"]))

            st.success("Tasks uploaded successfully!")
            st.rerun()

        except Exception as e:
            st.error("Error while reading file.")
            st.write(str(e))


# ---------------------------------------------------------
# MANAGER VIEW — FULL TEAM TASK VIEW
# ---------------------------------------------------------
def manager_view_all_tasks():

    tasks = get_all_tasks()
    if not tasks:
        st.info("No tasks available.")
        return None

    df = pd.DataFrame(tasks, columns=[
        "task_id", "user_id", "task_name", "category",
        "time_spent", "status", "date", "username", "email"
    ])

    st.dataframe(df)

    return df