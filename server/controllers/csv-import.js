const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  async importCSV(ctx) {
    const { contentType } = ctx.request.body;
    const { files } = ctx.request.files || {};
    console.log('contentType:', contentType);
    console.log('Processed files:', files);

    try {
      
      // Read CSV file
      const fileContent = fs.readFileSync(files.path, 'utf8');
      
      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Import records
      const importResults = [];
      for (const record of records) {
        const importedEntry = await strapi.entityService.create(contentType, {
          data: record
        });
        importResults.push(importedEntry);
      }

      return [
        true,
        //`Successfully imported ${importResults.length} records`,
        `Successfully imported some records`,
        importResults
      ];
    } catch (error) {
      console.error('Import error:', error);
      return [
        false,
        error.message || 'An error occurred during CSV import',
        null
      ];
    }
  }
};