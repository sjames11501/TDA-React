import { stocks } from '../data/stocks';
declare var localStorageDB: any;
export default class LocalDbService {


  public getAll() {
    const db = new localStorageDB('StockScannerDb', localStorage);
    let x = db.queryAll('ListSymbols');

    return x;

  }

  public insertRecord(dbn:string , table:string , content: any): any {
    try {
      const db = new localStorageDB(dbn, localStorage);
      
      db.insert(table, content);
      db.commit();
      return true;

    } catch (error) {
      console.log(error);
      return false;
    }

  }
  public getStock(symbol: string) {
    const lib = new localStorageDB('StockScannerDb', localStorage);
    let x: any;
    if (!lib.isNew()) {

      try {
        x = lib.queryAll('ListSymbols', {
          query: { Symbol: symbol }
        });

        if (x == null || x.length < 1) {
          return null;
        }
        return x;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  }

  public populateDB() {
    var RecordsAdded = 0;
    const db = new localStorageDB("StockScannerDb", localStorage);
    if (!db.tableExists('ListNames')) {
      db.createTable('ListNames', ['Name']);
      db.commit();
    }

    if (!db.tableExists('ListSymbols')) {
      db.createTable('ListSymbols', ['ListName', 'VolPriorDay','TotalVolume', 'Symbol', 'Float', 'VolAvg']);
      db.commit();
    }
    
      for (const item of stocks) {

        const x = { ListName: 'Main', Symbol: item.Symbol, VolPriorDay: 0, Float: item.Float, VolAvg: 0, TotalVolume: 0};
        console.log("ADDING: " + x.Symbol);
        this.insertRecord('StockScannerDb','ListSymbols',x);
        RecordsAdded++;

      }
      console.log("DONE.RECORDS ADDED: " + RecordsAdded );



  }

  public updateRow(dbName: string, table: string, sym: string, field: string, value: string) {
    const lib = new localStorageDB(dbName, localStorage);
    lib.update(table, { Symbol: sym }, function (row: any) {

      row[field] = value;
      return row;
    });

    lib.commit();

  }
  public init() {
    const db = new localStorageDB('StockScannerDb', localStorage);
    try {

      if (!db.tableExists('ListNames')) {
        db.createTable('ListNames', ['Name']);
        db.commit();
      }

      if (!db.tableExists('ListSymbols')) {
        db.createTable('ListSymbols', ['ListName', 'VolPriorDay','TotalVolume', 'Symbol', 'Float', 'VolAvg']);
        db.commit();
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public isDbValid(): any {
    const lib = new localStorageDB('StockScannerDb', localStorage);
    let x = '';
    if (!lib.isNew()) {

      try {
        x = lib.queryAll('ListSymbols', {
          query: { ListName: 'Main' }
        });

        if (x == null || x.length < 1) {
          return true
        } else {
          return false;
        }
    

      } catch (error) {
        return true;
      }
   
    }
    return false;
  }
  public getSettingsField(name: string) {
    const lib = new localStorageDB('StockScannerDb', localStorage);
    console.log('LocalDbService.tsx - getSettingsField: ' + name);
    let x: any;
    if (!lib.isNew()) {


      try {
        x = lib.queryAll('settings', {
          query: { PropertyName: name }
        });

        if (x == null || x.length < 1) {
          return null;
        }
        return x[0].Value;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  }

  public updateSettingsField(name: string, value: string): boolean {
    const lib = new localStorageDB('StockScannerDb', localStorage);

    try {

      if (!lib.tableExists('settings')) {
        lib.createTable('settings', ['PropertyName', 'Value']);
        lib.commit();

      }
      lib.insertOrUpdate('settings', { PropertyName: name }, {
        PropertyName: name,
        Value: value
      });

      lib.commit();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }

  }

}


