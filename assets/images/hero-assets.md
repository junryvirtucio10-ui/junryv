# Hero image assets

- `grethiel-hero.webp` uses the original `joy-grethiel.png` portrait provided for this portfolio. Its original RGB pixels are retained. The background-removal output contributes only the alpha mask, which is applied to the original photo before trimming transparent margins and saving lossless WebP.
- `hero-greeting.png` is the transparent gold greeting extracted from the supplied lettering reference. The image has alternative text in the HTML.

Both background extractions used the built-in imagegen tool.

## Portrait mask prompt

Remove only the gray studio background. Preserve the complete original canvas, portrait aspect ratio, subject position, face, expression, curly hair, beige blazer, white top, and original torso crop. Do not crop, reposition, scale, relight, or alter the woman. Preserve fine hair edges with transparency and no halo. The output is used only as an alpha mask on the untouched original photo.

## Greeting prompt

Extract only the handwritten gold “Hey, I'm” lettering from the supplied crop onto a genuinely transparent background. Preserve the letter shapes, brush strokes, punctuation, slant, proportions, and gold shading. Remove the white background, pale oversized background lettering, and cropped name fragments. Use modest transparent padding, with no extra text or decoration.
