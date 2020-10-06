import React, { Component } from 'react'; // importing FunctionComponent
import TdaService from './services/service.tda'
import LocalDbService from './services/service.db';
import { TextFieldc } from './textbox';
import OpsService from './services/service.ops';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';


// const item: any = { GapP: (100 * GapP).toFixed(2), Symbol: ActiveSymbol, Float: float, RVOL: RVOL.toFixed(2), FVOL: FVOL, PChange: PChange, TotalVolume: TotalVolume };
interface IStock {
    RVOLP: number;
    Symbol: string;
    GapP: any,
    Float: string,
    RVOL: string,
    FVOL: string,
    TotalVolume: string,
    PChange: string
}


interface IScannerState {
    loading?: boolean,
    SingleSymbol: string,
    MinGap: number,
    MaxFloat: number,
    MaxGap: number,
    MinRVOL: number,
    DisplayData: Array<IStock>;
    showResponse?: boolean
}



class Scanner extends Component<any, IScannerState>
{
    constructor(props: any) {
        super(props);
        this.state = { SingleSymbol: '', loading: false, MaxGap: 20, DisplayData: Array<IStock>(), MaxFloat: 150000000, showResponse: false, MinGap: 3, MinRVOL: 3 };
    }


    // Component loaded; load DB Settings
    componentDidMount() {
    }


    // Creats object with the proccessed data
    TransformToRow() {


    }
    scan = async () => {
        this.setState({ loading: true });
        const tds = new TdaService();
        let ReturnData = Array<IStock>();
        const db = new LocalDbService();
        const ops = new OpsService();
        const _tdaRefreshToken = db.getSettingsField('tdaRefreshToken');
        const _tdaClientId = db.getSettingsField('tdaClientId');
        const data = db.getAll();
        let RawSymbols: any[] = [];



        // Create array with just the stock symbols
        data.forEach((el: any) => {

            //check the float before pushing
            if (el.Float < this.state.MaxFloat) {
                RawSymbols.push(el.Symbol);
            }


        });

        // Split into 100 symbol chunks


        // Split into 100 symbol chunks
        const chunks = RawSymbols.map(function (e, i) {
            return i % 100 === 0 ? RawSymbols.slice(i, i + 100) : null;
        }).filter(function (e) { return e; });

        // console.log('CHUNKS:' + chunks.length);
        this.setState({ loading: true });

        for (let c = 0; c < chunks.length; c++) {
            // Proccess the current 100 symbol chunk
            const res = await tds.getQBulk(chunks[c]);
            // Symbol not in this chunk; skip.

            // If the symbol isn't in this chunk - skip it
            for (let i = 0; i < data.length; i++) {
                if (!(res[data[i].Symbol])) {
                    continue;
                }

                const ActiveSymbol = data[i].Symbol;

                // Calculate intraday attributes
                const TotalVolume = parseInt(res[data[i].Symbol].totalVolume, 10);
                let rvol: any = (TotalVolume / (data[i].VolAvg * ops.getPercentOfDay()));
                const RVOL = rvol;
                let RVOLP = (TotalVolume / (data[i].VolAvg * ops.getPercentOfDay()));
                const price = res[ActiveSymbol].lastPrice;
                const float = data[i].Float;
                const fvol: any = 100 * (TotalVolume / float);
                const GapP: any = (ops.getGapPercent(res[data[i].Symbol].closePrice, res[data[i].Symbol].openPrice));
                const FVOL: any = fvol.toFixed(2);
                const PChange = res[data[i].Symbol].regularMarketPercentChangeInDouble.toFixed(2);
                const item: any = { GapP: (100 * GapP).toFixed(2), Symbol: ActiveSymbol, Float: float, RVOL: RVOL.toFixed(2), FVOL: FVOL, PChange: PChange, TotalVolume: TotalVolume };


                // Check if symbol matches all critera 
                if (GapP * 100 < this.state.MaxGap && GapP * 100 > this.state.MinGap && RVOL > this.state.MinRVOL) {
                    const dailyBars = await tds.getDailyBars(ActiveSymbol);
                    const priorDayBar = dailyBars['candles'][dailyBars['candles'].length - 1];
                    const priorDayVolume: number = priorDayBar.volume;
                    RVOLP = 100 * ((res[data[i].Symbol].totalVolume) / (priorDayVolume / ops.getPercentOfDay()));
                    item.RVOLP = RVOLP.toFixed(2);
                    ReturnData.push(item);

                } else {
                    continue;
                }
            }

        }
        if(ReturnData.length > 0){

            ReturnData = ReturnData.sort((a, b) => parseFloat(b.RVOL) - parseFloat(a.RVOL));

            this.setState({ DisplayData: ReturnData, showResponse: true, loading: false });
        }
        this.setState({loading: false });


    }


    // This function is used to add a delay, so that the TDA API does not throttle.
    public sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      
    scansymbol= async () => {
        this.setState({ loading: true });
        const tds = new TdaService();
        let ReturnData = Array<IStock>();
        const db = new LocalDbService();
        const symbol = this.state.SingleSymbol.toUpperCase();
        const dbStock = db.getStock(symbol)[0];
        console.log(dbStock);
        const ops = new OpsService();
        let SymbolArray = [];
        SymbolArray.push(symbol);
        const res = await tds.getQBulk(SymbolArray);


        // Calculate intraday attributes
        const TotalVolume = parseInt(res[symbol].totalVolume, 10);
        let rvol: any = (TotalVolume / (dbStock.VolAvg * ops.getPercentOfDay()));
        const RVOL = rvol;
        let RVOLP = (TotalVolume / (dbStock.VolAvg * ops.getPercentOfDay()));
        const price = res[symbol].lastPrice;
        const float = dbStock.Float;
        const fvol: any = 100 * (TotalVolume / float);
        const GapP: any = (ops.getGapPercent(res[symbol].closePrice, res[symbol].openPrice));
        const FVOL: any = fvol.toFixed(2);
        const PChange = res[symbol].regularMarketPercentChangeInDouble.toFixed(2);
        const item: any = { GapP: (100 * GapP).toFixed(2), Symbol: symbol, Float: float, RVOL: RVOL.toFixed(2), FVOL: FVOL, PChange: PChange, TotalVolume: TotalVolume };

        ReturnData.push(item);
        ReturnData = ReturnData.sort((a, b) => b.RVOLP - a.RVOLP);

        this.setState({ DisplayData: ReturnData, showResponse: true, loading: false });


    }

    // Simple RVOL scan: only scans for elevated rvol/
    scanrvol = async () => {
        this.setState({ loading: true });
        const tds = new TdaService();
        let ReturnData = Array<IStock>();
        const db = new LocalDbService();
        const ops = new OpsService();
        const data = db.getAll();
        let RawSymbols: any[] = [];



        // Create array with just the stock symbols
        data.forEach((el: any) => {

            //check the float before pushing
            if (el.Float < this.state.MaxFloat) {
                RawSymbols.push(el.Symbol);
            }


        });

        // Split into 100 symbol chunks
        const chunks = RawSymbols.map(function (e, i) {
            return i % 100 === 0 ? RawSymbols.slice(i, i + 100) : null;
        }).filter(function (e) { return e; });

        this.setState({ loading: true });

        for (let c = 0; c < chunks.length; c++) {
            // Proccess the current 100 symbol chunk
            const res = await tds.getQBulk(chunks[c]);
            // Symbol not in this chunk; skip.

            // If the symbol isn't in this chunk - skip it
            for (let i = 0; i < data.length; i++) {
                if (!(res[data[i].Symbol])) {
                    continue;
                }

           

                const ActiveSymbol = data[i].Symbol;

                // Calculate intraday attributes
                const TotalVolume = parseInt(res[data[i].Symbol].totalVolume, 10);
                let rvol: any = (TotalVolume / (data[i].VolAvg * ops.getPercentOfDay()));
                const RVOL = rvol;
                let RVOLP = (TotalVolume / (data[i].VolAvg * ops.getPercentOfDay()));
                const price = res[ActiveSymbol].lastPrice;
                const float = data[i].Float;
                const fvol: any = 100 * (TotalVolume / float);
                const GapP: any = (ops.getGapPercent(res[data[i].Symbol].closePrice, res[data[i].Symbol].openPrice));
                const FVOL: any = fvol.toFixed(2);
                const PChange = res[data[i].Symbol].regularMarketPercentChangeInDouble.toFixed(2);
                const item: any = { GapP: (100 * GapP).toFixed(2), Symbol: ActiveSymbol, Float: float, RVOL: RVOL.toFixed(2), FVOL: FVOL, PChange: PChange, TotalVolume: TotalVolume };


                // Check if symbol matches all critera 
                if (RVOL > this.state.MinRVOL) {
                    await this.sleep(500);
                    const dailyBars = await tds.getDailyBars(ActiveSymbol);
                    const priorDayBar = dailyBars['candles'][dailyBars['candles'].length - 1];
                    const priorDayVolume: number = priorDayBar.volume;
                    RVOLP = 100 * ((res[data[i].Symbol].totalVolume) / (priorDayVolume / ops.getPercentOfDay()));
                    item.RVOLP = RVOLP.toFixed(2);
                    ReturnData.push(item);

                } else {
                    continue;
                }
            }

        }
        if(ReturnData.length > 0){

            ReturnData = ReturnData.sort((a, b) => b.RVOLP - a.RVOLP);

            this.setState({ DisplayData: ReturnData, showResponse: true, loading: false });
        }
        this.setState({loading: false });


    }
    renderTableData() {
        const x: any = this.state.DisplayData;
        return x.map((_stock: any, index: any) => {
            //[{"GapP":"9.81","Symbol":"ATNX","Float":52720000,"RVOL":"24.21","FVOL":"15.33","PChange":"-15.95","TotalVolume":8081424}
            // FVOL: Current Volume / Total Float
            // GapP: Gap percentage
            // TotalVolume: Total cumulative volume for the current trading session
            const { Symbol, GapP, RVOL, FVOL,RVOLP, PChange, TotalVolume, Float } = _stock //destructuring
            return (
                <tr key={Symbol}>
                    <td>{Symbol}</td>
                    <td>{TotalVolume}</td>
                    <td>{GapP}</td>
                    <td>{PChange}</td>
                    <td>{Float}</td>
                    <td>{FVOL}</td>
                    <td>{RVOL}</td>
                    <td>{RVOLP}</td>
                </tr>
            )
        })
    }

    render(): JSX.Element {
        const { loading, DisplayData, showResponse, MinGap, MaxGap, MinRVOL, MaxFloat, SingleSymbol } = this.state;



        return (
            <div className="ScannerPage">
                {loading ?

                    <div id="overlay">
                        <div className="loader">Loading...</div>
                    </div>

                    :
                    <></>
                }
                <h1>Scanner</h1>
                <hr />
                <section className="PageContent">
                    <TextFieldc type="number" label="Min Gap%" id="txtGap" value={MinGap} placeholder="placeholder" onChange={(val: any) => { this.setState({ MinGap: val }); }} />
                    <TextFieldc type="number" label="Min RVOL" id="txtRVOL" value={MinRVOL} placeholder="placeholder" onChange={(val: any) => { this.setState({ MinRVOL: val }); }} />
                    <TextFieldc type="text" label="Single Symbol" id="txtSymbol" value={SingleSymbol} placeholder="placeholder" onChange={(val: any) => { this.setState({ SingleSymbol: val }); }} />
                    <button type="button" className="btn btn-primary" onClick={this.scan}>
                        Run Scan
            </button>

            <button type="button" className="btn btn-primary" onClick={this.scanrvol}>
                        Run Simple RVOL Scan
            </button>

            <button type="button" className="btn btn-primary" onClick={this.scansymbol}>
                        Run Scan (Single Symbol)
            </button>


                    {showResponse ?
                        <div className="TableContainer">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Total Volume</th>
                                        <th>Gap %</th>
                                        <th>% Change</th>
                                        <th>Float</th>
                                        <th>FVOL</th>
                                        <th>RVOL</th>
                                        <th>RVOLP</th>

                                    </tr>

                                </thead>
                                <tbody>
                                    {this.renderTableData()}
                                </tbody>
                            </table>
                        </div>

                        :
                        <></>
                    }


                    <div className="RawResponse">

                    </div>
                </section>


            </div>


        );

    }

}

export default Scanner;