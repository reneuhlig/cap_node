namespace sap.capire.store;

using {cuid, managed} from '@sap/cds/common';

entity Products : cuid, managed {
    name  : String(100);
    price : Decimal(10,2);
    virtual stock : Integer;
    virtual totalValue : Decimal(10, 2);
    items : Composition of many Articles on items.product = $self;
}

entity Articles : cuid, managed {
    serialNumber : String(100);
    product      : Association to Products;
}
