var SubWindowHelper = 
{
    "draggableDisplay": null,
    "windowList": {},
    "windowCount": 0,
    "getDraggableDisplay": function()
    {
        if(!SubWindowHelper.draggableDisplay)
        {
            SubWindowHelper.draggableDisplay = document.createElement("div");
            SubWindowHelper.draggableDisplay.setAttribute("class", "draggableHelper");
            SubWindowHelper.draggableDisplay.style.display = "none";
            document.body.appendChild(SubWindowHelper.draggableDisplay);
        }
        
        return SubWindowHelper.draggableDisplay;
    },
    "create": function(options)
    {
        var result = new Window(document.body,
            SubWindowHelper.windowList, SubWindowHelper.windowCount, options);
        
        SubWindowHelper.windowCount++;
        
        return result;
    },
    "alert": function(title, text, onSubmit, windowOptions, okLabel)
    {
        onSubmit = onSubmit || function() {};
        windowOptions = windowOptions || {};
        windowOptions.width = windowOptions.width || "auto";
        windowOptions.height = windowOptions.height || "auto";
        windowOptions.resizable = windowOptions.resizable || false;
        windowOptions.XButton = windowOptions.XButton || false;
        windowOptions.maxWidth = windowOptions.maxWidth || "50%";
        windowOptions.title = title || windowOptions.title || "Confirm";
        
        var newWindow = SubWindowHelper.create(windowOptions);
        
        var dialogueContent = document.createElement("span");
        
        HTMLHelper.addLabel(text, dialogueContent, "div");
        
        HTMLHelper.addButton(okLabel || "Ok", function()
        {
            onSubmit(true);
            newWindow.close();
        }, dialogueContent);
        
        newWindow.appendChild(dialogueContent);
        
        return newWindow;
    },
    "confirm": function(title, text, onSubmit, windowOptions, okLabel, cancelLabel)
    {
        onSubmit = onSubmit || function() {};
        windowOptions = windowOptions || {};
        windowOptions.XButton = windowOptions.XButton || false;
        var newWindow = SubWindowHelper.alert.apply(this, arguments);
        
        HTMLHelper.addButton(cancelLabel || "Cancel", function()
        {
            onSubmit(false);
            newWindow.close();
        }, newWindow.getContent());
        
        return newWindow;
    },
    "prompt": function(title, text, placeHolder, onSubmit, inputType, windowOptions, inputOptions)
    {
        onSubmit = onSubmit || function() {};
        windowOptions = windowOptions || {};
        windowOptions.width = windowOptions.width || "auto";
        windowOptions.height = windowOptions.height || "auto";
        windowOptions.maxWidth = windowOptions.maxWidth || "50%";
        windowOptions.resizable = windowOptions.resizable || false;
        windowOptions.title = title || windowOptions.title || "Confirm";
        
        var newWindow = SubWindowHelper.create(windowOptions);
        
        var dialogueContent = document.createElement("span");
        
        HTMLHelper.addLabel(text, dialogueContent, "div");
        var responseInput = HTMLHelper.addInput(placeHolder, "", dialogueContent, inputType);
        
        HTMLHelper.addButton("Ok", function()
        {
            onSubmit(responseInput.value);
            newWindow.close();
        }, dialogueContent, [responseInput]);
        
        newWindow.appendChild(dialogueContent);

        if(inputOptions)
        {
            for(var i in inputOptions)
            {
                responseInput[i] = inputOptions[i];
            }
        }
        
        return newWindow;
    },
    "multiInputPrompt": function(title, text, inputPlaceholders, inputTypes, onSubmit, windowOptions)
    {
        onSubmit = onSubmit || function() {};
        windowOptions = windowOptions || {};
        windowOptions.width = windowOptions.width || "auto";
        windowOptions.height = windowOptions.height || "auto";
        windowOptions.resizable = windowOptions.resizable || false;
        windowOptions.title = title || windowOptions.title || "Confirm";
        windowOptions.maxWidth = windowOptions.maxWidth || "50%";
        
        var newWindow = SubWindowHelper.create(windowOptions);
        
        var dialogueContent = document.createElement("span");
        
        HTMLHelper.addLabel(text, dialogueContent, "div");
        var responseInputs = [];
        
        var placeHolder, inputType;
        for(var index = 0; index < inputTypes.length 
                && index < inputPlaceholders.length; index++)
        {
            placeHolder = inputPlaceholders[index];
            inputType = inputTypes[index];
            
            responseInputs.push(HTMLHelper.addInput(placeHolder, "", dialogueContent, inputType));
        }
        
        HTMLHelper.addButton("Ok", function()
        {
            var values = [];
            for(var index = 0; index < responseInputs.length; index++)
            {
                values.push(responseInputs[index].value);
            }
            
            onSubmit(values);
            newWindow.close();
        }, dialogueContent, responseInputs);
        
        newWindow.appendChild(dialogueContent);
        
        return newWindow;
    },
    "promptForColor": function(title, description, defaultRGBA, onComplete, windowOptions)
    {
        color = defaultRGBA || [0, 0, 0, 0.0];
        
        while(color.length < 4)
        {
            color.push(0);
        }
        
        windowOptions = windowOptions || {};
        windowOptions.width = windowOptions.width || "auto";
        windowOptions.height = windowOptions.height || "auto";
        windowOptions.resizable = windowOptions.resizable || false;
        windowOptions.title = title || windowOptions.title || "Confirm";
        windowOptions.maxWidth = windowOptions.maxWidth || "50%";
        
        var newWindow = SubWindowHelper.create(windowOptions);
        
        var dialogueContent = document.createElement("span");
        
        var descriptionLabel = HTMLHelper.addLabel(description, dialogueContent, "div");

        descriptionLabel.style.textShadow = "0px 0px 5px white";
        
        var sliders = [];
        
        for(var i = 0; i < 3; i++)
        {
            sliders.push(HTMLHelper.addSlider(0, 256, 1, dialogueContent));
        }
        sliders.push(HTMLHelper.addSlider(0, 1.0, 0.025, dialogueContent));
        
        var handleSlider = function(sliderIndex)
        {
            if(sliderIndex >= color.length || sliderIndex >= sliders.length)
            {
                return;
            }
            
            var updateColorFromSlider = function()
            {
                color[sliderIndex] = sliders[sliderIndex].value;
                
                updateSliders();
                updateInput();
                updateWindow();
            };
            
            sliders[sliderIndex].onchange = updateColorFromSlider;
            sliders[sliderIndex].oninput = updateColorFromSlider;
        };
        
        for(var i = 0; i < sliders.length; i++)
        {
            handleSlider(i);
        }
        
        var updateSliders = function()
        {
            for(var i = 0; i < sliders.length && i < color.length; i++)
            {
                sliders[i].value = color[i];
                sliders[i].style.backgroundColor = "rgba(" + color.join(",") + ")";
            }
        };
        
        var textInput = HTMLHelper.addInput("Color", "rgba(" + color.join(',') + ")", dialogueContent);
        
        var updateColorFromTextInput = function()
        {
            var colorData = textInput.value;
            
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
                    
                    updateSliders();
                    updateInput();
                    updateWindow();
                }
            }
            else if(colorData.length > 0 && colorData.charAt(0) === "#")
            {
                colorData = colorData.substring(1, colorData.length);
                if(colorData.length === 6)
                {
                    var red = MathHelper.parseHex(colorData.substring(0, 2));
                    var green = MathHelper.parseHex(colorData.substring(2, 4));
                    var blue = MathHelper.parseHex(colorData.substring(4, 6));
                    
                    color[0] = red;
                    color[1] = green;
                    color[2] = blue;
                    
                    updateSliders();
                    updateInput();
                    updateWindow();
                }
            }
        };
        
        textInput.oninput = updateColorFromTextInput;
        textInput.onchange = updateColorFromTextInput;
        
        var updateInput = function()
        {
            textInput.value = "rgba(" + color.join(',') + ")";
            textInput.style.boxShadow = "3px 3px 10px " + textInput.value;
        };
        
        var updateWindow = function()
        {
            newWindow.getContent().style.backgroundColor = textInput.value;
        }
        
        updateInput();
        updateSliders();
        updateWindow();
        
        newWindow.element.style.backgroundImage = "radial-gradient(black, white)";
        newWindow.element.style.backgroundSize = "5px 5px";
        
        HTMLHelper.addButton("Ok", function()
        {
            onComplete.apply(this, color);
            
            newWindow.close();
        }, dialogueContent, [textInput]);
        
        newWindow.appendChild(dialogueContent);
        
        return newWindow;
    }
};


function Window(parent, windowList, windowCount, options)
{
    options = options || {};
    
    var classPrefix = "base";
    if(options.classPrefix)
    {
        classPrefix = options.classPrefix;
    }
    
    this.minWidth = options.minWidth !== undefined ? options.minWidth : 100;
    this.minHeight = options.minHeight !== undefined ? options.minHeight : 100;
    
    this.id = windowCount + "";
    windowList[this.id] = this;
    
    this.draggableDisplay = document.createElement("div");
    this.draggableDisplay.setAttribute("class", "draggableHelper");
    this.draggableDisplay.style.display = "none";

    this.element = document.createElement("div");
    this.title = document.createElement("div");
    this.content = document.createElement("div");
    this.closeButton = document.createElement("span");
    this.dragCircle = document.createElement("div");
    this.content = document.createElement("div");
    
    this.title.setAttribute("class", classPrefix + "WindowTitleBar windowTitleBar");
    this.content.setAttribute("class", classPrefix + "WindowContent windowContent");
    this.closeButton.setAttribute("class", classPrefix + "WindowCloseButton windowCloseButton");
    this.element.setAttribute("class", classPrefix + "Window window");
    this.dragCircle.setAttribute("class", classPrefix + "WindowDragCircle windowDragCircle");
    
    this.title.innerHTML = options.title || "Untitled Window";
    this.closeButton.innerHTML = "X";
    this.element.style.zIndex = windowCount;
    
    if(options.width)
    {
        this.element.style.width = options.width;
    }
    
    if(options.height)
    {
        this.element.style.height = options.height;
    }
    
    if(options.x)
    {
        this.element.style.left = options.x;
    }
    
    if(options.y)
    {
        this.element.style.top = options.y;
    }
    
    if(options.maxWidth)
    {
        this.element.style.maxWidth = options.maxWidth;
    }
    
    if(options.onClose)
    {
        this.onClose = options.onClose;
    }
    
    if(options.scrollX === false)
    {
        this.element.style.overflowX = "hidden";
        this.content.style.overflowX = "hidden";
    }
    
    if(options.scrollY === false)
    {
        this.element.style.overflowY = "hidden";
        this.content.style.overflowY = "hidden";
    }
    
    var zIndex = 5;
    this.element.style.zIndex = zIndex;
    
    parent.appendChild(this.element);
    parent.appendChild(this.draggableDisplay);
    this.element.appendChild(this.title);
    
    if(options.XButton === undefined || options.XButton)
    {
        this.element.appendChild(this.closeButton);
    }
    
    if(options.resizable === undefined || options.resizable)
    {
        this.element.appendChild(this.dragCircle);
    }
    
    this.element.appendChild(this.content);
    
    var me = this;
    this.lock = function()
    {
        var lockDiv = document.createElement("div");
        lockDiv.style.position = "absolute";
        lockDiv.style.left = 0;
        lockDiv.style.right = 0;
        lockDiv.style.top = 0;
        lockDiv.style.bottom = 0;
        
        me.element.appendChild(lockDiv);
    };
    
    this.close = function()
    {
        me.lock();
        
        if(me.onClose)
        {
            me.onClose();
        }
        
        HTMLHelper.transitionProperty(function(value) { me.element.style.filter = "opacity(" + value + "%) sepia(" + (100 - value) + "%)"; },
            100, 0, 1000, function()
        {
            me.element.style.display = "none";
            setTimeout(function()
            {
                parent.removeChild(me.element);
                delete windowList[me.id];
            }, 100);
        }, false, 0);
    };
    
    this.setTitle = function(title)
    {
        me.title.innerHTML = title;
    };
    
    this.destroy = this.close;
    
    this.hide = function()
    {
        me.element.style.display = "none";
    };
    
    this.show = function()
    {
        me.element.style.display = "block";
    };
    
    this.setZIndex = function(setTo)
    {
        zIndex = setTo;
        me.element.style.zIndex = setTo;
    };
    
    this.getZIndex = function()
    {
        return zIndex;
    };
    
    this.appendChild = function(childElement)
    {
        me.content.appendChild(childElement);
    };
    
    this.getContent = function()
    {
        return me.content;
    };
    
    this.raise = function()
    {
        var minZIndex = 5;
        var windowArray = [];
        
        for(var key in windowList)
        {
            windowArray.push(windowList[key]);
        }
        
        var maxZIndex = HTMLHelper.normalizeZIndiciesAndGetMax(windowArray, minZIndex);
        
        me.setZIndex(maxZIndex + 1);
    };
    
    this.loadDragListeners = function(setProperty, getInitial, startElement)
    {
        var lastX, lastY;
        var dragX, dragY;
        var dragging = false;
        
        var dragStart = function(clientX, clientY)
        {
            var initial = getInitial();
            
            lastX = clientX;
            lastY = clientY;
            
            dragX = initial.x;
            dragY = initial.y;
            
            me.draggableDisplay.style.display = "block";
            me.raise();
            
            dragging = true;
        };
        
        var dragMove = function(clientX, clientY)
        {
            if(dragging)
            {
                var deltaX = clientX - lastX;
                var deltaY = clientY - lastY;
                
                dragX += deltaX;
                dragY += deltaY;
                
                setProperty(dragX, dragY);
                
                lastX = clientX;
                lastY = clientY;
            }
        };
        
        var dragEnd = function()
        {
            dragging = false;
            me.draggableDisplay.style.display = "none";
        };
        
        startElement.onmousedown = HTMLHelper.eventArgumentToXY(dragStart, true);
        
        // Chain a call to HTMLHelper.eventArgumentToXY(...) with whatever the listener was previously.
        HTMLHelper.chainOldAndNew(me.draggableDisplay.onmousemove, HTMLHelper.eventArgumentToXY(dragMove, true), function(newFunction) { me.draggableDisplay.onmousemove = newFunction; });
        HTMLHelper.chainOldAndNew(me.draggableDisplay.onmouseup, HTMLHelper.eventArgumentToXY(dragEnd, true), function(newFunction) { me.draggableDisplay.onmouseup = newFunction; });
        HTMLHelper.chainOldAndNew(me.draggableDisplay.onmouseleave, HTMLHelper.eventArgumentToXY(dragEnd, true), function(newFunction) { me.draggableDisplay.onmouseleave = newFunction; });
        
        startElement.addEventListener("touchstart", function(e)
        {
            e.preventDefault();
            var touchEvent1 = e.changedTouches[0];
            dragStart(touchEvent1.clientX, touchEvent1.clientY);
        }, false);
        
        startElement.addEventListener("touchmove", function(e)
        {
            e.preventDefault();
            var touchEvent1 = e.changedTouches[0];
            dragMove(touchEvent1.clientX, touchEvent1.clientY);
        }, false);
        
        startElement.addEventListener("touchend", function(e)
        {
            e.preventDefault();
            var touchEvent1 = e.changedTouches[0];
            dragEnd(touchEvent1.clientX, touchEvent1.clientY);
        }, false);
        
        
        me.draggableDisplay.addEventListener("touchmove", function(e)
        {
            e.preventDefault();
            var touchEvent1 = e.changedTouches[0];
            dragMove(touchEvent1.clientX, touchEvent1.clientY);
        }, true);
        
        me.draggableDisplay.addEventListener("touchend", function(e)
        {
            e.preventDefault();
            var touchEvent1 = e.changedTouches[0];
            dragEnd(touchEvent1.clientX, touchEvent1.clientY);
        }, true);
    };
    
    this.loadCloseListeners = function()
    {
        me.closeButton.onclick = function()
        {
            me.close();
        };
    };
    
    // Move
    this.loadDragListeners(function(x, y)
    {
        me.element.style.left = x + "px";
        me.element.style.top = y + "px";
    }, function()
    {
        var bbox = me.element.getBoundingClientRect();
        
        var location = {"x": bbox.left, "y": bbox.top};
        
        return location;
    }, me.title);
    
    // Resize
    this.loadDragListeners(function(width, height)
    {
        if(width < me.minWidth)
        {
            width = me.minWidth;
        }
        
        if(height < me.minHeight)
        {
            height = me.minHeight;
        }
        
        me.element.style.width = width + "px";
        me.element.style.height = height + "px";
        
        if(me.onresize)
        {
            me.onresize();
        }
    }, function()
    {
        var location = {"x": me.element.clientWidth, "y": me.element.clientHeight};
        
        return location;
    }, me.dragCircle);
    
    me.dragCircle.ondblclick = function(event)
    {
        if(me.element.style.width !== "100%")
        {
            me.element.style.width = "100%";
        }
        else if(me.element.style.height !== "100%")
        {
            me.element.style.height = "100%";
        }
        else
        {
            me.element.style.width = options.width || "";
            me.element.style.height = options.height || "";
        }
        
        if(me.onresize)
        {
            me.onresize();
        }
    };
    
    this.loadCloseListeners();
    
    this.element.addEventListener("click", function()
    {
        me.raise();
    });
    
    this.raise();
    
    if(!options.x && !options.y)
    {
        requestAnimationFrame(function()
        {
            me.element.style.left = Math.floor(window.innerWidth / 2 - me.element.clientWidth/2) + "px";
            me.element.style.top = Math.floor(window.innerHeight / 2 - me.element.clientHeight/2) + "px";
        });
    }
    
    requestAnimationFrame(function()
    {
        me.content.style.height = (me.element.clientHeight - me.title.clientHeight) + "px";
        
        me.onresize = function()
        {
            me.content.style.height = (me.element.clientHeight - me.title.clientHeight) + "px";
        };
        
        HTMLHelper.chainOldAndNew(document.body.onresize, function()
        {
            me.onresize();
        }, function(newResize)
        {
            document.body.onresize = newResize;
        });
        
        me.raise();
    });
}
