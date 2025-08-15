import os
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)


def create_marketing_prompt(user_prompt: str) -> str:
    """Create enhanced marketing prompt for text generation using advanced prompt engineering."""
    return f"""
<role>You are an award-winning marketing strategist, copywriter, and consumer psychology expert with 15+ years of experience creating viral campaigns that drive measurable results. You understand the nuances of human psychology, persuasion principles, and data-driven marketing.</role>

<context>
Original Request: {user_prompt}
</context>

<task>
Transform this request into a complete, high-converting marketing campaign that would perform exceptionally across digital platforms (social media, email, web, ads).
</task>

<output_format>
🎯 **MAGNETIC HEADLINE**
[Create a headline that stops scrolling and demands attention. Use power words, numbers, curiosity gaps, or benefit-driven language]

📱 **HOOK DESCRIPTION** 
[Write a compelling opening that creates immediate emotional connection. Use storytelling, sensory details, or relatable scenarios]

🔥 **CORE VALUE PROPOSITIONS**
- [Primary benefit that solves the biggest pain point]
- [Secondary benefit that creates desire]
- [Unique differentiator that beats competition]

⚡ **EMOTIONAL TRIGGERS**
[Incorporate proven psychological triggers: urgency, scarcity, social proof, fear of missing out, transformation promise]

🎨 **VIVID DESCRIPTIONS**
[Paint a picture of the transformed life/outcome. Use specific, measurable details and sensory language]

🏆 **SOCIAL PROOF ELEMENTS**
[Include implied testimonials, statistics, or authority positioning]

🚀 **COMPELLING CALL-TO-ACTION**
[Multiple CTA options for different customer stages: awareness, consideration, decision]
</output_format>

<constraints>
- Use active voice and action-oriented language
- Include specific numbers/metrics when possible
- Apply persuasion principles (reciprocity, commitment, social proof)
- Make it shareable and memorable
- Optimize for modern attention spans (scannable, benefit-focused)
- Ensure authenticity and avoid overly salesy language
</constraints>

<examples_of_excellence>
Great headlines: "How [Target Audience] [Achieved Specific Result] in [Timeframe]"
Strong hooks: "Everyone told me [common belief], but then I discovered [surprising truth]..."
Powerful CTAs: "Join [X number] of [target audience] who are already [achieving result]"
</examples_of_excellence>

Generate exceptional marketing content now:
"""


def create_image_prompt(user_prompt: str) -> str:
    """Create optimized image generation prompt using advanced visual prompt engineering."""
    return f"""
<visual_brief>
Create a premium, award-winning marketing visual for: {user_prompt}
</visual_brief>

<style_direction>
**ARTISTIC EXCELLENCE:**
- Ultra-high-end commercial photography style (think Apple, Tesla, Nike campaigns)
- Perfect composition using golden ratio and rule of thirds
- Studio-quality lighting with professional color grading
- Crisp, tack-sharp focus with strategic depth of field
- Luxurious, aspirational aesthetic that commands attention

**TECHNICAL SPECIFICATIONS:**
- High contrast, rich saturation with balanced highlights/shadows
- Cinematic color palette with complementary accent colors
- Professional retouching and post-processing quality
- Social media optimized (square/vertical friendly)
- Scalable design elements that work across all platforms
</style_direction>

<emotional_impact>
**PSYCHOLOGICAL TRIGGERS:**
- Evoke aspiration, success, and positive transformation
- Create immediate emotional connection and desire
- Use visual metaphors that reinforce the core message
- Include subtle luxury/premium visual cues
- Design for maximum shareability and viral potential

**BRAND PERCEPTION:**
- Convey trustworthiness, innovation, and market leadership
- Appeal to target demographic lifestyle aspirations
- Differentiate from competitors through unique visual approach
- Build instant brand recognition and recall
</emotional_impact>

<composition_elements>
**VISUAL HIERARCHY:**
- Clear focal point that draws the eye immediately
- Supporting elements that guide viewer through the narrative
- Balanced negative space for text overlay compatibility
- Strategic use of leading lines and visual flow
- Optimized for both mobile and desktop viewing

**COLOR PSYCHOLOGY:**
- Use colors that align with the emotional goal of the campaign
- Create sophisticated color harmony (monochromatic, complementary, or triadic)
- Ensure accessibility and cross-cultural appeal
- Apply consistent brand color integration where appropriate
</composition_elements>

<output_requirements>
Generate a visually stunning, commercially-viable image that:
- Stops scrolling on social media feeds instantly
- Communicates the core value proposition at first glance
- Works perfectly for ads, websites, and marketing materials
- Demonstrates clear professional photography/design standards
- Creates strong emotional response and desire to engage
</output_requirements>

Create an exceptional marketing visual now:
"""


def create_enhanced_placeholder(campaign_id: str, output_dir: Path, prompt: str = "") -> str:
    """Create enhanced placeholder image with professional appearance."""
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
        # Return just the filename for NestJS static serving
        return filename
        
    except Exception as e:
        logger.error(f"[{campaign_id}] Failed to create placeholder: {e}")
        return ""


def process_image_response(response, campaign_id: str, output_dir: Path, prompt: str) -> Optional[str]:
    """Process image response and save image."""
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
                
                filename = f"campaign_{campaign_id}_{uuid.uuid4().hex[:8]}.png"
                image_path = output_dir / filename
                
                image.save(image_path, "PNG", optimize=True, quality=95)
                
                logger.info(f"[{campaign_id}] Image saved: {image_path} ({image.size[0]}x{image.size[1]})")
                # Return just the filename for NestJS static serving
                return filename
        
        return None
        
    except Exception as e:
        logger.error(f"[{campaign_id}] Failed to process image response: {e}")
        return None
