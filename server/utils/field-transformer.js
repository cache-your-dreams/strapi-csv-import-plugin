'use strict';

const fieldTransformer = {
  async transformField(field, value, fieldSchema, strapi) {
    if (!fieldSchema.relation) {
      return value;
    }

    if (fieldSchema.relation === 'oneToOne' || fieldSchema.relation === 'manyToOne') {
      return await this.handleSingleRelation(value, fieldSchema, strapi);
    }

    if (fieldSchema.relation === 'manyToMany' || fieldSchema.relation === 'oneToMany') {
      return await this.handleMultipleRelations(value, fieldSchema, strapi);
    }
  },

  async handleSingleRelation(value, fieldSchema, strapi) {
    const relatedEntity = await strapi.entityService.findMany(fieldSchema.target, {
      filters: { name: value },
      limit: 1,
    });

    if (relatedEntity.length > 0) {
      return relatedEntity[0].id;
    }

    const createdEntity = await strapi.entityService.create(fieldSchema.target, {
      data: { name: value },
    });
    return createdEntity.id;
  },

  async handleMultipleRelations(value, fieldSchema, strapi) {
    const relatedValues = value.split(',').map((v) => v.trim());
    const relatedEntities = [];

    for (const relatedValue of relatedValues) {
      let relatedEntity = await strapi.entityService.findMany(fieldSchema.target, {
        filters: { name: relatedValue },
        limit: 1,
      });

      if (relatedEntity.length > 0) {
        relatedEntities.push(relatedEntity[0].id);
      } else {
        const createdEntity = await strapi.entityService.create(fieldSchema.target, {
          data: { name: relatedValue },
        });
        relatedEntities.push(createdEntity.id);
      }
    }

    return relatedEntities;
  }
};

module.exports = fieldTransformer;