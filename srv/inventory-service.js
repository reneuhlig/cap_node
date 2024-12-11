const cds = require('@sap/cds');

module.exports = async (srv) => {
    const { Products, Articles } = srv.entities;

    // CRUD Operations for Articles
    srv.on('CREATE', 'Articles', async (req) => {
        const article = req.data;
        await INSERT.into(Articles).entries(article);

        const productId = article.product_ID;
        if (productId) {
            const { count } = await SELECT.one('count(*) as count').from(Articles).where({ product_ID: productId });
            await UPDATE(Products).set({ stock: count }).where({ ID: productId });
        }

        return req.data;
    });

    srv.on('READ', 'Articles', async (req) => {
        return await SELECT.from(Articles);
    });

    srv.on('UPDATE', 'Articles', async (req) => {
        const articleId = req.data.ID;
        await UPDATE(Articles).set(req.data).where({ ID: articleId });

        const article = await SELECT.one.from(Articles).where({ ID: articleId });
        const productId = article.product_ID;
        if (productId) {
            const { count } = await SELECT.one('count(*) as count').from(Articles).where({ product_ID: productId });
            await UPDATE(Products).set({ stock: count }).where({ ID: productId });
        }

        return req.data;
    });

    srv.on('DELETE', 'Articles', async (req) => {
        const articleId = req.data.ID;
        const article = await SELECT.one.from(Articles).where({ ID: articleId });
        const productId = article.product_ID;

        await DELETE.from(Articles).where({ ID: articleId });

        if (productId) {
            const { count } = await SELECT.one('count(*) as count').from(Articles).where({ product_ID: productId });
            await UPDATE(Products).set({ stock: count }).where({ ID: productId });
        }

        return req.data;
    });

    // After READ for Products: calculate stock and total_value
    srv.after('READ', 'Products', async (products, req) => {
        if (!Array.isArray(products)) products = [products];
        await Promise.all(products.map(async product => {
            const { count } = await SELECT.one('count(*) as count').from(Articles).where({ product_ID: product.ID });
            product.stock = count;
            if (product.price) {
                product.total_value = (product.price * count).toFixed(2);
            }
        }));
    });

    // Action to sort products by total_value
    srv.on('sortProductsByTotalValue', async (req) => {
        const products = await SELECT.from(Products);
        const productsWithStockAndValue = await Promise.all(products.map(async product => {
            const { count } = await SELECT.one('count(*) as count').from(Articles).where({ product_ID: product.ID });
            product.stock = count;
            if (product.price) {
                product.total_value = (product.price * count).toFixed(2);
            }
            return product;
        }));

        return productsWithStockAndValue.sort((a, b) => b.total_value - a.total_value);
    });
};