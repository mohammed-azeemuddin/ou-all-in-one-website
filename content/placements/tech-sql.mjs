/**
 * SQL query and join questions (original). Each query question shows the sample tables as SQL
 * comments, then the query; scripts/verify-code.mjs runs every one in SQLite and checks the answer.
 * Answer format: columns separated by a space, rows separated by ", ".
 *
 * Exports SQL (rows in the usual shape: [question, code|null, correct, wrong1, wrong2, wrong3, explanation, topic])
 * and SQL_CHECKS ({ setup, query, correct }) for the verifier.
 */
const TABLES = {
  employees: {
    cols: ['id', 'name', 'dept_id', 'salary', 'manager_id'],
    rows: [[1, 'Asha', 10, 50000, null], [2, 'Ravi', 20, 40000, 1], [3, 'Neha', 10, 60000, 1], [4, 'Kiran', 30, 35000, 3], [5, 'Imran', null, 45000, 3]],
  },
  departments: { cols: ['id', 'dname'], rows: [[10, 'HR'], [20, 'IT'], [40, 'Sales']] },
  students: {
    cols: ['id', 'name', 'marks', 'city'],
    rows: [[1, 'Ali', 78, 'Hyd'], [2, 'Sana', 92, 'Pune'], [3, 'Ravi', 65, 'Hyd'], [4, 'Meera', 92, 'Delhi'], [5, 'John', null, 'Pune']],
  },
  orders: { cols: ['id', 'customer', 'amount'], rows: [[1, 'Amit', 500], [2, 'Bina', 300], [3, 'Amit', 700], [4, 'Chen', 200], [5, 'Bina', 400], [6, 'Amit', 100]] },
};
const SETS = { company: ['employees', 'departments'], emp: ['employees'], students: ['students'], orders: ['orders'] };

const show = (v) => (v === null ? 'NULL' : String(v));
/** Table as SQL comments. manager_id is only shown when the query uses it, to keep tables phone-width. */
function display(name, query) {
  const t = TABLES[name];
  const keep = t.cols.map((c) => c !== 'manager_id' || query.includes('manager_id'));
  const grid = [t.cols, ...t.rows.map((r) => r.map(show))].map((r) => r.filter((_, i) => keep[i]));
  const w = grid[0].map((_, i) => Math.max(...grid.map((r) => r[i].length)));
  return [`-- ${name}`, ...grid.map((r) => `-- ${r.map((c, i) => c.padEnd(w[i])).join(' | ').trimEnd()}`)].join('\n');
}
function setupSql(name) {
  const t = TABLES[name];
  const lit = (v) => (v === null ? 'NULL' : typeof v === 'number' ? v : `'${v}'`);
  return `CREATE TABLE ${name} (${t.cols.join(', ')});\n${t.rows.map((r) => `INSERT INTO ${name} VALUES (${r.map(lit).join(', ')});`).join('\n')}`;
}

export const SQL_CHECKS = [];
/** A query question on one of the sample table sets. */
function sq(set, q, query, correct, wrong, ex, topic) {
  const tables = SETS[set];
  SQL_CHECKS.push({ setup: tables.map(setupSql).join('\n'), query, correct });
  return [q, `${tables.map((n) => display(n, query)).join('\n\n')}\n\n${query}`, correct, ...wrong, ex, topic];
}

export const SQL = [
  // ---------- joins ----------
  sq('company', 'How many rows does this INNER JOIN return?', 'SELECT COUNT(*)\nFROM employees e\nJOIN departments d ON e.dept_id = d.id;', '3', ['5', '4', '2'], 'Only Asha, Ravi and Neha have a dept_id that exists in departments (10, 20). Kiran (30) and Imran (NULL) have no match.', 'Joins'),
  sq('company', 'How many rows does this LEFT JOIN return?', 'SELECT COUNT(*)\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.id;', '5', ['3', '4', '6'], 'A LEFT JOIN keeps every employee (5). Unmatched ones get NULL department columns.', 'Joins'),
  sq('company', 'What does this query return?', 'SELECT e.name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.id\nWHERE d.id IS NULL\nORDER BY e.name;', 'Imran, Kiran', ['Imran', 'Kiran', 'Sales'], 'LEFT JOIN + "IS NULL" finds employees with no matching department: Kiran (dept 30 does not exist) and Imran (NULL).', 'Joins'),
  sq('company', 'What does this RIGHT JOIN return?', 'SELECT d.dname\nFROM employees e\nRIGHT JOIN departments d ON e.dept_id = d.id\nWHERE e.id IS NULL;', 'Sales', ['HR', 'IT', 'NULL'], 'A RIGHT JOIN keeps every department. Only Sales (40) has no employee, so e.id is NULL for it.', 'Joins'),
  sq('company', 'What is the output?', 'SELECT d.dname, COUNT(e.id)\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.id\nGROUP BY d.dname\nORDER BY d.dname;', 'HR 2, IT 1, Sales 0', ['HR 2, IT 1', 'HR 2, IT 1, Sales 1', 'HR 1, IT 1, Sales 0'], 'The LEFT JOIN keeps Sales with a NULL employee; COUNT(e.id) skips NULLs, so Sales shows 0. COUNT(*) would have shown 1.', 'Joins'),
  sq('company', 'How many rows does this FULL OUTER JOIN return?', 'SELECT COUNT(*)\nFROM employees e\nFULL JOIN departments d ON e.dept_id = d.id;', '6', ['5', '7', '8'], '3 matched rows + 2 employees with no department (Kiran, Imran) + 1 department with no employee (Sales) = 6.', 'Joins'),
  sq('company', 'How many rows does this CROSS JOIN return?', 'SELECT COUNT(*)\nFROM employees\nCROSS JOIN departments;', '15', ['8', '5', '3'], 'A cross join pairs every row with every row: 5 × 3 = 15.', 'Joins'),
  sq('emp', 'Which employees does this self join return?', 'SELECT e.name\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE m.name = \'Neha\'\nORDER BY e.name;', 'Imran, Kiran', ['Asha, Ravi', 'Neha', 'Ravi, Neha'], 'Neha has id 3. Kiran and Imran have manager_id 3.', 'Joins'),
  sq('company', 'What is the output?', 'SELECT e.name, d.dname\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nWHERE e.salary > 45000\nORDER BY e.name;', 'Asha HR, Neha HR', ['Asha HR, Neha HR, Imran NULL', 'Neha HR', 'Asha HR, Ravi IT, Neha HR'], 'Joined rows are Asha, Ravi, Neha; of these only Asha (50000) and Neha (60000) earn more than 45000.', 'Joins'),
  sq('emp', 'What does this self join return?', 'SELECT e.name, m.name\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id\nWHERE e.salary < 45000\nORDER BY e.name;', 'Kiran Neha, Ravi Asha', ['Kiran Asha, Ravi Neha', 'Ravi Asha', 'Kiran NULL, Ravi Asha'], 'Ravi (40000) reports to id 1 (Asha); Kiran (35000) reports to id 3 (Neha).', 'Joins'),
  sq('company', 'Which departments have no employees?', 'SELECT dname\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e WHERE e.dept_id = d.id\n);', 'Sales', ['HR', 'IT', 'HR, IT'], 'NOT EXISTS keeps a department only when no employee row matches it.', 'Joins'),
  sq('company', 'What is the output?', 'SELECT name\nFROM employees\nWHERE dept_id IN (\n  SELECT id FROM departments WHERE dname IN (\'HR\', \'IT\')\n)\nORDER BY name;', 'Asha, Neha, Ravi', ['Asha, Neha', 'Ravi', 'Asha, Neha, Ravi, Kiran'], 'The subquery gives ids 10 and 20; employees in those are Asha, Neha (10) and Ravi (20).', 'Subqueries'),

  // ---------- subqueries and aggregates ----------
  sq('emp', 'What does this query return?', 'SELECT name\nFROM employees\nWHERE salary = (SELECT MAX(salary) FROM employees);', 'Neha', ['Asha', 'Imran', '60000'], 'The highest salary is 60000, which is Neha\'s.', 'Subqueries'),
  sq('emp', 'What is the second highest salary returned here?', 'SELECT MAX(salary)\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);', '50000', ['60000', '45000', '40000'], 'Excluding the top salary (60000), the highest remaining is 50000. A classic interview query.', 'Subqueries'),
  sq('emp', 'Who earns more than the average salary?', 'SELECT name\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY name;', 'Asha, Neha', ['Asha, Imran, Neha', 'Neha', 'Imran, Kiran, Ravi'], 'Average = 230000 / 5 = 46000. Only Asha (50000) and Neha (60000) are above it.', 'Subqueries'),
  sq('emp', 'What is the output?', 'SELECT dept_id, SUM(salary)\nFROM employees\nWHERE dept_id IS NOT NULL\nGROUP BY dept_id\nORDER BY dept_id;', '10 110000, 20 40000, 30 35000', ['10 50000, 20 40000, 30 35000', '10 110000, 20 40000, 30 35000, NULL 45000', '10 55000, 20 40000, 30 35000'], 'Dept 10 has Asha + Neha = 110000. Imran (NULL) is filtered out by the WHERE clause.', 'Aggregates'),
  sq('emp', 'What is the output?', 'SELECT COUNT(dept_id)\nFROM employees;', '4', ['5', '3', '0'], 'COUNT(column) skips NULLs. Imran\'s dept_id is NULL, so 4. COUNT(*) would give 5.', 'Aggregates'),
  sq('emp', 'What is the output?', 'SELECT COUNT(DISTINCT manager_id)\nFROM employees;', '2', ['3', '4', '5'], 'manager_id values are NULL, 1, 1, 3, 3. Distinct non-NULL values: 1 and 3.', 'Aggregates'),
  sq('emp', 'What does this query return?', 'SELECT COUNT(*)\nFROM employees\nWHERE dept_id = NULL;', '0', ['1', '5', '4'], 'Any comparison with NULL using "=" is unknown, so no row matches. Use "dept_id IS NULL" instead.', 'Basics'),
  sq('emp', 'What does this return?', 'SELECT name\nFROM employees\nORDER BY salary DESC\nLIMIT 2;', 'Neha, Asha', ['Asha, Neha', 'Kiran, Ravi', 'Neha, Imran'], 'Sorted high to low: Neha 60000, Asha 50000, … LIMIT 2 keeps the first two.', 'Basics'),
  sq('emp', 'What does this return?', 'SELECT name\nFROM employees\nORDER BY salary\nLIMIT 1 OFFSET 1;', 'Ravi', ['Kiran', 'Imran', 'Asha'], 'Ascending: Kiran 35000, Ravi 40000, … OFFSET 1 skips Kiran, LIMIT 1 takes Ravi.', 'Basics'),
  sq('emp', 'What is the output after these statements?', 'UPDATE employees\nSET salary = salary + 5000\nWHERE dept_id = 10;\n\nSELECT SUM(salary) FROM employees;', '240000', ['230000', '235000', '255000'], 'The total starts at 230000. Two employees in dept 10 get +5000 each: 240000.', 'Basics'),
  sq('emp', 'What is the output after these statements?', 'DELETE FROM employees\nWHERE salary < 45000;\n\nSELECT COUNT(*) FROM employees;', '3', ['2', '4', '5'], 'Ravi (40000) and Kiran (35000) are deleted; 3 rows remain. Imran (45000) is not less than 45000.', 'Basics'),

  // ---------- filtering, sorting, NULLs ----------
  sq('students', 'What is the output?', 'SELECT name\nFROM students\nWHERE city = \'Hyd\' AND marks > 70;', 'Ali', ['Ali, Ravi', 'Ravi', 'Ali, Sana'], 'Hyderabad students are Ali (78) and Ravi (65); only Ali has more than 70.', 'Basics'),
  sq('students', 'What is the output?', 'SELECT name\nFROM students\nORDER BY marks DESC, name\nLIMIT 2;', 'Meera, Sana', ['Sana, Meera', 'Meera, Ali', 'John, Meera'], 'Meera and Sana tie on 92, so the second sort key (name) puts Meera first. In SQLite, NULL sorts last in DESC order.', 'Basics'),
  sq('students', 'What is the output?', 'SELECT COUNT(DISTINCT city)\nFROM students;', '3', ['5', '2', '4'], 'Cities: Hyd, Pune, Delhi.', 'Aggregates'),
  sq('students', 'What is the output?', 'SELECT AVG(marks)\nFROM students;', '81.75', ['65.4', '92', '78'], 'AVG ignores NULL: (78 + 92 + 65 + 92) / 4 = 81.75, not divided by 5.', 'Aggregates'),
  sq('students', 'What is the output?', 'SELECT city, COUNT(*)\nFROM students\nGROUP BY city\nORDER BY city;', 'Delhi 1, Hyd 2, Pune 2', ['Delhi 1, Hyd 2, Pune 1', 'Hyd 2, Pune 2', 'Delhi 1, Hyd 1, Pune 2'], 'COUNT(*) counts rows, including John whose marks are NULL.', 'Aggregates'),
  sq('students', 'Which names does this LIKE pattern match?', 'SELECT name\nFROM students\nWHERE name LIKE \'%a\'\nORDER BY name;', 'Meera, Sana', ['Sana', 'Ali, Sana', 'Meera, Ravi, Sana'], '"%a" means any characters followed by a final "a": Meera and Sana.', 'Basics'),
  sq('students', 'What is the output?', 'SELECT COUNT(*)\nFROM students\nWHERE marks BETWEEN 65 AND 78;', '2', ['1', '0', '3'], 'BETWEEN includes both ends: Ravi (65) and Ali (78).', 'Basics'),
  sq('students', 'What is the output?', 'SELECT name\nFROM students\nWHERE marks IS NULL;', 'John', ['No rows', 'NULL', 'John, Sana'], 'Only John has no marks.', 'Basics'),
  sq('students', 'What is the output?', 'SELECT COUNT(*)\nFROM students\nWHERE marks = (SELECT MAX(marks) FROM students);', '2', ['1', '92', '5'], 'The maximum is 92 and two students (Sana, Meera) have it.', 'Subqueries'),
  sq('students', 'What is the output?', 'SELECT name, COALESCE(marks, 0)\nFROM students\nWHERE city = \'Pune\'\nORDER BY name;', 'John 0, Sana 92', ['John NULL, Sana 92', 'Sana 92', 'John 92, Sana 0'], 'COALESCE returns the first non-NULL value, so John\'s NULL becomes 0.', 'Basics'),
  sq('students', 'Who is marked "Fail" by this CASE expression?', 'SELECT name\nFROM students\nWHERE CASE WHEN marks >= 75 THEN \'Pass\'\n           ELSE \'Fail\' END = \'Fail\'\nORDER BY name;', 'John, Ravi', ['Ravi', 'John', 'Ali, Ravi'], 'Ravi (65) fails. For John, NULL >= 75 is not true, so CASE falls to ELSE and he is also "Fail".', 'Basics'),
  sq('students', 'What is the output of this window function?', 'SELECT name, RANK() OVER (ORDER BY marks DESC)\nFROM students\nWHERE marks IS NOT NULL\nORDER BY 2, name;', 'Meera 1, Sana 1, Ali 3, Ravi 4', ['Meera 1, Sana 1, Ali 2, Ravi 3', 'Meera 1, Sana 2, Ali 3, Ravi 4', 'Ali 1, Meera 2, Ravi 3, Sana 4'], 'RANK gives ties the same rank and then skips: 1, 1, 3, 4.', 'Window functions'),
  sq('students', 'What is the output of this window function?', 'SELECT name, DENSE_RANK() OVER (ORDER BY marks DESC)\nFROM students\nWHERE marks IS NOT NULL\nORDER BY 2, name;', 'Meera 1, Sana 1, Ali 2, Ravi 3', ['Meera 1, Sana 1, Ali 3, Ravi 4', 'Meera 1, Sana 2, Ali 3, Ravi 4', 'Meera 1, Sana 1, Ali 2, Ravi 4'], 'DENSE_RANK gives ties the same rank without gaps: 1, 1, 2, 3.', 'Window functions'),

  // ---------- GROUP BY / HAVING / UNION ----------
  sq('orders', 'Which customers does this return?', 'SELECT customer\nFROM orders\nGROUP BY customer\nHAVING SUM(amount) > 600\nORDER BY customer;', 'Amit, Bina', ['Amit', 'Amit, Bina, Chen', 'Bina'], 'Totals: Amit 1300, Bina 700, Chen 200. HAVING keeps groups above 600.', 'Group by and having'),
  sq('orders', 'What is the output?', 'SELECT customer, COUNT(*)\nFROM orders\nGROUP BY customer\nHAVING COUNT(*) >= 2\nORDER BY customer;', 'Amit 3, Bina 2', ['Amit 3, Bina 2, Chen 1', 'Amit 3', 'Amit 2, Bina 2'], 'Amit has 3 orders, Bina 2, Chen 1 (filtered out).', 'Group by and having'),
  sq('orders', 'What is the output? (Note: WHERE runs before GROUP BY.)', 'SELECT customer, SUM(amount)\nFROM orders\nWHERE amount > 200\nGROUP BY customer\nORDER BY customer;', 'Amit 1200, Bina 700', ['Amit 1300, Bina 700, Chen 200', 'Amit 1200, Bina 700, Chen 0', 'Amit 1300, Bina 700'], 'WHERE removes the 200 and 100 orders first. Amit: 500 + 700, Bina: 300 + 400, and Chen has no rows left.', 'Group by and having'),
  sq('orders', 'What is the output?', 'SELECT customer, MAX(amount)\nFROM orders\nGROUP BY customer\nORDER BY customer;', 'Amit 700, Bina 400, Chen 200', ['Amit 500, Bina 300, Chen 200', 'Amit 1300, Bina 700, Chen 200', 'Amit 700'], 'MAX is taken within each customer\'s group.', 'Group by and having'),
  sq('orders', 'Which customer does this return?', 'SELECT customer\nFROM orders\nGROUP BY customer\nORDER BY SUM(amount) DESC\nLIMIT 1;', 'Amit', ['Bina', 'Chen', 'Amit, Bina'], 'Amit has the largest total (1300).', 'Group by and having'),
  sq('orders', 'What is the output?', 'SELECT customer FROM orders WHERE amount > 400\nUNION\nSELECT customer FROM orders WHERE amount < 300\nORDER BY customer;', 'Amit, Chen', ['Amit, Amit, Amit, Chen', 'Amit, Bina, Chen', 'Chen'], '> 400 gives Amit twice; < 300 gives Chen and Amit. UNION removes duplicates: Amit, Chen.', 'Set operations'),
  sq('orders', 'How many rows does UNION ALL give here?', 'SELECT COUNT(*) FROM (\n  SELECT customer FROM orders WHERE amount > 400\n  UNION ALL\n  SELECT customer FROM orders WHERE amount < 300\n);', '4', ['2', '3', '6'], 'UNION ALL keeps duplicates: 2 rows (> 400) + 2 rows (< 300) = 4.', 'Set operations'),
  sq('orders', 'What does this return?', 'SELECT customer FROM orders WHERE amount >= 400\nINTERSECT\nSELECT customer FROM orders WHERE amount <= 300\nORDER BY customer;', 'Amit, Bina', ['Amit', 'Bina, Chen', 'Amit, Bina, Chen'], 'Customers with an order ≥ 400: Amit, Bina. With an order ≤ 300: Bina, Chen, Amit. Both: Amit, Bina.', 'Set operations'),
  sq('orders', 'What does this return?', 'SELECT customer FROM orders\nEXCEPT\nSELECT customer FROM orders WHERE amount > 350;', 'Chen', ['Bina', 'Amit, Chen', 'No rows'], 'Customers with an order above 350 are Amit and Bina; removing them leaves Chen.', 'Set operations'),

  // ---------- concepts (no tables) ----------
  ['Which join returns only the rows that have matching values in both tables?', null, 'INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'An inner join keeps matching rows only.', 'Joins'],
  ['Which join returns all rows from the left table and the matching rows from the right table?', null, 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'SELF JOIN', 'Unmatched left rows get NULLs for the right table\'s columns.', 'Joins'],
  ['In a LEFT JOIN, what appears in the right table\'s columns when there is no match?', null, 'NULL', '0', 'An empty string', 'The previous row\'s value', 'Missing values are filled with NULL.', 'Joins'],
  ['Joining a table to itself, for example to pair employees with their managers, is called a:', null, 'Self join', 'Cross join', 'Natural join', 'Outer join', 'The same table is used twice with different aliases.', 'Joins'],
  ['A CROSS JOIN between a table of 4 rows and a table of 6 rows returns:', null, '24 rows', '10 rows', '6 rows', '4 rows', 'A cross join returns the Cartesian product: 4 × 6.', 'Joins'],
  ['A NATURAL JOIN joins two tables on:', null, 'All columns with the same name in both tables', 'The primary key only', 'Every possible pair of rows', 'Columns chosen at random', 'It matches on all same-named columns automatically.', 'Joins'],
  ['What is the logical order in which these clauses are evaluated?', null, 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY', 'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY', 'FROM → GROUP BY → WHERE → SELECT → HAVING → ORDER BY', 'SELECT → WHERE → FROM → ORDER BY → GROUP BY → HAVING', 'This is why a column alias from SELECT cannot be used in WHERE.', 'Basics'],
  ['Which statement about WHERE and HAVING is correct?', null, 'WHERE filters rows before grouping; HAVING filters groups after grouping', 'They are exactly the same', 'HAVING runs before WHERE', 'WHERE can use aggregate functions like SUM directly', 'Aggregates such as SUM(amount) > 600 belong in HAVING.', 'Group by and having'],
  ['What is the difference between UNION and UNION ALL?', null, 'UNION removes duplicate rows; UNION ALL keeps them', 'UNION ALL removes duplicates; UNION keeps them', 'UNION joins columns side by side', 'There is no difference', 'UNION ALL is faster because it skips duplicate removal.', 'Set operations'],
  ['A subquery that refers to a column of the outer query and runs once for each outer row is a:', null, 'Correlated subquery', 'Scalar subquery', 'Derived table', 'Common table expression', 'Example: WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id).', 'Subqueries'],
  ['Which query correctly finds employees whose department does not exist in the departments table?', null, 'LEFT JOIN departments, then WHERE departments.id IS NULL', 'INNER JOIN departments, then WHERE departments.id IS NULL', 'CROSS JOIN departments', 'WHERE dept_id = NULL', 'An inner join already drops unmatched rows, and "= NULL" never matches.', 'Joins'],
  ['Which aggregate counts every row, including rows with NULL values?', null, 'COUNT(*)', 'COUNT(column)', 'SUM(column)', 'AVG(column)', 'COUNT(column) and the other aggregates skip NULLs.', 'Aggregates'],
  ['Which keyword removes duplicate rows from a SELECT result?', null, 'DISTINCT', 'UNIQUE', 'GROUP', 'DIFFERENT', 'SELECT DISTINCT city FROM students;', 'Basics'],
  ['Which statement is used to remove all rows from a table quickly while keeping its structure?', null, 'TRUNCATE TABLE', 'DROP TABLE', 'DELETE DATABASE', 'REMOVE TABLE', 'DROP removes the table itself; TRUNCATE empties it.', 'Basics'],
  ['Which SQL clause names a temporary result set that can be used in the main query, like a named subquery?', null, 'WITH (a common table expression)', 'GROUP BY', 'HAVING', 'INTO', 'WITH high AS (SELECT …) SELECT * FROM high;', 'Subqueries'],
];
