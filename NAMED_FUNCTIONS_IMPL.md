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
 - [STARTS_WITH](#starts_with)
 - [ENDS_WITH](#ends_with)
 - [TEXT_CONTAINS](#text_contains)
 - [TEXT_REVERSE](#text_reverse)
 - [REVERSE_RANGE](#reverse_range)
 - [MAP_RANGE](#map_range)
 - [TRIMRANGE](#trimrange)

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
=LAMBDA(text, col_delimiter, row_delimiter, ignore_empty, pad_with,
LET(
  colDelim, col_delimiter,
  rowDelim, row_delimiter,
  ignoreEmpty, IF(ISBLANK(ignore_empty), FALSE, ignore_empty),
  padValue, IF(ISBLANK(pad_with), "", pad_with),
  
  rawRowSplit, IF(
    ISBLANK(rowDelim), {text}, IF(
      rowDelim = "", ARRAYFORMULA(MID(text, SEQUENCE(1, LEN(text)), 1)),
      SPLIT(text, rowDelim, FALSE, ignoreEmpty)
    )
  ),
 
  rowSplit, TRANSPOSE(rawRowSplit),
      
  splitted, IF(
    ISBLANK(colDelim), rowSplit, IF(
      colDelim = "", BYROW(rowSplit, LAMBDA(rowText, ARRAYFORMULA(MID(rowText, SEQUENCE(1,LEN(rowText)), 1)))),
      ARRAYFORMULA(IF(rowSplit = "", "", SPLIT(rowSplit, colDelim, FALSE, ignoreEmpty)))
    )
  ),
  padded, MAKEARRAY(ROWS(splitted), COLUMNS(splitted),
    LAMBDA(r, c, IF(INDEX(splitted, r, c) = "", padValue, INDEX(splitted, r, c)))
  ),
  IF(text="", "", padded)
)
)(text, col_delimiter, row_delimiter, ignore_empty, pad_with)
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

### TEXT_REVERSE
(text)
```
=LAMBDA(text, 
  IF(text="", "", TEXTJOIN("", FALSE, ARRAYFORMULA(MID(text, SEQUENCE(1, LEN(text), LEN(text), -1), 1))))
)(text)
```

### REVERSE_RANGE
(range, reverse_rows, reverse_cols)
```
=LAMBDA(range, reverse_rows, reverse_cols,
LET(
  _reverse_rows, IF(ISBLANK(reverse_rows), TRUE, reverse_rows),
  _reverse_cols, IF(ISBLANK(reverse_cols), TRUE, reverse_cols),
  num_rows, ROWS(range),
  num_cols, COLUMNS(range),
  reversed_rows, IF(_reverse_rows, CHOOSEROWS(range, SEQUENCE(num_rows, 1, num_rows, -1)), range),
  reversed_cols, IF(_reverse_cols, CHOOSECOLS(reversed_rows, SEQUENCE(1, num_cols, num_cols, -1)), reversed_rows),
  reversed_cols
)
)(range, reverse_rows, reverse_cols)
```

### MAP_RANGE
(range, func)
```
=LAMBDA(range, func,
LET(
  num_rows, ROWS(range),
  num_cols, COLUMNS(range),
  MAKEARRAY(num_rows, num_cols, LAMBDA(r, c, func(INDEX(range, r, c), r, c)))
)
)(range, func)
```

### TRIMRANGE
(range, trim_rows, trim_columns)
```
=LET(
  _trim_rows, IF(ISBLANK(trim_rows), 3, trim_rows),
  _trim_columns, IF(ISBLANK(trim_columns), 3, trim_columns),
  num_rows, ROWS(range),
  num_cols, COLUMNS(range),
  not_empty_row_indices, MAKEARRAY(num_rows, num_cols, LAMBDA(r, c, IF(INDEX(range, r, c) = "", 0, r))),
  not_empty_col_indices, MAKEARRAY(num_rows, num_cols, LAMBDA(r, c, IF(INDEX(range, r, c) = "", 0, c))),

  min_r, IF(OR(_trim_rows=0, _trim_rows=2), 1, REDUCE(0, not_empty_row_indices, LAMBDA(acc, idx, IF(AND(idx>0, acc=0), idx, acc)))),
  max_r, IF(OR(_trim_rows=0, _trim_rows=1), num_rows, REDUCE(0, not_empty_row_indices, LAMBDA(acc, idx, IF(idx=0, acc, idx)))),
  min_c, IF(OR(_trim_columns=0, _trim_columns=2), 1, REDUCE(0, TRANSPOSE(not_empty_col_indices), LAMBDA(acc, idx, IF(AND(idx>0, acc=0), idx, acc)))),
  max_c, IF(OR(_trim_columns=0, _trim_columns=1), num_cols, REDUCE(0, TRANSPOSE(not_empty_col_indices), LAMBDA(acc, idx, IF(idx=0, acc, idx)))),
  
  res_rows, max_r - min_r + 1,
  res_cols, max_c - min_c + 1,
  res_indices, {"", "min", "max", "len"; "row_indices", min_r, max_r, res_rows; "col_indices", min_c, max_c, res_cols},
  res, MAKEARRAY(res_rows, res_cols, LAMBDA(r, c, INDEX(range, min_r + r - 1, min_c + c - 1))),
  res
)
```
