#!/bin/bash

# 🚀 סקריפט להרצה מקומית של Hasdera
# מריץ את ה-API וה-Frontend יחד

set -e

echo "🚀 מתחיל להריץ את Hasdera מקומית..."
echo ""

# בדיקה ש-dotnet מותקן
if ! command -v dotnet &> /dev/null; then
    if [ -f "$HOME/.dotnet/dotnet" ]; then
        export PATH="$HOME/.dotnet:$PATH"
        echo "✅ נמצא dotnet ב-$HOME/.dotnet"
    else
        echo "❌ dotnet לא נמצא! התקיני .NET SDK 8.0"
        exit 1
    fi
fi

# בדיקה ש-npm מותקן
if ! command -v npm &> /dev/null; then
    echo "❌ npm לא נמצא! התקיני Node.js"
    exit 1
fi

# מצא את התיקייה הראשית
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 תיקייה: $SCRIPT_DIR"
echo ""

# בדיקה שהתלויות מותקנות
if [ ! -d "hasdera-frontend/node_modules" ]; then
    echo "📦 מתקין תלויות של Frontend..."
    cd hasdera-frontend
    npm install
    cd ..
fi

# בדיקה אם הפורטים תפוסים
if lsof -ti :5055 > /dev/null 2>&1; then
    echo "⚠️  פורט 5055 תפוס, סוגר תהליך קודם..."
    lsof -ti :5055 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -ti :5173 > /dev/null 2>&1; then
    echo "⚠️  פורט 5173 תפוס, סוגר תהליך קודם..."
    lsof -ti :5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo ""
echo "🎯 מריץ את ה-API וה-Frontend..."
echo ""
echo "📍 API: http://localhost:5055"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "⏹️  לחצי Ctrl+C כדי לעצור"
echo ""

# הרצה של שניהם יחד
cd hasdera-frontend
npm run start:all

