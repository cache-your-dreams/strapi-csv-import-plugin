const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  async importCSV({ files, contentType }) {
    try {
      const { file } = files;
      
      // Read CSV file
      const fileContent = fs.readFileSync(file.filepath, 'utf8');
      
      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Validate content type
      const contentTypeService = strapi.plugin('csv-import').service('content-type');
      const validContentTypes = await contentTypeService.getAvailableContentTypes();
      
      if (!validContentTypes.includes(contentType)) {
        return [
          false,
          'Invalid content type selected',
          null
        ];
      }

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
        `Successfully imported ${importResults.length} records`,
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
  },

  async getContentTypes() {
    console.log('boo - controller');
    alert('boo - controller');
    try {
      const contentTypeService = strapi.plugin('csv-import').service('content-type');
      const contentTypes = await contentTypeService.getAvailableContentTypes();
      if (contentTypes) {
        return [
          true,
          'Content types retrieved successfully',
          contentTypes
        ];
      }
    } catch (error) {
      console.error('Content types fetch error:', error);
      return [
        false,
        error.message || 'An error occurred fetching content types',
        null
      ];
    }
  }
};