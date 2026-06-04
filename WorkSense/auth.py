import streamlit as st
from database import add_user, get_user

# -------------------------------
# SESSION STATE HANDLING
# -------------------------------
def init_session():
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "user_id" not in st.session_state:
        st.session_state.user_id = None
    if "role" not in st.session_state:
        st.session_state.role = None
    if "username" not in st.session_state:
        st.session_state.username = None


# -------------------------------
# LOGIN FUNCTION
# -------------------------------
def login():
    st.title("🔐 WorkSense Login")

    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    if st.button("Login"):
        user = get_user(username, password)

        if user:
            st.session_state.logged_in = True
            st.session_state.user_id = user[0]
            st.session_state.username = user[1]
            st.session_state.role = user[3]

            st.success(f"Welcome {username}!")
            st.rerun()
        else:
            st.error("Invalid credentials. Try again.")


# -------------------------------
# REGISTRATION FUNCTION
# -------------------------------
def register():
    st.title("📝 Create Account")

    username = st.text_input("Choose a Username")
    password = st.text_input("Choose a Password", type="password")
    role = st.selectbox("Select Role", ["employee", "manager"])

    if st.button("Create Account"):
        try:
            add_user(username, password, role)
            st.success("Account created successfully! Please login.")
        except:
            st.error("Username already exists. Try another one.")


# -------------------------------
# LOGOUT FUNCTION
# -------------------------------
def logout():
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.username = None
    st.session_state.role = None
    st.rerun()