import pandas as pd

def clean_data(df):
    # Standardize column names
    df.columns = df.columns.str.lower().str.replace(" ", "_")

    # Remove duplicates
    df = df.drop_duplicates()

    # Fill missing values
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            df[col].fillna(df[col].mean(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)

    return df