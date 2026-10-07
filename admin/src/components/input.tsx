import * as React from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Box } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFetchClient } from '@strapi/strapi/admin';
import { QueryClientAccess } from './query-client';
import { Flex } from '@strapi/design-system';
import { makeCsv } from '../utils/csv';
import { Button } from '@strapi/design-system';
import {
  fetchAllLocaleTables,
  fetchFormColumns,
  formatCell,
  getHeaders,
  mergeLocaleTables,
  resolveColumns,
  toRecords,
} from '../utils/event-tables';

export const Input = (props: any) => {
  return (
    <QueryClientAccess>
      <TableDisplay {...props} />
    </QueryClientAccess>
  );
};

export const TableDisplay = (props: any) => {
  const params = useParams();
  const { search } = useLocation();
  const { get } = useFetchClient();
  const [isExportingAll, setIsExportingAll] = React.useState(false);

  const uid = params.slug;
  const documentId = params.id;
  const locale = new URLSearchParams(search).get('plugins[i18n][locale]') ?? undefined;
  const isSaved = Boolean(uid && documentId && documentId !== 'create');

  const { data: formColumns, isLoading } = useQuery({
    queryKey: ['table-field-columns', uid, documentId, locale],
    queryFn: () => fetchFormColumns(get, uid!, documentId!, locale),
    enabled: isSaved,
  });

  const value = props.value;
  const rows: any[][] = Array.isArray(value?.rows) ? value.rows : [];

  if (isLoading)
    return (
      <Flex justifyContent="center" alignItems="center" padding={4} background="neutral100">
        <Typography variant="sigma">Chargement des données ...</Typography>
      </Flex>
    );

  const columns = resolveColumns(formColumns ?? null, value);
  const headers = getHeaders(columns, rows);

  const exportAllLocales = async () => {
    setIsExportingAll(true);
    try {
      const tables = await fetchAllLocaleTables(get, uid!, documentId!, locale);
      const records = mergeLocaleTables(tables);
      if (records.length) makeCsv(records, '3dformworks-toutes-langues.csv');
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <Flex width="100%" gap={3} justifyContent="start" alignItems="start" direction="column">
      <Flex justifyContent="space-between" width="100%" alignItems="end">
        <Typography style={{ marginLeft: '3px' }} variant="sigma">
          Résultats au formulaire
        </Typography>

        <Flex gap={2}>
          <Button
            variant="secondary"
            size="S"
            disabled={!rows.length}
            onClick={() => makeCsv(toRecords(columns, rows, headers), '3dformworks.csv')}
          >
            Exporter en CSV
          </Button>
          {isSaved && (
            <Button variant="secondary" size="S" loading={isExportingAll} onClick={exportAllLocales}>
              Exporter toutes les langues
            </Button>
          )}
        </Flex>
      </Flex>
      <Box width="100%" padding={0} background="neutral100">
        <Table colCount={headers.length} paddingBottom={2}>
          <Thead>
            <Tr>
              {headers.map((header) => (
                <Th key={header}>
                  <Typography variant="sigma">{header}</Typography>
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {rows.length ? (
              rows.map((row: any, i: number) => (
                <Tr key={i}>
                  {headers.map((header, j) => (
                    <Td key={header}>
                      <Typography textColor="neutral800">
                        {formatCell(Array.isArray(row) ? row[j] : undefined, columns?.[j])}
                      </Typography>
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <Box marginLeft="auto" marginRight="auto" width="100%" padding={6}>
                <Typography width="100%" variant="sigma">
                  Aucune donnée
                </Typography>
              </Box>
            )}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};
