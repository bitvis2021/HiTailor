from processing.tabular_data_parse import parse_sheet

tabular_dataset = []

def load_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    global tabular_dataset
    s = parse_sheet("public/test1.xlsx", "Sheet1")
    tabular_dataset = s.result()

def get_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    return tabular_dataset