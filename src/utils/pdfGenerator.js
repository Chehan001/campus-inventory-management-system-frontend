import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

export const generateBarcodePDF = (items) => {
    const doc = new jsPDF();
    let x = 10;
    let y = 10;
    const boxWidth = 60; // 3 per row roughly or 4
    const boxHeight = 40;
    const pageHeight = 290;

    // Layout: 4 columns? 210mm width. 50mm each.
    // User requested "20 abr code in one page". 
    // 4 columns x 5 rows = 20.
    const cols = 4;
    const rows = 5;
    const width = 45;
    const height = 30;
    const margin = 10;

    let colIndex = 0;
    let rowIndex = 0;

    items.forEach((item, index) => {
        if (index > 0 && index % 20 === 0) {
            doc.addPage();
            colIndex = 0;
            rowIndex = 0;
        }

        const posX = margin + (colIndex * (width + 5));
        const posY = margin + (rowIndex * (height + 10));

        // Create canvas for barcode
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, item.serialNumber, {
            format: "CODE128",
            displayValue: true,
            fontSize: 10,
            width: 1,
            height: 15
        });
        const imgData = canvas.toDataURL("image/png");

        doc.addImage(imgData, 'PNG', posX, posY, width, 20);
        doc.setFontSize(8);
        doc.text(item.category, posX, posY + 25);
        doc.text(item.subCategory, posX, posY + 29);

        // Grid update
        colIndex++;
        if (colIndex >= cols) {
            colIndex = 0;
            rowIndex++;
        }
    });

    doc.save('barcodes.pdf');
};
