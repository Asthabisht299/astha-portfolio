# ✨ Astha Bisht — Personal Portfolio

A modern, responsive personal portfolio website built to showcase my skills, projects, experience, education, and achievements as a developer.

🌐 **Live Website:** https://astha-portfolio-rho.vercel.app/

---

## 📌 About the Project

This portfolio is designed to present my technical skills, development journey, and projects in a clean and interactive way.

It features a minimal and modern design, smooth animations, responsive layouts, and a database-driven content management system that makes updating portfolio information easier.

## 🚀 Features

- **Modern UI:** Clean, minimal, and visually appealing design.
- **Responsive Design:** Optimized for desktops, tablets, and mobile devices.
- **About Me:** Introduction and professional background.
- **Skills:** Organized technical skills and technologies.
- **Projects Showcase:** Display of projects with descriptions, images, GitHub links, and live demos.
- **Experience:** Professional experience and internship details.
- **Education:** Academic background.
- **Certifications:** Showcase of completed certifications.
- **Resume Download:** Visitors can download my latest resume.
- **Database Integration:** Dynamic portfolio content stored in MySQL.
- **Admin Dashboard:** Manage portfolio content.
- **Animations:** Smooth transitions and interactive elements.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | CSS |
| Animations | Motion |
| Icons | Lucide React |
| Backend | Next.js API Routes |
| Database | MySQL |
| Image Storage | Cloudinary |
| Deployment | Vercel |
| Database Hosting | Railway |
| Version Control | Git, GitHub |

## 📂 Project Structure

```text
astha-portfolio/
│
├── public/
│   ├── projects/
│   ├── Resume.pdf
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── admin/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

*Note: The structure above is a simplified overview. Your actual folders may contain additional files.*

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Asthabisht299/astha-portfolio.git
```

### 2. Navigate to the project directory

```bash
cd astha-portfolio
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the root directory and configure the required environment variables.

Example:

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

AUTH_SECRET=your_auth_secret
```

Add any other environment variables required by your Cloudinary or application configuration.

**Important:** Never upload your `.env.local` file or database credentials to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

## 🌍 Deployment

The portfolio is deployed using Vercel.

- **Frontend Hosting:** Vercel
- **Database Hosting:** Railway
- **Source Code:** GitHub

## 👩‍💻 About Me

I'm **Astha Bisht**, a Computer Science and Engineering student interested in web development and software engineering.

I enjoy building practical applications, exploring new technologies, and continuously improving my development skills.

### Connect With Me

- **Portfolio:** https://astha-portfolio-rho.vercel.app/
- **GitHub:** https://github.com/Asthabisht299

---

⭐ If you find this project interesting, feel free to explore the repository!
