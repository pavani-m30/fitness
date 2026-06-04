import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function MonthlyGraph({ data }) {
  if (!data || data.length === 0) {
    return <p>No graph data available</p>;
  }

  const labels = data.map((item) => item.month);
  const incomeData = data.map((item) => item.income);
  const expenseData = data.map((item) => item.expenses);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Income",
        backgroundColor: "rgba(0, 200, 0, 0.7)",
        data: incomeData,
      },
      {
        label: "Expenses",
        backgroundColor: "rgba(255, 0, 0, 0.7)",
        data: expenseData,
      },
    ],
  };

  return (
    <div style={{ width: "90%", maxWidth: "600px", margin: "auto" }}>
      <Bar data={chartData} />
    </div>
  );
}

export default MonthlyGraph;