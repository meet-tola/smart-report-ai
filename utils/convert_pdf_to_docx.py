from pdf2docx import Converter
import sys, os

def convert_pdf_to_docx(pdf_path: str, output_path: str):
    pdf_path = os.path.abspath(pdf_path)
    output_path = os.path.abspath(output_path)
    print(f"[INFO] Start converting\n  Input: {pdf_path}\n  Output: {output_path}")
    cv = Converter(pdf_path)
    cv.convert(output_path)
    cv.close()
    print(f"[INFO] Conversion complete.\n  File saved at: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_pdf_to_docx.py <input.pdf> <output.docx>")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]

    convert_pdf_to_docx(input_pdf, output_docx)

    if os.path.exists(output_docx):
        print(f"Converted '{input_pdf}' to '{output_docx}' successfully.")
        sys.exit(0)
    else:
        print(f"Error: '{output_docx}' not created.")
        sys.exit(2)
