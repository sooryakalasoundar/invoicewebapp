// controllers/invoiceController.js
const model = require('../models/invoiceModel');
const db = require('../models/db');
const { openDelimiter } = require('ejs');

// homepage 
exports.renderHomepage = (req, res) => {
    res.render('homepage');
};


// View all invoices
exports.viewInvoices = async (req, res) => {
  try {
    const invoices = await model.getAllInvoices();
    res.render('invoices', { invoices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching invoices');
  }
};

// View a single invoice by ID
exports.viewInvoiceById = async (req, res) => {
  try {
    const invoiceid = req.params.id;
    const invoice = await model.getInvoiceById(invoiceid);
    const items = await model.getInvoiceItems(invoiceid);
    res.render('template', { invoice, items });
  } catch (err) {
    res.status(500).send('Error fetching invoice');
  }
};

// Render invoice form
exports.createInvoiceForm = (req, res) => {
  res.render('form');
};

// Handle form POST to create invoice
exports.createInvoice = async (req, res) => {
  try {
    const { invoice_to, inv_date, details, quantity, rate_per } = req.body;

    // Auto-generate invoice_id (e.g., INV-0001)
    const invoice_id = 'INV-' + (await model.getAllInvoices()).length + 1;

    const invoicePrimaryId = await model.createInvoice(invoice_id, invoice_to, inv_date);

    if (Array.isArray(details)) {
      for (let i = 0; i < details.length; i++) {
        await model.addInvoiceItem(invoicePrimaryId, details[i], quantity[i], rate_per[i]);
      }
    } else {
      await model.addInvoiceItem(invoicePrimaryId, details, quantity, rate_per);
    }
    await model.recalculateFinalTotal(invoiceId);
    res.redirect('/invoices');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating invoice');
  }
};


// Edit invoice form
exports.editInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await model.getInvoiceById(invoiceId);
    const items = await model.getInvoiceItems(invoiceId);
    res.render('edit', { invoice, items });
  } catch (err) {
    res.status(500).send('Error loading edit form');
  }
};

// Update invoice
// controllers/invoiceController.js

    exports.updateInvoice = async (req, res) => {
        try {
            const invoiceId = req.params.id;
            const { invoice_to, inv_date, details, quantity, rate_per, item_ids } = req.body;

            // 1. Update the invoice basic information
            await db.query('UPDATE tbl_invoiceid SET invoice_to = ?, inv_date = ? WHERE id = ?', [
                invoice_to,
                inv_date,
                invoiceId
            ]);

            // 2. Update existing invoice items
            if (Array.isArray(item_ids)) {
                for (let i = 0; i < item_ids.length; i++) {
                    if (item_ids[i] && item_ids[i] !== '') {
                        // Existing item -> Update
                        await db.query(
                            'UPDATE tbl_invoiceitems SET details = ?, quantity = ?, rate_per = ?, total = ? WHERE id = ?',
                            [details[i], quantity[i], rate_per[i], quantity[i] * rate_per[i], item_ids[i]]
                        );
                    } else {
                        // New item -> Insert
                        await db.query(
                            'INSERT INTO tbl_invoiceitems (invoice_id, details, quantity, rate_per, total) VALUES (?, ?, ?, ?, ?)',
                            [invoiceId, details[i], quantity[i], rate_per[i], quantity[i] * rate_per[i]]
                        );
                    }
                }
            } else {
                // Only one item (not array)
                if (item_ids) {
                    await db.query(
                        'UPDATE tbl_invoiceitems SET details = ?, quantity = ?, rate_per = ?, total = ? WHERE id = ?',
                        [details, quantity, rate_per, quantity * rate_per, item_ids]
                    );
                } else {
                    await db.query(
                        'INSERT INTO tbl_invoiceitems (invoice_id, details, quantity, rate_per, total) VALUES (?, ?, ?, ?, ?)',
                        [invoiceId, details, quantity, rate_per, quantity * rate_per]
                    );
                }
            }

            // 3. Recalculate final_total for the invoice
            await db.query(`
          UPDATE tbl_invoiceid
          SET final_total = (
            SELECT IFNULL(SUM(total), 0)
            FROM tbl_invoiceitems
            WHERE invoice_id = ?
          )
          WHERE id = ?
        `, [invoiceId, invoiceId]);

            // 4. Redirect back to invoices list
            res.redirect('/invoices');

        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating invoice');
        }
    };

//delete invoice
// controllers/invoiceController.js

exports.deleteInvoiceItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    // 1. Find the invoice_id related to this item
    const [result] = await db.query('SELECT invoice_id FROM tbl_invoiceitems WHERE id = ?', [itemId]);
    if (result.length === 0) {
      return res.status(404).send('Item not found');
    }
    const invoiceId = result[0].invoice_id;

    // 2. Delete the item
    await db.query('DELETE FROM tbl_invoiceitems WHERE id = ?', [itemId]);

    // 3. Recalculate final_total for the invoice
    await db.query(`
      UPDATE tbl_invoiceid
      SET final_total = (
        SELECT IFNULL(SUM(total), 0)
        FROM tbl_invoiceitems
        WHERE invoice_id = ?
      )
      WHERE id = ?
    `, [invoiceId, invoiceId]);

    // 4. Return success
    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting item');
  }
};


//print invoice

exports.printInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;

        const invoice = await model.getInvoiceById(invoiceId);
        const items = await model.getInvoiceItems(invoiceId);

        if (!invoice) {
            return res.status(404).send('Invoice not found');
        }

        res.render('printinvoice', { invoice, items });  // your EJS file name is printinvoice.ejs
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};