# MedTechHeart

## To build

- `npm install`
- `npm run build`

## To deploy

Once built, it is ready to deploy to a webserver.

1. Copy/move the entire MedTechHeart repository to the webserver content location
2. Open **<path/to/MedTechHeart>/index.html**
3. At the very beginning of the HTML file (with a TODO tag), 
   change the base address to the server address. 
   For example `<base href="http://serverAddress/MedTechHeart/"/>`. 
   Port number can also be specified (default is 80). 
   For example `<base href="http://serverAddress:port/MedTechHeart/"/>`
   
