import streamlit as st
from database import add_user, get_user

# ---------------------------------------------------------
# SESSION INITIALIZATION
# ---------------------------------------------------------
def init_session():
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "user_id" not in st.session_state:
        st.session_state.user_id = None
    if "username" not in st.session_state:
        st.session_state.username = None
    if "email" not in st.session_state:
        st.session_state.email = None
    if "role" not in st.session_state:
        st.session_state.role = None
    if "page" not in st.session_state:
        st.session_state.page = "login"

    # for auto-email scheduling
    if "last_weekly_sent" not in st.session_state:
        st.session_state.last_weekly_sent = None
    if "last_monthly_sent" not in st.session_state:
        st.session_state.last_monthly_sent = None


# ---------------------------------------------------------
# LOGIN FUNCTION
# ---------------------------------------------------------
def login():
    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    if st.button("Login", key="login_btn"):
        user = get_user(username, password)

        if user:
            st.session_state.logged_in = True
            st.session_state.user_id = user[0]
            st.session_state.username = user[1]
            st.session_state.email = user[3]
            st.session_state.role = user[4]
            st.session_state.page = st.session_state.role
            st.rerun()
        else:
            st.error("Invalid username or password.")


# ---------------------------------------------------------
# REGISTER FUNCTION
# ---------------------------------------------------------
def register():
    username = st.text_input("Choose a Username", key="reg_username")
    email = st.text_input("Email Address", key="reg_email")
    password = st.text_input("Choose a Password", type="password", key="reg_password")
    role = st.selectbox("Select Role", ["employee", "manager"], key="reg_role")

    if st.button("Create Account", key="reg_create_btn"):
        if username.strip() == "" or password.strip() == "" or email.strip() == "":
            st.error("All fields are required.")
        else:
            try:
                add_user(username, password, email, role)
                st.success("Account created successfully! Please login.")
            except:
                st.error("Username already exists.")

    if st.button("Back to Login", key="reg_back_btn"):
        st.session_state.page = "login"
        st.rerun()


# ---------------------------------------------------------
# LOGOUT FUNCTION
# ---------------------------------------------------------
def logout():
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.username = None
    st.session_state.email = None
    st.session_state.role = None
    st.session_state.page = "login"
    st.rerun()