# Docuflash-Frontend

Docuflash-Frontend is a modern, high-performance web application designed for instant file sharing. It allows users to upload documents (PDF, DOCX, XLSX, ZIP, TXT) and generate shareable links in seconds without requiring registration.

## 🚀 Key Features

- **Instant Upload:** Powered by UploadThing for reliable, fast file handling.
- **Access Control:** Support for both public and password-protected sharing.
- **Auto-Expiration:** Integrated expiration logic to ensure files are only available for a set duration.
- **Modern UI:** A polished, responsive experience built with HeroUI and Tailwind CSS v4.
- **Privacy First:** No account needed for files under 5 MB.
- **Recent Uploads:** Track and manage your recent file shares through local session storage.

## 🛠️ Technology Decisions & Rationales

### Core Framework
- **[Next.js 16.2.4](https://nextjs.org/) (App Router):** Chosen for its advanced routing capabilities, Server Components (RSC) for better performance, and seamless integration with modern web standards.
- **[React 19.2.4](https://react.dev/):** Utilizes the latest React features, ensuring the application is future-proof and benefits from the latest performance optimizations.

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/):** Uses the cutting-edge v4 engine for faster builds and a more streamlined development experience using modern CSS features.
- **[HeroUI](https://heroui.com/) (formerly NextUI):** Provides a comprehensive suite of accessible, customizable, and high-quality UI components that align with modern design trends.
- **[React Aria Components](https://react-spectrum.adobe.com/react-aria/react-aria-components.html):** Ensures high accessibility standards and robust interaction patterns for custom components like the file uploader.

### Data & State Management
- **[UploadThing](https://uploadthing.com/):** A full-stack file upload solution that handles the complexities of storage and provides a seamless developer experience for React applications.
- **[Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/):** Industry-standard libraries for schema-based validation and efficient form state management.
- **TypeScript 5.x:** Provides strict typing across the codebase to minimize runtime errors and improve developer productivity.

## 📁 Project Structure

```text
├── app/            # Next.js App Router, constants, and core logic
├── components/     # UI Components
│   ├── landing/    # Landing page sections (Navbar, Footer, UploadSection)
│   ├── file/       # File-specific components (FileUpload, FileActions)
│   └── shared/     # Reusable UI components
├── lib/api/        # API client and service definitions
├── types/          # Global TypeScript definitions
├── utils/          # Shared utility functions
└── public/         # Static assets
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file based on `.env.example` and add your UploadThing keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Development Workflow

- **Validation:** Always run `npm run lint` and `npm run build` to ensure project integrity before committing.
- **Typing:** Strict typing is enforced. Avoid using `any` and leverage the schemas in `app/zod/` and types in `types/`.

---
Built with ❤️ for instant sharing.
