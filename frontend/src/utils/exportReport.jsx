import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportFinancePDF = (monthly, yearly, categoryData) => {
  const pdf = new jsPDF();

  const format = (val) => Number(val || 0).toLocaleString("en-IN");

  // 🔷 LOGO BOX (AI)
  pdf.setFillColor(50, 95, 215); // gradient substitute (blue)
  pdf.roundedRect(14, 10, 10, 10, 2, 2, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text("AI", 17, 16);

  // 🔤 APP NAME
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text("AI Invest", 28, 16);

  // 🧾 Title
  pdf.setFontSize(18);
  pdf.text("Finance Report", 14, 30);

  pdf.setFontSize(11);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

  // 📊 MONTHLY
  const monthlyTable = monthly.map((m) => [
    m.month,
    "Rs. " + format(m.income),
    "Rs. " + format(m.expense),
    "Rs. " + format(m.savings)
  ]);

  autoTable(pdf, {
    startY: 45,
    head: [["Month", "Income", "Expense", "Savings"]],
    body: monthlyTable,
  });

  // 📊 YEARLY
  const yearlyTable = yearly.map((y) => [
    y.year,
    "Rs. " + format(y.amount)
  ]);

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [["Year", "Total"]],
    body: yearlyTable,
  });

  // 🥧 CATEGORY
  const categoryTable = categoryData.map((c) => [
    c.name,
    "Rs. " + format(c.value)
  ]);

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [["Category", "Amount"]],
    body: categoryTable,
  });

  // 📝 Footer
  pdf.setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(
    "This is a computer generated receipt and does not require signature",
    14,
    pdf.lastAutoTable.finalY + 15
  );

  pdf.save("finance-report.pdf");
};