from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

# Paths
bg_path = '/Users/kd5000/.gemini/antigravity/brain/bb085725-1655-4cab-8810-3591b497f4f4/aurum_promo_background_1774909986823.png'
qr_link = 'https://www.theaifinancebreakdown.com/affiliate-portal.html'
output_path = '/Users/kd5000/Documents/aurum-funnel/aurum_promo_final.png'

# 1. Generate QR Code with better aesthetics (less border)
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=1, # Smaller border for the generated QR as we have a frame
)
qr.add_data(qr_link)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGBA')

# 2. Open Background
bg = Image.open(bg_path).convert('RGBA')
draw = ImageDraw.Draw(bg)

# 3. Refined Position
# The gold frame center is roughly at (197, 802)
# Frame top-left: ~75, 680. Bottom-right: ~320, 925
target_w = 215
target_h = 215
qr_resized = qr_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Paste centered in frame
paste_x = 75 + (245 - target_w) // 2
paste_y = 680 + (245 - target_h) // 2
bg.paste(qr_resized, (paste_x, paste_y), qr_resized)

# 4. CTA Text
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
except:
    font = ImageFont.load_default()

text = "Scan to get started!"
text_bbox = draw.textbbox((0, 0), text, font=font)
text_w = text_bbox[2] - text_bbox[0]
text_x = 75 + (245 // 2) - (text_w // 2)
text_y = 935 # A bit lower to clear the frame

# Draw text with subtle shadow for readability
draw.text((text_x+2, text_y+2), text, fill="black", font=font)
draw.text((text_x, text_y), text, fill="white", font=font)

# 5. Save
bg.convert('RGB').save(output_path)
print(f"Refined final image saved to {output_path}")
