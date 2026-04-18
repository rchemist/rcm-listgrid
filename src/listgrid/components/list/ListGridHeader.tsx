'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
"use client";
import React, {useState} from "react";
import {isTrue} from '../../utils/BooleanUtil';
import {useListGridHeader} from "./hooks/useListGridHeader";
import {ListGridHeaderProps} from "./types/ListGridHeader.types";
import {HeaderTitle} from "./ui/HeaderTitle";
import {DataTransferModals} from "./ui/DataTransferModal";
import {HeaderActionButtons} from "./ui/HeaderActionButtons";
import {useListGridTheme} from "./context/ListGridThemeContext";


export const ListGridHeader = (props: ListGridHeaderProps) => {
  const {
    enableHandleData,
    isSubCollection,
    searchForm,
    refresh,
    dataTransferConfig,
    title,
    hideTitle,
    readonly,
  } = props;

  const [openDownload, setOpenDownload] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const { headerButtons, checkedButtons } = useListGridHeader(props);
  const { classNames: themeClasses } = useListGridTheme();

  const viewable = enableHandleData || !isTrue(hideTitle);
  if (!viewable) return null;

  return (
    <React.Fragment>
      <div className={themeClasses.header?.container ?? "rcm-listgrid-header"}>
        <HeaderTitle title={title} hideTitle={hideTitle} />
        <div className={themeClasses.header?.buttonGroup ?? "rcm-listgrid-button-group"}>
            <HeaderActionButtons
                {...props}
                headerButtons={headerButtons}
                checkedButtons={checkedButtons}
                setOpenDownload={setOpenDownload}
                setOpenUpload={setOpenUpload}
                neverDelete={isTrue(props.entityForm.neverDelete)}
            />
        </div>
      </div>
      {!isSubCollection && <DataTransferModals
        openDownload={openDownload}
        setOpenDownload={setOpenDownload}
        openUpload={openUpload}
        setOpenUpload={setOpenUpload}
        dataTransferConfig={dataTransferConfig}
        searchForm={searchForm}
        title={title}
        refresh={refresh}
      />}
    </React.Fragment>
  );
};
