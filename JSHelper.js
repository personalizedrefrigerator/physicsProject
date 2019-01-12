var JSHelper =
{
    "combineMaps": function(map1, map2)
    {
        var result = {};
        
        for(var i in map1)
        {
            result[i] = map1[i];
        }
        
        for(var i in map2)
        {
            result[i] = map2[i];
        }
        
        return result;
    }, // A random integer from a up to and including b.
    "randInt": function(a, b)
    {
        return Math.floor(Math.random() * (b - a + 1) + a);
    },
    "colorStringToArray": function(colorData)
    {
        var color = [0, 0, 0, 0.0];
        
        if(colorData.substring(0, "rgba(".length) === "rgba(" && colorData.length > "rgba(".length)
        {
            colorData = colorData.substring("rgba(".length, colorData.length - 1);
            
            var sections = colorData.split(",");
            
            if(sections.length === 4)
            {
                for(var i = 0; i < sections.length && i < color.length; i++)
                {
                    color[i] = MathHelper.forceParseFloat(sections[i]);
                }
            }
        }
        else if(colorData.length > 0 && colorData.charAt(0) === "#")
        {
            if(colorData.length === 6)
            {
                var red = MathHelper.parseHex(colorData.substring(0, 2));
                var green = MathHelper.parseHex(colorData.substring(2, 4));
                var blue = MathHelper.parseHex(colorData.substring(4, 6));
                
                color[0] = red;
                color[1] = green;
                color[2] = blue;
                color[3] = 1.0;
            }
        }
    
        return color;
    }
};

var JavaScriptHelper = JSHelper;
var JavaScriptHelp = JavaScriptHelper;

JavaScriptHelp.getSpeechSynthesisVoices = function()
{
    var voices = {};

    if(window.speechSynthesis)
    {
        var apiVoices = window.speechSynthesis.getVoices();
        for(var i in apiVoices)
        {
            voices[i] = apiVoices[i].lang + " y " + apiVoices[i].name;
        }
    }

    return voices;
};

JavaScriptHelper.getColorBasedOnTime = function(offset, divisorR, divisorG, divisorB, alpha)
{
    divisorR = divisorR || 10000;
    divisorG = divisorG || 10000;
    divisorB = divisorB || 10000;
    alpha = alpha || 1.0;

    var time = (new Date()).getTime();

    var r = Math.floor(0.5 * 256 * (Math.sin(time / divisorR + offset) + 1)),
    g = Math.floor(0.5 * 256 * (Math.sin(time / divisorG + offset) + 1)),
    b = Math.floor(0.5 * 256 * (Math.sin(time / divisorB + offset) + 1));

    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
};

JavaScriptHelper.compressSlashes = function(text)
{
    var segements = text.split("\\");
    var result = "";
    var slashCount = 0;
    var current;
    for(var i = 0; i < segements.length; i++)
    {
        current = segements[i];
        
        if(current != "")
        {
            if(slashCount > 0)
            {
                result += slashCount;
            }
            slashCount = 0;

            result += current;
            
            if(i + 1 < segements.length)
            {
                result += "\\";
            }
        }
        else
        {
            slashCount++;
        }
    }

    if(slashCount > 0)
    {
        result += "\\" + (slashCount - 2);
    }

    return result;
};

JavaScriptHelper.startsWithDigit = function(text)
{
    return text.length > 0 && (text.charAt(0)) >= '0' && text.charAt(0) <= '9';
};

JavaScriptHelper.decompressSlashes = function(text)
{
    var sections = text.split("\\");
    var result = "";
    var current = "";
    for(var i = 0; i < sections.length; i++)
    {
        current = sections[i];
        if( i > 0 && JavaScriptHelper.startsWithDigit(current))
        {
            result += "\\";
            var digitSection = "";
            while(JavaScriptHelper.startsWithDigit(current))
            {
                digitSection += current.charAt(0);
                current = current.substring(1, current.length);
            }
            //console.log(digitSection);

            var slashesToAdd = MathHelper.forceParseInt(digitSection);
            for(var j = 0; j < slashesToAdd; j++)
            {
                result += "\\";
            }
            result += current;
        }
        else if( i > 0 )
        {
            result += "\\" + current;
        }
        else
        {
            result += current;
        }
    }

    return result;
};
