import { Component } from 'react'; // literally anything, don't even have to use it
import moment from 'moment';

// Service to handle complex(or even simple) math operations
export default class OpsService {

    public getGapPercent(close: number, open: number) {

        if (open >= close) {
          const x = ((open - close) / close);
          return x;
        } else {
          const x = ((close - open) / close);
          return x;
        }
        return null;
    
      }

    public getMinutesSinceOpen() {

        const d = new Date();
        const date = d.getDate();
        const month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
        const year = d.getFullYear();
        let x: any;
        const o = year + '-' + month + '-' + date + ' 01:30:00 PM UTC';
        const current: number = parseInt(moment().unix().toString());
        const open: number = parseInt(moment.utc(o).unix().toString());
      
        // weekend
        if (d.getDay() === 6 || d.getDay() === 0) {
          return 390;
      
        }
      
      
        if ((open > current)) {
   
          x = 390;
      
        } else {
          x = (current - open) / 60;
          if (x > 390) { x = 390; }
      
        }
      
        return x.toFixed(0);
      
      }

    public getPercentOfDay() {

        return this.getMinutesSinceOpen() / 390;
      }
    


}