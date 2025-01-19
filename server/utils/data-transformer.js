'use strict';

const fieldTransformer = require('./field-transformer');

module.exports = {
  async validateAndTransformData(record, contentTypeSchema, strapi) {
    const validFields = Object.keys(contentTypeSchema.attributes);
    const transformedData = {};

    for (const [field, value] of Object.entries(record)) {
      if (!validFields.includes(field)) continue;

      const fieldSchema = contentTypeSchema.attributes[field];
      transformedData[field] = await fieldTransformer.transformField(field, value, fieldSchema, strapi);
    }

    return transformedData;
  }
};