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
        columns: true,
        delimiter: ';',
        skip_empty_lines: true,
      });

      // Get content type schema
      const contentTypeSchema = strapi.getModel(contentType);
      const validFields = Object.keys(contentTypeSchema.attributes);

      // Validate and import records
      const importResults = [];
      const importErrors = [];
      for (const [index, record] of records.entries()) {
        const validRecord = {};
        let hasInvalidField = false;

        // Map CSV columns to valid fields
        for (const key of Object.keys(record)) {
          if (validFields.includes(key)) {
            validRecord[key] = record[key] === '' ? null : record[key];
          } else {
            hasInvalidField = true;
          }
        }

        if (hasInvalidField) {
          importErrors.push({
            row: index + 1,
            error: `Invalid fields found in the record: ${JSON.stringify(record)}`,
          });
          continue;
        }

        // Import the valid record
        try {
          const importedEntry = await strapi.entityService.create(contentType, {
            data: validRecord,
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