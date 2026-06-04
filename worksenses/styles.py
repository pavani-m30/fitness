import streamlit as st

# ---------------------------------------------------------
# GLOBAL THEME COLORS
# ---------------------------------------------------------
PRIMARY = "#4B7BEC"
SECONDARY = "#778CA3"
SUCCESS = "#20bf6b"
WARNING = "#f7b731"
DANGER = "#eb3b5a"
BACKGROUND = "#F5F7FA"


# ---------------------------------------------------------
# APPLY PAGE STYLING
# ---------------------------------------------------------
def apply_page_style():
    st.markdown(f"""
        <style>
            /* Page Background */
            .main {{
                background-color: {BACKGROUND};
            }}

            /* Sidebar Style */
            .css-1d391kg, .css-1lcbmhc {{
                background-color: white !important;
            }}

            h1, h2, h3, h4 {{
                font-family: 'Segoe UI', sans-serif !important;
            }}

            .big-title {{
                font-size: 32px !important;
                font-weight: 700;
                color: {PRIMARY};
                margin-bottom: 10px;
            }}

            .section-header {{
                color: {PRIMARY};
                font-size: 24px;
                font-weight: 600;
                margin-top: 25px;
            }}

            .card {{
                background: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }}

            .metric-value {{
                font-size: 32px;
                font-weight: 700;
                color: {PRIMARY};
            }}

        </style>
    """, unsafe_allow_html=True)


# ---------------------------------------------------------
# SECTION HEADER
# ---------------------------------------------------------
def section_header(title):
    st.markdown(f"<div class='section-header'>{title}</div>", unsafe_allow_html=True)


# ---------------------------------------------------------
# DIVIDER
# ---------------------------------------------------------
def divider():
    st.markdown("<hr style='margin:15px 0;'>", unsafe_allow_html=True)