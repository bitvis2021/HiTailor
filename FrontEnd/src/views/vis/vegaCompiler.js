export function VegaPanel(data,vegaConfig) {
    this.data = data;

    this.fields=[];
    this.GetField();

    this.mark=[];
    
    this.encoding={};
    // parse vegalite panel
    if (!vegaConfig==undefined) {
        
    }
}

VegaPanel.prototype = {
    
    GetField:function(){
        // If input is in json format.
        let fst=this.data[0];
        Object.keys(fst).forEach(key => {
            this.fields.push(key);
        });
    }
    
}