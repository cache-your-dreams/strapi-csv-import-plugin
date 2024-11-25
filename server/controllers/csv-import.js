const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  async importCSV(ctx) {
    const { contentType, remove } = ctx.request.body;
    const { files } = ctx.request.files || {};
    //console.log('contentType:', contentType);
    //console.log('Remove existing content:', remove);
    //console.log('Processed files:', files);

    try {
      // Check if 'remove' flag is true and delete existing content
      if (remove == 'true') {
        const existingEntries = await strapi.entityService.findMany(contentType);
        for (const entry of existingEntries) {
          await strapi.entityService.delete(contentType, entry.id);
        }
        console.log(`Removed all existing entries for content type ${contentType}`);
      }
      
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