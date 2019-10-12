# BIM-Web-Forge-extensions-nodejs

## Prerequisites

1. Autodesk Forge: Client ID and Secret. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/forge/callback/oauth** as the Callback URL, although it is not used on a 2-legged flow. Finally, take note of the **Client ID** and **Client Secret**.  
2. Node.js: v10.*  
3. npm: it is packages manager tools for Node.js development, that help you go to market faster and build powerful applications.[https://www.npmjs.com/](https://www.npmjs.com/)  
3. VS Code: VS Code is strongly recommended because it is very powerful in terms of debugging and run the repository. You will love it.  

## Run locally

1. Install [Node.js](https://nodejs.org).  

2. Clone this project or download it. It's recommended to install [GitHub Desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):  

    git clone https://github.com/cunyizju/BIM-Web-Forge-extensions-node.js  

3. Install the required packages, navigate to the folder where this repository was cloned to, then run 'npm install' in terminal (open the project as following: VS Code--> file-->open folder; Terminal-->new terminal).  
4. Set the enviroment variables with your client ID & Secret in the lunch.json file(.vs folder);  
5. Press F5.  
6. Open the browser: [http://localhost:3000](http://localhost:3000).  

## Presentation

<p align="center">
	<img src="/img/basic-web.png"   width="500" height="250">
	<p align="center">
		<em>basic-web</em>
	</p>
</p>
<p align="center">
	<img src="/img/2d-drawings.png"  width="500" height="250">
	<p align="center">
		<em>2d-drawings</em>
	</p>
</p>
<p align="center">
	<img src="/img/operations.png"   width="200" height="100">
	<p align="center">
		<em>operations</em>
	</p>
</p>

## Packages used

The [Autodesk Forge](https://www.npmjs.com/package/forge-apis) packages are included by default. Some other non-Autodesk packages are used, including [express](https://www.npmjs.com/package/express) and [multer](https://www.npmjs.com/package/multer) for upload.  

### tips and tricks

Forge-apis packages are deserved for careful reading, as they include all the functions, interfaces and attributes that you may need for further development. For instance, in this repository, Bucket API and Object API are used in order to upload, transform and delete buckets or objects.  

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.
