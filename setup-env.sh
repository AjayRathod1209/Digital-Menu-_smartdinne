#!/bin/bash

# SmartDine Environment Setup Script
# This script helps set up environment variables for development and production

echo "🍽️  SmartDine Environment Setup"
echo "================================"

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to generate secure random string (longer)
generate_long_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

echo ""
echo "📋 Choose environment type:"
echo "1) Development"
echo "2) Production"
read -p "Enter choice (1 or 2): " env_choice

if [ "$env_choice" = "1" ]; then
    echo ""
    echo "🔧 Setting up Development Environment..."
    
    # Copy development template
    cp .env.dev .env
    
    # Generate new secrets for development
    JWT_SECRET=$(generate_secret)
    NEXTAUTH_SECRET=$(generate_secret)
    
    # Update .env file with new secrets
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env
    
    # Remove backup file
    rm .env.bak
    
    echo "✅ Development environment configured!"
    echo "📁 .env file created with secure secrets"
    
elif [ "$env_choice" = "2" ]; then
    echo ""
    echo "🚀 Setting up Production Environment..."
    
    # Copy production template
    cp .env.production .env
    
    # Generate strong secrets for production
    JWT_SECRET=$(generate_long_secret)
    NEXTAUTH_SECRET=$(generate_long_secret)
    
    # Update .env file with new secrets
    sed -i.bak "s/CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_AT_LEAST_32_CHARACTERS_LONG/$JWT_SECRET/" .env
    sed -i.bak "s/CHANGE_THIS_TO_ANOTHER_SECURE_RANDOM_STRING_AT_LEAST_32_CHARACTERS_LONG/$NEXTAUTH_SECRET/" .env
    
    # Remove backup file
    rm .env.bak
    
    echo "✅ Production environment configured!"
    echo "📁 .env file created with strong secrets"
    echo ""
    echo "⚠️  IMPORTANT: Please update the following values in .env:"
    echo "   - NEXT_PUBLIC_APP_URL (your domain)"
    echo "   - ADMIN_EMAIL and ADMIN_PASSWORD"
    echo "   - RESTAURANT_* information"
    echo "   - Payment gateway credentials"
    echo "   - Email configuration"
    echo "   - Any other service-specific credentials"
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi

echo ""
echo "🔐 Generated Secrets:"
echo "   JWT_SECRET: ${JWT_SECRET:0:8}...${JWT_SECRET: -8}"
echo "   NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:8}...${NEXTAUTH_SECRET: -8}"

echo ""
echo "📝 Next Steps:"
echo "1. Review and update .env file with your specific configuration"
echo "2. Test the application: npm run dev"
echo "3. For production, ensure all security settings are configured"

echo ""
echo "🎉 Setup complete!"