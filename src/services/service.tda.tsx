
import LocalDbService from './service.db';

export default class TdaService {

  // Input: List of stock symbols, returns intraday data (%change,volume,etc)
  public async getQBulk(arr: any) {
    const db = new LocalDbService();
    const at = db.getSettingsField('TDAAccessToken');
    let syms = '';

    arr.forEach((el: any) => {
      syms = syms + el + '%2C';

    });

    const url = 'https://api.tdameritrade.com/v1/marketdata/quotes?symbol=' + syms;

    const requestOptions = {
        method: 'GET',
        headers: { Accept: '*/*', Authorization: 'Bearer ' + at }
    };

    try {
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        return data;

    } catch (error) {

        return null;
    }


  }

  // Refrshes the TDA Access token
    public async refreshToken(ClientId: string, RefreshToken: string) {

        const db = new LocalDbService();
        const rt = encodeURIComponent(RefreshToken);
        const cid = ClientId + '@AMER.OAUTHAP';
        const rurl = encodeURIComponent('http://localhost');
        const url = 'https://api.tdameritrade.com/v1/oauth2/token';

        try {

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: '*/*' },
                body: 'grant_type=refresh_token&access_type=offline&code=&refresh_token=' + rt + '&client_id=' + cid + ''
            };
            const response = await fetch(url, requestOptions);
            const data = await response.json();

            const rt1 = decodeURIComponent(data.refresh_token);
            const at1 = decodeURIComponent(data.access_token);




            if (rt1.length > 20 && at1.length > 20) {

                return { RefreshToken: rt1, AccessToken: at1 };
            }

        } catch (error) {
            return false;

        }

        return false;

    }


    public async getDailyBars(sym: string) {
        const db = new LocalDbService();
        const at = db.getSettingsField('TDAAccessToken');
        const cid = db.getSettingsField('TDAClientId');
        let url = 'https://api.tdameritrade.com/v1/marketdata/' + sym + '/pricehistory?apikey={key}&periodType=month&period=1&frequencyType=daily&frequency=1&';
        url = url.replace('{key}', cid);
        const requestOptions = {
            method: 'GET',
            headers: { Accept: '*/*', Authorization: 'Bearer ' + at }
        };

        try {
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            return data;

        } catch (error) {

            return null;
        }


    }
    public async getQ(sym: string) {
        //get credentials from db
        const db = new LocalDbService();
        const at = db.getSettingsField('TDAAccessToken');
        //
        const url = 'https://api.tdameritrade.com/v1/marketdata/' + sym + '/quotes';


        try {

            const requestOptions = {
                method: 'GET',
                headers: { Accept: '*/*', Authorization: 'Bearer ' + at }
            };

            const response = await fetch(url, requestOptions);
            const data = response.json();
            return data;
        } catch (error) {

            return null;
        }



    }
    // Testes the current TDA Access. If it is not valid then refresh.
    public async tdaInit() {
        const db = new LocalDbService();
        const rt = db.getSettingsField('TDARefreshToken');
        const cid = db.getSettingsField('TDAClientId');
        let tries = 3;

        try {
            const test = await this.getQ('AAPL');
            if (test['AAPL'].totalVolume) {
                return true;
            }

        } catch (error) {
              while (tries > 0) {

            const x = await this.refreshToken(cid, rt);

                 if (x) {
                 return true;
               } else {
                 tries = tries - 1;
                  continue;
                }
        }

    }
}

}
