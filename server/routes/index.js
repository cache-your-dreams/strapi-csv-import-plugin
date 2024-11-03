module.exports = {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/',
        handler: 'homepageController.index',
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/import',
        handler: 'csvImport.importCSV',
        config: {
          policies: [],
          auth: false,
        }
      },
    ]
  }
};