import * as React from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Box } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QueryClientAccess } from './query-client';
import { strapiF } from '../utils/strapi';
import { Flex } from '@strapi/design-system';
import { makeCsv } from '../utils/csv';
import { Button } from '@strapi/design-system';

export const Input = (props: any) => {
  return (
    <QueryClientAccess>
      <TableDisplay {...props} />
    </QueryClientAccess>
  );
};

export const TableDisplay = (props: any) => {
  const params = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['columns', params.id],
    queryFn: async () =>
      strapiF.findOne<any>({
        url: `/${params?.slug?.split('.')[1]}s/${params.id}`,
        populate: {
          form: {
            populate: {
              champs: {
                on: {
                  'fields.texte': true,
                  'fields.choix-oui-non': true,
                  'fields.checkbox': true,
                },
              },
            },
          },
        },
      }),
  });

  const value = props.value;

  if (isLoading)
    return (
      <Flex justifyContent="center" alignItems="center" padding={4} background="neutral100">
        <Typography variant="sigma">Chargement des données ...</Typography>
      </Flex>
    );

  if (!data || !data.data || !data.data.form || !data.data.form.champs) return null;

  const champs = data.data.form.champs;

  const types: any = {
    'fields.texte': 'text',
    'fields.choix-oui-non': 'boolean',
    'fields.checkbox': 'boolean',
  };

  console.log('**************************', champs);
  console.log('**************************', value);

  const getTableDataForExport = (data: any, columns: any) => {
    const rows = data.rows.map((row: any) => {
      const rowData: any = {};
      columns
        .filter((column: any) => !column.column_hidden)
        .forEach((column: any, index: number) => {
          rowData[column.column_label] =
            types[column.__component] === 'boolean'
              ? row[index] === true || row[index] === 'true'
                ? 'Oui'
                : 'Non'
              : row[index];
        });
      return rowData;
    });
    return rows;
  };

  return (
    <Flex width="100%" gap={3} justifyContent="start" alignItems="start" direction="column">
      <Flex justifyContent="space-between" width="100%" alignItems="end">
        <Typography style={{ marginLeft: '3px' }} variant="sigma">
          Résultats au formulaire
        </Typography>

        <Button
          variant="secondary"
          size="S"
          onClick={() => makeCsv(getTableDataForExport(value, champs), 'test.csv')}
        >
          Exporter en CSV
        </Button>
      </Flex>
      <Box width="100%" padding={0} background="neutral100">
        <Table colCount={champs.length} paddingBottom={2}>
          <Thead>
            <Tr>
              {champs
                .filter((column: any) => !column.column_hidden)
                .map((column: any) => (
                  <Th key={column.column_label}>
                    <Typography variant="sigma">{column.column_label}</Typography>
                  </Th>
                ))}
            </Tr>
          </Thead>

          <Tbody>
            {value ? (
              value.rows &&
              value.rows.map((row: any, i: number) => (
                <Tr key={i}>
                  {row &&
                    Array.isArray(row) &&
                    row.map((t: any, j: number) => (
                      <Td key={j}>
                        <Typography textColor="neutral800">
                          {types[champs[j].__component] === 'boolean'
                            ? t === true || t === 'true'
                              ? 'Oui'
                              : 'Non'
                            : t}
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
