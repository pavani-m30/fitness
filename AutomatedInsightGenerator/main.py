import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from utils import clean_data
from insight_engine import generate_insights

st.set_page_config(page_title="Automated Insight Generator", layout="wide")

st.title("📊 Automated Insight Generator")

# Upload file
uploaded_file = st.file_uploader("Upload CSV or Excel file", type=["csv", "xlsx"])

if uploaded_file:
    # Load data
    if uploaded_file.name.endswith(".csv"):
        df = pd.read_csv(uploaded_file)
    else:
        df = pd.read_excel(uploaded_file)

    st.subheader("🔍 Raw Data Preview")
    st.dataframe(df.head())

    # Clean data
    df_clean = clean_data(df)

    st.subheader("✅ Cleaned Data")
    st.dataframe(df_clean.head())

    # Identify columns
    numeric_cols = df_clean.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df_clean.select_dtypes(include=['object']).columns

    # KPIs
    st.subheader("📌 Key Metrics")
    col1, col2, col3 = st.columns(3)
    col1.metric("Rows", len(df_clean))
    col2.metric("Columns", len(df_clean.columns))
    col3.metric("Numeric Columns", len(numeric_cols))

    # Insights
    st.subheader("🧠 Automated Insights")
    insights = generate_insights(df_clean)

    for insight in insights:
        st.success(insight)

    # Visualizations
    st.subheader("📊 Visualizations")

    # Bar Chart
    if len(categorical_cols) > 0:
        cat_col = categorical_cols[0]
        st.write(f"Distribution of {cat_col}")
        st.bar_chart(df_clean[cat_col].value_counts())

    # Line Chart
    if len(numeric_cols) > 0:
        num_col = numeric_cols[0]
        st.line_chart(df_clean[num_col])

    # Correlation Heatmap
    if len(numeric_cols) > 1:
        st.write("Correlation Heatmap")
        fig, ax = plt.subplots()
        sns.heatmap(df_clean[numeric_cols].corr(), annot=True, cmap="coolwarm", ax=ax)
        st.pyplot(fig)