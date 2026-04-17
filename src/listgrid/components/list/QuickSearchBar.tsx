/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client'
import React, {Fragment} from "react";
import {QuickSearchProps} from '../../config/ListGrid';
import {ViewFieldManageable} from "./types/ViewListGrid.types";
import {ListableFormField} from '../fields/abstract';
import {Transition} from "@headlessui/react";
import {SearchForm} from "../../form/SearchForm";
import {SearchBarActions} from "./ui/SearchBarActions";
import {QuickSearchInput} from "./ui/QuickSearchInput";
import {useQuickSearchBar} from "./hooks/useQuickSearchBar";
import {useListGridTheme} from "./context/ListGridThemeContext";

export interface QuickSearchBarProps extends ViewFieldManageable {
  quickSearchProperty?: QuickSearchProps;
  quickSearchValue?: string;
  loading: boolean;
  onQuickSearch: (search: string) => void;
  listFields: ListableFormField<any>[];
  enableHandleData: boolean;
  showAdvancedSearch: boolean;
  onOpenAdvancedSearch?: () => void;
  subCollection: boolean;
  searchForm: SearchForm;
  onChangeSearchForm: (searchForm: SearchForm) => void;
  hidePageSize?: boolean;
  entityUrl: string;
  subCollectionName?: string;
  hideAdvancedSearch?: boolean;
}


// == Main Component ==
export const QuickSearchBar = (props: QuickSearchBarProps) => {
  const {
    loading,
    subCollection,
    onQuickSearch,
    showAdvancedSearch,
  } = props;

  const {
    search,
    setSearch,
    quickSearchEnabled,
    quickSearchLabel,
    handlePageSizeChange,
    filtered,
    searchEnabled,
  } = useQuickSearchBar(props);

  const { classNames: themeClasses } = useListGridTheme();

  if (!searchEnabled) return <></>;

  return (
    <Transition appear show={!showAdvancedSearch} as={Fragment}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0"
      >
        <div className={themeClasses.searchBar?.container ?? "flex flex-1 p-0 mb-2"}>
          <div className={themeClasses.searchBar?.innerWrapper ?? "w-full px-4"}>
            <div className={themeClasses.searchBar?.layoutWrapper ?? "gap-2 md:flex md:items-center w-full md:justify-between"}>
              <QuickSearchInput
                search={search}
                setSearch={setSearch}
                onQuickSearch={onQuickSearch}
                quickSearchEnabled={quickSearchEnabled}
                quickSearchLabel={quickSearchLabel}
                loading={loading}
              />
              <SearchBarActions
                {...props}
                searchForm={props.searchForm}
                handlePageSizeChange={handlePageSizeChange}
                searchEnabled={searchEnabled}
                filtered={filtered}
              />
            </div>
          </div>
        </div>
      </Transition.Child>
    </Transition>
  );
}

