const FORM_UID = 'api::feature-form-builder.feature-form-builder';

const BOOLEAN_COMPONENTS = ['fields.choix-oui-non', 'fields.checkbox'];

export interface Column {
  label: string;
  component?: string;
}

export interface LocaleTable {
  locale: string;
  rows: any[][];
  columns: Column[] | null;
}

type Get = (url: string) => Promise<{ data: any }>;

const docUrl = (uid: string, documentId: string, locale?: string) =>
  `/content-manager/collection-types/${uid}/${documentId}${locale ? `?locale=${locale}` : ''}`;

/**
 * Columns of the form linked to the event in this locale,
 * or null when no form is linked.
 */
export const fetchFormColumns = async (
  get: Get,
  uid: string,
  documentId: string,
  locale?: string
): Promise<Column[] | null> => {
  const { data: relation } = await get(
    `/content-manager/relations/${uid}/${documentId}/form${locale ? `?locale=${locale}` : ''}`
  );
  const form = relation?.results?.[0];
  if (!form) return null;

  const { data } = await get(docUrl(FORM_UID, form.documentId, form.locale));
  const champs = data?.data?.champs;
  if (!champs) return null;

  return champs
    .filter((field: any) => !field.column_hidden)
    .map((field: any) => ({ label: field.column_label, component: field.__component }));
};

/**
 * Columns to display: the linked form first, then the columns saved
 * with the rows, so a table stays readable when its form is detached.
 */
export const resolveColumns = (formColumns: Column[] | null, table: any): Column[] | null =>
  formColumns ?? (Array.isArray(table?.columns) ? table.columns : null);

export const fetchLocaleTable = async (
  get: Get,
  uid: string,
  documentId: string,
  locale: string
): Promise<LocaleTable> => {
  const [{ data }, formColumns] = await Promise.all([
    get(docUrl(uid, documentId, locale)),
    fetchFormColumns(get, uid, documentId, locale),
  ]);
  const table = data?.data?.table;

  return {
    locale,
    rows: Array.isArray(table?.rows) ? table.rows : [],
    columns: resolveColumns(formColumns, table),
  };
};

export const fetchAllLocaleTables = async (
  get: Get,
  uid: string,
  documentId: string,
  currentLocale?: string
): Promise<LocaleTable[]> => {
  const { data } = await get(docUrl(uid, documentId, currentLocale));
  const locales = [
    data?.data?.locale ?? currentLocale,
    ...(data?.meta?.availableLocales ?? []).map((l: any) => l.locale),
  ].filter(Boolean);

  return Promise.all(locales.map((locale) => fetchLocaleTable(get, uid, documentId, locale)));
};

/**
 * Unique header labels for a table; rows longer than the known columns
 * get generic "Colonne N" headers so no answer is ever hidden.
 */
export const getHeaders = (columns: Column[] | null, rows: any[][]): string[] => {
  const width = Math.max(columns?.length ?? 0, ...rows.map((row) => (Array.isArray(row) ? row.length : 0)));
  const seen: Record<string, number> = {};

  return Array.from({ length: width }, (_, i) => {
    const label = columns?.[i]?.label || `Colonne ${i + 1}`;
    seen[label] = (seen[label] ?? 0) + 1;
    return seen[label] > 1 ? `${label} (${seen[label]})` : label;
  });
};

export const formatCell = (value: any, column?: Column) => {
  if (column?.component && BOOLEAN_COMPONENTS.includes(column.component)) {
    return value === true || value === 'true' ? 'Oui' : 'Non';
  }
  return value ?? '';
};

export const toRecords = (columns: Column[] | null, rows: any[][], headers: string[]) =>
  rows.map((row) => {
    const record: Record<string, any> = {};
    headers.forEach((header, i) => {
      record[header] = formatCell(Array.isArray(row) ? row[i] : undefined, columns?.[i]);
    });
    return record;
  });

/**
 * All locales in one export, with a "Langue" column. Answers are matched
 * by column label, so forms that differ between locales stay aligned.
 */
export const mergeLocaleTables = (tables: LocaleTable[]) => {
  const allHeaders: string[] = [];
  const records: Record<string, any>[] = [];

  tables.forEach(({ locale, rows, columns }) => {
    const headers = getHeaders(columns, rows);
    headers.forEach((header) => {
      if (!allHeaders.includes(header)) allHeaders.push(header);
    });
    toRecords(columns, rows, headers).forEach((record) => records.push({ Langue: locale, ...record }));
  });

  const keys = ['Langue', ...allHeaders];
  return records.map((record) => Object.fromEntries(keys.map((key) => [key, record[key] ?? ''])));
};
