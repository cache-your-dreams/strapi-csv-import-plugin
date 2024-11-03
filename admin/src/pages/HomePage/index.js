/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContentTypeDropdown from '../../components/ContentTypeDropdown';
import {
  Layout,
  ContentLayout,
  HeaderLayout,
  Button,
  Select,
  Typography,
} from '@strapi/design-system';
import { LoadingIndicatorPage, useFetchClient } from '@strapi/helper-plugin';

// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

const HomePage = () => {
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available content types
  /* useEffect(() => {
    const fetchContentTypes = async () => {
      console.log('boo');
      try {
        const data = await useFetchClient('/content-type-builder/content-types', {
          method: 'GET',
        });
        console.log('hoo');
        const userContentTypes = Object.values(data.data).filter(
          (type) => !type.plugin
        );
        setContentTypes(userContentTypes);
      } catch (error) {
        console.error('Failed to fetch content types', error);
      }
    };
    fetchContentTypes();
  }, []); */

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Submit import
  const handleImport = async () => {
    if (!file || !selectedContentType) {
      alert('Please select a file and content type');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', selectedContentType.value);

      const response = await axios.post('/api/csv-import/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`Successfully imported ${response.data.importedRecords.length} records`);
    } catch (error) {
      console.error('Import error', error);
      alert('Failed to import CSV');
    }
    setIsLoading(false);
  };

  if (isLoading) return <LoadingIndicatorPage />;

  return (
    <Layout>
      <HeaderLayout title="CSV Import" />
      <ContentLayout>
        <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
          <Typography variant="h2">Import CSV</Typography>
          
          <h2>Select a Content Type</h2>
          <ContentTypeDropdown />
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                style={{ marginTop: '20px' }}
              />

          <Button 
            onClick={handleImport} 
            disabled={!file || !selectedContentType}
            style={{ marginTop: '20px' }}
          >
            Import CSV
          </Button>
        </div>
      </ContentLayout>
    </Layout>
  );
};

export default HomePage;
