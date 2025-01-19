'use strict';

module.exports = {
  async importCSV(ctx) {
    try {
      const { contentType, remove } = ctx.request.body;
      const { files } = ctx.request.files || {};

      if (!files || !files.path) {
        return ctx.badRequest('No file uploaded');
      }

      if (!contentType) {
        return ctx.badRequest('Content type is required');
      }

      const importService = strapi.plugin('csv-import').service('importService');
      
      if (remove === 'true') {
        await importService.removeExistingEntries(contentType);
      }

      const records = await importService.parseCSVFile(files.path);
      const result = await importService.importRecords(contentType, records);

      return result;
    } catch (error) {
      console.error('CSV Import error:', error);
      return ctx.badRequest(error.message);
    }
  }
};