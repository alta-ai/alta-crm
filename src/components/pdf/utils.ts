import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy', { locale: de });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const booleanToYesNo = (value: boolean | undefined | null) => {
  if (value === undefined || value === null) return '';
  return value ? 'Ja' : 'Nein';
};

export const deriveDisplayedFullName = ({
  title,
  name,
  surname,
  sep = ', ',
  surnameFirst = true,
}: {
  title?: string;
  name?: string; // Vorname
  surname?: string; // Nachname
  sep?: string;
  surnameFirst?: boolean;
}) => {
  if (!name || !surname) return '';

  const titlePart = title ? `${title}${sep}` : '';
  
  if (surnameFirst) {
    return `${titlePart}${surname}${sep}${name}`;
  }
  
  return `${titlePart}${name}${sep}${surname}`;
};

export const deriveDisplayedStreetAddress = ({
  street,
  houseNumber,
  sep = ' ',
}: {
  street?: string;
  houseNumber?: string;
  sep?: string;
}) => {
  if (!street || !houseNumber) return '';
  return `${street}${sep}${houseNumber}`;
};

export const deriveDisplayedCityAddress = ({
  zip,
  city,
  sep = ' ',
}: {
  zip?: string;
  city?: string;
  sep?: string;
}) => {
  if (!zip || !city) return '';
  return `${zip}${sep}${city}`;
};

export const formatExamination = (examination: any) => {
  if (!examination) return '';
  
  let result = examination.examination || examination.name || '';
  
  if (examination.bodySide) {
    result += ` (${examination.bodySide})`;
  }
  
  return result;
};

export const mapFormDataToPdf = (formData: any, pdfMappings: any[]) => {
  const result: Record<string, any> = {};

  pdfMappings.forEach(mapping => {
    const { fieldId, pdfField, section } = mapping;
    const value = formData[fieldId];

    if (section) {
      if (!result[section]) {
        result[section] = {};
      }
      result[section][pdfField] = value;
    } else {
      result[pdfField] = value;
    }
  });

  return result;
};