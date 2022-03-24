from processing.tabular_data_parse import parse_sheet
import json

tabular_dataset_list = []

def load_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    global tabular_dataset_list
    s = parse_sheet("public/table2.xlsx", "Sheet1")
    tabular_data_content = s.result()
    print(type(tabular_data_content))
    print(str(tabular_data_content))
    tabular_data_obj = {}
    tabular_data_obj["filename"] = "table2.xlsx"
    tabular_data_obj["row"] = 10
    tabular_data_obj["column"] = 20
    tabular_data_obj["content"] = str(tabular_data_content)
    tabular_dataset_list.append(tabular_data_obj)
    # tabular_data_obj = {"content": s.result()}
    # tabular_dataset.append(tabular_data_obj)

def get_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    return {"data": str(tabular_dataset_list)}