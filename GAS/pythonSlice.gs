function log(...args) {
  Logger.log(args.map((arg) => {
    if (typeof arg === "object") return JSON.stringify(arg);
    return arg;
  }).join(" "));
}

/**
 * Helper function to apply slice parameters to a dimension
 * @param {number} len - Length of the dimension
 * @param {number} start - Start index
 * @param {number} stop - Stop index
 * @param {number} step - Step size
 * @return {Array} Array of indices to extract
 */
function getSliceIndices(len, start, stop, step) {
  // Handle default start based on step direction
  if (start === null) {
    start = step > 0 ? 0 : len - 1;
  }
    
  // Handle negative indices and default stop
  if (start < 0) {
    start = Math.max(0, len + start);
  }
  
  if (stop === null) {
    stop = step > 0 ? len : -1;
  } else if (stop < 0) {
    stop = Math.max(-1, len + stop);
  }

  // Clamp to bounds
  start = Math.max(0, Math.min(start, len));
  stop = Math.max(-1, Math.min(stop, len));
  
  const indices = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      indices.push(i);
    }
  } else {
    for (let i = start; i > stop; i += step) {
      indices.push(i);
    }
  }
  
  return indices;
}

/**
 * Parse a slice string into start, stop, step
 * @param {string} sliceStr - Slice string like "1:5" or "::2"
 * @return {Object} Object with start, stop, step properties
 */
function parseSliceStr(sliceStr) {
  const parts = sliceStr.split(':');
  
  let start = parts[0] === '' ? null : parseInt(parts[0]);
  let stop = parts[1] === '' || parts.length < 2 ? null : parseInt(parts[1]);
  let step = parts[2] === '' || parts.length < 3 ? 1 : parseInt(parts[2]);
  
  if (step === 0) {
    throw new Error('slice step cannot be zero');
  }
  
  return { start, stop, step };
}

/**
 * Replicates Python slicing syntax in Google Sheets
 * Works with 1D and 2D arrays (ranges)
 * 
 * Usage:
 *   1D: =PYTHON_SLICE(A1:A10, "1:5")
 *   2D rows: =PYTHON_SLICE(A1:C10, "1:5")
 *   2D rows & cols: =PYTHON_SLICE(A1:C10, "1:5,0:2")
 *   step: =PYTHON_SLICE(A1:C10, "1:5:2,0:2:2")
 * 
 * @param {Array} array - The array or range to slice
 * @param {string} sliceStr - Python-style slice string with optional row,col format
 * @return {Array} The sliced array
 * 
 * @customFunction
 */
function PYTHON_SLICE(array, sliceStr) {
  // Handle single values passed as scalar
  if (!Array.isArray(array)) {
    array = [[array]];
  }
  
  // Convert 1D array to 2D
  let is2D = Array.isArray(array[0]);
  if (!is2D) {
    array = array.map(val => [val]);
  }
  
  const numRows = array.length;
  const numCols = numRows > 0 ? array[0].length : 0;
  
  // Parse slice string - support "row_slice,col_slice" or just "row_slice"
  const sliceParts = sliceStr.split(',').map(s => s.trim());
  const rowSliceStr = sliceParts[0] || ':';
  const colSliceStr = sliceParts[1] || ':';
  
  // Parse row and column slices
  const rowSlice = parseSliceStr(rowSliceStr);
  const colSlice = parseSliceStr(colSliceStr);
  
  // Get indices for rows and columns
  const rowIndices = getSliceIndices(numRows, rowSlice.start, rowSlice.stop, rowSlice.step);
  const colIndices = getSliceIndices(numCols, colSlice.start, colSlice.stop, colSlice.step);
  log("arr", array)
  log("row", rowIndices)
  log("col", colIndices)
  // Extract sliced data
  const result = [];
  for (const rowIdx of rowIndices) {
    const newRow = [];
    for (const colIdx of colIndices) {
      newRow.push(array[rowIdx][colIdx]);
    }
    result.push(newRow);
  }
  
  // Return as 1D array if it's a single column
  if (result.length > 0 && result[0].length === 1 && !is2D) {
    return result.map(row => row[0]);
  }
  
  return result.length > 0 ? result : [null]; // returning [null], because returning [] results in #REF! error
}


/**
 * Shorthand function for common slicing operations
 * @param {Array} array - The array to slice
 * @param {string} sliceStr - Slice string
 * @return {*} Single value if result has 1 element, array otherwise
 * 
 * @customFunction
 */
function SLICE(array, sliceStr) {
  const result = PYTHON_SLICE(array, sliceStr);
  return result.length === 1 ? result[0] : result;
}


// Example usage and test cases
function testPythonSlice() {
  // 1D array tests
  const arr = ['a', 'b', 'c', 'd', 'e'];
  
  log('=== 1D Array Tests ===');
  log('Array:', arr);
  log('arr[1:3]:', PYTHON_SLICE(arr, '1:3'));      // ['b', 'c']
  log('arr[:2]:', PYTHON_SLICE(arr, ':2'));        // ['a', 'b']
  log('arr[2:]:', PYTHON_SLICE(arr, '2:'));        // ['c', 'd', 'e']
  log('arr[:]:', PYTHON_SLICE(arr, ':'));          // ['a', 'b', 'c', 'd', 'e']
  log('arr[::2]:', PYTHON_SLICE(arr, '::2'));      // ['a', 'c', 'e']
  log('arr[1::2]:', PYTHON_SLICE(arr, '1::2'));    // ['b', 'd']
  log('arr[::-1]:', PYTHON_SLICE(arr, '::-1'));    // ['e', 'd', 'c', 'b', 'a']
  log('arr[-2:]:', PYTHON_SLICE(arr, '-2:'));      // ['d', 'e']
  log('arr[:-1]:', PYTHON_SLICE(arr, ':-1'));      // ['a', 'b', 'c', 'd']
  log('arr[-3:-1]:', PYTHON_SLICE(arr, '-3:-1'));  // ['c', 'd']
  
  // 2D array tests
  const arr2d = [
    ['a', 'b', 'c'],
    ['d', 'e', 'f'],
    ['g', 'h', 'i'],
    ['j', 'k', 'l']
  ];
  
  log('\n=== 2D Array Tests ===');
  log('2D Array:');
  log('[[a, b, c], [d, e, f], [g, h, i], [j, k, l]]');
  log('arr[1:3] (rows 1-3):', PYTHON_SLICE(arr2d, '1:3'));
  log('arr[::2] (every 2nd row):', PYTHON_SLICE(arr2d, '::2'));
  log('arr[::-1] (reverse rows):', PYTHON_SLICE(arr2d, '::-1'));
  log('arr[1:3, 0:2] (rows 1-3, cols 0-2):', PYTHON_SLICE(arr2d, '1:3, 0:2'));
  log('arr[::2, 1:] (every 2nd row, cols 1+):', PYTHON_SLICE(arr2d, '::2, 1:'));
  log('arr[:, -1:] (all rows, last col):', PYTHON_SLICE(arr2d, ':, -1:'));
  log('arr[::-1, ::-1] (reverse rows & cols):', PYTHON_SLICE(arr2d, '::-1, ::-1'));

  const ss = SpreadsheetApp.getActiveSheet();
  const range = ss.getDataRange();
  const values = range.getValues();

  log("1:3", PYTHON_SLICE(values, "1:3"));
}

/**
 * @customFunction
 */
function testArguments() {
  var argArray = [];
  for (var arg in arguments) {
    argArray.push("arguments[" + arg + "] = " + JSON.stringify(arguments[arg]))
  }

  return argArray;
}
