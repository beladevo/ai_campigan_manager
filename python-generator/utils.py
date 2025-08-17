import os
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pillow_heif

logger = logging.getLogger(__name__)


def create_marketing_prompt(user_prompt: str) -> str:
    return f"""
You are a world-class marketing strategist and copywriter with expertise in persuasive content creation. Your task is to transform the given prompt into compelling marketing content that drives engagement and conversions.

**ORIGINAL REQUEST:** {user_prompt}

**YOUR MISSION:** Create comprehensive marketing content that includes:

**1. ATTENTION-GRABBING HEADLINE**
- Craft a powerful, benefit-driven headline that immediately captures attention
- Use action words, emotional triggers, and clear value propositions
- Make it memorable and shareable

**2. COMPELLING DESCRIPTION**
- Write vivid, sensory-rich descriptions that paint a clear mental picture
- Use storytelling elements to create emotional connection
- Include specific details that make the content tangible and relatable
- Address pain points and position the solution naturally

**3. KEY BENEFITS & FEATURES**
- Highlight 3-5 primary benefits that matter most to the target audience
- Transform features into customer-focused benefits
- Use social proof indicators where relevant
- Create urgency or scarcity when appropriate

**4. STRATEGIC CALL-TO-ACTION**
- Provide multiple CTA options for different customer journey stages
- Use action-oriented, specific language
- Create clear next steps for engagement

Begin creating exceptional marketing content now:
"""


def create_image_prompt(user_prompt: str) -> str:
    return f"""
Create a stunning, professional-grade marketing image based on this concept: {user_prompt}

**VISUAL CONCEPT REQUIREMENTS:**
🎯 **Style & Aesthetics:**
- Premium commercial photography or high-end digital art style
- Modern, clean, and sophisticated aesthetic
- Award-winning composition with rule of thirds
- Professional color grading and balanced exposure

🎨 **Color & Lighting:**
- Vibrant yet sophisticated color palette
- Dramatic, cinematic lighting with perfect shadows and highlights
- Rich contrast and visual depth
- Colors that evoke emotion and brand trust

🌟 **Marketing Impact:**
- Emotionally compelling and aspirational
- Instantly recognizable and memorable
- Social media and advertising optimized
- Cross-platform compatible design

Generate an exceptional, commercially-viable marketing image now:
"""


def create_enhanced_placeholder(campaign_id: str, output_dir: Path, prompt: str = "") -> str:
    try:
        img = Image.new('RGB', (1024, 1024), color='#f0f8ff')
        draw = ImageDraw.Draw(img)
        
        for y in range(img.height):
            gradient_color = int(240 + (y / img.height) * 15)
            draw.line([(0, y), (img.width, y)], fill=(gradient_color, gradient_color + 8, 255))
        
        try:
            font = ImageFont.load_default()
        except:
            font = None
        
        text_lines = [
            "SOLARA AI",
            "Content Generation",
            "",
            f"Campaign: {campaign_id[:12]}",
            f"Prompt: {prompt[:40]}{'...' if len(prompt) > 40 else ''}",
            "",
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        ]
        
        total_height = len([line for line in text_lines if line]) * 40
        start_y = (img.height - total_height) // 2
        
        for i, line in enumerate(text_lines):
            if line:
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
                x = (img.width - text_width) // 2
                y = start_y + (i * 40)
                
                draw.text((x + 2, y + 2), line, fill='#cccccc', font=font)
                draw.text((x, y), line, fill='#333333', font=font)
        
        filename = f"enhanced_placeholder_{campaign_id}_{uuid.uuid4().hex[:8]}.png"
        image_path = output_dir / filename
        img.save(image_path, "PNG", optimize=True)
        
        logger.info(f"[{campaign_id}] Enhanced placeholder created: {image_path}")
        # Return only the filename, not the full path, for static file serving
        return filename
        
    except Exception as e:
        logger.error(f"[{campaign_id}] Failed to create placeholder: {e}")
        return ""


def optimize_image(image: Image.Image, max_size: tuple = (1200, 1200), quality: int = 85) -> Image.Image:
    """Optimize image for web use with compression and resizing."""
    # Convert to RGB if necessary
    if image.mode in ('RGBA', 'LA', 'P'):
        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        rgb_image.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
        image = rgb_image
    
    # Resize if too large
    if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Apply slight sharpening for web display
    image = image.filter(ImageFilter.UnsharpMask(radius=0.5, percent=150, threshold=3))
    
    return image


def process_image_response(response, campaign_id: str, output_dir: Path, prompt: str) -> Optional[str]:
    try:
        if not response.candidates or not response.candidates[0].content.parts:
            return None
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                logger.info(f"[{campaign_id}] Generated image description: {part.text[:100]}...")
            
            elif part.inline_data is not None:
                logger.info(f"[{campaign_id}] Processing generated image data...")
                
                image_data = part.inline_data.data
                image = Image.open(BytesIO(image_data))
                
                # Optimize the image
                optimized_image = optimize_image(image, max_size=(1200, 1200), quality=85)
                
                filename = f"campaign_{campaign_id}_{uuid.uuid4().hex[:8]}.png"
                image_path = output_dir / filename
                
                # Save with optimization
                optimized_image.save(
                    image_path, 
                    "PNG", 
                    optimize=True,
                    compress_level=6  # PNG compression level (0-9)
                )
                
                # Create a WebP version for better compression
                webp_filename = f"campaign_{campaign_id}_{uuid.uuid4().hex[:8]}.webp"
                webp_path = output_dir / webp_filename
                optimized_image.save(webp_path, "WEBP", quality=85, optimize=True)
                
                original_size = len(image_data)
                png_size = image_path.stat().st_size
                webp_size = webp_path.stat().st_size
                
                logger.info(f"[{campaign_id}] Image optimization complete:")
                logger.info(f"  Original: {original_size:,} bytes")
                logger.info(f"  PNG: {png_size:,} bytes ({optimized_image.size[0]}x{optimized_image.size[1]})")
                logger.info(f"  WebP: {webp_size:,} bytes (saved {original_size - webp_size:,} bytes)")
                
                # Return the WebP filename for better performance
                return webp_filename
        
        return None
        
    except Exception as e:
        logger.error(f"[{campaign_id}] Failed to process image response: {e}")
        return None
