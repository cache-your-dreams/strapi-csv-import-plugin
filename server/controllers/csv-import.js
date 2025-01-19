const { parse } = require('csv-parse/sync');
const fs = require('fs');

module.exports = {
  async importCSV(ctx) {
    const { contentType, remove } = ctx.request.body;
    const { files } = ctx.request.files || {};

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

    // Import records
    const importResults = [];
    const importErrors = [];
    for (const [index, record] of records.entries()) {
      const data = {};

      for (const [field, value] of Object.entries(record)) {
        if (!validFields.includes(field)) continue;

        const fieldSchema = contentTypeSchema.attributes[field];

        if (fieldSchema.relation) {
          // Handle relational fields
          if (fieldSchema.relation === 'oneToOne' || fieldSchema.relation === 'manyToOne') {
            // Find or create the related entity
            const relatedEntity = await strapi.entityService.findMany(fieldSchema.target, {
              filters: { name: value }, // Adjust this based on your unique identifier for related entities
              limit: 1,
            });

            if (relatedEntity.length > 0) {
              data[field] = relatedEntity[0].id;
            } else {
              const createdEntity = await strapi.entityService.create(fieldSchema.target, {
                data: { Name: value }, // Adjust this to match the fields of the related entity
              });
              data[field] = createdEntity.id;
            }
          } else if (fieldSchema.relation === 'manyToMany' || fieldSchema.relation === 'oneToMany') {
            // Split values for multiple related entities (e.g., comma-separated IDs or names)
            const relatedValues = value.split(',').map((v) => v.trim());
            const relatedEntities = [];

            for (const relatedValue of relatedValues) {
              let relatedEntity = await strapi.entityService.findMany(fieldSchema.target, {
                filters: { Name: relatedValue },
                limit: 1,
              });
              console.log(relatedEntity);

              if (relatedEntity.length > 0) {
                relatedEntities.push(relatedEntity[0].id);
              } else {
                const createdEntity = await strapi.entityService.create(fieldSchema.target, {
                  data: { name: relatedValue },
                });
                relatedEntities.push(createdEntity.id);
              }
            }

            data[field] = relatedEntities;
          }
        } else {
          // Non-relational fields
          data[field] = value;
        }
      }

      // Import the record
      try {
        const importedEntry = await strapi.entityService.create(contentType, { data });
        importResults.push(importedEntry);
      } catch (error) {
        importErrors.push({
          row: index + 1,
          error: error.message,
          record: record,
        });
      }
    }
    if (importErrors.length > 0) {
      return {
        success: false,
        message: `Import completed with ${importResults.length} successful records and ${importErrors.length} errors.`,
        errors: importErrors,
      };
    } else {
      return {
        success: true,
        message: `Import completed with ${importResults.length} successful records and ${importErrors.length} errors.`,
        results: importResults,
        errors: importErrors,
      };
    }
  },
};