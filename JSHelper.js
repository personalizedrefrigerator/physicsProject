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