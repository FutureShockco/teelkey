// validates amount, buy (strictly positive)

module.exports = (value, canBeZero, canBeNegative, max, min) => {
    if (!max)
        max = Number.MAX_VALUE 
    if (!min)
        if (canBeNegative)
            min = Number.MIN_VALUE
        else
            min = 0
    
    if (typeof value !== 'number')
        return false
    if (!Number.isSafeInteger(value) && !(value === +value && value !== (value|0)))
        return false
    if (!canBeZero && value === 0)
        return false
    if (!canBeNegative && value < 0)
        return false
    if (value > max)
        return false
    if (value < min)
        return false

    return true
}