# custom-named-functions

Collection of custom functions (GAS - Google Apps Script) and named functions (formulae) for Google Sheets.

You can take a look at the spreadsheet with implementations and usage examples here: https://docs.google.com/spreadsheets/d/1FCbEupZSEwHm4QTMY0hdTJPSwNKSrv9AU1TRg6mlGKo/edit?usp=sharing

# sections
 - [custom functions](#custom-functions)
 - [named functions](#named-functions)

## custom functions
You can find them in the [GAS folder](GAS).

### [pythonSlice.gs](GAS/pythonSlice.gs)

#### PYTHON_SLICE(array, sliceStr)
Replicates Python slicing syntax in Google Sheets.
Works with 1D and 2D arrays (ranges)

Usage:<br>
>  1D: <code>=PYTHON_SLICE(A1:A10, "1:5")</code><br>
>  2D rows: <code>=PYTHON_SLICE(A1:C10, "1:5")</code><br>
>  2D rows & cols: <code>=PYTHON_SLICE(A1:C10, "1:5,0:2")</code><br>
>step: <code>=PYTHON_SLICE(A1:C10, "1:5:2,0:2:2")</code><br>

```
@param {Array} array - The array or range to slice
@param {string} sliceStr - Python-style slice string with optional row,col format

@return {Array} The sliced array
```

![alt text](assets/PYTHON_SLICE.png)

#### SLICE(array, sliceStr)

Shorthand function for common slicing operations
<br>
Returns single value if result has 1 element, array otherwise


## named functions
You can find their implementations in [NAMED_FUNCTIONS_IMPL.md](NAMED_FUNCTIONS_IMPL.md)

### GET_SHEET_DATA(sheet_name, headers)
Returns data from the specified 'sheet_name'. 

Output is a rectangular range extending from A1 of 'sheet_name' to the LAST non empty cell of the FIRST row and the LAST non empty cell of the FIRST column of the specified sheet.

The 'headers' parameter defines if/how to include headers.

<code>**sheet_name**</code> The name of the sheet from which data will be extracted.<br>
<code>**headers**</code> An indicator of whether to include headers. 1 (default if not specified) will include headers. 0 will exclude headers. -1 will extract headers only.

Example: <code>=GET_SHEET_DATA("Sheet 1", 0)</code>

![alt text](assets/GET_SHEET_DATA.png)

### QUERY_BY_HEADERS(data, query_text)
Sourced from here: https://webapps.stackexchange.com/a/167714
Thanks @carecki

Queries the provided data using Google Query language. First row must contain headers, which then are used in the query statement.

<code>**data**</code> data range with headers in the first row<br>
<code>**query_text**</code> query in the Google Query Language syntax where you can use header text wrapped in backticks to reference the columns

Example: <code>=QUERY_BY_HEADERS(A:F, "select \`name\`, \`age\`")</code>

![alt text](assets/QUERY_BY_HEADERS.png)

### QUERY_BY_HEADERS2(data, query_text, show_headers)
Same as QUERY_BY_HEADERS, with an additional param:<br>
<code>**show_headers**</code> if FALSE the header will not be shown

Example: <code>=QUERY_BY_HEADERS2(A:F, "select \`name\`, \`age\`", FALSE)</code>

### DROP([drop_rows], [drop_cols])
Drops the specified number of rows/columns.
Supports negative indexing (i.e. from end of range).

<code>**range**</code> the array on which operate<br>
<code>**drop_rows**</code> (optional) num rows to drop (supports negative indexing)<br>
<code>**drop_cols**</code> (optional) num columns to drop (supports negative indexing)<br>

Example: <code>=DROP(A1:C5, 1, -1)</code>

![alt text](assets/DROP.png)

### TAKE([take_rows], [take_cols])
Takes the specified number of rows/columns (discards the rest).
Supports negative indexing (i.e. from end of range).

<code>**range**</code> the array on which operate<br>
<code>**take_rows**</code> (optional) num rows to take (supports negative indexing)<br>
<code>**take_cols**</code> (optional) num columns to take (supports negative indexing)<br>

Example: <code>=TAKE(A1:C5, 1, -2)</code>

![alt text](assets/TAKE.png)

### TEXTSPLIT(text, [col_delimiter], [row_delimiter], [ignore_empty], [pad_with])
Splits text at specified delimiters. Supports both row and column delimiters.

<code>**text**</code> the text on which operate<br>
<code>**col_delimiter**</code> (optional) columns will be split at this delimiter<br>
<code>**row_delimiter**</code> (optional) rows will be split at this delimiter<br>
<code>**ignore_empty**</code> (optional) specify TRUE to ignore consecutive delimiters. Defaults to FALSE, which creates an empty cell<br>
<code>**pad_with**</code> (optional) the value with which to pad the result (and empty cells). The default is ""

Example: <code>=TEXTSPLIT(A1, ",", ";", TRUE, "---")</code>

![alt text](assets/TEXTSPLIT.png)

### GET_DATA_RANGE(sheet_name, row_or_ref, col_or_ref, headers, max_rows, max_cols)
More powerful version of GET_SHEET_DATA. 

Returns data from the specified coords in 'sheet_name'. 

Output is a rectangular range extending from the cell identified by 'row_or_ref' and 'col_or_ref' of 'sheet_name' to the LAST non empty cell of the identified row and the LAST non empty cell of the identified column of the specified sheet.

The 'headers' parameter defines if/how to include headers.
'max_rows' and 'max_cols' limit the output size.

<code>**sheet_name**</code> The name of the sheet from which data will be extracted.<br>
<code>**row_or_ref**</code> (otional) row index or cell ref
<code>**col_or_ref**</code> (otional) column index or cell ref
<code>**headers**</code> An indicator of whether to include headers. 1 (default if not specified) will include headers. 0 will exclude headers. -1 will extract headers only.

Example: <code>=GET_DATA_RANGE("Retail Inventory", 1, 1, 0, 10,)</code>

![alt text](assets/GET_DATA_RANGE.png)

