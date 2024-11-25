/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Layout,
  ContentLayout,
  HeaderLayout,
  Button,
  Select,
  Checkbox,
  Option,
  Typography,
} from '@strapi/design-system';
import { LoadingIndicatorPage, useFetchClient } from '@strapi/helper-plugin';

// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

const HomePage = () => {
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [file, setFile] = useState(null);
  const [removeExistingContent, setRemoveExistingContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { get } = useFetchClient();

  // Fetch available content types
  useEffect(() => {
    const fetchContentTypes = async () => {
      try {
        const { data } = await get('/content-type-builder/content-types');
        const userContentTypes = Object.values(data.data).filter(
          (type) => !type.plugin
        );
        setContentTypes(userContentTypes);
      } catch (error) {
        console.error('Failed to fetch content types', error);
      }
    };

    fetchContentTypes();
  }, [get]);

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
      formData.append('files', file);
      formData.append('contentType', selectedContentType);
      formData.append('remove', removeExistingContent);

      const response = await axios.post('/csv-import/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`Successfully imported some records`);
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

          <Select
            label="Select a Content Type"
            placeholder="Select a content type"
            value={selectedContentType}
            onChange={setSelectedContentType}
          >
            {contentTypes.map((contentType) => (
              <Option key={contentType.uid} value={contentType.uid}>
                {contentType.schema.displayName}
              </Option>
            ))}
          </Select>
          
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            style={{ marginTop: '20px' }}
          />

          <Checkbox 
            name="remove"
            checked={removeExistingContent}
            onChange={() => setRemoveExistingContent(!removeExistingContent)}
          >
            Remove existing Content
          </Checkbox>

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
