namespace sap.capire.store;

using { Currency, cuid, managed, User, Country} from '@sap/cds/common';

entity Products : cuid, managed {
    name  : String(100);
    price : Decimal(10,2);
    stock : Integer;   
}


