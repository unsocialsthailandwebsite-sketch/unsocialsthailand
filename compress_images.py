import os
import glob
from PIL import Image

def compress_images():
    print("Starting image compression to WebP...")
    patterns = [
        'assets/*.png',
        'assets/clients/*.png',
        'assets/ava_alex/*.png',
        'assets/cases/**/*.png'
    ]
    
    total_saved = 0
    
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            orig_size = os.path.getsize(filepath)
            if orig_size < 200 * 1024:  # Skip files smaller than 200KB
                continue
                
            webp_path = os.path.splitext(filepath)[0] + '.webp'
            try:
                with Image.open(filepath) as img:
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        img.save(webp_path, 'WEBP', quality=82, method=6)
                    else:
                        img.convert('RGB').save(webp_path, 'WEBP', quality=82, method=6)
                        
                new_size = os.path.getsize(webp_path)
                saved = orig_size - new_size
                total_saved += saved
                print(f"Compressed {filepath} ({orig_size/(1024*1024):.2f} MB) -> {webp_path} ({new_size/(1024*1024):.2f} MB) [Saved {saved/(1024*1024):.2f} MB]")
            except Exception as e:
                print(f"Failed to compress {filepath}: {e}")

    print(f"\nTotal size saved across images: {total_saved/(1024*1024):.2f} MB!")

if __name__ == '__main__':
    compress_images()
