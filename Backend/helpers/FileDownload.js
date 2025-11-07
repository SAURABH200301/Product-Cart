import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';

export async function generateCSV(filename, records) {
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: Object.keys(records[0]).map(key => ({ id: key, title: key.toUpperCase() })),
  });
  await csvWriter.writeRecords(records);
  console.log('CSV file written successfully');
}


export async function generateXLSX(filename, records) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  worksheet.columns = Object.keys(records[0]).map(key => ({ header: key.toUpperCase(), key }));

  records.forEach(record => {
    worksheet.addRow(record);
  });

  await workbook.xlsx.writeFile(filename);
  console.log('XLSX file written successfully');
}
