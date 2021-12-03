from tabular_data_parse import parse_sheet

# 测试输出
s = parse_sheet("../public/test1.xlsx", "Sheet1")
res = s.result()
for i in res:
    print(i)

