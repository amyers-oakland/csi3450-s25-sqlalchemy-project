# csi3450-s25-sqlalchemy-project

### This repo contains our PHP-based databases project for CSI3450 for the summer 2025 term
- To serve on XAMPP, place the csi3450 directory in htdocs and make your Document Root in `httpd.conf` point to `.../XAMPP/xamppfiles/htdocs/csi3450-s25-sqlalchemy-project/maru/public`
- It will then serve on localhost automatically
- Serving the front end may involve several steps
-   First, navigate to maru-frontend
-   Then run the command `rm -rf node_modules package-lock.json`
-   Then, `npm cache clean --force`
-   Finally, `npm install`
-   You should now be able to run npm run dev and follow the link `http://localhost:5173/` to test our app client
