var currentData = [];
var rangeLength = 0;
var currentView = "monthly";

function getTotal(val,type){
    var sum = 0;
    var dataVal = getTypeValue(val,type);
    for (var i=0;i<dataVal.length;i++){
        sum = sum + dataVal[i];
    }
    return sum;
}

function getTypeValue(val,type){
    dataType = [];
    for (var i=0;i<val.length;i++){
        switch (type){
            case "revenue":dataType.push(val[i].revenue);
            break;
            case "sale":dataType.push(val[i].saleC);
            break;
            case "customerC":dataType.push(val[i].customerC);
            break;
            case "grossP":dataType.push(val[i].grossP);
            break;
            case "discount":dataType.push(val[i].discount);
            break;
            case "discountP":dataType.push(val[i].discountP);
            break;
            case "basketV":dataType.push(val[i].basketV);
            break;
            case "basketS":dataType.push(val[i].basketS);
            break;
        }
    }
    return dataType;
}

function getDataAge(dataSet,type){
    total = getTotal(currentData[dataSet],type);
    return total;
}

function getCompareValue(previousVal,currentVal,mainId){
    //get differences in percentage
    var comTotal = ((currentVal/previousVal*100)-100).toFixed(1); 
    var begin;
    var end;
    if (isFinite(comTotal)){
        if (comTotal >= 0){
            begin = "<span class=\"glyphicon glyphicon-triangle-top\" aria-hidden=\"true\"></span>";
        } else {
            begin = "<span class=\"glyphicon glyphicon-triangle-bottom\" aria-hidden=\"true\"></span>";
        }
        if (currentView == "daily"){
            end = "yesterday";
        } else if (currentView == "weekly"){
            end = "previous Week";
        } else if (currentView == "monthly"){
            end = "previous Month";
        }
    } else {
        begin = "";
        end = "";
        comTotal = "-";
    }
    $(mainId).html(begin+"  <span class=\"comparison-word\">"+comTotal+"%</span> "+end);
}

function getValue(type,mainId,subId,format,dataSet,draw){
    var total = getDataAge(dataSet,type);

    if (draw){ //otherwise oo not write it on the UI
        if (format == "currency"){
            if (total > 10000){
                $(mainId).html("$"+Math.round(total/1000) + "k");
                $(subId).html("$"+Math.round(total/1000) + "k");
            } else {
                $(mainId).html(total);
                $(subId).html(total);
            }
        } else if (format == "basic"){
            if (total > 1000){
                $(mainId).html(Math.round(total/1000) + "k");
                $(subId).html(Math.round(total/1000) + "k");
            } else {
                $(mainId).html(total);
                $(subId).html(total);
            }
        } else if (format == "decimal"){
            total = total.toFixed(2);
            $(mainId).html(total);
            $(subId).html(total);
        } else if (format == "percentage"){
            total = total.toFixed(2);
            $(mainId).html(total+"%");
            $(subId).html(total+"%");
        }
    }
    return total;
}

function sortDataByMonth(data){
    //sort the json into one set of data per month
    var julData = [];
    var augData = [];
    var sepData = [];
    var octData = [];
    var novData = [];
    var decData = [];

    for (var i =0;i<data.data.length;i++){
        switch (data.data[i].month){
            case "jul": julData.push(data.data[i]);
            break; 
            case "aug": augData.push(data.data[i]);
            break; 
            case "sep": sepData.push(data.data[i]);
            break; 
            case "oct": octData.push(data.data[i]);
            break; 
            case "nov": novData.push(data.data[i]);
            break; 
            case "dec": decData.push(data.data[i]);
            break; 
        }
    }
    currentData = [julData,augData,sepData,octData,novData,decData];
    rangeLength = decData.length-1;
}

function sortDataByWeek(data,month){
    var week1 = [];
    var week2 = [];
    var week3 = [];
    var week4 = [];
    var allWeeks = [week1,week2,week3,week4];
    var week = 0;
    var day = 0;
    var monthLength = data.data.length;

    for (var i =0;i<data.data.length;i++){
        if (data.data[i].month == month){
            if (week != 4 && day != 7){
                allWeeks[week].push(data.data[i]);
                day+=1;
                monthLength-=1;
                if (day == 7){
                    day = 0;
                    week+=1;
                }
            } else {
                if (monthLength != 0){
                    allWeeks[3].push(data.data[i]); //add the days past 28th of the month to week 4.
                }
            }
        }
    }
    currentData = allWeeks;
    rangeLength = week4.length-1;
}

function sortDataByDay(data,month,week){
    var allDays = []; 

    sortDataByWeek(data,month);

    for (var i=0;i<currentData[week].length;i++){
        var fakeDayArray = [];//the only reason this exist is to reuse getAverage and getTotal function of months and days
        fakeDayArray.push(currentData[week][i]);
        allDays.push(fakeDayArray);
    }

    currentData = allDays;
    rangeLength = 0;
}

function formatChartLabel(){
    var finalData = [];
    for (var i=0;i<currentData.length;i++){
        if (currentView == "monthly"){
            finalData.push(currentData[i][0].month+" '14");
        } else if (currentView == "weekly"){
            finalData.push("Week "+(i+1));
        } else if (currentView == "daily"){
            finalData.push(currentData[i][0].day+" "+currentData[i][0].month);
        }
    }
    return finalData;
}

function formatChartValue(type){
    var finalData = [];
    for (var i=0;i<currentData.length;i++){
        finalData.push(getTotal(currentData[i],type));
    }
    return finalData;
}

function drawChart(targetId,xData,yData){
    var ctx = document.getElementById(targetId).getContext("2d");

    var data = {
        labels: yData,
        datasets: [
            {
                tension:0,
                backgroundColor:"rgba(200,241,200,0.5)",
                pointBorderColor:"rgba(255,255,255,1)",
                pointBorderWidth:2,
                pointRadius:5,
                pointBackgroundColor:"rgba(9,155,0,1)",
                borderColor:"rgba(9,155,0,1)",
                data: xData
            }
        ]
    };

    var myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        line:{
        },
        legend:{
            display:false
        },
        scales: {
            xAxes:[{
                gridLines:{
                    display:false
                },
                ticks:{
                    fontColor:"rgba(181,181,181,1)",
                }
            }],
            yAxes: [{
                ticks: {
                    fontColor:"rgba(181,181,181,1)",
                    mirror:true,
                    padding:10,
                    callback: function(value, index, values) {
                    if(parseInt(value) > 1000){
                        return (Math.round(value/1000)).toString()+"k";
                    } else if (isNaN(parseInt(value))==false && parseInt(value) < 10){
                        return value.toFixed(2);
                    } else {
                        return value;
                    }
                    }
                }
            }]
        }
    }
    });
}

function drawMainData(){
    var revenue = getValue("revenue","#mainRevenue","#subRevenue","currency",currentData.length-1,true);
    getCompareValue(revenue,getValue("revenue","#mainRevenue","#subRevenue","currency",currentData.length-2,false),"#comRevenue");

    var sale = getValue("sale","#mainSale","#subSale","basic",currentData.length-1,true);
    getCompareValue(sale,getValue("sale","#mainSale","#subRevenue","basic",currentData.length-2,false),"#comSale");

    var customerC = getValue("customerC","#mainCustomer","#subCustomer","basic",currentData.length-1,true);
    getCompareValue(customerC,getValue("customerC","#mainCustomer","#subCustomer","basic",currentData.length-2,false),"#comCustomer");

    var grossP = getValue("grossP","#mainGp","#subGp","currency",currentData.length-1,true);
    getCompareValue(grossP,getValue("grossP","#mainGp","#subGp","currency",currentData.length-2,false),"#comGp")

    var discount = getValue("discount","#mainDiscount","#subDiscount","currency",currentData.length-1,true);
    getCompareValue(discount,getValue("discount","#mainDiscount","#subDiscount","currency",currentData.length-2,false),"#comDiscount");

    var discountP = getValue("discountP","#mainDiscountP","#subDiscountP","percentage",currentData.length-1,true);
    getCompareValue(discountP,getValue("discountP","#mainDiscountP","#subDiscountP","percentage",currentData.length-2,false),"#comDiscountP");

    var basketV = getValue("basketV","#mainBasketV","#subBasketV","currency",currentData.length-1,true);
    getCompareValue(basketV,getValue("basketV","#mainBasketV","#subBasketV","currency",currentData.length-2,false),"#comBasketV");

    var basketS = getValue("basketS","#mainBasketS","#subBasketS","decimal",currentData.length-1,true);
    getCompareValue(basketS,getValue("basketS","#mainBasketS","#subBasketS","decimal",currentData.length-2,false),"#comBasketS");
}

function drawRange(){
    var start = currentData[0][0].day + " " + currentData[0][0].month + " " + "2014";
    var end = currentData[currentData.length-1][rangeLength].day + " " + currentData[currentData.length-1][rangeLength].month + " " + "2014";
    $("#dateRange").html(start + " - " + end);
}

function drawAllCharts(){
        drawChart("revenueChart",formatChartValue("revenue"),formatChartLabel());
        drawChart("saleChart",formatChartValue("sale"),formatChartLabel());
        drawChart("customerChart",formatChartValue("customerC"),formatChartLabel());
        drawChart("gpChart",formatChartValue("grossP"),formatChartLabel());
        drawChart("discountChart",formatChartValue("discount"),formatChartLabel());
        drawChart("discountPChart",formatChartValue("discountP"),formatChartLabel());
        drawChart("basketVChart",formatChartValue("basketV"),formatChartLabel());
        drawChart("basketSChart",formatChartValue("basketS"),formatChartLabel());
}


function getData(){
    $.getJSON('source/source.json', function (data) {
        switch (currentView){
            case "monthly":sortDataByMonth(data);
            break;
            case "weekly":sortDataByWeek(data,"dec");
            break;
            case "daily":sortDataByDay(data,"dec","3");
            break;
        }
        //retrieve data only after ajax is completed
        drawMainData();
        drawRange();
        drawAllCharts();
    });
}

function init(){
    currentView = "monthly";
    $("#sortDaily").click(function(){currentView = "daily"; getData()});
    $("#sortWeekly").click(function(){currentView = "weekly"; getData()});
    $("#sortMonthly").click(function(){currentView = "monthly"; getData()});
    getData();
}

window.onload = init;