const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');

// Default redirect
router.get('/', (req, res) => {
    res.redirect('/homepage');
});

router.get('/homepage', controller.renderHomepage);

// Invoices
router.get('/invoices', controller.viewInvoices);
router.get('/invoices/:id', controller.viewInvoiceById);

// Create Invoice
router.get('/create', controller.createInvoiceForm);
router.post('/invoices', controller.createInvoice);

// Edit Invoice
router.get('/invoices/:id/edit', controller.editInvoice);
router.post('/invoices/:id/edit', controller.updateInvoice);

// Delete Invoice Item
router.delete('/items/:id/delete', controller.deleteInvoiceItem);

//pdf invoice
router.get('/printinvoice/:id', controller.printInvoice);


module.exports = router;
