# Fonts

PDF export of Bangla text requires a Unicode Bengali font embedded via fontkit
(pdf-lib's StandardFonts are Latin-only).

Place **`NotoSansBengali-Regular.ttf`** in this folder to enable Bangla glyphs in
PDF reports. Download it from Google Fonts (Noto Sans Bengali, OFL license):

    https://fonts.google.com/noto/specimen/Noto+Sans+Bengali

Without this file, PDF export still works but Bangla characters render as blank
boxes (DOCX and TXT exports render Bangla natively and need no font here).
