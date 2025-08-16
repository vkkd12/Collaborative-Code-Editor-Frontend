 # Collaborative Code Editor Frontend
 
 This is the frontend for a collaborative code editor built with Next.js and Tailwind CSS. It allows multiple users to edit code in real-time, manage projects, and authenticate securely.
 
 ## Features
 
 - Real-time collaborative code editing
 - Project and file management
 - User authentication (login/register)
 - Responsive UI with Tailwind CSS
 - Sidebar navigation and alerts
 
 ## Tech Stack
 
 - [Next.js](https://nextjs.org/)
 - [React](https://react.dev/)
 - [Tailwind CSS](https://tailwindcss.com/)
 - [Socket.io](https://socket.io/) (via backend)
 - [Axios](https://axios-http.com/) for API requests
 
 ## Getting Started
 
 ### Prerequisites
 
 - Node.js >= 18.x
 - npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vkkd12/Collaborative-Code-Editor-Frontend.git
   cd Collaborative-Code-Editor-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Create a `.env.local` file in the project root.
   - Add your API endpoints and keys as needed, for example:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:4000
     NEXT_PUBLIC_WS_URL=ws://localhost:4000
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

 
 ## Folder Structure
 
 ```
 src/
	 app/
		 auth/
			 login/
			 register/
		 editor/
			 [projectId]/[fileId]/
		 projects/
			 [projectId]/
		 globals.css, layout.js, page.jsx
	 components/
		 AlertWindow.jsx, AuthProvider.jsx, CodeEditor.jsx, Header.jsx, RequireAuth.jsx, Sidebar.jsx
	 hooks/
		 useAuth.js, useSocket.js
	 lib/
		 axios.js, socket.js
	 store/
		 useStore.js
	 styles/
		 editor.css, globals.css
 public/
	 *.svg, favicon.ico
 ```
 
 ## Usage
 
 1. Register or log in to access your projects.
 2. Create or open a project and start editing files collaboratively.
 3. Changes are synced in real-time across all connected users.
 
 ## Customization
 
 - Modify styles in `src/styles/`.
 - Add new components in `src/components/`.
 - Update API endpoints in `src/lib/axios.js`.
 
 ## Contributing
 
 Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
 
 ## License
 
 This project is licensed under the MIT License.
