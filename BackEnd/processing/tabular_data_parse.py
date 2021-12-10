from openpyxl import load_workbook, cell

class parse_cell:
    def __init__(self, start, value, dtype, length):
        self.start = start  # 起始坐标
        self.end = start  # 终止坐标，若非MergedCell则end = start
        self.value = value
        self.dtype = dtype   # 数据类型
        self.length = []
        self.length.append(length)
        self.merged = False

    def __repr__(self):     # 用于测试输出
        return "{" + "\"start\":" + str(self.start) + "," + "\"end\":" + str(self.end) + "," + "\"value\":" + "\"" + str(self.value) + "\"" + "," + "\"length\":" + str(self.length) + "," + "\"merged\":" + "\"" + str(self.merged) + "\"" + "}"
        # return "(" + str(self.start) + "," + str(self.end) + "): " + str(self.value)


class parse_sheet:
    def __init__(self, path, name):
        wb = load_workbook(path)
        self.sheet = wb[name]
        self.parsedSheet = list()
        self.maxLen = list()
        self.parse()

    def cal_max_len(self):
        for column in self.sheet.columns:
            column = list(column)
            cLength = list()
            for c in column:
                cLength.append(len(str(c.value)))
            maxL = max(cLength)
            self.maxLen.append(maxL)

    def parse(self):
        self.cal_max_len()
        for row in self.sheet.rows:
            row = list(row)  # 将tuple转为list，便于操作
            r = list()  # 记录一行所有的cell，构成一个list
            for c in row:
                if isinstance(c, cell.Cell):     # 当前不是被合并的单元格，被合并的类名为MergedCell
                    pc = parse_cell(c.column - 1, c.value, c.data_type, self.maxLen[c.column-1])
                    r.append(pc)    # 将当前单元格加入行
                else:   # 当前是被合并的单元格
                    if c.column < 3:    # 位于当前行开始部分，作为表头的MergedCell需要特殊考虑(设其坐标<3)
                        pc = parse_cell(c.column - 1, c.value, c.data_type, self.maxLen[c.column-1])
                        r.append(pc)
                    else:
                        r[-1].end += 1     # cell的结束坐标+1
                        r[-1].length.append(self.maxLen[c.column-1])     # cell的长度加上当前单元格
                        r[-1].merged = True
            self.parsedSheet.append(r)   # 将当前行加入表格

    def result(self):
        return self.parsedSheet


if __name__ == "__main__":
    s = parse_sheet("../public/test1.xlsx", "Sheet1")
    tabular_dataset = s.result()
    for i in tabular_dataset:
        print(i)