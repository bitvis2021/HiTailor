from openpyxl import load_workbook, cell


class ParsedCell:
    def __init__(self, start, value, dtype):
        self.start = start  # 起始坐标
        self.end = start  # 终止坐标，若非MergedCell则end = start
        self.value = value
        self.dtype = dtype  # 数据类型

    def __repr__(self):     # 用于测试输出
        return "(" + str(self.start) + ", " + str(self.end) + ") : " + str(self.value)


class ParsedSheet:
    def __init__(self, path, name):
        wb = load_workbook(path)
        self.sheet = wb[name]
        self.parsedSheet = list()
        self.parse()

    def parse(self):
        for row in self.sheet.rows:
            row = list(row)  # 将tuple转为list，便于操作
            r = list()  # 记录一行所有的cell，构成一个list
            for c in row:
                if isinstance(c, cell.Cell):     # 当前不是被合并的单元格，被合并的类名为MergedCell
                    pc = ParsedCell(c.column - 1, c.value, c.data_type)
                    r.append(pc)    # 将当前单元格加入行
                else:   # 当前是被合并的单元格
                    if c.column < 3:    # 位于当前行开始部分，作为表头的MergedCell需要特殊考虑(设其坐标<3)
                        pc = ParsedCell(c.column - 1, c.value, c.data_type)
                        r.append(pc)
                    else:
                        r[-1].end += 1     # cell的结束坐标+1
            self.parsedSheet.append(r)   # 将当前行加入表格

    def result(self):
        return self.parsedSheet
