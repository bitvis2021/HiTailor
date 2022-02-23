export let supportedTemplate={
    NQ_Simple_Bar_Chart:"N-Q Simple Bar Chart",
    NQ_Simple_Line_Chart:"N-Q Simple Line Chart",
    NQ_Strip_Plot:"N-Q Strip Plot",
    NQ_Box_Plot:"N-Q Box Plot",
    NQ_Ranged_Dot_Plot:"NQ Ranged Dot Plot",
    ANQ_Line_Chart:"ANQ Line Chart",
    ANQ_Bar_Chart:"ANQ_Bar_Chart",
    ANQN_Stacked_Bar_Chart:"ANQN Stacked Bar Chart",
    ANQN_Multi_Series_Line_Chart:"ANQN Multi Series Line Chart",
    NNQ_grouped_bar_chart:"NNQ grouped bar chart",
}

export function GetTemplate(templateName_str, regionMetaData, direction) {
    if (direction == undefined || direction == 'x' || direction =='horizontal') {
   		let defaultX = regionMetaData.x.headers[regionMetaData.x.headers.length - 1];
		 
	}
	else{
        let defaultY = regionMetaData.y.headers[regionMetaData.y.headers.length - 1];
	
	}
}

// After selection, user get templates data.


