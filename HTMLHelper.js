
var HTMLHelper =
{
    "textToHTML": function(text)
    {
        text = text || "";
    
        var result = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>").replace(/  /g, " &nbsp;");
        
        return result;
    },
    "formattedTextToHTML": function(text)
    {
        var result = "";
        
        var inParagraph = false,
            inHeader = false;
            
        var lastCharacter = undefined;
        
        var currentCharacter = '';
        for(var i = 0; i < text.length; i++)
        {
            currentCharacter = text.charAt(i);
            
            switch(currentCharacter)
            {
                case '<':
                    result += "&lt;";
                    break;
                case '>':
                    result += "&gt;";
                    break;
                case '\n':
                    if(inParagraph)
                    {
                        result += "</p>";
                    }
                    
                    inParagraph = true;
                
                    result += "<p>";
                    break;
                case '_':
                    if(inHeader)
                    {
                        result += "</h2>";
                        
                        inHeader = false;
                    }
                    else if(lastCharacter && (lastCharacter === " " || lastCharacter === "\n") || lastCharacter === undefined)
                    {
                        inHeader = true;
                
                        result += "<h2>";
                    }
                    else
                    {
                        result += "_";
                    }
                    break;
                case '&':
                    result += "&amp;";
                    break;
                default:
                    result += currentCharacter;
            }

            
            lastCharacter = currentCharacter;
        }
        
        if(inParagraph)
        {
            result += "</p>";
        }
                    
        if(inHeader)
        {
            result += "</h2>";
        }
        
        return result;
    },
    "drawDashedLine": function(ctx, x1, y1, x2, y2, dashLength)
    {
        var dashCount = Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / dashLength);
        
        var x = x1,
            y = y1;
            
        var nextX, nextY;
        
        var deltaX = (x2 - x1) / dashCount;
        var deltaY = (y2 - y1) / dashCount;
        
        dashOn = true;
        for(var i = 0; i < dashCount; i++)
        {
            nextX += deltaX;
            nextY += deltaY;
            
            if(dashOn)
            {
                ctx.moveTo(x, y);
                ctx.lineTo(nextX, nextY);
            }
            
            dashOn = !dashOn;
            
            x = nextX;
            y = nextY;
        }
    },
    "addLineBreak": function(element)
    {
        element.appendChild(document.createElement("br"));
    },
    "addHR": function(element)
    {
        element.appendChild(document.createElement("hr"));
    },
    "addLabel": function(text, parentElement, tagName)
    {
        var labelElement = document.createElement(tagName || "span");
        labelElement.innerHTML = text;
        
        parentElement.appendChild(labelElement);
        
        return labelElement;
    },
    "addButton": function(text, command, parentElement, submitOnEnter)
    {
        var buttonElement = document.createElement("button");
        buttonElement.innerHTML = text;
        
        buttonElement.onclick = function()
        {
            command.apply(this, arguments);
        };
        
        var addEnterListener = function(element)
        {
            element.addEventListener("keyup", function(event)
            {
                if(event.keyCode == 13)
                {
                    command.apply(this, arguments);
                }
            });
        };
        
        if(submitOnEnter)
        {
            for(var i in submitOnEnter)
            {
                addEnterListener(submitOnEnter[i]);
            }
        }
        
        parentElement.appendChild(buttonElement);
        
        return buttonElement;
    },
    "addSlider": function(minimum, maximum, step, parentElement, value)
    {
        var input = HTMLHelper.addInput("", value || 0, parentElement, "range");
        input.min = minimum;
        input.max = maximum;
        input.step = step || 0.1;
        
        return input;
    },
    "addInput": function(placeHolder, value, parentElement, type)
    {
        var tagName = "input";
        
        if(type === "textarea")
        {
            tagName = "textarea";
        }
        
        var inputElement = document.createElement(tagName);
        
        inputElement.value = value || "";
        inputElement.setAttribute("placeholder", placeHolder || "");
        inputElement.type = type || "text";
        
        parentElement.appendChild(inputElement);
        
        return inputElement;
    },
    "addBoundedInput": function(placeHolder, value, maxLength, parentElement, type, checkLengthStorage)
    {
        var tagName = "input";
        
        if(type === "textarea")
        {
            tagName = "textarea";
        }
        
        checkLengthStorage = checkLengthStorage || {};
        
        var containerElement = document.createElement("span");
        var inputElement = document.createElement(tagName);
        var errorDescription = document.createElement("span");
        
        inputElement.setAttribute("class", "boundedInputOk");
        errorDescription.setAttribute("class", "errorDescription");
        
        inputElement.value = value || "";
        inputElement.setAttribute("placeholder", placeHolder || "");
        inputElement.type = type || "text";
        
        var checkLength = function()
        {
            if(inputElement.value.length > maxLength)
            {
                inputElement.setAttribute("class", "boundedInputOversize");
                errorDescription.innerHTML = (inputElement.value.length - maxLength) + " too many characters.";
            }
            else
            {
                inputElement.setAttribute("class", "boundedInputOk");
                errorDescription.innerHTML = "";
            }
        };
        
        inputElement.addEventListener("keypress", function()
        {
            checkLength();
        });
        
        inputElement.addEventListener("change", function()
        {
            checkLength();
        });
        
        inputElement.addEventListener("input", function()
        {
            checkLength();
        });
        
        checkLengthStorage.checkLength = checkLength;
        
        containerElement.appendChild(inputElement);
        containerElement.appendChild(errorDescription);
        parentElement.appendChild(containerElement);
        
        return inputElement;
    },
    "transitionProperty": function(setValueFunction, start, stop, duration, onComplete, doRound, suffix)
    {
        suffix = suffix || 0;
        duration = duration || 100;
        onComplete = onComplete || function() {};
        
        var slope = (stop - start) / (duration);
        var lastTime = (new Date()).getTime();
        var value = start;
        
        setValueFunction(value);
        
        function animate()
        {
            var nowTime = (new Date()).getTime();
            var deltaT = nowTime - lastTime;
            
            value += slope * deltaT;
            
            setValueFunction((!doRound ? value : Math.floor(value)) + suffix);
            
            lastTime = nowTime;
            
            if(value > stop && slope < 0 || value < stop && slope > 0)
            {
                requestAnimationFrame(animate);
            }
            else
            {
                onComplete();
            }
        }
        animate();
    },
    "eventArgumentToXY": function(handle, preventDefault)
    {
        return function(event)
        {
            if(preventDefault)
            {
                event.preventDefault();
            }
            
            handle(event.clientX, event.clientY);
        };
    },
    "eventArgumentToElementXY": function(event, element)
    {
        var bbox = element.getBoundingClientRect();
        
        var result = { 'x': null, 'y': null };
        
        result.x = event.clientX - bbox.left;
        result.y = event.clientY - bbox.top;
        
        return result;
    },
    "commandMapToButtons": function(commandMap)
    {
        var result = document.createElement("div");
        
        var createButton = function(key)
        {
            HTMLHelper.addButton(key, function()
            {
                commandMap[key].apply(this, arguments);
            }, result);
        };
        
        for(var key in commandMap)
        {
            createButton(key);
        }
        
        return result;
    },
    "chainOldAndNew": function(oldFunction, newFunction, setOldFunction)
    {
        var secondaryRefrenceToOld = oldFunction || function() {};
        
        setOldFunction(function()
        {
            secondaryRefrenceToOld.apply(this, arguments);
            return newFunction.apply(this, arguments);
        });
    },
    "normalizeZIndiciesAndGetMax": function(array, minZIndex)
    {
        if(array.length === 0)
        {
            return;
        }
        
        array.sort(function(a, b)
        {
            return a.getZIndex() - b.getZIndex();
        });
        
        var lastZIndex = minZIndex;
        var currentZIndex;
        for(var index = 0; index < array.length; index++)
        {
            currentZIndex = array[index].getZIndex();
            
            if(currentZIndex <= lastZIndex)
            {
                array[index].setZIndex(lastZIndex + 1);
                currentZIndex = lastZIndex + 1;
            }
            
            lastZIndex = currentZIndex;
        }
        
        var maxZIndex = array[array.length - 1].getZIndex();
        
        return maxZIndex;
    },
    "unZoomDocument": function(unlockZoom)
    {
        var viewPortMeta = document.getElementById("viewPort");
        
        if(!viewPortMeta)
        {
            viewPortMeta = document.createElement("meta");
            viewPortMeta.setAttribute("name", "viewport");
            
            document.body.parentElement.appendChild(viewPortMeta);
        }
        
        viewPortMeta.setAttribute("content", "width = device-width, maximum-scale=1.0, minumum-scale=1.0");
        
        if(unlockZoom)
        {
            requestAnimationFrame(function()
            {
                viewPortMeta.setAttribute("content", "width = device-width, maximum-scale=10.0, minumum-scale=1.0");
            });
        }
    },

    // This function currently handles rgba(r, g, b, a) style strings. It may be modified to handle others.
    "colorStringToArray": function(colorString)
    {
        var resultantArray = [];
        colorString = colorString || "rgba(0, 0, 0, 0.0)";
        
        if(colorString.indexOf("rgba(") !== 0)
        {
            colorString = "rgba(" + colorString + ")";
        }
        
        var colorSections = colorString.split(",");
        
        for(var i = 0; i < colorSections.length; i++)
        {
            resultantArray.push(MathHelper.forceParseFloat(colorSections[i]));
        }

        while(resultantArray.length < 4)
        {
            resultantArray.push(0.0);
        }

        return resultantArray;
    },

    "changeColorArrayRGBMax": function(inputArray, oldMax, newMax)
    {
        for(var i = 0; i < inputArray.length - 1; i++)
        {
            inputArray[i] /= oldMax;
            inputArray[i] *= newMax;
        }

        return inputArray;
    },

    "changeColorStringRGBMax": function(inputString, oldMax, newMax)
    {
        var inputArray = HTMLHelper.colorStringToArray(inputString);

        for(var i = 0; i < inputArray.length - 1; i++)
        {
            inputArray[i] /= oldMax;
            inputArray[i] *= newMax;
        }

        var outputString = HTMLHelper.colorArrayToString(inputArray);

        return outputString;
    },

    "colorArrayToString": function(colorArray)
    {
        var colorString = "rgba(";

        for(var i = 0; i < colorArray.length; i++)
        {
            colorString += colorArray[i];

            if(i < colorArray.length - 1)
            {
                colorString += ",";
            }
        }

        colorString += ")";

        return colorString;
    }
};
