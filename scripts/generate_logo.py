from PIL import Image, ImageDraw, ImageFilter

def create_polished_logo(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # --- 1. SQUIRCLE EMBLEM BACKGROUND ---
    pad = int(size * 0.04)
    radius = int(size * 0.22)
    box = [pad, pad, size - pad, size - pad]

    # Create smooth royal blue gradient (#1E3A8A -> #2563EB -> #1D4ED8)
    grad = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grad)
    for y in range(pad, size - pad):
        t = (y - pad) / (size - 2 * pad)
        r = int(24 * (1 - t) + 37 * t)
        g = int(58 * (1 - t) + 99 * t)
        b = int(180 * (1 - t) + 235 * t)
        g_draw.line([(pad, y), (size - pad, y)], fill=(r, g, b, 255))

    mask = Image.new('L', (size, size), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle(box, radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)

    # Crisp subtle highlight border
    b_draw = ImageDraw.Draw(img)
    b_draw.rounded_rectangle(box, radius=radius, outline=(255, 255, 255, 90), width=int(size * 0.015))

    cx = size // 2

    # --- 2. BALLOT CARD (Crisp Pure White with Indian Tricolor Header) ---
    card_w = int(size * 0.48)
    card_h = int(size * 0.45)
    card_x0 = cx - card_w // 2
    card_y0 = int(size * 0.15)
    card_r = int(size * 0.045)

    card_box = [card_x0, card_y0, card_x0 + card_w, card_y0 + card_h]

    # Draw card shadow
    card_sh = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    csh_draw = ImageDraw.Draw(card_sh)
    csh_draw.rounded_rectangle([card_x0 - 2, card_y0 + 2, card_x0 + card_w + 2, card_y0 + card_h + 4], radius=card_r, fill=(0, 0, 0, 70))
    img.alpha_composite(card_sh.filter(ImageFilter.GaussianBlur(6)))

    # Solid white card
    b_draw.rounded_rectangle(card_box, radius=card_r, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=int(size * 0.008))

    # Tricolor Header: Saffron Band (#F97316)
    saff_h = int(size * 0.055)
    # Saffron rectangle clipped to card top
    saff_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sl_draw = ImageDraw.Draw(saff_layer)
    sl_draw.rounded_rectangle(card_box, radius=card_r, fill=0)
    
    # Fill saffron top
    saff_mask = Image.new('L', (size, size), 0)
    sm_draw = ImageDraw.Draw(saff_mask)
    sm_draw.rounded_rectangle(card_box, radius=card_r, fill=255)
    
    saff_block = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sb_draw = ImageDraw.Draw(saff_block)
    sb_draw.rectangle([card_x0, card_y0, card_x0 + card_w, card_y0 + saff_h], fill=(249, 115, 22, 255))
    
    img.paste(saff_block, (0, 0), saff_mask)

    # Emerald green accent stripe below saffron (#10B981)
    b_draw.line([(card_x0, card_y0 + saff_h), (card_x0 + card_w, card_y0 + saff_h)], fill=(16, 185, 129, 255), width=int(size * 0.010))

    # Emerald Verified Stamp on Card
    chk_cy = card_y0 + int(card_h * 0.44)
    chk_r = int(size * 0.09)
    b_draw.ellipse(
        [cx - chk_r, chk_cy - chk_r, cx + chk_r, chk_cy + chk_r],
        fill=(236, 253, 245, 255),
        outline=(16, 185, 129, 255),
        width=int(size * 0.016)
    )

    # Bold Emerald Checkmark
    p1 = (cx - int(size * 0.044), chk_cy)
    p2 = (cx - int(size * 0.012), chk_cy + int(size * 0.038))
    p3 = (cx + int(size * 0.048), chk_cy - int(size * 0.038))
    b_draw.line([p1, p2, p3], fill=(5, 150, 105, 255), width=int(size * 0.026), joint="curve")

    # --- 3. BALLOT BOX FRONT (Navy Slate Glass) ---
    box_w = int(size * 0.68)
    box_h = int(size * 0.44)
    box_x0 = cx - box_w // 2
    box_y0 = int(size * 0.46)
    box_r = int(size * 0.06)

    # Shadow behind box
    sh_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(sh_layer)
    sh_draw.rounded_rectangle([box_x0 - 4, box_y0 - 2, box_x0 + box_w + 4, box_y0 + box_h + 8], radius=box_r, fill=(0, 0, 0, 120))
    img.alpha_composite(sh_layer.filter(ImageFilter.GaussianBlur(10)))

    # Box Body
    box_rect = [box_x0, box_y0, box_x0 + box_w, box_y0 + box_h]
    b_draw.rounded_rectangle(
        box_rect,
        radius=box_r,
        fill=(15, 23, 42, 255), # Slate 900
        outline=(255, 255, 255, 140),
        width=int(size * 0.014)
    )

    # Ballot Slot on top of Box
    slot_w = int(box_w * 0.76)
    slot_h = int(size * 0.036)
    slot_x0 = cx - slot_w // 2
    slot_y0 = box_y0 + int(size * 0.044)
    slot_r = slot_h // 2

    b_draw.rounded_rectangle(
        [slot_x0, slot_y0, slot_x0 + slot_w, slot_y0 + slot_h],
        radius=slot_r,
        fill=(2, 6, 23, 255),
        outline=(96, 165, 250, 220),
        width=int(size * 0.009)
    )

    # Front Seal on Ballot Box
    seal_cy = box_y0 + int(box_h * 0.58)
    seal_r = int(size * 0.082)

    # Outer blue circle
    b_draw.ellipse(
        [cx - seal_r, seal_cy - seal_r, cx + seal_r, seal_cy + seal_r],
        fill=(30, 58, 138, 200),
        outline=(96, 165, 250, 255),
        width=int(size * 0.013)
    )

    # White Checkmark inside Front Seal
    sp1 = (cx - int(size * 0.032), seal_cy)
    sp2 = (cx - int(size * 0.008), seal_cy + int(size * 0.026))
    sp3 = (cx + int(size * 0.036), seal_cy - int(size * 0.026))
    b_draw.line([sp1, sp2, sp3], fill=(255, 255, 255, 255), width=int(size * 0.016), joint="curve")

    # Indian Tricolor Dots below Seal
    dots_y = box_y0 + box_h - int(size * 0.048)
    dot_rad = int(size * 0.014)
    dx = int(size * 0.052)

    b_draw.ellipse([cx - dx - dot_rad, dots_y - dot_rad, cx - dx + dot_rad, dots_y + dot_rad], fill=(249, 115, 22, 255))
    b_draw.ellipse([cx - dot_rad, dots_y - dot_rad, cx + dot_rad, dots_y + dot_rad], fill=(255, 255, 255, 255))
    b_draw.ellipse([cx + dx - dot_rad, dots_y - dot_rad, cx + dx + dot_rad, dots_y + dot_rad], fill=(16, 185, 129, 255))

    return img

if __name__ == '__main__':
    logo_512 = create_polished_logo(512)
    logo_512.save('public/meravote-logo.png', format='PNG')
    logo_512.save('public/logo.png', format='PNG')
    logo_512.save('src/app/icon.png', format='PNG')
    logo_512.save('src/app/apple-icon.png', format='PNG')

    logo_64 = create_polished_logo(64)
    logo_64.save('public/favicon.ico', format='ICO')
    print("New polished Mera Vote civic logo generated successfully!")
