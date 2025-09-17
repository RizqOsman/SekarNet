import os
from PIL import Image
from io import BytesIO
import asyncio
from typing import Optional, Tuple
from fastapi import UploadFile
from .config import settings

class ImageOptimizer:
    def __init__(self):
        self.max_width = 1920
        self.max_height = 1080
        self.quality = 85
        self.formats = ['JPEG', 'PNG', 'WEBP']
        self.upload_path = settings.UPLOAD_DIR

    async def optimize_image(
        self,
        file: UploadFile,
        max_size: Optional[Tuple[int, int]] = None,
        quality: Optional[int] = None,
        format: Optional[str] = None
    ) -> str:
        """
        Optimize and save uploaded image
        Returns the path to the optimized image
        """
        content = await file.read()
        image = Image.open(BytesIO(content))

        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background

        # Resize if needed
        max_w = max_size[0] if max_size else self.max_width
        max_h = max_size[1] if max_size else self.max_height
        
        if image.width > max_w or image.height > max_h:
            image.thumbnail((max_w, max_h), Image.LANCZOS)

        # Prepare output format
        output_format = format.upper() if format else image.format
        if output_format not in self.formats:
            output_format = 'JPEG'

        # Prepare quality
        save_quality = quality if quality is not None else self.quality

        # Prepare output filename
        filename = file.filename
        name, ext = os.path.splitext(filename)
        webp_filename = f"{name}.webp"
        original_filename = f"{name}_original{ext}"

        # Save both WebP and original format
        output = BytesIO()
        image.save(output, format='WEBP', quality=save_quality)
        webp_path = os.path.join(self.upload_path, webp_filename)
        with open(webp_path, 'wb') as f:
            f.write(output.getvalue())

        output = BytesIO()
        image.save(output, format=output_format, quality=save_quality)
        original_path = os.path.join(self.upload_path, original_filename)
        with open(original_path, 'wb') as f:
            f.write(output.getvalue())

        return {
            'webp': webp_path,
            'original': original_path
        }

    async def bulk_optimize(self, files: list[UploadFile]) -> list[dict]:
        """
        Optimize multiple images in parallel
        """
        tasks = [self.optimize_image(file) for file in files]
        return await asyncio.gather(*tasks)

# Initialize optimizer
image_optimizer = ImageOptimizer()
