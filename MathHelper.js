var MathHelper = 
{
    "forceParseInt": function(stringValue)
    {
        if(stringValue === undefined)
        {
            return 0;
        }
        
        if(!(typeof stringValue === "string") || stringValue.length === 0)
        {
            return 0;
        }
        
        var outputString = "";
        var currentCharacter;
        
        for(var i = 0; i < stringValue.length; i++)
        {
            currentCharacter = stringValue.charAt(i);
            
            if(currentCharacter >= '0' && currentCharacter <= '9')
            {
                outputString += currentCharacter;
            }
            else if(currentCharacter == '.')
            {
                break;
            }
        }
        
        if(outputString === '')
        {
            outputString = "0";
        }
        
        if(stringValue.charAt(0) == '-')
        {
            outputString = '-' + outputString;
        }
        
        return parseInt(outputString);
    },
    "forceParseFloat": function(stringValue)
    {
        if(stringValue === undefined)
        {
            return 0;
        }
        
        if(!(typeof stringValue === "string") || stringValue.length === 0)
        {
            return 0;
        }
        
        var outputString = "";
        var currentCharacter;
        var addedPoint = false;
        
        for(var i = 0; i < stringValue.length; i++)
        {
            currentCharacter = stringValue.charAt(i);
            
            if(currentCharacter >= '0' && currentCharacter <= '9')
            {
                outputString += currentCharacter;
            }
            else if(currentCharacter == '.' && !addedPoint)
            {
                outputString += ".";
                addedPoint = true;
            }
        }
        
        if(outputString === '')
        {
            outputString = "0";
        }
        
        if(stringValue.charAt(0) == '-')
        {
            outputString = '-' + outputString;
        }
        
        return parseFloat(outputString);
    },
    "getNumberValue": function(character)
    {
        var result = "";
        
        if(character >= '0' && character <= '9')
        {
            result = parseInt(character);
        }
        else
        {
            result = character.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        }
        
        return result;
    },
    "parseHex": function(hexString)
    {
        var result = 0;
        var power = 0;
        
        for(var i = hexString.length - 1; i >= 0; i--)
        {
            var digit = MathHelper.getNumberValue(hexString.charAt(i));
            result += Math.pow(16, power) * digit;
            
            power++;
        }
        
        return result;
    }
};