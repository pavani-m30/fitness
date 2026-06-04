def generate_insights(df):
    insights = []

    # ✅ DEFINE columns FIRST (this was missing)
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object']).columns

    # 1. Mean insights
    for col in numeric_cols:
        avg = df[col].mean()
        insights.append(f"Average {col} is {avg:.2f}")

    # 2. Trend check
    for col in numeric_cols:
        if len(df[col]) > 1:
            if df[col].iloc[-1] < df[col].iloc[0]:
                insights.append(f"Decline detected in {col}")
            else:
                insights.append(f"Growth trend detected in {col}")

    # 3. Category dominance
    for col in categorical_cols:
        distribution = df[col].value_counts(normalize=True)
        if not distribution.empty and distribution.max() > 0.5:
            top_category = distribution.idxmax()
            percent = distribution.max() * 100
            insights.append(
                f"High concentration in {col}: '{top_category}' contributes {percent:.1f}%"
            )

    # 4. Correlation
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
        for i in range(len(corr.columns)):
            for j in range(i + 1, len(corr.columns)):
                value = corr.iloc[i, j]
                if abs(value) > 0.7:
                    insights.append(
                        f"Strong correlation ({value:.2f}) between {corr.columns[i]} and {corr.columns[j]}"
                    )

    return insights