# ArtBookReader 📖🌐

**ArtBookReader** is a web application for reading and organizing books in multiple formats. It supports `.txt`, `.fb2`, `.pdf`, and `.djvu` files, providing a smooth reading experience with personalized bookmarks and automatic reading position tracking.

---

## 🚀 Features

- 📂 Upload and read books in `.txt`, `.fb2`, `.pdf`, `.djvu` from local storage
- 🔖 Add bookmarks with optional notes
- 🧠 Automatically save and restore reading position
- 📑 View book structure and navigate by chapters
- 🔐 User authentication and personal libraries
- 🌓 Dark mode interface

---

## ⚙️ Tech Stack

- **Backend:** Django, Django REST Framework, PostgreSQL
- **Frontend:** React (Vite), TailwindCSS
- **Book parsing:** fb2 & pdf metadata extractors, djvu.js client-side rendering
- **Deployment:** Docker & docker-compose

---

## 🛠️ Installation

> This project is fully containerized using **Docker** and **docker-compose**.

### 1. Clone the repository

```bash
git clone https://github.com/Art21042147/ArtBookReader
cd artbookreader
```

## Project Structure

```
ArtBookReader/
├── backend/        # Django backend with REST API
│   ├── core/       # App logic: models, views, serializers
│   └── static/     # Static files (e.g., logo.svg)
├── frontend/       # React (Vite) frontend
│   └── public/     # Public assets
├── media/          # Uploaded book files
├── templates/      # Django templates (index.html)
```

## Screenshots

### Main Page
Just add a user or sign in with an existing one and enjoy reading.

![Main Page](screenshots/Main_page.png)

---

### Reading Page
Left click on the space will show a sidebar with an intuitive user interface. Here you will see the name specified during registration, you can add a book to the library and use navigation.

![Reading Page](screenshots/Reading_page.png)

---

## Authors

* **Arthur Ilin** - *Core development and implementation* - [Art21042147](https://github.com/Art21042147)
