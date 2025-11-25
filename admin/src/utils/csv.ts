// Source - https://stackoverflow.com/a
// Posted by Yoshi, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-25, License - CC BY-SA 4.0

/**
 * @desc get table data as json
 * @param data
 * @param columns
 */
const getTableDataForExport = (data: any[], columns: any[]) =>
  data?.map((record: any) =>
    columns.reduce(
      (recordToDownload, column) => ({
        ...recordToDownload,
        [column.Header]: record[column.accessor],
      }),
      {}
    )
  );

/**
 * @desc make csv from given data
 * @param rows
 * @param filename
 */
export const makeCsv = async (rows: any[], filename: string) => {
  const separator: string = ';';
  const keys: string[] = Object.keys(rows[0]);

  const csvContent = `${keys.join(separator)}\n${rows
    .map((row) =>
      keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];

          cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');

          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(separator)
    )
    .join('\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  if ((window.navigator as any).msSaveBlob) {
    // In case of IE 10+
    (window.navigator as any).msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
