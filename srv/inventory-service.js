const cds = require('@sap/cds');

module.exports = async (srv) => {
    const { Products } = srv.entities;

    // Logging middleware
    srv.before('*', '*', (req) => {
        console.log(`Method: ${req.method}, Target: ${req.target.name}`);
    });

    // Create operation: Upon product creation, calculate total_value
    srv.before('CREATE', 'Products', async (req) => {
        if (req.data.price && req.data.stock) {
            req.data.total_value = parseFloat(req.data.price) * parseFloat(req.data.stock);
        }
    });

    // Update operation: Calculate total_value when price or stock change
    srv.before('UPDATE', 'Products', async (req) => {
        const product = await cds.run(SELECT.one.from(Products).where({ ID: req.data.ID }));
        if (product && (req.data.price !== undefined || req.data.stock !== undefined)) {
            const price = req.data.price !== undefined ? req.data.price : product.price;
            const stock = req.data.stock !== undefined ? req.data.stock : product.stock;
            req.data.total_value = parseFloat(price) * parseFloat(stock);
        }
    });

    // Read operation: Calculate total_value on the fly if not persisted
    srv.after('READ', 'Products', (each) => {
        if (each.price && each.stock) {
            each.total_value = (each.price * each.stock).toFixed(2); // Nachkommastellen beibehalten
        }
    });

    // Delete Operation: Logging deletion
    srv.before('DELETE', 'Products', async (req) => {
        console.log(`Deleting product with ID: ${req.data.ID}`);
    });

    // Implement the action to sort products by total_value
    srv.on('sortProductsByTotalValue', async (req) => {
        const products = await cds.run(SELECT.from(Products).columns('*', { total_value: (p => { return { expr: { ref: ['price'] }, '*': { expr: { ref: ['stock'] } } } }) }).orderBy('total_value desc'));
        return products;
    });
};