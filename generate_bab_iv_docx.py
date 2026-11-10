from pathlib import Path
import re

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"X:\project\Sigap")
SOURCE = ROOT / "Bab_IV_Hasil_Pengujian.md"
OUTPUT = ROOT / "Bab_IV_Hasil_Pengujian.docx"


def set_shading(cell, color):
    properties = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), color)
    properties.append(shading)


def set_cell_margins(cell, top=75, start=100, bottom=75, end=100):
    properties = cell._tc.get_or_add_tcPr()
    margins = properties.first_child_found_in("w:tcMar")
    if margins is None:
        margins = OxmlElement("w:tcMar")
        properties.append(margins)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = margins.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            margins.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_header(row):
    properties = row._tr.get_or_add_trPr()
    properties.append(OxmlElement("w:tblHeader"))


def prevent_row_split(row):
    row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))


def format_run(run, size=11, bold=None, color=None, font="Times New Roman"):
    run.font.name = font
    properties = run._element.get_or_add_rPr()
    properties.rFonts.set(qn("w:ascii"), font)
    properties.rFonts.set(qn("w:hAnsi"), font)
    run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def add_inline(paragraph, text, size=11, color=None):
    tokens = re.split(r"(<br\s*/?>|\*\*.*?\*\*|`[^`]+`)", text)
    for token in tokens:
        if not token:
            continue
        if token.lower().startswith("<br"):
            paragraph.add_run().add_break()
        elif token.startswith("**") and token.endswith("**"):
            run = paragraph.add_run(token[2:-2])
            format_run(run, size=size, bold=True, color=color)
        elif token.startswith("`") and token.endswith("`"):
            run = paragraph.add_run(token[1:-1])
            format_run(run, size=size, color=color, font="Consolas")
        else:
            run = paragraph.add_run(token)
            format_run(run, size=size, color=color)


def add_page_field(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run()
    format_run(run, size=9, color="666666")
    for tag, value in (("w:fldChar", "begin"), ("w:instrText", " PAGE "), ("w:fldChar", "separate"), ("w:t", "1"), ("w:fldChar", "end")):
        element = OxmlElement(tag)
        if tag == "w:fldChar":
            element.set(qn("w:fldCharType"), value)
        else:
            element.text = value
            if tag == "w:instrText":
                element.set(qn("xml:space"), "preserve")
        run._r.append(element)


def configure_section(section, landscape=False):
    section.orientation = WD_ORIENT.LANDSCAPE if landscape else WD_ORIENT.PORTRAIT
    section.page_width = Inches(11.69 if landscape else 8.27)
    section.page_height = Inches(8.27 if landscape else 11.69)
    section.left_margin = Inches(0.65 if landscape else 0.95)
    section.right_margin = Inches(0.65 if landscape else 0.85)
    section.top_margin = Inches(0.65 if landscape else 0.85)
    section.bottom_margin = Inches(0.65 if landscape else 0.8)
    section.footer_distance = Inches(0.35)
    add_page_field(section.footer.paragraphs[0])


def table_widths(values, landscape):
    if len(values[0]) == 4 and landscape:
        return [0.55, 1.9, 6.2, 1.1]
    if len(values[0]) == 2:
        first = values[0][0].lower()
        if first == "komponen":
            return [2.1, 4.25]
        if first == "ringkasan":
            return [4.45, 1.9]
        if first == "id":
            return [1.1, 5.25]
        return [2.3, 4.05]
    return [6.35 / len(values[0])] * len(values[0])


def add_markdown_table(document, source_lines, landscape=False):
    values = [[item.strip() for item in line.strip().strip("|").split("|")] for line in source_lines]
    values = [row for row in values if not all(re.fullmatch(r":?-{3,}:?", item.replace(" ", "")) for item in row)]
    table = document.add_table(rows=len(values), cols=len(values[0]))
    table.style = "Table Grid"
    table.autofit = False
    widths = table_widths(values, landscape)
    for row_index, row_values in enumerate(values):
        row = table.rows[row_index]
        prevent_row_split(row)
        if row_index == 0:
            set_repeat_header(row)
        for column_index, value in enumerate(row_values):
            cell = row.cells[column_index]
            cell.width = Inches(widths[column_index])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.0
            add_inline(paragraph, value, size=8.4 if landscape else 9.0,
                       color="FFFFFF" if row_index == 0 else None)
            if row_index == 0:
                set_shading(cell, "145A43")
                for run in paragraph.runs:
                    run.bold = True
            elif row_index % 2 == 0:
                set_shading(cell, "F1F6F3")
    document.add_paragraph().paragraph_format.space_after = Pt(2)


def add_code_block(document, lines):
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph.paragraph_format.left_indent = Inches(0.12)
    paragraph.paragraph_format.right_indent = Inches(0.12)
    paragraph.paragraph_format.space_before = Pt(3)
    paragraph.paragraph_format.space_after = Pt(8)
    paragraph.paragraph_format.line_spacing = 1.0
    properties = paragraph._p.get_or_add_pPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), "F2F4F3")
    properties.append(shading)
    for index, line in enumerate(lines):
        run = paragraph.add_run(line)
        format_run(run, size=8.5, font="Consolas")
        if index < len(lines) - 1:
            run.add_break()


doc = Document()
configure_section(doc.sections[0])

normal = doc.styles["Normal"]
normal.font.name = "Times New Roman"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
normal.font.size = Pt(11)
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.space_after = Pt(7)

for name, size in (("Heading 1", 14), ("Heading 2", 12), ("Heading 3", 11)):
    style = doc.styles[name]
    style.font.name = "Times New Roman"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string("145A43")
    style.paragraph_format.keep_with_next = True
    style.paragraph_format.space_before = Pt(10)
    style.paragraph_format.space_after = Pt(5)

title_style = doc.styles["Title"]
title_style.font.name = "Times New Roman"
title_style._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
title_style._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
title_style.font.size = Pt(16)
title_style.font.bold = True
title_style.font.color.rgb = RGBColor(0, 0, 0)
title_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_style.paragraph_format.space_after = Pt(18)

lines = SOURCE.read_text(encoding="utf-8").splitlines()
index = 0
while index < len(lines):
    text = lines[index].strip()
    if not text:
        index += 1
        continue

    if text.startswith("### Tabel 4.2"):
        configure_section(doc.add_section(WD_SECTION.NEW_PAGE), landscape=True)
        paragraph = doc.add_paragraph(style="Heading 3")
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.add_run(text[4:])
        index += 1
        while index < len(lines) and not lines[index].strip():
            index += 1
        table_lines = []
        while index < len(lines) and lines[index].strip().startswith("|"):
            table_lines.append(lines[index])
            index += 1
        add_markdown_table(doc, table_lines, landscape=True)
        configure_section(doc.add_section(WD_SECTION.NEW_PAGE), landscape=False)
        continue

    if text.startswith("|"):
        table_lines = []
        while index < len(lines) and lines[index].strip().startswith("|"):
            table_lines.append(lines[index])
            index += 1
        add_markdown_table(doc, table_lines)
        continue

    if text.startswith("```"):
        index += 1
        code_lines = []
        while index < len(lines) and not lines[index].strip().startswith("```"):
            code_lines.append(lines[index])
            index += 1
        add_code_block(doc, code_lines)
        index += 1
        continue

    if text.startswith("# "):
        paragraph = doc.add_paragraph(style="Title")
        paragraph.add_run(text[2:].replace("—", "").strip())
    elif text.startswith("## "):
        paragraph = doc.add_paragraph(style="Heading 1")
        paragraph.add_run(text[3:])
    elif text.startswith("### "):
        paragraph = doc.add_paragraph(style="Heading 2")
        paragraph.add_run(text[4:])
    elif text.startswith("> "):
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.left_indent = Inches(0.2)
        paragraph.paragraph_format.right_indent = Inches(0.2)
        add_inline(paragraph, text[2:])
    else:
        paragraph = doc.add_paragraph()
        add_inline(paragraph, text)
    index += 1

doc.core_properties.title = "Bab IV Hasil dan Pembahasan"
doc.core_properties.subject = "Implementasi, metode, perintah, dan hasil pengujian sistem SIRINE"
doc.save(OUTPUT)
print(OUTPUT)
