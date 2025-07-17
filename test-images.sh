#!/bin/bash
echo "Testing image paths..."

# Check if the default profile picture exists
if [ -f "./public/images/default_pfp.jpg" ]; then
  echo "✅ Default profile picture exists"
  echo "File details:"
  ls -la ./public/images/default_pfp.jpg
else
  echo "❌ Default profile picture not found"
  echo "Creating public/images directory if it doesn't exist"
  mkdir -p ./public/images
  
  echo "Current directory contents:"
  ls -la
  
  echo "public directory contents:"
  ls -la ./public
  
  echo "public/images directory contents:"
  ls -la ./public/images
fi

# Try to download a default profile picture if it doesn't exist
if [ ! -f "./public/images/default_pfp.jpg" ]; then
  echo "Downloading a default profile picture..."
  curl -o ./public/images/default_pfp.jpg https://raw.githubusercontent.com/github/opensource.guide/main/assets/images/illos/contribute.svg
  
  if [ $? -eq 0 ]; then
    echo "✅ Downloaded default profile picture successfully"
  else
    echo "❌ Failed to download default profile picture"
    echo "Creating an empty file instead"
    echo "This is a placeholder" > ./public/images/default_pfp.jpg
  fi
fi

echo "Testing complete"
