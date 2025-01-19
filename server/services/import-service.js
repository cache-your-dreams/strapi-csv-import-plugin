const { parseCSVFile } = require('../utils/csv-parser');
const { validateAndTransformData } = require('../utils/data-transformer');

module.exports = ({ strapi }) => ({
  async removeExistingEntries(contentType) {
    const existingEntries = await strapi.entityService.findMany(contentType);
    for (const entry of existingEntries) {
      await strapi.entityService.delete(contentType, entry.id);
    }
    console.log(`Removed all existing entries for content type ${contentType}`);
  },

  async parseCSVFile(filePath) {
    return parseCSVFile(filePath);
  },

  async importRecords(contentType, records) {
    const contentTypeSchema = strapi.getModel(contentType);
    const importResults = [];
    const importErrors = [];

    for (const [index, record] of records.entries()) {
      try {
        const transformedData = await validateAndTransformData(record, contentTypeSchema, strapi);
        const importedEntry = await strapi.entityService.create(contentType, { data: transformedData });
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
      success: importErrors.length === 0,
      message: `Import completed with ${importResults.length} successful records and ${importErrors.length} errors.`,
      results: importResults,
      errors: importErrors,
    };
  },
});