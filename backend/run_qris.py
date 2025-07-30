#!/usr/bin/env python3
"""
SEKAR NET - FastAPI Backend with QRIS Support
Run this script to start the FastAPI server
"""

import uvicorn
import os
from pathlib import Path

def main():
    # Create necessary directories
    directories = [
        "public/assets",
        "uploads/payment-proofs",
        "uploads/support-attachments",
        "uploads/installation-photos"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory}")
    
    # Check if QRIS image exists
    qris_image_path = Path("public/assets/qris-sekar-net.png")
    if not qris_image_path.exists():
        print("⚠️  Warning: QRIS image not found!")
        print("   Please place your QRIS image at: public/assets/qris-sekar-net.png")
        print("   See SETUP_QRIS_PYTHON.md for instructions")
    else:
        print(f"✓ QRIS image found: {qris_image_path}")
    
    # Start the server
    print("\n🚀 Starting SEKAR NET FastAPI Backend...")
    print("   QRIS Payment System Ready!")
    print("   API Documentation: http://localhost:8000/docs")
    print("   QRIS Image URL: http://localhost:8000/assets/qris-sekar-net.png")
    print("\n" + "="*50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 