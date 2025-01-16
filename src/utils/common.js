import BigNumber from "bignumber.js";
import dayjs from "dayjs";


export const getDayjsYYYYMDHMS = (timestamp) => {
    return dayjs(timestamp * 1000).format("YYYY-MM-DD HH:mm:ss")
}

export const getDayjsYYYYMD = (timestamp) => {
    return dayjs(timestamp * 1000).format("YYYY-MM-DD")
}

export const formatAmount = (amount) => {
    // K,M
    const valueString = typeof amount === "string" ? amount : String(amount);
    const fl = new BigNumber(valueString);
    if (fl > 1000000) {
        return fl.div(1000000).toFixed(2).toString() + 'M'
    } else if (fl > 1000) {
        return fl.div(1000).toFixed(2).toString() + 'K'
    } else {
        return fl.toString();
    }
}

export const getDayjsZ = (timestamp) => {
    let timeStr = dayjs(timestamp * 1000).format("(UTC Z)")
    return timeStr.replace(":00", "").replace("0", "")
}

export const getDayYYYYHMSZ = (timestamp) => {
    // 11月12日12:00 (UTC+8)
    return dayjs(timestamp * 1000).format("MM-DD HH:mm:ss (UTC Z)")
}

export const formatCountdown = (diffSecond) => {
    // 11天 12时 12分 12秒 (UTC+8)
    if (diffSecond <= 0) {
        return `00:00:00:00`
    }
    const days = autoSupplement(Math.floor(diffSecond / 60 / 60 / 24).toString())
    const hours = autoSupplement(Math.floor(diffSecond / 60 / 60 % 24).toString())
    const minutes = autoSupplement(Math.floor(diffSecond / 60 % 60).toString())
    const seconds = autoSupplement(Math.floor(diffSecond % 60).toString())
    return `${days}:${hours}:${minutes}:${seconds}`
}

export const autoSupplement = (val) => {
    return val.padStart(2, '0')
}

export const formatERC20Num = (value) => {
    const valueString = typeof value === "string" ? value : String(value);
    const fl = new BigNumber(valueString).div("1000000000000000000").toFixed(4, 4);
    return parseFloat(fl)
};

export const formatERC20 = (value) => {
    const valueString = typeof value === "string" ? value : String(value);
    const fl = new BigNumber(valueString).div("1000000000000000000").toFixed(4, 4);
    return getCurrencyFormat(parseFloat(fl));
};

export const fromERC20 = (value) => {
    const valueString = typeof value === "string" ? value : String(value);
    const fl = new BigNumber(valueString).div("1000000000000000000").toFixed(4);
    return parseFloat(fl).toString();
};

export const toERC20 = (value) => {
    const valueString = typeof value === "string" ? value : String(value);
    const fl = new BigNumber(valueString).times("1000000000000000000");
    return fl.toString();
};

export const NumberFormatting = (value) => {
    let num = new BigNumber(value);
    if (num > 1000) {
        return num.div(1000).toFixed(1).toString() + 'k'
    } else {
        return value
    }
}


export const numberFormat = (value, fixed) => {
    if (!fixed) {
        fixed = 2
    }
    const valueString = typeof value === "string" ? value : String(value);
    let fl = new BigNumber(valueString);
    if (fl > 1000000) {
        fl = fl.div(1000000).toFixed(fixed)
        return getCurrencyFormat(parseFloat(fl).toString()) + 'M'
    } else if (fl > 1000) {
        fl = fl.div(1000).toFixed(fixed)
        return getCurrencyFormat(parseFloat(fl).toString()) + 'K'
    } else {
        return getCurrencyFormat(parseFloat(fl.toFixed(fixed)).toString());
    }
};


export const numberPercentage = (value) => {
    const valueString = typeof value === "string" ? value : String(value);
    let fl = new BigNumber(valueString);
    fl = fl.times(100).toFixed(2)
    return fl.toString()
};

export const numberToFixed = (value, fixed) => {
    const valueString = typeof value === "string" ? value : String(value);
    let fl = new BigNumber(valueString).toFixed(fixed);
    return fl.toString()
};


export const getCurrencyFormat = (value, fixed = 2) => {
    if (!value) return Number(0).toFixed(fixed)
    value = Number(value).toFixed(fixed)
    const intPart = Number(value) - Number(value) % 1
    const intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    const value2Array = value.toString().split(".");
    if (value2Array.length === 2) {
        const floatPart = value2Array[1].toString();
        return intPartFormat + "." + floatPart;
    } else {
        return intPartFormat;
    }
};


export const getAddress = (address) => {
    if (address && address.length > 10) {
        return address.slice(0, 4) + '...' + address.slice(-6)
    }
    return address
}


export const getErrorMsg = (err) => {
    if (!err) {
        return "unknow error"
    }
    if (err.reason) {
        return err.reason
    } else if (err.shortMessage) {
        return err.shortMessage
    } else if (err.message) {
        return err.message
    } else if (err.details) {
        return err.details
    } else if (err.msg) {
        return err.msg
    } else {
        return err.toString()
    }
}
export const numberToCurrency = (value, fixed = 2, currency = 'USD') => {
    // 货币格式化为千分号 1000,000.00
    const options = {style:'currency', currency: currency, currencyDisplay: 'symbol'}
    const bigNumber = new BigNumber(value);
    return bigNumber.toFixed(fixed).toLocaleString('en-US', options)
}
export const clearNoNumAndDou = (value, max) => {
    if (!value) {
        return ""
    }
    value = value.replace(/[^\d\,]/g, '');// eslint-disable-line no-useless-escape
    if (parseFloat(value) < parseFloat(max)) {
        return value
    } else {
        return parseInt(max)
    }
}