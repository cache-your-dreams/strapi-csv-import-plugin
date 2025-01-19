const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  parseCSVFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return parse(fileContent, {
      columns: true,
      relax_column_count: true,
      delimiter: ',',
      relax_quotes: true,
      skip_empty_lines: true,
    });
  }
};