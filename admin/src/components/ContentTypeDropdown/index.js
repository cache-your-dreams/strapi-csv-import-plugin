import React, { useEffect, useState } from 'react';
import { Select, Option } from '@strapi/design-system';
import { useFetchClient } from '@strapi/helper-plugin';

const ContentTypeDropdown = () => {
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const { get } = useFetchClient();


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

  return (
    <Select
      label="Content Type"
      placeholder="Select a content type"
      value={selectedType}
      onChange={setSelectedType}
    >
      {contentTypes.map((contentType) => (
        <Option key={contentType.uid} value={contentType.uid}>
          {contentType.schema.displayName}
        </Option>
      ))}
    </Select>
  );
};

export default ContentTypeDropdown;
