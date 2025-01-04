const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  async importCSV(ctx) {
    const { contentType, remove } = ctx.request.body;
    const { files } = ctx.request.files || {};

    try {
      // Check if 'remove' flag is true and delete existing content
      if (remove === 'true') {
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
        columns: true, // Use header row for keys
        relax_column_count: true,
        delimiter: ',',
        relax_quotes: true,
        skip_empty_lines: true,
      });

      // Get content type schema
      const contentTypeSchema = strapi.getModel(contentType);
      const validFields = Object.keys(contentTypeSchema.attributes);
      console.log(validFields);

      // Import records directly without field validation
      const importResults = [];
      const importErrors = [];
      for (const [index, record] of records.entries()) {
        // Import the record
        try {
          const importedEntry = await strapi.entityService.create(contentType, {
            data: record,
          });
          importResults.push(importedEntry);
        } catch (error) {
          importErrors.push({
            row: index + 1,
            error: error.message,
            record: record,
          });
        }
      }

      return {
        success: true,
        message: `Import completed with ${importResults.length} successful records and ${importErrors.length} errors.`,
        results: importResults,
        errors: importErrors,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during CSV import',
        errors: [{ error: error.message }],
      };
    }
  },
};