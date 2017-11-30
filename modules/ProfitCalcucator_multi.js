var COST = 1000;
var FIRST_50 = 0;
var SECOND_50 = 1;


var isSampleDate = function(d1,d2){
    return (new Date(d1)).getTime() == (new Date(d2)).getTime();
}

function cal_daily_profit(stock) {
    var i = stock.predict_days,
        j = 0,
        invest = [0, 0],
        money = [COST, COST],
        rate = 0,
        percent = 0;
    
    while (true) {
        
        if (isSampleDate(stock.data[i].date,stock.test_start_date)) {
            break;
        }
        i = i + 1;
    }
    j = i;
    while (i >= 0) {
        
        if ("sell_100%" === stock.data[i + 1].operation) {
            money[FIRST_50] += money[FIRST_50] * (stock.data[i].open - invest[FIRST_50]) / invest[FIRST_50];
            money[SECOND_50] += money[SECOND_50] * (stock.data[i].open - invest[SECOND_50]) / invest[SECOND_50];
            invest[FIRST_50] = 0;
            invest[SECOND_50] = 0;
        }
        
        
        if ("sell_50%" === stock.data[i + 1].operation) {
            if (0 === invest[SECOND_50]) {
                money[FIRST_50] += money[FIRST_50] * (stock.data[i].open - invest[FIRST_50]) / invest[FIRST_50];
                invest[FIRST_50] = 0;
            } else {
                money[SECOND_50] += money[SECOND_50] * (stock.data[i].open - invest[SECOND_50]) / invest[SECOND_50];
                invest[SECOND_50] = 0;
            }
        }
        
        if ("buy_100%" === stock.data[i].operation) {
            if (i > 0) {
                invest[FIRST_50] = stock.data[i - 1].open;
                invest[SECOND_50] = stock.data[i - 1].open;
            }
            
            stock.data[i].profit = (money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
        }
        
        
        if ("buy_50%" === stock.data[i].operation) {
            if (0 === invest[FIRST_50]) {
                if (i > 0) { invest[FIRST_50] = stock.data[i - 1].open; }
                stock.data[i].profit = (money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
            } else {
                if (i > 0) { invest[SECOND_50] = stock.data[i - 1].open; }
                
                stock.data[i].profit = (money[FIRST_50] * (stock.data[i].close - invest[FIRST_50]) / invest[FIRST_50] + money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
            }
            
            
        }
        
        
        if ("hold_50%" === stock.data[i].operation) {
                
            stock.data[i].profit = (money[FIRST_50] * (stock.data[i].close - invest[FIRST_50]) / invest[FIRST_50] + money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;

        }
        
        
        if (("hold_100%" === stock.data[i].operation) || ("sell_100%" === stock.data[i].operation)) {
                
            stock.data[i].profit = (money[FIRST_50] * (stock.data[i].close - invest[FIRST_50]) / invest[FIRST_50]
                                  + money[SECOND_50] * (stock.data[i].close - invest[SECOND_50]) / invest[SECOND_50] + money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;

        }
        
        if ("sell_50%" === stock.data[i].operation) {
                
            if (0 === invest[SECOND_50]) {
                stock.data[i].profit = (money[FIRST_50] * (stock.data[i].close - invest[FIRST_50]) / invest[FIRST_50] + money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
            } else {
                stock.data[i].profit = (money[FIRST_50] * (stock.data[i].close - invest[FIRST_50]) / invest[FIRST_50]
                                  + money[SECOND_50] * (stock.data[i].close - invest[SECOND_50]) / invest[SECOND_50] + money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
            }

        }
        
        if ("wait" === stock.data[i].operation) {
            stock.data[i].profit = (money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
        }
        
        i = i - 1;
        
    }
    
    
}




function cal_profit(stock) {
    var i = stock.predict_days,
        j = 0,
        invest = [0, 0],
        money = [COST, COST],
        rate = 0,
        percent = 0;
    
    while (true) {
        
        if (isSampleDate(stock.data[i].date,stock.test_start_date)) {
            break;
        }
        i = i + 1;
    }
    j = i;
    while (i > 0) {
        
        if (stock.data[i].predict <= 2) {
            
            if (0 === invest[FIRST_50]) {
                invest[FIRST_50] = stock.data[i - 1].open;
                invest[SECOND_50] = stock.data[i - 1].open;
                stock.data[i].operation = "buy_100%";
            } else if (0 === invest[SECOND_50]) {
                invest[SECOND_50] = stock.data[i - 1].open;
                stock.data[i].operation = "buy_50%";
            }
            
            
            i = i - stock.predict_days;
        } else if (stock.data[i].predict <= 3) {
            
            if (0 === invest[FIRST_50]) {
                invest[FIRST_50] = stock.data[i - 1].open;
                stock.data[i].operation = "buy_50%";
            } else if (0 !== invest[SECOND_50]) {
                rate = (stock.data[i - 1].open - invest[SECOND_50]) / invest[SECOND_50];
                money[SECOND_50] = money[SECOND_50] * (1 + rate);
                invest[SECOND_50] = 0;
                stock.data[i].operation = "sell_50%";
            }
            i = i - stock.predict_days;
        } else {
            if (0 !== invest[FIRST_50]) {
                rate = (stock.data[i - 1].open - invest[FIRST_50]) / invest[FIRST_50];
                money[FIRST_50] = money[FIRST_50] * (1 + rate);
                invest[FIRST_50] = 0;
                stock.data[i].operation = "sell_50%";
            }
            
            if (0 !== invest[SECOND_50]) {
                rate = (stock.data[i - 1].open - invest[SECOND_50]) / invest[SECOND_50];
                money[SECOND_50] = money[SECOND_50] * (1 + rate);
                invest[SECOND_50] = 0;
                stock.data[i].operation = "sell_100%";
            }
            
            
            
            i = i - 1;
        }
        
        
    }
    
    
    if (0 !== invest[FIRST_50]) {
        rate = (stock.data[0].close - invest[FIRST_50]) / invest[FIRST_50];
        money[FIRST_50] = money[FIRST_50] * (1 + rate);
        invest[FIRST_50] = 0;
    }
            
    if (0 !== invest[SECOND_50]) {
        rate = (stock.data[0].close - invest[SECOND_50]) / invest[SECOND_50];
        money[SECOND_50] = money[SECOND_50] * (1 + rate);
        invest[SECOND_50] = 0;
    }
    
    while (j >= 0) {
        if (undefined === stock.data[j].operation) {
            if (0 === percent) { stock.data[j].operation = "wait"; }
            if (50 === percent) { stock.data[j].operation = "hold_50%"; }
            if (100 === percent) { stock.data[j].operation = "hold_100%"; }
        }
        
        if ("buy_100%" === stock.data[j].operation) {
            percent = 100;
        }
        
        if ("buy_50%" === stock.data[j].operation) {
            percent = percent + 50;
        }
        
        if ("sell_50%" === stock.data[j].operation) {
            percent = percent - 50;
        }
        
        if ("sell_100%" === stock.data[j].operation) {
            percent = 0;
        }
        
        j = j - 1;
    }
        
    
    return (money[FIRST_50] + money[SECOND_50] - 2 * COST) / COST / 2;
    
    
}

function cal_max_rise(stock) {
    var i = 0,
        max_price = 0;
    
    while (true) {
        
        if (isSampleDate(stock.data[i].date,stock.test_start_date)) {
            return (max_price - stock.data[i - 1].open) / stock.data[i - 1].open;
        }
        
        if (max_price < stock.data[i].high) { max_price = stock.data[i].high; }
        
        i = i + 1;
    }
}


function cal_rise(stock) {
    var i = 0;
    
    while (true) {
        
        if (isSampleDate(stock.data[i].date,stock.test_start_date)) {
            return (stock.data[0].close - stock.data[i - 1].open) / stock.data[i - 1].open;
        }
        
        
        i = i + 1;
    }
}

module.exports = {
    cal_profit:cal_profit,
    cal_daily_profit:cal_daily_profit,
    cal_rise:cal_rise,
    cal_max_rise:cal_max_rise
}