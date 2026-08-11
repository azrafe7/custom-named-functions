# contents
 - [GET_SHEET_DATA](#get_sheet_data)
 - [REPLACE_COLS](#replace_cols)
 - [SKIP_ROWS](#skip_rows)
 - [QUERY_BY_HEADERS](#query_by_headers)
 - [QUERY_BY_HEADERS2](#query_by_headers2)
 - [DROP](#drop)
 - [TAKE](#take)
 - [TEXTSPLIT](#textsplit)
 - [GET_DATA_RANGE](#get_data_range)
 - [INDIRECT_ADDRESS](#indirect_address)

### GET_SHEET_DATA
(sheet_name, headers)

```
=LET(
  sheet_ref, "'" & sheet_name & "'!", 
  first_col, INDIRECT(sheet_ref & "A:A"), 
  first_row, INDIRECT(sheet_ref & "A1:1"), 
  num_rows, MAX(ARRAYFORMULA(ROW(first_col)*(first_col<>""))), 
  num_cols, MAX(ARRAYFORMULA(COLUMN(first_row)*(first_row<>""))), 
  data, INDIRECT(sheet_ref & "A1:" & ADDRESS(num_rows,num_cols,4)), 
  IF(
    OR(headers=1,ISBLANK(headers)),
    data, 
    IF(
      headers=0, 
      CHOOSEROWS(data,SEQUENCE(num_rows-1,1,2)), 
      IF(headers=-1, CHOOSEROWS(data,1), NA())
    )
  )
)
```

### REPLACE_COLS
(text, columns)

```
=REDUCE(
  text, 
  FILTER(columns, NOT(ISBLANK(columns))), 
  LAMBDA(res, col, REGEXREPLACE(res, "`" & col & "`", "Col" & MATCH(col, columns, 0)))
)
```

### SKIP_ROWS
(data, rows_to_skip)

```
=FILTER(data, MAKEARRAY(ROWS(data), 1, LAMBDA(ri, ci, ri > rows_to_skip)))
```

### QUERY_BY_HEADERS
(data, query_text)

```
=QUERY({data}, LAMBDA(text, columns,
  REDUCE(text, FILTER(columns, NOT(ISBLANK(columns))), LAMBDA(res, col,
    REGEXREPLACE(res, "`" & col & "`", "Col" & MATCH(col, columns, 0))))
  )(query_text, ARRAY_CONSTRAIN(data, 1, COLUMNS(data))),
1)
```


### QUERY_BY_HEADERS2
(data, query_text, show_headers)

```
=LAMBDA(result, IF(show_headers, result, SKIP_ROWS(result, 1)))
(QUERY({data}, REPLACE_COLS(query_text, ARRAY_CONSTRAIN(data, 1, COLUMNS(data))), 1))
```

### DROP
([drop_rows], [drop_cols])

```
=LET(
  src_rows, ROWS(range),
  src_cols, COLUMNS(range),
  start_row, IF(drop_rows > 0, drop_rows + 1, 1),
  end_row, IF(drop_rows > 0, src_rows, src_rows + drop_rows),
  start_col, IF(drop_cols > 0, drop_cols + 1, 1),
  end_col, IF(drop_cols > 0, src_cols, src_cols + drop_cols),
  rcind, {start_row, end_row; start_col, end_col},
  dst_rows, end_row-start_row + 1,
  dst_cols, end_col-start_col + 1,
  result, MAKEARRAY(dst_rows, dst_cols, 
    LAMBDA(r, c, INDEX(range, r + start_row - 1, c + start_col - 1))
  ),
  result
)
```

### TAKE
([take_rows], [take_cols])

```
=LET(
  src_rows, ROWS(range),
  src_cols, COLUMNS(range),
  start_row, IF(take_rows < 0, src_rows + take_rows + 1, 1),
  end_row, IF(take_rows <= 0, src_rows, take_rows),
  start_col, IF(take_cols < 0, src_cols + take_cols + 1, 1),
  end_col, IF(take_cols <= 0, src_cols, take_cols),
  rcind, {start_row, end_row; start_col, end_col},
  dst_rows, end_row - start_row + 1,
  dst_cols, end_col - start_col + 1,
  result, MAKEARRAY(dst_rows, dst_cols, 
    LAMBDA(r, c, INDEX(range, r + start_row - 1, c + start_col - 1))
  ),
  result
)
```

### TEXTSPLIT
(text, [col_delimiter], [row_delimiter], [ignore_empty], [pad_with])

```
=LET(
  colDelim, IF(ISBLANK(col_delimiter), "", col_delimiter),
  rowDelim, IF(ISBLANK(row_delimiter), "", row_delimiter),
  ignoreEmpty, IF(ISBLANK(ignore_empty), FALSE, ignore_empty),
  padValue, IF(ISBLANK(pad_with), "", pad_with),
  
  rawRowSplit, IF(rowDelim = "",
    {text},
    SPLIT(text, rowDelim, FALSE, ignoreEmpty)
  ),
  
  rowSplit, TRANSPOSE(rawRowSplit),
      
  splitted, IF(colDelim = "",
    rowSplit,
    ARRAYFORMULA(IF(rowSplit = "", "", SPLIT(rowSplit, colDelim, FALSE, ignoreEmpty)))
  ),
  padded, MAKEARRAY(ROWS(splitted), COLUMNS(splitted),
    LAMBDA(r, c, IF(INDEX(splitted, r, c) = "", padValue, INDEX(splitted, r, c)))
  ),
  padded
)
```

### GET_DATA_RANGE
(sheet_name, row_or_ref, col_or_ref, headers, max_rows, max_cols)

```
=LET(
  sheet_ref, "'" & sheet_name & "'!",
  first_row_index, IF(ISREF(row_or_ref), ROW(row_or_ref), row_or_ref),
  first_col_index, IF(ISREF(col_or_ref), COLUMN(col_or_ref), col_or_ref),
  first_cell_address, ADDRESS(first_row_index, first_col_index),
  max_row_index, IF(max_rows, first_row_index + max_rows - 1, first_row_index),
  max_col_index, IF(max_cols, first_col_index + max_cols - 1, first_col_index),
  first_cell_col, REGEXEXTRACT(first_cell_address, "[A-Za-z]+"),
  first_row_address, sheet_ref & first_cell_address & ":" & IF(ISBLANK(max_cols), first_row_index, ADDRESS(first_row_index, max_col_index)),
  first_row, INDIRECT(first_row_address), 
  first_col_address, sheet_ref & first_cell_address & ":" & IF(ISBLANK(max_rows), first_cell_col, first_cell_col & max_row_index),
  first_col, INDIRECT(first_col_address), 
  num_rows, MAX(ARRAYFORMULA(ROW(first_col)*(first_col<>""))), 
  num_cols, MAX(ARRAYFORMULA(COLUMN(first_row)*(first_row<>""))), 
  data_address, sheet_ref & first_cell_address & ":" & ADDRESS(num_rows,num_cols,4),
  data, INDIRECT(data_address), 
  result, IF(
    OR(headers=1,ISBLANK(headers)),
    data, 
    IF(
      headers=0, 
      CHOOSEROWS(data,SEQUENCE(num_rows-1,1,2)), 
      IF(headers=-1, CHOOSEROWS(data,1), NA())
    )
  ),
  addrs, {first_cell_address, first_row_address, first_col_address, data_address},
  result
)
```

### INDIRECT_ADDRESS
(row_or_ref, col_or_ref, sheet_name)
```
=LET(
  sheet_ref, "'" & sheet_name & "'!",
  first_row_index, IF(ISREF(row_or_ref), ROW(row_or_ref), row_or_ref),
  first_col_index, IF(ISREF(col_or_ref), COLUMN(col_or_ref), col_or_ref),
  first_cell_col, REGEXEXTRACT(ADDRESS(1, first_col_index), "[A-Za-z]+"),
  whole_row_address, sheet_ref & first_row_index & ":" & first_row_index,
  whole_col_address, sheet_ref & first_cell_col & ":" & first_cell_col,
  data_address, IFS(
    ISBLANK(row_or_ref), whole_col_address,
    ISBLANK(col_or_ref), whole_row_address,
    TRUE, sheet_ref & ADDRESS(first_row_index, first_col_index)
  ),
  data, INDIRECT(data_address),
  data
)
```

### STARTS_WITH
(text, search_for, [ignore_case])
```
=LET(
  _ignore_case, IF(ISBLANK(ignore_case), TRUE, ignore_case),
  _text, IF(_ignore_case, LOWER(text), text),
  _search_for, IF(_ignore_case, LOWER(search_for), search_for),
  _search_for_length, LEN(_search_for),
  result, EXACT(LEFT(_text, _search_for_length), _search_for),
  result
)
```

### ENDS_WITH
(text, search_for, [ignore_case])
```
=LET(
  _ignore_case, IF(ISBLANK(ignore_case), TRUE, ignore_case),
  _text, IF(_ignore_case, LOWER(text), text),
  _search_for, IF(_ignore_case, LOWER(search_for), search_for),
  _search_for_length, LEN(_search_for),
  result, EXACT(RIGHT(_text, _search_for_length), _search_for),
  result
)
```

### TEXT_CONTAINS
(text, search_for, [ignore_case])
```
=LET(
  _ignore_case, IF(ISBLANK(ignore_case), TRUE, ignore_case),
  _text, IF(_ignore_case, LOWER(text), text),
  _search_for, IF(_ignore_case, LOWER(search_for), search_for),
  _search_for_length, LEN(_search_for),
  result, IF(_search_for = "", 0, FIND(_search_for, _text)),
  IFERROR(result >= 0, FALSE)
)
```

