"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Upload } from "lucide-react";
import { useState } from "react";
import generatePDF, { usePDF } from "react-to-pdf";
import { toast } from "sonner";

export default function Home() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerEmail: "",
    items: [{ description: "", quantity: 1, price: 0 }],
  });
  const [isUploading, setIsUploading] = useState(false);

  const { toPDF, targetRef: pdfRef } = usePDF({
    filename: `invoice-${invoiceData.invoiceNumber || "draft"}.pdf`,
    method: "save",
    resolution: 2,
    page: {
      margin: 20,
      format: "letter",
    },
    canvas: {
      mimeType: "image/png",
      qualityRatio: 1,
    },
  });

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      // Generate PDF and convert to blob
      const pdf = await generatePDF(pdfRef, {
        method: "build",
        resolution: 2,
        page: { margin: 20, format: "letter" },
        canvas: { mimeType: "image/png", qualityRatio: 1 },
      });

      if (!pdf) {
        throw new Error("Failed to generate PDF");
      }

      // Convert jsPDF to Blob
      const pdfBlob = new Blob([pdf.output("blob")], {
        type: "application/pdf",
      });
      const fileName = `invoice-${
        invoiceData.invoiceNumber || "draft"
      }-${Date.now()}.pdf`;

      // Create File object from Blob
      const file = new File([pdfBlob], fileName, {
        type: "application/pdf",
        lastModified: Date.now(),
      });

      // Upload to R2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append(
        "metadata",
        JSON.stringify({
          customerName: invoiceData.customerName,
          customerEmail: invoiceData.customerEmail,
          invoiceNumber: invoiceData.invoiceNumber,
          date: invoiceData.date,
          total: calculateTotal(),
        })
      );

      console.log(formData);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      toast.success(`Invoice uploaded successfully)`);

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload invoice"
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Invoice Generator
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => toPDF()} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleUpload}
              className="gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload to R2"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={invoiceData.date}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={invoiceData.customerName}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={invoiceData.customerEmail}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerEmail: e.target.value,
                  })
                }
              />
            </div>
          </Card>

          <div ref={pdfRef} className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <div className="mt-4 text-gray-600">
                <p>Invoice #: {invoiceData.invoiceNumber}</p>
                <p>Date: {invoiceData.date}</p>
                <p>Customer: {invoiceData.customerName}</p>
                <p>Email: {invoiceData.customerEmail}</p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 text-right"
                        min="1"
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", parseFloat(e.target.value))
                        }
                        className="w-24 text-right"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 text-right">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center">
              <Button onClick={addItem} variant="outline">
                Add Item
              </Button>
              <div className="text-xl font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
