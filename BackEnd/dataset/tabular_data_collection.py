from processing.tabular_data_parse import parse_sheet
import json

tabular_dataset_list = []

def load_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    global tabular_dataset_list
    namelist = ["Console Sales.xlsx", "Console Sales(cumulative).xlsx", "US Investment Abroad.xlsx", "School Curriculums.xlsx"]
    rowlist = [42,42,41,17]
    collist = [35,39,15,11]
    for index in range(len(namelist)):
        prefix = "public/"
        sheet = "Sheet1"
        filename = prefix + namelist[index]
        s = parse_sheet(filename, sheet)
        tabular_data_content = s.result()
        print(type(tabular_data_content))
        print(str(tabular_data_content))
        tabular_data_obj = {}
        tabular_data_obj["filename"] = namelist[index]
        tabular_data_obj["row"] = rowlist[index]
        tabular_data_obj["column"] = collist[index]
        tabular_data_obj["content"] = str(tabular_data_content)
        tabular_dataset_list.append(tabular_data_obj)

    # tabular_data_obj = {"content": s.result()}
    # tabular_dataset.append(tabular_data_obj)

def get_tabular_dataset():
    '''
        read tabular dataset and process
    '''
    return {"data": str(tabular_dataset_list)}