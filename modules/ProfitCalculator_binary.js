var COST = 1000;
var isSampleDate = function(d1,d2){
    return (new Date(d1)).getTime() == (new Date(d2)).getTime();
}



function cal_test_accuracy(stock) {
    var i = 0,
        right = 0,
        wrong = 0;
    
    while (true) {
        
        if (/*stock.data[i].date === stock.test_start_date*/isSampleDate(stock.data[i].date,stock.test_start_date)) {
            break;
        }
        i = i + 1;
    }
    /*
    while (true) {
        
        if (!stock.data[i].predict_result) {
            return right / (right + wrong);
        }
        
        if (stock.data[i].predict_result) {
            right = right + 1;
        } else {
            wrong = wrong + 1;
        }
        
        stock.data[i].test_accuracy = right / (right + wrong);
        
        i = i - 1;
    }*/
    
    while (i >= 0) {
        
        if ((undefined === stock.data[i].predict_result) || (null === stock.data[i].output) || (null === stock.data[i].predict_result)) {

        } else {
            if (stock.data[i].predict_result) {
                right = right + 1;
            } else {
                wrong = wrong + 1;
            }
        }
        
        stock.data[i].test_accuracy = right / (right + wrong);
        
        
        
        i = i - 1;
    }
    
    return right / (right + wrong);
    
}

function cal_profit(stock) {
    var i = stock.predict_days,
        j,
        has_bought = false,
        price = 0,
        money = COST,
        rate = 0;
    
    
    while (true) {
        
        if (/*stock.data[i].date === stock.test_start_date*/isSampleDate(stock.data[i].date,stock.test_start_date)) {
			console.log(stock.data[i].date);
			console.log(stock.test_start_date);
            break;
        }
        i = i + 1;
    }
    
    while (i > 0) {
        
        if (undefined === stock.data[i].predict) {
            if (stock.data[i].predict_result) {
                stock.data[i].predict = stock.data[i].output;
            } else {
                if ("Rise" === stock.data[i].output) {
                    stock.data[i].predict = "Fall";
                } else {
                    stock.data[i].predict = "Rise";
                }
            }
                
        }
        if (stock.data[i].predict === "Rise") { stock.data[i].operation = "hold"; }
        if (stock.data[i].predict === "Fall") { stock.data[i].operation = "wait"; }
        
        
        if ((stock.data[i].predict === "Rise") && (has_bought === false)) {
            price = stock.data[i - 1].open;
            stock.data[i].operation = "buy";
            has_bought = true;
        }
        
        if ((stock.data[i].predict === "Fall") && (has_bought === true)) {
            rate = (stock.data[i - 1].open - price) / price;
            money = money * (1 + rate);
            price = 0;
            has_bought = false;
            stock.data[i].operation = "sell";
        }
        
        
        
        if (stock.data[i].predict === "Rise") {
            for (j = 1; (j < stock.predict_days && i - j > 0); j = j + 1) { stock.data[i - j].operation = "hold"; }
            i = i - stock.predict_days;
        } else {
            i = i - 1;
        }
        
        
    }
    
    if ((stock.data[0].predict === "Rise") && (has_bought === false)) {
        stock.data[0].operation = "buy";
    }
    
    
    if ((stock.data[0].predict === "Rise") && (has_bought === true)) {
        stock.data[0].operation = "hold";
    }
    
    if ((stock.data[0].predict === "Fall") && (has_bought === false)) {
        stock.data[0].operation = "wait";
    }
    
    if ((stock.data[0].predict === "Fall") && (has_bought === true)) {
        stock.data[0].operation = "sell";
    }
    
    
    if (has_bought) {
        
        rate = (stock.data[0].close - price) / price;
        //money = money + COST * rate;
        money = money * (1 + rate);
        price = 0;
        has_bought = false;
        
    }
    
    return (money - COST) / COST;
    
    
}

function cal_daily_profit(stock) {
    var i = stock.predict_days,
        price = 0,
        money = COST,
        rate = 0;
    
    
    while (true) {
        
        if (/*stock.data[i].date === stock.test_start_date*/isSampleDate(stock.data[i].date,stock.test_start_date)) {
            break;
        }
        i = i + 1;
    }
    
    while (i >= 0) {
        if(!stock.data[i + 1]){
			console.log("data index:"+(i+1));
		}
        if ('sell' === stock.data[i + 1].operation) {
            rate = (stock.data[i].open - price) / price;
            money = money * (1 + rate);
        }
        
        if ('buy' === stock.data[i].operation) {
            
            if (i > 0) { price = stock.data[i - 1].open; }
            stock.data[i].profit = (money - COST) / COST;
        }
        
        if ('wait' === stock.data[i].operation) {
            stock.data[i].profit = (money - COST) / COST;
        }
        
        
        if (('hold' === stock.data[i].operation) || ('sell' === stock.data[i].operation)) {
            rate = (stock.data[i].close - price) / price;
            stock.data[i].profit = (money * (1 + rate) - COST) / COST;
        }
        
        i = i - 1;
        
        
    }
    
    return;
    
    
}

function cal_max_rise(stock) {
    var i = 0,
        max_price = 0;
    
    while (true) {
        
        if (/*stock.data[i].date === stock.test_start_date*/isSampleDate(stock.data[i].date,stock.test_start_date)) {
            return (max_price - stock.data[i - 1].open) / stock.data[i - 1].open;
        }
        
        if (max_price < stock.data[i].high) { max_price = stock.data[i].high; }
        
        i = i + 1;
    }
}


function cal_rise(stock) {
    var i = 0;
    
    while (true) {
        
        if (/*stock.data[i].date === stock.test_start_date*/isSampleDate(stock.data[i].date,stock.test_start_date)) {
            return (stock.data[0].close - stock.data[i - 1].open) / stock.data[i - 1].open;
        }
        
        
        i = i + 1;
    }
}


module.exports = {
    cal_test_accuracy:cal_test_accuracy,
    cal_profit:cal_profit,
    cal_daily_profit:cal_daily_profit,
    cal_rise:cal_rise,
    cal_max_rise:cal_max_rise
}
