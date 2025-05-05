// src/utils/fileImport.js
import Papa from 'papaparse';

export function importCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
    });
  });
}