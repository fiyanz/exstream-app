echo "deploy to server"
echo "Building frontend..."
npm run build
echo "Deploying to server..."
scp -r dist/* extrime@145.79.8.52:/var/www/fe_extrime/

echo "Frontend deployed successfully." 