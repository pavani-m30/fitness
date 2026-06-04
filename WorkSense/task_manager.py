import streamlit as st
import pandas as pd
from database import add_task, get_user_tasks, get_all_tasks, delete_task, update_task


# ---------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------
def validate_task_data(task_name, time_spent):
    if not task_name or len(task_name.strip()) == 0:
        return False
    if time_spent is None or time_spent <= 0:
        return False
    return True


# ---------------------------------------------------------
# ADD NEW TASK
# ---------------------------------------------------------
def add_task_form(user_id):
    st.subheader("➕ Add New Task")

    task_name = st.text_input("Task Name")
    category = st.selectbox(
        "Category",
        ["Coding", "Meeting", "Documentation", "Email", "Support", "Other"]
    )
    time_spent = st.number_input("Time Spent (minutes)", min_value=1, step=1)
    status = st.selectbox("Status", ["Completed", "Pending"])
    date = st.date_input("Date")

    if st.button("Add Task"):
        if validate_task_data(task_name, time_spent):
            add_task(user_id, task_name, category, time_spent, status, str(date))
            st.success("Task added successfully!")
            st.rerun()
        else:
            st.error("Invalid task data")


# ---------------------------------------------------------
# EDIT TASK
# ---------------------------------------------------------
def edit_task_form(task_row):
    task_id = task_row["task_id"]

    with st.expander(f"✏️ Edit Task {task_id}", expanded=False):

        new_name = st.text_input(
            "Task Name",
            value=task_row["task_name"],
            key=f"name_{task_id}"
        )

        categories = ["Coding", "Meeting", "Documentation", "Email", "Support", "Other"]

        try:
            cat_index = categories.index(task_row["category"])
        except:
            cat_index = 5

        new_cat = st.selectbox(
            "Category",
            categories,
            index=cat_index,
            key=f"cat_{task_id}"
        )

        new_time = st.number_input(
            "Time Spent (minutes)",
            value=int(task_row["time_spent"]),
            min_value=1,
            key=f"time_{task_id}"
        )

        new_status = st.selectbox(
            "Status",
            ["Completed", "Pending"],
            index=0 if task_row["status"] == "Completed" else 1,
            key=f"status_{task_id}"
        )

        new_date = st.date_input(
            "Date",
            value=pd.to_datetime(task_row["date"]).date(),
            key=f"date_{task_id}"
        )

        if st.button(f"Save Changes for Task {task_id}", key=f"save_{task_id}"):
            update_task(
                task_id,
                new_name,
                new_cat,
                int(new_time),
                new_status,
                str(new_date)
            )
            st.success(f"Task {task_id} updated successfully!")
            st.rerun()
# ---------------------------------------------------------
# DELETE TASK
# ---------------------------------------------------------
def delete_task_button(task_row):
    task_id = task_row["task_id"]

    if st.button(f"🗑 Delete Task {task_id}"):
        delete_task(task_id)
        st.success(f"Task {task_id} deleted successfully!")
        st.rerun()


# ---------------------------------------------------------
# VIEW USER TASKS (WITH FILTERS + EDIT + DELETE)
# ---------------------------------------------------------
def view_user_tasks(user_id):
    st.subheader("📋 Your Tasks")

    tasks = get_user_tasks(user_id)

    if not tasks:
        st.info("No tasks found.")
        return None

    df = pd.DataFrame(
        tasks,
        columns=[
            "task_id", "user_id", "task_name", "category",
            "time_spent", "status", "date"
        ]
    )

    # Show table
    st.dataframe(df)

    # -----------------------------
    # Select ONE task to edit/delete
    # -----------------------------
    st.subheader("✏️ Edit / Delete a Task")

    task_list = df["task_id"].tolist()
    selected_id = st.selectbox("Choose a task ID", task_list, key="select_task_id")

    # Get selected row
    row = df[df["task_id"] == selected_id].iloc[0]

    # -------------- EDIT FORM --------------
    st.write("### Edit Task")
    with st.form(key=f"edit_form_{selected_id}"):

        new_name = st.text_input("Task Name", value=row["task_name"])
        new_cat = st.selectbox(
            "Category",
            ["Coding", "Meeting", "Documentation", "Email", "Support", "Other"],
            index=["Coding","Meeting","Documentation","Email","Support","Other"].index(row["category"])
            if row["category"] in ["Coding","Meeting","Documentation","Email","Support","Other"]
            else 5
        )
        new_time = st.number_input(
            "Time Spent (minutes)", min_value=1, value=int(row["time_spent"])
        )
        new_status = st.selectbox(
            "Status",
            ["Completed", "Pending"],
            index=0 if row["status"] == "Completed" else 1
        )
        new_date = st.date_input("Date", value=pd.to_datetime(row["date"]).date())

        submitted = st.form_submit_button("Save Changes")

        if submitted:
            update_task(
                selected_id,
                new_name,
                new_cat,
                int(new_time),
                new_status,
                str(new_date)
            )
            st.success("Task updated successfully!")
            st.rerun()

    # -------------- DELETE BUTTON --------------
    if st.button("🗑 Delete This Task", key=f"delete_task_{selected_id}"):
        delete_task(selected_id)
        st.success("Task deleted successfully!")
        st.rerun()

    return df

# ---------------------------------------------------------
# BULK UPLOAD (CSV)
# ---------------------------------------------------------
# ---------------------------------------------------------
# BULK UPLOAD (CSV / EXCEL)
# ---------------------------------------------------------
def upload_tasks_csv(user_id):
    st.subheader("📤 Upload Tasks (CSV / Excel)")

    file = st.file_uploader("Upload CSV or Excel file", type=["csv", "xlsx"])

    if file:
        # Load file
        if file.name.endswith(".csv"):
            df = pd.read_csv(file)
        elif file.name.endswith(".xlsx"):
            df = pd.read_excel(file)
        else:
            st.error("Unsupported file format.")
            return

        # Auto-fix column names
        df = fix_column_names(df)

        required_cols = {"task_name", "category", "time_spent", "status", "date"}
        missing = required_cols - set(df.columns)

        if missing:
            st.error(f"❌ Missing required columns: {', '.join(missing)}")
            st.info(f"Columns available: {', '.join(df.columns)}")
            return

        # Insert into DB
        for _, row in df.iterrows():
            add_task(
                user_id,
                row["task_name"],
                row["category"],
                int(row["time_spent"]) if not pd.isna(row["time_spent"]) else 0,
                row["status"],
                str(row["date"])
            )

        st.success("Tasks uploaded successfully!")
        st.rerun()
# ---------------------------------------------------------
# MANAGER VIEW
# ---------------------------------------------------------
def manager_view_all_tasks():
    st.subheader("👥 Team Task Overview")

    tasks = get_all_tasks()

    if not tasks:
        st.info("No tasks available.")
        return None

    df = pd.DataFrame(tasks, columns=[
        "task_id", "user_id", "task_name", "category",
        "time_spent", "status", "date", "username"
    ])

    st.dataframe(df)
    return df