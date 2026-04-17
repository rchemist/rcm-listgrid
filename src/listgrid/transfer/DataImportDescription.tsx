/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {Table} from "../ui";
import { SafePerfectScrollbar } from "../ui";
import {Box} from "../ui";
import {Flex} from "../ui";
import {ReactNode} from "react";
import {DataField} from '../transfer/Type';
import {defaultString} from '../utils/StringUtil';
import styles from './DataImportDescription.module.css';
import clsx from "clsx";
import {Tooltip} from "../ui";

interface DataImportDescriptionProps {
  title?: ReactNode;
  data: DataField[];
}

export const DataImportDescription = ({title, data}: DataImportDescriptionProps) => {
  return (
    <Box style={{marginTop:`1rem`, paddingTop:`1.5rem`}}>
      <Flex align={'center'} justify={'flex-end'}>
        {title ? title : <Box>
          <span style={{color:`#f00`, marginRight:`4px`}}>*</span> 표시가 된 필드는 필수값입니다.
        </Box>}
      </Flex>
      <SafePerfectScrollbar style={{height: '350px'}}>
        <Table stickyHeader striped={'odd'} withColumnBorders={true} highlightOnHover={true}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={`30%`} className={clsx(styles.header, styles.headerLeft)}>필드</Table.Th>
              <Table.Th w={`70%`} className={clsx(styles.header, styles.headerRight)}>설명</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((field) => {
              if (defaultString(field.getDescription()) === '') {
                return null;
              }

              return <Table.Tr key={field.getName()}>
                <Table.Td className={clsx(styles.body, styles.bodyLeft)}>{field.getLabel()}
                  {field.isRequired() &&
                    <Tooltip label={'필수'}>
                      <span style={{color:`#f00`, marginRight:`4px`}}> *</span>
                    </Tooltip>
                  }
                </Table.Td>
                <Table.Td className={clsx(styles.body, styles.bodyRight)}>{field.getDescription()}</Table.Td>
              </Table.Tr>;
            })}
          </Table.Tbody>
        </Table>
      </SafePerfectScrollbar>
    </Box>
  );
}
