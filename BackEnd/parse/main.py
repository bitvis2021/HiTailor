from parse import ParsedSheet

# 测试输出
s = ParsedSheet("test1.xlsx", "Sheet1")
res = s.result()
for i in res:
    print(i)

