import React, { Component } from 'react'; // importing FunctionComponent
import { TextFieldc } from './textbox';
import TdaService from './services/service.tda'
import LocalDbService from './services/service.db';


interface ISettingsState {
    loading?: boolean,
    res: any,
    tdaClientId: string,
    tdaAccessToken: string,
    tdaRefreshToken: string,
    NeedData: boolean,
    showResponse?: boolean
  }
  
  
  class Settings extends Component<any, ISettingsState>{
    constructor(props: any) {
      super(props);
      this.state = { tdaClientId: '', tdaAccessToken: '', tdaRefreshToken: '', showResponse: false, NeedData: true, res: '', loading: false };
  
    }
    public sleep(ms: any) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    componentDidMount() {
  
      const db = new LocalDbService();
      const _tdaRefreshToken = db.getSettingsField('tdaRefreshToken');
      const _tdaAccessToken = db.getSettingsField('tdaAccessToken');
      const _tdaClientId = db.getSettingsField('tdaClientId');
      const _NeedData: boolean = db.isDbValid();
  
  
      this.setState({
        tdaAccessToken: _tdaAccessToken,
        NeedData: _NeedData,
        tdaClientId: _tdaClientId,
        tdaRefreshToken: _tdaRefreshToken,
  
  
      })
    }
  
  
    populateDb = async () => {
      this.setState({ loading: true });
      const db = new LocalDbService();
      await db.populateDB();
      this.setState({ loading: false, NeedData: false });
    }


    refreshTDA = async () => {
      const db = new LocalDbService();
      const tda = new TdaService();
      this.setState({ loading: true });
      //get current api credentials from db
      let _tdaRefreshToken = db.getSettingsField('tdaRefreshToken');
      let _tdaAccessToken = db.getSettingsField('tdaAccessToken');
      const _tdaClientId = db.getSettingsField('tdaClientId');
      // Send API request and return new credentials
      const newCred = await tda.refreshToken(_tdaClientId, _tdaRefreshToken);
  
      if (newCred) {
  
        _tdaRefreshToken = newCred.RefreshToken;
        _tdaAccessToken = newCred.AccessToken;
        //update db with new credentials
        db.updateSettingsField('tdaRefreshToken', newCred.RefreshToken);
        db.updateSettingsField('tdaAccessToken', newCred.AccessToken);
  
        // console.log(_tdaRefreshToken + '.' +_tdaAccessToken);
        this.setState({
          tdaAccessToken: _tdaAccessToken,
          tdaRefreshToken: _tdaRefreshToken,
          loading: false
        })
        alert('OK!');
      }
  
    }
  
    updateTDA = () => {
      const db = new LocalDbService();
      this.setState({ loading: true });
      // Update settings and save changes.
      db.updateSettingsField('tdaClientId', this.state.tdaClientId);
      db.updateSettingsField('tdaRefreshToken', this.state.tdaRefreshToken);
      db.updateSettingsField('tdaAccessToken', this.state.tdaAccessToken);
      this.setState({ loading: false });
      alert("Settings updated.");
  
    }
  
    testTDA = async () => {
      this.setState({ loading: true });
      const tda = new TdaService();
      const _response: any = await tda.getQ('AAPL');
      this.setState({
        loading: false,
      });
  
  
      if(_response['AAPL']){
  
        this.setState({
  
          res: _response['AAPL'],
          showResponse: true,
        });
  
        
      } else{
  
        alert('error');
  
        this.setState({
          loading: false,
          res: null,
          showResponse: false,
        });
    
      }
    
     
  
    
  
  
  
  
    }
    updateVolAvg = async () => {
      this.setState({ loading: true });
      const tda = new TdaService();
      let records = 0;
      const db = new LocalDbService();
      const stocks = db.getAll();
  
      // For each symbol in the database
      for (let i = 0; i < stocks.length; i++) {
        const sym = stocks[i].Symbol;

    
  
  
        if (i > 1) {
          await this.sleep(1200);
          let tdaOK = await tda.tdaInit();
          // Test to see if TDA API is working
          if (!tdaOK) {
            console.log('TDA ERROR');
            return;
          }
        }
  
  
        let totalvol = 0;
        let volAvg: any = '';
  
        const res = await tda.getDailyBars(sym);
        const dailyCandles = res['candles'];
        // tslint:disable-next-line:prefer-for-of
  
        try {
          if (res.empty) {
            continue;
          }
          //loop over the prior 5 days, and get the volume sum
          for (let ii = 0; ii < 4; ii++) {
  
            totalvol = totalvol + dailyCandles[ii].volume;
  
  
          }
  
          if (totalvol > 0) {
            volAvg = totalvol / 5;
            console.log(sym + ':' + volAvg);
            const priorDayBar = dailyCandles[dailyCandles.length - 1];
            const VolPriorDay: string = priorDayBar.volume;
            db.updateRow('StockScannerDb', 'ListSymbols', sym, 'VolAvg', volAvg);
            db.updateRow('StockScannerDb', 'ListSymbols', sym, 'VolPriorDay', VolPriorDay);
            records++;
          }
  
  
        } catch (error) {
          console.log(error);
          continue;
        }
        console.log('Records updates:' + records);
      }
  
      this.setState({ loading: false });
    }
    testTDA2 = async () => {
      this.setState({ loading: true });
      const tda = new TdaService();
      const _response: any = await tda.getDailyBars('AAPL');
  
      this.setState({
        loading: false,
        res: _response['candles'],
        showResponse: true,
  
  
      });
  
  
  
  
    }
  
    render(): JSX.Element {
      const { tdaClientId, tdaAccessToken, tdaRefreshToken, showResponse, res, loading, NeedData } = this.state
      let NeedDataMsg = '';
      if (NeedData) {
        NeedDataMsg = 'Stock data not found in local db. Please use the populate button to populate the database.';
      } else {
        NeedDataMsg = 'Stock data found in local storage.';
      }
      return (
  
  
        <div>
  
          {loading ?
  
            <div id="overlay">
              <div className="loader">Loading...</div>
            </div>
  
            :
            <></>
          }
          <h1>Settings</h1>
          <hr />
          <section>
            <header><h3>TD Ameritrade API Settings</h3></header>
            <TextFieldc type="text" label="TDA Client Id" id="tdaClientId" value={tdaClientId} placeholder="placeholder" onChange={(val: any) => { this.setState({ tdaClientId: val }); }} />
            <TextFieldc type="text" label="TDA Access Token" id="tdaAccessToken" value={tdaAccessToken} placeholder="placeholder" onChange={(val: any) => { this.setState({ tdaAccessToken: val }); }} />
            <TextFieldc type="text" label="TDA Refresh Token" id="tdaRefreshToken" value={tdaRefreshToken} placeholder="placeholder" onChange={(val: any) => { this.setState({ tdaRefreshToken: val }); }} />
  
  
            {showResponse ?
  
              <div>
                <strong>JSON response:</strong>
                <code>{JSON.stringify(res)}</code>
              </div>
  
              :
              <div></div>
            }
  
            <button type="button" className="btn btn-primary" onClick={this.updateTDA}>
              Update
            </button>
  
            <button type="button" className="btn btn-primary" onClick={this.refreshTDA}>
              Refresh
            </button>
            <button type="button" className="btn btn-primary" onClick={this.testTDA}>
              Test TDA Credentials
            </button>
  
            <button type="button" className="btn btn-primary" onClick={this.testTDA2}>
              Test TDA Credentials (1 Month/1Day)
            </button>
          </section>
          <section>
            <h1>Configuration</h1>
            <span>{NeedDataMsg}</span>
  
  
            {NeedData ?
  
              <button type="button" className="btn btn-primary" onClick={this.populateDb}>
                Populate DB
            </button>
              :
              <button type="button" className="btn btn-primary" onClick={this.updateVolAvg}>
              Update Volume Averages(LONG)
              </button>
            }
  
  
  
  
           
          </section>
  
        </div>
      );
  
    }
  
  
  
  }

  export default Settings;
  