import { jsPDF } from "jspdf";

export function generateInvoicePDFBuffer(
  appointmentId: string,
  clientName: string,
  clientEmail: string,
  providerName: string,
  serviceTitle: string,
  price: number,
  date: Date
): Buffer {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("ServiceHub", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Official Invoice / Receipt", 14, 30);

  // Invoice Details
  doc.text(`Invoice Number: SH-${appointmentId.slice(-8).toUpperCase()}`, 140, 22);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 140, 28);

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 35, 196, 35);

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Billed To:", 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(clientName || "Valued Client", 14, 52);
  doc.text(clientEmail, 14, 57);

  // Bill From
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Service Provided By:", 140, 45);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(providerName || "ServiceHub Provider", 140, 52);

  // Line Items Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 70, 182, 10, "F");

  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Description", 20, 77);
  doc.text("Date of Service", 100, 77);
  doc.text("Total", 170, 77);

  // Line Item
  doc.setTextColor(80, 80, 80);
  doc.text(serviceTitle, 20, 90);
  doc.text(date.toLocaleDateString(), 100, 90);
  doc.text(`$${price.toFixed(2)}`, 170, 90);

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 100, 196, 100);

  // Total
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Amount Paid:", 120, 115);
  doc.text(`$${price.toFixed(2)}`, 170, 115);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for using ServiceHub! If you have any questions, please contact support.", 14, 280);

  // Extract raw PDF data as ArrayBuffer to attach to email SDK
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
