function TabbedDisplay(tabNameMap, parent)
{
    this.element = document.createElement("div");
    this.options = document.createElement("div");
    this.contentContainer = document.createElement("div");
    this.content = document.createElement("div");
    this.contentElement = document.createElement("div");
    
    this.options.style.columnCount = tabNameMap.length;
    
    /*this.element.style.display = "table";
    this.options.style.display = "table-header-group";
    this.contentContainer.style.display = "table-row-group";
    this.content.style.display = "table-row";
    this.contentElement.style.display = "table-cell";*/
    
    this.options.setAttribute("class", "tabHeader");
    
    this.element.appendChild(this.options);
    this.element.appendChild(this.contentContainer);
    this.contentContainer.appendChild(this.content);
    this.content.appendChild(this.contentElement);
    
    this.element.style.width = "100%";
    this.options.style.width = "100%";
    this.content.style.width = "100%";
    this.contentElement.style.width = "100%";
    
    var me = this;
    
    this.reload = function()
    {
        me.options.innerHTML = "";
        me.contentElement.innerHTML = "";
        
        var tabCount = 0;
        
        for(var i in tabNameMap)
        {
            tabCount++;
        }
        
        var labels = [];
        var addTab = function(key)
        {
            var tabLabel = document.createElement("span"),
                tabContent = document.createElement("div");
            labels.push(tabLabel);
            var myIndex = labels.length - 1;
                
            tabLabel.style.display = "inline-block";
            tabLabel.style.width = Math.floor(1 / tabCount * 100) + "%";
            
            tabLabel.setAttribute("class", "tabLabel");
            
            tabLabel.innerHTML = key;
            tabContent.appendChild(tabNameMap[key]);
            
            tabLabel.onclick = function()
            {
                me.contentElement.innerHTML = "";
            
                me.contentElement.appendChild(tabContent);
                
                for(var index = 0; index < labels.length; index++)
                {
                    if(index !== myIndex)
                    {
                        labels[index].style.filter = "opacity(40%)";
                    }
                    else
                    {
                        labels[index].style.filter = "opacity(80%)";
                    }
                }
            };
            
            me.options.appendChild(tabLabel);
            tabLabel.onclick();
        };
        
        for(var key in tabNameMap)
        {
            addTab(key);
        }
    };
    
    me.reload();
    parent.appendChild(this.element);
}