# Contents
 - [GET_SHEET_DATA](#get_sheet_data)
 - [REPLACE_COLS](#replace_cols)
 - [SKIP_ROWS](#skip_rows)
 - [QUERY_BY_HEADERS](#query_by_headers)
 - [QUERY_BY_HEADERS2](#query_by_headers2)
 - [DROP](#drop)
 - [TAKE](#take)
 - [TEXTSPLIT](#textsplit)

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

