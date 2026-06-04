import streamlit as st

# ---------------------------------------------------
# GLOBAL THEME COLORS
# ---------------------------------------------------
PRIMARY = "#4B7BEC"
SECONDARY = "#A5B1C2"
SUCCESS = "#2ecc71"
WARNING = "#f1c40f"
DANGER = "#e74c3c"
BACKGROUND = "#F5F7FA"


# ---------------------------------------------------
# APPLY PAGE-WIDE CUSTOM STYLE
# ---------------------------------------------------
def apply_page_style():
    st.markdown(f"""
        <style>
            /* Background color */
            .reportview-container {{
                background-color: {BACKGROUND};
            }}
            
            /* Sidebar styling */
            .sidebar .sidebar-content {{
                background-color: white;
            }}

            /* Titles */
            h1, h2, h3, h4 {{
                font-family: "Segoe UI", sans-serif;
            }}

            .big-title {{
                font-size: 32px !important;
                font-weight: 700 !important;
                color: {PRIMARY} !important;
            }}

            /* Card Shadow & Padding */
            .card {{
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin-bottom: 15px;
            }}

            /* KPI Number style */
            .kpi-value {{
                font-size: 28px;
                font-weight: bold;
            }}
        </style>
    """, unsafe_allow_html=True)


# ---------------------------------------------------
# KPI CARD COMPONENT
# ---------------------------------------------------
def kpi_card(title, value, color=PRIMARY):
    st.markdown(f"""
        <div class="card" style="border-left: 6px solid {color};">
            <div style="color:{SECONDARY}; font-size:14px;">{title}</div>
            <div class="kpi-value" style="color:{color};">{value}</div>
        </div>
    """, unsafe_allow_html=True)


# ---------------------------------------------------
# SECTION HEADER
# ---------------------------------------------------
def section_header(title):
    st.markdown(f"""
        <h2 style='padding-top: 10px; color:{PRIMARY}; font-weight:600;'>{title}</h2>
        <hr style='margin-top:-10px; border: 1px solid {SECONDARY};'>
    """, unsafe_allow_html=True)


# ---------------------------------------------------
# SUBTITLE
# ---------------------------------------------------
def subtitle(text):
    st.markdown(f"""
        <h4 style='color:{SECONDARY}; font-weight:500;'>{text}</h4>
    """, unsafe_allow_html=True)


# ---------------------------------------------------
# DIVIDER LINE
# ---------------------------------------------------
def divider():
    st.markdown("<hr>", unsafe_allow_html=True)