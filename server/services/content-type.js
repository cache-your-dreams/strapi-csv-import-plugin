module.exports = ({ strapi }) => ({
  getAvailableContentTypes() {
    try {
      // Get all content types except system types and plugins
      const contentTypes = Object.values(strapi.contentTypes)
        .filter(contentType => 
          !contentType.plugin && 
          !contentType.uid.startsWith('strapi::') &&
          contentType.kind === 'collectionType'
        )
        .map(contentType => contentType.uid);
      
      return contentTypes;
    } catch (error) {
      console.error('Error getting content types:', error);
      throw error;
    }
  }
});