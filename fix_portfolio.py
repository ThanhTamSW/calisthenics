import sys

with open('src/components/PortfolioGrid.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace corrupted Vietnamese characters in the tags and titles
text = text.replace('"T?t c?"', '"Tất cả"')
text = text.replace('"Tất c"', '"Tất cả"')
text = text.replace('"Gi?i d?u"', '"Giải đấu"')
text = text.replace('"Thnh tch"', '"Thành tích"')
text = text.replace('"Thnh tch"', '"Thành tích"')
text = text.replace('Hnh trnh<br />c?a <em>mnh</em>', 'Hành trình<br />của <em>mình</em>')
text = text.replace('Hnh trnh<br />c?a <em>mnh</em>', 'Hành trình<br />của <em>mình</em>')

with open('src/components/PortfolioGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
