'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
"use client";

import {ASSET_SERVER_URL, removeAssetServerPrefix} from "@gjcu/ui";
import {getTranslation} from "../../../utils/i18n";
import {FileFieldValue, FileUploadInput} from "@gjcu/ui/form/FileUploadInput";
import {useEffect, useState} from "react";

interface ProductAssetUploadProps {
  url?: string;
  onChange: (url: string) => void;
  fileTypes?: string[];
}

const assetProcessUrl = '/asset/upload-file';
const assetServerUrl = ASSET_SERVER_URL;
const ASSET_PREFIX = '/static-resource/';

export const MultipleAssetUpload = (props: ProductAssetUploadProps) => {

  const maxFiles = 1;
  const [fileValue, setFileValue] = useState<FileFieldValue>(FileFieldValue.create());

  const {t} = getTranslation();

  // 초기 URL이 있으면 FileFieldValue에 설정
  useEffect(() => {
    if (props.url) {
      const url = removeAssetServerPrefix(props.url);
      const newValue = FileFieldValue.create();
      newValue.addExistValue({
        url: url,
        id: url, // 임시 ID로 URL 사용
        fileName: url.split('/').pop() || '파일'
      });
      setFileValue(newValue);
    }
  }, [props.url]);

  const handleFileChange = (value: FileFieldValue) => {
    setFileValue(value);
    const currentFiles = value.getCurrentFileList();
    if (currentFiles.length > 0) {
      const file = currentFiles[0];
      props.onChange(file.url);
    } else {
      props.onChange('');
    }
  };

  const fileTypes = props.fileTypes ?? ['image/*'];

  return (
    <FileUploadInput
      name={'file'}
      value={fileValue}
      onChange={handleFileChange}
      config={{
        maxCount: maxFiles,
        fileTypes: fileTypes,
        extensions: fileTypes.includes('image/*') ? ['jpg', 'jpeg', 'png', 'gif', 'webp'] : undefined
      }}
    />
  );
}
