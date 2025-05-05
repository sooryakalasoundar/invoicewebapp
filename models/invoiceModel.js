// models/invoiceModel.js
const db = require('./db'); // Adjust the path if needed

// Get all invoices
exports.getAllInvoices = async () => {
  const [results] = await db.query('SELECT * FROM tbl_invoiceid');
  return results;
};

// Get a single invoice by ID
exports.getInvoiceById = async (id) => {
  const [results] = await db.query('SELECT * FROM tbl_invoiceid WHERE id = ?', [id]);
  return results[0];
};

// Get all items for a specific invoice
exports.getInvoiceItems = async (invoice_id) => {
  const [results] = await db.query('SELECT * FROM tbl_invoiceitems WHERE invoice_id = ?', [invoice_id]);
  return results;
};

// Create a new invoice and return the insert ID
exports.createInvoice = async (invoice_id, invoice_to, inv_date) => {
  const [result] = await db.query('INSERT INTO tbl_invoiceid (invoice_id, invoice_to, inv_date) VALUES (?, ?, ?)', [invoice_id, invoice_to, inv_date]);
  return result.insertId;
};

// Add a new item to an invoice
exports.addInvoiceItem = async (invoice_id, details, quantity, rate_per) => {
  const total = quantity * rate_per;
  await db.query('INSERT INTO tbl_invoiceitems (invoice_id, details, quantity, rate_per, total) VALUES (?, ?, ?, ?, ?)', [invoice_id, details, quantity, rate_per, total]);
    await db.query(`
  UPDATE tbl_invoiceid
  SET final_total = (
    SELECT IFNULL(SUM(total), 0)
    FROM tbl_invoiceitems
    WHERE invoice_id = ?
  )
  WHERE id = ?
`, [invoice_id, invoice_id]);  
  
};

// Update an invoice
exports.updateInvoice = async (invoice_id, invoice_to, inv_date) => {
  await db.query('UPDATE tbl_invoiceid SET invoice_to = ?, inv_date = ? WHERE id = ?', [invoice_to, inv_date, id]);
};

// Update an invoice item
exports.updateInvoiceItem = async (item_id, details, quantity, rate_per) => {
  const total = quantity * rate_per;
  await db.query('UPDATE tbl_invoiceitems SET details = ?, quantity = ?, rate_per = ?, total = ? WHERE id = ?', [details, quantity, rate_per, total, item_id]);
};

//calculate final totoal sum of all total
exports.updateInvoiceFinalTotal = async (invoiceId) => {
    await db.query(`
    UPDATE tbl_invoiceid
    SET final_total = (
      SELECT IFNULL(SUM(total), 0)
      FROM tbl_invoiceitems
      WHERE invoice_id = ?
    )
    WHERE id = ?
  `, [invoiceId, invoiceId]);
};

exports.insertInvoiceItem = async (invoiceId, details, quantity, rate_per) => {
    const total = quantity * rate_per;
    await db.query('INSERT INTO tbl_invoiceitems (invoice_id, details, quantity, rate_per, total) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, details, quantity, rate_per, total]);
};


//delete invoice
exports.deleteInvoiceItem = async (itemId) => {
    await db.query('DELETE FROM tbl_invoiceitems WHERE id = ?', [itemId]);
};

//print pdf
exports.printInvoice = async (invoice_id) => {
    const [results] = await db.query('SELECT * FROM tbl_invoiceitems WHERE invoice_id = ?', [invoice_id]);
    return results;
};

