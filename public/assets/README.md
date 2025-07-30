# Assets Directory

This directory contains static assets for the SEKAR NET application.

## QRIS Image Setup

### 1. Place Your QRIS Image
Put your QRIS image file in this directory with the name: `qris-sekar-net.png`

### 2. Image Requirements
- **Format**: PNG (recommended) or JPG
- **Size**: 300x300 pixels or larger (square format)
- **File size**: Under 1MB
- **Quality**: High resolution for clear scanning

### 3. File Structure
```
public/
└── assets/
    ├── qris-sekar-net.png     # Your QRIS image (required)
    ├── qris-placeholder.png   # Fallback image (optional)
    └── README.md              # This file
```

### 4. QRIS Image Content
Your QRIS image should contain:
- **Merchant Name**: SEKAR NET
- **Merchant ID**: Your QRIS merchant ID
- **Static QRIS Code**: Fixed amount or dynamic QRIS

### 5. Testing
After placing your QRIS image:
1. Start the application
2. Go to billing page
3. Click "Pay with QRIS"
4. Verify the image loads correctly
5. Test the download functionality

### 6. Fallback Image
If you want to provide a fallback image, create `qris-placeholder.png` that will be shown if the main QRIS image fails to load.

## Other Assets

You can also place other static assets here:
- Company logos
- Icons
- Images for packages
- Documentation files

## Security Note

⚠️ **Important**: Never commit sensitive QRIS images or payment credentials to version control. Consider using environment variables or secure storage for production deployments. 