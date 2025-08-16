import asyncio
import logging
from typing import Optional
import aiohttp
from config import config

logger = logging.getLogger(__name__)

class ProgressUpdater:
    def __init__(self):
        self.nestjs_url = config.nestjs_url
    
    async def update_progress(
        self, 
        campaign_id: str, 
        status: str, 
        current_step: str, 
        progress_percentage: int
    ) -> bool:
        """
        Send progress update to NestJS service
        """
        try:
            url = f"{self.nestjs_url}/internal/campaigns/{campaign_id}/progress"
            data = {
                "status": status,
                "currentStep": current_step,
                "progressPercentage": progress_percentage
            }
            
            logger.info(f"[{campaign_id}] Updating progress: {current_step} ({progress_percentage}%)")
            
            async with aiohttp.ClientSession() as session:
                async with session.put(url, json=data, timeout=10) as response:
                    if response.status == 200:
                        logger.info(f"[{campaign_id}] Progress updated successfully")
                        return True
                    else:
                        logger.warning(f"[{campaign_id}] Progress update failed with status {response.status}")
                        return False
                        
        except asyncio.TimeoutError:
            logger.warning(f"[{campaign_id}] Progress update timed out")
            return False
        except Exception as e:
            logger.warning(f"[{campaign_id}] Failed to update progress: {e}")
            return False

# Global instance
progress_updater = ProgressUpdater()