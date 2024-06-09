import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const qualityOptions = [
  { label: 'Auto', value: 'default' },
  { label: '144p', value: 'tiny' },
  { label: '240p', value: 'small' },
  { label: '360p', value: 'medium' },
  { label: '480p', value: 'large' },
  { label: '720p', value: 'hd720' },
  { label: '1080p', value: 'hd1080' },
  { label: '1440p', value: 'hd1440' },
  { label: '2160p', value: 'hd2160' },
];

const QualitySelector = ({ quality, onQualityChange }) => (
  <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
    <InputLabel>Quality</InputLabel>
    <Select value={quality} onChange={onQualityChange}>
      {qualityOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default QualitySelector;
