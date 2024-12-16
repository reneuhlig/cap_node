const cds = require('@sap/cds');

module.exports = async (srv) => {

    const { Products, Articles } = srv.entities;
    
    srv.on('CREATE', 'Articles', async (req) => {
        const { data } = req;
        const inserted = await cds.run(INSERT.into(Articles).entries(data));
        return inserted;
    });

    
    srv.on('READ', 'Articles', async (req) => {
        const result = await SELECT.from(Articles)
        return result;
    });

    
    srv.on('UPDATE', 'Articles', async (req) => {
        const updated = await cds.run(
        UPDATE(Articles)
            .set(data)
            .where({ ID: data.ID })
        );
        return updated;
    });

  
    srv.on('DELETE', 'Articles', async (req) => {
        const { ID } = req.data;
        const deleted = await cds.run(DELETE.from(Articles).where({ ID }));
        return deleted;
    });

  
    srv.on('READ', 'Products', async (req) => {
    const products = await cds.run(SELECT.from(Products));
    const articles = await cds.run(SELECT.from(Articles));

    // Artikel zählen
    const articleCountMap = {};
    articles.forEach((article) => {
      const productId = article.product_ID;
      if (productId) {
        articleCountMap[productId] = (articleCountMap[productId] || 0) + 1;
      }
    });

    // Produkte aktualisieren
    products.forEach((product) => {
      const stock = articleCountMap[product.ID] || 0;
      product.stock = stock;
      product.totalValue = product.price * stock;
    });

    // Produkte sortieren (absteigend nach totalValue)
    bubbleSort(products);

    return products;
  });

    // Bubble Sort Funktion
    function bubbleSort(products) {
        let n = products.length;
        let swapped;

        do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (products[i].totalValue < products[i + 1].totalValue) {
            // Elemente tauschen
            const temp = products[i];
            products[i] = products[i + 1];
            products[i + 1] = temp;
            swapped = true;
            }
        }
        n--; // Letztes Element ist sortiert
        } while (swapped);
    }
    
};