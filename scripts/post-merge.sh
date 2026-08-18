#!/bin/bash
set -e

echo "==> Restoring .NET packages..."
cd Backend && dotnet restore --no-cache
cd ..

echo "==> Installing frontend npm packages..."
cd Frontend && npm install
cd ..

echo "Post-merge setup complete."
