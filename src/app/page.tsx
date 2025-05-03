'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trash2, PlusCircle } from 'lucide-react';

export default function Home() {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [vatIncluded, setVatIncluded] = useState(false);
  const [services, setServices] = useState([
    { description: '', quantity: '', unitPrice: '' },
  ]);

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index][field as keyof typeof updated[0]] = value;
    setServices(updated);
  };

  const handleAddService = () => {
    setServices([...services, { description: '', quantity: '', unitPrice: '' }]);
  };

  const handleRemoveService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const handleDownload = () => {
    const parsed = services.map((s, i) => {
      const qty = parseFloat(s.quantity || '0');
      const rate = parseFloat(s.unitPrice || '0');
      const amount = qty * rate;

      return {
        sno: i + 1,
        description: s.description,
        quantity: qty,
        unitPrice: rate.toFixed(3),
        amount: amount.toFixed(3),
      };
    });

    const subtotal = parsed.reduce((acc, cur) => acc + parseFloat(cur.amount), 0);
    const vat = vatIncluded ? subtotal * 0.05 : 0;
    const grandTotal = subtotal + vat;

    const doc = new jsPDF();

    doc.setFontSize(16).setFont(undefined, 'bold');
    doc.text('RAMESH INTERNATIONAL', 105, 15, { align: 'center' });
    doc.setFontSize(11).setFont(undefined, 'normal');
    doc.text('ramesh@rameshinternational.com', 105, 22, { align: 'center' });

    doc.setFontSize(14).setFont(undefined, 'bold');
    doc.text('INVOICE', 105, 35, { align: 'center' });
    doc.line(95, 37, 115, 37);

    doc.setFontSize(11).setFont(undefined, 'normal');
    doc.text(`Customer Name: Mr. / M/s ${customerName || '............................'}`, 14, 50);
    doc.text(`Date: ${date || '............'}`, 160, 50);

    autoTable(doc, {
      startY: 60,
      head: [['S No.', 'Description', 'Qty.', 'Unit Rate', 'Amount']],
      body: parsed.map((s) => [
        s.sno.toString(),
        s.description,
        s.quantity.toString(),
        s.unitPrice,
        s.amount,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 220, 220] },
    });

    const finalY = doc.lastAutoTable.finalY || 80;

    autoTable(doc, {
      startY: finalY + 10,
      body: [
        ['Total', subtotal.toFixed(3)],
        ['VAT (5%)', vat.toFixed(3)],
        ['Grand Total', grandTotal.toFixed(3)],
      ],
      tableLineWidth: 0,
      styles: {
        halign: 'right',
        fontSize: 10,
        cellPadding: { top: 2, right: 6, bottom: 2, left: 6 },
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
      },
      margin: { left: 125 },
    });

    const bankNoteStart = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text(
      'For bank transfers, please use the following account details and include the invoice number as the payment reference:',
      14,
      bankNoteStart
    );
    doc.text('Bank Name: BANK MUSCAT', 14, bankNoteStart + 8);
    doc.text('Account Name: RAMESH INTERNATIONAL SPC', 14, bankNoteStart + 15);
    doc.text('Account Number: 0317072830880018', 14, bankNoteStart + 22);
    doc.text('Branch: Al Khuwair', 14, bankNoteStart + 29);

    doc.save(`invoice_${customerName || 'bill'}.pdf`);
  };

  const calculateAmount = (qty: string, rate: string) => {
    const q = parseFloat(qty || '0');
    const r = parseFloat(rate || '0');
    return (q * r).toFixed(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-black px-4 py-6 max-w-4xl mx-auto">

      <h2 className="text-3xl font-bold text-center mb-1">📄 Bill Generator</h2>
      <p className="font-bold text-center mb-6">RAMESH INTERNATIONAL</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">👤 Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">📅 Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">🛠️ Services</h2>

      {services.map((service, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center mb-3 bg-white p-3 rounded shadow-sm"
        >
          <input
            type="text"
            placeholder="Description"
            value={service.description}
            onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
            className="sm:col-span-2 border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Qty"
            value={service.quantity}
            onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Unit Price"
            value={service.unitPrice}
            onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
            className="border rounded px-2 py-1"
          />
          <div className="text-right font-medium">
            {calculateAmount(service.quantity, service.unitPrice)}
          </div>
          <button
            onClick={() => handleRemoveService(index)}
            className="text-red-600 hover:text-red-800"
            title="Remove"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}

      <button
        onClick={handleAddService}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        <PlusCircle size={18} />
      </button>

      <div className="mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={vatIncluded}
            onChange={(e) => setVatIncluded(e.target.checked)}
            className="accent-green-600"
          />
          <span className="font-medium">Include VAT (5%)</span>
        </label>
      </div>

      <button
        onClick={handleDownload}
        className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        📥 Download PDF
      </button>
    </div>
  );
}
